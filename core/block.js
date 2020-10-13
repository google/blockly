/**
 * @license
 * Copyright 2011 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The class representing one block.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Block');

goog.require('Blockly.ASTNode');
goog.require('Blockly.Blocks');
goog.require('Blockly.Connection');
goog.require('Blockly.constants');
goog.require('Blockly.Events');
goog.require('Blockly.Events.BlockChange');
goog.require('Blockly.Events.BlockCreate');
goog.require('Blockly.Events.BlockDelete');
goog.require('Blockly.Events.BlockMove');
goog.require('Blockly.Extensions');
goog.require('Blockly.fieldRegistry');
goog.require('Blockly.Input');
goog.require('Blockly.navigation');
goog.require('Blockly.Tooltip');
goog.require('Blockly.utils');
goog.require('Blockly.utils.deprecation');
goog.require('Blockly.utils.Coordinate');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.string');
goog.require('Blockly.Workspace');

goog.requireType('Blockly.IASTNodeLocation');


/**
 * Class for one block.
 * Not normally called directly, workspace.newBlock() is preferred.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {!string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new ID.
 * @constructor
 * @implements {Blockly.IASTNodeLocation}
 * @throws When the prototypeName is not valid or not allowed.
 */
Blockly.Block = function(workspace, prototypeName, opt_id) {
  if (Blockly.Generator &&
      typeof Blockly.Generator.prototype[prototypeName] != 'undefined') {
    // Occluding Generator class members is not allowed.
    throw Error('Block prototypeName "' + prototypeName +
        '" conflicts with Blockly.Generator members.');
  }

  /** @type {string} */
  this.id = (opt_id && !workspace.getBlockById(opt_id)) ?
      opt_id : Blockly.utils.genUid();
  workspace.setBlockById(this.id, this);
  /** @type {Blockly.Connection} */
  this.outputConnection = null;
  /** @type {Blockly.Connection} */
  this.nextConnection = null;
  /** @type {Blockly.Connection} */
  this.previousConnection = null;
  /** @type {!Array.<!Blockly.Input>} */
  this.inputList = [];
  /** @type {boolean|undefined} */
  this.inputsInline = undefined;
  /**
   * @type {boolean}
   * @private
   */
  this.disabled = false;
  /** @type {!Blockly.Tooltip.TipInfo} */
  this.tooltip = '';
  /** @type {boolean} */
  this.contextMenu = true;

  /**
   * @type {Blockly.Block}
   * @protected
   */
  this.parentBlock_ = null;

  /**
   * @type {!Array.<!Blockly.Block>}
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
   * @type {string|Blockly.Comment}
   * @deprecated August 2019. Use getCommentText instead.
   */
  this.comment = null;

  /**
   * A model of the comment attached to this block.
   * @type {!Blockly.Block.CommentModel}
   * @package
   */
  this.commentModel = {
    text: null,
    pinned: false,
    size: new Blockly.utils.Size(160, 80)
  };

  /**
   * The block's position in workspace units.  (0, 0) is at the workspace's
   * origin; scale does not change this value.
   * @type {!Blockly.utils.Coordinate}
   * @private
   */
  this.xy_ = new Blockly.utils.Coordinate(0, 0);

  /** @type {!Blockly.Workspace} */
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
    var prototype = Blockly.Blocks[prototypeName];
    if (!prototype || typeof prototype != 'object') {
      throw TypeError('Unknown block type: ' + prototypeName);
    }
    Blockly.utils.object.mixin(this, prototype);
  }

  workspace.addTopBlock(this);
  workspace.addTypedBlock(this);

  // All events fired should be part of the same group.
  // Any events fired during init should not be undoable,
  // so that block creation is atomic.
  var existingGroup = Blockly.Events.getGroup();
  if (!existingGroup) {
    Blockly.Events.setGroup(true);
  }
  var initialUndoFlag = Blockly.Events.recordUndo;

  try {
    // Call an initialization function, if it exists.
    if (typeof this.init == 'function') {
      Blockly.Events.recordUndo = false;
      this.init();
      Blockly.Events.recordUndo = initialUndoFlag;
    }

    // Fire a create event.
    if (Blockly.Events.isEnabled()) {
      Blockly.Events.fire(new Blockly.Events.BlockCreate(this));
    }

  } finally {
    if (!existingGroup) {
      Blockly.Events.setGroup(false);
    }
    // In case init threw, recordUndo flag should still be reset.
    Blockly.Events.recordUndo = initialUndoFlag;
  }
  
  // Record initial inline state.
  /** @type {boolean|undefined} */
  this.inputsInlineDefault = this.inputsInline;

  // Bind an onchange function, if it exists.
  if (typeof this.onchange == 'function') {
    this.setOnChange(this.onchange);
  }
};

/**
 * @typedef {{
 *            text:?string,
 *            pinned:boolean,
 *            size:Blockly.utils.Size
 *          }}
 */
Blockly.Block.CommentModel;

/**
 * The language-neutral id given to the collapsed input.
 * @const {string}
 */
Blockly.Block.COLLAPSED_INPUT_NAME = '_TEMP_COLLAPSED_INPUT';
/**
 * The language-neutral id given to the collapsed field.
 * @const {string}
 */
Blockly.Block.COLLAPSED_FIELD_NAME = '_TEMP_COLLAPSED_FIELD';

/**
 * Optional text data that round-trips between blocks and XML.
 * Has no effect. May be used by 3rd parties for meta information.
 * @type {?string}
 */
Blockly.Block.prototype.data = null;

/**
 * Has this block been disposed of?
 * @type {boolean}
 * @package
 */
Blockly.Block.prototype.disposed = false;

/**
 * Colour of the block as HSV hue value (0-360)
 * This may be null if the block colour was not set via a hue number.
 * @type {?number}
 * @private
 */
Blockly.Block.prototype.hue_ = null;

/**
 * Colour of the block in '#RRGGBB' format.
 * @type {string}
 * @protected
 */
Blockly.Block.prototype.colour_ = '#000000';

/**
 * Name of the block style.
 * @type {?string}
 * @protected
 */
Blockly.Block.prototype.styleName_ = null;

/**
 * An optional method called during initialization.
 * @type {?function()}
 */
Blockly.Block.prototype.init;

/**
 * An optional callback method to use whenever the block's parent workspace
 * changes. This is usually only called from the constructor, the block type
 * initializer function, or an extension initializer function.
 * @type {?function(Blockly.Events.Abstract)}
 */
Blockly.Block.prototype.onchange;

/**
 * An optional serialization method for defining how to serialize the
 * mutation state. This must be coupled with defining `domToMutation`.
 * @type {?function(...):!Element}
 */
Blockly.Block.prototype.mutationToDom;

/**
 * An optional deserialization method for defining how to deserialize the
 * mutation state. This must be coupled with defining `mutationToDom`.
 * @type {?function(!Element)}
 */
Blockly.Block.prototype.domToMutation;

/**
 * An optional property for suppressing adding STATEMENT_PREFIX and
 * STATEMENT_SUFFIX to generated code.
 * @type {?boolean}
 */
Blockly.Block.prototype.suppressPrefixSuffix;

/**
 * An optional property for declaring developer variables.  Return a list of
 * variable names for use by generators.  Developer variables are never shown to
 * the user, but are declared as global variables in the generated code.
 * @type {?function():!Array.<string>}
 */
Blockly.Block.prototype.getDeveloperVariables;

/**
 * Dispose of this block.
 * @param {boolean} healStack If true, then try to heal any gap by connecting
 *     the next statement with the previous statement.  Otherwise, dispose of
 *     all children of this block.
 * @suppress {checkTypes}
 */
Blockly.Block.prototype.dispose = function(healStack) {
  if (!this.workspace) {
    // Already deleted.
    return;
  }
  // Terminate onchange event calls.
  if (this.onchangeWrapper_) {
    this.workspace.removeChangeListener(this.onchangeWrapper_);
  }

  this.unplug(healStack);
  if (Blockly.Events.isEnabled()) {
    Blockly.Events.fire(new Blockly.Events.BlockDelete(this));
  }
  Blockly.Events.disable();

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

    if (Blockly.selected == this) {
      Blockly.selected = null;
    }

    // First, dispose of all my children.
    for (var i = this.childBlocks_.length - 1; i >= 0; i--) {
      this.childBlocks_[i].dispose(false);
    }
    // Then dispose of myself.
    // Dispose of all inputs and their fields.
    for (var i = 0, input; (input = this.inputList[i]); i++) {
      input.dispose();
    }
    this.inputList.length = 0;
    // Dispose of any remaining connections (next/previous/output).
    var connections = this.getConnections_(true);
    for (var i = 0, connection; (connection = connections[i]); i++) {
      connection.dispose();
    }
  } finally {
    Blockly.Events.enable();
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
Blockly.Block.prototype.initModel = function() {
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    for (var j = 0, field; (field = input.fieldRow[j]); j++) {
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
Blockly.Block.prototype.unplug = function(opt_healStack) {
  if (this.outputConnection) {
    this.unplugFromRow_(opt_healStack);
  } else if (this.previousConnection) {
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
Blockly.Block.prototype.unplugFromRow_ = function(opt_healStack) {
  var parentConnection = null;
  if (this.outputConnection.isConnected()) {
    parentConnection = this.outputConnection.targetConnection;
    // Disconnect from any superior block.
    this.outputConnection.disconnect();
  }

  // Return early in obvious cases.
  if (!parentConnection || !opt_healStack) {
    return;
  }

  var thisConnection = this.getOnlyValueConnection_();
  if (!thisConnection ||
      !thisConnection.isConnected() ||
      thisConnection.targetBlock().isShadow()) {
    // Too many or too few possible connections on this block, or there's
    // nothing on the other side of this connection.
    return;
  }

  var childConnection = thisConnection.targetConnection;
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
 * @return {Blockly.Connection} The connection on the value input, or null.
 * @private
 */
Blockly.Block.prototype.getOnlyValueConnection_ = function() {
  var connection = null;
  for (var i = 0; i < this.inputList.length; i++) {
    var thisConnection = this.inputList[i].connection;
    if (thisConnection && thisConnection.type == Blockly.INPUT_VALUE &&
        thisConnection.targetConnection) {
      if (connection) {
        return null; // More than one value input found.
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
Blockly.Block.prototype.unplugFromStack_ = function(opt_healStack) {
  var previousTarget = null;
  if (this.previousConnection.isConnected()) {
    // Remember the connection that any next statements need to connect to.
    previousTarget = this.previousConnection.targetConnection;
    // Detach this block from the parent's tree.
    this.previousConnection.disconnect();
  }
  var nextBlock = this.getNextBlock();
  if (opt_healStack && nextBlock && !nextBlock.isShadow()) {
    // Disconnect the next statement.
    var nextTarget = this.nextConnection.targetConnection;
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
 * @return {!Array.<!Blockly.Connection>} Array of connections.
 * @package
 */
Blockly.Block.prototype.getConnections_ = function(_all) {
  var myConnections = [];
  if (this.outputConnection) {
    myConnections.push(this.outputConnection);
  }
  if (this.previousConnection) {
    myConnections.push(this.previousConnection);
  }
  if (this.nextConnection) {
    myConnections.push(this.nextConnection);
  }
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    if (input.connection) {
      myConnections.push(input.connection);
    }
  }
  return myConnections;
};

/**
 * Walks down a stack of blocks and finds the last next connection on the stack.
 * @return {Blockly.Connection} The last next connection on the stack, or null.
 * @package
 */
Blockly.Block.prototype.lastConnectionInStack = function() {
  var nextConnection = this.nextConnection;
  while (nextConnection) {
    var nextBlock = nextConnection.targetBlock();
    if (!nextBlock) {
      // Found a next connection with nothing on the other side.
      return nextConnection;
    }
    nextConnection = nextBlock.nextConnection;
  }
  // Ran out of next connections.
  return null;
};

/**
 * Bump unconnected blocks out of alignment.  Two blocks which aren't actually
 * connected should not coincidentally line up on screen.
 */
Blockly.Block.prototype.bumpNeighbours = function() {
  console.warn('Not expected to reach Block.bumpNeighbours function. ' +
      'BlockSvg.bumpNeighbours was expected to be called instead.');
};

/**
 * Return the parent block or null if this block is at the top level. The parent
 * block is either the block connected to the previous connection (for a statement
 * block) or the block connected to the output connection (for a value block).
 * @return {Blockly.Block} The block that holds the current block.
 */
Blockly.Block.prototype.getParent = function() {
  // Look at the DOM to see if we are nested in another block.
  return this.parentBlock_;
};

/**
 * Return the input that connects to the specified block.
 * @param {!Blockly.Block} block A block connected to an input on this block.
 * @return {Blockly.Input} The input that connects to the specified block.
 */
Blockly.Block.prototype.getInputWithBlock = function(block) {
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    if (input.connection && input.connection.targetBlock() == block) {
      return input;
    }
  }
  return null;
};

/**
 * Return the parent block that surrounds the current block, or null if this
 * block has no surrounding block.  A parent block might just be the previous
 * statement, whereas the surrounding block is an if statement, while loop, etc.
 * @return {Blockly.Block} The block that surrounds the current block.
 */
Blockly.Block.prototype.getSurroundParent = function() {
  var block = this;
  do {
    var prevBlock = block;
    block = block.getParent();
    if (!block) {
      // Ran off the top.
      return null;
    }
  } while (block.getNextBlock() == prevBlock);
  // This block is an enclosing parent, not just a statement in a stack.
  return block;
};

/**
 * Return the next statement block directly connected to this block.
 * @return {Blockly.Block} The next statement block or null.
 */
Blockly.Block.prototype.getNextBlock = function() {
  return this.nextConnection && this.nextConnection.targetBlock();
};

/**
 * Returns the block connected to the previous connection.
 * @return {Blockly.Block} The previous statement block or null.
 */
Blockly.Block.prototype.getPreviousBlock = function() {
  return this.previousConnection && this.previousConnection.targetBlock();
};

/**
 * Return the connection on the first statement input on this block, or null if
 * there are none.
 * @return {Blockly.Connection} The first statement connection or null.
 * @package
 */
Blockly.Block.prototype.getFirstStatementConnection = function() {
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    if (input.connection && input.connection.type == Blockly.NEXT_STATEMENT) {
      return input.connection;
    }
  }
  return null;
};

/**
 * Return the top-most block in this block's tree.
 * This will return itself if this block is at the top level.
 * @return {!Blockly.Block} The root block.
 */
Blockly.Block.prototype.getRootBlock = function() {
  var rootBlock;
  var block = this;
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
 * @return {!Blockly.Block} The top block in a stack.
 * @package
 */
Blockly.Block.prototype.getTopStackBlock = function() {
  var block = this;
  do {
    var previous = block.getPreviousBlock();
  } while (previous && previous.getNextBlock() == block && (block = previous));
  return block;
};

/**
 * Find all the blocks that are directly nested inside this one.
 * Includes value and statement inputs, as well as any following statement.
 * Excludes any connection on an output tab or any preceding statement.
 * Blocks are optionally sorted by position; top to bottom.
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
Blockly.Block.prototype.getChildren = function(ordered) {
  if (!ordered) {
    return this.childBlocks_;
  }
  var blocks = [];
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    if (input.connection) {
      var child = input.connection.targetBlock();
      if (child) {
        blocks.push(child);
      }
    }
  }
  var next = this.getNextBlock();
  if (next) {
    blocks.push(next);
  }
  return blocks;
};

/**
 * Set parent of this block to be a new block or null.
 * @param {Blockly.Block} newParent New parent block.
 */
Blockly.Block.prototype.setParent = function(newParent) {
  if (newParent == this.parentBlock_) {
    return;
  }
  if (this.parentBlock_) {
    // Remove this block from the old parent's child list.
    Blockly.utils.arrayRemove(this.parentBlock_.childBlocks_, this);

    // Disconnect from superior blocks.
    if (this.previousConnection && this.previousConnection.isConnected()) {
      throw Error('Still connected to previous block.');
    }
    if (this.outputConnection && this.outputConnection.isConnected()) {
      throw Error('Still connected to parent block.');
    }
    this.parentBlock_ = null;
    // This block hasn't actually moved on-screen, so there's no need to update
    // its connection locations.
  } else {
    // Remove this block from the workspace's list of top-most blocks.
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
 * @return {!Array.<!Blockly.Block>} Flattened array of blocks.
 */
Blockly.Block.prototype.getDescendants = function(ordered) {
  var blocks = [this];
  var childBlocks = this.getChildren(ordered);
  for (var child, i = 0; (child = childBlocks[i]); i++) {
    blocks.push.apply(blocks, child.getDescendants(ordered));
  }
  return blocks;
};

/**
 * Get whether this block is deletable or not.
 * @return {boolean} True if deletable.
 */
Blockly.Block.prototype.isDeletable = function() {
  return this.deletable_ && !this.isShadow_ &&
      !(this.workspace && this.workspace.options.readOnly);
};

/**
 * Set whether this block is deletable or not.
 * @param {boolean} deletable True if deletable.
 */
Blockly.Block.prototype.setDeletable = function(deletable) {
  this.deletable_ = deletable;
};

/**
 * Get whether this block is movable or not.
 * @return {boolean} True if movable.
 */
Blockly.Block.prototype.isMovable = function() {
  return this.movable_ && !this.isShadow_ &&
      !(this.workspace && this.workspace.options.readOnly);
};

/**
 * Set whether this block is movable or not.
 * @param {boolean} movable True if movable.
 */
Blockly.Block.prototype.setMovable = function(movable) {
  this.movable_ = movable;
};

/**
 * Get whether is block is duplicatable or not. If duplicating this block and
 * descendants will put this block over the workspace's capacity this block is
 * not duplicatable. If duplicating this block and descendants will put any
 * type over their maxInstances this block is not duplicatable.
 * @return {boolean} True if duplicatable.
 */
Blockly.Block.prototype.isDuplicatable = function() {
  if (!this.workspace.hasBlockLimits()) {
    return true;
  }
  return this.workspace.isCapacityAvailable(
      Blockly.utils.getBlockTypeCounts(this, true));
};

/**
 * Get whether this block is a shadow block or not.
 * @return {boolean} True if a shadow.
 */
Blockly.Block.prototype.isShadow = function() {
  return this.isShadow_;
};

/**
 * Set whether this block is a shadow block or not.
 * @param {boolean} shadow True if a shadow.
 */
Blockly.Block.prototype.setShadow = function(shadow) {
  this.isShadow_ = shadow;
};

/**
 * Get whether this block is an insertion marker block or not.
 * @return {boolean} True if an insertion marker.
 * @package
 */
Blockly.Block.prototype.isInsertionMarker = function() {
  return this.isInsertionMarker_;
};

/**
 * Set whether this block is an insertion marker block or not.
 * Once set this cannot be unset.
 * @param {boolean} insertionMarker True if an insertion marker.
 * @package
 */
Blockly.Block.prototype.setInsertionMarker = function(insertionMarker) {
  this.isInsertionMarker_ = insertionMarker;
};

/**
 * Get whether this block is editable or not.
 * @return {boolean} True if editable.
 */
Blockly.Block.prototype.isEditable = function() {
  return this.editable_ && !(this.workspace && this.workspace.options.readOnly);
};

/**
 * Set whether this block is editable or not.
 * @param {boolean} editable True if editable.
 */
Blockly.Block.prototype.setEditable = function(editable) {
  this.editable_ = editable;
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    for (var j = 0, field; (field = input.fieldRow[j]); j++) {
      field.updateEditable();
    }
  }
};

/**
 * Returns if this block has been disposed of / deleted.
 * @return {boolean} True if this block has been disposed of / deleted.
 */
Blockly.Block.prototype.isDisposed = function() {
  return this.disposed;
};

/**
 * Find the connection on this block that corresponds to the given connection
 * on the other block.
 * Used to match connections between a block and its insertion marker.
 * @param {!Blockly.Block} otherBlock The other block to match against.
 * @param {!Blockly.Connection} conn The other connection to match.
 * @return {Blockly.Connection} The matching connection on this block, or null.
 * @package
 */
Blockly.Block.prototype.getMatchingConnection = function(otherBlock, conn) {
  var connections = this.getConnections_(true);
  var otherConnections = otherBlock.getConnections_(true);
  if (connections.length != otherConnections.length) {
    throw Error("Connection lists did not match in length.");
  }
  for (var i = 0; i < otherConnections.length; i++) {
    if (otherConnections[i] == conn) {
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
Blockly.Block.prototype.setHelpUrl = function(url) {
  this.helpUrl = url;
};

/**
 * Sets the tooltip for this block.
 * @param {!Blockly.Tooltip.TipInfo} newTip The text for the tooltip, a function
 *     that returns the text for the tooltip, or a parent object whose tooltip
 *     will be used. To not display a tooltip pass the empty string.
 */
Blockly.Block.prototype.setTooltip = function(newTip) {
  this.tooltip = newTip;
};

/**
 * Returns the tooltip text for this block.
 * @returns {!string} The tooltip text for this block.
 */
Blockly.Block.prototype.getTooltip = function() {
  return Blockly.Tooltip.getTooltipOfObject(this);
};

/**
 * Get the colour of a block.
 * @return {string} #RRGGBB string.
 */
Blockly.Block.prototype.getColour = function() {
  return this.colour_;
};

/**
 * Get the name of the block style.
 * @return {?string} Name of the block style.
 */
Blockly.Block.prototype.getStyleName = function() {
  return this.styleName_;
};

/**
 * Get the HSV hue value of a block.  Null if hue not set.
 * @return {?number} Hue value (0-360).
 */
Blockly.Block.prototype.getHue = function() {
  return this.hue_;
};

/**
 * Change the colour of a block.
 * @param {number|string} colour HSV hue value (0 to 360), #RRGGBB string,
 *     or a message reference string pointing to one of those two values.
 */
Blockly.Block.prototype.setColour = function(colour) {
  var parsed = Blockly.utils.parseBlockColour(colour);
  this.hue_ = parsed.hue;
  this.colour_ = parsed.hex;
};

/**
 * Set the style and colour values of a block.
 * @param {string} blockStyleName Name of the block style
 */
Blockly.Block.prototype.setStyle = function(blockStyleName) {
  this.styleName_ = blockStyleName;
};

/**
 * Sets a callback function to use whenever the block's parent workspace
 * changes, replacing any prior onchange handler. This is usually only called
 * from the constructor, the block type initializer function, or an extension
 * initializer function.
 * @param {function(Blockly.Events.Abstract)} onchangeFn The callback to call
 *     when the block's workspace changes.
 * @throws {Error} if onchangeFn is not falsey and not a function.
 */
Blockly.Block.prototype.setOnChange = function(onchangeFn) {
  if (onchangeFn && typeof onchangeFn != 'function') {
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
 * @return {Blockly.Field} Named field, or null if field does not exist.
 */
Blockly.Block.prototype.getField = function(name) {
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    for (var j = 0, field; (field = input.fieldRow[j]); j++) {
      if (field.name == name) {
        return field;
      }
    }
  }
  return null;
};

/**
 * Return all variables referenced by this block.
 * @return {!Array.<string>} List of variable names.
 */
Blockly.Block.prototype.getVars = function() {
  var vars = [];
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    for (var j = 0, field; (field = input.fieldRow[j]); j++) {
      if (field.referencesVariables()) {
        vars.push(field.getValue());
      }
    }
  }
  return vars;
};

/**
 * Return all variables referenced by this block.
 * @return {!Array.<!Blockly.VariableModel>} List of variable models.
 * @package
 */
Blockly.Block.prototype.getVarModels = function() {
  var vars = [];
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    for (var j = 0, field; (field = input.fieldRow[j]); j++) {
      if (field.referencesVariables()) {
        var model = this.workspace.getVariableById(
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
 * @param {!Blockly.VariableModel} variable The variable being renamed.
 * @package
 */
Blockly.Block.prototype.updateVarName = function(variable) {
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    for (var j = 0, field; (field = input.fieldRow[j]); j++) {
      if (field.referencesVariables() &&
          variable.getId() == field.getValue()) {
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
Blockly.Block.prototype.renameVarById = function(oldId, newId) {
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    for (var j = 0, field; (field = input.fieldRow[j]); j++) {
      if (field.referencesVariables() &&
          oldId == field.getValue()) {
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
Blockly.Block.prototype.getFieldValue = function(name) {
  var field = this.getField(name);
  if (field) {
    return field.getValue();
  }
  return null;
};

/**
 * Sets the value of the given field for this block.
 * @param {*} newValue The value to set.
 * @param {!string} name The name of the field to set the value of.
 */
Blockly.Block.prototype.setFieldValue = function(newValue, name) {
  var field = this.getField(name);
  if (!field) {
    throw Error('Field "' + name + '" not found.');
  }
  field.setValue(newValue);
};

/**
 * Set whether this block can chain onto the bottom of another block.
 * @param {boolean} newBoolean True if there can be a previous statement.
 * @param {(string|Array.<string>|null)=} opt_check Statement type or
 *     list of statement types.  Null/undefined if any type could be connected.
 */
Blockly.Block.prototype.setPreviousStatement = function(newBoolean, opt_check) {
  if (newBoolean) {
    if (opt_check === undefined) {
      opt_check = null;
    }
    if (!this.previousConnection) {
      if (this.outputConnection) {
        throw Error('Remove output connection prior to adding previous ' +
            'connection.');
      }
      this.previousConnection =
          this.makeConnection_(Blockly.PREVIOUS_STATEMENT);
    }
    this.previousConnection.setCheck(opt_check);
  } else {
    if (this.previousConnection) {
      if (this.previousConnection.isConnected()) {
        throw Error('Must disconnect previous statement before removing ' +
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
 * @param {(string|Array.<string>|null)=} opt_check Statement type or
 *     list of statement types.  Null/undefined if any type could be connected.
 */
Blockly.Block.prototype.setNextStatement = function(newBoolean, opt_check) {
  if (newBoolean) {
    if (opt_check === undefined) {
      opt_check = null;
    }
    if (!this.nextConnection) {
      this.nextConnection = this.makeConnection_(Blockly.NEXT_STATEMENT);
    }
    this.nextConnection.setCheck(opt_check);
  } else {
    if (this.nextConnection) {
      if (this.nextConnection.isConnected()) {
        throw Error('Must disconnect next statement before removing ' +
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
 * @param {(string|Array.<string>|null)=} opt_check Returned type or list
 *     of returned types.  Null or undefined if any type could be returned
 *     (e.g. variable get).
 */
Blockly.Block.prototype.setOutput = function(newBoolean, opt_check) {
  if (newBoolean) {
    if (opt_check === undefined) {
      opt_check = null;
    }
    if (!this.outputConnection) {
      if (this.previousConnection) {
        throw Error('Remove previous connection prior to adding output ' +
            'connection.');
      }
      this.outputConnection = this.makeConnection_(Blockly.OUTPUT_VALUE);
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
Blockly.Block.prototype.setInputsInline = function(newBoolean) {
  if (this.inputsInline != newBoolean) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
        this, 'inline', null, this.inputsInline, newBoolean));
    this.inputsInline = newBoolean;
  }
};

/**
 * Get whether value inputs are arranged horizontally or vertically.
 * @return {boolean} True if inputs are horizontal.
 */
Blockly.Block.prototype.getInputsInline = function() {
  if (this.inputsInline != undefined) {
    // Set explicitly.
    return this.inputsInline;
  }
  // Not defined explicitly.  Figure out what would look best.
  for (var i = 1; i < this.inputList.length; i++) {
    if (this.inputList[i - 1].type == Blockly.DUMMY_INPUT &&
        this.inputList[i].type == Blockly.DUMMY_INPUT) {
      // Two dummy inputs in a row.  Don't inline them.
      return false;
    }
  }
  for (var i = 1; i < this.inputList.length; i++) {
    if (this.inputList[i - 1].type == Blockly.INPUT_VALUE &&
        this.inputList[i].type == Blockly.DUMMY_INPUT) {
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
Blockly.Block.prototype.setOutputShape = function(outputShape) {
  this.outputShape_ = outputShape;
};

/**
 * Get the block's output shape.
 * @return {?number} Value representing output shape if one exists.
 */
Blockly.Block.prototype.getOutputShape = function() {
  return this.outputShape_;
};

/**
 * Set whether the block is disabled or not.
 * @param {boolean} disabled True if disabled.
 * @deprecated May 2019
 */
Blockly.Block.prototype.setDisabled = function(disabled) {
  Blockly.utils.deprecation.warn(
      'Block.prototype.setDisabled',
      'May 2019',
      'May 2020',
      'Block.prototype.setEnabled');
  this.setEnabled(!disabled);
};

/**
 * Get whether this block is enabled or not.
 * @return {boolean} True if enabled.
 */
Blockly.Block.prototype.isEnabled = function() {
  return !this.disabled;
};

/**
 * Set whether the block is enabled or not.
 * @param {boolean} enabled True if enabled.
 */
Blockly.Block.prototype.setEnabled = function(enabled) {
  if (this.isEnabled() != enabled) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
        this, 'disabled', null, this.disabled, !enabled));
    this.disabled = !enabled;
  }
};

/**
 * Get whether the block is disabled or not due to parents.
 * The block's own disabled property is not considered.
 * @return {boolean} True if disabled.
 */
Blockly.Block.prototype.getInheritedDisabled = function() {
  var ancestor = this.getSurroundParent();
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
Blockly.Block.prototype.isCollapsed = function() {
  return this.collapsed_;
};

/**
 * Set whether the block is collapsed or not.
 * @param {boolean} collapsed True if collapsed.
 */
Blockly.Block.prototype.setCollapsed = function(collapsed) {
  if (this.collapsed_ != collapsed) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
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
Blockly.Block.prototype.toString = function(opt_maxLength, opt_emptyToken) {
  var text = [];
  var emptyFieldPlaceholder = opt_emptyToken || '?';

  // Temporarily set flag to navigate to all fields.
  var prevNavigateFields = Blockly.ASTNode.NAVIGATE_ALL_FIELDS;
  Blockly.ASTNode.NAVIGATE_ALL_FIELDS = true;

  var node = Blockly.ASTNode.createBlockNode(this);
  var rootNode = node;

  /**
   * Whether or not to add parentheses around an input.
   * @param {!Blockly.Connection} connection The connection.
   * @return {boolean} True if we should add parentheses around the input.
   */
  function shouldAddParentheses(connection) {
    var checks = connection.getCheck();
    if (!checks && connection.targetConnection) {
      checks = connection.targetConnection.getCheck();
    }
    return !!checks && (checks.indexOf('Boolean') != -1 ||
        checks.indexOf('Number') != -1);
  }

  /**
   * Check that we haven't circled back to the original root node.
   */
  function checkRoot() {
    if (node && node.getType() == rootNode.getType() &&
        node.getLocation() == rootNode.getLocation()) {
      node = null;
    }
  }

  // Traverse the AST building up our text string.
  while (node) {
    switch (node.getType()) {
      case Blockly.ASTNode.types.INPUT:
        var connection = /** @type {!Blockly.Connection} */ (node.getLocation());
        if (!node.in()) {
          text.push(emptyFieldPlaceholder);
        } else if (shouldAddParentheses(connection)) {
          text.push('(');
        }
        break;
      case Blockly.ASTNode.types.FIELD:
        var field = /** @type {Blockly.Field} */ (node.getLocation());
        if (field.name != Blockly.Block.COLLAPSED_FIELD_NAME) {
          text.push(field.getText());
        }
        break;
    }

    var current = node;
    node = current.in() || current.next();
    if (!node) {
      // Can't go in or next, keep going out until we can go next.
      node = current.out();
      checkRoot();
      while (node && !node.next()) {
        node = node.out();
        checkRoot();
        // If we hit an input on the way up, possibly close out parentheses.
        if (node && node.getType() == Blockly.ASTNode.types.INPUT &&
            shouldAddParentheses(
                /** @type {!Blockly.Connection} */ (node.getLocation()))) {
          text.push(')');
        }
      }
      if (node) {
        node = node.next();
      }
    }
  }

  // Restore state of NAVIGATE_ALL_FIELDS.
  Blockly.ASTNode.NAVIGATE_ALL_FIELDS = prevNavigateFields;

  // Run through our text array and simplify expression to remove parentheses
  // around single field blocks.
  for (var i = 2, l = text.length; i < l; i++) {
    if (text[i - 2] == '(' && text[i] == ')') {
      text[i - 2] = text[i - 1];
      text.splice(i - 1, 2);
      l -= 2;
    }
  }

  // Join the text array, removing spaces around added paranthesis.
  text = text.join(' ').replace(/(\() | (\))/gmi, '$1$2').trim() || '???';
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
 * @return {!Blockly.Input} The input object created.
 */
Blockly.Block.prototype.appendValueInput = function(name) {
  return this.appendInput_(Blockly.INPUT_VALUE, name);
};

/**
 * Shortcut for appending a statement input row.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 */
Blockly.Block.prototype.appendStatementInput = function(name) {
  return this.appendInput_(Blockly.NEXT_STATEMENT, name);
};

/**
 * Shortcut for appending a dummy input row.
 * @param {string=} opt_name Language-neutral identifier which may used to find
 *     this input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 */
Blockly.Block.prototype.appendDummyInput = function(opt_name) {
  return this.appendInput_(Blockly.DUMMY_INPUT, opt_name || '');
};

/**
 * Initialize this block using a cross-platform, internationalization-friendly
 * JSON description.
 * @param {!Object} json Structured data describing the block.
 */
Blockly.Block.prototype.jsonInit = function(json) {
  var warningPrefix = json['type'] ? 'Block "' + json['type'] + '": ' : '';

  // Validate inputs.
  if (json['output'] && json['previousStatement']) {
    throw Error(warningPrefix +
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
  var i = 0;
  while (json['message' + i] !== undefined) {
    this.interpolate_(json['message' + i], json['args' + i] || [],
        json['lastDummyAlign' + i], warningPrefix);
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
    var rawValue = json['tooltip'];
    var localizedText = Blockly.utils.replaceMessageReferences(rawValue);
    this.setTooltip(localizedText);
  }
  if (json['enableContextMenu'] !== undefined) {
    var rawValue = json['enableContextMenu'];
    this.contextMenu = !!rawValue;
  }
  if (json['helpUrl'] !== undefined) {
    var rawValue = json['helpUrl'];
    var localizedValue = Blockly.utils.replaceMessageReferences(rawValue);
    this.setHelpUrl(localizedValue);
  }
  if (typeof json['extensions'] == 'string') {
    console.warn(
        warningPrefix + 'JSON attribute \'extensions\' should be an array of' +
        ' strings. Found raw string in JSON for \'' + json['type'] +
        '\' block.');
    json['extensions'] = [json['extensions']];  // Correct and continue.
  }

  // Add the mutator to the block
  if (json['mutator'] !== undefined) {
    Blockly.Extensions.apply(json['mutator'], this, true);
  }

  if (Array.isArray(json['extensions'])) {
    var extensionNames = json['extensions'];
    for (var j = 0; j < extensionNames.length; ++j) {
      var extensionName = extensionNames[j];
      Blockly.Extensions.apply(extensionName, this, false);
    }
  }
};

/**
 * Initialize the colour of this block from the JSON description.
 * @param {!Object} json Structured data describing the block.
 * @param {string} warningPrefix Warning prefix string identifying block.
 * @private
 */
Blockly.Block.prototype.jsonInitColour_ = function(json, warningPrefix) {
  if ('colour' in json) {
    if (json['colour'] === undefined) {
      console.warn(warningPrefix + 'Undefined colour value.');
    } else {
      var rawValue = json['colour'];
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
Blockly.Block.prototype.jsonInitStyle_ = function(json, warningPrefix) {
  var blockStyleName = json['style'];
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
Blockly.Block.prototype.mixin = function(mixinObj, opt_disableCheck) {
  if (opt_disableCheck !== undefined && typeof opt_disableCheck != 'boolean') {
    throw Error('opt_disableCheck must be a boolean if provided');
  }
  if (!opt_disableCheck) {
    var overwrites = [];
    for (var key in mixinObj) {
      if (this[key] !== undefined) {
        overwrites.push(key);
      }
    }
    if (overwrites.length) {
      throw Error('Mixin will overwrite block members: ' +
          JSON.stringify(overwrites));
    }
  }
  Blockly.utils.object.mixin(this, mixinObj);
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
Blockly.Block.prototype.interpolate_ = function(message, args, lastDummyAlign,
    warningPrefix) {
  var tokens = Blockly.utils.tokenizeInterpolation(message);
  // Interpolate the arguments.  Build a list of elements.
  var indexDup = [];
  var indexCount = 0;
  var elements = [];
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    if (typeof token == 'number') {
      if (token <= 0 || token > args.length) {
        throw Error('Block "' + this.type + '": ' +
            'Message index %' + token + ' out of range.');
      }
      if (indexDup[token]) {
        throw Error('Block "' + this.type + '": ' +
            'Message index %' + token + ' duplicated.');
      }
      indexDup[token] = true;
      indexCount++;
      elements.push(args[token - 1]);
    } else {
      token = token.trim();
      if (token) {
        elements.push(token);
      }
    }
  }
  if (indexCount != args.length) {
    throw Error('Block "' + this.type + '": ' +
        'Message does not reference all ' + args.length + ' arg(s).');
  }
  // Add last dummy input if needed.
  if (elements.length && (typeof elements[elements.length - 1] == 'string' ||
      Blockly.utils.string.startsWith(
          elements[elements.length - 1]['type'], 'field_'))) {
    var dummyInput = {type: 'input_dummy'};
    if (lastDummyAlign) {
      dummyInput['align'] = lastDummyAlign;
    }
    elements.push(dummyInput);
  }
  // Lookup of alignment constants.
  var alignmentLookup = {
    'LEFT': Blockly.ALIGN_LEFT,
    'RIGHT': Blockly.ALIGN_RIGHT,
    'CENTRE': Blockly.ALIGN_CENTRE,
    'CENTER': Blockly.ALIGN_CENTRE
  };
  // Populate block with inputs and fields.
  var fieldStack = [];
  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    if (typeof element == 'string') {
      fieldStack.push([element, undefined]);
    } else {
      var field = null;
      var input = null;
      do {
        var altRepeat = false;
        if (typeof element == 'string') {
          field = new Blockly.FieldLabel(element);
        } else {
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
            default:
              // This should handle all field JSON parsing, including
              // options that can be applied to any field type.
              field = Blockly.fieldRegistry.fromJson(element);

              // Unknown field.
              if (!field && element['alt']) {
                element = element['alt'];
                altRepeat = true;
              }
          }
        }
      } while (altRepeat);
      if (field) {
        fieldStack.push([field, element['name']]);
      } else if (input) {
        if (element['check']) {
          input.setCheck(element['check']);
        }
        if (element['align']) {
          var alignment = alignmentLookup[element['align'].toUpperCase()];
          if (alignment === undefined) {
            console.warn(warningPrefix + 'Illegal align value: ',
                element['align']);
          } else {
            input.setAlign(alignment);
          }
        }
        for (var j = 0; j < fieldStack.length; j++) {
          input.appendField(fieldStack[j][0], fieldStack[j][1]);
        }
        fieldStack.length = 0;
      }
    }
  }
};

/**
 * Add a value input, statement input or local variable to this block.
 * @param {number} type Either Blockly.INPUT_VALUE or Blockly.NEXT_STATEMENT or
 *     Blockly.DUMMY_INPUT.
 * @param {string} name Language-neutral identifier which may used to find this
 *     input again.  Should be unique to this block.
 * @return {!Blockly.Input} The input object created.
 * @protected
 */
Blockly.Block.prototype.appendInput_ = function(type, name) {
  var connection = null;
  if (type == Blockly.INPUT_VALUE || type == Blockly.NEXT_STATEMENT) {
    connection = this.makeConnection_(type);
  }
  if (type == Blockly.NEXT_STATEMENT) {
    this.statementInputCount++;
  }
  var input = new Blockly.Input(type, name, this, connection);
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
Blockly.Block.prototype.moveInputBefore = function(name, refName) {
  if (name == refName) {
    return;
  }
  // Find both inputs.
  var inputIndex = -1;
  var refIndex = refName ? -1 : this.inputList.length;
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    if (input.name == name) {
      inputIndex = i;
      if (refIndex != -1) {
        break;
      }
    } else if (refName && input.name == refName) {
      refIndex = i;
      if (inputIndex != -1) {
        break;
      }
    }
  }
  if (inputIndex == -1) {
    throw Error('Named input "' + name + '" not found.');
  }
  if (refIndex == -1) {
    throw Error('Reference input "' + refName + '" not found.');
  }
  this.moveNumberedInputBefore(inputIndex, refIndex);
};

/**
 * Move a numbered input to a different location on this block.
 * @param {number} inputIndex Index of the input to move.
 * @param {number} refIndex Index of input that should be after the moved input.
 */
Blockly.Block.prototype.moveNumberedInputBefore = function(
    inputIndex, refIndex) {
  // Validate arguments.
  if (inputIndex == refIndex) {
    throw Error('Can\'t move input to itself.');
  }
  if (inputIndex >= this.inputList.length) {
    throw RangeError('Input index ' + inputIndex + ' out of bounds.');
  }
  if (refIndex > this.inputList.length) {
    throw RangeError('Reference input ' + refIndex + ' out of bounds.');
  }
  // Remove input.
  var input = this.inputList[inputIndex];
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
 * @return {boolean} True if operation succeeds, false if input is not present and opt_quiet is true
 * @throws {Error} if the input is not present and opt_quiet is not true.
 */
Blockly.Block.prototype.removeInput = function(name, opt_quiet) {
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    if (input.name == name) {
      if (input.type == Blockly.NEXT_STATEMENT) {
        this.statementInputCount--;
      }
      input.dispose();
      this.inputList.splice(i, 1);
      return true;
    }
  }
  if (opt_quiet) {
    return false;
  } else {
    throw Error('Input not found: ' + name);
  }
};

/**
 * Fetches the named input object.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 */
Blockly.Block.prototype.getInput = function(name) {
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    if (input.name == name) {
      return input;
    }
  }
  // This input does not exist.
  return null;
};

/**
 * Fetches the block attached to the named input.
 * @param {string} name The name of the input.
 * @return {Blockly.Block} The attached value block, or null if the input is
 *     either disconnected or if the input does not exist.
 */
Blockly.Block.prototype.getInputTargetBlock = function(name) {
  var input = this.getInput(name);
  return input && input.connection && input.connection.targetBlock();
};

/**
 * Returns the comment on this block (or null if there is no comment).
 * @return {?string} Block's comment.
 */
Blockly.Block.prototype.getCommentText = function() {
  return this.commentModel.text;
};

/**
 * Set this block's comment text.
 * @param {?string} text The text, or null to delete.
 */
Blockly.Block.prototype.setCommentText = function(text) {
  if (this.commentModel.text == text) {
    return;
  }
  Blockly.Events.fire(new Blockly.Events.BlockChange(
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
Blockly.Block.prototype.setWarningText = function(_text, _opt_id) {
  // NOP.
};

/**
 * Give this block a mutator dialog.
 * @param {Blockly.Mutator} _mutator A mutator dialog instance or null to
 *     remove.
 */
Blockly.Block.prototype.setMutator = function(_mutator) {
  // NOP.
};

/**
 * Return the coordinates of the top-left corner of this block relative to the
 * drawing surface's origin (0,0), in workspace units.
 * @return {!Blockly.utils.Coordinate} Object with .x and .y properties.
 */
Blockly.Block.prototype.getRelativeToSurfaceXY = function() {
  return this.xy_;
};

/**
 * Move a block by a relative offset.
 * @param {number} dx Horizontal offset, in workspace units.
 * @param {number} dy Vertical offset, in workspace units.
 */
Blockly.Block.prototype.moveBy = function(dx, dy) {
  if (this.parentBlock_) {
    throw Error('Block has parent.');
  }
  var event = new Blockly.Events.BlockMove(this);
  this.xy_.translate(dx, dy);
  event.recordNew();
  Blockly.Events.fire(event);
};

/**
 * Create a connection of the specified type.
 * @param {number} type The type of the connection to create.
 * @return {!Blockly.Connection} A new connection of the specified type.
 * @protected
 */
Blockly.Block.prototype.makeConnection_ = function(type) {
  return new Blockly.Connection(this, type);
};

/**
 * Recursively checks whether all statement and value inputs are filled with
 * blocks. Also checks all following statement blocks in this stack.
 * @param {boolean=} opt_shadowBlocksAreFilled An optional argument controlling
 *     whether shadow blocks are counted as filled. Defaults to true.
 * @return {boolean} True if all inputs are filled, false otherwise.
 */
Blockly.Block.prototype.allInputsFilled = function(opt_shadowBlocksAreFilled) {
  // Account for the shadow block filledness toggle.
  if (opt_shadowBlocksAreFilled === undefined) {
    opt_shadowBlocksAreFilled = true;
  }
  if (!opt_shadowBlocksAreFilled && this.isShadow()) {
    return false;
  }

  // Recursively check each input block of the current block.
  for (var i = 0, input; (input = this.inputList[i]); i++) {
    if (!input.connection) {
      continue;
    }
    var target = input.connection.targetBlock();
    if (!target || !target.allInputsFilled(opt_shadowBlocksAreFilled)) {
      return false;
    }
  }

  // Recursively check the next block after the current block.
  var next = this.getNextBlock();
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
 * child blocks), use [toString()]{@link Blockly.Block#toString}.
 * @return {string} The description.
 */
Blockly.Block.prototype.toDevString = function() {
  var msg = this.type ? '"' + this.type + '" block' : 'Block';
  if (this.id) {
    msg += ' (id="' + this.id + '")';
  }
  return msg;
};
