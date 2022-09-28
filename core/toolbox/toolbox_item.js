/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An item in the toolbox.
 */
'use strict';

/**
 * An item in the toolbox.
 * @class
 */
goog.module('Blockly.ToolboxItem');

const idGenerator = goog.require('Blockly.utils.idGenerator');
/* eslint-disable-next-line no-unused-vars */
const toolbox = goog.requireType('Blockly.utils.toolbox');
/* eslint-disable-next-line no-unused-vars */
const {ICollapsibleToolboxItem} = goog.requireType('Blockly.ICollapsibleToolboxItem');
/* eslint-disable-next-line no-unused-vars */
const {IToolboxItem} = goog.require('Blockly.IToolboxItem');
/* eslint-disable-next-line no-unused-vars */
const {IToolbox} = goog.requireType('Blockly.IToolbox');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');


/**
 * Class for an item in the toolbox.
 * @implements {IToolboxItem}
 * @alias Blockly.ToolboxItem
 */
class ToolboxItem {
  /**
   * @param {!toolbox.ToolboxItemInfo} toolboxItemDef The JSON defining
   *     the toolbox item.
   * @param {!IToolbox} toolbox The toolbox that holds the toolbox item.
   * @param {ICollapsibleToolboxItem=} opt_parent The parent toolbox item
   *     or null if the category does not have a parent.
   */
  constructor(toolboxItemDef, toolbox, opt_parent) {
    /**
     * The id for the category.
     * @type {string}
     * @protected
     */
    this.id_ = toolboxItemDef['toolboxitemid'] || idGenerator.getNextUniqueId();

    /**
     * The parent of the category.
     * @type {?ICollapsibleToolboxItem}
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
     * @type {?toolbox.ToolboxItemInfo}
     * @protected
     */
    this.toolboxItemDef_ = toolboxItemDef;

    /**
     * The toolbox this category belongs to.
     * @type {!IToolbox}
     * @protected
     */
    this.parentToolbox_ = toolbox;

    /**
     * The workspace of the parent toolbox.
     * @type {!WorkspaceSvg}
     * @protected
     */
    this.workspace_ = this.parentToolbox_.getWorkspace();
  }

  /**
   * Initializes the toolbox item.
   * This includes creating the DOM and updating the state of any items based
   * on the info object.
   * @public
   */
  init() {
    // No-op by default.
  }

  /**
   * Gets the div for the toolbox item.
   * @return {?Element} The div for the toolbox item.
   * @public
   */
  getDiv() {
    return null;
  }

  /**
   * Gets the HTML element that is clickable.
   * The parent toolbox element receives clicks. The parent toolbox will add an
   * ID to this element so it can pass the onClick event to the correct
   * toolboxItem.
   * @return {?Element} The HTML element that receives clicks, or null if this
   *     item should not receive clicks.
   * @public
   */
  getClickTarget() {
    return null;
  }

  /**
   * Gets a unique identifier for this toolbox item.
   * @return {string} The ID for the toolbox item.
   * @public
   */
  getId() {
    return this.id_;
  }

  /**
   * Gets the parent if the toolbox item is nested.
   * @return {?IToolboxItem} The parent toolbox item, or null if
   *     this toolbox item is not nested.
   * @public
   */
  getParent() {
    return null;
  }

  /**
   * Gets the nested level of the category.
   * @return {number} The nested level of the category.
   * @package
   */
  getLevel() {
    return this.level_;
  }

  /**
   * Whether the toolbox item is selectable.
   * @return {boolean} True if the toolbox item can be selected.
   * @public
   */
  isSelectable() {
    return false;
  }

  /**
   * Whether the toolbox item is collapsible.
   * @return {boolean} True if the toolbox item is collapsible.
   * @public
   */
  isCollapsible() {
    return false;
  }

  /**
   * Dispose of this toolbox item. No-op by default.
   * @public
   */
  dispose() {}
}

exports.ToolboxItem = ToolboxItem;
