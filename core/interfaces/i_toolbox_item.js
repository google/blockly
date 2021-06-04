/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a toolbox item.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

'use strict';

goog.provide('Blockly.ICollapsibleToolboxItem');
goog.provide('Blockly.ISelectableToolboxItem');
goog.provide('Blockly.IToolboxItem');

goog.requireType('Blockly.utils.toolbox');


/**
 * Interface for an item in the toolbox.
 * @interface
 */
Blockly.IToolboxItem = function() {};

/**
 * Initializes the toolbox item.
 * This includes creating the DOM and updating the state of any items based
 * on the info object.
 * @return {void}
 * @public
 */
Blockly.IToolboxItem.prototype.init;

/**
 * Gets the div for the toolbox item.
 * @return {?Element} The div for the toolbox item.
 * @public
 */
Blockly.IToolboxItem.prototype.getDiv;

/**
 * Gets a unique identifier for this toolbox item.
 * @return {string} The ID for the toolbox item.
 * @public
 */
Blockly.IToolboxItem.prototype.getId;

/**
 * Gets the parent if the toolbox item is nested.
 * @return {?Blockly.IToolboxItem} The parent toolbox item, or null if
 *     this toolbox item is not nested.
 * @public
 */
Blockly.IToolboxItem.prototype.getParent;

/**
 * Gets the nested level of the category.
 * @return {number} The nested level of the category.
 * @package
 */
Blockly.IToolboxItem.prototype.getLevel;

/**
 * Whether the toolbox item is selectable.
 * @return {boolean} True if the toolbox item can be selected.
 * @public
 */
Blockly.IToolboxItem.prototype.isSelectable;

/**
 * Whether the toolbox item is collapsible.
 * @return {boolean} True if the toolbox item is collapsible.
 * @public
 */
Blockly.IToolboxItem.prototype.isCollapsible;

/**
 * Dispose of this toolbox item. No-op by default.
 * @public
 */
Blockly.IToolboxItem.prototype.dispose;

/**
 * Interface for an item in the toolbox that can be selected.
 * @extends {Blockly.IToolboxItem}
 * @interface
 */
Blockly.ISelectableToolboxItem = function() {};

/**
 * Gets the name of the toolbox item. Used for emitting events.
 * @return {string} The name of the toolbox item.
 * @public
 */
Blockly.ISelectableToolboxItem.prototype.getName;

/**
 * Gets the contents of the toolbox item. These are items that are meant to be
 * displayed in the flyout.
 * @return {!Blockly.utils.toolbox.FlyoutItemInfoArray|string} The definition
 *     of items to be displayed in the flyout.
 * @public
 */
Blockly.ISelectableToolboxItem.prototype.getContents;

/**
 * Sets the current toolbox item as selected.
 * @param {boolean} _isSelected True if this category is selected, false
 *     otherwise.
 * @public
 */
Blockly.ISelectableToolboxItem.prototype.setSelected;

/**
 * Gets the HTML element that is clickable.
 * The parent toolbox element receives clicks. The parent toolbox will add an ID
 * to this element so it can pass the onClick event to the correct toolboxItem.
 * @return {!Element} The HTML element that receives clicks.
 * @public
 */
Blockly.ISelectableToolboxItem.prototype.getClickTarget;

/**
 * Handles when the toolbox item is clicked.
 * @param {!Event} _e Click event to handle.
 * @public
 */
Blockly.ISelectableToolboxItem.prototype.onClick;

/**
 * Interface for an item in the toolbox that can be collapsed.
 * @extends {Blockly.ISelectableToolboxItem}
 * @interface
 */
Blockly.ICollapsibleToolboxItem = function() {};

/**
 * Gets any children toolbox items. (ex. Gets the subcategories)
 * @return {!Array<!Blockly.IToolboxItem>} The child toolbox items.
 */
Blockly.ICollapsibleToolboxItem.prototype.getChildToolboxItems;

/**
 * Whether the toolbox item is expanded to show its child subcategories.
 * @return {boolean} True if the toolbox item shows its children, false if it
 *     is collapsed.
 * @public
 */
Blockly.ICollapsibleToolboxItem.prototype.isExpanded;

/**
 * Toggles whether or not the toolbox item is expanded.
 * @public
 */
Blockly.ICollapsibleToolboxItem.prototype.toggleExpanded;
