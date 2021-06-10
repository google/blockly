/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a block dragger.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

'use strict';

goog.provide('Blockly.IBlockDragger');

goog.requireType('Blockly.BlockSvg');
goog.requireType('Blockly.utils.Coordinate');


/**
 * A block dragger interface.
 * @interface
 */
Blockly.IBlockDragger = function() {};

/**
 * Start dragging a block.  This includes moving it to the drag surface.
 * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at mouse down, in pixel units.
 * @param {boolean} healStack Whether or not to heal the stack after
 *     disconnecting.
 */
Blockly.IBlockDragger.prototype.startDrag;

/**
 * Execute a step of block dragging, based on the given event.  Update the
 * display accordingly.
 * @param {!Event} e The most recent move event.
 * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 */
Blockly.IBlockDragger.prototype.drag;

/**
 * Finish a block drag and put the block back on the workspace.
 * @param {!Event} e The mouseup/touchend event.
 * @param {!Blockly.utils.Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 */
Blockly.IBlockDragger.prototype.endDrag;

/**
 * Get a list of the insertion markers that currently exist.  Drags have 0, 1,
 * or 2 insertion markers.
 * @return {!Array.<!Blockly.BlockSvg>} A possibly empty list of insertion
 *     marker blocks.
 */
Blockly.IBlockDragger.prototype.getInsertionMarkers;
