/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
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
 * @fileoverview An SVG that floats on top of the workspace.
 * Blocks are moved into this SVG during a drag, improving performance.
 * The entire SVG is translated, so the blocks are never repainted during drag.
 * @author tmickel@mit.edu (Tim Mickel)
 */

'use strict';

goog.provide('Blockly.WsDragSurfaceSvg');

goog.require('Blockly.utils');

goog.require('goog.asserts');
goog.require('goog.math.Coordinate');

/**
 * Class for a Drag Surface SVG.
 * @param {Element} container Containing element.
 * @constructor
 */
Blockly.WsDragSurfaceSvg = function(container) {
  this.container_ = container;
};

/**
 * The SVG drag surface. Set once by Blockly.WsDragSurfaceSvg.createDom.
 * @type {Element}
 * @private
 */
Blockly.WsDragSurfaceSvg.prototype.SVG_ = null;

/**
 * SVG group inside the drag surface. This is where blocks are moved to.
 * @type {Element}
 * @private
 */
Blockly.WsDragSurfaceSvg.prototype.dragGroup_ = null;

/**
 * Containing HTML element; parent of the workspace and the drag surface.
 * @type {Element}
 * @private
 */
Blockly.WsDragSurfaceSvg.prototype.container_ = null;

/**
 * Cached value for the scale of the drag surface.
 * Used to set/get the correct translation during and after a drag.
 * @type {Number}
 * @private
 */
Blockly.WsDragSurfaceSvg.prototype.scale_ = 1;

/**
 * ID for the drag shadow filter, set in createDom.
 * @type {string}
 * @private
 */
Blockly.WsDragSurfaceSvg.prototype.dragShadowFilterId_ = '';

/**
 * Standard deviation for gaussian blur on drag shadow, in px.
 * @type {number}
 * @const
 */
Blockly.WsDragSurfaceSvg.SHADOW_STD_DEVIATION = 6;

/**
 * Create the drag surface and inject it into the container.
 */
Blockly.WsDragSurfaceSvg.prototype.createDom = function() {
  if (this.SVG_) {
    return;  // Already created.
  }
  this.SVG_ = Blockly.createSvgElement('svg', {
    'xmlns': Blockly.SVG_NS,
    'xmlns:html': Blockly.HTML_NS,
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'class': 'blocklyWsDragSurface'
  }, this.container_);
  //var defs = Blockly.createSvgElement('defs', {}, this.SVG_);
//  this.dragShadowFilterId_ = this.createDropShadowDom_(defs);
  // not sure if we need a <g> to put stuff in.  Maybe it can just go inside
  // the svg.
  //this.dragGroup_ = Blockly.createSvgElement('g', {}, this.SVG_);
  //this.dragGroup_.setAttribute('filter', 'url(#' + this.dragShadowFilterId_ + ')');
};


/**
 * Translate the entire drag surface during a drag.
 * We translate the drag surface instead of the blocks inside the surface
 * so that the browser avoids repainting the SVG.
 * Because of this, the drag coordinates must be adjusted by scale.
 * @param {Number} x X translation for the entire surface
 * @param {Number} y Y translation for the entire surface
 */
Blockly.WsDragSurfaceSvg.prototype.translateSurface = function(x, y) {
  var transform;
  x *= this.scale_; // have I set these? Maybe not?
  y *= this.scale_;
  // Force values to have two decimal points.
  // This is a work-around to prevent a bug in Safari, where numbers close to 0
  // are sometimes reported as something like "2.9842794901924208e-12".
  // That is incompatible with translate3d, causing bugs.
  x = x.toFixed(2);
  y = y.toFixed(2);
  // Ignorning browesers that don't support translate3d at the moment.
  transform = 'transform: translate3d(' + x + 'px, ' + y + 'px, 0px); display: block;';
  this.SVG_.setAttribute('style', transform);
};

/**
 * Reports the surface translation in scaled workspace coordinates.
 * Use this when finishing a drag to return blocks to the correct position.
 * @return {goog.math.Coordinate} Current translation of the surface
 */
Blockly.WsDragSurfaceSvg.prototype.getSurfaceTranslation = function() {
  var xy = Blockly.getRelativeXY_(this.SVG_);
  return new goog.math.Coordinate(xy.x / this.scale_, xy.y / this.scale_);
};

/**
 * Get the first Element under the svg.
 * @return {Element} Drag surface block DOM element
 */
Blockly.WsDragSurfaceSvg.prototype.getChildGroup = function() {
  return this.SVG_.childNodes[0];
};
/**
 * Clear the group and hide the surface;  Move everything back to newSurface.
 */
Blockly.WsDragSurfaceSvg.prototype.clearAndHide = function(newSurface) {
  // appendChild removes the node from this.dragGroup_
  newSurface.appendChild(this.getChildGroup());
  this.SVG_.style.display = 'none';
  // if defs goes back in, this is the wrong assert
  goog.asserts.assert(this.SVG_.childNodes.length == 0, 'Drag group was not cleared.');
};

/**
 * Set the SVG to have everything on it and how the surface.
 * @param {!Element} guts Block or group of blocks to place on the drag surface
 */
Blockly.WsDragSurfaceSvg.prototype.setBlocksAndShow = function(guts) {
  // if defs goes back in this is the wrong assert
  goog.asserts.assert(this.SVG_.childNodes.length == 0, 'Already dragging a block.');
  // appendChild removes the blocks from the previous parent
  this.SVG_.appendChild(guts);
  this.SVG_.style.display = 'block';
};

