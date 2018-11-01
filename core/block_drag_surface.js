/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview A class that manages a surface for dragging blocks.  When a
 * block drag is started, we move the block (and children) to a separate DOM
 * element that we move around using translate3d. At the end of the drag, the
 * blocks are put back in into the SVG they came from. This helps performance by
 * avoiding repainting the entire SVG on every mouse move while dragging blocks.
 * @author picklesrus
 */

'use strict';

goog.provide('Blockly.BlockDragSurfaceSvg');
goog.require('Blockly.utils');
goog.require('goog.math.Coordinate');


/**
 * Class for a drag surface for the currently dragged block. This is a separate
 * SVG that contains only the currently moving block, or nothing.
 * @param {!Element} container Containing element.
 * @constructor
 */
Blockly.BlockDragSurfaceSvg = function(container) {
  /**
   * @type {!Element}
   * @private
   */
  this.container_ = container;
  this.createDom();
};

/**
 * The SVG drag surface. Set once by Blockly.BlockDragSurfaceSvg.createDom.
 * @type {Element}
 * @private
 */
Blockly.BlockDragSurfaceSvg.prototype.SVG_ = null;

/**
 * This is where blocks live while they are being dragged if the drag surface
 * is enabled.
 * @type {Element}
 * @private
 */
Blockly.BlockDragSurfaceSvg.prototype.dragGroup_ = null;

/**
 * Containing HTML element; parent of the workspace and the drag surface.
 * @type {Element}
 * @private
 */
Blockly.BlockDragSurfaceSvg.prototype.container_ = null;

/**
 * Cached value for the scale of the drag surface.
 * Used to set/get the correct translation during and after a drag.
 * @type {number}
 * @private
 */
Blockly.BlockDragSurfaceSvg.prototype.scale_ = 1;

/**
 * Cached value for the translation of the drag surface.
 * This translation is in pixel units, because the scale is applied to the
 * drag group rather than the top-level SVG.
 * @type {goog.math.Coordinate}
 * @private
 */
Blockly.BlockDragSurfaceSvg.prototype.surfaceXY_ = null;

/**
 * Create the drag surface and inject it into the container.
 */
Blockly.BlockDragSurfaceSvg.prototype.createDom = function() {
  if (this.SVG_) {
    return;  // Already created.
  }
  this.SVG_ = Blockly.utils.createSvgElement('svg', {
    'xmlns': Blockly.SVG_NS,
    'xmlns:html': Blockly.HTML_NS,
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'class': 'blocklyBlockDragSurface'
  }, this.container_);
  this.dragGroup_ = Blockly.utils.createSvgElement('g', {}, this.SVG_);
};

/**
 * Set the SVG blocks on the drag surface's group and show the surface.
 * Only one block group should be on the drag surface at a time.
 * @param {!Element} blocks Block or group of blocks to place on the drag
 * surface.
 */
Blockly.BlockDragSurfaceSvg.prototype.setBlocksAndShow = function(blocks) {
  if (this.dragGroup_.childNodes.length) {
    throw Error('Already dragging a block.');
  }
  // appendChild removes the blocks from the previous parent
  this.dragGroup_.appendChild(blocks);
  this.SVG_.style.display = 'block';
  this.surfaceXY_ = new goog.math.Coordinate(0, 0);
};

/**
 * Translate and scale the entire drag surface group to the given position, to
 * keep in sync with the workspace.
 * @param {number} x X translation in workspace coordinates.
 * @param {number} y Y translation in workspace coordinates.
 * @param {number} scale Scale of the group.
 */
Blockly.BlockDragSurfaceSvg.prototype.translateAndScaleGroup = function(x, y,
    scale) {
  this.scale_ = scale;
  // This is a work-around to prevent a the blocks from rendering
  // fuzzy while they are being dragged on the drag surface.
  var fixedX = x.toFixed(0);
  var fixedY = y.toFixed(0);
  this.dragGroup_.setAttribute('transform',
      'translate(' + fixedX + ',' + fixedY + ') scale(' + scale + ')');
};

/**
 * Translate the drag surface's SVG based on its internal state.
 * @private
 */
Blockly.BlockDragSurfaceSvg.prototype.translateSurfaceInternal_ = function() {
  var x = this.surfaceXY_.x;
  var y = this.surfaceXY_.y;
  // This is a work-around to prevent a the blocks from rendering
  // fuzzy while they are being dragged on the drag surface.
  x = x.toFixed(0);
  y = y.toFixed(0);
  this.SVG_.style.display = 'block';

  Blockly.utils.setCssTransform(this.SVG_,
      'translate3d(' + x + 'px, ' + y + 'px, 0px)');
};

/**
 * Translate the entire drag surface during a drag.
 * We translate the drag surface instead of the blocks inside the surface
 * so that the browser avoids repainting the SVG.
 * Because of this, the drag coordinates must be adjusted by scale.
 * @param {number} x X translation for the entire surface.
 * @param {number} y Y translation for the entire surface.
 */
Blockly.BlockDragSurfaceSvg.prototype.translateSurface = function(x, y) {
  this.surfaceXY_ = new goog.math.Coordinate(x * this.scale_, y * this.scale_);
  this.translateSurfaceInternal_();
};

/**
 * Reports the surface translation in scaled workspace coordinates.
 * Use this when finishing a drag to return blocks to the correct position.
 * @return {!goog.math.Coordinate} Current translation of the surface.
 */
Blockly.BlockDragSurfaceSvg.prototype.getSurfaceTranslation = function() {
  var xy = Blockly.utils.getRelativeXY(this.SVG_);
  return new goog.math.Coordinate(xy.x / this.scale_, xy.y / this.scale_);
};

/**
 * Provide a reference to the drag group (primarily for
 * BlockSvg.getRelativeToSurfaceXY).
 * @return {Element} Drag surface group element.
 */
Blockly.BlockDragSurfaceSvg.prototype.getGroup = function() {
  return this.dragGroup_;
};

/**
 * Get the current blocks on the drag surface, if any (primarily
 * for BlockSvg.getRelativeToSurfaceXY).
 * @return {!Element|undefined} Drag surface block DOM element, or undefined
 * if no blocks exist.
 */
Blockly.BlockDragSurfaceSvg.prototype.getCurrentBlock = function() {
  return this.dragGroup_.firstChild;
};

/**
 * Clear the group and hide the surface; move the blocks off onto the provided
 * element.
 * If the block is being deleted it doesn't need to go back to the original
 * surface, since it would be removed immediately during dispose.
 * @param {Element=} opt_newSurface Surface the dragging blocks should be moved
 *     to, or null if the blocks should be removed from this surface without
 *     being moved to a different surface.
 */
Blockly.BlockDragSurfaceSvg.prototype.clearAndHide = function(opt_newSurface) {
  if (opt_newSurface) {
    // appendChild removes the node from this.dragGroup_
    opt_newSurface.appendChild(this.getCurrentBlock());
  } else {
    this.dragGroup_.removeChild(this.getCurrentBlock());
  }
  this.SVG_.style.display = 'none';
  if (this.dragGroup_.childNodes.length) {
    throw Error('Drag group was not cleared.');
  }
  this.surfaceXY_ = null;
};
