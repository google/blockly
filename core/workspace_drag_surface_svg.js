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
 * The entire SVG is translated using css translation instead of SVG so the
 * blocks are never repainted during drag improving performance.
 * @author katelyn@google.com (Katelyn Mann)
 */

'use strict';

goog.provide('Blockly.WorkspaceDragSurfaceSvg');

goog.require('Blockly.utils');

goog.require('goog.asserts');
goog.require('goog.math.Coordinate');


/**
 * Blocks are moved into this SVG during a drag, improving performance.
 * The entire SVG is translated using css transforms instead of SVG so the
 * blocks are never repainted during drag improving performance.
 * @param {!Element} container Containing element.
 * @constructor
 */
Blockly.WorkspaceDragSurfaceSvg = function(container) {
  this.container_ = container;
  this.createDom();
};

/**
 * The SVG drag surface. Set once by Blockly.WorkspaceDragSurfaceSvg.createDom.
 * @type {Element}
 * @private
 */
Blockly.WorkspaceDragSurfaceSvg.prototype.SVG_ = null;

/**
 * SVG group inside the drag surface that holds blocks while a drag is in
 * progress. Blocks are moved here by the workspace at start of a drag and moved
 * back into the main SVG at the end of a drag.
 *
 * @type {Element}
 * @private
 */
Blockly.WorkspaceDragSurfaceSvg.prototype.dragGroup_ = null;

/**
 * Containing HTML element; parent of the workspace and the drag surface.
 * @type {Element}
 * @private
 */
Blockly.WorkspaceDragSurfaceSvg.prototype.container_ = null;

/**
 * Create the drag surface and inject it into the container.
 */
Blockly.WorkspaceDragSurfaceSvg.prototype.createDom = function() {
  if (this.SVG_) {
    return;  // Already created.
  }

  /**
  * Dom structure when the workspace is being dragged. If there is no drag in
  * progress, the SVG is empty and display: none.
  * <svg class="blocklyWsDragSurface" style=transform:translate3d(...)>
  *   <g class="blocklyBlockCanvas"></g>
  *   <g class="blocklyBubbleCanvas">/g>
  * </svg>
  */
  this.SVG_ = Blockly.utils.createSvgElement('svg',
      {
        'xmlns': Blockly.SVG_NS,
        'xmlns:html': Blockly.HTML_NS,
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        'version': '1.1',
        'class': 'blocklyWsDragSurface blocklyOverflowVisible'
      }, null);
  this.container_.appendChild(this.SVG_);
};

/**
 * Translate the entire drag surface during a drag.
 * We translate the drag surface instead of the blocks inside the surface
 * so that the browser avoids repainting the SVG.
 * Because of this, the drag coordinates must be adjusted by scale.
 * @param {number} x X translation for the entire surface
 * @param {number} y Y translation for the entire surface
 * @package
 */
Blockly.WorkspaceDragSurfaceSvg.prototype.translateSurface = function(x, y) {
  // This is a work-around to prevent a the blocks from rendering
  // fuzzy while they are being moved on the drag surface.
  x = x.toFixed(0);
  y = y.toFixed(0);

  this.SVG_.style.display = 'block';
  Blockly.utils.setCssTransform(
      this.SVG_, 'translate3d(' + x + 'px, ' + y + 'px, 0px)');
};

/**
 * Reports the surface translation in scaled workspace coordinates.
 * Use this when finishing a drag to return blocks to the correct position.
 * @return {!goog.math.Coordinate} Current translation of the surface
 * @package
 */
Blockly.WorkspaceDragSurfaceSvg.prototype.getSurfaceTranslation = function() {
  return Blockly.utils.getRelativeXY(this.SVG_);
};

/**
 * Move the blockCanvas and bubbleCanvas out of the surface SVG and on to
 * newSurface.
 * @param {!SVGElement} newSurface The element to put the drag surface contents
 *     into.
 * @package
 */
Blockly.WorkspaceDragSurfaceSvg.prototype.clearAndHide = function(newSurface) {
  var blockCanvas = this.SVG_.childNodes[0];
  var bubbleCanvas = this.SVG_.childNodes[1];
  if (!blockCanvas || !bubbleCanvas ||
      !Blockly.utils.hasClass(blockCanvas, 'blocklyBlockCanvas') ||
      !Blockly.utils.hasClass(bubbleCanvas, 'blocklyBubbleCanvas')) {
    throw 'Couldn\'t clear and hide the drag surface.  A node was missing.';
  }

  // If there is a previous sibling, put the blockCanvas back right afterwards,
  // otherwise insert it as the first child node in newSurface.
  if (this.previousSibling_ != null) {
    Blockly.utils.insertAfter_(blockCanvas, this.previousSibling_);
  } else {
    newSurface.insertBefore(blockCanvas, newSurface.firstChild);
  }

  // Reattach the bubble canvas after the blockCanvas.
  Blockly.utils.insertAfter_(bubbleCanvas, blockCanvas);
  // Hide the drag surface.
  this.SVG_.style.display = 'none';
  goog.asserts.assert(
      this.SVG_.childNodes.length == 0, 'Drag surface was not cleared.');
  Blockly.utils.setCssTransform(this.SVG_, '');
  this.previousSibling_ = null;
};

/**
 * Set the SVG to have the block canvas and bubble canvas in it and then
 * show the surface.
 * @param {!Element} blockCanvas The block canvas <g> element from the workspace.
 * @param {!Element} bubbleCanvas The <g> element that contains the bubbles.
 * @param {?Element} previousSibling The element to insert the block canvas &
       bubble canvas after when it goes back in the DOM at the end of a drag.
 * @param {number} width The width of the workspace SVG element.
 * @param {number} height The height of the workspace SVG element.
 * @param {number} scale The scale of the workspace being dragged.
 * @package
 */
Blockly.WorkspaceDragSurfaceSvg.prototype.setContentsAndShow = function(
    blockCanvas, bubbleCanvas, previousSibling, width, height, scale) {
  goog.asserts.assert(
      this.SVG_.childNodes.length == 0, 'Already dragging a block.');
  this.previousSibling_ = previousSibling;
  // Make sure the blocks and bubble canvas are scaled appropriately.
  blockCanvas.setAttribute('transform', 'translate(0, 0) scale(' + scale + ')');
  bubbleCanvas.setAttribute(
      'transform', 'translate(0, 0) scale(' + scale + ')');
  this.SVG_.setAttribute('width', width);
  this.SVG_.setAttribute('height', height);
  this.SVG_.appendChild(blockCanvas);
  this.SVG_.appendChild(bubbleCanvas);
  this.SVG_.style.display = 'block';
};
