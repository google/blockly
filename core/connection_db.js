/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2011 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Components for managing connections between blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.ConnectionDB');

goog.require('Blockly.Connection');


/**
 * Database of connections.
 * Connections are stored in order of their vertical component.  This way
 * connections in an area may be looked up quickly using a binary search.
 * @constructor
 */
Blockly.ConnectionDB = function() {
  /**
   * Array of connections sorted by y coordinate.
   * @type {!Array.<!Blockly.Connection>}
   * @private
   */
  this.connections_ = [];
};

/**
 * Add a connection to the database.  Must not already exist in DB.
 * @param {!Blockly.Connection} connection The connection to be added.
 */
Blockly.ConnectionDB.prototype.addConnection = function(connection) {
  if (connection.inDB_) {
    throw Error('Connection already in database.');
  }
  if (connection.getSourceBlock().isInFlyout) {
    // Don't bother maintaining a database of connections in a flyout.
    return;
  }
  var position = this.findPositionForConnection_(connection);
  this.connections_.splice(position, 0, connection);
  connection.inDB_ = true;
};

/**
 * Find the given connection.
 * Starts by doing a binary search to find the approximate location, then
 *     linearly searches nearby for the exact connection.
 * @param {!Blockly.Connection} conn The connection to find.
 * @return {number} The index of the connection, or -1 if the connection was
 *     not found.
 */
Blockly.ConnectionDB.prototype.findConnection = function(conn) {
  if (!this.connections_.length) {
    return -1;
  }

  var bestGuess = this.findPositionForConnection_(conn);
  if (bestGuess >= this.connections_.length) {
    // Not in list
    return -1;
  }

  var yPos = conn.y_;
  // Walk forward and back on the y axis looking for the connection.
  var pointerMin = bestGuess;
  var pointerMax = bestGuess;
  while (pointerMin >= 0 && this.connections_[pointerMin].y_ == yPos) {
    if (this.connections_[pointerMin] == conn) {
      return pointerMin;
    }
    pointerMin--;
  }

  while (pointerMax < this.connections_.length &&
         this.connections_[pointerMax].y_ == yPos) {
    if (this.connections_[pointerMax] == conn) {
      return pointerMax;
    }
    pointerMax++;
  }
  return -1;
};

/**
 * Finds a candidate position for inserting this connection into the list.
 * This will be in the correct y order but makes no guarantees about ordering in
 *     the x axis.
 * @param {!Blockly.Connection} connection The connection to insert.
 * @return {number} The candidate index.
 * @private
 */
Blockly.ConnectionDB.prototype.findPositionForConnection_ = function(
    connection) {
  if (!this.connections_.length) {
    return 0;
  }
  var pointerMin = 0;
  var pointerMax = this.connections_.length;
  while (pointerMin < pointerMax) {
    var pointerMid = Math.floor((pointerMin + pointerMax) / 2);
    if (this.connections_[pointerMid].y_ < connection.y_) {
      pointerMin = pointerMid + 1;
    } else if (this.connections_[pointerMid].y_ > connection.y_) {
      pointerMax = pointerMid;
    } else {
      pointerMin = pointerMid;
      break;
    }
  }
  return pointerMin;
};

/**
 * Remove a connection from the database.  Must already exist in DB.
 * @param {!Blockly.Connection} connection The connection to be removed.
 * @private
 */
Blockly.ConnectionDB.prototype.removeConnection_ = function(connection) {
  if (!connection.inDB_) {
    throw Error('Connection not in database.');
  }
  var removalIndex = this.findConnection(connection);
  if (removalIndex == -1) {
    throw Error('Unable to find connection in connectionDB.');
  }
  connection.inDB_ = false;
  this.connections_.splice(removalIndex, 1);
};

/**
 * Find all nearby connections to the given connection.
 * Type checking does not apply, since this function is used for bumping.
 * @param {!Blockly.Connection} connection The connection whose neighbours
 *     should be returned.
 * @param {number} maxRadius The maximum radius to another connection.
 * @return {!Array.<Blockly.Connection>} List of connections.
 */
Blockly.ConnectionDB.prototype.getNeighbours = function(connection, maxRadius) {
  var db = this.connections_;
  var currentX = connection.x_;
  var currentY = connection.y_;

  // Binary search to find the closest y location.
  var pointerMin = 0;
  var pointerMax = db.length - 2;
  var pointerMid = pointerMax;
  while (pointerMin < pointerMid) {
    if (db[pointerMid].y_ < currentY) {
      pointerMin = pointerMid;
    } else {
      pointerMax = pointerMid;
    }
    pointerMid = Math.floor((pointerMin + pointerMax) / 2);
  }

  var neighbours = [];
  /**
   * Computes if the current connection is within the allowed radius of another
   * connection.
   * This function is a closure and has access to outside variables.
   * @param {number} yIndex The other connection's index in the database.
   * @return {boolean} True if the current connection's vertical distance from
   *     the other connection is less than the allowed radius.
   */
  function checkConnection_(yIndex) {
    var dx = currentX - db[yIndex].x_;
    var dy = currentY - db[yIndex].y_;
    var r = Math.sqrt(dx * dx + dy * dy);
    if (r <= maxRadius) {
      neighbours.push(db[yIndex]);
    }
    return dy < maxRadius;
  }

  // Walk forward and back on the y axis looking for the closest x,y point.
  pointerMin = pointerMid;
  pointerMax = pointerMid;
  if (db.length) {
    while (pointerMin >= 0 && checkConnection_(pointerMin)) {
      pointerMin--;
    }
    do {
      pointerMax++;
    } while (pointerMax < db.length && checkConnection_(pointerMax));
  }

  return neighbours;
};


/**
 * Is the candidate connection close to the reference connection.
 * Extremely fast; only looks at Y distance.
 * @param {number} index Index in database of candidate connection.
 * @param {number} baseY Reference connection's Y value.
 * @param {number} maxRadius The maximum radius to another connection.
 * @return {boolean} True if connection is in range.
 * @private
 */
Blockly.ConnectionDB.prototype.isInYRange_ = function(index, baseY, maxRadius) {
  return (Math.abs(this.connections_[index].y_ - baseY) <= maxRadius);
};

/**
 * Find the closest compatible connection to this connection.
 * @param {!Blockly.Connection} conn The connection searching for a compatible
 *     mate.
 * @param {number} maxRadius The maximum radius to another connection.
 * @param {!goog.math.Coordinate} dxy Offset between this connection's location
 *     in the database and the current location (as a result of dragging).
 * @return {!{connection: ?Blockly.Connection, radius: number}} Contains two
 *     properties:' connection' which is either another connection or null,
 *     and 'radius' which is the distance.
 */
Blockly.ConnectionDB.prototype.searchForClosest = function(conn, maxRadius,
    dxy) {
  // Don't bother.
  if (!this.connections_.length) {
    return {connection: null, radius: maxRadius};
  }

  // Stash the values of x and y from before the drag.
  var baseY = conn.y_;
  var baseX = conn.x_;

  conn.x_ = baseX + dxy.x;
  conn.y_ = baseY + dxy.y;

  // findPositionForConnection finds an index for insertion, which is always
  // after any block with the same y index.  We want to search both forward
  // and back, so search on both sides of the index.
  var closestIndex = this.findPositionForConnection_(conn);

  var bestConnection = null;
  var bestRadius = maxRadius;
  var temp;

  // Walk forward and back on the y axis looking for the closest x,y point.
  var pointerMin = closestIndex - 1;
  while (pointerMin >= 0 && this.isInYRange_(pointerMin, conn.y_, maxRadius)) {
    temp = this.connections_[pointerMin];
    if (conn.isConnectionAllowed(temp, bestRadius)) {
      bestConnection = temp;
      bestRadius = temp.distanceFrom(conn);
    }
    pointerMin--;
  }

  var pointerMax = closestIndex;
  while (pointerMax < this.connections_.length &&
      this.isInYRange_(pointerMax, conn.y_, maxRadius)) {
    temp = this.connections_[pointerMax];
    if (conn.isConnectionAllowed(temp, bestRadius)) {
      bestConnection = temp;
      bestRadius = temp.distanceFrom(conn);
    }
    pointerMax++;
  }

  // Reset the values of x and y.
  conn.x_ = baseX;
  conn.y_ = baseY;

  // If there were no valid connections, bestConnection will be null.
  return {connection: bestConnection, radius: bestRadius};
};

/**
 * Initialize a set of connection DBs for a specified workspace.
 * @param {!Blockly.Workspace} workspace The workspace this DB is for.
 */
Blockly.ConnectionDB.init = function(workspace) {
  // Create four databases, one for each connection type.
  var dbList = [];
  dbList[Blockly.INPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.OUTPUT_VALUE] = new Blockly.ConnectionDB();
  dbList[Blockly.NEXT_STATEMENT] = new Blockly.ConnectionDB();
  dbList[Blockly.PREVIOUS_STATEMENT] = new Blockly.ConnectionDB();
  workspace.connectionDBList = dbList;
};
