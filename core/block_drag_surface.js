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
 * @fileoverview Functions for injecting Blockly into a web page.
 * @author picklesrus
 */

'use strict';

goog.provide('Blockly.BlockDragSurfaceSvg');

goog.require('Blockly.utils');

goog.require('goog.asserts');
goog.require('goog.math.Coordinate');

/**
 * Class for a Drag Surface SVG.
 * @param {Element} container Containing element.
 * @constructor
 */
Blockly.BlockDragSurfaceSvg = function(container) {
  this.container_ = container;
};

/**
 * The SVG drag surface. Set once by Blockly.BlockDragSurfaceSvg.createDom.
 * @type {Element}
 * @private
 */
Blockly.BlockDragSurfaceSvg.prototype.SVG_ = null;

/**
 * SVG group inside the drag surface. This is where blocks are moved to.
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
 * @type {Number}
 * @private
 */
Blockly.BlockDragSurfaceSvg.prototype.scale_ = 1;


/**
 * Create the drag surface and inject it into the container.
 */
Blockly.BlockDragSurfaceSvg.prototype.createDom = function() {
  if (this.SVG_) {
    return;  // Already created.
  }
  this.SVG_ = Blockly.createSvgElement('svg', {
    'xmlns': Blockly.SVG_NS,
    'xmlns:html': Blockly.HTML_NS,
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'class': 'blocklyBlockDragSurface'
  }, this.container_);
  var defs = Blockly.createSvgElement('defs', {}, this.SVG_);
  this.dragGroup_ = Blockly.createSvgElement('g', {}, this.SVG_);
};

/**
 * Set the SVG blocks on the drag surface's group and show the surface.
 * Only one block should be on the drag surface at a time.
 * @param {!Element} blocks Block or group of blocks to place on the drag surface
 */
Blockly.BlockDragSurfaceSvg.prototype.setBlocksAndShow = function(blocks) {
  goog.asserts.assert(this.dragGroup_.childNodes.length == 0, 'Already dragging a block.');
  // appendChild removes the blocks from the previous parent
  this.dragGroup_.appendChild(blocks);
  this.SVG_.style.display = 'block';
};

/**
 * Translate and scale the entire drag surface group to keep in sync with the workspace.
 * @param {Number} x X translation
 * @param {Number} y Y translation
 * @param {Number} scale Scale of the group
 */
Blockly.BlockDragSurfaceSvg.prototype.translateAndScaleGroup = function(x, y, scale) {
  var transform;
  this.scale_ = scale;
  // Force values to have two decimal points.
  // This is a work-around to prevent a bug in Safari, where numbers close to 0
  // are sometimes reported as something like "2.9842794901924208e-12".
  // That is incompatible with translate3d, causing bugs.
  x = x.toFixed(0);
  y = y.toFixed(0);
  this.dragGroup_.setAttribute('transform', 'translate('+ x + ','+ y + ')' +
      ' scale(' + scale + ')');
};

/**
 * Translate the entire drag surface during a drag.
 * We translate the drag surface instead of the blocks inside the surface
 * so that the browser avoids repainting the SVG.
 * Because of this, the drag coordinates must be adjusted by scale.
 * @param {Number} x X translation for the entire surface
 * @param {Number} y Y translation for the entire surface
 */
Blockly.BlockDragSurfaceSvg.prototype.translateSurface = function(x, y) {
  var transform;
  x *= this.scale_;
  y *= this.scale_;
  // This is a work-around to prevent a the blocks from rendering
  // fuzzy while they are being dragged on the drag surface.
  x = x.toFixed(0);
  y = y.toFixed(0);
  transform =
    'transform: translate3d(' + x + 'px, ' + y + 'px, 0px); display: block;';
  this.SVG_.setAttribute('style', transform);
};

/**
 * Reports the surface translation in scaled workspace coordinates.
 * Use this when finishing a drag to return blocks to the correct position.
 * @return {goog.math.Coordinate} Current translation of the surface
 */
Blockly.BlockDragSurfaceSvg.prototype.getSurfaceTranslation = function() {
  var xy = Blockly.getRelativeXY_(this.SVG_);
  return new goog.math.Coordinate(xy.x / this.scale_, xy.y / this.scale_);
};

/**
 * Provide a reference to the drag group (primarily for BlockSvg.getRelativeToSurfaceXY).
 * @return {Element} Drag surface group element
 */
Blockly.BlockDragSurfaceSvg.prototype.getGroup = function() {
  return this.dragGroup_;
};

/**
 * Get the current blocks on the drag surface, if any (primarily for BlockSvg.getRelativeToSurfaceXY).
 * @return {Element} Drag surface block DOM element
 */
Blockly.BlockDragSurfaceSvg.prototype.getCurrentBlock = function() {
  return this.dragGroup_.childNodes[0];
};

/**
 * Clear the group and hide the surface; move the blocks off onto the provided element.
 * @param {!Element} newSurface Surface the dragging blocks should be moved to
 */
Blockly.BlockDragSurfaceSvg.prototype.clearAndHide = function(newSurface) {
  // appendChild removes the node from this.dragGroup_
  newSurface.appendChild(this.getCurrentBlock());
  this.SVG_.style.display = 'none';
  goog.asserts.assert(this.dragGroup_.childNodes.length == 0,
  	'Drag group was not cleared.');
};