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

goog.requireType('Blockly.IToolbox');
goog.requireType('Blockly.IToolboxItem');
goog.requireType('Blockly.utils.toolbox');
goog.requireType('Blockly.WorkspaceSvg');

/**
 * Class for an item in the toolbox.
 * @param {!Blockly.utils.toolbox.ToolboxItemInfo} toolboxItemDef The JSON defining the
 *     toolbox item.
 * @param {!Blockly.IToolbox} toolbox The toolbox that holds the toolbox item.
 * @constructor
 * @implements {Blockly.IToolboxItem}
 */
Blockly.ToolboxItem = function(toolboxItemDef, toolbox) {

  /**
   * The id for the category.
   * @type {string}
   * @protected
   */
  this.id_ = toolboxItemDef['id'] || Blockly.utils.IdGenerator.getNextUniqueId();

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
 * Creates the dom for a toolbox item.
 * @return {!Element} The div for the toolbox item.
 * @public
 */
Blockly.ToolboxItem.prototype.createDom = function() {
  return document.createElement('div');
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
 * @return {string} The id for the toolbox item.
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
