/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Components for creating connections between blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Connection');

goog.require('Blockly.connectionTypes');
/** @suppress {extraRequire} */
goog.require('Blockly.constants');
goog.require('Blockly.Events');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockMove');
goog.require('Blockly.IASTNodeLocationWithBlock');
goog.require('Blockly.utils.deprecation');
goog.require('Blockly.Xml');

goog.requireType('Blockly.Block');
goog.requireType('Blockly.IConnectionChecker');
goog.requireType('Blockly.Input');


/**
 * Class for a connection between blocks.
 * @param {!Blockly.Block} source The block establishing this connection.
 * @param {number} type The type of the connection.
 * @constructor
 * @implements {Blockly.IASTNodeLocationWithBlock}
 */
Blockly.Connection = function(source, type) {
  /**
   * @type {!Blockly.Block}
   * @protected
   */
  this.sourceBlock_ = source;
  /** @type {number} */
  this.type = type;
};

/**
 * Constants for checking whether two connections are compatible.
 */
Blockly.Connection.CAN_CONNECT = 0;
Blockly.Connection.REASON_SELF_CONNECTION = 1;
Blockly.Connection.REASON_WRONG_TYPE = 2;
Blockly.Connection.REASON_TARGET_NULL = 3;
Blockly.Connection.REASON_CHECKS_FAILED = 4;
Blockly.Connection.REASON_DIFFERENT_WORKSPACES = 5;
Blockly.Connection.REASON_SHADOW_PARENT = 6;
Blockly.Connection.REASON_DRAG_CHECKS_FAILED = 7;

/**
 * Connection this connection connects to.  Null if not connected.
 * @type {Blockly.Connection}
 */
Blockly.Connection.prototype.targetConnection = null;

/**
 * Has this connection been disposed of?
 * @type {boolean}
 * @package
 */
Blockly.Connection.prototype.disposed = false;

/**
 * List of compatible value types.  Null if all types are compatible.
 * @type {Array}
 * @private
 */
Blockly.Connection.prototype.check_ = null;

/**
 * DOM representation of a shadow block, or null if none.
 * @type {Element}
 * @private
 */
Blockly.Connection.prototype.shadowDom_ = null;

/**
 * Horizontal location of this connection.
 * @type {number}
 * @package
 */
Blockly.Connection.prototype.x = 0;

/**
 * Vertical location of this connection.
 * @type {number}
 * @package
 */
Blockly.Connection.prototype.y = 0;

/**
 * Connect two connections together.  This is the connection on the superior
 * block.
 * @param {!Blockly.Connection} childConnection Connection on inferior block.
 * @protected
 */
Blockly.Connection.prototype.connect_ = function(childConnection) {
  var INPUT = Blockly.connectionTypes.INPUT_VALUE;
  var parentConnection = this;
  var parentBlock = parentConnection.getSourceBlock();
  var childBlock = childConnection.getSourceBlock();

  // Make sure the childConnection is available.
  if (childConnection.isConnected()) {
    childConnection.disconnect();
  }

  // Make sure the parentConnection is available.
  var orphan;
  if (parentConnection.isConnected()) {
    var shadowDom = parentConnection.getShadowDom(true);
    parentConnection.shadowDom_ = null;  // Set to null so it doesn't respawn.
    var target = parentConnection.targetBlock();
    if (target.isShadow()) {
      target.dispose(false);
    } else {
      parentConnection.disconnect();
      orphan = target;
    }
    parentConnection.shadowDom_ = shadowDom;
  }

  // Connect the new connection to the parent.
  var event;
  if (Blockly.Events.isEnabled()) {
    event = new (Blockly.Events.get(Blockly.Events.BLOCK_MOVE))(childBlock);
  }
  Blockly.Connection.connectReciprocally_(parentConnection, childConnection);
  childBlock.setParent(parentBlock);
  if (event) {
    event.recordNew();
    Blockly.Events.fire(event);
  }

  // Deal with the orphan if it exists.
  if (orphan) {
    var orphanConnection = parentConnection.type === INPUT ?
        orphan.outputConnection : orphan.previousConnection;
    var connection = Blockly.Connection.getConnectionForOrphanedConnection(
        childBlock, /** @type {!Blockly.Connection} */ (orphanConnection));
    if (connection) {
      orphanConnection.connect(connection);
    } else {
      orphanConnection.onFailedConnect(parentConnection);
    }
  }
};


/**
 * Dispose of this connection and deal with connected blocks.
 * @package
 */
Blockly.Connection.prototype.dispose = function() {

  // isConnected returns true for shadows and non-shadows.
  if (this.isConnected()) {
    // Destroy the attached shadow block & its children (if it exists).
    this.setShadowDom(null);

    var targetBlock = this.targetBlock();
    if (targetBlock) {
      // Disconnect the attached normal block.
      targetBlock.unplug();
    }
  }

  this.disposed = true;
};

/**
 * Get the source block for this connection.
 * @return {!Blockly.Block} The source block.
 */
Blockly.Connection.prototype.getSourceBlock = function() {
  return this.sourceBlock_;
};

/**
 * Does the connection belong to a superior block (higher in the source stack)?
 * @return {boolean} True if connection faces down or right.
 */
Blockly.Connection.prototype.isSuperior = function() {
  return this.type == Blockly.connectionTypes.INPUT_VALUE ||
      this.type == Blockly.connectionTypes.NEXT_STATEMENT;
};

/**
 * Is the connection connected?
 * @return {boolean} True if connection is connected to another connection.
 */
Blockly.Connection.prototype.isConnected = function() {
  return !!this.targetConnection;
};

/**
 * Checks whether the current connection can connect with the target
 * connection.
 * @param {Blockly.Connection} target Connection to check compatibility with.
 * @return {number} Blockly.Connection.CAN_CONNECT if the connection is legal,
 *    an error code otherwise.
 * @deprecated July 2020. Will be deleted July 2021. Use the workspace's
 *     connectionChecker instead.
 */
Blockly.Connection.prototype.canConnectWithReason = function(target) {
  Blockly.utils.deprecation.warn(
      'Connection.prototype.canConnectWithReason',
      'July 2020',
      'July 2021',
      'the workspace\'s connection checker');
  return this.getConnectionChecker().canConnectWithReason(
      this, target, false);
};

/**
 * Checks whether the current connection and target connection are compatible
 * and throws an exception if they are not.
 * @param {Blockly.Connection} target The connection to check compatibility
 *    with.
 * @package
 * @deprecated July 2020. Will be deleted July 2021. Use the workspace's
 *     connectionChecker instead.
 */
Blockly.Connection.prototype.checkConnection = function(target) {
  Blockly.utils.deprecation.warn(
      'Connection.prototype.checkConnection',
      'July 2020',
      'July 2021',
      'the workspace\'s connection checker');
  var checker = this.getConnectionChecker();
  var reason = checker.canConnectWithReason(this, target, false);
  if (reason != Blockly.Connection.CAN_CONNECT) {
    throw new Error(checker.getErrorMessage(reason, this, target));
  }
};

/**
 * Get the workspace's connection type checker object.
 * @return {!Blockly.IConnectionChecker} The connection type checker for the
 *     source block's workspace.
 * @package
 */
Blockly.Connection.prototype.getConnectionChecker = function() {
  return this.sourceBlock_.workspace.connectionChecker;
};

/**
 * Check if the two connections can be dragged to connect to each other.
 * @param {!Blockly.Connection} candidate A nearby connection to check.
 * @return {boolean} True if the connection is allowed, false otherwise.
 * @deprecated July 2020. Will be deleted July 2021. Use the workspace's
 *     connectionChecker instead.
 */
Blockly.Connection.prototype.isConnectionAllowed = function(candidate) {
  Blockly.utils.deprecation.warn(
      'Connection.prototype.isConnectionAllowed',
      'July 2020',
      'July 2021',
      'the workspace\'s connection checker');
  return this.getConnectionChecker().canConnect(this, candidate, true);
};

/**
 * Called when an attempted connection fails. NOP by default (i.e. for headless
 * workspaces).
 * @param {!Blockly.Connection} _otherConnection Connection that this connection
 *     failed to connect to.
 * @package
 */
Blockly.Connection.prototype.onFailedConnect = function(_otherConnection) {
  // NOP
};

/**
 * Connect this connection to another connection.
 * @param {!Blockly.Connection} otherConnection Connection to connect to.
 */
Blockly.Connection.prototype.connect = function(otherConnection) {
  if (this.targetConnection == otherConnection) {
    // Already connected together.  NOP.
    return;
  }

  var checker = this.getConnectionChecker();
  if (checker.canConnect(this, otherConnection, false)) {
    var eventGroup = Blockly.Events.getGroup();
    if (!eventGroup) {
      Blockly.Events.setGroup(true);
    }
    // Determine which block is superior (higher in the source stack).
    if (this.isSuperior()) {
      // Superior block.
      this.connect_(otherConnection);
    } else {
      // Inferior block.
      otherConnection.connect_(this);
    }
    if (!eventGroup) {
      Blockly.Events.setGroup(false);
    }
  }
};

/**
 * Update two connections to target each other.
 * @param {Blockly.Connection} first The first connection to update.
 * @param {Blockly.Connection} second The second connection to update.
 * @private
 */
Blockly.Connection.connectReciprocally_ = function(first, second) {
  if (!first || !second) {
    throw Error('Cannot connect null connections.');
  }
  first.targetConnection = second;
  second.targetConnection = first;
};

/**
 * Returns the single connection on the block that will accept the orphaned
 * block, if one can be found. If the block has multiple compatible connections
 * (even if they are filled) this returns null. If the block has no compatible
 * connections, this returns null.
 * @param {!Blockly.Block} block The superior block.
 * @param {!Blockly.Block} orphanBlock The inferior block.
 * @return {?Blockly.Connection} The suitable connection point on 'block',
 *     or null.
 * @private
 */
Blockly.Connection.getSingleConnection_ = function(block, orphanBlock) {
  var foundConnection = null;
  var output = orphanBlock.outputConnection;
  var typeChecker = output.getConnectionChecker();

  for (var i = 0, input; (input = block.inputList[i]); i++) {
    var connection = input.connection;
    if (connection && typeChecker.canConnect(output, connection, false)) {
      if (foundConnection) {
        return null;  // More than one connection.
      }
      foundConnection = connection;
    }
  }
  return foundConnection;
};

/**
 * Walks down a row a blocks, at each stage checking if there are any
 * connections that will accept the orphaned block.  If at any point there
 * are zero or multiple eligible connections, returns null.  Otherwise
 * returns the only input on the last block in the chain.
 * Terminates early for shadow blocks.
 * @param {!Blockly.Block} startBlock The block on which to start the search.
 * @param {!Blockly.Block} orphanBlock The block that is looking for a home.
 * @return {?Blockly.Connection} The suitable connection point on the chain
 *     of blocks, or null.
 * @private
 */
Blockly.Connection.getConnectionForOrphanedOutput_ =
    function(startBlock, orphanBlock) {
      var newBlock = startBlock;
      var connection;
      while ((connection = Blockly.Connection.getSingleConnection_(
          /** @type {!Blockly.Block} */ (newBlock), orphanBlock))) {
        newBlock = connection.targetBlock();
        if (!newBlock || newBlock.isShadow()) {
          return connection;
        }
      }
      return null;
    };

/**
 * Returns the connection (starting at the startBlock) which will accept
 * the given connection. This includes compatible connection types and
 * connection checks.
 * @param {!Blockly.Block} startBlock The block on which to start the search.
 * @param {!Blockly.Connection} orphanConnection The connection that is looking
 *     for a home.
 * @return {?Blockly.Connection} The suitable connection point on the chain of
 *     blocks, or null.
 */
Blockly.Connection.getConnectionForOrphanedConnection =
    function(startBlock, orphanConnection) {
      if (orphanConnection.type === Blockly.connectionTypes.OUTPUT_VALUE) {
        return Blockly.Connection.getConnectionForOrphanedOutput_(
            startBlock, orphanConnection.getSourceBlock());
      }
      // Otherwise we're dealing with a stack.
      var connection = startBlock.lastConnectionInStack(true);
      var checker = orphanConnection.getConnectionChecker();
      if (connection &&
          checker.canConnect(orphanConnection, connection, false)) {
        return connection;
      }
      return null;
    };

/**
 * Disconnect this connection.
 */
Blockly.Connection.prototype.disconnect = function() {
  var otherConnection = this.targetConnection;
  if (!otherConnection) {
    throw Error('Source connection not connected.');
  }
  if (otherConnection.targetConnection != this) {
    throw Error('Target connection not connected to source connection.');
  }
  var parentBlock, childBlock, parentConnection;
  if (this.isSuperior()) {
    // Superior block.
    parentBlock = this.sourceBlock_;
    childBlock = otherConnection.getSourceBlock();
    parentConnection = this;
  } else {
    // Inferior block.
    parentBlock = otherConnection.getSourceBlock();
    childBlock = this.sourceBlock_;
    parentConnection = otherConnection;
  }

  var eventGroup = Blockly.Events.getGroup();
  if (!eventGroup) {
    Blockly.Events.setGroup(true);
  }
  this.disconnectInternal_(parentBlock, childBlock);
  if (!childBlock.isShadow()) {
    // If we were disconnecting a shadow, no need to spawn a new one.
    parentConnection.respawnShadow_();
  }
  if (!eventGroup) {
    Blockly.Events.setGroup(false);
  }
};

/**
 * Disconnect two blocks that are connected by this connection.
 * @param {!Blockly.Block} parentBlock The superior block.
 * @param {!Blockly.Block} childBlock The inferior block.
 * @protected
 */
Blockly.Connection.prototype.disconnectInternal_ = function(parentBlock,
    childBlock) {
  var event;
  if (Blockly.Events.isEnabled()) {
    event = new (Blockly.Events.get(Blockly.Events.BLOCK_MOVE))(childBlock);
  }
  var otherConnection = this.targetConnection;
  otherConnection.targetConnection = null;
  this.targetConnection = null;
  childBlock.setParent(null);
  if (event) {
    event.recordNew();
    Blockly.Events.fire(event);
  }
};

/**
 * Respawn the shadow block if there was one connected to the this connection.
 * @protected
 */
Blockly.Connection.prototype.respawnShadow_ = function() {
  var parentBlock = this.getSourceBlock();
  var shadow = this.getShadowDom();
  if (parentBlock.workspace && shadow) {
    var blockShadow = Blockly.Xml.domToBlock(shadow, parentBlock.workspace);
    if (blockShadow.outputConnection) {
      this.connect(blockShadow.outputConnection);
    } else if (blockShadow.previousConnection) {
      this.connect(blockShadow.previousConnection);
    } else {
      throw Error('Child block does not have output or previous statement.');
    }
  }
};

/**
 * Returns the block that this connection connects to.
 * @return {?Blockly.Block} The connected block or null if none is connected.
 */
Blockly.Connection.prototype.targetBlock = function() {
  if (this.isConnected()) {
    return this.targetConnection.getSourceBlock();
  }
  return null;
};

/**
 * Is this connection compatible with another connection with respect to the
 * value type system.  E.g. square_root("Hello") is not compatible.
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @return {boolean} True if the connections share a type.
 * @deprecated July 2020. Will be deleted July 2021. Use the workspace's
 *     connectionChecker instead.
 */
Blockly.Connection.prototype.checkType = function(otherConnection) {
  Blockly.utils.deprecation.warn(
      'Connection.prototype.checkType',
      'October 2019',
      'January 2021',
      'the workspace\'s connection checker');
  return this.getConnectionChecker().canConnect(this, otherConnection,
      false);
};

/**
 * Is this connection compatible with another connection with respect to the
 * value type system.  E.g. square_root("Hello") is not compatible.
 * @param {!Blockly.Connection} otherConnection Connection to compare against.
 * @return {boolean} True if the connections share a type.
 * @private
 * @deprecated October 2019. Will be deleted January 2021. Use the workspace's
 *     connectionChecker instead.
 * @suppress {unusedPrivateMembers}
 */
Blockly.Connection.prototype.checkType_ = function(otherConnection) {
  Blockly.utils.deprecation.warn(
      'Connection.prototype.checkType_',
      'October 2019',
      'January 2021',
      'the workspace\'s connection checker');
  return this.checkType(otherConnection);
};

/**
 * Function to be called when this connection's compatible types have changed.
 * @protected
 */
Blockly.Connection.prototype.onCheckChanged_ = function() {
  // The new value type may not be compatible with the existing connection.
  if (this.isConnected() && (!this.targetConnection ||
      !this.getConnectionChecker().canConnect(
          this, this.targetConnection, false))) {
    var child = this.isSuperior() ? this.targetBlock() : this.sourceBlock_;
    child.unplug();
  }
};

/**
 * Change a connection's compatibility.
 * @param {?(string|!Array<string>)} check Compatible value type or list of
 *     value types. Null if all types are compatible.
 * @return {!Blockly.Connection} The connection being modified
 *     (to allow chaining).
 */
Blockly.Connection.prototype.setCheck = function(check) {
  if (check) {
    // Ensure that check is in an array.
    if (!Array.isArray(check)) {
      check = [check];
    }
    this.check_ = check;
    this.onCheckChanged_();
  } else {
    this.check_ = null;
  }
  return this;
};

/**
 * Get a connection's compatibility.
 * @return {?Array} List of compatible value types.
 *     Null if all types are compatible.
 * @public
 */
Blockly.Connection.prototype.getCheck = function() {
  return this.check_;
};

/**
 * Changes the connection's shadow block.
 * @param {?Element} shadow DOM representation of a block or null.
 */
Blockly.Connection.prototype.setShadowDom = function(shadow) {
  this.shadowDom_ = shadow;
  var target = this.targetBlock();
  if (!target) {
    this.respawnShadow_();
  } else if (target.isShadow()) {
    // The disconnect from dispose will automatically generate the new shadow.
    target.dispose(false);
    this.respawnShadow_();
  }
};

/**
 * Returns the xml representation of the connection's shadow block.
 * @param {boolean=} returnCurrent If true, and the shadow block is currently
 *     attached to this connection, this serializes the state of that block
 *     and returns it (so that field values are correct). Otherwise the saved
 *     shadowDom is just returned.
 * @return {?Element} Shadow DOM representation of a block or null.
 */
Blockly.Connection.prototype.getShadowDom = function(returnCurrent) {
  return (returnCurrent && this.targetBlock().isShadow()) ?
      /** @type {!Element} */ (Blockly.Xml.blockToDom(
          /** @type {!Blockly.Block} */ (this.targetBlock()))) :
      this.shadowDom_;
};

/**
 * Find all nearby compatible connections to this connection.
 * Type checking does not apply, since this function is used for bumping.
 *
 * Headless configurations (the default) do not have neighboring connection,
 * and always return an empty list (the default).
 * {@link Blockly.RenderedConnection} overrides this behavior with a list
 * computed from the rendered positioning.
 * @param {number} _maxLimit The maximum radius to another connection.
 * @return {!Array<!Blockly.Connection>} List of connections.
 * @package
 */
Blockly.Connection.prototype.neighbours = function(_maxLimit) {
  return [];
};

/**
 * Get the parent input of a connection.
 * @return {?Blockly.Input} The input that the connection belongs to or null if
 *     no parent exists.
 * @package
 */
Blockly.Connection.prototype.getParentInput = function() {
  var parentInput = null;
  var inputs = this.sourceBlock_.inputList;
  for (var i = 0; i < inputs.length; i++) {
    if (inputs[i].connection === this) {
      parentInput = inputs[i];
      break;
    }
  }
  return parentInput;
};

/**
 * This method returns a string describing this Connection in developer terms
 * (English only). Intended to on be used in console logs and errors.
 * @return {string} The description.
 */
Blockly.Connection.prototype.toString = function() {
  var block = this.sourceBlock_;
  if (!block) {
    return 'Orphan Connection';
  }
  var msg;
  if (block.outputConnection == this) {
    msg = 'Output Connection of ';
  } else if (block.previousConnection == this) {
    msg = 'Previous Connection of ';
  } else if (block.nextConnection == this) {
    msg = 'Next Connection of ';
  } else {
    var parentInput = null;
    for (var i = 0, input; (input = block.inputList[i]); i++) {
      if (input.connection == this) {
        parentInput = input;
        break;
      }
    }
    if (parentInput) {
      msg = 'Input "' + parentInput.name + '" connection on ';
    } else {
      console.warn('Connection not actually connected to sourceBlock_');
      return 'Orphan Connection';
    }
  }
  return msg + block.toDevString();
};
