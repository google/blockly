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
 * @fileoverview The class representing one block.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Block');

goog.require('Blockly.Blocks');
goog.require('Blockly.Comment');
goog.require('Blockly.Connection');
goog.require('Blockly.Extensions');
goog.require('Blockly.Input');
goog.require('Blockly.Mutator');
goog.require('Blockly.Warning');
goog.require('Blockly.Workspace');
goog.require('Blockly.Xml');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.math.Coordinate');
goog.require('goog.string');


/**
 * Class for one block.
 * Not normally called directly, workspace.newBlock() is preferred.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new ID.
 * @constructor
 */
Blockly.Block = function(workspace, prototypeName, opt_id) {
  if (typeof Blockly.Generator.prototype[prototypeName] !== 'undefined') {
    console.warn('FUTURE ERROR: Block prototypeName "' + prototypeName
        + '" conflicts with Blockly.Generator members. Registering Generators '
        + 'for this block type will incur errors.'
        + '\nThis name will be DISALLOWED (throwing an error) in future '
        + 'versions of Blockly.');
  }

  /** @type {string} */
  this.id = (opt_id && !workspace.getBlockById(opt_id)) ?
      opt_id : Blockly.utils.genUid();
  workspace.blockDB_[this.id] = this;
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
  /** @type {boolean} */
  this.disabled = false;
  /** @type {string|!Function} */
  this.tooltip = '';
  /** @type {boolean} */
  this.contextMenu = true;

  /**
   * @type {Blockly.Block}
   * @private
   */
  this.parentBlock_ = null;

  /**
   * @type {!Array.<!Blockly.Block>}
   * @private
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
   * @private
   */
  this.collapsed_ = false;

  /** @type {string|Blockly.Comment} */
  this.comment = null;

  /**
   * The block's position in workspace units.  (0, 0) is at the workspace's
   * origin; scale does not change this value.
   * @type {!goog.math.Coordinate}
   * @private
   */
  this.xy_ = new goog.math.Coordinate(0, 0);

  /** @type {!Blockly.Workspace} */
  this.workspace = workspace;
  /** @type {boolean} */
  this.isInFlyout = workspace.isFlyout;
  /** @type {boolean} */
  this.isInMutator = workspace.isMutator;

  /** @type {boolean} */
  this.RTL = workspace.RTL;

  // Copy the type-specific functions and data from the prototype.
  if (prototypeName) {
    /** @type {string} */
    this.type = prototypeName;
    var prototype = Blockly.Blocks[prototypeName];
    goog.asserts.assertObject(prototype,
        'Error: Unknown block type "%s".', prototypeName);
    goog.mixin(this, prototype);
  }

  workspace.addTopBlock(this);

  // Call an initialization function, if it exists.
  if (goog.isFunction(this.init)) {
    this.init();
  }
  // Record initial inline state.
  /** @type {boolean|undefined} */
  this.inputsInlineDefault = this.inputsInline;

  // Fire a create event.
  if (Blockly.Events.isEnabled()) {
    var existingGroup = Blockly.Events.getGroup();
    if (!existingGroup) {
      Blockly.Events.setGroup(true);
    }
    try {
      Blockly.Events.fire(new Blockly.Events.BlockCreate(this));
    } finally {
      if (!existingGroup) {
        Blockly.Events.setGroup(false);
      }
    }

  }
  // Bind an onchange function, if it exists.
  if (goog.isFunction(this.onchange)) {
    this.setOnChange(this.onchange);
  }
};

/**
 * Obtain a newly created block.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @return {!Blockly.Block} The created block.
 * @deprecated December 2015
 */
Blockly.Block.obtain = function(workspace, prototypeName) {
  console.warn('Deprecated call to Blockly.Block.obtain, ' +
               'use workspace.newBlock instead.');
  return workspace.newBlock(prototypeName);
};

/**
 * Optional text data that round-trips beween blocks and XML.
 * Has no effect. May be used by 3rd parties for meta information.
 * @type {?string}
 */
Blockly.Block.prototype.data = null;

/**
 * Colour of the block in '#RRGGBB' format.
 * @type {string}
 * @private
 */
Blockly.Block.prototype.colour_ = '#000000';

/**
 * Colour of the block as HSV hue value (0-360)
 * @type {?number}
 * @private
  */
Blockly.Block.prototype.hue_ = null;

/**
 * Dispose of this block.
 * @param {boolean} healStack If true, then try to heal any gap by connecting
 *     the next statement with the previous statement.  Otherwise, dispose of
 *     all children of this block.
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
      // Remove from block database.
      delete this.workspace.blockDB_[this.id];
      this.workspace = null;
    }

    // Just deleting this block from the DOM would result in a memory leak as
    // well as corruption of the connection database.  Therefore we must
    // methodically step through the blocks and carefully disassemble them.

    // First, dispose of all my children.
    for (var i = this.childBlocks_.length - 1; i >= 0; i--) {
      this.childBlocks_[i].dispose(false);
    }
    // Then dispose of myself.
    // Dispose of all inputs and their fields.
    for (var i = 0, input; input = this.inputList[i]; i++) {
      input.dispose();
    }
    this.inputList.length = 0;
    // Dispose of any remaining connections (next/previous/output).
    var connections = this.getConnections_(true);
    for (var i = 0; i < connections.length; i++) {
      var connection = connections[i];
      if (connection.isConnected()) {
        connection.disconnect();
      }
      connections[i].dispose();
    }
  } finally {
    Blockly.Events.enable();
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
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
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
    if (this.outputConnection.isConnected()) {
      // Disconnect from any superior block.
      this.outputConnection.disconnect();
    }
  } else if (this.previousConnection) {
    var previousTarget = null;
    if (this.previousConnection.isConnected()) {
      // Remember the connection that any next statements need to connect to.
      previousTarget = this.previousConnection.targetConnection;
      // Detach this block from the parent's tree.
      this.previousConnection.disconnect();
    }
    var nextBlock = this.getNextBlock();
    if (opt_healStack && nextBlock) {
      // Disconnect the next statement.
      var nextTarget = this.nextConnection.targetConnection;
      nextTarget.disconnect();
      if (previousTarget && previousTarget.checkType_(nextTarget)) {
        // Attach the next statement to the previous statement.
        previousTarget.connect(nextTarget);
      }
    }
  }
};

/**
 * Returns all connections originating from this block.
 * @param {boolean} all If true, return all connections even hidden ones.
 * @return {!Array.<!Blockly.Connection>} Array of connections.
 * @private
 */
Blockly.Block.prototype.getConnections_ = function(
    /* eslint-disable no-unused-vars */ all
    /* eslint-enable no-unused-vars */) {
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
  for (var i = 0, input; input = this.inputList[i]; i++) {
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
Blockly.Block.prototype.lastConnectionInStack_ = function() {
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
 * @private
 */
Blockly.Block.prototype.bumpNeighbours_ = function() {
  console.warn('Not expected to reach this bumpNeighbours_ function. The ' +
    'BlockSvg function for bumpNeighbours_ was expected to be called instead.');
};

/**
 * Return the parent block or null if this block is at the top level.
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
  for (var i = 0, input; input = this.inputList[i]; i++) {
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
 * Find all the blocks that are directly nested inside this one.
 * Includes value and block inputs, as well as any following statement.
 * Excludes any connection on an output tab or any preceding statement.
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
Blockly.Block.prototype.getChildren = function() {
  return this.childBlocks_;
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
    goog.array.remove(this.parentBlock_.childBlocks_, this);

    // Disconnect from superior blocks.
    if (this.previousConnection && this.previousConnection.isConnected()) {
      throw 'Still connected to previous block.';
    }
    if (this.outputConnection && this.outputConnection.isConnected()) {
      throw 'Still connected to parent block.';
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
 * Includes value and block inputs, as well as any following statements.
 * Excludes any connection on an output tab or any preceding statements.
 * @return {!Array.<!Blockly.Block>} Flattened array of blocks.
 */
Blockly.Block.prototype.getDescendants = function() {
  var blocks = [this];
  for (var child, x = 0; child = this.childBlocks_[x]; x++) {
    blocks.push.apply(blocks, child.getDescendants());
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
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      field.updateEditable();
    }
  }
};

/**
 * Set whether the connections are hidden (not tracked in a database) or not.
 * Recursively walk down all child blocks (except collapsed blocks).
 * @param {boolean} hidden True if connections are hidden.
 */
Blockly.Block.prototype.setConnectionsHidden = function(hidden) {
  if (!hidden && this.isCollapsed()) {
    if (this.outputConnection) {
      this.outputConnection.setHidden(hidden);
    }
    if (this.previousConnection) {
      this.previousConnection.setHidden(hidden);
    }
    if (this.nextConnection) {
      this.nextConnection.setHidden(hidden);
      var child = this.nextConnection.targetBlock();
      if (child) {
        child.setConnectionsHidden(hidden);
      }
    }
  } else {
    var myConnections = this.getConnections_(true);
    for (var i = 0, connection; connection = myConnections[i]; i++) {
      connection.setHidden(hidden);
      if (connection.isSuperior()) {
        var child = connection.targetBlock();
        if (child) {
          child.setConnectionsHidden(hidden);
        }
      }
    }
  }
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
 * Change the tooltip text for a block.
 * @param {string|!Function} newTip Text for tooltip or a parent element to
 *     link to for its tooltip.  May be a function that returns a string.
 */
Blockly.Block.prototype.setTooltip = function(newTip) {
  this.tooltip = newTip;
};

/**
 * Get the colour of a block.
 * @return {string} #RRGGBB string.
 */
Blockly.Block.prototype.getColour = function() {
  return this.colour_;
};

/**
 * Get the HSV hue value of a block. Null if hue not set.
 * @return {?number} Hue value (0-360)
 */
Blockly.Block.prototype.getHue = function() {
  return this.hue_;
};

/**
 * Change the colour of a block.
 * @param {number|string} colour HSV hue value, or #RRGGBB string.
 */
Blockly.Block.prototype.setColour = function(colour) {
  var hue = Number(colour);
  if (!isNaN(hue) && 0 <= hue && hue <= 360) {
    this.hue_ = hue;
    this.colour_ = Blockly.hueToRgb(hue);
  } else if (goog.isString(colour) && /^#[0-9a-fA-F]{6}$/.test(colour)) {
    this.colour_ = colour;
    // Only store hue if colour is set as a hue.
    this.hue_ = null;
  } else {
    throw 'Invalid colour: ' + colour;
  }
};

/**
 * Sets a callback function to use whenever the block's parent workspace
 * changes, replacing any prior onchange handler. This is usually only called
 * from the constructor, the block type initializer function, or an extension
 * initializer function.
 * @param {function(Blockly.Events.Abstract)} onchangeFn The callback to call
 *     when the block's workspace changes.
 * @throws {Error} if onchangeFn is not falsey or a function.
 */
Blockly.Block.prototype.setOnChange = function(onchangeFn) {
  if (onchangeFn && !goog.isFunction(onchangeFn)) {
    throw new Error("onchange must be a function.");
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
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (field.name === name) {
        return field;
      }
    }
  }
  return null;
};

/**
 * Return all variables referenced by this block.
 * @return {!Array.<string>} List of variable names.
 * @package
 */
Blockly.Block.prototype.getVars = function() {
  var vars = [];
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (field instanceof Blockly.FieldVariable) {
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
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (field instanceof Blockly.FieldVariable) {
        var model = this.workspace.getVariableById(field.getValue());
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
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (field instanceof Blockly.FieldVariable &&
          variable.getId() == field.getValue()) {
        field.setText(variable.name);
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
  for (var i = 0, input; input = this.inputList[i]; i++) {
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (field instanceof Blockly.FieldVariable &&
          oldId == field.getValue()) {
        field.setValue(newId);
      }
    }
  }
};

/**
 * Returns the language-neutral value from the field of a block.
 * @param {string} name The name of the field.
 * @return {?string} Value from the field or null if field does not exist.
 */
Blockly.Block.prototype.getFieldValue = function(name) {
  var field = this.getField(name);
  if (field) {
    return field.getValue();
  }
  return null;
};

/**
 * Change the field value for a block (e.g. 'CHOOSE' or 'REMOVE').
 * @param {string} newValue Value to be the new field.
 * @param {string} name The name of the field.
 */
Blockly.Block.prototype.setFieldValue = function(newValue, name) {
  var field = this.getField(name);
  goog.asserts.assertObject(field, 'Field "%s" not found.', name);
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
      goog.asserts.assert(!this.outputConnection,
          'Remove output connection prior to adding previous connection.');
      this.previousConnection =
          this.makeConnection_(Blockly.PREVIOUS_STATEMENT);
    }
    this.previousConnection.setCheck(opt_check);
  } else {
    if (this.previousConnection) {
      goog.asserts.assert(!this.previousConnection.isConnected(),
          'Must disconnect previous statement before removing connection.');
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
      goog.asserts.assert(!this.nextConnection.isConnected(),
          'Must disconnect next statement before removing connection.');
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
      goog.asserts.assert(!this.previousConnection,
          'Remove previous connection prior to adding output connection.');
      this.outputConnection = this.makeConnection_(Blockly.OUTPUT_VALUE);
    }
    this.outputConnection.setCheck(opt_check);
  } else {
    if (this.outputConnection) {
      goog.asserts.assert(!this.outputConnection.isConnected(),
          'Must disconnect output value before removing connection.');
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
 * Set whether the block is disabled or not.
 * @param {boolean} disabled True if disabled.
 */
Blockly.Block.prototype.setDisabled = function(disabled) {
  if (this.disabled != disabled) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
        this, 'disabled', null, this.disabled, disabled));
    this.disabled = disabled;
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
  if (this.collapsed_) {
    text.push(this.getInput('_TEMP_COLLAPSED_INPUT').fieldRow[0].text_);
  } else {
    for (var i = 0, input; input = this.inputList[i]; i++) {
      for (var j = 0, field; field = input.fieldRow[j]; j++) {
        if (field instanceof Blockly.FieldDropdown && !field.getValue()) {
          text.push(emptyFieldPlaceholder);
        } else {
          text.push(field.getText());
        }
      }
      if (input.connection) {
        var child = input.connection.targetBlock();
        if (child) {
          text.push(child.toString(undefined, opt_emptyToken));
        } else {
          text.push(emptyFieldPlaceholder);
        }
      }
    }
  }
  text = goog.string.trim(text.join(' ')) || '???';
  if (opt_maxLength) {
    // TODO: Improve truncation so that text from this block is given priority.
    // E.g. "1+2+3+4+5+6+7+8+9=0" should be "...6+7+8+9=0", not "1+2+3+4+5...".
    // E.g. "1+2+3+4+5=6+7+8+9+0" should be "...4+5=6+7...".
    text = goog.string.truncate(text, opt_maxLength);
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

  // Validate inputs.
  goog.asserts.assert(
      json['output'] == undefined || json['previousStatement'] == undefined,
      'Must not have both an output and a previousStatement.');

  // Set basic properties of block.
  if (json['colour'] !== undefined) {
    var rawValue = json['colour'];
    var colour = goog.isString(rawValue) ?
        Blockly.utils.replaceMessageReferences(rawValue) : rawValue;
    this.setColour(colour);
  }

  // Interpolate the message blocks.
  var i = 0;
  while (json['message' + i] !== undefined) {
    this.interpolate_(json['message' + i], json['args' + i] || [],
        json['lastDummyAlign' + i]);
    i++;
  }

  if (json['inputsInline'] !== undefined) {
    this.setInputsInline(json['inputsInline']);
  }
  // Set output and previous/next connections.
  if (json['output'] !== undefined) {
    this.setOutput(true, json['output']);
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
  if (goog.isString(json['extensions'])) {
    console.warn('JSON attribute \'extensions\' should be an array of ' +
      'strings. Found raw string in JSON for \'' + json['type'] + '\' block.');
    json['extensions'] = [json['extensions']];  // Correct and continue.
  }

  // Add the mutator to the block
  if (json['mutator'] !== undefined) {
    Blockly.Extensions.apply(json['mutator'], this, true);
  }

  if (Array.isArray(json['extensions'])) {
    var extensionNames = json['extensions'];
    for (var i = 0; i < extensionNames.length; ++i) {
      var extensionName = extensionNames[i];
      Blockly.Extensions.apply(extensionName, this, false);
    }
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
  if (goog.isDef(opt_disableCheck) && !goog.isBoolean(opt_disableCheck)) {
    throw new Error("opt_disableCheck must be a boolean if provided");
  }
  if (!opt_disableCheck) {
    var overwrites = [];
    for (var key in mixinObj) {
      if (this[key] !== undefined) {
        overwrites.push(key);
      }
    }
    if (overwrites.length) {
      throw new Error('Mixin will overwrite block members: ' +
        JSON.stringify(overwrites));
    }
  }
  goog.mixin(this, mixinObj);
};

/**
 * Interpolate a message description onto the block.
 * @param {string} message Text contains interpolation tokens (%1, %2, ...)
 *     that match with fields or inputs defined in the args array.
 * @param {!Array} args Array of arguments to be interpolated.
 * @param {string=} lastDummyAlign If a dummy input is added at the end,
 *     how should it be aligned?
 * @private
 */
Blockly.Block.prototype.interpolate_ = function(message, args, lastDummyAlign) {
  var tokens = Blockly.utils.tokenizeInterpolation(message);
  // Interpolate the arguments.  Build a list of elements.
  var indexDup = [];
  var indexCount = 0;
  var elements = [];
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    if (typeof token == 'number') {
      if (token <= 0 || token > args.length) {
        throw new Error('Block "' + this.type + '": ' +
            'Message index %' + token + ' out of range.');
      }
      if (indexDup[token]) {
        throw new Error('Block "' + this.type + '": ' +
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
  if(indexCount != args.length) {
    throw new Error('Block "' + this.type + '": ' +
        'Message does not reference all ' + args.length + ' arg(s).');
  }
  // Add last dummy input if needed.
  if (elements.length && (typeof elements[elements.length - 1] == 'string' ||
      goog.string.startsWith(
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
    'CENTRE': Blockly.ALIGN_CENTRE
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
            case 'field_label':
              field = Blockly.FieldLabel.fromJson(element);
              break;
            case 'field_input':
              field = Blockly.FieldTextInput.fromJson(element);
              break;
            case 'field_angle':
              field = Blockly.FieldAngle.fromJson(element);
              break;
            case 'field_checkbox':
              field = Blockly.FieldCheckbox.fromJson(element);
              break;
            case 'field_colour':
              field = Blockly.FieldColour.fromJson(element);
              break;
            case 'field_variable':
              field = Blockly.FieldVariable.fromJson(element);
              break;
            case 'field_dropdown':
              field = Blockly.FieldDropdown.fromJson(element);
              break;
            case 'field_image':
              field = Blockly.FieldImage.fromJson(element);
              break;
            case 'field_number':
              field = Blockly.FieldNumber.fromJson(element);
              break;
            case 'field_date':
              if (Blockly.FieldDate) {
                field = Blockly.FieldDate.fromJson(element);
                break;
              }
              // Fall through if FieldDate is not compiled in.
            default:
              // Unknown field.
              if (element['alt']) {
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
          input.setAlign(alignmentLookup[element['align']]);
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
 * @private
 */
Blockly.Block.prototype.appendInput_ = function(type, name) {
  var connection = null;
  if (type == Blockly.INPUT_VALUE || type == Blockly.NEXT_STATEMENT) {
    connection = this.makeConnection_(type);
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
  for (var i = 0, input; input = this.inputList[i]; i++) {
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
  goog.asserts.assert(inputIndex != -1, 'Named input "%s" not found.', name);
  goog.asserts.assert(
      refIndex != -1, 'Reference input "%s" not found.', refName);
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
  goog.asserts.assert(inputIndex != refIndex, 'Can\'t move input to itself.');
  goog.asserts.assert(inputIndex < this.inputList.length,
      'Input index ' + inputIndex + ' out of bounds.');
  goog.asserts.assert(refIndex <= this.inputList.length,
      'Reference input ' + refIndex + ' out of bounds.');
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
 * @param {boolean=} opt_quiet True to prevent error if input is not present.
 * @throws {goog.asserts.AssertionError} if the input is not present and
 *     opt_quiet is not true.
 */
Blockly.Block.prototype.removeInput = function(name, opt_quiet) {
  for (var i = 0, input; input = this.inputList[i]; i++) {
    if (input.name == name) {
      if (input.connection && input.connection.isConnected()) {
        input.connection.setShadowDom(null);
        var block = input.connection.targetBlock();
        if (block.isShadow()) {
          // Destroy any attached shadow block.
          block.dispose();
        } else {
          // Disconnect any attached normal block.
          block.unplug();
        }
      }
      input.dispose();
      this.inputList.splice(i, 1);
      return;
    }
  }
  if (!opt_quiet) {
    goog.asserts.fail('Input "%s" not found.', name);
  }
};

/**
 * Fetches the named input object.
 * @param {string} name The name of the input.
 * @return {Blockly.Input} The input object, or null if input does not exist.
 */
Blockly.Block.prototype.getInput = function(name) {
  for (var i = 0, input; input = this.inputList[i]; i++) {
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
 * Returns the comment on this block (or '' if none).
 * @return {string} Block's comment.
 */
Blockly.Block.prototype.getCommentText = function() {
  return this.comment || '';
};

/**
 * Set this block's comment text.
 * @param {?string} text The text, or null to delete.
 */
Blockly.Block.prototype.setCommentText = function(text) {
  if (this.comment != text) {
    Blockly.Events.fire(new Blockly.Events.BlockChange(
        this, 'comment', null, this.comment, text || ''));
    this.comment = text;
  }
};

/**
 * Set this block's warning text.
 * @param {?string} text The text, or null to delete.
 * @param {string=} opt_id An optional ID for the warning text to be able to
 *     maintain multiple warnings.
 */
Blockly.Block.prototype.setWarningText = function(text,
    /* eslint-disable no-unused-vars */ opt_id
    /* eslint-enable no-unused-vars */) {
  // NOP.
};

/**
 * Give this block a mutator dialog.
 * @param {Blockly.Mutator} mutator A mutator dialog instance or null to remove.
 */
Blockly.Block.prototype.setMutator = function(
    /* eslint-disable no-unused-vars */ mutator
    /* eslint-enable no-unused-vars */) {
  // NOP.
};

/**
 * Return the coordinates of the top-left corner of this block relative to the
 * drawing surface's origin (0,0), in workspace units.
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
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
  goog.asserts.assert(!this.parentBlock_, 'Block has parent.');
  var event = new Blockly.Events.BlockMove(this);
  this.xy_.translate(dx, dy);
  event.recordNew();
  Blockly.Events.fire(event);
};

/**
 * Create a connection of the specified type.
 * @param {number} type The type of the connection to create.
 * @return {!Blockly.Connection} A new connection of the specified type.
 * @private
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
  for (var i = 0, input; input = this.inputList[i]; i++) {
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
