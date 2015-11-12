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
goog.require('Blockly.Input');
goog.require('Blockly.Mutator');
goog.require('Blockly.Warning');
goog.require('Blockly.Workspace');
goog.require('Blockly.Xml');
goog.require('Blockly.FieldClickImage');
goog.require('Blockly.FieldScopeVariable');
goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.math.Coordinate');
goog.require('goog.string');


/**
* Class for one block.
* @constructor
*/
Blockly.Block = function() {
  // We assert this here because there may be users of the previous form of
  // this constructor, which took arguments.
  goog.asserts.assert(arguments.length == 0,
      'Please use Blockly.Block.obtain.');
};

/**
 * Obtain a newly created block.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @return {!Blockly.Block} The created block
 */
Blockly.Block.obtain = function(workspace, prototypeName) {
  if (Blockly.Realtime.isEnabled()) {
    return Blockly.Realtime.obtainBlock(workspace, prototypeName);
  } else {
    if (workspace.rendered) {
      var newBlock = new Blockly.BlockSvg();
    } else {
      var newBlock = new Blockly.Block();
    }
    newBlock.initialize(workspace, prototypeName);
    return newBlock;
  }
};

/**
 * Optional text data that round-trips beween blocks and XML.
 * Has no effect. May be used by 3rd parties for meta information.
 * @type {?string}
 */
Blockly.Block.prototype.data = null;

/**
 * Initialization for one block.
 * @param {!Blockly.Workspace} workspace The new block's workspace.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 */
Blockly.Block.prototype.initialize = function(workspace, prototypeName) {
  /** @type {string} */
  this.id = Blockly.Blocks.genUid();
  workspace.addTopBlock(this);
  this.fill(workspace, prototypeName);
};

/**
 * Fill a block with initial values.
 * @param {!Blockly.Workspace} workspace The workspace to use.
 * @param {string} prototypeName The typename of the block.
 */
Blockly.Block.prototype.fill = function(workspace, prototypeName) {
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
  this.rendered = false;
  /** @type {boolean} */
  this.disabled = false;
  /** @type {string|!Function} */
  this.tooltip = '';
  /** @type {boolean} */
  this.contextMenu = true;

  /** @type {Blockly.Block} */
  this.parentBlock_ = null;
  /** @type {!Array.<!Blockly.Block>} */
  this.childBlocks_ = [];
  /** @type {boolean} */
  this.deletable_ = true;
  /** @type {boolean} */
  this.movable_ = true;
  /** @type {boolean} */
  this.editable_ = true;
  /** @type {boolean} */
  this.isShadow_ = false;
  /** @type {boolean} */
  this.collapsed_ = false;

  /** @type {string|Blockly.Comment} */
  this.comment = null;

  /** @type {!goog.math.Coordinate} */
  this.xy_ = new goog.math.Coordinate(0, 0);

  /** @type {!Blockly.Workspace} */
  this.workspace = workspace;
  /** @type {boolean} */
  this.isInFlyout = workspace.isFlyout;
  /** @type {boolean} */
  this.RTL = workspace.RTL;

  // Copy the type-specific functions and data from the prototype.
  if (prototypeName) {
    /** @type {string} */
    this.type = prototypeName;
    var prototype = Blockly.Blocks[prototypeName];
    goog.asserts.assertObject(prototype,
        'Error: "%s" is an unknown language block.', prototypeName);
    goog.mixin(this, prototype);
  }
  // Call an initialization function, if it exists.
  if (goog.isFunction(this.init)) {
    this.init();
  }
  // Record initial inline state.
  /** @type {boolean|undefined} */
  this.inputsInlineDefault = this.inputsInline;
};

/**
 * Get an existing block.
 * @param {string} id The block's id.
 * @param {!Blockly.Workspace} workspace The block's workspace.
 * @return {Blockly.Block} The found block, or null if not found.
 */
Blockly.Block.getById = function(id, workspace) {
  if (Blockly.Realtime.isEnabled()) {
    return Blockly.Realtime.getBlockById(id);
  } else {
    return workspace.getBlockById(id);
  }
};

/**
 * Dispose of this block.
 * @param {boolean} healStack If true, then try to heal any gap by connecting
 *     the next statement with the previous statement.  Otherwise, dispose of
 *     all children of this block.
 * @param {boolean} animate If true, show a disposal animation and sound.
 * @param {boolean=} opt_dontRemoveFromWorkspace If true, don't remove this
 *     block from the workspace's list of top blocks.
 */
Blockly.Block.prototype.dispose = function(healStack, animate,
                                           opt_dontRemoveFromWorkspace) {
  this.unplug(healStack, false);

  // This block is now at the top of the workspace.
  // Remove this block from the workspace's list of top-most blocks.
  if (this.workspace && !opt_dontRemoveFromWorkspace) {
    this.workspace.removeTopBlock(this);
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
  for (var i = 0, input; input = this.inputList[i]; i++) {
    input.dispose();
  }
  this.inputList.length = 0;
  // Dispose of any remaining connections (next/previous/output).
  var connections = this.getConnections_(true);
  for (var i = 0; i < connections.length; i++) {
    var connection = connections[i];
    if (connection.targetConnection) {
      connection.disconnect();
    }
    connections[i].dispose();
  }
  // Remove from Realtime set of blocks.
  if (Blockly.Realtime.isEnabled() && !Blockly.Realtime.withinSync) {
    Blockly.Realtime.removeBlock(this);
  }
};

/**
 * Unplug this block from its superior block.  If this block is a statement,
 * optionally reconnect the block underneath with the block on top.
 * @param {boolean} healStack Disconnect child statement and reconnect stack.
 * @param {boolean} bump Move the unplugged block sideways a short distance.
 */
Blockly.Block.prototype.unplug = function(healStack, bump) {
  bump = bump && !!this.getParent();
  if (this.outputConnection) {
    if (this.outputConnection.targetConnection) {
      // Disconnect from any superior block.
      this.setParent(null);
    }
  } else {
    var previousTarget = null;
    if (this.previousConnection && this.previousConnection.targetConnection) {
      // Remember the connection that any next statements need to connect to.
      previousTarget = this.previousConnection.targetConnection;
      // Detach this block from the parent's tree.
      this.setParent(null);
    }
    var nextBlock = this.getNextBlock();
    if (healStack && nextBlock) {
      // Disconnect the next statement.
      var nextTarget = this.nextConnection.targetConnection;
      nextBlock.setParent(null);
      if (previousTarget && previousTarget.checkType_(nextTarget)) {
        // Attach the next statement to the previous statement.
        previousTarget.connect(nextTarget);
      }
    }
  }
  if (bump) {
    // Bump the block sideways.
    var dx = Blockly.SNAP_RADIUS * (this.RTL ? -1 : 1);
    var dy = Blockly.SNAP_RADIUS * 2;
    this.moveBy(dx, dy);
  }
};

/**
 * Returns all connections originating from this block.
 * @param {boolean} all If true, return all connections even hidden ones.
 *     Otherwise return those that are visible.
 * @return {!Array.<!Blockly.Connection>} Array of connections.
 * @private
 */
Blockly.Block.prototype.getConnections_ = function(all) {
  var myConnections = [];
  if (all || this.rendered) {
    if (this.outputConnection) {
      myConnections.push(this.outputConnection);
    }
    if (this.previousConnection) {
      myConnections.push(this.previousConnection);
    }
    if (this.nextConnection) {
      myConnections.push(this.nextConnection);
    }
    if (all || !this.collapsed_) {
      for (var i = 0, input; input = this.inputList[i]; i++) {
        if (input.connection) {
          myConnections.push(input.connection);
        }
      }
    }
  }
  return myConnections;
};

/**
 * Bump unconnected blocks out of alignment.  Two blocks which aren't actually
 * connected should not coincidentally line up on screen.
 * @private
 */
Blockly.Block.prototype.bumpNeighbours_ = function() {
  if (!this.workspace) {
    return;  // Deleted block.
  }
  if (Blockly.dragMode_ != 0) {
    return;  // Don't bump blocks during a drag.
  }
  var rootBlock = this.getRootBlock();
  if (rootBlock.isInFlyout) {
    return;  // Don't move blocks around in a flyout.
  }
  // Loop though every connection on this block.
  var myConnections = this.getConnections_(false);
  for (var i = 0, connection; connection = myConnections[i]; i++) {
    // Spider down from this block bumping all sub-blocks.
    if (connection.targetConnection && connection.isSuperior()) {
      connection.targetBlock().bumpNeighbours_();
    }

    var neighbours = connection.neighbours_(Blockly.SNAP_RADIUS);
    for (var j = 0, otherConnection; otherConnection = neighbours[j]; j++) {
      // If both connections are connected, that's probably fine.  But if
      // either one of them is unconnected, then there could be confusion.
      if (!connection.targetConnection || !otherConnection.targetConnection) {
        // Only bump blocks if they are from different tree structures.
        if (otherConnection.sourceBlock_.getRootBlock() != rootBlock) {
          // Always bump the inferior block.
          if (connection.isSuperior()) {
            otherConnection.bumpAwayFrom_(connection);
          } else {
            connection.bumpAwayFrom_(otherConnection);
          }
        }
      }
    }
  }
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
 * Return the parent block that surrounds the current block, or null if this
 * block has no surrounding block.  A parent block might just be the previous
 * statement, whereas the surrounding block is an if statement, while loop, etc.
 * @return {Blockly.Block} The block that surrounds the current block.
 */
Blockly.Block.prototype.getSurroundParent = function() {
  var block = this;
  while (true) {
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
  }
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
 * Find all the blocks that are directly nested inside this one.
 * Includes value and block inputs.
 * Excludes any connection on an output tab,any following statement, or any preceding statement.
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
Blockly.Block.prototype.getDirectChildren = function() {
    var children = this.getChildren();
    var result = [];
    for (var i = 0, block; block = children[i]; i++) {
      if (block && block.getSurroundParent() == this)
      {
          result.push(block);
      }
    }
    return result;
};

/**
 * Find all the blocks that are directly nested inside this one in order.
 * Includes value and block inputs, as well as any following statement.
 * Excludes any connection on an output tab or any preceding statement.
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
Blockly.Block.prototype.getOrderedChildren = function() {
  var children = this.getChildren();
  var result = [];
  for (var i = 0, input; input = this.inputList[i]; i++) {
    if (input && input.connection) {
      var block = input.connection.targetBlock();
      if (block) {
        var spot = goog.array.indexOf(children, block);
        goog.asserts.assert(spot >= 0, 'Input not in children list.');
        result.push(block);
      }
    }
  }

  return result;
};

/**
 * Set parent of this block to be a new block or null.
 * @param {Blockly.Block} newParent New parent block.
 */
Blockly.Block.prototype.setParent = function(newParent) {
  if (this.parentBlock_) {
    // Remove this block from the old parent's child list.
    var children = this.parentBlock_.childBlocks_;
    for (var child, x = 0; child = children[x]; x++) {
      if (child == this) {
        children.splice(x, 1);
        break;
      }
    }

    // Disconnect from superior blocks.
    this.parentBlock_ = null;
    if (this.previousConnection && this.previousConnection.targetConnection) {
      this.previousConnection.disconnect();
    }
    if (this.outputConnection && this.outputConnection.targetConnection) {
      this.outputConnection.disconnect();
    }
    // This block hasn't actually moved on-screen, so there's no need to update
    // its connection locations.
  } else {
    // Remove this block from the workspace's list of top-most blocks.
    // Note that during realtime sync we sometimes create child blocks that are
    // not top level so we check first before removing.
    if (goog.array.contains(this.workspace.getTopBlocks(false), this)) {
      this.workspace.removeTopBlock(this);
    }
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
 * Set the typeblock autocompletion for this block.
 * @param {string|object} typeblock Typeblock information.  If only a string
 * then this is used to build the typeblock information
 */
Blockly.Block.prototype.setTypeblock = function(typeblock) {
  if (typeof typeblock === 'string') {
    this.typeblock = { entry: typeblock };
  } else {
    this.typeblock = typeblock;
  }
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
 * @return {number} HSV hue value.
 */
Blockly.Block.prototype.getColour = function() {
  return this.colourHue_;
};

/**
 * Change the colour of a block.
 * @param {number} colourHue HSV hue value.
 */
Blockly.Block.prototype.setColour = function(colourHue) {
  this.colourHue_ = colourHue;
  if (this.rendered) {
    this.updateColour();
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
 * Returns an array of all editable fields in a block
 * @return {Array<Blockly.Field>} Array of fields (which can be empty)
 */
 Blockly.Block.prototype.getEditableFields = function() {
  var fields = [];
  if (!this.isCollapsed()) {
    for (var i = 0, input; input = this.inputList[i]; i++) {
      for (var j = 0, field; field = input.fieldRow[j]; j++) {
        if (field.EDITABLE && field.SERIALIZABLE) {
          fields.push(field);
        }
      }
    }
  }
  return fields;
}

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
 * Returns the language-neutral value from the field of a block.
 * @param {string} name The name of the field.
 * @return {?string} Value from the field or null if field does not exist.
 * @deprecated December 2013
 */
Blockly.Block.prototype.getTitleValue = function(name) {
  console.warn('Deprecated call to getTitleValue, use getFieldValue instead.');
  return this.getFieldValue(name);
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
 * Change the field value for a block (e.g. 'CHOOSE' or 'REMOVE').
 * @param {string} newValue Value to be the new field.
 * @param {string} name The name of the field.
 * @deprecated December 2013
 */
Blockly.Block.prototype.setTitleValue = function(newValue, name) {
  console.warn('Deprecated call to setTitleValue, use setFieldValue instead.');
  this.setFieldValue(newValue, name);
};

/**
 * Set whether this block can chain onto the bottom of another block.
 * @param {boolean} newBoolean True if there can be a previous statement.
 * @param {string|Array.<string>|null|undefined} opt_check Statement type or
 *     list of statement types.  Null/undefined if any type could be connected.
 * @param {boolean} requireType true if null blocks can't match.
 */
Blockly.Block.prototype.setPreviousStatement = function(newBoolean, opt_check,
 requireType) {
  if (this.previousConnection) {
    goog.asserts.assert(!this.previousConnection.targetConnection,
        'Must disconnect previous statement before removing connection.');
    this.previousConnection.dispose();
    this.previousConnection = null;
  }
  if (newBoolean) {
    goog.asserts.assert(!this.outputConnection,
        'Remove output connection prior to adding previous connection.');
    if (opt_check === undefined) {
      opt_check = null;
    }
    this.previousConnection =
        new Blockly.Connection(this, Blockly.PREVIOUS_STATEMENT);
    this.previousConnection.setCheck(opt_check,requireType);
  }
  if (this.rendered) {
    this.render();
    this.bumpNeighbours_();
  }
};

/**
 * Set whether another block can chain onto the bottom of this block.
 * @param {boolean} newBoolean True if there can be a next statement.
 * @param {string|Array.<string>|null|undefined} opt_check Statement type or
 *     list of statement types.  Null/undefined if any type could be connected.
 * @param {boolean} requireType true if null blocks can't match.
 */
Blockly.Block.prototype.setNextStatement = function(newBoolean, opt_check,
  requireType) {
  if (this.nextConnection) {
    goog.asserts.assert(!this.nextConnection.targetConnection,
        'Must disconnect next statement before removing connection.');
    this.nextConnection.dispose();
    this.nextConnection = null;
  }
  if (newBoolean) {
    if (opt_check === undefined) {
      opt_check = null;
    }
    this.nextConnection =
        new Blockly.Connection(this, Blockly.NEXT_STATEMENT);
    this.nextConnection.setCheck(opt_check,requireType);
  }
  if (this.rendered) {
    this.render();
    this.bumpNeighbours_();
  }
};

/**
 * Set whether this block returns a value.
 * @param {string} name Name of the input to get data for
 * @param {type} type Type to prefix on all of the inputs
 * @param {Array.<string>|null} List of returned types.
 * @return {Array.<string>|null} List of returned types.
 *     Null if no type was specified for the input or the corresponding 
 *     block does not have an output.
 */
Blockly.Block.prototype.getInputCollectionOutput = function(name,type,result) {
  if (!result) {
    result = [type];
  }
  var item = this.getInputTargetBlock(name);
  if (item) {
    var subitems = item.getOutput();
    if (subitems) {
      for(var item = 0; item < subitems.length; item++) {
        subitems[item] = type+':'+subitems[item];
      }
      if (goog.array.isEmpty(result)) {
        result = subitems;
      } else {
        result = Blockly.Variables.Intersection(result, subitems);
        if (goog.array.isEmpty(result)) {
          result = [type];
        }
      }
    }
  }
  return result;
}
/**
 * Set whether this block returns a value.
 * @return {Object.<string>|null} List of returned types.
 *     Null if no type was specified for the output or the block does not
 *     have an output.
 */
Blockly.Block.prototype.getOutput = function() {
  var result = [];
  if (this.outputConnection) {
    result = this.outputConnection.check_.slice();
  }
  return result;
}

/**
 * Set whether this block returns a value.
 * @param {boolean} newBoolean True if there is an output.
 * @param {string|Array.<string>|null|undefined} opt_check Returned type or list
 *     of returned types.  Null or undefined if any type could be returned
 *     (e.g. variable get).
 * @param {boolean} requireType true if null blocks can't match.
 */
Blockly.Block.prototype.setOutput = function(newBoolean, opt_check,
  requireType) {
  if (this.outputConnection) {
    goog.asserts.assert(!this.outputConnection.targetConnection,
        'Must disconnect output value before removing connection.');
    this.outputConnection.dispose();
    this.outputConnection = null;
  }
  if (newBoolean) {
    goog.asserts.assert(!this.previousConnection,
        'Remove previous connection prior to adding output connection.');
    if (opt_check === undefined) {
      opt_check = null;
    }
    this.outputConnection =
        new Blockly.Connection(this, Blockly.OUTPUT_VALUE);
    this.outputConnection.setCheck(opt_check,requireType);
  }
  if (this.rendered) {
    this.render();
    this.bumpNeighbours_();
  }
};

/**
 * Set whether value inputs are arranged horizontally or vertically.
 * @param {boolean} newBoolean True if inputs are horizontal.
 */
Blockly.Block.prototype.setInputsInline = function(newBoolean) {
  this.inputsInline = newBoolean;
  if (this.rendered) {
    this.render();
    this.bumpNeighbours_();
    this.workspace.fireChangeEvent();
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
  this.disabled = disabled;
};

/**
 * Get whether the block is disabled or not due to parents.
 * The block's own disabled property is not considered.
 * @return {boolean} True if disabled.
 */
Blockly.Block.prototype.getInheritedDisabled = function() {
  var block = this;
  while (true) {
    var lastBlock = block;
    block = block.getSurroundParent();
    if (!block) {
      // Ran off the top.
      if (!this.workspace.options.disableDisconnected) {
        return false;
      }
      // We need to check the block at the top of the stack
      while(lastBlock.previousConnection != null &&
            lastBlock.previousConnection.targetConnection != null) {
        lastBlock = lastBlock.previousConnection.targetConnection.sourceBlock_;
      }
      return !(lastBlock.isTopLevel || lastBlock.isInFlyout);
    } else if (block.disabled) {
      return true;
    }
  }
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
  this.collapsed_ = collapsed;
};

/**
 * Create a human-readable text representation of this block and any children.
 * @param {number=} opt_maxLength Truncate the string to this length.
 * @return {string} Text of block.
 */
Blockly.Block.prototype.toString = function(opt_maxLength) {
  var text = [];
  if (this.collapsed_) {
    text.push(this.getInput('_TEMP_COLLAPSED_INPUT').fieldRow[0].text_);
  } else {
    for (var i = 0, input; input = this.inputList[i]; i++) {
      for (var j = 0, field; field = input.fieldRow[j]; j++) {
        text.push(field.getText());
      }
      if (input.connection) {
        var child = input.connection.targetBlock();
        if (child) {
          text.push(child.toString());
        } else {
          text.push('?');
        }
      }
    }
  }
  text = goog.string.trim(text.join(' ')) || '???';
  if (opt_maxLength) {
    // TODO: Improve truncation so that text from this block is given priority.
    // TODO: Handle FieldImage better.
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
  goog.asserts.assert(json['output'] == undefined ||
      json['previousStatement'] == undefined,
      'Must not have both an output and a previousStatement.');

  // Set basic properties of block.
  this.setColour(json['colour']);

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
    this.setTooltip(json['tooltip']);
  }
  if (json['helpUrl'] !== undefined) {
    this.setHelpUrl(json['helpUrl']);
  }
//  // Set basic properties of block.
//  if (json['colour'] !== undefined) {
//      this.setColour(json['colour']);
//  } //else {default color}
//  if (json['deletable'] !== undefined) {
//      this.setDeletable(json['deletable']);
//  }
//  if (json['disabled'] !== undefined) {
//      this.setDisabled(json['disabled']);
//  }
//  if (json['editable'] !== undefined) {
//      this.setEditable(json['editable']);
//  }
//  if (json['helpUrl'] !== undefined) {
//      this.setHelpUrl(json['helpUrl']);
//  }
//  if (json['inputsInline'] !== undefined) {
//      this.setInputsInline(json['inputsInline']);
//  }
//  if (json['nextStatement'] !== undefined) {
//      this.setNextStatement(true, json['nextStatement']);
//  }
//  // Set output and previous/next connections.
//  if (json['output'] !== undefined) {
//      this.setOutput(true, json['output']);
//  }
//  if (json['previousStatement'] !== undefined) {
//    this.setPreviousStatement(true, json['previousStatement']);
//  }
//  if (json['title'] !== undefined) {
//      this.setTitleValue(json['title']);
//  }
//  if (json['tooltip'] !== undefined) {
//      this.setTooltip(json['tooltip']);
//  }
//  if (json['typeBlock'] !== undefined) {
//      this.setTypeBlock(json['typeBlock']);
//  }
//  if (json['warningText'] !== undefined) {
//      this.setWarningBlock(json['warningText']);
//  }
};

/**
 * Interpolate a message description onto the block.
 * @param {string} message Text contains interpolation tokens (%1, %2, ...)
 *     that match with fields or inputs defined in the args array.
 * @param {!Array} args Array of arguments to be interpolated.
 * @param {=string} lastDummyAlign If a dummy input is added at the end,
 *     how should it be aligned?
 * @private
 */
Blockly.Block.prototype.interpolate_ = function(message, args, lastDummyAlign) {
  var tokens = Blockly.tokenizeInterpolation(message);
  // Interpolate the arguments.  Build a list of elements.
  var indexDup = [];
  var indexCount = 0;
  var elements = [];
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    if (typeof token == 'number') {
      goog.asserts.assert(token > 0 && token <= args.length,
          'Message index "%s" out of range.', token);
      goog.asserts.assert(!indexDup[token],
          'Message index "%s" duplicated.', token);
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
  goog.asserts.assert(indexCount == args.length,
      'Message does not reference all %s arg(s).', args.length);
  // Add last dummy input if needed.
  if (elements.length && (typeof elements[elements.length - 1] == 'string' ||
      elements[elements.length - 1]['type'].indexOf('field_') == 0)) {
    var input = {type: 'input_dummy'};
    if (lastDummyAlign) {
      input['align'] = lastDummyAlign;
    }
    elements.push(input);
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
          case 'input_addsub':
            // If there are any pending fields, make sure we put them on an
            // input so that the AddSubGroup renders correctly
            if (fieldStack.length) {
              input = this.appendDummyInput();
            }
            this.appendAddSubGroup(element['title'],
                                   element['name'],
                                   element['checks']);
            break;
          case 'input_addsubmulti':
            // If there are any pending fields, make sure we put them on an
            // input so that the AddSubMulti renders correctly
            if (fieldStack.length) {
              input = this.appendDummyInput();
            }
            this.appendAddSubMulti(element['title'],
                                   element['name'],
                                   element['checks']);
            break;
          case 'field_label':
            field = new Blockly.FieldLabel(element['text']);
            break;
          case 'field_input':
            field = new Blockly.FieldTextInput(element['text']);
            if (typeof element['spellcheck'] == 'boolean') {
              field.setSpellcheck(element['spellcheck']);
            }
            break;
          case 'field_angle':
            field = new Blockly.FieldAngle(element['angle']);
            break;
          case 'field_checkbox':
            field = new Blockly.FieldCheckbox(
                element['checked'] ? 'TRUE' : 'FALSE');
            break;
          case 'field_colour':
            field = new Blockly.FieldColour(element['colour']);
            break;
          case 'field_variable':
            field = new Blockly.FieldVariable(element['variable']);
            break;
          case 'field_scopevariable':
            field = new Blockly.FieldScopeVariable(element['scope']);
            break;
          case 'field_dropdown':
            field = new Blockly.FieldDropdown(element['options']);
            break;
          case 'field_clickimage':
            field = new Blockly.FieldClickImage(element['src'],
                element['width'], element['height'], element['alt'], element['handler']);
            break;
          case 'field_description':
            field = new Blockly.FieldDescription();
            break;
          case 'field_image':
            field = new Blockly.FieldImage(element['src'],
                element['width'], element['height'], element['alt']);
            break;
          case 'field_date':
            if (Blockly.FieldDate) {
              field = new Blockly.FieldDate(element['date']);
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
      } while (altRepeat);
      if (field) {
        fieldStack.push([field, element['name']]);
      } else if (input) {
        if (element['check']) {
          input.setCheck(element['check'], element['requireType']);
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
    connection = new Blockly.Connection(this, type);
  }
  var input = new Blockly.Input(type, name, this, connection);
  // Append input to list.
  this.inputList.push(input);
  if (this.rendered) {
    this.render();
    // Adding an input will cause the block to change shape.
    this.bumpNeighbours_();
  }
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
  goog.asserts.assert(refIndex != -1, 'Reference input "%s" not found.',
                      refName);
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
  if (this.rendered) {
    this.render();
    // Moving an input will cause the block to change shape.
    this.bumpNeighbours_();
  }
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
      if (input.connection && input.connection.targetConnection) {
        // Disconnect any attached block.
        input.connection.targetBlock().setParent(null);
      }
      input.dispose();
      this.inputList.splice(i, 1);
      if (this.rendered) {
        this.render();
        // Removing an input will cause the block to change shape.
        this.bumpNeighbours_();
      }
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
 * @return {Blockly.Input} The input object, or null of the input does not exist.
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
 * Returns the index of an input in a block.
 * @param {string} name The name of the input to find.
 * @return {number} inputIndex Index of the input (or -1 if not found).
 */
Blockly.Block.prototype.getInputIndex = function(name) {
  var inputIndex = -1;
  for (var i = 0, input; input = this.inputList[i]; i++) {
    if (input.name == name) {
      inputIndex = i;
      break;
    }
  }
  return inputIndex;
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
  this.comment = text;
};

/**
 * Set this block's warning text.
 * @param {?string} text The text, or null to delete.
 */
Blockly.Block.prototype.setWarningText = function(text) {
  // NOP.
};

/**
 * Give this block a mutator dialog.
 * @param {Blockly.Mutator} mutator A mutator dialog instance or null to remove.
 */
Blockly.Block.prototype.setMutator = function(mutator) {
  // NOP.
};

/**
 * Return the coordinates of the top-left corner of this block relative to the
 * drawing surface's origin (0,0).
 * @return {!goog.math.Coordinate} Object with .x and .y properties.
 */
Blockly.Block.prototype.getRelativeToSurfaceXY = function() {
  return this.xy_;
};

/**
 * Move a block by a relative offset.
 * @param {number} dx Horizontal offset.
 * @param {number} dy Vertical offset.
 */
Blockly.Block.prototype.moveBy = function(dx, dy) {
  this.xy_.translate(dx, dy);
};
/**
 * Images for adding/removing elements
 */
Blockly.Block.prototype.addPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAMAAAAMs7fIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6Mzg5MzA1MkQwMjc5MTFFNUEyMEJEOEM2QTBCNDI2RjciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Mzg5MzA1MkUwMjc5MTFFNUEyMEJEOEM2QTBCNDI2RjciPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDozODkzMDUyQjAyNzkxMUU1QTIwQkQ4QzZBMEI0MjZGNyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDozODkzMDUyQzAyNzkxMUU1QTIwQkQ4QzZBMEI0MjZGNyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pptr84cAAACHUExURfPz/xoa/+/v//X1/xcX//v7//b2//Hx//z8/1NT//Dw/9jY/0RE/7u7/+np//T0/zs7/62t/wgI/yMj/w0N/x0d/y8v/19f/ykp//Ly/woK/93d/7S0/+zs/56e/xQU/+fn/9ra/yYm/6am//f3/xAQ/yAg/5qa//r6//7+/////wAA/////19oit8AAAAtdFJOU///////////////////////////////////////////////////////////AKXvC/0AAACcSURBVHjabNDZEoIwDAXQW8omyL65465N+P/vk1J06Iz3pcl56CTBoEOABGiqofso6SpRdUlERsJjyyZt6mmh9MHf1GcaJdjomoj0c90OoAMvhAuFYGXJ2kHWTK0Jc5MhLC0pQ0hhSX//8w8VltwUBjwX4vrjhGpf/2beXZTey4vdGdz4bXZX/ikXLPKXr+ZrjPdwpCcdmg70EWAAstQnpKfUzLwAAAAASUVORK5CYII=';
Blockly.Block.prototype.subPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAMAAAAMs7fIAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIFdpbmRvd3MiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MkU5MkMxMTAwMjc5MTFFNTgxRDJFMTA3OTA2NTkxNDEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MkU5MkMxMTEwMjc5MTFFNTgxRDJFMTA3OTA2NTkxNDEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoyRTkyQzEwRTAyNzkxMUU1ODFEMkUxMDc5MDY1OTE0MSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoyRTkyQzEwRjAyNzkxMUU1ODFEMkUxMDc5MDY1OTE0MSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PlxGqBwAAACHUExURfPz/xoa/+/v//X1/xcX//v7//b2//Hx//z8/1NT//Dw/9jY/0RE/7u7/+np//T0/zs7/62t/wgI/yMj/w0N/x0d/y8v/19f/ykp//Ly/woK/93d/7S0/+zs/56e/xQU/+fn/9ra/yYm/6am//f3/xAQ/yAg/5qa//r6//7+/////wAA/////19oit8AAAAtdFJOU///////////////////////////////////////////////////////////AKXvC/0AAACXSURBVHjabJDXDoMwDEVvCKtQ9ureKzb//31NoLRE6nmyjyzLvugNBEiAhhqmj5KuElWXRDSacN/ySJt6xlB654n6RNoEK/5xWfegHc8pFIKFZZYOsoaZJpibDGFpmTKEFJY53v7socIyV4Uej5lwfX2h2tZfsTkr85cXu9NE/Bp/V/4hFyzyp68+aeg8HOlJh4aA3gIMAL2WJ7aPWKm3AAAAAElFTkSuQmCC';

/**
 * Adds a named field to a mutable block.
 * @param {!Blockly.FieldClickImage} field Field which was clicked on
 */
Blockly.Block.prototype.doAddField = function(field) {
  var privateData = field.getPrivate();
  var name = privateData.name;
  var pos = privateData.pos;
  var itemCount = this.getItemCount();
  itemCount[name]++;

  this.setItemCount(name, itemCount[name]);
  if (itemCount[name] == 1) {
    //
    // If we went from 0 to 1 then we need to change the title back.
    // Just remove the input and let updateAddSubShape clean it up for us
    this.removeInput(this.getAddSubName(name,0),true);
  }
  this.updateAddSubShape();
}

/**
 * Removes a named field from a mutable block.
 * @param {!Blockly.FieldClickImage} field Field which was clicked on
 */
Blockly.Block.prototype.doRemoveField = function(field) {
  var privateData = field.getPrivate();
  var name = privateData.name;
  var pos = privateData.pos;
  var itemCount = this.getItemCount();
  var limit = itemCount[name];
  var minitems = 1;
  if (this.titles_[name]) {
    minitems = 0;
  }
  if (itemCount[name] > minitems) {
    itemCount[name]--;
    this.setItemCount(name, itemCount[name]);
  }
  if (itemCount[name] == 0) {
    // If we drop down to 0 then we remove the block and let redraw
    // give us back one with the right name on it
    this.removeInput(this.getAddSubName(name,0),true);
  }

  var input = this.getInput(this.getAddSubName(name,pos));
  if (input && input.connection && input.connection.targetConnection) {
    input.connection.targetConnection.sourceBlock_.unplug(true,true);
  }
  // Now we need to go through and move up all the lower ones to the previous
  // one.
  for (var slot = pos+1; slot < limit; slot++) {
    var nextInput = this.getInput(this.getAddSubName(name,slot));
    if (nextInput != null) {
      if (nextInput.connection && nextInput.connection.targetConnection) {
        var toMove = nextInput.connection.targetConnection;
        toMove.sourceBlock_.unplug(false,false);
        input.connection.connect(toMove);
      }
    input = nextInput;
    }
  }
  this.updateAddSubShape();
}

/**
 * Sets the information for an Add Sub field click item
 * @param {string} fieldname Name of the click field to set info on
 * @param {string} name Name of the field to pass to the callback function
 * @param {number} pos Position of the field in the input
 */
Blockly.Block.prototype.setAddSubInfo = function(fieldName,handler,name,pos) {
  var field = this.getField(fieldName);
  if (field) {
    field.setChangeHandler(handler);
    field.setPrivate({name: name, pos: pos});
  }
}

/**
 * Gets the name for an inputfield on an AddSub item.
 * @param {string} name The name of the input type field.
 * @param {number} pos position of the field
 * @return {string} Computed name.
 */
Blockly.Block.prototype.getAddSubName = function(name,pos) {
  return name+pos;
}

/**
 * Gets the itemCount array for an AddSub item.
 * @return {Object} Data for the items and itemcount.
 */
Blockly.Block.prototype.getItemCount = function() {
  return {'items': this.itemCount_};
}

/**
 * Sets the itemCount value for an AddSub item
 * @param {string} name The name of the input type field.
 * @param {number} val the new value for the field
 */
Blockly.Block.prototype.setItemCount = function(name, val) {
  if (name === 'items') {
    this.itemCount_ = val;
  }
}

/**
 * Creates the empty item for an addsub block
 * @param {string} name The name of the input type field.
 * @return {array Element} array of added elements.
 */
Blockly.Block.prototype.appendAddSubEmptyInput = function(name,title) {
  var inputItem = this.appendDummyInput(name);
  if (title) {
    inputItem.appendField(title);
  }
  return inputItem;
}

/**
 * Updates the shape of a mutable block.
 * @param {string} name The name of the input type field.
 * @param {number} pos position of the field
 * @return {array Element} array of added elements.
 */
Blockly.Block.prototype.appendAddSubInput = function(name,pos,title) {
  var newName = this.getAddSubName(name,pos);
  var inputItem = null;
  var field = null;
  var itemCount = this.getItemCount();

  if (itemCount[name]) {
    inputItem = this.appendValueInput(newName)
                    .setCheck(this.checks_[name],!!this.checks_[name])
                    .setAlign(Blockly.ALIGN_RIGHT);
    if (title) {
      inputItem.appendField(title);
    }
  } else {
    var title = '';
    if (this.titles_[name]) {
      title = this.titles_[name].empty;
    }
    inputItem = this.appendAddSubEmptyInput(newName, title);
  }
  if (pos === 0) {
    field = new Blockly.FieldClickImage(this.addPng, 17, 17,
                                        Blockly.Msg.CLICK_ADD_TOOLTIP);
    field.setChangeHandler(this.doAddField);
  } else {
    field = new Blockly.FieldClickImage(this.subPng, 17, 17,
                                        Blockly.Msg.CLICK_REMOVE_TOOLTIP);
    field.setChangeHandler(this.doRemoveField);
  }
  field.setPrivate({name: name, pos: pos});
  inputItem.appendField(field);
  return [inputItem];
}

/**
 * Updates the shape of a mutable block.
 * @param {string} name The name of the input type field.
 * @param {number} pos position of the field to be removed
 * @throws {goog.asserts.AssertionError} if the field is not present.
 */
Blockly.Block.prototype.updateAddSubShape = function() {
  var itemCount = this.getItemCount();
  for (var name in itemCount) {
    if (itemCount.hasOwnProperty(name)) {
      // First get rid of anything which is beyond our count
      var pos = itemCount[name];
      var elemName = this.getAddSubName(name,pos);
      while(this.getInput(elemName) != null) {
        this.removeInput(elemName);
        pos++;
        elemName = this.getAddSubName(name,pos);
      }
      if (itemCount[name]) {
        // Now add in the ones which we are missing.  Note that
        // we need to make sure that they get put AFTER the one of
        // the same number
        var name0 = this.getAddSubName(name,0);
        var inputIndex = this.getInputIndex(name0);
        if (inputIndex == -1) {
          // This is the case where we don't have any blocks at all, not even
          // the initial one, so we just add to the end
          var title = '';
          if (this.titles_[name]) {
            title = this.titles_[name].normal;
          }
          this.appendAddSubInput(name, 0, title);
          var inputIndex = this.getInputIndex(name0);
          goog.asserts.assert(inputIndex != -1,
                              'Named input "%s" not found.', name0);
        }
        if (inputIndex !== -1) {
          inputIndex++;
          for (pos = 1; pos < itemCount[name];pos++,inputIndex++) {
            var newName = this.getAddSubName(name,pos);
            var inputItem = this.getInput(newName);
            if (inputItem == null) {
              // We have to add one
              var inputItems = this.appendAddSubInput(name,pos);
              // Now see if we need to move them.
              if (inputIndex < this.inputList.length-1) {
                // We move them from the bottom to the top.
                // Because they start at the bottom, we move them to the same
                // place and they will stay in the same order.
                for (var nItem = 0; nItem < inputItems.length; nItem++) {
                  this.moveNumberedInputBefore(this.inputList.length-1,
                                               inputIndex);
                }
              }
            }
          }
        }

        inputItem = this.getInput(name0);
        var subFieldName0 = name0+'_sub';
        var hasSubField0 = this.getField(subFieldName0);
        // Now see what the main one has for fields
        if (itemCount[name] === 1) {
          // Shouldn't have a sub field if this is the only entry
          if (hasSubField0) {
            inputItem.removeField(subFieldName0);
          }
        } else {
          if (!hasSubField0) {
            var field = new Blockly.FieldClickImage(this.subPng, 17, 17,
                                              Blockly.Msg.CLICK_REMOVE_TOOLTIP);
            field.setPrivate({name: name, pos: 0});
            field.setChangeHandler(this.doRemoveField);
            inputItem.appendField(field, subFieldName0);
          }
        }
      } else {
        var name0 = this.getAddSubName(name,0);
        var title = '';
        if (this.titles_[name]) {
          title = this.titles_[name].empty;
        }
        this.removeInput(name0,true);
        this.appendAddSubInput(name, 0, title);
      }
    }
  }
  //
  // Make sure that we don't have anything which might be showing up
  // as a false connection
  //
  if (this.rendered) {
    this.render();
    this.bumpNeighbours_();
    this.workspace.fireChangeEvent();
  }
}

/**
  * Parse XML to restore the list inputs.
  * @param {!Element} xmlElement XML storage element.
  * @this Blockly.Block
  */
Blockly.Block.prototype.domToMutationAddSub = function(xmlElement) {
  var itemCount = this.getItemCount();
  for (var name in itemCount) {
    if (itemCount.hasOwnProperty(name)) {
      this.setItemCount(name, parseInt(xmlElement.getAttribute(name),10));
    }
  }
  this.updateAddSubShape();
}

/**
 * Create XML to represent list inputs.
 * @return {Element} XML storage element.
 * @this Blockly.Block
 */
Blockly.Block.prototype.mutationToDomAddSub = function() {
  var container = document.createElement('mutation');
  var itemCount = this.getItemCount();
  for (var name in itemCount) {
    if (itemCount.hasOwnProperty(name)) {
      container.setAttribute(name, itemCount[name]);
    }
  }
  return container;
}

/**
 * Creates an add/subtract mutable field.
 * @param {string} title Any title input fields for the line.
 * @param {string} name The name of the input type field.
 * @param {string} checks input check parameter for the fields
 * @param {string} emptytitle Optional string for when a group is empty
 */
Blockly.Block.prototype.appendAddSubGroup = function(title,name,checks,
                                                     emptytitle) {
  //
  // Specify the override functions
  //
  this.domToMutation   = this.domToMutationAddSub;
  this.mutationToDom   = this.mutationToDomAddSub;
  this.updateShape_    = this.updateAddSubShape;

  var root = this;
  if (typeof this.titles_ === 'undefined') {
    this.checks_ = {};
    this.titles_ = {};
  }

  if (emptytitle) {
    this.titles_[name] = {normal: title, empty: emptytitle};
  }
  this.setItemCount(name, 1);
  this.checks_[name] = checks;
  this.appendAddSubInput(name, 0, title);
}

/**
 * Gets the itemCount array for an AddSub item with multiple elements
 * @return {Object} Data for the items and itemcount.
 */
Blockly.Block.prototype.getMultiItemCount = function() {
  return this.itemCount_;
}
/**
 * Sets the itemCount value for an AddSub item with multiple elements
 * @param {string} name The name of the input type field.
 * @param {number} val the new value for the field
 */
Blockly.Block.prototype.setMultiItemCount = function(name, val) {
  this.itemCount_[name] = val;
}

Blockly.Block.prototype.appendAddSubMulti = function(title,name,checks,
                                                     emptytitle) {
  if (typeof this.itemCount_ === 'undefined') {
    this.itemCount_ = {};
  }
  //
  // Because we have multiple items on our blocks, we override the method
  // of storing the item count value
  //
  this.getItemCount = this.getMultiItemCount;
  this.setItemCount = this.setMultiItemCount;

  this.appendAddSubGroup(title,name,checks,emptytitle);
}
