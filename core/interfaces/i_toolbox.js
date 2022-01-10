/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a toolbox.
 */

'use strict';

/**
 * The interface for a toolbox.
 * @namespace Blockly.IToolbox
 */
goog.module('Blockly.IToolbox');

/* eslint-disable-next-line no-unused-vars */
const toolbox = goog.requireType('Blockly.utils.toolbox');
/* eslint-disable-next-line no-unused-vars */
const {IFlyout} = goog.requireType('Blockly.IFlyout');
/* eslint-disable-next-line no-unused-vars */
const {IRegistrable} = goog.require('Blockly.IRegistrable');
/* eslint-disable-next-line no-unused-vars */
const {IToolboxItem} = goog.requireType('Blockly.IToolboxItem');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');


/**
 * Interface for a toolbox.
 * @extends {IRegistrable}
 * @interface
 * @alias Blockly.IToolbox
 */
const IToolbox = function() {};

/**
 * Initializes the toolbox.
 * @return {void}
 */
IToolbox.prototype.init;

/**
 * Fills the toolbox with new toolbox items and removes any old contents.
 * @param {!toolbox.ToolboxInfo} toolboxDef Object holding information
 *     for creating a toolbox.
 */
IToolbox.prototype.render;

/**
 * Gets the width of the toolbox.
 * @return {number} The width of the toolbox.
 */
IToolbox.prototype.getWidth;

/**
 * Gets the height of the toolbox.
 * @return {number} The width of the toolbox.
 */
IToolbox.prototype.getHeight;

/**
 * Gets the toolbox flyout.
 * @return {?IFlyout} The toolbox flyout.
 */
IToolbox.prototype.getFlyout;

/**
 * Gets the workspace for the toolbox.
 * @return {!WorkspaceSvg} The parent workspace for the toolbox.
 */
IToolbox.prototype.getWorkspace;

/**
 * Gets whether or not the toolbox is horizontal.
 * @return {boolean} True if the toolbox is horizontal, false if the toolbox is
 *     vertical.
 */
IToolbox.prototype.isHorizontal;

/**
 * Positions the toolbox based on whether it is a horizontal toolbox and whether
 * the workspace is in rtl.
 * @return {void}
 */
IToolbox.prototype.position;

/**
 * Handles resizing the toolbox when a toolbox item resizes.
 * @return {void}
 */
IToolbox.prototype.handleToolboxItemResize;

/**
 * Unhighlights any previously selected item.
 * @return {void}
 */
IToolbox.prototype.clearSelection;

/**
 * Updates the category colours and background colour of selected categories.
 * @return {void}
 */
IToolbox.prototype.refreshTheme;

/**
 * Updates the flyout's content without closing it.  Should be used in response
 * to a change in one of the dynamic categories, such as variables or
 * procedures.
 * @return {void}
 */
IToolbox.prototype.refreshSelection;

/**
 * Sets the visibility of the toolbox.
 * @param {boolean} isVisible True if toolbox should be visible.
 */
IToolbox.prototype.setVisible;

/**
 * Selects the toolbox item by it's position in the list of toolbox items.
 * @param {number} position The position of the item to select.
 * @return {void}
 */
IToolbox.prototype.selectItemByPosition;

/**
 * Gets the selected item.
 * @return {?IToolboxItem} The selected item, or null if no item is
 *     currently selected.
 */
IToolbox.prototype.getSelectedItem;

/**
 * Disposes of this toolbox.
 * @return {void}
 */
IToolbox.prototype.dispose;

exports.IToolbox = IToolbox;
