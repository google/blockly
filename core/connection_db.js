/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A database of all the rendered connections that could
 *    possibly be connected to (i.e. not collapsed, etc).
 *    Sorted by y coordinate.
 */
'use strict';

/**
 * A database of all the rendered connections that could
 *    possibly be connected to (i.e. not collapsed, etc).
 *    Sorted by y coordinate.
 * @class
 */
goog.module('Blockly.ConnectionDB');

const {ConnectionType} = goog.require('Blockly.ConnectionType');
/* eslint-disable-next-line no-unused-vars */
const {Coordinate} = goog.requireType('Blockly.utils.Coordinate');
/* eslint-disable-next-line no-unused-vars */
const {IConnectionChecker} = goog.requireType('Blockly.IConnectionChecker');
/* eslint-disable-next-line no-unused-vars */
const {RenderedConnection} = goog.requireType('Blockly.RenderedConnection');
/** @suppress {extraRequire} */
goog.require('Blockly.constants');


/**
 * Database of connections.
 * Connections are stored in order of their vertical component.  This way
 * connections in an area may be looked up quickly using a binary search.
 * @alias Blockly.ConnectionDB
 */
class ConnectionDB {
  /**
   * @param {!IConnectionChecker} checker The workspace's
   *     connection type checker, used to decide if connections are valid during
   * a drag.
   */
  constructor(checker) {
    /**
     * Array of connections sorted by y position in workspace units.
     * @type {!Array<!RenderedConnection>}
     * @private
     */
    this.connections_ = [];
    /**
     * The workspace's connection type checker, used to decide if connections
     * are valid during a drag.
     * @type {!IConnectionChecker}
     * @private
     */
    this.connectionChecker_ = checker;
  }

  /**
   * Add a connection to the database. Should not already exist in the database.
   * @param {!RenderedConnection} connection The connection to be added.
   * @param {number} yPos The y position used to decide where to insert the
   *    connection.
   * @package
   */
  addConnection(connection, yPos) {
    const index = this.calculateIndexForYPos_(yPos);
    this.connections_.splice(index, 0, connection);
  }

  /**
   * Finds the index of the given connection.
   *
   * Starts by doing a binary search to find the approximate location, then
   * linearly searches nearby for the exact connection.
   * @param {!RenderedConnection} conn The connection to find.
   * @param {number} yPos The y position used to find the index of the
   *     connection.
   * @return {number} The index of the connection, or -1 if the connection was
   *     not found.
   * @private
   */
  findIndexOfConnection_(conn, yPos) {
    if (!this.connections_.length) {
      return -1;
    }

    const bestGuess = this.calculateIndexForYPos_(yPos);
    if (bestGuess >= this.connections_.length) {
      // Not in list
      return -1;
    }

    yPos = conn.y;
    // Walk forward and back on the y axis looking for the connection.
    let pointer = bestGuess;
    while (pointer >= 0 && this.connections_[pointer].y === yPos) {
      if (this.connections_[pointer] === conn) {
        return pointer;
      }
      pointer--;
    }

    pointer = bestGuess;
    while (pointer < this.connections_.length &&
           this.connections_[pointer].y === yPos) {
      if (this.connections_[pointer] === conn) {
        return pointer;
      }
      pointer++;
    }
    return -1;
  }

  /**
   * Finds the correct index for the given y position.
   * @param {number} yPos The y position used to decide where to
   *    insert the connection.
   * @return {number} The candidate index.
   * @private
   */
  calculateIndexForYPos_(yPos) {
    if (!this.connections_.length) {
      return 0;
    }
    let pointerMin = 0;
    let pointerMax = this.connections_.length;
    while (pointerMin < pointerMax) {
      const pointerMid = Math.floor((pointerMin + pointerMax) / 2);
      if (this.connections_[pointerMid].y < yPos) {
        pointerMin = pointerMid + 1;
      } else if (this.connections_[pointerMid].y > yPos) {
        pointerMax = pointerMid;
      } else {
        pointerMin = pointerMid;
        break;
      }
    }
    return pointerMin;
  }

  /**
   * Remove a connection from the database.  Must already exist in DB.
   * @param {!RenderedConnection} connection The connection to be removed.
   * @param {number} yPos The y position used to find the index of the
   *     connection.
   * @throws {Error} If the connection cannot be found in the database.
   */
  removeConnection(connection, yPos) {
    const index = this.findIndexOfConnection_(connection, yPos);
    if (index === -1) {
      throw Error('Unable to find connection in connectionDB.');
    }
    this.connections_.splice(index, 1);
  }

  /**
   * Find all nearby connections to the given connection.
   * Type checking does not apply, since this function is used for bumping.
   * @param {!RenderedConnection} connection The connection whose
   *     neighbours should be returned.
   * @param {number} maxRadius The maximum radius to another connection.
   * @return {!Array<!RenderedConnection>} List of connections.
   */
  getNeighbours(connection, maxRadius) {
    const db = this.connections_;
    const currentX = connection.x;
    const currentY = connection.y;

    // Binary search to find the closest y location.
    let pointerMin = 0;
    let pointerMax = db.length - 2;
    let pointerMid = pointerMax;
    while (pointerMin < pointerMid) {
      if (db[pointerMid].y < currentY) {
        pointerMin = pointerMid;
      } else {
        pointerMax = pointerMid;
      }
      pointerMid = Math.floor((pointerMin + pointerMax) / 2);
    }

    const neighbours = [];
    /**
     * Computes if the current connection is within the allowed radius of
     * another connection. This function is a closure and has access to outside
     * variables.
     * @param {number} yIndex The other connection's index in the database.
     * @return {boolean} True if the current connection's vertical distance from
     *     the other connection is less than the allowed radius.
     */
    function checkConnection_(yIndex) {
      const dx = currentX - db[yIndex].x;
      const dy = currentY - db[yIndex].y;
      const r = Math.sqrt(dx * dx + dy * dy);
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
  }

  /**
   * Is the candidate connection close to the reference connection.
   * Extremely fast; only looks at Y distance.
   * @param {number} index Index in database of candidate connection.
   * @param {number} baseY Reference connection's Y value.
   * @param {number} maxRadius The maximum radius to another connection.
   * @return {boolean} True if connection is in range.
   * @private
   */
  isInYRange_(index, baseY, maxRadius) {
    return (Math.abs(this.connections_[index].y - baseY) <= maxRadius);
  }

  /**
   * Find the closest compatible connection to this connection.
   * @param {!RenderedConnection} conn The connection searching for a compatible
   *     mate.
   * @param {number} maxRadius The maximum radius to another connection.
   * @param {!Coordinate} dxy Offset between this connection's
   *     location in the database and the current location (as a result of
   *     dragging).
   * @return {!{connection: RenderedConnection, radius: number}}
   *     Contains two properties: 'connection' which is either another
   *     connection or null, and 'radius' which is the distance.
   */
  searchForClosest(conn, maxRadius, dxy) {
    if (!this.connections_.length) {
      // Don't bother.
      return {connection: null, radius: maxRadius};
    }

    // Stash the values of x and y from before the drag.
    const baseY = conn.y;
    const baseX = conn.x;

    conn.x = baseX + dxy.x;
    conn.y = baseY + dxy.y;

    // calculateIndexForYPos_ finds an index for insertion, which is always
    // after any block with the same y index.  We want to search both forward
    // and back, so search on both sides of the index.
    const closestIndex = this.calculateIndexForYPos_(conn.y);

    let bestConnection = null;
    let bestRadius = maxRadius;
    let temp;

    // Walk forward and back on the y axis looking for the closest x,y point.
    let pointerMin = closestIndex - 1;
    while (pointerMin >= 0 && this.isInYRange_(pointerMin, conn.y, maxRadius)) {
      temp = this.connections_[pointerMin];
      if (this.connectionChecker_.canConnect(conn, temp, true, bestRadius)) {
        bestConnection = temp;
        bestRadius = temp.distanceFrom(conn);
      }
      pointerMin--;
    }

    let pointerMax = closestIndex;
    while (pointerMax < this.connections_.length &&
           this.isInYRange_(pointerMax, conn.y, maxRadius)) {
      temp = this.connections_[pointerMax];
      if (this.connectionChecker_.canConnect(conn, temp, true, bestRadius)) {
        bestConnection = temp;
        bestRadius = temp.distanceFrom(conn);
      }
      pointerMax++;
    }

    // Reset the values of x and y.
    conn.x = baseX;
    conn.y = baseY;

    // If there were no valid connections, bestConnection will be null.
    return {connection: bestConnection, radius: bestRadius};
  }

  /**
   * Initialize a set of connection DBs for a workspace.
   * @param {!IConnectionChecker} checker The workspace's
   *     connection checker, used to decide if connections are valid during a
   *     drag.
   * @return {!Array<!ConnectionDB>} Array of databases.
   */
  static init(checker) {
    // Create four databases, one for each connection type.
    const dbList = [];
    dbList[ConnectionType.INPUT_VALUE] = new ConnectionDB(checker);
    dbList[ConnectionType.OUTPUT_VALUE] = new ConnectionDB(checker);
    dbList[ConnectionType.NEXT_STATEMENT] = new ConnectionDB(checker);
    dbList[ConnectionType.PREVIOUS_STATEMENT] = new ConnectionDB(checker);
    return dbList;
  }
}

exports.ConnectionDB = ConnectionDB;
