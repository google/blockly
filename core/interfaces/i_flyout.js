/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a flyout.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

'use strict';

goog.provide('Blockly.IFlyout');

goog.requireType('Blockly.BlockSvg');
goog.requireType('Blockly.IRegistrable');
goog.requireType('Blockly.utils.Coordinate');
goog.requireType('Blockly.utils.Svg');
goog.requireType('Blockly.utils.toolbox');
goog.requireType('Blockly.WorkspaceSvg');


/**
 * Interface for a flyout.
 * @extends {Blockly.IRegistrable}
 * @interface
 */
Blockly.IFlyout = function() {};

/**
 * Whether the flyout is laid out horizontally or not.
 * @type {boolean}
 */
Blockly.IFlyout.prototype.horizontalLayout;

/**
 * Is RTL vs LTR.
 * @type {boolean}
 */
Blockly.IFlyout.prototype.RTL;

/**
 * The target workspace
 * @type {?Blockly.WorkspaceSvg}
 */
Blockly.IFlyout.prototype.targetWorkspace;

/**
 * Margin around the edges of the blocks in the flyout.
 * @type {number}
 * @const
 */
Blockly.IFlyout.prototype.MARGIN;

/**
 * Does the flyout automatically close when a block is created?
 * @type {boolean}
 */
Blockly.IFlyout.prototype.autoClose;

/**
 * Corner radius of the flyout background.
 * @type {number}
 * @const
 */
Blockly.IFlyout.prototype.CORNER_RADIUS;

/**
 * Creates the flyout's DOM.  Only needs to be called once.  The flyout can
 * either exist as its own svg element or be a g element nested inside a
 * separate svg element.
 * @param {string|
 * !Blockly.utils.Svg<!SVGSVGElement>|
 * !Blockly.utils.Svg<!SVGGElement>} tagName The type of tag to
 *     put the flyout in. This should be <svg> or <g>.
 * @return {!SVGElement} The flyout's SVG group.
 */
Blockly.IFlyout.prototype.createDom;

/**
 * Initializes the flyout.
 * @param {!Blockly.WorkspaceSvg} targetWorkspace The workspace in which to
 *     create new blocks.
 */
Blockly.IFlyout.prototype.init;

/**
 * Dispose of this flyout.
 * Unlink from all DOM elements to prevent memory leaks.
 */
Blockly.IFlyout.prototype.dispose;

/**
 * Get the width of the flyout.
 * @return {number} The width of the flyout.
 */
Blockly.IFlyout.prototype.getWidth;

/**
 * Get the height of the flyout.
 * @return {number} The width of the flyout.
 */
Blockly.IFlyout.prototype.getHeight;

/**
 * Get the workspace inside the flyout.
 * @return {!Blockly.WorkspaceSvg} The workspace inside the flyout.
 */
Blockly.IFlyout.prototype.getWorkspace;

/**
 * Is the flyout visible?
 * @return {boolean} True if visible.
 */
Blockly.IFlyout.prototype.isVisible;

/**
 * Set whether the flyout is visible. A value of true does not necessarily mean
 * that the flyout is shown. It could be hidden because its container is hidden.
 * @param {boolean} visible True if visible.
 */
Blockly.IFlyout.prototype.setVisible;

/**
 * Set whether this flyout's container is visible.
 * @param {boolean} visible Whether the container is visible.
 */
Blockly.IFlyout.prototype.setContainerVisible;

/**
 * Hide and empty the flyout.
 */
Blockly.IFlyout.prototype.hide;

/**
 * Show and populate the flyout.
 * @param {!Blockly.utils.toolbox.FlyoutDefinition|string} flyoutDef Contents to
 *     display in the flyout. This is either an array of Nodes, a NodeList, a
 *     toolbox definition, or a string with the name of the dynamic category.
 */
Blockly.IFlyout.prototype.show;

/**
 * Create a copy of this block on the workspace.
 * @param {!Blockly.BlockSvg} originalBlock The block to copy from the flyout.
 * @return {!Blockly.BlockSvg} The newly created block.
 * @throws {Error} if something went wrong with deserialization.
 */
Blockly.IFlyout.prototype.createBlock;

/**
 * Reflow blocks and their mats.
 */
Blockly.IFlyout.prototype.reflow;

/**
 * @return {boolean} True if this flyout may be scrolled with a scrollbar or by
 *     dragging.
 */
Blockly.IFlyout.prototype.isScrollable;

/**
 * Calculates the x coordinate for the flyout position.
 * @return {number} X coordinate.
 */
Blockly.IFlyout.prototype.getX;

/**
 * Calculates the y coordinate for the flyout position.
 * @return {number} Y coordinate.
 */
Blockly.IFlyout.prototype.getY;

/**
 * Position the flyout.
 * @return {void}
 */
Blockly.IFlyout.prototype.position;

/**
 * Determine if a drag delta is toward the workspace, based on the position
 * and orientation of the flyout. This is used in determineDragIntention_ to
 * determine if a new block should be created or if the flyout should scroll.
 * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at mouse down, in pixel units.
 * @return {boolean} True if the drag is toward the workspace.
 */
Blockly.IFlyout.prototype.isDragTowardWorkspace;
