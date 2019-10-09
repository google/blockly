/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview Objects for rendering highlights on blocks.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.geras.HighlightConstantProvider');

goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.utils.svgPaths');


/**
 * An object that provides constants for rendering highlights on blocks.
 * Some highlights are simple offsets of the parent paths and can be generated
 * programmatically.  Others, especially on curves, are just made out of piles
 * of constants and are hard to tweak.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @constructor
 * @package
 */
Blockly.geras.HighlightConstantProvider = function(constants) {
  /**
   * The renderer's constant provider.
   * @type {!Blockly.blockRendering.ConstantProvider}
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
  this.START_POINT = Blockly.utils.svgPaths.moveBy(this.OFFSET, this.OFFSET);

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
};

/**
 * @return {!Object} An object containing sizing and path information about
 *     inside corner highlights.
 * @package
 */
Blockly.geras.HighlightConstantProvider.prototype.makeInsideCorner = function() {
  var radius = this.constantProvider.CORNER_RADIUS;
  var offset = this.OFFSET;

  /**
   * Distance from shape edge to intersect with a curved corner at 45 degrees.
   * Applies to highlighting on around the outside of a curve.
   * @const
   */
  var distance45outside = (1 - Math.SQRT1_2) * (radius + offset) - offset;

  var pathTopRtl =
      Blockly.utils.svgPaths.moveBy(distance45outside, distance45outside) +
      Blockly.utils.svgPaths.arc('a', '0 0,0', radius,
          Blockly.utils.svgPaths.point(
              -distance45outside - offset,
              radius - distance45outside));

  var pathBottomRtl =
      Blockly.utils.svgPaths.arc('a', '0 0,0', radius + offset,
          Blockly.utils.svgPaths.point(radius + offset, radius + offset));

  var pathBottomLtr =
      Blockly.utils.svgPaths.moveBy(distance45outside, - distance45outside) +
      Blockly.utils.svgPaths.arc('a', '0 0,0', radius + offset,
          Blockly.utils.svgPaths.point(
              radius - distance45outside,
              distance45outside + offset));

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
};

/**
 * @return {!Object} An object containing sizing and path information about
 *     outside corner highlights.
 * @package
 */
Blockly.geras.HighlightConstantProvider.prototype.makeOutsideCorner = function() {
  var radius = this.constantProvider.CORNER_RADIUS;
  var offset = this.OFFSET;

  /**
   * Distance from shape edge to intersect with a curved corner at 45 degrees.
   * Applies to highlighting on around the inside of a curve.
   * @const
   */
  var distance45inside = (1 - Math.SQRT1_2) * (radius - offset) + offset;

  var topLeftStartX = distance45inside;
  var topLeftStartY = distance45inside;
  var topLeftCornerHighlightRtl =
      Blockly.utils.svgPaths.moveBy(topLeftStartX, topLeftStartY) +
      Blockly.utils.svgPaths.arc('a', '0 0,1', radius - offset,
          Blockly.utils.svgPaths.point(radius - topLeftStartX, -topLeftStartY + offset));
  /**
   * SVG path for drawing the highlight on the rounded top-left corner.
   * @const
   */
  var topLeftCornerHighlightLtr =
      Blockly.utils.svgPaths.moveBy(offset, radius) +
      Blockly.utils.svgPaths.arc('a', '0 0,1', radius - offset,
          Blockly.utils.svgPaths.point(radius, -radius + offset));

  var bottomLeftStartX = distance45inside;
  var bottomLeftStartY = -distance45inside;
  var bottomLeftPath = Blockly.utils.svgPaths.moveBy(
      bottomLeftStartX, bottomLeftStartY) +
          Blockly.utils.svgPaths.arc('a', '0 0,1', radius - offset,
              Blockly.utils.svgPaths.point(-bottomLeftStartX + offset,
                  -bottomLeftStartY - radius));

  return {
    height: radius,
    topLeft: function(rtl) {
      return rtl ? topLeftCornerHighlightRtl : topLeftCornerHighlightLtr;
    },
    bottomLeft: function() {
      return bottomLeftPath;
    }
  };
};

/**
 * @return {!Object} An object containing sizing and path information about
 *     puzzle tab highlights.
 * @package
 */
Blockly.geras.HighlightConstantProvider.prototype.makePuzzleTab = function() {
  var width = this.constantProvider.TAB_WIDTH;
  var height = this.constantProvider.TAB_HEIGHT;

  // This is how much of the vertical block edge is actually drawn by the puzzle
  // tab.
  var verticalOverlap = 2.5;

  var highlightRtlUp =
      Blockly.utils.svgPaths.moveBy(-2, -height + verticalOverlap + 0.9) +
      Blockly.utils.svgPaths.lineTo(width * -0.45, -2.1);

  var highlightRtlDown =
      Blockly.utils.svgPaths.lineOnAxis('v', verticalOverlap) +
      Blockly.utils.svgPaths.moveBy(-width * 0.97, 2.5) +
      Blockly.utils.svgPaths.curve('q',
          [
            Blockly.utils.svgPaths.point(-width * 0.05, 10),
            Blockly.utils.svgPaths.point(width * 0.3, 9.5)
          ]) +
      Blockly.utils.svgPaths.moveBy(width * 0.67, -1.9) +
      Blockly.utils.svgPaths.lineOnAxis('v', verticalOverlap);

  var highlightLtrUp =
      Blockly.utils.svgPaths.lineOnAxis('v', -1.5) +
      Blockly.utils.svgPaths.moveBy(width * -0.92, -0.5) +
      Blockly.utils.svgPaths.curve('q',
          [
            Blockly.utils.svgPaths.point(width * -0.19, -5.5),
            Blockly.utils.svgPaths.point(0,-11)
          ]) +
      Blockly.utils.svgPaths.moveBy(width * 0.92, 1);

  var highlightLtrDown =
      Blockly.utils.svgPaths.moveBy(-5, height - 0.7) +
      Blockly.utils.svgPaths.lineTo(width * 0.46, -2.1);

  return {
    width: width,
    height: height,
    pathUp: function(rtl) {
      return rtl ? highlightRtlUp : highlightLtrUp;
    },
    pathDown: function(rtl) {
      return rtl ? highlightRtlDown : highlightLtrDown;
    }
  };
};

/**
 * @return {!Object} An object containing sizing and path information about
 *     notch highlights.
 * @package
 */
Blockly.geras.HighlightConstantProvider.prototype.makeNotch = function() {
  // This is only for the previous connection.
  var pathLeft =
      Blockly.utils.svgPaths.lineOnAxis(
          'h', this.OFFSET) +
      this.constantProvider.NOTCH.pathLeft;
  return {
    pathLeft: pathLeft
  };
};

/**
 * @return {!Object} An object containing sizing and path information about
 *     collapsed block edge highlights.
 * @package
 */
Blockly.geras.HighlightConstantProvider.prototype.makeJaggedTeeth = function() {
  var pathLeft =
      Blockly.utils.svgPaths.lineTo(5.1, 2.6) +
      Blockly.utils.svgPaths.moveBy(-10.2, 6.8) +
      Blockly.utils.svgPaths.lineTo(5.1, 2.6);
  return {
    pathLeft: pathLeft
  };
};

/**
 * @return {!Object} An object containing sizing and path information about
 *     start highlights.
 * @package
 */
Blockly.geras.HighlightConstantProvider.prototype.makeStartHat = function() {
  var hatHeight = this.constantProvider.START_HAT.height;
  var pathRtl =
      Blockly.utils.svgPaths.moveBy(25, -8.7) +
      Blockly.utils.svgPaths.curve('c',
          [
            Blockly.utils.svgPaths.point(29.7, -6.2),
            Blockly.utils.svgPaths.point(57.2, -0.5),
            Blockly.utils.svgPaths.point(75, 8.7)
          ]);

  var pathLtr =
      Blockly.utils.svgPaths.curve('c',
          [
            Blockly.utils.svgPaths.point(17.8, -9.2),
            Blockly.utils.svgPaths.point(45.3, -14.9),
            Blockly.utils.svgPaths.point(75, -8.7)
          ]) +
      Blockly.utils.svgPaths.moveTo(100.5, hatHeight + 0.5);
  return {
    path: function(rtl) {
      return rtl ? pathRtl : pathLtr;
    }
  };
};
