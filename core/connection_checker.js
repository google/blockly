/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An object that encapsulates logic for checking whether a potential
 * connection is safe and valid.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.ConnectionChecker');

goog.require('Blockly.constants');
goog.require('Blockly.registry');

goog.requireType('Blockly.Connection');
goog.requireType('Blockly.IConnectionChecker');


/**
 * Class for connection type checking logic.
 * @implements {Blockly.IConnectionChecker}
 * @constructor
 */
Blockly.ConnectionChecker = function() {
};

/**
 * Check whether the current connection can connect with the target
 * connection.
 * @param {Blockly.Connection} a Connection to check compatibility with.
 * @param {Blockly.Connection} b Connection to check compatibility with.
 * @param {boolean} isDragging True if the connection is being made by dragging
 *     a block.
 * @param {number=} opt_distance The max allowable distance between the
 *     connections for drag checks.
 * @return {boolean} Whether the connection is legal.
 * @public
 */
Blockly.ConnectionChecker.prototype.canConnect = function(a, b,
    isDragging, opt_distance) {
  return this.canConnectWithReason(a, b, isDragging, opt_distance) ==
      Blockly.Connection.CAN_CONNECT;
};

/**
 * Checks whether the current connection can connect with the target
 * connection, and return an error code if there are problems.
 * @param {Blockly.Connection} a Connection to check compatibility with.
 * @param {Blockly.Connection} b Connection to check compatibility with.
 * @param {boolean} isDragging True if the connection is being made by dragging
 *     a block.
 * @param {number=} opt_distance The max allowable distance between the
 *     connections for drag checks.
 * @return {number} Blockly.Connection.CAN_CONNECT if the connection is legal,
 *    an error code otherwise.
 * @public
 */
Blockly.ConnectionChecker.prototype.canConnectWithReason = function(
    a, b, isDragging, opt_distance) {
  var safety = this.doSafetyChecks(a, b);
  if (safety != Blockly.Connection.CAN_CONNECT) {
    return safety;
  }

  // If the safety checks passed, both connections are non-null.
  var connOne = /** @type {!Blockly.Connection} **/ (a);
  var connTwo = /** @type {!Blockly.Connection} **/ (b);
  if (!this.doTypeChecks(connOne, connTwo)) {
    return Blockly.Connection.REASON_CHECKS_FAILED;
  }

  if (isDragging &&
      !this.doDragChecks(
          /** @type {!Blockly.RenderedConnection} **/ (a),
          /** @type {!Blockly.RenderedConnection} **/ (b),
          opt_distance || 0)) {
    return Blockly.Connection.REASON_DRAG_CHECKS_FAILED;
  }

  return Blockly.Connection.CAN_CONNECT;
};

/**
 * Helper method that translates a connection error code into a string.
 * @param {number} errorCode The error code.
 * @param {Blockly.Connection} a One of the two connections being checked.
 * @param {Blockly.Connection} b The second of the two connections being
 *     checked.
 * @return {string} A developer-readable error string.
 * @public
 */
Blockly.ConnectionChecker.prototype.getErrorMessage = function(errorCode,
    a, b) {
  switch (errorCode) {
    case Blockly.Connection.REASON_SELF_CONNECTION:
      return 'Attempted to connect a block to itself.';
    case Blockly.Connection.REASON_DIFFERENT_WORKSPACES:
      // Usually this means one block has been deleted.
      return 'Blocks not on same workspace.';
    case Blockly.Connection.REASON_WRONG_TYPE:
      return 'Attempt to connect incompatible types.';
    case Blockly.Connection.REASON_TARGET_NULL:
      return 'Target connection is null.';
    case Blockly.Connection.REASON_CHECKS_FAILED:
      var connOne = /** @type {!Blockly.Connection} **/ (a);
      var connTwo = /** @type {!Blockly.Connection} **/ (b);
      var msg = 'Connection checks failed. ';
      msg += connOne + ' expected ' + connOne.getCheck() + ', found ' + connTwo.getCheck();
      return msg;
    case Blockly.Connection.REASON_SHADOW_PARENT:
      return 'Connecting non-shadow to shadow block.';
    case Blockly.Connection.REASON_DRAG_CHECKS_FAILED:
      return 'Drag checks failed.';
    default:
      return 'Unknown connection failure: this should never happen!';
  }
};

/**
 * Check that connecting the given connections is safe, meaning that it would
 * not break any of Blockly's basic assumptions (e.g. no self connections).
 * @param {Blockly.Connection} a The first of the connections to check.
 * @param {Blockly.Connection} b The second of the connections to check.
 * @return {number} An enum with the reason this connection is safe or unsafe.
 * @public
 */
Blockly.ConnectionChecker.prototype.doSafetyChecks = function(a, b) {
  if (!a || !b) {
    return Blockly.Connection.REASON_TARGET_NULL;
  }
  if (a.isSuperior()) {
    var blockA = a.getSourceBlock();
    var blockB = b.getSourceBlock();
  } else {
    var blockB = a.getSourceBlock();
    var blockA = b.getSourceBlock();
  }
  if (blockA == blockB) {
    return Blockly.Connection.REASON_SELF_CONNECTION;
  } else if (b.type != Blockly.OPPOSITE_TYPE[a.type]) {
    return Blockly.Connection.REASON_WRONG_TYPE;
  } else if (blockA.workspace !== blockB.workspace) {
    return Blockly.Connection.REASON_DIFFERENT_WORKSPACES;
  } else if (blockA.isShadow() && !blockB.isShadow()) {
    return Blockly.Connection.REASON_SHADOW_PARENT;
  }
  return Blockly.Connection.CAN_CONNECT;
};

/**
 * Check whether this connection is compatible with another connection with
 * respect to the value type system.  E.g. square_root("Hello") is not
 * compatible.
 * @param {!Blockly.Connection} a Connection to compare.
 * @param {!Blockly.Connection} b Connection to compare against.
 * @return {boolean} True if the connections share a type.
 * @public
 */
Blockly.ConnectionChecker.prototype.doTypeChecks = function(a, b) {
  var checkArrayOne = a.getCheck();
  var checkArrayTwo = b.getCheck();

  if (!checkArrayOne || !checkArrayTwo) {
    // One or both sides are promiscuous enough that anything will fit.
    return true;
  }
  // Find any intersection in the check lists.
  for (var i = 0; i < checkArrayOne.length; i++) {
    if (checkArrayTwo.indexOf(checkArrayOne[i]) != -1) {
      return true;
    }
  }
  // No intersection.
  return false;
};

/**
 * Check whether this connection can be made by dragging.
 * @param {!Blockly.RenderedConnection} a Connection to compare.
 * @param {!Blockly.RenderedConnection} b Connection to compare against.
 * @param {number} distance The maximum allowable distance between connections.
 * @return {boolean} True if the connection is allowed during a drag.
 * @public
 */
Blockly.ConnectionChecker.prototype.doDragChecks = function(a, b, distance) {
  if (a.distanceFrom(b) > distance) {
    return false;
  }

  // Don't consider insertion markers.
  if (b.getSourceBlock().isInsertionMarker()) {
    return false;
  }

  switch (b.type) {
    case Blockly.PREVIOUS_STATEMENT:
      return this.canConnectToPrevious_(a, b);
    case Blockly.OUTPUT_VALUE: {
      // Don't offer to connect an already connected left (male) value plug to
      // an available right (female) value plug.
      if ((b.isConnected() &&
          !b.targetBlock().isInsertionMarker()) ||
          a.isConnected()) {
        return false;
      }
      break;
    }
    case Blockly.INPUT_VALUE: {
      // Offering to connect the left (male) of a value block to an already
      // connected value pair is ok, we'll splice it in.
      // However, don't offer to splice into an immovable block.
      if (b.isConnected() &&
          !b.targetBlock().isMovable() &&
          !b.targetBlock().isShadow()) {
        return false;
      }
      break;
    }
    case Blockly.NEXT_STATEMENT: {
      // Don't let a block with no next connection bump other blocks out of the
      // stack.  But covering up a shadow block or stack of shadow blocks is
      // fine.  Similarly, replacing a terminal statement with another terminal
      // statement is allowed.
      if (b.isConnected() &&
          !a.getSourceBlock().nextConnection &&
          !b.targetBlock().isShadow() &&
          b.targetBlock().nextConnection) {
        return false;
      }
      break;
    }
    default:
      // Unexpected connection type.
      return false;
  }

  // Don't let blocks try to connect to themselves or ones they nest.
  if (Blockly.draggingConnections.indexOf(b) != -1) {
    return false;
  }

  return true;
};

/**
 * Helper function for drag checking.
 * @param {!Blockly.Connection} a The connection to check, which must be a
 *     statement input or next connection.
 * @param {!Blockly.Connection} b A nearby connection to check, which
 *     must be a previous connection.
 * @return {boolean} True if the connection is allowed, false otherwise.
 * @protected
 */
Blockly.ConnectionChecker.prototype.canConnectToPrevious_ = function(a, b) {
  if (a.targetConnection) {
    // This connection is already occupied.
    // A next connection will never disconnect itself mid-drag.
    return false;
  }

  // Don't let blocks try to connect to themselves or ones they nest.
  if (Blockly.draggingConnections.indexOf(b) != -1) {
    return false;
  }

  if (!b.targetConnection) {
    return true;
  }

  var targetBlock = b.targetBlock();
  // If it is connected to a real block, game over.
  if (!targetBlock.isInsertionMarker()) {
    return false;
  }
  // If it's connected to an insertion marker but that insertion marker
  // is the first block in a stack, it's still fine.  If that insertion
  // marker is in the middle of a stack, it won't work.
  return !targetBlock.getPreviousBlock();
};

Blockly.registry.register(Blockly.registry.Type.CONNECTION_CHECKER,
    Blockly.registry.DEFAULT, Blockly.ConnectionChecker);
