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

goog.requireType('Blockly.IFlyout');
goog.requireType('Blockly.IRegistrable');
goog.requireType('Blockly.IToolboxItem');
goog.requireType('Blockly.utils.toolbox');
goog.requireType('Blockly.WorkspaceSvg');


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
 * Fills the toolbox with new toolbox items and removes any old contents.
 * @param {!Blockly.utils.toolbox.ToolboxInfo} toolboxDef Object holding information
 *     for creating a toolbox.
 */
Blockly.IToolbox.prototype.render;

/**
 * Gets the width of the toolbox.
 * @return {number} The width of the toolbox.
 */
Blockly.IToolbox.prototype.getWidth;

/**
 * Gets the height of the toolbox.
 * @return {number} The width of the toolbox.
 */
Blockly.IToolbox.prototype.getHeight;

/**
 * Gets the toolbox flyout.
 * @return {?Blockly.IFlyout} The toolbox flyout.
 */
Blockly.IToolbox.prototype.getFlyout;

/**
 * Gets the workspace for the toolbox.
 * @return {!Blockly.WorkspaceSvg} The parent workspace for the toolbox.
 */
Blockly.IToolbox.prototype.getWorkspace;

/**
 * Gets whether or not the toolbox is horizontal.
 * @return {boolean} True if the toolbox is horizontal, false if the toolbox is
 *     vertical.
 */
Blockly.IToolbox.prototype.isHorizontal;

/**
 * Positions the toolbox based on whether it is a horizontal toolbox and whether
 * the workspace is in rtl.
 * @return {void}
 */
Blockly.IToolbox.prototype.position;

/**
 * Handles resizing the toolbox when a toolbox item resizes.
 * @return {void}
 */
Blockly.IToolbox.prototype.handleToolboxItemResize;

/**
 * Unhighlights any previously selected item.
 * @return {void}
 */
Blockly.IToolbox.prototype.clearSelection;

/**
 * Updates the category colours and background colour of selected categories.
 * @return {void}
 */
Blockly.IToolbox.prototype.refreshTheme;

/**
 * Updates the flyout's content without closing it.  Should be used in response
 * to a change in one of the dynamic categories, such as variables or
 * procedures.
 * @return {void}
 */
Blockly.IToolbox.prototype.refreshSelection;

/**
 * Sets the visibility of the toolbox.
 * @param {boolean} isVisible True if toolbox should be visible.
 */
Blockly.IToolbox.prototype.setVisible;

/**
 * Selects the toolbox item by it's position in the list of toolbox items.
 * @param {number} position The position of the item to select.
 * @return {void}
 */
Blockly.IToolbox.prototype.selectItemByPosition;

/**
 * Gets the selected item.
 * @return {?Blockly.IToolboxItem} The selected item, or null if no item is
 *     currently selected.
 */
Blockly.IToolbox.prototype.getSelectedItem;

/**
 * Disposes of this toolbox.
 * @return {void}
 */
Blockly.IToolbox.prototype.dispose;
