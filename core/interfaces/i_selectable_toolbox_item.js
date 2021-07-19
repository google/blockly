/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a selectable toolbox item.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

'use strict';

goog.provide('Blockly.ISelectableToolboxItem');

goog.require('Blockly.IToolboxItem');
goog.requireType('Blockly.utils.toolbox');


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
