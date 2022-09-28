/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An SVG that floats on top of the workspace.
 * Blocks are moved into this SVG during a drag, improving performance.
 * The entire SVG is translated using CSS translation instead of SVG so the
 * blocks are never repainted during drag improving performance.
 */

'use strict';

/**
 * An SVG that floats on top of the workspace.
 * Blocks are moved into this SVG during a drag, improving performance.
 * The entire SVG is translated using CSS translation instead of SVG so the
 * blocks are never repainted during drag improving performance.
 * @class
 */
goog.module('Blockly.WorkspaceDragSurfaceSvg');

const dom = goog.require('Blockly.utils.dom');
const svgMath = goog.require('Blockly.utils.svgMath');
/* eslint-disable-next-line no-unused-vars */
const {Coordinate} = goog.requireType('Blockly.utils.Coordinate');
const {Svg} = goog.require('Blockly.utils.Svg');


/**
 * Blocks are moved into this SVG during a drag, improving performance.
 * The entire SVG is translated using CSS transforms instead of SVG so the
 * blocks are never repainted during drag improving performance.
 * @alias Blockly.WorkspaceDragSurfaceSvg
 */
class WorkspaceDragSurfaceSvg {
  /**
   * @param {!Element} container Containing element.
   */
  constructor(container) {
    /**
     * The SVG drag surface. Set once by WorkspaceDragSurfaceSvg.createDom.
     * @type {SVGElement}
     * @private
     */
    this.SVG_ = null;

    /**
     * Containing HTML element; parent of the workspace and the drag surface.
     * @type {Element}
     * @private
     */
    this.container_ = container;

    /**
     * The element to insert the block canvas and bubble canvas after when it
     * goes back in the DOM at the end of a drag.
     * @type {Element}
     * @private
     */
    this.previousSibling_ = null;

    this.createDom();
  }
  /**
   * Create the drag surface and inject it into the container.
   */
  createDom() {
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
    this.SVG_ = dom.createSvgElement(
        Svg.SVG, {
          'xmlns': dom.SVG_NS,
          'xmlns:html': dom.HTML_NS,
          'xmlns:xlink': dom.XLINK_NS,
          'version': '1.1',
          'class': 'blocklyWsDragSurface blocklyOverflowVisible',
        },
        null);
    this.container_.appendChild(this.SVG_);
  }
  /**
   * Translate the entire drag surface during a drag.
   * We translate the drag surface instead of the blocks inside the surface
   * so that the browser avoids repainting the SVG.
   * Because of this, the drag coordinates must be adjusted by scale.
   * @param {number} x X translation for the entire surface
   * @param {number} y Y translation for the entire surface
   * @package
   */
  translateSurface(x, y) {
    // This is a work-around to prevent a the blocks from rendering
    // fuzzy while they are being moved on the drag surface.
    const fixedX = x.toFixed(0);
    const fixedY = y.toFixed(0);

    this.SVG_.style.display = 'block';
    dom.setCssTransform(
        this.SVG_, 'translate3d(' + fixedX + 'px, ' + fixedY + 'px, 0)');
  }
  /**
   * Reports the surface translation in scaled workspace coordinates.
   * Use this when finishing a drag to return blocks to the correct position.
   * @return {!Coordinate} Current translation of the surface
   * @package
   */
  getSurfaceTranslation() {
    return svgMath.getRelativeXY(/** @type {!SVGElement} */ (this.SVG_));
  }
  /**
   * Move the blockCanvas and bubbleCanvas out of the surface SVG and on to
   * newSurface.
   * @param {SVGElement} newSurface The element to put the drag surface contents
   *     into.
   * @package
   */
  clearAndHide(newSurface) {
    if (!newSurface) {
      throw Error(
          'Couldn\'t clear and hide the drag surface: missing new surface.');
    }
    const blockCanvas = /** @type {!Element} */ (this.SVG_.childNodes[0]);
    const bubbleCanvas = /** @type {!Element} */ (this.SVG_.childNodes[1]);
    if (!blockCanvas || !bubbleCanvas ||
        !dom.hasClass(blockCanvas, 'blocklyBlockCanvas') ||
        !dom.hasClass(bubbleCanvas, 'blocklyBubbleCanvas')) {
      throw Error(
          'Couldn\'t clear and hide the drag surface. A node was missing.');
    }

    // If there is a previous sibling, put the blockCanvas back right
    // afterwards, otherwise insert it as the first child node in newSurface.
    if (this.previousSibling_ !== null) {
      dom.insertAfter(blockCanvas, this.previousSibling_);
    } else {
      newSurface.insertBefore(blockCanvas, newSurface.firstChild);
    }

    // Reattach the bubble canvas after the blockCanvas.
    dom.insertAfter(bubbleCanvas, blockCanvas);
    // Hide the drag surface.
    this.SVG_.style.display = 'none';
    if (this.SVG_.childNodes.length) {
      throw Error('Drag surface was not cleared.');
    }
    dom.setCssTransform(this.SVG_, '');
    this.previousSibling_ = null;
  }
  /**
   * Set the SVG to have the block canvas and bubble canvas in it and then
   * show the surface.
   * @param {!SVGElement} blockCanvas The block canvas <g> element from the
   *     workspace.
   * @param {!SVGElement} bubbleCanvas The <g> element that contains the
   bubbles.
   * @param {Element} previousSibling The element to insert the block canvas and
         bubble canvas after when it goes back in the DOM at the end of a drag.
   * @param {number} width The width of the workspace SVG element.
   * @param {number} height The height of the workspace SVG element.
   * @param {number} scale The scale of the workspace being dragged.
   * @package
   */
  setContentsAndShow(
      blockCanvas, bubbleCanvas, previousSibling, width, height, scale) {
    if (this.SVG_.childNodes.length) {
      throw Error('Already dragging a block.');
    }
    this.previousSibling_ = previousSibling;
    // Make sure the blocks and bubble canvas are scaled appropriately.
    blockCanvas.setAttribute(
        'transform', 'translate(0, 0) scale(' + scale + ')');
    bubbleCanvas.setAttribute(
        'transform', 'translate(0, 0) scale(' + scale + ')');
    this.SVG_.setAttribute('width', width);
    this.SVG_.setAttribute('height', height);
    this.SVG_.appendChild(blockCanvas);
    this.SVG_.appendChild(bubbleCanvas);
    this.SVG_.style.display = 'block';
  }
}

exports.WorkspaceDragSurfaceSvg = WorkspaceDragSurfaceSvg;
