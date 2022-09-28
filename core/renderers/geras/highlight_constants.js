/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects for rendering highlights on blocks.
 */
'use strict';

/**
 * Objects for rendering highlights on blocks.
 * @class
 */
goog.module('Blockly.geras.HighlightConstantProvider');

const svgPaths = goog.require('Blockly.utils.svgPaths');
/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');


/**
 * An object that provides constants for rendering highlights on blocks.
 * Some highlights are simple offsets of the parent paths and can be generated
 * programmatically.  Others, especially on curves, are just made out of piles
 * of constants and are hard to tweak.
 * @alias Blockly.geras.HighlightConstantProvider
 */
class HighlightConstantProvider {
  /**
   * @param {!ConstantProvider} constants The rendering
   *   constants provider.
   * @package
   */
  constructor(constants) {
    /**
     * The renderer's constant provider.
     * @type {!ConstantProvider}
     */
    this.constantProvider = constants;

    /**
     * The offset between the block's main path and highlight path.
     * @type {number}
     * @package
     */
    this.OFFSET = 0.5;

    /**
     * The start point, which is offset in both X and Y, as an SVG path chunk.
     * @type {string}
     */
    this.START_POINT = svgPaths.moveBy(this.OFFSET, this.OFFSET);
  }

  /**
   * Initialize shape objects based on the constants set in the constructor.
   * @package
   */
  init() {
    /**
     * An object containing sizing and path information about inside corner
     * highlights.
     * @type {!Object}
     */
    this.INSIDE_CORNER = this.makeInsideCorner();

    /**
     * An object containing sizing and path information about outside corner
     * highlights.
     * @type {!Object}
     */
    this.OUTSIDE_CORNER = this.makeOutsideCorner();

    /**
     * An object containing sizing and path information about puzzle tab
     * highlights.
     * @type {!Object}
     */
    this.PUZZLE_TAB = this.makePuzzleTab();

    /**
     * An object containing sizing and path information about notch highlights.
     * @type {!Object}
     */
    this.NOTCH = this.makeNotch();

    /**
     * An object containing sizing and path information about highlights for
     * collapsed block indicators.
     * @type {!Object}
     */
    this.JAGGED_TEETH = this.makeJaggedTeeth();

    /**
     * An object containing sizing and path information about start hat
     * highlights.
     * @type {!Object}
     */
    this.START_HAT = this.makeStartHat();
  }

  /**
   * @return {!Object} An object containing sizing and path information about
   *     inside corner highlights.
   * @package
   */
  makeInsideCorner() {
    const radius = this.constantProvider.CORNER_RADIUS;
    const offset = this.OFFSET;

    /**
     * Distance from shape edge to intersect with a curved corner at 45 degrees.
     * Applies to highlighting on around the outside of a curve.
     * @const
     */
    const distance45outside = (1 - Math.SQRT1_2) * (radius + offset) - offset;

    const pathTopRtl = svgPaths.moveBy(distance45outside, distance45outside) +
        svgPaths.arc(
            'a', '0 0,0', radius,
            svgPaths.point(
                -distance45outside - offset, radius - distance45outside));

    const pathBottomRtl = svgPaths.arc(
        'a', '0 0,0', radius + offset,
        svgPaths.point(radius + offset, radius + offset));

    const pathBottomLtr =
        svgPaths.moveBy(distance45outside, -distance45outside) +
        svgPaths.arc(
            'a', '0 0,0', radius + offset,
            svgPaths.point(
                radius - distance45outside, distance45outside + offset));

    return {
      width: radius + offset,
      height: radius,
      pathTop: function(rtl) {
        return rtl ? pathTopRtl : '';
      },
      pathBottom: function(rtl) {
        return rtl ? pathBottomRtl : pathBottomLtr;
      },
    };
  }

  /**
   * @return {!Object} An object containing sizing and path information about
   *     outside corner highlights.
   * @package
   */
  makeOutsideCorner() {
    const radius = this.constantProvider.CORNER_RADIUS;
    const offset = this.OFFSET;

    /**
     * Distance from shape edge to intersect with a curved corner at 45 degrees.
     * Applies to highlighting on around the inside of a curve.
     * @const
     */
    const distance45inside = (1 - Math.SQRT1_2) * (radius - offset) + offset;

    const topLeftStartX = distance45inside;
    const topLeftStartY = distance45inside;
    const topLeftCornerHighlightRtl =
        svgPaths.moveBy(topLeftStartX, topLeftStartY) +
        svgPaths.arc(
            'a', '0 0,1', radius - offset,
            svgPaths.point(radius - topLeftStartX, -topLeftStartY + offset));
    /**
     * SVG path for drawing the highlight on the rounded top-left corner.
     * @const
     */
    const topLeftCornerHighlightLtr = svgPaths.moveBy(offset, radius) +
        svgPaths.arc(
            'a', '0 0,1', radius - offset,
            svgPaths.point(radius, -radius + offset));

    const bottomLeftStartX = distance45inside;
    const bottomLeftStartY = -distance45inside;
    const bottomLeftPath = svgPaths.moveBy(bottomLeftStartX, bottomLeftStartY) +
        svgPaths.arc(
            'a', '0 0,1', radius - offset,
            svgPaths.point(
                -bottomLeftStartX + offset, -bottomLeftStartY - radius));

    return {
      height: radius,
      topLeft: function(rtl) {
        return rtl ? topLeftCornerHighlightRtl : topLeftCornerHighlightLtr;
      },
      bottomLeft: function() {
        return bottomLeftPath;
      },
    };
  }

  /**
   * @return {!Object} An object containing sizing and path information about
   *     puzzle tab highlights.
   * @package
   */
  makePuzzleTab() {
    const width = this.constantProvider.TAB_WIDTH;
    const height = this.constantProvider.TAB_HEIGHT;

    // This is how much of the vertical block edge is actually drawn by the
    // puzzle tab.
    const verticalOverlap = 2.5;

    const highlightRtlUp =
        svgPaths.moveBy(-2, -height + verticalOverlap + 0.9) +
        svgPaths.lineTo(width * -0.45, -2.1);

    const highlightRtlDown = svgPaths.lineOnAxis('v', verticalOverlap) +
        svgPaths.moveBy(-width * 0.97, 2.5) +
        svgPaths.curve(
            'q',
            [
              svgPaths.point(-width * 0.05, 10),
              svgPaths.point(width * 0.3, 9.5),
            ]) +
        svgPaths.moveBy(width * 0.67, -1.9) +
        svgPaths.lineOnAxis('v', verticalOverlap);

    const highlightLtrUp = svgPaths.lineOnAxis('v', -1.5) +
        svgPaths.moveBy(width * -0.92, -0.5) +
        svgPaths.curve(
            'q',
            [svgPaths.point(width * -0.19, -5.5), svgPaths.point(0, -11)]) +
        svgPaths.moveBy(width * 0.92, 1);

    const highlightLtrDown =
        svgPaths.moveBy(-5, height - 0.7) + svgPaths.lineTo(width * 0.46, -2.1);

    return {
      width: width,
      height: height,
      pathUp: function(rtl) {
        return rtl ? highlightRtlUp : highlightLtrUp;
      },
      pathDown: function(rtl) {
        return rtl ? highlightRtlDown : highlightLtrDown;
      },
    };
  }

  /**
   * @return {!Object} An object containing sizing and path information about
   *     notch highlights.
   * @package
   */
  makeNotch() {
    // This is only for the previous connection.
    const pathLeft = svgPaths.lineOnAxis('h', this.OFFSET) +
        this.constantProvider.NOTCH.pathLeft;
    return {pathLeft: pathLeft};
  }

  /**
   * @return {!Object} An object containing sizing and path information about
   *     collapsed block edge highlights.
   * @package
   */
  makeJaggedTeeth() {
    const pathLeft = svgPaths.lineTo(5.1, 2.6) + svgPaths.moveBy(-10.2, 6.8) +
        svgPaths.lineTo(5.1, 2.6);
    return {pathLeft: pathLeft, height: 12, width: 10.2};
  }

  /**
   * @return {!Object} An object containing sizing and path information about
   *     start highlights.
   * @package
   */
  makeStartHat() {
    const hatHeight = this.constantProvider.START_HAT.height;
    const pathRtl = svgPaths.moveBy(25, -8.7) + svgPaths.curve('c', [
      svgPaths.point(29.7, -6.2),
      svgPaths.point(57.2, -0.5),
      svgPaths.point(75, 8.7),
    ]);

    const pathLtr = svgPaths.curve('c', [
      svgPaths.point(17.8, -9.2),
      svgPaths.point(45.3, -14.9),
      svgPaths.point(75, -8.7),
    ]) + svgPaths.moveTo(100.5, hatHeight + 0.5);
    return {
      path: function(rtl) {
        return rtl ? pathRtl : pathLtr;
      },
    };
  }
}

exports.HighlightConstantProvider = HighlightConstantProvider;
