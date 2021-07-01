/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An item in the toolbox.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.ToolboxItem');

goog.require('Blockly.IToolboxItem');

goog.requireType('Blockly.ICollapsibleToolboxItem');
goog.requireType('Blockly.IToolbox');
goog.requireType('Blockly.utils.toolbox');
goog.requireType('Blockly.WorkspaceSvg');


/**
 * Class for an item in the toolbox.
 * @param {!Blockly.utils.toolbox.ToolboxItemInfo} toolboxItemDef The JSON defining the
 *     toolbox item.
 * @param {!Blockly.IToolbox} toolbox The toolbox that holds the toolbox item.
 * @param {Blockly.ICollapsibleToolboxItem=} opt_parent The parent toolbox item
 *     or null if the category does not have a parent.
 * @constructor
 * @implements {Blockly.IToolboxItem}
 */
Blockly.ToolboxItem = function(toolboxItemDef, toolbox, opt_parent) {

  /**
   * The id for the category.
   * @type {string}
   * @protected
   */
  this.id_ = toolboxItemDef['toolboxitemid'] || Blockly.utils.IdGenerator.getNextUniqueId();

  /**
   * The parent of the category.
   * @type {?Blockly.ICollapsibleToolboxItem}
   * @protected
   */
  this.parent_ = opt_parent || null;

  /**
   * The level that the category is nested at.
   * @type {number}
   * @protected
   */
  this.level_ = this.parent_ ? this.parent_.getLevel() + 1 : 0;

  /**
   * The JSON definition of the toolbox item.
   * @type {!Blockly.utils.toolbox.ToolboxItemInfo}
   * @protected
   */
  this.toolboxItemDef_ = toolboxItemDef;

  /**
   * The toolbox this category belongs to.
   * @type {!Blockly.IToolbox}
   * @protected
   */
  this.parentToolbox_ = toolbox;

  /**
   * The workspace of the parent toolbox.
   * @type {!Blockly.WorkspaceSvg}
   * @protected
   */
  this.workspace_ = this.parentToolbox_.getWorkspace();
};

/**
 * Initializes the toolbox item.
 * This includes creating the DOM and updating the state of any items based
 * on the info object.
 * @public
 */
Blockly.ToolboxItem.prototype.init = function() {
  // No-op by default.
};

/**
 * Gets the div for the toolbox item.
 * @return {?Element} The div for the toolbox item.
 * @public
 */
Blockly.ToolboxItem.prototype.getDiv = function() {
  return null;
};

/**
 * Gets a unique identifier for this toolbox item.
 * @return {string} The ID for the toolbox item.
 * @public
 */
Blockly.ToolboxItem.prototype.getId = function() {
  return this.id_;
};

/**
 * Gets the parent if the toolbox item is nested.
 * @return {?Blockly.IToolboxItem} The parent toolbox item, or null if
 *     this toolbox item is not nested.
 * @public
 */
Blockly.ToolboxItem.prototype.getParent = function() {
  return null;
};

/**
 * Gets the nested level of the category.
 * @return {number} The nested level of the category.
 * @package
 */
Blockly.ToolboxItem.prototype.getLevel = function() {
  return this.level_;
};

/**
 * Whether the toolbox item is selectable.
 * @return {boolean} True if the toolbox item can be selected.
 * @public
 */
Blockly.ToolboxItem.prototype.isSelectable = function() {
  return false;
};

/**
 * Whether the toolbox item is collapsible.
 * @return {boolean} True if the toolbox item is collapsible.
 * @public
 */
Blockly.ToolboxItem.prototype.isCollapsible = function() {
  return false;
};

/**
 * Dispose of this toolbox item. No-op by default.
 * @public
 */
Blockly.ToolboxItem.prototype.dispose = function() {
};
