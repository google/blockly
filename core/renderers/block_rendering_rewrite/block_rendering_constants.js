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
 * @fileoverview Methods for graphically rendering a block as SVG.
 * @author fenichel@google.com (Rachel Fenichel)
 */

'use strict';
goog.provide('Blockly.blockRendering.constants');

goog.require('Blockly.utils.svgPaths');


Blockly.blockRendering.constants.NO_PADDING = 0;
Blockly.blockRendering.constants.SMALL_PADDING = 3;
Blockly.blockRendering.constants.MEDIUM_PADDING = 5;
Blockly.blockRendering.constants.MEDIUM_LARGE_PADDING = 8;
Blockly.blockRendering.constants.LARGE_PADDING = 10;

// Offset from the top of the row for placing fields on inline input rows
// and statement input rows.
// Matches existing rendering (in 2019).
Blockly.blockRendering.constants.TALL_INPUT_FIELD_OFFSET_Y =
    Blockly.blockRendering.constants.MEDIUM_PADDING;


// The dark/shadow path in classic rendering is the same as the normal block
// path, but translated down one and right one.
Blockly.blockRendering.constants.DARK_PATH_OFFSET = 1;

Blockly.blockRendering.constants.TAB_HEIGHT = 15;

Blockly.blockRendering.constants.TAB_OFFSET_FROM_TOP = 5;

Blockly.blockRendering.constants.TAB_VERTICAL_OVERLAP = 2.5;

Blockly.blockRendering.constants.TAB_WIDTH = 8;

Blockly.blockRendering.constants.NOTCH_WIDTH = 15;
Blockly.blockRendering.constants.NOTCH_HEIGHT = 4;

// This is the minimum width of a block measuring from the end of a rounded
// corner
Blockly.blockRendering.constants.MIN_BLOCK_WIDTH = 12;

Blockly.blockRendering.constants.EMPTY_BLOCK_SPACER_HEIGHT = 16;

/**
 * Rounded corner radius.
 * @const
 */
Blockly.blockRendering.constants.CORNER_RADIUS = 8;

// Offset from the left side of a block or the inside of a statement input to
// the left side of the notch.
Blockly.blockRendering.constants.NOTCH_OFFSET_LEFT =
    Blockly.blockRendering.constants.NOTCH_WIDTH;

// This is the width from where a rounded corner ends to where a previous
// connection starts.
// The position of the notch should not change as the rounded corner decreases
// in radius.
Blockly.blockRendering.constants.NOTCH_OFFSET_ROUNDED_CORNER_PREV =
    Blockly.blockRendering.constants.NOTCH_OFFSET_LEFT -
    Blockly.blockRendering.constants.CORNER_RADIUS;

Blockly.blockRendering.constants.STATEMENT_BOTTOM_SPACER = 5;
Blockly.blockRendering.constants.STATEMENT_INPUT_PADDING_LEFT = 20;
Blockly.blockRendering.constants.BETWEEN_STATEMENT_PADDING_Y = 4;

// This is the max width of a bottom row that follows a statement input and
// has inputs inline.
Blockly.blockRendering.constants.MAX_BOTTOM_WIDTH = 66.5;

/**
 * Height of the top hat.
 * @const
 * @private
 */
Blockly.blockRendering.constants.START_HAT_HEIGHT = 15;

/**
 * Width of the top hat.
 * @const
 * @private
 */
Blockly.blockRendering.constants.START_HAT_WIDTH = 100;

Blockly.blockRendering.constants.SPACER_DEFAULT_HEIGHT = 15;

Blockly.blockRendering.constants.MIN_BLOCK_HEIGHT = 24;

Blockly.blockRendering.constants.EMPTY_INLINE_INPUT_WIDTH =
    Blockly.blockRendering.constants.TAB_WIDTH + 14.5;

Blockly.blockRendering.constants.EMPTY_INLINE_INPUT_HEIGHT =
    Blockly.blockRendering.constants.TAB_HEIGHT + 11;

Blockly.blockRendering.constants.EXTERNAL_VALUE_INPUT_WIDTH = 10;

/**
 * The height of an empty statement input.  Note that in the old rendering this
 * varies slightly depending on whether the block has external or inline inputs.
 * In the new rendering this is consistent.  It seems unlikely that the old
 * behaviour was intentional.
 * @const
 * @type {number}
 */
Blockly.blockRendering.constants.EMPTY_STATEMENT_INPUT_HEIGHT =
    Blockly.blockRendering.constants.MIN_BLOCK_HEIGHT;

Blockly.blockRendering.constants.EMPTY_STATEMENT_INPUT_WIDTH = 32;

Blockly.blockRendering.constants.POPULATED_STATEMENT_INPUT_WIDTH = 25;


Blockly.blockRendering.constants.START_POINT = Blockly.utils.svgPaths.moveBy(0, 0);

/**
 * SVG start point for drawing the top-left corner.
 * @const
 */
Blockly.blockRendering.constants.TOP_LEFT_CORNER_START =
    'm 0,' + Blockly.blockRendering.constants.CORNER_RADIUS;

/**
 * Height of SVG path for jagged teeth at the end of collapsed blocks.
 * @const
 */
Blockly.blockRendering.constants.JAGGED_TEETH_HEIGHT = 12;
/**
 * Width of SVG path for jagged teeth at the end of collapsed blocks.
 * @const
 */
Blockly.blockRendering.constants.JAGGED_TEETH_WIDTH = 6;

/**
 * SVG path for drawing jagged teeth at the end of collapsed blocks.
 * @const
 */
Blockly.blockRendering.constants.JAGGED_TEETH = (function() {
  var height = Blockly.blockRendering.constants.JAGGED_TEETH_HEIGHT;
  var width = Blockly.blockRendering.constants.JAGGED_TEETH_WIDTH;

  var mainPath =
      Blockly.utils.svgPaths.line(
          [
            Blockly.utils.svgPaths.point(6, 3),
            Blockly.utils.svgPaths.point(-12, 6),
            Blockly.utils.svgPaths.point(6, 3)
          ]);
  return {
    height: height,
    width: width,
    path: mainPath
  };
})();

/**
 * Information about the hat on a start block.
 */
Blockly.blockRendering.constants.START_HAT = (function() {
  // It's really minus 15, which is super unfortunate.
  var height = Blockly.blockRendering.constants.START_HAT_HEIGHT;
  var width = Blockly.blockRendering.constants.START_HAT_WIDTH;

  var mainPath =
      Blockly.utils.svgPaths.curve('c',
          [
            Blockly.utils.svgPaths.point(30, -height),
            Blockly.utils.svgPaths.point(70, -height),
            Blockly.utils.svgPaths.point(width, 0)
          ]);
  return {
    height: height,
    width: width,
    path: mainPath
  };
})();

Blockly.blockRendering.constants.PUZZLE_TAB = (function() {
  var width = Blockly.blockRendering.constants.TAB_WIDTH;
  var height = Blockly.blockRendering.constants.TAB_HEIGHT;

  // The main path for the puzzle tab is made out of a few curves (c and s).
  // Those curves are defined with relative positions.  The 'up' and 'down'
  // versions of the paths are the same, but the Y sign flips.  Forward and back
  // are the signs to use to move the cursor in the direction that the path is
  // being drawn.
  function makeMainPath(up) {
    var forward = up ? -1 : 1;
    var back = -forward;

    var overlap = 2.5;
    var halfHeight = height / 2;
    var control1Y = halfHeight + overlap;
    var control2Y = halfHeight + 0.5;
    var control3Y = overlap; // 2.5

    var endPoint1 = Blockly.utils.svgPaths.point(-width, forward * halfHeight);
    var endPoint2 = Blockly.utils.svgPaths.point(width, forward * halfHeight);

    return Blockly.utils.svgPaths.curve('c',
        [
          Blockly.utils.svgPaths.point(0, forward * control1Y),
          Blockly.utils.svgPaths.point(-width, back * control2Y),
          endPoint1
        ]) +
        Blockly.utils.svgPaths.curve('s',
            [
              Blockly.utils.svgPaths.point(width, back * control3Y),
              endPoint2
            ]);
  }

  // c 0,-10  -8,8  -8,-7.5  s 8,2.5  8,-7.5
  var pathUp = makeMainPath(true);
  // c 0,10  -8,-8  -8,7.5  s 8,-2.5  8,7.5
  var pathDown = makeMainPath(false);

  return {
    width: width,
    height: height,
    pathDown: pathDown,
    pathUp: pathUp
  };
})();

Blockly.blockRendering.constants.NOTCH = (function() {
  var width = Blockly.blockRendering.constants.NOTCH_WIDTH;
  var height = Blockly.blockRendering.constants.NOTCH_HEIGHT;
  var innerWidth = 3;
  var outerWidth = (width - innerWidth) / 2;
  function makeMainPath(dir) {
    return Blockly.utils.svgPaths.line(
        [
          Blockly.utils.svgPaths.point(dir * outerWidth, height),
          Blockly.utils.svgPaths.point(dir * innerWidth, 0),
          Blockly.utils.svgPaths.point(dir * outerWidth, -height)
        ]);
  }
  // TODO: Find a relationship between width and path
  var pathLeft = makeMainPath(1);
  var pathRight = makeMainPath(-1);

  return {
    width: width,
    height: height,
    pathLeft: pathLeft,
    pathRight: pathRight
  };
})();

Blockly.blockRendering.constants.INSIDE_CORNERS = (function() {
  var radius = Blockly.blockRendering.constants.CORNER_RADIUS;

  var innerTopLeftCorner = Blockly.utils.svgPaths.arc('a', '0 0,0', radius,
      Blockly.utils.svgPaths.point(-radius, radius));

  var innerBottomLeftCorner = Blockly.utils.svgPaths.arc('a', '0 0,0', radius,
      Blockly.utils.svgPaths.point(radius, radius));

  return {
    height: radius,
    pathTop: innerTopLeftCorner,
    pathBottom: innerBottomLeftCorner
  };
})();

Blockly.blockRendering.constants.OUTSIDE_CORNERS = (function() {
  var radius = Blockly.blockRendering.constants.CORNER_RADIUS;
  /**
   * SVG path for drawing the rounded top-left corner.
   * @const
   */
  var topLeft = Blockly.utils.svgPaths.arc('A', '0 0,1', radius,
      Blockly.utils.svgPaths.point(radius, 0));

  var bottomLeft = Blockly.utils.svgPaths.arc('a', '0 0,1', radius,
      Blockly.utils.svgPaths.point(-radius, -radius));

  return {
    topLeft: topLeft,
    bottomLeft: bottomLeft
  };
})();
