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
 * @fileoverview An SVG that floats on top of the workspace.
 * Blocks are moved into this SVG during a drag, improving performance.
 * The entire SVG is translated, so the blocks are never repainted during drag.
 * @author katelyn@google.com (Katelyn Mann)
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
 * Create the drag surface and inject it into the container.
 */
Blockly.WsDragSurfaceSvg.prototype.createDom = function() {
  if (this.SVG_) {
    return;  // Already created.
  }
  this.outerDiv_ = document.createElement('div');
  this.outerDiv_.id = 'wsDragLayerWrapper';
  this.SVG_ = Blockly.createSvgElement('svg', {
    'xmlns': Blockly.SVG_NS,
    'xmlns:html': Blockly.HTML_NS,
    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'class': 'blocklyWsDragSurface'
  }, this.outerDiv_);
  this.container_.appendChild(this.outerDiv_);
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
  // Force values to have two decimal points.
  // This is a work-around to prevent a bug in Safari, where numbers close to 0
  // are sometimes reported as something like "2.9842794901924208e-12".
  // That is incompatible with translate3d, causing bugs.
  x = x.toFixed(0);
  y = y.toFixed(0);
  // Ignorning browsers that don't support translate3d at the moment.
  var transform =
    'transform: translate3d(' + x + 'px, ' + y + 'px, 0px); display: block;';
  this.SVG_.setAttribute('style', transform);
};

/**
 * Reports the surface translation in scaled workspace coordinates.
 * Use this when finishing a drag to return blocks to the correct position.
 * @return {goog.math.Coordinate} Current translation of the surface
 */
Blockly.WsDragSurfaceSvg.prototype.getSurfaceTranslation = function() {
  var xy = Blockly.getRelativeXY_(this.SVG_);
  return new goog.math.Coordinate(xy.x, xy.y);
};

/**
 * Get the first Element under the svg.
 * @return {Element} Drag surface block DOM element
 */
Blockly.WsDragSurfaceSvg.prototype.getChildGroup = function() {
  // For now there is only 1.  Change when there is a bubble canvas???
  return this.SVG_.childNodes[0];
};

/**
 * Clear the group and hide the surface;  Move everything back to newSurface.
 * @param {!SVGElement} newSurface The element to put the drag surface contents
 * into.
 */
Blockly.WsDragSurfaceSvg.prototype.clearAndHide = function(newSurface) {
  var blockCanvas = this.SVG_.childNodes[0];
  var bubbleCanvas = this.SVG_.childNodes[1];
  if (!blockCanvas || !bubbleCanvas) {
    throw 'Couldn\'t clear and hide the drag surface.  A node was missing.';
  }
  // This is ugly and needs some more testing and reworking.  A unittest is
  // actually probably the easiest way to verify.
  // Reattach the block canvas.
  if (this.previousSibling_ != null) {
    if (this.previousSibling_.nextSibling != null)  {
      // There is no insertAfter so we do some silly dom stuff to get the same effect.
      newSurface.insertBefore(blockCanvas, this.previousSibling_.nextSibling);
    } else {
      // there is nothing to insert it before so we stick it at the end.
      newSurface.appendChild(blockCanvas);
    }
  } else if (newSurface.firstChild != null) {
    newSurface.insertBefore(blockCanvas, newSurface.firstChild);
  } else {
    newSurface.appendChild(blockCanvas);
  }

  // Reattach the bubble canvas.
  Blockly.utils.insertAfter_(bubbleCanvas, blockCanvas);
  // check th oerder of how we do this dom manipulation.
  this.SVG_.style.display = 'none';
  this.outerDiv_.style.display = 'none';
  // if defs goes back in, this is the wrong assert
  goog.asserts.assert(this.SVG_.childNodes.length == 0, 'Drag group was not cleared.');
  this.SVG_.style.transform = '';
  this.previousSibling_ = null;
};

/**
 * Set the SVG to have everything on it and how the surface.
 * @param {!Element} blockCanvas The block canvas <g> element from the workspace.
 * @param {!Element} bubbleCanvas The <g> element that contains the bubbles.
 * @param {?Element} previousSibling The element to insert the block canvas &
   bubble canvas after when it goes back in the dom at the end of a drag.
 * @param {number} width The width of the workspace svg element.
 * @param {number} height The height of the workspace svg element.
 * @param {number} scale The scale of the workspace being dragged.
 * 
 */
Blockly.WsDragSurfaceSvg.prototype.setContentsAndShow = function(
    blockCanvas, bubbleCanvas, previousSibling, width, height, scale) {
  this.previousSibling_ = previousSibling;
  blockCanvas.setAttribute('transform', 'translate(0, 0) scale(' + scale + ')');
  bubbleCanvas.setAttribute('transform', 'translate(0, 0) scale(' + scale + ')');
  // if defs goes back in this is the wrong assert
  goog.asserts.assert(this.SVG_.childNodes.length == 0,
    'Already dragging a block.');
  // appendChild removes the blocks from the previous parent
  // TODO: Cost of a layout on mousedown is high.  Try updating the height
  // continuously while these elements are invisible will help. 
  this.outerDiv_.style.width = width;
  this.outerDiv_.style.height = height;
  this.SVG_.setAttribute('width', width);
  this.SVG_.setAttribute('height', height);
  this.SVG_.appendChild(blockCanvas);
  this.SVG_.appendChild(bubbleCanvas);
  this.SVG_.style.display = 'block';
  this.outerDiv_.style.display = 'block';
};

