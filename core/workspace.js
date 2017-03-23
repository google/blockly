/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Object representing a workspace.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Workspace');

goog.require('goog.array');
goog.require('goog.math');


/**
 * Class for a workspace.  This is a data structure that contains blocks.
 * There is no UI, and can be created headlessly.
 * @param {Blockly.Options} opt_options Dictionary of options.
 * @constructor
 */
Blockly.Workspace = function(opt_options) {
  /** @type {string} */
  this.id = Blockly.utils.genUid();
  Blockly.Workspace.WorkspaceDB_[this.id] = this;
  /** @type {!Blockly.Options} */
  this.options = opt_options || {};
  /** @type {boolean} */
  this.RTL = !!this.options.RTL;
  /** @type {boolean} */
  this.horizontalLayout = !!this.options.horizontalLayout;
  /** @type {number} */
  this.toolboxPosition = this.options.toolboxPosition;

  /**
   * @type {!Array.<!Blockly.Block>}
   * @private
   */
  this.topBlocks_ = [];
  /**
   * @type {!Array.<!Function>}
   * @private
   */
  this.listeners_ = [];
  /**
   * @type {!Array.<!Blockly.Events.Abstract>}
   * @private
   */
  this.undoStack_ = [];
  /**
   * @type {!Array.<!Blockly.Events.Abstract>}
   * @private
   */
  this.redoStack_ = [];
  /**
   * @type {!Object}
   * @private
   */
  this.blockDB_ = Object.create(null);
  /*
   * @type {!Array.<string>}
   * A list of all of the named variables in the workspace, including variables
   * that are not currently in use.
   */
  this.variableList = [];
};

/**
 * Returns `true` if the workspace is visible and `false` if it's headless.
 * @type {boolean}
 */
Blockly.Workspace.prototype.rendered = false;

/**
 * Maximum number of undo events in stack. `0` turns off undo, `Infinity` sets it to unlimited.
 * @type {number}
 */
Blockly.Workspace.prototype.MAX_UNDO = 1024;

/**
 * Dispose of this workspace.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.Workspace.prototype.dispose = function() {
  this.listeners_.length = 0;
  this.clear();
  // Remove from workspace database.
  delete Blockly.Workspace.WorkspaceDB_[this.id];
};

/**
 * Angle away from the horizontal to sweep for blocks.  Order of execution is
 * generally top to bottom, but a small angle changes the scan to give a bit of
 * a left to right bias (reversed in RTL).  Units are in degrees.
 * See: http://tvtropes.org/pmwiki/pmwiki.php/Main/DiagonalBilling.
 */
Blockly.Workspace.SCAN_ANGLE = 3;

/**
 * Add a block to the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.Workspace.prototype.addTopBlock = function(block) {
  this.topBlocks_.push(block);
  if (this.isFlyout) {
    // This is for the (unlikely) case where you have a variable in a block in
    // an always-open flyout.  It needs to be possible to edit the block in the
    // flyout, so the contents of the dropdown need to be correct.
    var variables = Blockly.Variables.allUsedVariables(block);
    for (var i = 0; i < variables.length; i++) {
      if (this.variableList.indexOf(variables[i]) == -1) {
        this.variableList.push(variables[i]);
      }
    }
  }
};

/**
 * Remove a block from the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.Workspace.prototype.removeTopBlock = function(block) {
  if (!goog.array.remove(this.topBlocks_, block)) {
    throw 'Block not present in workspace\'s list of top-most blocks.';
  }
};

/**
 * Finds the top-level blocks and returns them.  Blocks are optionally sorted
 * by position; top to bottom (with slight LTR or RTL bias).
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array.<!Blockly.Block>} The top-level block objects.
 */
Blockly.Workspace.prototype.getTopBlocks = function(ordered) {
  // Copy the topBlocks_ list.
  var blocks = [].concat(this.topBlocks_);
  if (ordered && blocks.length > 1) {
    var offset = Math.sin(goog.math.toRadians(Blockly.Workspace.SCAN_ANGLE));
    if (this.RTL) {
      offset *= -1;
    }
    blocks.sort(function(a, b) {
      var aXY = a.getRelativeToSurfaceXY();
      var bXY = b.getRelativeToSurfaceXY();
      return (aXY.y + offset * aXY.x) - (bXY.y + offset * bXY.x);
    });
  }
  return blocks;
};

/**
 * Find all blocks in workspace.  No particular order.
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
Blockly.Workspace.prototype.getAllBlocks = function() {
  var blocks = this.getTopBlocks(false);
  for (var i = 0; i < blocks.length; i++) {
    blocks.push.apply(blocks, blocks[i].getChildren());
  }
  return blocks;
};

/**
 * Dispose of all blocks in workspace.
 */
Blockly.Workspace.prototype.clear = function() {
  var existingGroup = Blockly.Events.getGroup();
  if (!existingGroup) {
    Blockly.Events.setGroup(true);
  }
  while (this.topBlocks_.length) {
    this.topBlocks_[0].dispose();
  }
  if (!existingGroup) {
    Blockly.Events.setGroup(false);
  }

  this.variableList.length = 0;
};

/**
 * Walk the workspace and update the list of variables to only contain ones in
 * use on the workspace.  Use when loading new workspaces from disk.
 * @param {boolean} clearList True if the old variable list should be cleared.
 */
Blockly.Workspace.prototype.updateVariableList = function(clearList) {
  // TODO: Sort
  if (!this.isFlyout) {
    // Update the list in place so that the flyout's references stay correct.
    if (clearList) {
      this.variableList.length = 0;
    }
    var allVariables = Blockly.Variables.allUsedVariables(this);
    for (var i = 0; i < allVariables.length; i++) {
      this.createVariable(allVariables[i]);
    }
  }
};

/**
 * Rename a variable by updating its name in the variable list.
 * TODO: #468
 * @param {string} oldName Variable to rename.
 * @param {string} newName New variable name.
 */
Blockly.Workspace.prototype.renameVariable = function(oldName, newName) {
  // Find the old name in the list.
  var variableIndex = this.variableIndexOf(oldName);
  var newVariableIndex = this.variableIndexOf(newName);

  // We might be renaming to an existing name but with different case.  If so,
  // we will also update all of the blocks using the new name to have the
  // correct case.
  if (newVariableIndex != -1 &&
      this.variableList[newVariableIndex] != newName) {
    var oldCase = this.variableList[newVariableIndex];
  }

  Blockly.Events.setGroup(true);
  var blocks = this.getAllBlocks();
  // Iterate through every block.
  for (var i = 0; i < blocks.length; i++) {
    blocks[i].renameVar(oldName, newName);
    if (oldCase) {
      blocks[i].renameVar(oldCase, newName);
    }
  }
  Blockly.Events.setGroup(false);


  if (variableIndex == newVariableIndex ||
      variableIndex != -1 && newVariableIndex == -1) {
    // Only changing case, or renaming to a completely novel name.
    this.variableList[variableIndex] = newName;
  } else if (variableIndex != -1 && newVariableIndex != -1) {
    // Renaming one existing variable to another existing variable.
    // The case might have changed, so we update the destination ID.
    this.variableList[newVariableIndex] = newName;
    this.variableList.splice(variableIndex, 1);
  } else {
    this.variableList.push(newName);
    console.log('Tried to rename an non-existent variable.');
  }
};

/**
 * Create a variable with the given name.
 * TODO: #468
 * @param {string} name The new variable's name.
 */
Blockly.Workspace.prototype.createVariable = function(name) {
  var index = this.variableIndexOf(name);
  if (index == -1) {
    this.variableList.push(name);
  }
};

/**
 * Find all the uses of a named variable.
 * @param {string} name Name of variable.
 * @return {!Array.<!Blockly.Block>} Array of block usages.
 */
Blockly.Workspace.prototype.getVariableUses = function(name) {
  var uses = [];
  var blocks = this.getAllBlocks();
  // Iterate through every block and check the name.
  for (var i = 0; i < blocks.length; i++) {
    var blockVariables = blocks[i].getVars();
    if (blockVariables) {
      for (var j = 0; j < blockVariables.length; j++) {
        var varName = blockVariables[j];
        // Variable name may be null if the block is only half-built.
        if (varName && Blockly.Names.equals(varName, name)) {
          uses.push(blocks[i]);
        }
      }
    }
  }
  return uses;
};

/**
 * Delete a variables and all of its uses from this workspace.
 * @param {string} name Name of variable to delete.
 */
Blockly.Workspace.prototype.deleteVariable = function(name) {
  var variableIndex = this.variableIndexOf(name);
  if (variableIndex == -1) {
    return;
  }
  // Check whether this variable is a function parameter before deleting.
  var uses = this.getVariableUses(name);
  for (var i = 0, block; block = uses[i]; i++) {
    if (block.type == 'procedures_defnoreturn' ||
      block.type == 'procedures_defreturn') {
      var procedureName = block.getFieldValue('NAME');
      Blockly.alert(
          Blockly.Msg.CANNOT_DELETE_VARIABLE_PROCEDURE.
          replace('%1', name).
          replace('%2', procedureName));
      return;
    }
  }

  var workspace = this;
  function doDeletion() {
    Blockly.Events.setGroup(true);
    for (var i = 0; i < uses.length; i++) {
      uses[i].dispose(true, false);
    }
    Blockly.Events.setGroup(false);
    workspace.variableList.splice(variableIndex, 1);
  }
  if (uses.length > 1) {
    // Confirm before deleting multiple blocks.
    Blockly.confirm(
        Blockly.Msg.DELETE_VARIABLE_CONFIRMATION.replace('%1', uses.length).
        replace('%2', name),
        function(ok) {
          if (ok) {
            doDeletion();
          }
        });
  } else {
    // No confirmation necessary for a single block.
    doDeletion();
  }
};

/**
 * Check whether a variable exists with the given name.  The check is
 * case-insensitive.
 * @param {string} name The name to check for.
 * @return {number} The index of the name in the variable list, or -1 if it is
 *     not present.
 */
Blockly.Workspace.prototype.variableIndexOf = function(name) {
  for (var i = 0, varname; varname = this.variableList[i]; i++) {
    if (Blockly.Names.equals(varname, name)) {
      return i;
    }
  }
  return -1;
};

/**
 * Returns the horizontal offset of the workspace.
 * Intended for LTR/RTL compatibility in XML.
 * Not relevant for a headless workspace.
 * @return {number} Width.
 */
Blockly.Workspace.prototype.getWidth = function() {
  return 0;
};

/**
 * Obtain a newly created block.
 * @param {?string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new id.
 * @return {!Blockly.Block} The created block.
 */
Blockly.Workspace.prototype.newBlock = function(prototypeName, opt_id) {
  return new Blockly.Block(this, prototypeName, opt_id);
};

/**
 * The number of blocks that may be added to the workspace before reaching
 *     the maxBlocks.
 * @return {number} Number of blocks left.
 */
Blockly.Workspace.prototype.remainingCapacity = function() {
  if (isNaN(this.options.maxBlocks)) {
    return Infinity;
  }
  return this.options.maxBlocks - this.getAllBlocks().length;
};

/**
 * Undo or redo the previous action.
 * @param {boolean} redo False if undo, true if redo.
 */
Blockly.Workspace.prototype.undo = function(redo) {
  var inputStack = redo ? this.redoStack_ : this.undoStack_;
  var outputStack = redo ? this.undoStack_ : this.redoStack_;
  var inputEvent = inputStack.pop();
  if (!inputEvent) {
    return;
  }
  var events = [inputEvent];
  // Do another undo/redo if the next one is of the same group.
  while (inputStack.length && inputEvent.group &&
      inputEvent.group == inputStack[inputStack.length - 1].group) {
    events.push(inputStack.pop());
  }
  // Push these popped events on the opposite stack.
  for (var i = 0, event; event = events[i]; i++) {
    outputStack.push(event);
  }
  events = Blockly.Events.filter(events, redo);
  Blockly.Events.recordUndo = false;
  for (var i = 0, event; event = events[i]; i++) {
    event.run(redo);
  }
  Blockly.Events.recordUndo = true;
};

/**
 * Clear the undo/redo stacks.
 */
Blockly.Workspace.prototype.clearUndo = function() {
  this.undoStack_.length = 0;
  this.redoStack_.length = 0;
  // Stop any events already in the firing queue from being undoable.
  Blockly.Events.clearPendingUndo();
};

/**
 * When something in this workspace changes, call a function.
 * @param {!Function} func Function to call.
 * @return {!Function} Function that can be passed to
 *     removeChangeListener.
 */
Blockly.Workspace.prototype.addChangeListener = function(func) {
  this.listeners_.push(func);
  return func;
};

/**
 * Stop listening for this workspace's changes.
 * @param {Function} func Function to stop calling.
 */
Blockly.Workspace.prototype.removeChangeListener = function(func) {
  goog.array.remove(this.listeners_, func);
};

/**
 * Fire a change event.
 * @param {!Blockly.Events.Abstract} event Event to fire.
 */
Blockly.Workspace.prototype.fireChangeListener = function(event) {
  if (event.recordUndo) {
    this.undoStack_.push(event);
    this.redoStack_.length = 0;
    if (this.undoStack_.length > this.MAX_UNDO) {
      this.undoStack_.unshift();
    }
  }
  for (var i = 0, func; func = this.listeners_[i]; i++) {
    func(event);
  }
};

/**
 * Find the block on this workspace with the specified ID.
 * @param {string} id ID of block to find.
 * @return {Blockly.Block} The sought after block or null if not found.
 */
Blockly.Workspace.prototype.getBlockById = function(id) {
  return this.blockDB_[id] || null;
};

/**
 * Checks whether all value and statement inputs in the workspace are filled
 * with blocks.
 * @param {boolean=} opt_shadowBlocksAreFilled An optional argument controlling
 *     whether shadow blocks are counted as filled. Defaults to true.
 * @return {boolean} True if all inputs are filled, false otherwise.
 */
Blockly.Workspace.prototype.allInputsFilled = function(opt_shadowBlocksAreFilled) {
  var blocks = this.getTopBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    if (!block.allInputsFilled(opt_shadowBlocksAreFilled)) {
      return false;
    }
  }
  return true;
};

/**
 * Database of all workspaces.
 * @private
 */
Blockly.Workspace.WorkspaceDB_ = Object.create(null);

/**
 * Find the workspace with the specified ID.
 * @param {string} id ID of workspace to find.
 * @return {Blockly.Workspace} The sought after workspace or null if not found.
 */
Blockly.Workspace.getById = function(id) {
  return Blockly.Workspace.WorkspaceDB_[id] || null;
};

// Export symbols that would otherwise be renamed by Closure compiler.
Blockly.Workspace.prototype['clear'] = Blockly.Workspace.prototype.clear;
Blockly.Workspace.prototype['clearUndo'] =
    Blockly.Workspace.prototype.clearUndo;
Blockly.Workspace.prototype['addChangeListener'] =
    Blockly.Workspace.prototype.addChangeListener;
Blockly.Workspace.prototype['removeChangeListener'] =
    Blockly.Workspace.prototype.removeChangeListener;
