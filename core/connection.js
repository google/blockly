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

goog.module('Blockly.Connection');
goog.module.declareLegacyNamespace();

/* eslint-disable-next-line no-unused-vars */
const Block = goog.requireType('Blockly.Block');
const Events = goog.require('Blockly.Events');
/* eslint-disable-next-line no-unused-vars */
const IASTNodeLocationWithBlock = goog.requireType('Blockly.IASTNodeLocationWithBlock');
/* eslint-disable-next-line no-unused-vars */
const IConnectionChecker = goog.requireType('Blockly.IConnectionChecker');
/* eslint-disable-next-line no-unused-vars */
const Input = goog.requireType('Blockly.Input');
const Xml = goog.require('Blockly.Xml');
const blocks = goog.require('Blockly.serialization.blocks');
const connectionTypes = goog.require('Blockly.connectionTypes');
const deprecation = goog.require('Blockly.utils.deprecation');
/** @suppress {extraRequire} */
goog.require('Blockly.constants');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockMove');


/**
 * Class for a connection between blocks.
 * @param {!Block} source The block establishing this connection.
 * @param {number} type The type of the connection.
 * @constructor
 * @implements {IASTNodeLocationWithBlock}
 */
const Connection = function(source, type) {
  /**
   * @type {!Block}
   * @protected
   */
  this.sourceBlock_ = source;
  /** @type {number} */
  this.type = type;
};

/**
 * Constants for checking whether two connections are compatible.
 */
Connection.CAN_CONNECT = 0;
Connection.REASON_SELF_CONNECTION = 1;
Connection.REASON_WRONG_TYPE = 2;
Connection.REASON_TARGET_NULL = 3;
Connection.REASON_CHECKS_FAILED = 4;
Connection.REASON_DIFFERENT_WORKSPACES = 5;
Connection.REASON_SHADOW_PARENT = 6;
Connection.REASON_DRAG_CHECKS_FAILED = 7;

/**
 * Connection this connection connects to.  Null if not connected.
 * @type {Connection}
 */
Connection.prototype.targetConnection = null;

/**
 * Has this connection been disposed of?
 * @type {boolean}
 * @package
 */
Connection.prototype.disposed = false;

/**
 * List of compatible value types.  Null if all types are compatible.
 * @type {Array}
 * @private
 */
Connection.prototype.check_ = null;

/**
 * DOM representation of a shadow block, or null if none.
 * @type {Element}
 * @private
 */
Connection.prototype.shadowDom_ = null;

/**
 * Horizontal location of this connection.
 * @type {number}
 * @package
 */
Connection.prototype.x = 0;

/**
 * Vertical location of this connection.
 * @type {number}
 * @package
 */
Connection.prototype.y = 0;

/**
 * Connect two connections together.  This is the connection on the superior
 * block.
 * @param {!Connection} childConnection Connection on inferior block.
 * @protected
 */
Connection.prototype.connect_ = function(childConnection) {
  const INPUT = connectionTypes.INPUT_VALUE;
  const parentConnection = this;
  const parentBlock = parentConnection.getSourceBlock();
  const childBlock = childConnection.getSourceBlock();

  // Make sure the childConnection is available.
  if (childConnection.isConnected()) {
    childConnection.disconnect();
  }

  // Make sure the parentConnection is available.
  let orphan;
  if (parentConnection.isConnected()) {
    const shadowState = parentConnection.stashShadowState_();
    const target = parentConnection.targetBlock();
    if (target.isShadow()) {
      target.dispose(false);
    } else {
      parentConnection.disconnect();
      orphan = target;
    }
    parentConnection.applyShadowState_(shadowState);
  }

  // Connect the new connection to the parent.
  let event;
  if (Events.isEnabled()) {
    event = new (Events.get(Events.BLOCK_MOVE))(childBlock);
  }
  connectReciprocally(parentConnection, childConnection);
  childBlock.setParent(parentBlock);
  if (event) {
    event.recordNew();
    Events.fire(event);
  }

  // Deal with the orphan if it exists.
  if (orphan) {
    const orphanConnection = parentConnection.type === INPUT ?
        orphan.outputConnection :
        orphan.previousConnection;
    const connection = Connection.getConnectionForOrphanedConnection(
        childBlock, /** @type {!Connection} */ (orphanConnection));
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
Connection.prototype.dispose = function() {
  // isConnected returns true for shadows and non-shadows.
  if (this.isConnected()) {
    // Destroy the attached shadow block & its children (if it exists).
    this.setShadowStateInternal_();

    const targetBlock = this.targetBlock();
    if (targetBlock) {
      // Disconnect the attached normal block.
      targetBlock.unplug();
    }
  }

  this.disposed = true;
};

/**
 * Get the source block for this connection.
 * @return {!Block} The source block.
 */
Connection.prototype.getSourceBlock = function() {
  return this.sourceBlock_;
};

/**
 * Does the connection belong to a superior block (higher in the source stack)?
 * @return {boolean} True if connection faces down or right.
 */
Connection.prototype.isSuperior = function() {
  return this.type == connectionTypes.INPUT_VALUE ||
      this.type == connectionTypes.NEXT_STATEMENT;
};

/**
 * Is the connection connected?
 * @return {boolean} True if connection is connected to another connection.
 */
Connection.prototype.isConnected = function() {
  return !!this.targetConnection;
};

/**
 * Checks whether the current connection can connect with the target
 * connection.
 * @param {Connection} target Connection to check compatibility with.
 * @return {number} Connection.CAN_CONNECT if the connection is legal,
 *    an error code otherwise.
 * @deprecated July 2020. Will be deleted July 2021. Use the workspace's
 *     connectionChecker instead.
 */
Connection.prototype.canConnectWithReason = function(target) {
  deprecation.warn(
      'Connection.prototype.canConnectWithReason', 'July 2020', 'July 2021',
      'the workspace\'s connection checker');
  return this.getConnectionChecker().canConnectWithReason(this, target, false);
};

/**
 * Checks whether the current connection and target connection are compatible
 * and throws an exception if they are not.
 * @param {Connection} target The connection to check compatibility
 *    with.
 * @package
 * @deprecated July 2020. Will be deleted July 2021. Use the workspace's
 *     connectionChecker instead.
 */
Connection.prototype.checkConnection = function(target) {
  deprecation.warn(
      'Connection.prototype.checkConnection', 'July 2020', 'July 2021',
      'the workspace\'s connection checker');
  const checker = this.getConnectionChecker();
  const reason = checker.canConnectWithReason(this, target, false);
  if (reason != Connection.CAN_CONNECT) {
    throw new Error(checker.getErrorMessage(reason, this, target));
  }
};

/**
 * Get the workspace's connection type checker object.
 * @return {!IConnectionChecker} The connection type checker for the
 *     source block's workspace.
 * @package
 */
Connection.prototype.getConnectionChecker = function() {
  return this.sourceBlock_.workspace.connectionChecker;
};

/**
 * Check if the two connections can be dragged to connect to each other.
 * @param {!Connection} candidate A nearby connection to check.
 * @return {boolean} True if the connection is allowed, false otherwise.
 * @deprecated July 2020. Will be deleted July 2021. Use the workspace's
 *     connectionChecker instead.
 */
Connection.prototype.isConnectionAllowed = function(candidate) {
  deprecation.warn(
      'Connection.prototype.isConnectionAllowed', 'July 2020', 'July 2021',
      'the workspace\'s connection checker');
  return this.getConnectionChecker().canConnect(this, candidate, true);
};

/**
 * Called when an attempted connection fails. NOP by default (i.e. for headless
 * workspaces).
 * @param {!Connection} _otherConnection Connection that this connection
 *     failed to connect to.
 * @package
 */
Connection.prototype.onFailedConnect = function(_otherConnection) {
  // NOP
};

/**
 * Connect this connection to another connection.
 * @param {!Connection} otherConnection Connection to connect to.
 * @return {boolean} Whether the the blocks are now connected or not.
 */
Connection.prototype.connect = function(otherConnection) {
  if (this.targetConnection == otherConnection) {
    // Already connected together.  NOP.
    return true;
  }

  const checker = this.getConnectionChecker();
  if (checker.canConnect(this, otherConnection, false)) {
    const eventGroup = Events.getGroup();
    if (!eventGroup) {
      Events.setGroup(true);
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
      Events.setGroup(false);
    }
  }

  return this.isConnected();
};

/**
 * Update two connections to target each other.
 * @param {Connection} first The first connection to update.
 * @param {Connection} second The second connection to update.
 */
const connectReciprocally = function(first, second) {
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
 * @param {!Block} block The superior block.
 * @param {!Block} orphanBlock The inferior block.
 * @return {?Connection} The suitable connection point on 'block',
 *     or null.
 */
const getSingleConnection = function(block, orphanBlock) {
  let foundConnection = null;
  const output = orphanBlock.outputConnection;
  const typeChecker = output.getConnectionChecker();

  for (let i = 0, input; (input = block.inputList[i]); i++) {
    const connection = input.connection;
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
 * @param {!Block} startBlock The block on which to start the search.
 * @param {!Block} orphanBlock The block that is looking for a home.
 * @return {?Connection} The suitable connection point on the chain
 *     of blocks, or null.
 */
const getConnectionForOrphanedOutput = function(startBlock, orphanBlock) {
  let newBlock = startBlock;
  let connection;
  while (
      (connection = getSingleConnection(
           /** @type {!Block} */ (newBlock), orphanBlock))) {
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
 * @param {!Block} startBlock The block on which to start the search.
 * @param {!Connection} orphanConnection The connection that is looking
 *     for a home.
 * @return {?Connection} The suitable connection point on the chain of
 *     blocks, or null.
 */
Connection.getConnectionForOrphanedConnection = function(
    startBlock, orphanConnection) {
  if (orphanConnection.type === connectionTypes.OUTPUT_VALUE) {
    return getConnectionForOrphanedOutput(
        startBlock, orphanConnection.getSourceBlock());
  }
  // Otherwise we're dealing with a stack.
  const connection = startBlock.lastConnectionInStack(true);
  const checker = orphanConnection.getConnectionChecker();
  if (connection && checker.canConnect(orphanConnection, connection, false)) {
    return connection;
  }
  return null;
};

/**
 * Disconnect this connection.
 */
Connection.prototype.disconnect = function() {
  const otherConnection = this.targetConnection;
  if (!otherConnection) {
    throw Error('Source connection not connected.');
  }
  if (otherConnection.targetConnection != this) {
    throw Error('Target connection not connected to source connection.');
  }
  let parentBlock, childBlock, parentConnection;
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

  const eventGroup = Events.getGroup();
  if (!eventGroup) {
    Events.setGroup(true);
  }
  this.disconnectInternal_(parentBlock, childBlock);
  if (!childBlock.isShadow()) {
    // If we were disconnecting a shadow, no need to spawn a new one.
    parentConnection.respawnShadow_();
  }
  if (!eventGroup) {
    Events.setGroup(false);
  }
};

/**
 * Disconnect two blocks that are connected by this connection.
 * @param {!Block} parentBlock The superior block.
 * @param {!Block} childBlock The inferior block.
 * @protected
 */
Connection.prototype.disconnectInternal_ = function(parentBlock, childBlock) {
  let event;
  if (Events.isEnabled()) {
    event = new (Events.get(Events.BLOCK_MOVE))(childBlock);
  }
  const otherConnection = this.targetConnection;
  otherConnection.targetConnection = null;
  this.targetConnection = null;
  childBlock.setParent(null);
  if (event) {
    event.recordNew();
    Events.fire(event);
  }
};

/**
 * Respawn the shadow block if there was one connected to the this connection.
 * @protected
 */
Connection.prototype.respawnShadow_ = function() {
  // Have to keep respawnShadow_ for backwards compatibility.
  this.createShadowBlock_(true);
};

/**
 * Returns the block that this connection connects to.
 * @return {?Block} The connected block or null if none is connected.
 */
Connection.prototype.targetBlock = function() {
  if (this.isConnected()) {
    return this.targetConnection.getSourceBlock();
  }
  return null;
};

/**
 * Is this connection compatible with another connection with respect to the
 * value type system.  E.g. square_root("Hello") is not compatible.
 * @param {!Connection} otherConnection Connection to compare against.
 * @return {boolean} True if the connections share a type.
 * @deprecated July 2020. Will be deleted July 2021. Use the workspace's
 *     connectionChecker instead.
 */
Connection.prototype.checkType = function(otherConnection) {
  deprecation.warn(
      'Connection.prototype.checkType', 'October 2019', 'January 2021',
      'the workspace\'s connection checker');
  return this.getConnectionChecker().canConnect(this, otherConnection, false);
};

/**
 * Is this connection compatible with another connection with respect to the
 * value type system.  E.g. square_root("Hello") is not compatible.
 * @param {!Connection} otherConnection Connection to compare against.
 * @return {boolean} True if the connections share a type.
 * @private
 * @deprecated October 2019. Will be deleted January 2021. Use the workspace's
 *     connectionChecker instead.
 * @suppress {unusedPrivateMembers}
 */
Connection.prototype.checkType_ = function(otherConnection) {
  deprecation.warn(
      'Connection.prototype.checkType_', 'October 2019', 'January 2021',
      'the workspace\'s connection checker');
  return this.checkType(otherConnection);
};

/**
 * Function to be called when this connection's compatible types have changed.
 * @protected
 */
Connection.prototype.onCheckChanged_ = function() {
  // The new value type may not be compatible with the existing connection.
  if (this.isConnected() &&
      (!this.targetConnection ||
       !this.getConnectionChecker().canConnect(
           this, this.targetConnection, false))) {
    const child = this.isSuperior() ? this.targetBlock() : this.sourceBlock_;
    child.unplug();
  }
};

/**
 * Change a connection's compatibility.
 * @param {?(string|!Array<string>)} check Compatible value type or list of
 *     value types. Null if all types are compatible.
 * @return {!Connection} The connection being modified
 *     (to allow chaining).
 */
Connection.prototype.setCheck = function(check) {
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
Connection.prototype.getCheck = function() {
  return this.check_;
};

/**
 * Changes the connection's shadow block.
 * @param {?Element} shadowDom DOM representation of a block or null.
 */
Connection.prototype.setShadowDom = function(shadowDom) {
  this.setShadowStateInternal_({shadowDom: shadowDom});
};

/**
 * Returns the xml representation of the connection's shadow block.
 * @param {boolean=} returnCurrent If true, and the shadow block is currently
 *     attached to this connection, this serializes the state of that block
 *     and returns it (so that field values are correct). Otherwise the saved
 *     shadowDom is just returned.
 * @return {?Element} Shadow DOM representation of a block or null.
 */
Connection.prototype.getShadowDom = function(returnCurrent) {
  return (returnCurrent && this.targetBlock().isShadow()) ?
      /** @type {!Element} */ (Xml.blockToDom(
          /** @type {!Block} */ (this.targetBlock()))) :
      this.shadowDom_;
};

/**
 * Changes the connection's shadow block.
 * @param {?blocks.State} shadowState An state represetation of the block or
 *     null.
 */
Connection.prototype.setShadowState = function(shadowState) {
  this.setShadowStateInternal_({shadowState: shadowState});
};

/**
 * Returns the serialized object representation of the connection's shadow
 * block.
 * @param {boolean=} returnCurrent If true, and the shadow block is currently
 *     attached to this connection, this serializes the state of that block
 *     and returns it (so that field values are correct). Otherwise the saved
 *     state is just returned.
 * @return {?blocks.State} Serialized object representation of the block, or
 *     null.
 */
Connection.prototype.getShadowState = function(returnCurrent) {
  if (returnCurrent && this.targetBlock() && this.targetBlock().isShadow()) {
    return blocks.save(/** @type {!Block} */ (this.targetBlock()));
  }
  return this.shadowState_;
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
 * @return {!Array<!Connection>} List of connections.
 * @package
 */
Connection.prototype.neighbours = function(_maxLimit) {
  return [];
};

/**
 * Get the parent input of a connection.
 * @return {?Input} The input that the connection belongs to or null if
 *     no parent exists.
 * @package
 */
Connection.prototype.getParentInput = function() {
  let parentInput = null;
  const inputs = this.sourceBlock_.inputList;
  for (let i = 0; i < inputs.length; i++) {
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
Connection.prototype.toString = function() {
  const block = this.sourceBlock_;
  if (!block) {
    return 'Orphan Connection';
  }
  let msg;
  if (block.outputConnection == this) {
    msg = 'Output Connection of ';
  } else if (block.previousConnection == this) {
    msg = 'Previous Connection of ';
  } else if (block.nextConnection == this) {
    msg = 'Next Connection of ';
  } else {
    let parentInput = null;
    for (let i = 0, input; (input = block.inputList[i]); i++) {
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

/**
 * Returns the state of the shadowDom_ and shadowState_ properties, then
 * temporarily sets those properties to null so no shadow respawns.
 * @return {{shadowDom: ?Element, shadowState: ?blocks.State}} The state of both
 *     the shadowDom_ and shadowState_ properties.
 * @private
 */
Connection.prototype.stashShadowState_ = function() {
  const shadowDom = this.getShadowDom(true);
  const shadowState = this.getShadowState(true);
  // Set to null so it doesn't respawn.
  this.shadowDom_ = null;
  this.shadowState_ = null;
  return {shadowDom, shadowState};
};

/**
 * Reapplies the stashed state of the shadowDom_ and shadowState_ properties.
 * @param {{shadowDom: ?Element, shadowState: ?blocks.State}} param0 The state
 *     to reapply to the shadowDom_ and shadowState_ properties.
 * @private
 */
Connection.prototype.applyShadowState_ =
    function({shadowDom, shadowState}) {
      this.shadowDom_ = shadowDom;
      this.shadowState_ = shadowState;
    };

/**
 * Sets the state of the shadow of this connection.
 * @param {{shadowDom: (?Element|undefined), shadowState:
 *     (?blocks.State|undefined)}=} param0 The state to set the shadow of this
 *     connection to.
 * @private
 */
Connection.prototype.setShadowStateInternal_ =
    function({shadowDom = null, shadowState = null} = {}) {
      // One or both of these should always be null.
      // If neither is null, the shadowState will get priority.
      this.shadowDom_ = shadowDom;
      this.shadowState_ = shadowState;

      const target = this.targetBlock();
      if (!target) {
        this.respawnShadow_();
        if (this.targetBlock() && this.targetBlock().isShadow()) {
          this.serializeShadow_(this.targetBlock());
        }
      } else if (target.isShadow()) {
        target.dispose(false);
        this.respawnShadow_();
        if (this.targetBlock() && this.targetBlock().isShadow()) {
          this.serializeShadow_(this.targetBlock());
        }
      } else {
        const shadow = this.createShadowBlock_(false);
        this.serializeShadow_(shadow);
        if (shadow) {
          shadow.dispose(false);
        }
      }
    };

/**
 * Creates a shadow block based on the current shadowState_ or shadowDom_.
 * shadowState_ gets priority.
 * @param {boolean} attemptToConnect Whether to try to connect the shadow block
 *     to this connection or not.
 * @return {?Block} The shadow block that was created, or null if both the
 *     shadowState_ and shadowDom_ are null.
 * @private
 */
Connection.prototype.createShadowBlock_ = function(attemptToConnect) {
  const parentBlock = this.getSourceBlock();
  const shadowState = this.getShadowState();
  const shadowDom = this.getShadowDom();
  if (!parentBlock.workspace || (!shadowState && !shadowDom)) {
    return null;
  }

  let blockShadow;
  if (shadowState) {
    blockShadow = blocks.loadInternal(
        shadowState,
        parentBlock.workspace,
        attemptToConnect ? this : undefined,
        true);
    return blockShadow;
  }
  
  if (shadowDom) {
    blockShadow = Xml.domToBlock(shadowDom, parentBlock.workspace);
    if (attemptToConnect) {
      if (this.type == Blockly.connectionTypes.INPUT_VALUE) {
        if (!blockShadow.outputConnection) {
          throw new Error('Shadow block is missing an output connection');
        }
        if (!this.connect(blockShadow.outputConnection)) {
          throw new Error('Could not connect shadow block to connection');
        }
      } else if (this.type == Blockly.connectionTypes.NEXT_STATEMENT) {
        if (!blockShadow.previousConnection) {
          throw new Error('Shadow block is missing previous connection');
        }
        if (!this.connect(blockShadow.previousConnection)) {
          throw new Error('Could not connect shadow block to connection');
        }
      } else {
        throw new Error(
            'Cannot connect a shadow block to a previous/output connection');
      }
    }
    return blockShadow;
  }
  return null;
};

/**
 * Saves the given shadow block to both the shadowDom_ and shadowState_
 * properties, in their respective serialized forms.
 * @param {?Block} shadow The shadow to serialize, or null.
 * @private
 */
Connection.prototype.serializeShadow_ = function(shadow) {
  if (!shadow) {
    return;
  }
  this.shadowDom_ = /** @type {!Element} */ (Xml.blockToDom(shadow));
  this.shadowState_ = blocks.save(shadow);
};

exports = Connection;
