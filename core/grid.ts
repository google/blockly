/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Object for configuring and updating a workspace grid in
 * Blockly.
 *
 * @class
 */
// Former goog.module ID: Blockly.Grid

import * as dom from './utils/dom.js';
import {Svg} from './utils/svg.js';
import {GridOptions} from './options.js';

/**
 * Class for a workspace's grid.
 */
export class Grid {
  private readonly spacing: number;
  private readonly length: number;
  private readonly line1: SVGElement;
  private readonly line2: SVGElement;
  private readonly snapToGrid: boolean;

  /**
   * @param pattern The grid's SVG pattern, created during injection.
   * @param options A dictionary of normalized options for the grid.
   *     See grid documentation:
   *     https://developers.google.com/blockly/guides/configure/web/grid
   */
  constructor(
    private pattern: SVGElement,
    options: GridOptions,
  ) {
    /** The spacing of the grid lines (in px). */
    this.spacing = options['spacing'] ?? 0;

    /** How long the grid lines should be (in px). */
    this.length = options['length'] ?? 1;

    /** The horizontal grid line, if it exists. */
    this.line1 = pattern.firstChild as SVGElement;

    /** The vertical grid line, if it exists. */
    this.line2 = this.line1 && (this.line1.nextSibling as SVGElement);

    /** Whether blocks should snap to the grid. */
    this.snapToGrid = options['snap'] ?? false;
  }

  /**
   * Whether blocks should snap to the grid, based on the initial configuration.
   *
   * @returns True if blocks should snap, false otherwise.
   * @internal
   */
  shouldSnap(): boolean {
    return this.snapToGrid;
  }

  /**
   * Get the spacing of the grid points (in px).
   *
   * @returns The spacing of the grid points.
   * @internal
   */
  getSpacing(): number {
    return this.spacing;
  }

  /**
   * Get the ID of the pattern element, which should be randomized to avoid
   * conflicts with other Blockly instances on the page.
   *
   * @returns The pattern ID.
   * @internal
   */
  getPatternId(): string {
    return this.pattern.id;
  }

  /**
   * Update the grid with a new scale.
   *
   * @param scale The new workspace scale.
   * @internal
   */
  update(scale: number) {
    const safeSpacing = this.spacing * scale;

    this.pattern.setAttribute('width', `${safeSpacing}`);
    this.pattern.setAttribute('height', `${safeSpacing}`);

    let half = Math.floor(this.spacing / 2) + 0.5;
    let start = half - this.length / 2;
    let end = half + this.length / 2;

    half *= scale;
    start *= scale;
    end *= scale;

    this.setLineAttributes(this.line1, scale, start, end, half, half);
    this.setLineAttributes(this.line2, scale, half, half, start, end);
  }

  /**
   * Set the attributes on one of the lines in the grid.  Use this to update the
   * length and stroke width of the grid lines.
   *
   * @param line Which line to update.
   * @param width The new stroke size (in px).
   * @param x1 The new x start position of the line (in px).
   * @param x2 The new x end position of the line (in px).
   * @param y1 The new y start position of the line (in px).
   * @param y2 The new y end position of the line (in px).
   */
  private setLineAttributes(
    line: SVGElement,
    width: number,
    x1: number,
    x2: number,
    y1: number,
    y2: number,
  ) {
    if (line) {
      line.setAttribute('stroke-width', `${width}`);
      line.setAttribute('x1', `${x1}`);
      line.setAttribute('y1', `${y1}`);
      line.setAttribute('x2', `${x2}`);
      line.setAttribute('y2', `${y2}`);
    }
  }

  /**
   * Move the grid to a new x and y position, and make sure that change is
   * visible.
   *
   * @param x The new x position of the grid (in px).
   * @param y The new y position of the grid (in px).
   * @internal
   */
  moveTo(x: number, y: number) {
    this.pattern.setAttribute('x', `${x}`);
    this.pattern.setAttribute('y', `${y}`);
  }

  /**
   * Create the DOM for the grid described by options.
   *
   * @param rnd A random ID to append to the pattern's ID.
   * @param gridOptions The object containing grid configuration.
   * @param defs The root SVG element for this workspace's defs.
   * @returns The SVG element for the grid pattern.
   * @internal
   */
  static createDom(
    rnd: string,
    gridOptions: GridOptions,
    defs: SVGElement,
  ): SVGElement {
    /*
          <pattern id="blocklyGridPattern837493" patternUnits="userSpaceOnUse">
            <rect stroke="#888" />
            <rect stroke="#888" />
          </pattern>
        */
    const gridPattern = dom.createSvgElement(
      Svg.PATTERN,
      {'id': 'blocklyGridPattern' + rnd, 'patternUnits': 'userSpaceOnUse'},
      defs,
    );
    // x1, y1, x1, x2 properties will be set later in update.
    if ((gridOptions['length'] ?? 1) > 0 && (gridOptions['spacing'] ?? 0) > 0) {
      dom.createSvgElement(
        Svg.LINE,
        {'stroke': gridOptions['colour']},
        gridPattern,
      );
      if (gridOptions['length'] ?? 1 > 1) {
        dom.createSvgElement(
          Svg.LINE,
          {'stroke': gridOptions['colour']},
          gridPattern,
        );
      }
    } else {
      // Edge 16 doesn't handle empty patterns
      dom.createSvgElement(Svg.LINE, {}, gridPattern);
    }
    return gridPattern;
  }
}
