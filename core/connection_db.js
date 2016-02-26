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
};

Blockly.ConnectionDB.prototype = new Array();
/**
 * Don't inherit the constructor from Array.
 * @type {!Function}
 */
Blockly.ConnectionDB.constructor = Blockly.ConnectionDB;

/**
 * Add a connection to the database.  Must not already exist in DB.
 * @param {!Blockly.Connection} connection The connection to be added.
 * @private
 */
Blockly.ConnectionDB.prototype.addConnection_ = function(connection) {
  if (connection.inDB_) {
    throw 'Connection already in database.';
  }
  if (connection.sourceBlock_.isInFlyout) {
    // Don't bother maintaining a database of connections in a flyout.
    return;
  }
  var position = this.findPositionForConnection_(connection);
  this.splice(position, 0, connection);
  connection.inDB_ = true;
};

/**
 * Find the given connection.
 * Starts by doing a binary search to find the approximate location, then linearly searches
 * nearby for the exact connection.
 * @param {Blockly.Connection} conn The connection to find.
 * @return The index of the connection, or -1 if the connection was not found.
 */
Blockly.ConnectionDB.prototype.findConnection = function(conn) {
  if (this.length == 0) {
    return -1;
  }

  var bestGuess = this.findPositionForConnection_(conn);
  if (bestGuess >= this.length) {
    // Not in list
    return -1;
  }

  var yPos = conn.y_;
  // Walk forward and back on the y axis looking for the connection.
  var pointerMin = bestGuess;
  var pointerMax = bestGuess;
  while(pointerMin >= 0 && this[pointerMin].y_ == yPos) {
    if (this[pointerMin] == conn) {
      return pointerMin;
    }
    pointerMin--;
  }

  while (pointerMax < this.length && this[pointerMax].y_ == yPos) {
    if (this[pointerMax] == conn) {
      return pointerMax;
    }
    pointerMax++;
  }
  return -1;
};

/**
 * Finds a candidate position for inserting this connection into the list.
 * This will be in the correct y order but makes no guarantees about ordering in the x axis.
 * @param {Blockly.Connection} connection The connection to insert.
 * @return {number} The candidate index.
 * @private
 */
Blockly.ConnectionDB.prototype.findPositionForConnection_ = function(connection) {
  if (this.length == 0) {
    return 0;
  }
  var pointerMin = 0;
  var pointerMax = this.length;
  while (pointerMin < pointerMax) {
    var pointerMid = Math.floor((pointerMin + pointerMax) / 2);
    if (this[pointerMid].y_ < connection.y_) {
      pointerMin = pointerMid + 1;
    } else if (this[pointerMid].y_ > connection.y_) {
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
    throw 'Connection not in database.';
  }
  var removalIndex = this.findConnection(connection);
  if (removalIndex == -1) {
    throw 'Unable to find connection in connectionDB.';
  }
  this.splice(removalIndex, 1);
};

/**
 * Find all nearby connections to the given connection.
 * Type checking does not apply, since this function is used for bumping.
 * @param {Blockly.Connection} connection The connection whose neighbours should be returned.
 * @param {number} maxRadius The maximum radius to another connection.
 * @return {!Array.<Blockly.Connection>} List of connections.
 * @private
 */
Blockly.ConnectionDB.prototype.getNeighbours = function(connection, maxRadius) {
  var db =  this;
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

  // Walk forward and back on the y axis looking for the closest x,y point.
  pointerMin = pointerMid;
  pointerMax = pointerMid;
  var neighbours = [];
  var sourceBlock = connection.sourceBlock_;
  if (db.length) {
    while (pointerMin >= 0 && checkConnection_(pointerMin)) {
      pointerMin--;
    }
    do {
      pointerMax++;
    } while (pointerMax < db.length && checkConnection_(pointerMax));
  }

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
  return neighbours;
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
