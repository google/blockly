/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing one block.
 */
'use strict';

/**
 * The class representing one block.
 * @class
 */
goog.module('Blockly.Block');

/* eslint-disable-next-line no-unused-vars */
const Abstract = goog.requireType('Blockly.Events.Abstract');
const Extensions = goog.require('Blockly.Extensions');
const Tooltip = goog.require('Blockly.Tooltip');
const arrayUtils = goog.require('Blockly.utils.array');
const common = goog.require('Blockly.common');
const constants = goog.require('Blockly.constants');
const eventUtils = goog.require('Blockly.Events.utils');
const fieldRegistry = goog.require('Blockly.fieldRegistry');
const idGenerator = goog.require('Blockly.utils.idGenerator');
const object = goog.require('Blockly.utils.object');
const parsing = goog.require('Blockly.utils.parsing');
const {Align, Input} = goog.require('Blockly.Input');
const {ASTNode} = goog.require('Blockly.ASTNode');
const {Blocks} = goog.require('Blockly.blocks');
/* eslint-disable-next-line no-unused-vars */
const {Comment} = goog.requireType('Blockly.Comment');
const {ConnectionType} = goog.require('Blockly.ConnectionType');
const {Connection} = goog.require('Blockly.Connection');
const {Coordinate} = goog.require('Blockly.utils.Coordinate');
/* eslint-disable-next-line no-unused-vars */
const {Field} = goog.requireType('Blockly.Field');
/* eslint-disable-next-line no-unused-vars */
const {IASTNodeLocation} = goog.require('Blockly.IASTNodeLocation');
/* eslint-disable-next-line no-unused-vars */
const {IDeletable} = goog.require('Blockly.IDeletable');
/* eslint-disable-next-line no-unused-vars */
const {Mutator} = goog.requireType('Blockly.Mutator');
const {Size} = goog.require('Blockly.utils.Size');
/* eslint-disable-next-line no-unused-vars */
const {VariableModel} = goog.requireType('Blockly.VariableModel');
/* eslint-disable-next-line no-unused-vars */
const {Workspace} = goog.requireType('Blockly.Workspace');
const {inputTypes} = goog.require('Blockly.inputTypes');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockChange');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockCreate');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockDelete');
/** @suppress {extraRequire} */
goog.require('Blockly.Events.BlockMove');


/**
 * Class for one block.
 * Not normally called directly, workspace.newBlock() is preferred.
 * @param {!Workspace} workspace The block's workspace.
 * @param {!string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new ID.
 * @constructor
 * @implements {IASTNodeLocation}
 * @implements {IDeletable}
 * @throws When the prototypeName is not valid or not allowed.
 * @alias Blockly.Block
 */
const Block = function(workspace, prototypeName, opt_id) {
  const {Generator} = goog.module.get('Blockly.Generator');
  if (Generator && typeof Generator.prototype[prototypeName] !== 'undefined') {
    // Occluding Generator class members is not allowed.
    throw Error(
        'Block prototypeName "' + prototypeName +
        '" conflicts with Blockly.Generator members.');
  }

  /** @type {string} */
  this.id = (opt_id && !workspace.getBlockById(opt_id)) ? opt_id :
                                                          idGenerator.genUid();
  workspace.setBlockById(this.id, this);
  /** @type {Connection} */
  this.outputConnection = null;
  /** @type {Connection} */
  this.nextConnection = null;
  /** @type {Connection} */
  this.previousConnection = null;
  /** @type {!Array<!Input>} */
  this.inputList = [];
  /** @type {boolean|undefined} */
  this.inputsInline = undefined;
  /**
   * @type {boolean}
   * @private
   */
  this.disabled = false;
  /** @type {!Tooltip.TipInfo} */
  this.tooltip = '';
  /** @type {boolean} */
  this.contextMenu = true;

  /**
   * @type {Block}
   * @protected
   */
  this.parentBlock_ = null;

  /**
   * @type {!Array<!Block>}
   * @protected
   */
  this.childBlocks_ = [];

  /**
   * @type {boolean}
   * @private
   */
  this.deletable_ = true;

  /**
   * @type {boolean}
   * @private
   */
  this.movable_ = true;

  /**
   * @type {boolean}
   * @private
   */
  this.editable_ = true;

  /**
   * @type {boolean}
   * @private
   */
  this.isShadow_ = false;

  /**
   * @type {boolean}
   * @protected
   */
  this.collapsed_ = false;

  /**
   * @type {?number}
   * @protected
   */
  this.outputShape_ = null;

  /**
   * A string representing the comment attached to this block.
   * @type {string|Comment}
   * @deprecated August 2019. Use getCommentText instead.
   */
  this.comment = null;

  /**
   * A model of the comment attached to this block.
   * @type {!Block.CommentModel}
   * @package
   */
  this.commentModel = {text: null, pinned: false, size: new Size(160, 80)};

  /**
   * The block's position in workspace units.  (0, 0) is at the workspace's
   * origin; scale does not change this value.
   * @type {!Coordinate}
   * @private
   */
  this.xy_ = new Coordinate(0, 0);

  /** @type {!Workspace} */
  this.workspace = workspace;
  /** @type {boolean} */
  this.isInFlyout = workspace.isFlyout;
  /** @type {boolean} */
  this.isInMutator = workspace.isMutator;

  /** @type {boolean} */
  this.RTL = workspace.RTL;

  /**
   * True if this block is an insertion marker.
   * @type {boolean}
   * @protected
   */
  this.isInsertionMarker_ = false;

  /**
   * Name of the type of hat.
   * @type {string|undefined}
   */
  this.hat = undefined;

  /** @type {?boolean} */
  this.rendered = null;

  /**
   * A count of statement inputs on the block.
   * @type {number}
   * @package
   */
  this.statementInputCount = 0;

  // Copy the type-specific functions and data from the prototype.
  if (prototypeName) {
    /** @type {string} */
    this.type = prototypeName;
    const prototype = Blocks[prototypeName];
    if (!prototype || typeof prototype !== 'object') {
      throw TypeError('Unknown block type: ' + prototypeName);
    }
    object.mixin(this, prototype);
  }

  workspace.addTopBlock(this);
  workspace.addTypedBlock(this);

  // All events fired should be part of the same group.
  // Any events fired during init should not be undoable,
  // so that block creation is atomic.
  const existingGroup = eventUtils.getGroup();
  if (!existingGroup) {
    eventUtils.setGroup(true);
  }
  const initialUndoFlag = eventUtils.getRecordUndo();

  try {
    // Call an initialization function, if it exists.
    if (typeof this.init === 'function') {
      eventUtils.setRecordUndo(false);
      this.init();
      eventUtils.setRecordUndo(initialUndoFlag);
    }

    // Fire a create event.
    if (eventUtils.isEnabled()) {
      eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_CREATE))(this));
    }
  } finally {
    if (!existingGroup) {
      eventUtils.setGroup(false);
    }
    // In case init threw, recordUndo flag should still be reset.
    eventUtils.setRecordUndo(initialUndoFlag);
  }

  // Record initial inline state.
  /** @type {boolean|undefined} */
  this.inputsInlineDefault = this.inputsInline;

  // Bind an onchange function, if it exists.
  if (typeof this.onchange === 'function') {
    this.setOnChange(this.onchange);
  }
};

/**
 * @typedef {{
 *            text:?string,
 *            pinned:boolean,
 *            size:Size
 *          }}
 */
Block.CommentModel;

/**
 * The language-neutral ID given to the collapsed input.
 * @const {string}
 */
Block.COLLAPSED_INPUT_NAME = constants.COLLAPSED_INPUT_NAME;

/**
 * The language-neutral ID given to the collapsed field.
 * @const {string}
 */
Block.COLLAPSED_FIELD_NAME = constants.COLLAPSED_FIELD_NAME;

/**
 * Optional text data that round-trips between blocks and XML.
 * Has no effect. May be used by 3rd parties for meta information.
 * @type {?string}
 */
Block.prototype.data = null;

/**
 * Has this block been disposed of?
 * @type {boolean}
 * @package
 */
Block.prototype.disposed = false;

/**
 * Colour of the block as HSV hue value (0-360)
 * This may be null if the block colour was not set via a hue number.
 * @type {?number}
 * @private
 */
Block.prototype.hue_ = null;

/**
 * Colour of the block in '#RRGGBB' format.
 * @type {string}
 * @protected
 */
Block.prototype.colour_ = '#000000';

/**
 * Name of the block style.
 * @type {string}
 * @protected
 */
Block.prototype.styleName_ = '';

/**
 * An optional method called during initialization.
 * @type {?function()}
 */
Block.prototype.init;

/**
 * An optional callback method to use whenever the block's parent workspace
 * changes. This is usually only called from the constructor, the block type
 * initializer function, or an extension initializer function.
 * @type {?function(Abstract)}
 */
Block.prototype.onchange;

/**
 * An optional serialization method for defining how to serialize the
 * mutation state to XML. This must be coupled with defining `domToMutation`.
 * @type {?function(...):!Element}
 */
Block.prototype.mutationToDom;

/**
 * An optional deserialization method for defining how to deserialize the
 * mutation state from XML. This must be coupled with defining `mutationToDom`.
 * @type {?function(!Element)}
 */
Block.prototype.domToMutation;

/**
 * An optional serialization method for defining how to serialize the block's
 * extra state (eg mutation state) to something JSON compatible. This must be
 * coupled with defining `loadExtraState`.
 * @type {?function(): *}
 */
Block.prototype.saveExtraState;

/**
 * An optional serialization method for defining how to deserialize the block's
 * extra state (eg mutation state) from something JSON compatible. This must be
 * coupled with defining `saveExtraState`.
 * @type {?function(*)}
 */
Block.prototype.loadExtraState;

/**
 * An optional property for suppressing adding STATEMENT_PREFIX and
 * STATEMENT_SUFFIX to generated code.
 * @type {?boolean}
 */
Block.prototype.suppressPrefixSuffix;

/**
 * An optional property for declaring developer variables.  Return a list of
 * variable names for use by generators.  Developer variables are never shown to
 * the user, but are declared as global variables in the generated code.
 * @type {?function():!Array<string>}
 */
Block.prototype.getDeveloperVariables;

/**
 * Dispose of this block.
 * @param {boolean} healStack If true, then try to heal any gap by connecting
 *     the next statement with the previous statement.  Otherwise, dispose of
 *     all children of this block.
 * @suppress {checkTypes}
 */
Block.prototype.dispose = function(healStack) {
  if (!this.workspace) {
    // Already deleted.
    return;
  }
  // Terminate onchange event calls.
  if (this.onchangeWrapper_) {
    this.workspace.removeChangeListener(this.onchangeWrapper_);
  }

  this.unplug(healStack);
  if (eventUtils.isEnabled()) {
    eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_DELETE))(this));
  }
  eventUtils.disable();

  try {
    // This block is now at the top of the workspace.
    // Remove this block from the workspace's list of top-most blocks.
    if (this.workspace) {
      this.workspace.removeTopBlock(this);
      this.workspace.removeTypedBlock(this);
      // Remove from block database.
      this.workspace.removeBlockById(this.id);
      this.workspace = null;
    }

    // Just deleting this block from the DOM would result in a memory leak as
    // well as corruption of the connection database.  Therefore we must
    // methodically step through the blocks and carefully disassemble them.

    if (common.getSelected() === this) {
      common.setSelected(null);
    }

    // First, dispose of all my children.
    for (let i = this.childBlocks_.length - 1; i >= 0; i--) {
      this.childBlocks_[i].dispose(false);
    }
    // Then dispose of myself.
    // Dispose of all inputs and their fields.
    for (let i = 0, input; (input = this.inputList[i]); i++) {
      input.dispose();
    }
    this.inputList.length = 0;
    // Dispose of any remaining connections (next/previous/output).
    const connections = this.getConnections_(true);
    for (let i = 0, connection; (connection = connections[i]); i++) {
      connection.dispose();
    }
  } finally {
    eventUtils.enable();
    this.disposed = true;
  }
};

/**
 * Call initModel on all fields on the block.
 * May be called more than once.
 * Either initModel or initSvg must be called after creating a block and before
 * the first interaction with it.  Interactions include UI actions
 * (e.g. clicking and dragging) and firing events (e.g. create, delete, and
 * change).
 * @public
 */
Block.prototype.initModel = function() {
  for (let i = 0, input; (input = this.inputList[i]); i++) {
    for (let j = 0, field; (field = input.fieldRow[j]); j++) {
      if (field.initModel) {
        field.initModel();
      }
    }
  }
};

/**
 * Unplug this block from its superior block.  If this block is a statement,
 * optionally reconnect the block underneath with the block on top.
 * @param {boolean=} opt_healStack Disconnect child statement and reconnect
 *   stack.  Defaults to false.
 */
Block.prototype.unplug = function(opt_healStack) {
  if (this.outputConnection) {
    this.unplugFromRow_(opt_healStack);
  }
  if (this.previousConnection) {
    this.unplugFromStack_(opt_healStack);
  }
};

/**
 * Unplug this block's output from an input on another block.  Optionally
 * reconnect the block's parent to the only child block, if possible.
 * @param {boolean=} opt_healStack Disconnect right-side block and connect to
 *     left-side block.  Defaults to false.
 * @private
 */
Block.prototype.unplugFromRow_ = function(opt_healStack) {
  let parentConnection = null;
  if (this.outputConnection.isConnected()) {
    parentConnection = this.outputConnection.targetConnection;
    // Disconnect from any superior block.
    this.outputConnection.disconnect();
  }

  // Return early in obvious cases.
  if (!parentConnection || !opt_healStack) {
    return;
  }

  const thisConnection = this.getOnlyValueConnection_();
  if (!thisConnection || !thisConnection.isConnected() ||
      thisConnection.targetBlock().isShadow()) {
    // Too many or too few possible connections on this block, or there's
    // nothing on the other side of this connection.
    return;
  }

  const childConnection = thisConnection.targetConnection;
  // Disconnect the child block.
  childConnection.disconnect();
  // Connect child to the parent if possible, otherwise bump away.
  if (this.workspace.connectionChecker.canConnect(
          childConnection, parentConnection, false)) {
    parentConnection.connect(childConnection);
  } else {
    childConnection.onFailedConnect(parentConnection);
  }
};

/**
 * Returns the connection on the value input that is connected to another block.
 * When an insertion marker is connected to a connection with a block already
 * attached, the connected block is attached to the insertion marker.
 * Since only one block can be displaced and attached to the insertion marker
 * this should only ever return one connection.
 *
 * @return {?Connection} The connection on the value input, or null.
 * @private
 */
Block.prototype.getOnlyValueConnection_ = function() {
  let connection = null;
  for (let i = 0; i < this.inputList.length; i++) {
    const thisConnection = this.inputList[i].connection;
    if (thisConnection && thisConnection.type === ConnectionType.INPUT_VALUE &&
        thisConnection.targetConnection) {
      if (connection) {
        return null;  // More than one value input found.
      }
      connection = thisConnection;
    }
  }
  return connection;
};

/**
 * Unplug this statement block from its superior block.  Optionally reconnect
 * the block underneath with the block on top.
 * @param {boolean=} opt_healStack Disconnect child statement and reconnect
 *   stack.  Defaults to false.
 * @private
 */
Block.prototype.unplugFromStack_ = function(opt_healStack) {
  let previousTarget = null;
  if (this.previousConnection.isConnected()) {
    // Remember the connection that any next statements need to connect to.
    previousTarget = this.previousConnection.targetConnection;
    // Detach this block from the parent's tree.
    this.previousConnection.disconnect();
  }
  const nextBlock = this.getNextBlock();
  if (opt_healStack && nextBlock && !nextBlock.isShadow()) {
    // Disconnect the next statement.
    const nextTarget = this.nextConnection.targetConnection;
    nextTarget.disconnect();
    if (previousTarget &&
        this.workspace.connectionChecker.canConnect(
            previousTarget, nextTarget, false)) {
      // Attach the next statement to the previous statement.
      previousTarget.connect(nextTarget);
    }
  }
};

/**
 * Returns all connections originating from this block.
 * @param {boolean} _all If true, return all connections even hidden ones.
 * @return {!Array<!Connection>} Array of connections.
 * @package
 */
Block.prototype.getConnections_ = function(_all) {
  const myConnections = [];
  if (this.outputConnection) {
    myConnections.push(this.outputConnection);
  }
  if (this.previousConnection) {
    myConnections.push(this.previousConnection);
  }
  if (this.nextConnection) {
    myConnections.push(this.nextConnection);
  }
  for (let i = 0, input; (input = this.inputList[i]); i++) {
    if (input.connection) {
      myConnections.push(input.connection);
    }
  }
  return myConnections;
};

/**
 * Walks down a stack of blocks and finds the last next connection on the stack.
 * @param {boolean} ignoreShadows If true,the last connection on a non-shadow
 *     block will be returned. If false, this will follow shadows to find the
 *     last connection.
 * @return {?Connection} The last next connection on the stack, or null.
 * @package
 */
Block.prototype.lastConnectionInStack = function(ignoreShadows) {
  let nextConnection = this.nextConnection;
  while (nextConnection) {
    const nextBlock = nextConnection.targetBlock();
    if (!nextBlock || (ignoreShadows && nextBlock.isShadow())) {
      return nextConnection;
    }
    nextConnection = nextBlock.nextConnection;
  }
  return null;
};

/**
 * Bump unconnected blocks out of alignment.  Two blocks which aren't actually
 * connected should not coincidentally line up on screen.
 */
Block.prototype.bumpNeighbours = function() {
  // noop.
};

/**
 * Return the parent block or null if this block is at the top level. The parent
 * block is either the block connected to the previous connection (for a
 * statement block) or the block connected to the output connection (for a value
 * block).
 * @return {?Block} The block (if any) that holds the current block.
 */
Block.prototype.getParent = function() {
  return this.parentBlock_;
};

/**
 * Return the input that connects to the specified block.
 * @param {!Block} block A block connected to an input on this block.
 * @return {?Input} The input (if any) that connects to the specified
 *     block.
 */
Block.prototype.getInputWithBlock = function(block) {
  for (let i = 0, input; (input = this.inputList[i]); i++) {
    if (input.connection && input.connection.targetBlock() === block) {
      return input;
    }
  }
  return null;
};

/**
 * Return the parent block that surrounds the current block, or null if this
 * block has no surrounding block.  A parent block might just be the previous
 * statement, whereas the surrounding block is an if statement, while loop, etc.
 * @return {?Block} The block (if any) that surrounds the current block.
 */
Block.prototype.getSurroundParent = function() {
  let block = this;
  let prevBlock;
  do {
    prevBlock = block;
    block = block.getParent();
    if (!block) {
      // Ran off the top.
      return null;
    }
  } while (block.getNextBlock() === prevBlock);
  // This block is an enclosing parent, not just a statement in a stack.
  return block;
};

/**
 * Return the next statement block directly connected to this block.
 * @return {?Block} The next statement block or null.
 */
Block.prototype.getNextBlock = function() {
  return this.nextConnection && this.nextConnection.targetBlock();
};

/**
 * Returns the block connected to the previous connection.
 * @return {?Block} The previous statement block or null.
 */
Block.prototype.getPreviousBlock = function() {
  return this.previousConnection && this.previousConnection.targetBlock();
};

/**
 * Return the connection on the first statement input on this block, or null if
 * there are none.
 * @return {?Connection} The first statement connection or null.
 * @package
 */
Block.prototype.getFirstStatementConnection = function() {
  for (let i = 0, input; (input = this.inputList[i]); i++) {
    if (input.connection &&
        input.connection.type === ConnectionType.NEXT_STATEMENT) {
      return input.connection;
    }
  }
  return null;
};

/**
 * Return the top-most block in this block's tree.
 * This will return itself if this block is at the top level.
 * @return {!Block} The root block.
 */
Block.prototype.getRootBlock = function() {
  let rootBlock;
  let block = this;
  do {
    rootBlock = block;
    block = rootBlock.parentBlock_;
  } while (block);
  return rootBlock;
};

/**
 * Walk up from the given block up through the stack of blocks to find
 * the top block of the sub stack. If we are nested in a statement input only
 * find the top-most nested block. Do not go all the way to the root block.
 * @return {!Block} The top block in a stack.
 * @package
 */
Block.prototype.getTopStackBlock = function() {
  let block = this;
  let previous;
  do {
    previous = block.getPreviousBlock();
  } while (previous && previous.getNextBlock() === block && (block = previous));
  return block;
};

/**
 * Find all the blocks that are directly nested inside this one.
 * Includes value and statement inputs, as well as any following statement.
 * Excludes any connection on an output tab or any preceding statement.
 * Blocks are optionally sorted by position; top to bottom.
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array<!Block>} Array of blocks.
 */
Block.prototype.getChildren = function(ordered) {
  if (!ordered) {
    return this.childBlocks_;
  }
  const blocks = [];
  for (let i = 0, input; (input = this.inputList[i]); i++) {
    if (input.connection) {
      const child = input.connection.targetBlock();
      if (child) {
        blocks.push(child);
      }
    }
  }
  const next = this.getNextBlock();
  if (next) {
    blocks.push(next);
  }
  return blocks;
};

/**
 * Set parent of this block to be a new block or null.
 * @param {Block} newParent New parent block.
 * @package
 */
Block.prototype.setParent = function(newParent) {
  if (newParent === this.parentBlock_) {
    return;
  }

  // Check that block is connected to new parent if new parent is not null and
  //    that block is not connected to superior one if new parent is null.
  const targetBlock =
      (this.previousConnection && this.previousConnection.targetBlock()) ||
      (this.outputConnection && this.outputConnection.targetBlock());
  const isConnected = !!targetBlock;

  if (isConnected && newParent && targetBlock !== newParent) {
    throw Error('Block connected to superior one that is not new parent.');
  } else if (!isConnected && newParent) {
    throw Error('Block not connected to new parent.');
  } else if (isConnected && !newParent) {
    throw Error(
        'Cannot set parent to null while block is still connected to' +
        ' superior block.');
  }

  if (this.parentBlock_) {
    // Remove this block from the old parent's child list.
    arrayUtils.removeElem(this.parentBlock_.childBlocks_, this);

    // This block hasn't actually moved on-screen, so there's no need to update
    //     its connection locations.
  } else {
    // New parent must be non-null so remove this block from the workspace's
    //     list of top-most blocks.
    this.workspace.removeTopBlock(this);
  }

  this.parentBlock_ = newParent;
  if (newParent) {
    // Add this block to the new parent's child list.
    newParent.childBlocks_.push(this);
  } else {
    this.workspace.addTopBlock(this);
  }
};

/**
 * Find all the blocks that are directly or indirectly nested inside this one.
 * Includes this block in the list.
 * Includes value and statement inputs, as well as any following statements.
 * Excludes any connection on an output tab or any preceding statements.
 * Blocks are optionally sorted by position; top to bottom.
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array<!Block>} Flattened array of blocks.
 */
Block.prototype.getDescendants = function(ordered) {
  const blocks = [this];
  const childBlocks = this.getChildren(ordered);
  for (let child, i = 0; (child = childBlocks[i]); i++) {
    blocks.push.apply(blocks, child.getDescendants(ordered));
  }
  return blocks;
};

/**
 * Get whether this block is deletable or not.
 * @return {boolean} True if deletable.
 */
Block.prototype.isDeletable = function() {
  return this.deletable_ && !this.isShadow_ &&
      !(this.workspace && this.workspace.options.readOnly);
};

/**
 * Set whether this block is deletable or not.
 * @param {boolean} deletable True if deletable.
 */
Block.prototype.setDeletable = function(deletable) {
  this.deletable_ = deletable;
};

/**
 * Get whether this block is movable or not.
 * @return {boolean} True if movable.
 */
Block.prototype.isMovable = function() {
  return this.movable_ && !this.isShadow_ &&
      !(this.workspace && this.workspace.options.readOnly);
};

/**
 * Set whether this block is movable or not.
 * @param {boolean} movable True if movable.
 */
Block.prototype.setMovable = function(movable) {
  this.movable_ = movable;
};

/**
 * Get whether is block is duplicatable or not. If duplicating this block and
 * descendants will put this block over the workspace's capacity this block is
 * not duplicatable. If duplicating this block and descendants will put any
 * type over their maxInstances this block is not duplicatable.
 * @return {boolean} True if duplicatable.
 */
Block.prototype.isDuplicatable = function() {
  if (!this.workspace.hasBlockLimits()) {
    return true;
  }
  return this.workspace.isCapacityAvailable(
      common.getBlockTypeCounts(this, true));
};

/**
 * Get whether this block is a shadow block or not.
 * @return {boolean} True if a shadow.
 */
Block.prototype.isShadow = function() {
  return this.isShadow_;
};

/**
 * Set whether this block is a shadow block or not.
 * @param {boolean} shadow True if a shadow.
 * @package
 */
Block.prototype.setShadow = function(shadow) {
  this.isShadow_ = shadow;
};

/**
 * Get whether this block is an insertion marker block or not.
 * @return {boolean} True if an insertion marker.
 */
Block.prototype.isInsertionMarker = function() {
  return this.isInsertionMarker_;
};

/**
 * Set whether this block is an insertion marker block or not.
 * Once set this cannot be unset.
 * @param {boolean} insertionMarker True if an insertion marker.
 * @package
 */
Block.prototype.setInsertionMarker = function(insertionMarker) {
  this.isInsertionMarker_ = insertionMarker;
};

/**
 * Get whether this block is editable or not.
 * @return {boolean} True if editable.
 */
Block.prototype.isEditable = function() {
  return this.editable_ && !(this.workspace && this.workspace.options.readOnly);
};

/**
 * Set whether this block is editable or not.
 * @param {boolean} editable True if editable.
 */
Block.prototype.setEditable = function(editable) {
  this.editable_ = editable;
  for (let i = 0, input; (input = this.inputList[i]); i++) {
    for (let j = 0, field; (field = input.fieldRow[j]); j++) {
      field.updateEditable();
    }
  }
};

/**
 * Returns if this block has been disposed of / deleted.
 * @return {boolean} True if this block has been disposed of / deleted.
 */
Block.prototype.isDisposed = function() {
  return this.disposed;
};

/**
 * Find the connection on this block that corresponds to the given connection
 * on the other block.
 * Used to match connections between a block and its insertion marker.
 * @param {!Block} otherBlock The other block to match against.
 * @param {!Connection} conn The other connection to match.
 * @return {?Connection} The matching connection on this block, or null.
 * @package
 */
Block.prototype.getMatchingConnection = function(otherBlock, conn) {
  const connections = this.getConnections_(true);
  const otherConnections = otherBlock.getConnections_(true);
  if (connections.length !== otherConnections.length) {
    throw Error('Connection lists did not match in length.');
  }
  for (let i = 0; i < otherConnections.length; i++) {
    if (otherConnections[i] === conn) {
      return connections[i];
    }
  }
  return null;
};

/**
 * Set the URL of this block's help page.
 * @param {string|Function} url URL string for block help, or function that
 *     returns a URL.  Null for no help.
 */
Block.prototype.setHelpUrl = function(url) {
  this.helpUrl = url;
};

/**
 * Sets the tooltip for this block.
 * @param {!Tooltip.TipInfo} newTip The text for the tooltip, a function
 *     that returns the text for the tooltip, or a parent object whose tooltip
 *     will be used. To not display a tooltip pass the empty string.
 */
Block.prototype.setTooltip = function(newTip) {
  this.tooltip = newTip;
};

/**
 * Returns the tooltip text for this block.
 * @return {!string} The tooltip text for this block.
 */
Block.prototype.getTooltip = function() {
  return Tooltip.getTooltipOfObject(this);
};

/**
 * Get the colour of a block.
 * @return {string} #RRGGBB string.
 */
Block.prototype.getColour = function() {
  return this.colour_;
};

/**
 * Get the name of the block style.
 * @return {string} Name of the block style.
 */
Block.prototype.getStyleName = function() {
  return this.styleName_;
};

/**
 * Get the HSV hue value of a block.  Null if hue not set.
 * @return {?number} Hue value (0-360).
 */
Block.prototype.getHue = function() {
  return this.hue_;
};

/**
 * Change the colour of a block.
 * @param {number|string} colour HSV hue value (0 to 360), #RRGGBB string,
 *     or a message reference string pointing to one of those two values.
 */
Block.prototype.setColour = function(colour) {
  const parsed = parsing.parseBlockColour(colour);
  this.hue_ = parsed.hue;
  this.colour_ = parsed.hex;
};

/**
 * Set the style and colour values of a block.
 * @param {string} blockStyleName Name of the block style.
 */
Block.prototype.setStyle = function(blockStyleName) {
  this.styleName_ = blockStyleName;
};

/**
 * Sets a callback function to use whenever the block's parent workspace
 * changes, replacing any prior onchange handler. This is usually only called
 * from the constructor, the block type initializer function, or an extension
 * initializer function.
 * @param {function(Abstract)} onchangeFn The callback to call
 *     when the block's workspace changes.
 * @throws {Error} if onchangeFn is not falsey and not a function.
 */
Block.prototype.setOnChange = function(onchangeFn) {
  if (onchangeFn && typeof onchangeFn !== 'function') {
    throw Error('onchange must be a function.');
  }
  if (this.onchangeWrapper_) {
    this.workspace.removeChangeListener(this.onchangeWrapper_);
  }
  this.onchange = onchangeFn;
  if (this.onchange) {
    this.onchangeWrapper_ = onchangeFn.bind(this);
    this.workspace.addChangeListener(this.onchangeWrapper_);
  }
};

/**
 * Returns the named field from a block.
 * @param {string} name The name of the field.
 * @return {?Field} Named field, or null if field does not exist.
 */
Block.prototype.getField = function(name) {
  if (typeof name !== 'string') {
    throw TypeError(
        'Block.prototype.getField expects a string ' +
        'with the field name but received ' +
        (name === undefined ? 'nothing' : name + ' of type ' + typeof name) +
        ' instead');
  }
  for (let i = 0, input; (input = this.inputList[i]); i++) {
    for (let j = 0, field; (field = input.fieldRow[j]); j++) {
      if (field.name === name) {
        return field;
      }
    }
  }
  return null;
};

/**
 * Return all variables referenced by this block.
 * @return {!Array<string>} List of variable ids.
 */
Block.prototype.getVars = function() {
  const vars = [];
  for (let i = 0, input; (input = this.inputList[i]); i++) {
    for (let j = 0, field; (field = input.fieldRow[j]); j++) {
      if (field.referencesVariables()) {
        vars.push(field.getValue());
      }
    }
  }
  return vars;
};

/**
 * Return all variables referenced by this block.
 * @return {!Array<!VariableModel>} List of variable models.
 * @package
 */
Block.prototype.getVarModels = function() {
  const vars = [];
  for (let i = 0, input; (input = this.inputList[i]); i++) {
    for (let j = 0, field; (field = input.fieldRow[j]); j++) {
      if (field.referencesVariables()) {
        const model = this.workspace.getVariableById(
            /** @type {string} */ (field.getValue()));
        // Check if the variable actually exists (and isn't just a potential
        // variable).
        if (model) {
          vars.push(model);
        }
      }
    }
  }
  return vars;
};

/**
 * Notification that a variable is renaming but keeping the same ID.  If the
 * variable is in use on this block, rerender to show the new name.
 * @param {!VariableModel} variable The variable being renamed.
 * @package
 */
Block.prototype.updateVarName = function(variable) {
  for (let i = 0, input; (input = this.inputList[i]); i++) {
    for (let j = 0, field; (field = input.fieldRow[j]); j++) {
      if (field.referencesVariables() &&
          variable.getId() === field.getValue()) {
        field.refreshVariableName();
      }
    }
  }
};

/**
 * Notification that a variable is renaming.
 * If the ID matches one of this block's variables, rename it.
 * @param {string} oldId ID of variable to rename.
 * @param {string} newId ID of new variable.  May be the same as oldId, but with
 *     an updated name.
 */
Block.prototype.renameVarById = function(oldId, newId) {
  for (let i = 0, input; (input = this.inputList[i]); i++) {
    for (let j = 0, field; (field = input.fieldRow[j]); j++) {
      if (field.referencesVariables() && oldId === field.getValue()) {
        field.setValue(newId);
      }
    }
  }
};

/**
 * Returns the language-neutral value of the given field.
 * @param {string} name The name of the field.
 * @return {*} Value of the field or null if field does not exist.
 */
Block.prototype.getFieldValue = function(name) {
  const field = this.getField(name);
  if (field) {
    return field.getValue();
  }
  return null;
};

/**
 * Sets the value of the given field for this block.
 * @param {*} newValue The value to set.
 * @param {string} name The name of the field to set the value of.
 */
Block.prototype.setFieldValue = function(newValue, name) {
  const field = this.getField(name);
  if (!field) {
    throw Error('Field "' + name + '" not found.');
  }
  field.setValue(newValue);
};

/**
 * Set whether this block can chain onto the bottom of another block.
 * @param {boolean} newBoolean True if there can be a previous statement.
 * @param {(string|Array<string>|null)=} opt_check Statement type or
 *     list of statement types.  Null/undefined if any type could be connected.
 */
Block.prototype.setPreviousStatement = function(newBoolean, opt_check) {
  if (newBoolean) {
    if (opt_check === undefined) {
      opt_check = null;
    }
    if (!this.previousConnection) {
      this.previousConnection =
          this.makeConnection_(ConnectionType.PREVIOUS_STATEMENT);
    }
    this.previousConnection.setCheck(opt_check);
  } else {
    if (this.previousConnection) {
      if (this.previousConnection.isConnected()) {
        throw Error(
            'Must disconnect previous statement before removing ' +
            'connection.');
      }
      this.previousConnection.dispose();
      this.previousConnection = null;
    }
  }
};

/**
 * Set whether another block can chain onto the bottom of this block.
 * @param {boolean} newBoolean True if there can be a next statement.
 * @param {(string|Array<string>|null)=} opt_check Statement type or
 *     list of statement types.  Null/undefined if any type could be connected.
 */
Block.prototype.setNextStatement = function(newBoolean, opt_check) {
  if (newBoolean) {
    if (opt_check === undefined) {
      opt_check = null;
    }
    if (!this.nextConnection) {
      this.nextConnection = this.makeConnection_(ConnectionType.NEXT_STATEMENT);
    }
    this.nextConnection.setCheck(opt_check);
  } else {
    if (this.nextConnection) {
      if (this.nextConnection.isConnected()) {
        throw Error(
            'Must disconnect next statement before removing ' +
            'connection.');
      }
      this.nextConnection.dispose();
      this.nextConnection = null;
    }
  }
};

/**
 * Set whether this block returns a value.
 * @param {boolean} newBoolean True if there is an output.
 * @param {(string|Array<string>|null)=} opt_check Returned type or list
 *     of returned types.  Null or undefined if any type could be returned
 *     (e.g. variable get).
 */
Block.prototype.setOutput = function(newBoolean, opt_check) {
  if (newBoolean) {
    if (opt_check === undefined) {
      opt_check = null;
    }
    if (!this.outputConnection) {
      this.outputConnection = this.makeConnection_(ConnectionType.OUTPUT_VALUE);
    }
    this.outputConnection.setCheck(opt_check);
  } else {
    if (this.outputConnection) {
      if (this.outputConnection.isConnected()) {
        throw Error('Must disconnect output value before removing connection.');
      }
      this.outputConnection.dispose();
      this.outputConnection = null;
    }
  }
};

/**
 * Set whether value inputs are arranged horizontally or vertically.
 * @param {boolean} newBoolean True if inputs are horizontal.
 */
Block.prototype.setInputsInline = function(newBoolean) {
  if (this.inputsInline !== newBoolean) {
    eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_CHANGE))(
        this, 'inline', null, this.inputsInline, newBoolean));
    this.inputsInline = newBoolean;
  }
};

/**
 * Get whether value inputs are arranged horizontally or vertically.
 * @return {boolean} True if inputs are horizontal.
 */
Block.prototype.getInputsInline = function() {
  if (this.inputsInline !== undefined) {
    // Set explicitly.
    return this.inputsInline;
  }
  // Not defined explicitly.  Figure out what would look best.
  for (let i = 1; i < this.inputList.length; i++) {
    if (this.inputList[i - 1].type === inputTypes.DUMMY &&
        this.inputList[i].type === inputTypes.DUMMY) {
      // Two dummy inputs in a row.  Don't inline them.
      return false;
    }
  }
  for (let i = 1; i < this.inputList.length; i++) {
    if (this.inputList[i - 1].type === inputTypes.VALUE &&
        this.inputList[i].type === inputTypes.DUMMY) {
      // Dummy input after a value input.  Inline them.
      return true;
    }
  }
  return false;
};

/**
 * Set the block's output shape.
 * @param {?number} outputShape Value representing an output shape.
 */
Block.prototype.setOutputShape = function(outputShape) {
  this.outputShape_ = outputShape;
};

/**
 * Get the block's output shape.
 * @return {?number} Value representing output shape if one exists.
 */
Block.prototype.getOutputShape = function() {
  return this.outputShape_;
};

/**
 * Get whether this block is enabled or not.
 * @return {boolean} True if enabled.
 */
Block.prototype.isEnabled = function() {
  return !this.disabled;
};

/**
 * Set whether the block is enabled or not.
 * @param {boolean} enabled True if enabled.
 */
Block.prototype.setEnabled = function(enabled) {
  if (this.isEnabled() !== enabled) {
    const oldValue = this.disabled;
    this.disabled = !enabled;
    eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_CHANGE))(
        this, 'disabled', null, oldValue, !enabled));
  }
};

/**
 * Get whether the block is disabled or not due to parents.
 * The block's own disabled property is not considered.
 * @return {boolean} True if disabled.
 */
Block.prototype.getInheritedDisabled = function() {
  let ancestor = this.getSurroundParent();
  while (ancestor) {
    if (ancestor.disabled) {
      return true;
    }
    ancestor = ancestor.getSurroundParent();
  }
  // Ran off the top.
  return false;
};

/**
 * Get whether the block is collapsed or not.
 * @return {boolean} True if collapsed.
 */
Block.prototype.isCollapsed = function() {
  return this.collapsed_;
};

/**
 * Set whether the block is collapsed or not.
 * @param {boolean} collapsed True if collapsed.
 */
Block.prototype.setCollapsed = function(collapsed) {
  if (this.collapsed_ !== collapsed) {
    eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_CHANGE))(
        this, 'collapsed', null, this.collapsed_, collapsed));
    this.collapsed_ = collapsed;
  }
};

/**
 * Create a human-readable text representation of this block and any children.
 * @param {number=} opt_maxLength Truncate the string to this length.
 * @param {string=} opt_emptyToken The placeholder string used to denote an
 *     empty field. If not specified, '?' is used.
 * @return {string} Text of block.
 */
Block.prototype.toString = function(opt_maxLength, opt_emptyToken) {
  let text = [];
  const emptyFieldPlaceholder = opt_emptyToken || '?';

  // Temporarily set flag to navigate to all fields.
  const prevNavigateFields = ASTNode.NAVIGATE_ALL_FIELDS;
  ASTNode.NAVIGATE_ALL_FIELDS = true;

  let node = ASTNode.createBlockNode(this);
  const rootNode = node;

  /**
   * Whether or not to add parentheses around an input.
   * @param {!Connection} connection The connection.
   * @return {boolean} True if we should add parentheses around the input.
   */
  function shouldAddParentheses(connection) {
    let checks = connection.getCheck();
    if (!checks && connection.targetConnection) {
      checks = connection.targetConnection.getCheck();
    }
    return !!checks &&
        (checks.indexOf('Boolean') !== -1 || checks.indexOf('Number') !== -1);
  }

  /**
   * Check that we haven't circled back to the original root node.
   */
  function checkRoot() {
    if (node && node.getType() === rootNode.getType() &&
        node.getLocation() === rootNode.getLocation()) {
      node = null;
    }
  }

  // Traverse the AST building up our text string.
  while (node) {
    switch (node.getType()) {
      case ASTNode.types.INPUT: {
        const connection = /** @type {!Connection} */ (node.getLocation());
        if (!node.in()) {
          text.push(emptyFieldPlaceholder);
        } else if (shouldAddParentheses(connection)) {
          text.push('(');
        }
        break;
      }
      case ASTNode.types.FIELD: {
        const field = /** @type {Field} */ (node.getLocation());
        if (field.name !== constants.COLLAPSED_FIELD_NAME) {
          text.push(field.getText());
        }
        break;
      }
    }

    const current = node;
    node = current.in() || current.next();
    if (!node) {
      // Can't go in or next, keep going out until we can go next.
      node = current.out();
      checkRoot();
      while (node && !node.next()) {
        node = node.out();
        checkRoot();
        // If we hit an input on the way up, possibly close out parentheses.
        if (node && node.getType() === ASTNode.types.INPUT &&
            shouldAddParentheses(
                /** @type {!Connection} */ (node.getLocation()))) {
          text.push(')');
        }
      }
      if (node) {
        node = node.next();
      }
    }
  }

  // Restore state of NAVIGATE_ALL_FIELDS.
  ASTNode.NAVIGATE_ALL_FIELDS = prevNavigateFields;

  // Run through our text array and simplify expression to remove parentheses
  // around single field blocks.
  // E.g. ['repeat', '(', '10', ')', 'times', 'do', '?']
  for (let i = 2; i < text.length; i++) {
    if (text[i - 2] === '(' && text[i] === ')') {
      text[i - 2] = text[i - 1];
      text.splice(i - 1, 2);
    }
  }

  // Join the text array, removing spaces around added parentheses.
  text = text.reduce(function(acc, value) {
    return acc + ((acc.substr(-1) === '(' || value === ')') ? '' : ' ') + value;
  }, '');
  text = text.trim() || '???';
  if (opt_maxLength) {
    // TODO: Improve truncation so that text from this block is given priority.
    // E.g. "1+2+3+4+5+6+7+8+9=0" should be "...6+7+8+9=0", not "1+2+3+4+5...".
    // E.g. "1+2+3+4+5=6+7+8+9+0" should be "...4+5=6+7...".
    if (text.length > opt_maxLength) {
      text = text.substring(0, opt_maxLength - 3) + '...';
    }
  }
  return text;
};

/**
 * Shortcut for appending a value input row.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * @return {!Input} The input object created.
 */
Block.prototype.appendValueInput = function(name) {
  return this.appendInput_(inputTypes.VALUE, name);
};

/**
 * Shortcut for appending a statement input row.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * @return {!Input} The input object created.
 */
Block.prototype.appendStatementInput = function(name) {
  return this.appendInput_(inputTypes.STATEMENT, name);
};

/**
 * Shortcut for appending a dummy input row.
 * @param {string=} opt_name Language-neutral identifier which may used to find
 *     this input again.  Should be unique to this block.
 * @return {!Input} The input object created.
 */
Block.prototype.appendDummyInput = function(opt_name) {
  return this.appendInput_(inputTypes.DUMMY, opt_name || '');
};

/**
 * Initialize this block using a cross-platform, internationalization-friendly
 * JSON description.
 * @param {!Object} json Structured data describing the block.
 */
Block.prototype.jsonInit = function(json) {
  const warningPrefix = json['type'] ? 'Block "' + json['type'] + '": ' : '';

  // Validate inputs.
  if (json['output'] && json['previousStatement']) {
    throw Error(
        warningPrefix +
        'Must not have both an output and a previousStatement.');
  }

  // Set basic properties of block.
  // Makes styles backward compatible with old way of defining hat style.
  if (json['style'] && json['style'].hat) {
    this.hat = json['style'].hat;
    // Must set to null so it doesn't error when checking for style and colour.
    json['style'] = null;
  }

  if (json['style'] && json['colour']) {
    throw Error(warningPrefix + 'Must not have both a colour and a style.');
  } else if (json['style']) {
    this.jsonInitStyle_(json, warningPrefix);
  } else {
    this.jsonInitColour_(json, warningPrefix);
  }

  // Interpolate the message blocks.
  let i = 0;
  while (json['message' + i] !== undefined) {
    this.interpolate_(
        json['message' + i], json['args' + i] || [], json['lastDummyAlign' + i],
        warningPrefix);
    i++;
  }

  if (json['inputsInline'] !== undefined) {
    this.setInputsInline(json['inputsInline']);
  }
  // Set output and previous/next connections.
  if (json['output'] !== undefined) {
    this.setOutput(true, json['output']);
  }
  if (json['outputShape'] !== undefined) {
    this.setOutputShape(json['outputShape']);
  }
  if (json['previousStatement'] !== undefined) {
    this.setPreviousStatement(true, json['previousStatement']);
  }
  if (json['nextStatement'] !== undefined) {
    this.setNextStatement(true, json['nextStatement']);
  }
  if (json['tooltip'] !== undefined) {
    const rawValue = json['tooltip'];
    const localizedText = parsing.replaceMessageReferences(rawValue);
    this.setTooltip(localizedText);
  }
  if (json['enableContextMenu'] !== undefined) {
    this.contextMenu = !!json['enableContextMenu'];
  }
  if (json['suppressPrefixSuffix'] !== undefined) {
    this.suppressPrefixSuffix = !!json['suppressPrefixSuffix'];
  }
  if (json['helpUrl'] !== undefined) {
    const rawValue = json['helpUrl'];
    const localizedValue = parsing.replaceMessageReferences(rawValue);
    this.setHelpUrl(localizedValue);
  }
  if (typeof json['extensions'] === 'string') {
    console.warn(
        warningPrefix + 'JSON attribute \'extensions\' should be an array of' +
        ' strings. Found raw string in JSON for \'' + json['type'] +
        '\' block.');
    json['extensions'] = [json['extensions']];  // Correct and continue.
  }

  // Add the mutator to the block.
  if (json['mutator'] !== undefined) {
    Extensions.apply(json['mutator'], this, true);
  }

  const extensionNames = json['extensions'];
  if (Array.isArray(extensionNames)) {
    for (let j = 0; j < extensionNames.length; j++) {
      Extensions.apply(extensionNames[j], this, false);
    }
  }
};

/**
 * Initialize the colour of this block from the JSON description.
 * @param {!Object} json Structured data describing the block.
 * @param {string} warningPrefix Warning prefix string identifying block.
 * @private
 */
Block.prototype.jsonInitColour_ = function(json, warningPrefix) {
  if ('colour' in json) {
    if (json['colour'] === undefined) {
      console.warn(warningPrefix + 'Undefined colour value.');
    } else {
      const rawValue = json['colour'];
      try {
        this.setColour(rawValue);
      } catch (e) {
        console.warn(warningPrefix + 'Illegal colour value: ', rawValue);
      }
    }
  }
};

/**
 * Initialize the style of this block from the JSON description.
 * @param {!Object} json Structured data describing the block.
 * @param {string} warningPrefix Warning prefix string identifying block.
 * @private
 */
Block.prototype.jsonInitStyle_ = function(json, warningPrefix) {
  const blockStyleName = json['style'];
  try {
    this.setStyle(blockStyleName);
  } catch (styleError) {
    console.warn(warningPrefix + 'Style does not exist: ', blockStyleName);
  }
};

/**
 * Add key/values from mixinObj to this block object. By default, this method
 * will check that the keys in mixinObj will not overwrite existing values in
 * the block, including prototype values. This provides some insurance against
 * mixin / extension incompatibilities with future block features. This check
 * can be disabled by passing true as the second argument.
 * @param {!Object} mixinObj The key/values pairs to add to this block object.
 * @param {boolean=} opt_disableCheck Option flag to disable overwrite checks.
 */
Block.prototype.mixin = function(mixinObj, opt_disableCheck) {
  if (opt_disableCheck !== undefined && typeof opt_disableCheck !== 'boolean') {
    throw Error('opt_disableCheck must be a boolean if provided');
  }
  if (!opt_disableCheck) {
    const overwrites = [];
    for (const key in mixinObj) {
      if (this[key] !== undefined) {
        overwrites.push(key);
      }
    }
    if (overwrites.length) {
      throw Error(
          'Mixin will overwrite block members: ' + JSON.stringify(overwrites));
    }
  }
  object.mixin(this, mixinObj);
};

/**
 * Interpolate a message description onto the block.
 * @param {string} message Text contains interpolation tokens (%1, %2, ...)
 *     that match with fields or inputs defined in the args array.
 * @param {!Array} args Array of arguments to be interpolated.
 * @param {string|undefined} lastDummyAlign If a dummy input is added at the
 *     end, how should it be aligned?
 * @param {string} warningPrefix Warning prefix string identifying block.
 * @private
 */
Block.prototype.interpolate_ = function(
    message, args, lastDummyAlign, warningPrefix) {
  const tokens = parsing.tokenizeInterpolation(message);
  this.validateTokens_(tokens, args.length);
  const elements = this.interpolateArguments_(tokens, args, lastDummyAlign);

  // An array of [field, fieldName] tuples.
  const fieldStack = [];
  for (let i = 0, element; (element = elements[i]); i++) {
    if (this.isInputKeyword_(element['type'])) {
      const input = this.inputFromJson_(element, warningPrefix);
      // Should never be null, but just in case.
      if (input) {
        for (let j = 0, tuple; (tuple = fieldStack[j]); j++) {
          input.appendField(tuple[0], tuple[1]);
        }
        fieldStack.length = 0;
      }
    } else {
      // All other types, including ones starting with 'input_' get routed here.
      const field = this.fieldFromJson_(element);
      if (field) {
        fieldStack.push([field, element['name']]);
      }
    }
  }
};

/**
 * Validates that the tokens are within the correct bounds, with no duplicates,
 * and that all of the arguments are referred to. Throws errors if any of these
 * things are not true.
 * @param {!Array<string|number>} tokens An array of tokens to validate
 * @param {number} argsCount The number of args that need to be referred to.
 * @private
 */
Block.prototype.validateTokens_ = function(tokens, argsCount) {
  const visitedArgsHash = [];
  let visitedArgsCount = 0;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (typeof token !== 'number') {
      continue;
    }
    if (token < 1 || token > argsCount) {
      throw Error(
          'Block "' + this.type + '": ' +
          'Message index %' + token + ' out of range.');
    }
    if (visitedArgsHash[token]) {
      throw Error(
          'Block "' + this.type + '": ' +
          'Message index %' + token + ' duplicated.');
    }
    visitedArgsHash[token] = true;
    visitedArgsCount++;
  }
  if (visitedArgsCount !== argsCount) {
    throw Error(
        'Block "' + this.type + '": ' +
        'Message does not reference all ' + argsCount + ' arg(s).');
  }
};

/**
 * Inserts args in place of numerical tokens. String args are converted to JSON
 * that defines a label field. If necessary an extra dummy input is added to
 * the end of the elements.
 * @param {!Array<!string|number>} tokens The tokens to interpolate
 * @param {!Array<!Object|string>} args The arguments to insert.
 * @param {string|undefined} lastDummyAlign The alignment the added dummy input
 *     should have, if we are required to add one.
 * @return {!Array<!Object>} The JSON definitions of field and inputs to add
 *     to the block.
 * @private
 */
Block.prototype.interpolateArguments_ = function(tokens, args, lastDummyAlign) {
  const elements = [];
  for (let i = 0; i < tokens.length; i++) {
    let element = tokens[i];
    if (typeof element === 'number') {
      element = args[element - 1];
    }
    // Args can be strings, which is why this isn't elseif.
    if (typeof element === 'string') {
      element = this.stringToFieldJson_(element);
      if (!element) {
        continue;
      }
    }
    elements.push(element);
  }

  const length = elements.length;
  if (length && !this.isInputKeyword_(elements[length - 1]['type'])) {
    const dummyInput = {'type': 'input_dummy'};
    if (lastDummyAlign) {
      dummyInput['align'] = lastDummyAlign;
    }
    elements.push(dummyInput);
  }

  return elements;
};

/**
 * Creates a field from the JSON definition of a field. If a field with the
 * given type cannot be found, this attempts to create a different field using
 * the 'alt' property of the JSON definition (if it exists).
 * @param {{alt:(string|undefined)}} element The element to try to turn into a
 *     field.
 * @return {?Field} The field defined by the JSON, or null if one
 *     couldn't be created.
 * @private
 */
Block.prototype.fieldFromJson_ = function(element) {
  const field = fieldRegistry.fromJson(element);
  if (!field && element['alt']) {
    if (typeof element['alt'] === 'string') {
      const json = this.stringToFieldJson_(element['alt']);
      return json ? this.fieldFromJson_(json) : null;
    }
    return this.fieldFromJson_(element['alt']);
  }
  return field;
};

/**
 * Creates an input from the JSON definition of an input. Sets the input's check
 * and alignment if they are provided.
 * @param {!Object} element The JSON to turn into an input.
 * @param {string} warningPrefix The prefix to add to warnings to help the
 *     developer debug.
 * @return {?Input} The input that has been created, or null if one
 *     could not be created for some reason (should never happen).
 * @private
 */
Block.prototype.inputFromJson_ = function(element, warningPrefix) {
  const alignmentLookup = {
    'LEFT': Align.LEFT,
    'RIGHT': Align.RIGHT,
    'CENTRE': Align.CENTRE,
    'CENTER': Align.CENTRE,
  };

  let input = null;
  switch (element['type']) {
    case 'input_value':
      input = this.appendValueInput(element['name']);
      break;
    case 'input_statement':
      input = this.appendStatementInput(element['name']);
      break;
    case 'input_dummy':
      input = this.appendDummyInput(element['name']);
      break;
  }
  // Should never be hit because of interpolate_'s checks, but just in case.
  if (!input) {
    return null;
  }

  if (element['check']) {
    input.setCheck(element['check']);
  }
  if (element['align']) {
    const alignment = alignmentLookup[element['align'].toUpperCase()];
    if (alignment === undefined) {
      console.warn(warningPrefix + 'Illegal align value: ', element['align']);
    } else {
      input.setAlign(alignment);
    }
  }
  return input;
};

/**
 * Returns true if the given string matches one of the input keywords.
 * @param {string} str The string to check.
 * @return {boolean} True if the given string matches one of the input keywords,
 *     false otherwise.
 * @private
 */
Block.prototype.isInputKeyword_ = function(str) {
  return str === 'input_value' || str === 'input_statement' ||
      str === 'input_dummy';
};

/**
 * Turns a string into the JSON definition of a label field. If the string
 * becomes an empty string when trimmed, this returns null.
 * @param {string} str String to turn into the JSON definition of a label field.
 * @return {?{text: string, type: string}} The JSON definition or null.
 * @private
 */
Block.prototype.stringToFieldJson_ = function(str) {
  str = str.trim();
  if (str) {
    return {
      'type': 'field_label',
      'text': str,
    };
  }
  return null;
};

/**
 * Add a value input, statement input or local variable to this block.
 * @param {number} type One of Blockly.inputTypes.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * @return {!Input} The input object created.
 * @protected
 */
Block.prototype.appendInput_ = function(type, name) {
  let connection = null;
  if (type === inputTypes.VALUE || type === inputTypes.STATEMENT) {
    connection = this.makeConnection_(type);
  }
  if (type === inputTypes.STATEMENT) {
    this.statementInputCount++;
  }
  const input = new Input(type, name, this, connection);
  // Append input to list.
  this.inputList.push(input);
  return input;
};

/**
 * Move a named input to a different location on this block.
 * @param {string} name The name of the input to move.
 * @param {?string} refName Name of input that should be after the moved input,
 *   or null to be the input at the end.
 */
Block.prototype.moveInputBefore = function(name, refName) {
  if (name === refName) {
    return;
  }
  // Find both inputs.
  let inputIndex = -1;
  let refIndex = refName ? -1 : this.inputList.length;
  for (let i = 0, input; (input = this.inputList[i]); i++) {
    if (input.name === name) {
      inputIndex = i;
      if (refIndex !== -1) {
        break;
      }
    } else if (refName && input.name === refName) {
      refIndex = i;
      if (inputIndex !== -1) {
        break;
      }
    }
  }
  if (inputIndex === -1) {
    throw Error('Named input "' + name + '" not found.');
  }
  if (refIndex === -1) {
    throw Error('Reference input "' + refName + '" not found.');
  }
  this.moveNumberedInputBefore(inputIndex, refIndex);
};

/**
 * Move a numbered input to a different location on this block.
 * @param {number} inputIndex Index of the input to move.
 * @param {number} refIndex Index of input that should be after the moved input.
 */
Block.prototype.moveNumberedInputBefore = function(inputIndex, refIndex) {
  // Validate arguments.
  if (inputIndex === refIndex) {
    throw Error('Can\'t move input to itself.');
  }
  if (inputIndex >= this.inputList.length) {
    throw RangeError('Input index ' + inputIndex + ' out of bounds.');
  }
  if (refIndex > this.inputList.length) {
    throw RangeError('Reference input ' + refIndex + ' out of bounds.');
  }
  // Remove input.
  const input = this.inputList[inputIndex];
  this.inputList.splice(inputIndex, 1);
  if (inputIndex < refIndex) {
    refIndex--;
  }
  // Reinsert input.
  this.inputList.splice(refIndex, 0, input);
};

/**
 * Remove an input from this block.
 * @param {string} name The name of the input.
 * @param {boolean=} opt_quiet True to prevent an error if input is not present.
 * @return {boolean} True if operation succeeds, false if input is not present
 *     and opt_quiet is true.
 * @throws {Error} if the input is not present and opt_quiet is not true.
 */
Block.prototype.removeInput = function(name, opt_quiet) {
  for (let i = 0, input; (input = this.inputList[i]); i++) {
    if (input.name === name) {
      if (input.type === inputTypes.STATEMENT) {
        this.statementInputCount--;
      }
      input.dispose();
      this.inputList.splice(i, 1);
      return true;
    }
  }
  if (opt_quiet) {
    return false;
  }
  throw Error('Input not found: ' + name);
};

/**
 * Fetches the named input object.
 * @param {string} name The name of the input.
 * @return {?Input} The input object, or null if input does not exist.
 */
Block.prototype.getInput = function(name) {
  for (let i = 0, input; (input = this.inputList[i]); i++) {
    if (input.name === name) {
      return input;
    }
  }
  // This input does not exist.
  return null;
};

/**
 * Fetches the block attached to the named input.
 * @param {string} name The name of the input.
 * @return {?Block} The attached value block, or null if the input is
 *     either disconnected or if the input does not exist.
 */
Block.prototype.getInputTargetBlock = function(name) {
  const input = this.getInput(name);
  return input && input.connection && input.connection.targetBlock();
};

/**
 * Returns the comment on this block (or null if there is no comment).
 * @return {?string} Block's comment.
 */
Block.prototype.getCommentText = function() {
  return this.commentModel.text;
};

/**
 * Set this block's comment text.
 * @param {?string} text The text, or null to delete.
 */
Block.prototype.setCommentText = function(text) {
  if (this.commentModel.text === text) {
    return;
  }
  eventUtils.fire(new (eventUtils.get(eventUtils.BLOCK_CHANGE))(
      this, 'comment', null, this.commentModel.text, text));
  this.commentModel.text = text;
  this.comment = text;  // For backwards compatibility.
};

/**
 * Set this block's warning text.
 * @param {?string} _text The text, or null to delete.
 * @param {string=} _opt_id An optional ID for the warning text to be able to
 *     maintain multiple warnings.
 */
Block.prototype.setWarningText = function(_text, _opt_id) {
  // NOP.
};

/**
 * Give this block a mutator dialog.
 * @param {Mutator} _mutator A mutator dialog instance or null to
 *     remove.
 */
Block.prototype.setMutator = function(_mutator) {
  // NOP.
};

/**
 * Return the coordinates of the top-left corner of this block relative to the
 * drawing surface's origin (0,0), in workspace units.
 * @return {!Coordinate} Object with .x and .y properties.
 */
Block.prototype.getRelativeToSurfaceXY = function() {
  return this.xy_;
};

/**
 * Move a block by a relative offset.
 * @param {number} dx Horizontal offset, in workspace units.
 * @param {number} dy Vertical offset, in workspace units.
 */
Block.prototype.moveBy = function(dx, dy) {
  if (this.parentBlock_) {
    throw Error('Block has parent.');
  }
  const event = new (eventUtils.get(eventUtils.BLOCK_MOVE))(this);
  this.xy_.translate(dx, dy);
  event.recordNew();
  eventUtils.fire(event);
};

/**
 * Create a connection of the specified type.
 * @param {number} type The type of the connection to create.
 * @return {!Connection} A new connection of the specified type.
 * @protected
 */
Block.prototype.makeConnection_ = function(type) {
  return new Connection(this, type);
};

/**
 * Recursively checks whether all statement and value inputs are filled with
 * blocks. Also checks all following statement blocks in this stack.
 * @param {boolean=} opt_shadowBlocksAreFilled An optional argument controlling
 *     whether shadow blocks are counted as filled. Defaults to true.
 * @return {boolean} True if all inputs are filled, false otherwise.
 */
Block.prototype.allInputsFilled = function(opt_shadowBlocksAreFilled) {
  // Account for the shadow block filledness toggle.
  if (opt_shadowBlocksAreFilled === undefined) {
    opt_shadowBlocksAreFilled = true;
  }
  if (!opt_shadowBlocksAreFilled && this.isShadow()) {
    return false;
  }

  // Recursively check each input block of the current block.
  for (let i = 0, input; (input = this.inputList[i]); i++) {
    if (!input.connection) {
      continue;
    }
    const target = input.connection.targetBlock();
    if (!target || !target.allInputsFilled(opt_shadowBlocksAreFilled)) {
      return false;
    }
  }

  // Recursively check the next block after the current block.
  const next = this.getNextBlock();
  if (next) {
    return next.allInputsFilled(opt_shadowBlocksAreFilled);
  }

  return true;
};

/**
 * This method returns a string describing this Block in developer terms (type
 * name and ID; English only).
 *
 * Intended to on be used in console logs and errors. If you need a string that
 * uses the user's native language (including block text, field values, and
 * child blocks), use [toString()]{@link Block#toString}.
 * @return {string} The description.
 */
Block.prototype.toDevString = function() {
  let msg = this.type ? '"' + this.type + '" block' : 'Block';
  if (this.id) {
    msg += ' (id="' + this.id + '")';
  }
  return msg;
};

exports.Block = Block;
