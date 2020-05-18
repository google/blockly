/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a toolbox.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

'use strict';

goog.provide('Blockly.IToolbox');

goog.require('Blockly.IUIPlugin');

/**
 * @extends {Blockly.IUIPlugin}
 * @interface
 */
Blockly.IToolbox = function() {};

/**
 * Get the toolbox flyout.
 * @return {Blockly.Flyout} The toolbox flyout.
 */
Blockly.IToolbox.prototype.getFlyout;

/**
 * Unhighlight any previously specified option.
 * @return {void}
 */
Blockly.IToolbox.prototype.clearSelection;

/**
 * Updates the category colours and background colour of selected categories.
 */
Blockly.IToolbox.prototype.updateColourFromTheme;

/**
 * Get the width of the toolbox.
 * @return {number} The width of the toolbox.
 */
Blockly.IToolbox.prototype.getWidth;

/**
 * Get the height of the toolbox.
 * @return {number} The width of the toolbox.
 */
Blockly.IToolbox.prototype.getHeight;

/**
 * Return the deletion rectangle for this toolbox.
 * @return {Blockly.utils.Rect} Rectangle in which to delete.
 * TODO: Should be part of deletable?
 */
Blockly.IToolbox.prototype.getClientRect;

/**
 * Handles the given Blockly action on a toolbox.
 * This is only triggered when keyboard accessibility mode is enabled.
 * @param {!Blockly.Action} action The action to be handled.
 * @return {boolean} True if the field handled the action, false otherwise.
 */
Blockly.IToolbox.prototype.onBlocklyAction;

/**
 * Adds a style on the toolbox. Usually used to change the cursor.
 * @param {string} style The name of the class to add.
 */
Blockly.IToolbox.prototype.addStyle;

/**
 * Removes a style from the toolbox. Usually used to change the cursor.
 * @param {string} style The name of the class to remove.
 */
Blockly.IToolbox.prototype.removeStyle;

/**
 * Fill the toolbox with categories and blocks.
 * @param {Array.<Blockly.utils.toolbox.Toolbox>} toolboxDef Array holding objects
 *    containing information on the contents of the toolbox.
 */
Blockly.IToolbox.prototype.renderTree;

/**
 * Update the flyout's contents without closing it.  Should be used in response
 * to a change in one of the dynamic categories, such as variables or
 * procedures.
 */
Blockly.IToolbox.prototype.refreshSelection;
