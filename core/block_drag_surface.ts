/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * A class that manages a surface for dragging blocks.  When a
 * block drag is started, we move the block (and children) to a separate DOM
 * element that we move around using translate3d. At the end of the drag, the
 * blocks are put back in into the SVG they came from. This helps
 * performance by avoiding repainting the entire SVG on every mouse move
 * while dragging blocks.
 *
 * @class
 */
import * as goog from '../closure/goog/goog.js';
goog.declareModuleId('Blockly.BlockDragSurfaceSvg');

import {Coordinate} from './utils/coordinate.js';
import * as deprecation from './utils/deprecation.js';
import * as dom from './utils/dom.js';
import {Svg} from './utils/svg.js';
import * as svgMath from './utils/svg_math.js';


/**
 * Class for a drag surface for the currently dragged block. This is a separate
 * SVG that contains only the currently moving block, or nothing.
 *
 * @alias Blockly.BlockDragSurfaceSvg
 */
export class BlockDragSurfaceSvg {
  /**
   * The root element of the drag surface.
   */
  private svg: SVGElement;

  /**
   * This is where blocks live while they are being dragged if the drag
   * surface is enabled.
   */
  private dragGroup: SVGElement;

  /**
   * Cached value for the scale of the drag surface.
   * Used to set/get the correct translation during and after a drag.
   */
  private scale = 1;

  /**
   * Cached value for the translation of the drag surface.
   * This translation is in pixel units, because the scale is applied to the
   * drag group rather than the top-level SVG.
   */
  private surfaceXY = new Coordinate(0, 0);

  /**
   * Cached value for the translation of the child drag surface in pixel
   * units. Since the child drag surface tracks the translation of the
   * workspace this is ultimately the translation of the workspace.
   */
  private readonly childSurfaceXY = new Coordinate(0, 0);

  /** @param container Containing element. */
  constructor(private readonly container: Element) {
    this.svg = dom.createSvgElement(
        Svg.SVG, {
          'xmlns': dom.SVG_NS,
          'xmlns:html': dom.HTML_NS,
          'xmlns:xlink': dom.XLINK_NS,
          'version': '1.1',
          'class': 'blocklyBlockDragSurface',
        },
        this.container);

    this.dragGroup = dom.createSvgElement(Svg.G, {}, this.svg);
  }

  /**
   * Create the drag surface and inject it into the container.
   *
   * @deprecated The DOM is automatically created by the constructor.
   */
  createDom() {
    // No alternative provided, because now the dom is just automatically
    // created in the constructor now.
    deprecation.warn('BlockDragSurfaceSvg createDom', 'June 2022', 'June 2023');
  }

  /**
   * Set the SVG blocks on the drag surface's group and show the surface.
   * Only one block group should be on the drag surface at a time.
   *
   * @param blocks Block or group of blocks to place on the drag surface.
   */
  setBlocksAndShow(blocks: SVGElement) {
    if (this.dragGroup.childNodes.length) {
      throw Error('Already dragging a block.');
    }
    // appendChild removes the blocks from the previous parent
    this.dragGroup.appendChild(blocks);
    this.svg.style.display = 'block';
    this.surfaceXY = new Coordinate(0, 0);
  }

  /**
   * Translate and scale the entire drag surface group to the given position, to
   * keep in sync with the workspace.
   *
   * @param x X translation in pixel coordinates.
   * @param y Y translation in pixel coordinates.
   * @param scale Scale of the group.
   */
  translateAndScaleGroup(x: number, y: number, scale: number) {
    this.scale = scale;
    // Make sure the svg exists on a pixel boundary so that it is not fuzzy.
    const roundX = Math.round(x);
    const roundY = Math.round(y);
    this.childSurfaceXY.x = roundX;
    this.childSurfaceXY.y = roundY;
    this.dragGroup.setAttribute(
        'transform',
        'translate(' + roundX + ',' + roundY + ') scale(' + scale + ')');
  }

  /**
   * Translate the drag surface's SVG based on its internal state.
   *
   * @internal
   */
  translateSurfaceInternal_() {
    // Make sure the svg exists on a pixel boundary so that it is not fuzzy.
    const x = Math.round(this.surfaceXY.x);
    const y = Math.round(this.surfaceXY.y);
    this.svg.style.display = 'block';
    dom.setCssTransform(this.svg, 'translate3d(' + x + 'px, ' + y + 'px, 0)');
  }

  /**
   * Translates the entire surface by a relative offset.
   *
   * @param deltaX Horizontal offset in pixel units.
   * @param deltaY Vertical offset in pixel units.
   */
  translateBy(deltaX: number, deltaY: number) {
    const x = this.surfaceXY.x + deltaX;
    const y = this.surfaceXY.y + deltaY;
    this.surfaceXY = new Coordinate(x, y);
    this.translateSurfaceInternal_();
  }

  /**
   * Translate the entire drag surface during a drag.
   * We translate the drag surface instead of the blocks inside the surface
   * so that the browser avoids repainting the SVG.
   * Because of this, the drag coordinates must be adjusted by scale.
   *
   * @param x X translation for the entire surface.
   * @param y Y translation for the entire surface.
   */
  translateSurface(x: number, y: number) {
    this.surfaceXY = new Coordinate(x * this.scale, y * this.scale);
    this.translateSurfaceInternal_();
  }

  /**
   * Reports the surface translation in scaled workspace coordinates.
   * Use this when finishing a drag to return blocks to the correct position.
   *
   * @returns Current translation of the surface.
   */
  getSurfaceTranslation(): Coordinate {
    const xy = svgMath.getRelativeXY(this.svg);
    return new Coordinate(xy.x / this.scale, xy.y / this.scale);
  }

  /**
   * Provide a reference to the drag group (primarily for
   * BlockSvg.getRelativeToSurfaceXY).
   *
   * @returns Drag surface group element.
   */
  getGroup(): SVGElement {
    return this.dragGroup;
  }

  /**
   * Returns the SVG drag surface.
   *
   * @returns The SVG drag surface.
   */
  getSvgRoot(): SVGElement {
    return this.svg;
  }

  /**
   * Get the current blocks on the drag surface, if any (primarily
   * for BlockSvg.getRelativeToSurfaceXY).
   *
   * @returns Drag surface block DOM element, or null if no blocks exist.
   */
  getCurrentBlock(): Element|null {
    return this.dragGroup.firstChild as Element;
  }

  /**
   * Gets the translation of the child block surface
   * This surface is in charge of keeping track of how much the workspace has
   * moved.
   *
   * @returns The amount the workspace has been moved.
   */
  getWsTranslation(): Coordinate {
    // Returning a copy so the coordinate can not be changed outside this class.
    return this.childSurfaceXY.clone();
  }

  /**
   * Clear the group and hide the surface; move the blocks off onto the provided
   * element.
   * If the block is being deleted it doesn't need to go back to the original
   * surface, since it would be removed immediately during dispose.
   *
   * @param opt_newSurface Surface the dragging blocks should be moved to, or
   *     null if the blocks should be removed from this surface without being
   *     moved to a different surface.
   */
  clearAndHide(opt_newSurface?: Element) {
    const currentBlockElement = this.getCurrentBlock();
    if (currentBlockElement) {
      if (opt_newSurface) {
        // appendChild removes the node from this.dragGroup
        opt_newSurface.appendChild(currentBlockElement);
      } else {
        this.dragGroup.removeChild(currentBlockElement);
      }
    }
    this.svg.style.display = 'none';
    if (this.dragGroup.childNodes.length) {
      throw Error('Drag group was not cleared.');
    }
    this.surfaceXY = new Coordinate(0, 0);
  }
}
