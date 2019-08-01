/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
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
 * @fileoverview Objects for rendering highlights on blocks.
 * @author fenichel@google.com (Rachel Fenichel)
 */

'use strict';
goog.provide('Blockly.blockRendering.highlightConstants');

goog.require('Blockly.blockRendering.constants');
goog.require('Blockly.utils.svgPaths');

/**
 * Some highlights are simple offsets of the parent paths and can be generated
 * programmatically.  Others, especially on curves, are just made out of piles
 * of constants and are hard to tweak.
 */

/**
 * The offset between the block's main path and highlight path.
 * @type {number}
 * @package
 */
Blockly.blockRendering.highlightConstants.OFFSET = 0.5;

Blockly.blockRendering.highlightConstants.START_POINT =
    Blockly.utils.svgPaths.moveBy(
        Blockly.blockRendering.highlightConstants.OFFSET,
        Blockly.blockRendering.highlightConstants.OFFSET);

/**
 * Highlight paths for drawing the inside corners of a statement input.
 * RTL and LTR refer to the rendering of the block as a whole.  However, the top
 * of the statement input is drawn from right to left in LTR mode.
 */
Blockly.blockRendering.highlightConstants.INSIDE_CORNER = (function() {
  var radius = Blockly.blockRendering.constants.CORNER_RADIUS;
  var offset = Blockly.blockRendering.highlightConstants.OFFSET;

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
    height: radius,
    pathTop: function(rtl) {
      return rtl ? pathTopRtl : '';
    },
    pathBottom: function(rtl) {
      return rtl ? pathBottomRtl : pathBottomLtr;
    },
  };
})();

Blockly.blockRendering.highlightConstants.OUTSIDE_CORNER = (function() {
  var radius = Blockly.blockRendering.constants.CORNER_RADIUS;
  var offset = Blockly.blockRendering.highlightConstants.OFFSET;

  /**
   * Distance from shape edge to intersect with a curved corner at 45 degrees.
   * Applies to highlighting on around the inside of a curve.
   * @const
   */
  var distance45inside = (1 - Math.SQRT1_2) * (radius - offset) + offset;

  /**
   * SVG start point for drawing the top-left corner's highlight in RTL.
   * @const
   */
  var topLeftCornerStartRtl =
      Blockly.utils.svgPaths.moveBy(distance45inside, distance45inside);

  /**
   * SVG start point for drawing the top-left corner's highlight in LTR.
   * @const
   */
  var topLeftCornerStartLtr =
      Blockly.utils.svgPaths.moveBy(offset, radius - offset);

  /**
   * SVG path for drawing the highlight on the rounded top-left corner.
   * @const
   */
  var topLeftCornerHighlight =
      Blockly.utils.svgPaths.arc('A', '0 0,1', radius - offset,
          Blockly.utils.svgPaths.point(radius, offset));

  return {
    height: radius,
    topLeft: function(rtl) {
      var start = rtl ? topLeftCornerStartRtl : topLeftCornerStartLtr;
      return start + topLeftCornerHighlight;
    },
    bottomLeft: function(yPos) {
      return Blockly.utils.svgPaths.moveTo(
          distance45inside + offset, yPos - distance45inside) +
          Blockly.utils.svgPaths.arc('A', '0 0,1', radius - offset,
              Blockly.utils.svgPaths.point(offset, yPos - radius));
    }
  };
})();


Blockly.blockRendering.highlightConstants.PUZZLE_TAB = (function() {
  var width = Blockly.blockRendering.constants.TAB_WIDTH;
  var height = Blockly.blockRendering.constants.TAB_HEIGHT;

  // This is how much of the vertical block edge is actually drawn by the puzzle
  // tab.
  var verticalOverlap = 2.5;

  var highlightRtlUp =
      Blockly.utils.svgPaths.moveTo(width * -0.25, 8.4) +
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
      // TODO: Move this 'V' out.
      Blockly.utils.svgPaths.lineOnAxis('V',
          height + Blockly.blockRendering.constants.TAB_OFFSET_FROM_TOP - 1.5) +
      Blockly.utils.svgPaths.moveBy(width * -0.92, -0.5) +
      Blockly.utils.svgPaths.curve('q',
          [
            Blockly.utils.svgPaths.point(width * -0.19, -5.5),
            Blockly.utils.svgPaths.point(0,-11)
          ]) +
      Blockly.utils.svgPaths.moveBy(width * 0.92, 1) +
      Blockly.utils.svgPaths.lineOnAxis('V', 0.5) +
      Blockly.utils.svgPaths.lineOnAxis('H', 1);

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
})();

Blockly.blockRendering.highlightConstants.NOTCH = (function() {
  // This is only for the previous connection.
  var pathLeft =
      Blockly.utils.svgPaths.lineOnAxis(
          'h', Blockly.blockRendering.highlightConstants.OFFSET) +
      Blockly.blockRendering.constants.NOTCH.pathLeft;
  return {
    pathLeft: pathLeft
  };
})();

Blockly.blockRendering.highlightConstants.JAGGED_TEETH = (function() {
  var pathLeft =
      Blockly.utils.svgPaths.lineTo(5.1, 2.6) +
      Blockly.utils.svgPaths.moveBy(-10.2, 6.8) +
      Blockly.utils.svgPaths.lineTo(5.1, 2.6);
  return {
    pathLeft: pathLeft
  };
})();

Blockly.blockRendering.highlightConstants.START_HAT = (function() {
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
      Blockly.utils.svgPaths.moveTo(100.5, 0.5);
  return {
    path: function(rtl) {
      return rtl ? pathRtl : pathLtr;
    }
  };
})();
