/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Interface for the block drag surface.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */

'use strict';

goog.provide('Blockly.IBlockDragSurfaceSvg');

goog.requireType('Blockly.utils.Coordinate');


/**
 * A block drag surface interface.
 * @interface
 */
Blockly.IBlockDragSurfaceSvg = function() {};

/**
 * Create the drag surface and inject it into the container.
 */
Blockly.IBlockDragSurfaceSvg.prototype.createDom;

/**
 * Set the SVG blocks on the drag surface's group and show the surface.
 * Only one block group should be on the drag surface at a time.
 * @param {!SVGElement} blocks Block or group of blocks to place on the drag
 * surface.
 */
Blockly.IBlockDragSurfaceSvg.prototype.setBlocksAndShow;

/**
 * Translate and scale the entire drag surface group to the given position, to
 * keep in sync with the workspace.
 * @param {number} x X translation in workspace coordinates.
 * @param {number} y Y translation in workspace coordinates.
 * @param {number} scale Scale of the group.
 */
Blockly.IBlockDragSurfaceSvg.prototype.translateAndScaleGroup;

/**
 * Translates the entire surface by a relative offset.
 * @param {number} deltaX Horizontal offset in pixel units.
 * @param {number} deltaY Vertical offset in pixel units.
 */
Blockly.IBlockDragSurfaceSvg.prototype.translateBy;

/**
 * Translate the entire drag surface during a drag.
 * We translate the drag surface instead of the blocks inside the surface
 * so that the browser avoids repainting the SVG.
 * Because of this, the drag coordinates must be adjusted by scale.
 * @param {number} x X translation for the entire surface.
 * @param {number} y Y translation for the entire surface.
 */
Blockly.IBlockDragSurfaceSvg.prototype.translateSurface;

/**
 * Reports the surface translation in scaled workspace coordinates.
 * Use this when finishing a drag to return blocks to the correct position.
 * @return {!Blockly.utils.Coordinate} Current translation of the surface.
 */
Blockly.IBlockDragSurfaceSvg.prototype.getSurfaceTranslation;

/**
 * Provide a reference to the drag group (primarily for
 * BlockSvg.getRelativeToSurfaceXY).
 * @return {SVGElement} Drag surface group element.
 */
Blockly.IBlockDragSurfaceSvg.prototype.getGroup;

/**
 * Get the current blocks on the drag surface, if any (primarily
 * for BlockSvg.getRelativeToSurfaceXY).
 * @return {Element} Drag surface block DOM element, or undefined if no blocks
 * exist.
 */
Blockly.IBlockDragSurfaceSvg.prototype.getCurrentBlock;

/**
 * Clear the group and hide the surface; move the blocks off onto the provided
 * element.
 * If the block is being deleted it doesn't need to go back to the original
 * surface, since it would be removed immediately during dispose.
 * @param {Element=} opt_newSurface Surface the dragging blocks should be moved
 *     to, or null if the blocks should be removed from this surface without
 *     being moved to a different surface.
 */
Blockly.IBlockDragSurfaceSvg.prototype.clearAndHide;
