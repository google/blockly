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

goog.requireType('Blockly.IRegistrable');


/**
 * Interface for a toolbox.
 * @extends {Blockly.IRegistrable}
 * @interface
 */
Blockly.IToolbox = function() {};

/**
 * Initializes the toolbox.
 * @return {void}
 */
Blockly.IToolbox.prototype.init;

/**
 * Fill the toolbox with categories and blocks.
 * @param {Array.<Blockly.utils.toolbox.Toolbox>} toolboxDef Array holding objects
 *    containing information on the contents of the toolbox.
 */
Blockly.IToolbox.prototype.render;

/**
 * Dispose of this toolbox.
 * @return {void}
 */
Blockly.IToolbox.prototype.dispose;

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
 * Get the toolbox flyout.
 * @return {Blockly.Flyout} The toolbox flyout.
 */
Blockly.IToolbox.prototype.getFlyout;

/**
 * Move the toolbox to the edge.
 * @return {void}
 */
Blockly.IToolbox.prototype.position;

/**
 * Unhighlight any previously specified option.
 * @return {void}
 */
Blockly.IToolbox.prototype.clearSelection;

/**
 * Updates the category colours and background colour of selected categories.
 * @return {void}
 */
Blockly.IToolbox.prototype.refreshTheme;

/**
 * Update the flyout's contents without closing it.  Should be used in response
 * to a change in one of the dynamic categories, such as variables or
 * procedures.
 * @return {void}
 */
Blockly.IToolbox.prototype.refreshSelection;

/**
 * Toggles the visibility of the toolbox.
 * @param {boolean} isVisible True if the toolbox should be visible.
 */
Blockly.IToolbox.prototype.setVisible;

/**
 * Select the first toolbox category if no category is selected.
 * @return {void}
 */
Blockly.IToolbox.prototype.selectFirstCategory;
