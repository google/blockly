/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A class that manages a surface for dragging blocks.  When a
 * block drag is started, we move the block (and children) to a separate DOM
 * element that we move around using translate3d. At the end of the drag, the
 * blocks are put back in into the SVG they came from. This helps
 * performance by avoiding repainting the entire SVG on every mouse move
 * while dragging blocks.
 */

'use strict';

/**
 * A class that manages a surface for dragging blocks.  When a
 * block drag is started, we move the block (and children) to a separate DOM
 * element that we move around using translate3d. At the end of the drag, the
 * blocks are put back in into the SVG they came from. This helps
 * performance by avoiding repainting the entire SVG on every mouse move
 * while dragging blocks.
 * @class
 */
goog.module('Blockly.BlockDragSurfaceSvg');

const dom = goog.require('Blockly.utils.dom');
const svgMath = goog.require('Blockly.utils.svgMath');
const {Coordinate} = goog.require('Blockly.utils.Coordinate');
const {Svg} = goog.require('Blockly.utils.Svg');


/**
 * Class for a drag surface for the currently dragged block. This is a separate
 * SVG that contains only the currently moving block, or nothing.
 * @alias Blockly.BlockDragSurfaceSvg
 */
const BlockDragSurfaceSvg = class {
  /**
   * @param {!Element} container Containing element.
   */
  constructor(container) {
    /**
     * The SVG drag surface. Set once by BlockDragSurfaceSvg.createDom.
     * @type {?SVGElement}
     * @private
     */
    this.SVG_ = null;

    /**
     * This is where blocks live while they are being dragged if the drag
     * surface is enabled.
     * @type {?SVGElement}
     * @private
     */
    this.dragGroup_ = null;

    /**
     * Containing HTML element; parent of the workspace and the drag surface.
     * @type {!Element}
     * @private
     */
    this.container_ = container;

    /**
     * Cached value for the scale of the drag surface.
     * Used to set/get the correct translation during and after a drag.
     * @type {number}
     * @private
     */
    this.scale_ = 1;

    /**
     * Cached value for the translation of the drag surface.
     * This translation is in pixel units, because the scale is applied to the
     * drag group rather than the top-level SVG.
     * @type {?Coordinate}
     * @private
     */
    this.surfaceXY_ = null;

    /**
     * Cached value for the translation of the child drag surface in pixel
     * units. Since the child drag surface tracks the translation of the
     * workspace this is ultimately the translation of the workspace.
     * @type {!Coordinate}
     * @private
     */
    this.childSurfaceXY_ = new Coordinate(0, 0);

    this.createDom();
  }

  /**
   * Create the drag surface and inject it into the container.
   */
  createDom() {
    if (this.SVG_) {
      return;  // Already created.
    }
    this.SVG_ = dom.createSvgElement(
        Svg.SVG, {
          'xmlns': dom.SVG_NS,
          'xmlns:html': dom.HTML_NS,
          'xmlns:xlink': dom.XLINK_NS,
          'version': '1.1',
          'class': 'blocklyBlockDragSurface',
        },
        this.container_);
    this.dragGroup_ = dom.createSvgElement(Svg.G, {}, this.SVG_);
  }

  /**
   * Set the SVG blocks on the drag surface's group and show the surface.
   * Only one block group should be on the drag surface at a time.
   * @param {!SVGElement} blocks Block or group of blocks to place on the drag
   * surface.
   */
  setBlocksAndShow(blocks) {
    if (this.dragGroup_.childNodes.length) {
      throw Error('Already dragging a block.');
    }
    // appendChild removes the blocks from the previous parent
    this.dragGroup_.appendChild(blocks);
    this.SVG_.style.display = 'block';
    this.surfaceXY_ = new Coordinate(0, 0);
  }

  /**
   * Translate and scale the entire drag surface group to the given position, to
   * keep in sync with the workspace.
   * @param {number} x X translation in pixel coordinates.
   * @param {number} y Y translation in pixel coordinates.
   * @param {number} scale Scale of the group.
   */
  translateAndScaleGroup(x, y, scale) {
    this.scale_ = scale;
    // This is a work-around to prevent a the blocks from rendering
    // fuzzy while they are being dragged on the drag surface.
    const fixedX = x.toFixed(0);
    const fixedY = y.toFixed(0);

    this.childSurfaceXY_.x = parseInt(fixedX, 10);
    this.childSurfaceXY_.y = parseInt(fixedY, 10);

    this.dragGroup_.setAttribute(
        'transform',
        'translate(' + fixedX + ',' + fixedY + ') scale(' + scale + ')');
  }

  /**
   * Translate the drag surface's SVG based on its internal state.
   * @private
   */
  translateSurfaceInternal_() {
    let x = this.surfaceXY_.x;
    let y = this.surfaceXY_.y;
    // This is a work-around to prevent a the blocks from rendering
    // fuzzy while they are being dragged on the drag surface.
    x = x.toFixed(0);
    y = y.toFixed(0);
    this.SVG_.style.display = 'block';

    dom.setCssTransform(this.SVG_, 'translate3d(' + x + 'px, ' + y + 'px, 0)');
  }

  /**
   * Translates the entire surface by a relative offset.
   * @param {number} deltaX Horizontal offset in pixel units.
   * @param {number} deltaY Vertical offset in pixel units.
   */
  translateBy(deltaX, deltaY) {
    const x = this.surfaceXY_.x + deltaX;
    const y = this.surfaceXY_.y + deltaY;
    this.surfaceXY_ = new Coordinate(x, y);
    this.translateSurfaceInternal_();
  }

  /**
   * Translate the entire drag surface during a drag.
   * We translate the drag surface instead of the blocks inside the surface
   * so that the browser avoids repainting the SVG.
   * Because of this, the drag coordinates must be adjusted by scale.
   * @param {number} x X translation for the entire surface.
   * @param {number} y Y translation for the entire surface.
   */
  translateSurface(x, y) {
    this.surfaceXY_ = new Coordinate(x * this.scale_, y * this.scale_);
    this.translateSurfaceInternal_();
  }

  /**
   * Reports the surface translation in scaled workspace coordinates.
   * Use this when finishing a drag to return blocks to the correct position.
   * @return {!Coordinate} Current translation of the surface.
   */
  getSurfaceTranslation() {
    const xy = svgMath.getRelativeXY(/** @type {!SVGElement} */ (this.SVG_));
    return new Coordinate(xy.x / this.scale_, xy.y / this.scale_);
  }

  /**
   * Provide a reference to the drag group (primarily for
   * BlockSvg.getRelativeToSurfaceXY).
   * @return {?SVGElement} Drag surface group element.
   */
  getGroup() {
    return this.dragGroup_;
  }

  /**
   * Returns the SVG drag surface.
   * @returns {?SVGElement} The SVG drag surface.
   */
  getSvgRoot() {
    return this.SVG_;
  }

  /**
   * Get the current blocks on the drag surface, if any (primarily
   * for BlockSvg.getRelativeToSurfaceXY).
   * @return {?Element} Drag surface block DOM element, or null if no blocks
   *     exist.
   */
  getCurrentBlock() {
    return /** @type {Element} */ (this.dragGroup_.firstChild);
  }

  /**
   * Gets the translation of the child block surface
   * This surface is in charge of keeping track of how much the workspace has
   * moved.
   * @return {!Coordinate} The amount the workspace has been moved.
   */
  getWsTranslation() {
    // Returning a copy so the coordinate can not be changed outside this class.
    return this.childSurfaceXY_.clone();
  }

  /**
   * Clear the group and hide the surface; move the blocks off onto the provided
   * element.
   * If the block is being deleted it doesn't need to go back to the original
   * surface, since it would be removed immediately during dispose.
   * @param {Element=} opt_newSurface Surface the dragging blocks should be
   *     moved to, or null if the blocks should be removed from this surface
   *     without being moved to a different surface.
   */
  clearAndHide(opt_newSurface) {
    const currentBlockElement = this.getCurrentBlock();
    if (currentBlockElement) {
      if (opt_newSurface) {
        // appendChild removes the node from this.dragGroup_
        opt_newSurface.appendChild(currentBlockElement);
      } else {
        this.dragGroup_.removeChild(currentBlockElement);
      }
    }
    this.SVG_.style.display = 'none';
    if (this.dragGroup_.childNodes.length) {
      throw Error('Drag group was not cleared.');
    }
    this.surfaceXY_ = null;
  }
};

exports.BlockDragSurfaceSvg = BlockDragSurfaceSvg;
