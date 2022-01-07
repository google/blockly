/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The interface for a block dragger.
 */

'use strict';

/**
 * The interface for a block dragger.
 * @namespace Blockly.IBlockDragger
 */
goog.module('Blockly.IBlockDragger');

/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const {Coordinate} = goog.requireType('Blockly.utils.Coordinate');


/**
 * A block dragger interface.
 * @interface
 * @alias Blockly.IBlockDragger
 */
const IBlockDragger = function() {};

/**
 * Start dragging a block.  This includes moving it to the drag surface.
 * @param {!Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at mouse down, in pixel units.
 * @param {boolean} healStack Whether or not to heal the stack after
 *     disconnecting.
 */
IBlockDragger.prototype.startDrag;

/**
 * Execute a step of block dragging, based on the given event.  Update the
 * display accordingly.
 * @param {!Event} e The most recent move event.
 * @param {!Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 */
IBlockDragger.prototype.drag;

/**
 * Finish a block drag and put the block back on the workspace.
 * @param {!Event} e The mouseup/touchend event.
 * @param {!Coordinate} currentDragDeltaXY How far the pointer has
 *     moved from the position at the start of the drag, in pixel units.
 */
IBlockDragger.prototype.endDrag;

/**
 * Add block to queue of blocks to be rendered on block drag events up to and
 *     including the next block drag event concludes.
 * @param {BlockSvg} block the block to be added.
 * @param {boolean=} addDescendants If true, adds all descendants of this block
 *     to this queue.
 * @param {boolean=} bumpNeighbours If true, calls bumpNeighbors on drag for
 *     this block (and descendants if allDescendants is true).
 */
IBlockDragger.prototype.addToDragRenderQueue;

/**
 * Get a list of the insertion markers that currently exist.  Drags have 0, 1,
 * or 2 insertion markers.
 * @return {!Array.<!BlockSvg>} A possibly empty list of insertion
 *     marker blocks.
 */
IBlockDragger.prototype.getInsertionMarkers;

exports.IBlockDragger = IBlockDragger;
