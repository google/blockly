/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a flyout.
 */

'use strict';

/**
 * The interface for a flyout.
 * @namespace Blockly.IFlyout
 */
goog.module('Blockly.IFlyout');

/* eslint-disable-next-line no-unused-vars */
const toolbox = goog.requireType('Blockly.utils.toolbox');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const {Coordinate} = goog.requireType('Blockly.utils.Coordinate');
/* eslint-disable-next-line no-unused-vars */
const {IRegistrable} = goog.require('Blockly.IRegistrable');
/* eslint-disable-next-line no-unused-vars */
const {Svg} = goog.requireType('Blockly.utils.Svg');
/* eslint-disable-next-line no-unused-vars */
const {WorkspaceSvg} = goog.requireType('Blockly.WorkspaceSvg');


/**
 * Interface for a flyout.
 * @extends {IRegistrable}
 * @interface
 * @alias Blockly.IFlyout
 */
const IFlyout = function() {};

/**
 * Whether the flyout is laid out horizontally or not.
 * @type {boolean}
 */
IFlyout.prototype.horizontalLayout;

/**
 * Is RTL vs LTR.
 * @type {boolean}
 */
IFlyout.prototype.RTL;

/**
 * The target workspace
 * @type {?WorkspaceSvg}
 */
IFlyout.prototype.targetWorkspace;

/**
 * Margin around the edges of the blocks in the flyout.
 * @type {number}
 * @const
 */
IFlyout.prototype.MARGIN;

/**
 * Does the flyout automatically close when a block is created?
 * @type {boolean}
 */
IFlyout.prototype.autoClose;

/**
 * Corner radius of the flyout background.
 * @type {number}
 * @const
 */
IFlyout.prototype.CORNER_RADIUS;

/**
 * Creates the flyout's DOM.  Only needs to be called once.  The flyout can
 * either exist as its own svg element or be a g element nested inside a
 * separate svg element.
 * @param {string|
 * !Svg<!SVGSVGElement>|
 * !Svg<!SVGGElement>} tagName The type of tag to
 *     put the flyout in. This should be <svg> or <g>.
 * @return {!SVGElement} The flyout's SVG group.
 */
IFlyout.prototype.createDom;

/**
 * Initializes the flyout.
 * @param {!WorkspaceSvg} targetWorkspace The workspace in which to
 *     create new blocks.
 */
IFlyout.prototype.init;

/**
 * Dispose of this flyout.
 * Unlink from all DOM elements to prevent memory leaks.
 */
IFlyout.prototype.dispose;

/**
 * Get the width of the flyout.
 * @return {number} The width of the flyout.
 */
IFlyout.prototype.getWidth;

/**
 * Get the height of the flyout.
 * @return {number} The width of the flyout.
 */
IFlyout.prototype.getHeight;

/**
 * Get the workspace inside the flyout.
 * @return {!WorkspaceSvg} The workspace inside the flyout.
 */
IFlyout.prototype.getWorkspace;

/**
 * Is the flyout visible?
 * @return {boolean} True if visible.
 */
IFlyout.prototype.isVisible;

/**
 * Set whether the flyout is visible. A value of true does not necessarily mean
 * that the flyout is shown. It could be hidden because its container is hidden.
 * @param {boolean} visible True if visible.
 */
IFlyout.prototype.setVisible;

/**
 * Set whether this flyout's container is visible.
 * @param {boolean} visible Whether the container is visible.
 */
IFlyout.prototype.setContainerVisible;

/**
 * Hide and empty the flyout.
 */
IFlyout.prototype.hide;

/**
 * Show and populate the flyout.
 * @param {!toolbox.FlyoutDefinition|string} flyoutDef Contents to
 *     display in the flyout. This is either an array of Nodes, a NodeList, a
 *     toolbox definition, or a string with the name of the dynamic category.
 */
IFlyout.prototype.show;

/**
 * Create a copy of this block on the workspace.
 * @param {!BlockSvg} originalBlock The block to copy from the flyout.
 * @return {!BlockSvg} The newly created block.
 * @throws {Error} if something went wrong with deserialization.
 */
IFlyout.prototype.createBlock;

/**
 * Reflow blocks and their mats.
 */
IFlyout.prototype.reflow;

/**
 * @return {boolean} True if this flyout may be scrolled with a scrollbar or by
 *     dragging.
 */
IFlyout.prototype.isScrollable;

/**
 * Calculates the x coordinate for the flyout position.
 * @return {number} X coordinate.
 */
IFlyout.prototype.getX;

/**
 * Calculates the y coordinate for the flyout position.
 * @return {number} Y coordinate.
 */
IFlyout.prototype.getY;

/**
 * Position the flyout.
 * @return {void}
 */
IFlyout.prototype.position;

/**
 * Determine if a drag delta is toward the workspace, based on the position
 * and orientation of the flyout. This is used in determineDragIntention_ to
 * determine if a new block should be created or if the flyout should scroll.
 * @param {!Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at mouse down, in pixel units.
 * @return {boolean} True if the drag is toward the workspace.
 */
IFlyout.prototype.isDragTowardWorkspace;

exports.IFlyout = IFlyout;
