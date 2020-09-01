/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a workspace.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Workspace');

goog.require('Blockly.ConnectionChecker');
goog.require('Blockly.Events');
goog.require('Blockly.Options');
goog.require('Blockly.utils');
goog.require('Blockly.utils.math');
goog.require('Blockly.VariableMap');

goog.requireType('Blockly.IASTNodeLocation');
goog.requireType('Blockly.IConnectionChecker');


/**
 * Class for a workspace.  This is a data structure that contains blocks.
 * There is no UI, and can be created headlessly.
 * @param {!Blockly.Options=} opt_options Dictionary of options.
 * @constructor
 * @implements {Blockly.IASTNodeLocation}
 */
Blockly.Workspace = function(opt_options) {
  /** @type {string} */
  this.id = Blockly.utils.genUid();
  Blockly.Workspace.WorkspaceDB_[this.id] = this;
  /** @type {!Blockly.Options} */
  this.options = opt_options ||
      new Blockly.Options(/** @type {!Blockly.BlocklyOptions} */ ({}));
  /** @type {boolean} */
  this.RTL = !!this.options.RTL;
  /** @type {boolean} */
  this.horizontalLayout = !!this.options.horizontalLayout;
  /** @type {number} */
  this.toolboxPosition = this.options.toolboxPosition;

  var connectionCheckerClass = Blockly.registry.getClassFromOptions(
      Blockly.registry.Type.CONNECTION_CHECKER, this.options);
  /**
   * An object that encapsulates logic for safety, type, and dragging checks.
   * @type {!Blockly.IConnectionChecker}
   */
  this.connectionChecker = new connectionCheckerClass(this);

  /**
   * @type {!Array.<!Blockly.Block>}
   * @private
   */
  this.topBlocks_ = [];
  /**
   * @type {!Array.<!Blockly.WorkspaceComment>}
   * @private
   */
  this.topComments_ = [];
  /**
   * @type {!Object}
   * @private
   */
  this.commentDB_ = Object.create(null);
  /**
   * @type {!Array.<!Function>}
   * @private
   */
  this.listeners_ = [];
  /**
   * @type {!Array.<!Blockly.Events.Abstract>}
   * @protected
   */
  this.undoStack_ = [];
  /**
   * @type {!Array.<!Blockly.Events.Abstract>}
   * @protected
   */
  this.redoStack_ = [];
  /**
   * @type {!Object}
   * @private
   */
  this.blockDB_ = Object.create(null);
  /**
   * @type {!Object}
   * @private
   */
  this.typedBlocksDB_ = Object.create(null);

  /**
   * A map from variable type to list of variable names.  The lists contain all
   * of the named variables in the workspace, including variables
   * that are not currently in use.
   * @type {!Blockly.VariableMap}
   * @private
   */
  this.variableMap_ = new Blockly.VariableMap(this);

  /**
   * Blocks in the flyout can refer to variables that don't exist in the main
   * workspace.  For instance, the "get item in list" block refers to an "item"
   * variable regardless of whether the variable has been created yet.
   * A FieldVariable must always refer to a Blockly.VariableModel.  We reconcile
   * these by tracking "potential" variables in the flyout.  These variables
   * become real when references to them are dragged into the main workspace.
   * @type {Blockly.VariableMap}
   * @private
   */
  this.potentialVariableMap_ = null;
};

/**
 * Returns `true` if the workspace is visible and `false` if it's headless.
 * @type {boolean}
 */
Blockly.Workspace.prototype.rendered = false;

/**
 * Returns `true` if the workspace is currently in the process of a bulk clear.
 * @type {boolean}
 * @package
 */
Blockly.Workspace.prototype.isClearing = false;

/**
 * Maximum number of undo events in stack. `0` turns off undo, `Infinity` sets
 * it to unlimited.
 * @type {number}
 */
Blockly.Workspace.prototype.MAX_UNDO = 1024;

/**
 * Set of databases for rapid lookup of connection locations.
 * @type {Array.<!Blockly.ConnectionDB>}
 */
Blockly.Workspace.prototype.connectionDBList = null;

/**
 * Dispose of this workspace.
 * Unlink from all DOM elements to prevent memory leaks.
 * @suppress {checkTypes}
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
 * See: https://tvtropes.org/pmwiki/pmwiki.php/Main/DiagonalBilling
 */
Blockly.Workspace.SCAN_ANGLE = 3;

/**
 * Compare function for sorting objects (blocks, comments, etc) by position;
 *    top to bottom (with slight LTR or RTL bias).
 * @param {!Blockly.Block | !Blockly.WorkspaceComment} a The first object to
 *    compare.
 * @param {!Blockly.Block | !Blockly.WorkspaceComment} b The second object to
 *    compare.
 * @return {number} The comparison value. This tells Array.sort() how to change
 *    object a's index.
 * @private
 */
Blockly.Workspace.prototype.sortObjects_ = function(a, b) {
  var aXY = a.getRelativeToSurfaceXY();
  var bXY = b.getRelativeToSurfaceXY();
  return (aXY.y + Blockly.Workspace.prototype.sortObjects_.offset * aXY.x) -
      (bXY.y + Blockly.Workspace.prototype.sortObjects_.offset * bXY.x);
};

/**
 * Adds a block to the list of top blocks.
 * @param {!Blockly.Block} block Block to add.
 */
Blockly.Workspace.prototype.addTopBlock = function(block) {
  this.topBlocks_.push(block);
};

/**
 * Removes a block from the list of top blocks.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.Workspace.prototype.removeTopBlock = function(block) {
  if (!Blockly.utils.arrayRemove(this.topBlocks_, block)) {
    throw Error('Block not present in workspace\'s list of top-most blocks.');
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
    this.sortObjects_.offset =
        Math.sin(Blockly.utils.math.toRadians(Blockly.Workspace.SCAN_ANGLE));
    if (this.RTL) {
      this.sortObjects_.offset *= -1;
    }
    blocks.sort(this.sortObjects_);
  }
  return blocks;
};

/**
 * Add a block to the list of blocks keyed by type.
 * @param {!Blockly.Block} block Block to add.
 */
Blockly.Workspace.prototype.addTypedBlock = function(block) {
  if (!this.typedBlocksDB_[block.type]) {
    this.typedBlocksDB_[block.type] = [];
  }
  this.typedBlocksDB_[block.type].push(block);
};

/**
 * Remove a block from the list of blocks keyed by type.
 * @param {!Blockly.Block} block Block to remove.
 */
Blockly.Workspace.prototype.removeTypedBlock = function(block) {
  this.typedBlocksDB_[block.type].splice(this.typedBlocksDB_[block.type]
      .indexOf(block), 1);
  if (!this.typedBlocksDB_[block.type].length) {
    delete this.typedBlocksDB_[block.type];
  }
};

/**
 * Finds the blocks with the associated type and returns them. Blocks are
 * optionally sorted by position; top to bottom (with slight LTR or RTL bias).
 * @param {string} type The type of block to search for.
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array.<!Blockly.Block>} The blocks of the given type.
 */
Blockly.Workspace.prototype.getBlocksByType = function(type, ordered) {
  if (!this.typedBlocksDB_[type]) {
    return [];
  }
  var blocks = this.typedBlocksDB_[type].slice(0);
  if (ordered && blocks.length > 1) {
    this.sortObjects_.offset =
        Math.sin(Blockly.utils.math.toRadians(Blockly.Workspace.SCAN_ANGLE));
    if (this.RTL) {
      this.sortObjects_.offset *= -1;
    }
    blocks.sort(this.sortObjects_);
  }
  return blocks;
};

/**
 * Adds a comment to the list of top comments.
 * @param {!Blockly.WorkspaceComment} comment comment to add.
 * @package
 */
Blockly.Workspace.prototype.addTopComment = function(comment) {
  this.topComments_.push(comment);

  // Note: If the comment database starts to hold block comments, this may need
  // to move to a separate function.
  if (this.commentDB_[comment.id]) {
    console.warn('Overriding an existing comment on this workspace, with id "' +
        comment.id + '"');
  }
  this.commentDB_[comment.id] = comment;
};

/**
 * Removes a comment from the list of top comments.
 * @param {!Blockly.WorkspaceComment} comment comment to remove.
 * @package
 */
Blockly.Workspace.prototype.removeTopComment = function(comment) {
  if (!Blockly.utils.arrayRemove(this.topComments_, comment)) {
    throw Error('Comment not present in workspace\'s list of top-most ' +
        'comments.');
  }
  // Note: If the comment database starts to hold block comments, this may need
  // to move to a separate function.
  delete this.commentDB_[comment.id];
};

/**
 * Finds the top-level comments and returns them.  Comments are optionally
 * sorted by position; top to bottom (with slight LTR or RTL bias).
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array.<!Blockly.WorkspaceComment>} The top-level comment objects.
 * @package
 */
Blockly.Workspace.prototype.getTopComments = function(ordered) {
  // Copy the topComments_ list.
  var comments = [].concat(this.topComments_);
  if (ordered && comments.length > 1) {
    this.sortObjects_.offset =
        Math.sin(Blockly.utils.math.toRadians(Blockly.Workspace.SCAN_ANGLE));
    if (this.RTL) {
      this.sortObjects_.offset *= -1;
    }
    comments.sort(this.sortObjects_);
  }
  return comments;
};

/**
 * Find all blocks in workspace.  Blocks are optionally sorted
 * by position; top to bottom (with slight LTR or RTL bias).
 * @param {boolean} ordered Sort the list if true.
 * @return {!Array.<!Blockly.Block>} Array of blocks.
 */
Blockly.Workspace.prototype.getAllBlocks = function(ordered) {
  if (ordered) {
    // Slow, but ordered.
    var topBlocks = this.getTopBlocks(true);
    var blocks = [];
    for (var i = 0; i < topBlocks.length; i++) {
      blocks.push.apply(blocks, topBlocks[i].getDescendants(true));
    }
  } else {
    // Fast, but in no particular order.
    var blocks = this.getTopBlocks(false);
    for (var i = 0; i < blocks.length; i++) {
      blocks.push.apply(blocks, blocks[i].getChildren(false));
    }
  }

  // Insertion markers exist on the workspace for rendering reasons, but aren't
  // "real" blocks from a developer perspective.
  var filtered = blocks.filter(function(block) {
    return !block.isInsertionMarker();
  });

  return filtered;
};

/**
 * Dispose of all blocks and comments in workspace.
 */
Blockly.Workspace.prototype.clear = function() {
  this.isClearing = true;
  try {
    var existingGroup = Blockly.Events.getGroup();
    if (!existingGroup) {
      Blockly.Events.setGroup(true);
    }
    while (this.topBlocks_.length) {
      this.topBlocks_[0].dispose(false);
    }
    while (this.topComments_.length) {
      this.topComments_[this.topComments_.length - 1].dispose(false);
    }
    if (!existingGroup) {
      Blockly.Events.setGroup(false);
    }
    this.variableMap_.clear();
    if (this.potentialVariableMap_) {
      this.potentialVariableMap_.clear();
    }
  } finally {
    this.isClearing = false;
  }
};

/* Begin functions that are just pass-throughs to the variable map. */
/**
 * Rename a variable by updating its name in the variable map. Identify the
 * variable to rename with the given ID.
 * @param {string} id ID of the variable to rename.
 * @param {string} newName New variable name.
 */
Blockly.Workspace.prototype.renameVariableById = function(id, newName) {
  this.variableMap_.renameVariableById(id, newName);
};

/**
 * Create a variable with a given name, optional type, and optional ID.
 * @param {string} name The name of the variable. This must be unique across
 *     variables and procedures.
 * @param {?string=} opt_type The type of the variable like 'int' or 'string'.
 *     Does not need to be unique. Field_variable can filter variables based on
 *     their type. This will default to '' which is a specific type.
 * @param {?string=} opt_id The unique ID of the variable. This will default to
 *     a UUID.
 * @return {!Blockly.VariableModel} The newly created variable.
 */
Blockly.Workspace.prototype.createVariable = function(name, opt_type, opt_id) {
  return this.variableMap_.createVariable(name, opt_type, opt_id);
};

/**
 * Find all the uses of the given variable, which is identified by ID.
 * @param {string} id ID of the variable to find.
 * @return {!Array.<!Blockly.Block>} Array of block usages.
 */
Blockly.Workspace.prototype.getVariableUsesById = function(id) {
  return this.variableMap_.getVariableUsesById(id);
};

/**
 * Delete a variables by the passed in ID and all of its uses from this
 * workspace. May prompt the user for confirmation.
 * @param {string} id ID of variable to delete.
 */
Blockly.Workspace.prototype.deleteVariableById = function(id) {
  this.variableMap_.deleteVariableById(id);
};

/**
 * Find the variable by the given name and return it. Return null if it is not
 *     found.
 * @param {string} name The name to check for.
 * @param {string=} opt_type The type of the variable.  If not provided it
 *     defaults to the empty string, which is a specific type.
 * @return {Blockly.VariableModel} The variable with the given name.
 */
// TODO (#1559): Possibly delete this function after resolving #1559.
Blockly.Workspace.prototype.getVariable = function(name, opt_type) {
  return this.variableMap_.getVariable(name, opt_type);
};

/**
 * Find the variable by the given ID and return it. Return null if it is not
 *     found.
 * @param {string} id The ID to check for.
 * @return {Blockly.VariableModel} The variable with the given ID.
 */
Blockly.Workspace.prototype.getVariableById = function(id) {
  return this.variableMap_.getVariableById(id);
};

/**
 * Find the variable with the specified type. If type is null, return list of
 *     variables with empty string type.
 * @param {?string} type Type of the variables to find.
 * @return {!Array.<!Blockly.VariableModel>} The sought after variables of the
 *     passed in type. An empty array if none are found.
 */
Blockly.Workspace.prototype.getVariablesOfType = function(type) {
  return this.variableMap_.getVariablesOfType(type);
};

/**
 * Return all variable types.
 * @return {!Array.<string>} List of variable types.
 * @package
 */
Blockly.Workspace.prototype.getVariableTypes = function() {
  return this.variableMap_.getVariableTypes(this);
};

/**
 * Return all variables of all types.
 * @return {!Array.<!Blockly.VariableModel>} List of variable models.
 */
Blockly.Workspace.prototype.getAllVariables = function() {
  return this.variableMap_.getAllVariables();
};

/**
 * Returns all variable names of all types.
 * @return {!Array.<string>} List of all variable names of all types.
 */
Blockly.Workspace.prototype.getAllVariableNames = function() {
  return this.variableMap_.getAllVariableNames();
};

/* End functions that are just pass-throughs to the variable map. */

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
 * @param {!string} prototypeName Name of the language object containing
 *     type-specific functions for this block.
 * @param {string=} opt_id Optional ID.  Use this ID if provided, otherwise
 *     create a new ID.
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

  return this.options.maxBlocks - this.getAllBlocks(false).length;
};

/**
 * The number of blocks of the given type that may be added to the workspace
 *    before reaching the maxInstances allowed for that type.
 * @param {string} type Type of block to return capacity for.
 * @return {number} Number of blocks of type left.
 */
Blockly.Workspace.prototype.remainingCapacityOfType = function(type) {
  if (!this.options.maxInstances) {
    return Infinity;
  }

  var maxInstanceOfType = (this.options.maxInstances[type] !== undefined) ?
      this.options.maxInstances[type] : Infinity;

  return maxInstanceOfType - this.getBlocksByType(type, false).length;
};

/**
 * Check if there is remaining capacity for blocks of the given counts to be
 *    created. If the total number of blocks represented by the map is more than
 *    the total remaining capacity, it returns false. If a type count is more
 *    than the remaining capacity for that type, it returns false.
 * @param {!Object} typeCountsMap A map of types to counts (usually representing
 *    blocks to be created).
 * @return {boolean} True if there is capacity for the given map,
 *    false otherwise.
 */
Blockly.Workspace.prototype.isCapacityAvailable = function(typeCountsMap) {
  if (!this.hasBlockLimits()) {
    return true;
  }
  var copyableBlocksCount = 0;
  for (var type in typeCountsMap) {
    if (typeCountsMap[type] > this.remainingCapacityOfType(type)) {
      return false;
    }
    copyableBlocksCount += typeCountsMap[type];
  }
  if (copyableBlocksCount > this.remainingCapacity()) {
    return false;
  }
  return true;
};

/**
 * Checks if the workspace has any limits on the maximum number of blocks,
 *    or the maximum number of blocks of specific types.
 * @return {boolean} True if it has block limits, false otherwise.
 */
Blockly.Workspace.prototype.hasBlockLimits = function() {
  return this.options.maxBlocks != Infinity || !!this.options.maxInstances;
};

/**
 * Gets the undo stack for workplace.
 * @return {!Array.<!Blockly.Events.Abstract>} undo stack
 * @package
 */
Blockly.Workspace.prototype.getUndoStack = function() {
  return this.undoStack_;
};

/**
 * Gets the redo stack for workplace.
 * @return {!Array.<!Blockly.Events.Abstract>} redo stack
 * @package
 */
Blockly.Workspace.prototype.getRedoStack = function() {
  return this.redoStack_;
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
  for (var i = 0, event; (event = events[i]); i++) {
    outputStack.push(event);
  }
  events = Blockly.Events.filter(events, redo);
  Blockly.Events.recordUndo = false;
  try {
    for (var i = 0, event; (event = events[i]); i++) {
      event.run(redo);
    }
  } finally {
    Blockly.Events.recordUndo = true;
  }
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
 * Note that there may be a few recent events already on the stack.  Thus the
 * new change listener might be called with events that occurred a few
 * milliseconds before the change listener was added.
 * @param {!Function} func Function to call.
 * @return {!Function} Obsolete return value, ignore.
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
  Blockly.utils.arrayRemove(this.listeners_, func);
};

/**
 * Fire a change event.
 * @param {!Blockly.Events.Abstract} event Event to fire.
 */
Blockly.Workspace.prototype.fireChangeListener = function(event) {
  if (event.recordUndo) {
    this.undoStack_.push(event);
    this.redoStack_.length = 0;
    while (this.undoStack_.length > this.MAX_UNDO && this.MAX_UNDO >= 0) {
      this.undoStack_.shift();
    }
  }
  for (var i = 0, func; (func = this.listeners_[i]); i++) {
    func(event);
  }
};

/**
 * Find the block on this workspace with the specified ID.
 * @param {string} id ID of block to find.
 * @return {Blockly.Block} The sought after block, or null if not found.
 */
Blockly.Workspace.prototype.getBlockById = function(id) {
  return this.blockDB_[id] || null;
};

/**
 * Set a block on this workspace with the specified ID.
 * @param {string} id ID of block to set.
 * @param {Blockly.Block} block The block to set.
 * @package
 */
Blockly.Workspace.prototype.setBlockById = function(id, block) {
  this.blockDB_[id] = block;
};

/**
 * Delete a block off this workspace with the specified ID.
 * @param {string} id ID of block to delete.
 * @package
 */
Blockly.Workspace.prototype.removeBlockById = function(id) {
  delete this.blockDB_[id];
};

/**
 * Find the comment on this workspace with the specified ID.
 * @param {string} id ID of comment to find.
 * @return {Blockly.WorkspaceComment} The sought after comment, or null if not
 *     found.
 * @package
 */
Blockly.Workspace.prototype.getCommentById = function(id) {
  return this.commentDB_[id] || null;
};

/**
 * Checks whether all value and statement inputs in the workspace are filled
 * with blocks.
 * @param {boolean=} opt_shadowBlocksAreFilled An optional argument controlling
 *     whether shadow blocks are counted as filled. Defaults to true.
 * @return {boolean} True if all inputs are filled, false otherwise.
 */
Blockly.Workspace.prototype.allInputsFilled = function(
    opt_shadowBlocksAreFilled) {
  var blocks = this.getTopBlocks(false);
  for (var i = 0, block; (block = blocks[i]); i++) {
    if (!block.allInputsFilled(opt_shadowBlocksAreFilled)) {
      return false;
    }
  }
  return true;
};

/**
 * Return the variable map that contains "potential" variables.
 * These exist in the flyout but not in the workspace.
 * @return {Blockly.VariableMap} The potential variable map.
 * @package
 */
Blockly.Workspace.prototype.getPotentialVariableMap = function() {
  return this.potentialVariableMap_;
};

/**
 * Create and store the potential variable map for this workspace.
 * @package
 */
Blockly.Workspace.prototype.createPotentialVariableMap = function() {
  this.potentialVariableMap_ = new Blockly.VariableMap(this);
};

/**
 * Return the map of all variables on the workspace.
 * @return {!Blockly.VariableMap} The variable map.
 */
Blockly.Workspace.prototype.getVariableMap = function() {
  return this.variableMap_;
};

/**
 * Set the map of all variables on the workspace.
 * @param {!Blockly.VariableMap} variableMap The variable map.
 * @package
 */
Blockly.Workspace.prototype.setVariableMap = function(variableMap) {
  this.variableMap_ = variableMap;
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

/**
 * Find all workspaces.
 * @return {!Array.<!Blockly.Workspace>} Array of workspaces.
 */
Blockly.Workspace.getAll = function() {
  var workspaces = [];
  for (var workspaceId in Blockly.Workspace.WorkspaceDB_) {
    workspaces.push(Blockly.Workspace.WorkspaceDB_[workspaceId]);
  }
  return workspaces;
};
