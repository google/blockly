/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a bubble.
 */

'use strict';

/**
 * The interface for a bubble.
 * @namespace Blockly.IBubble
 */
goog.module('Blockly.IBubble');

/* eslint-disable-next-line no-unused-vars */
const {BlockDragSurfaceSvg} = goog.requireType('Blockly.BlockDragSurfaceSvg');
/* eslint-disable-next-line no-unused-vars */
const {Coordinate} = goog.requireType('Blockly.utils.Coordinate');
/* eslint-disable-next-line no-unused-vars */
const {IContextMenu} = goog.require('Blockly.IContextMenu');
/* eslint-disable-next-line no-unused-vars */
const {IDraggable} = goog.require('Blockly.IDraggable');


/**
 * A bubble interface.
 * @interface
 * @extends {IDraggable}
 * @extends {IContextMenu}
 * @alias Blockly.IBubble
 */
const IBubble = function() {};

/**
 * Return the coordinates of the top-left corner of this bubble's body relative
 * to the drawing surface's origin (0,0), in workspace units.
 * @return {!Coordinate} Object with .x and .y properties.
 */
IBubble.prototype.getRelativeToSurfaceXY;

/**
 * Return the root node of the bubble's SVG group.
 * @return {!SVGElement} The root SVG node of the bubble's group.
 */
IBubble.prototype.getSvgRoot;

/**
 * Set whether auto-layout of this bubble is enabled.  The first time a bubble
 * is shown it positions itself to not cover any blocks.  Once a user has
 * dragged it to reposition, it renders where the user put it.
 * @param {boolean} enable True if auto-layout should be enabled, false
 *     otherwise.
 */
IBubble.prototype.setAutoLayout;

/**
 * Triggers a move callback if one exists at the end of a drag.
 * @param {boolean} adding True if adding, false if removing.
 */
IBubble.prototype.setDragging;

/**
 * Move this bubble during a drag, taking into account whether or not there is
 * a drag surface.
 * @param {?BlockDragSurfaceSvg} dragSurface The surface that carries
 *     rendered items during a drag, or null if no drag surface is in use.
 * @param {!Coordinate} newLoc The location to translate to, in
 *     workspace coordinates.
 */
IBubble.prototype.moveDuringDrag;

/**
 * Move the bubble to the specified location in workspace coordinates.
 * @param {number} x The x position to move to.
 * @param {number} y The y position to move to.
 */
IBubble.prototype.moveTo;

/**
 * Update the style of this bubble when it is dragged over a delete area.
 * @param {boolean} enable True if the bubble is about to be deleted, false
 *     otherwise.
 */
IBubble.prototype.setDeleteStyle;

/**
 * Dispose of this bubble.
 */
IBubble.prototype.dispose;

exports.IBubble = IBubble;
