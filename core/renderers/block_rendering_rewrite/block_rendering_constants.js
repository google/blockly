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

Blockly.blockRendering.constants.HIGHLIGHT_OFFSET = 0.5;

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


// Offset from the left side of a block or the inside of a statement input to
// the left side of the notch.
Blockly.blockRendering.constants.NOTCH_OFFSET_LEFT =
    Blockly.blockRendering.constants.NOTCH_WIDTH;

// This is the width from where a rounded corner ends to where a previous
// connection starts.
Blockly.blockRendering.constants.NOTCH_OFFSET_ROUNDED_CORNER_PREV = 7;

// This is the offset from the vertical part of a statement input
// to where to start the notch, which is on the right side in LTR.
Blockly.blockRendering.constants.NOTCH_OFFSET_RIGHT =
    Blockly.blockRendering.constants.NOTCH_OFFSET_LEFT +
    Blockly.blockRendering.constants.NOTCH_WIDTH;

Blockly.blockRendering.constants.STATEMENT_BOTTOM_SPACER = 5;
Blockly.blockRendering.constants.STATEMENT_INPUT_PADDING_LEFT = 20;
Blockly.blockRendering.constants.BETWEEN_STATEMENT_PADDING_Y = 4;

// This is the max width of a bottom row that follows a statement input and
// has inputs inline.
Blockly.blockRendering.constants.MAX_BOTTOM_WIDTH = 66.5;

/**
 * Rounded corner radius.
 * @const
 */
Blockly.blockRendering.constants.CORNER_RADIUS = 8;

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

Blockly.blockRendering.constants.EMPTY_INLINE_INPUT_WIDTH = 22.5;

Blockly.blockRendering.constants.EMPTY_INLINE_INPUT_HEIGHT = 26;

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

Blockly.blockRendering.constants.START_POINT_HIGHLIGHT =
    Blockly.utils.svgPaths.moveBy(
        Blockly.blockRendering.constants.HIGHLIGHT_OFFSET,
        Blockly.blockRendering.constants.HIGHLIGHT_OFFSET);

/**
 * Distance from shape edge to intersect with a curved corner at 45 degrees.
 * Applies to highlighting on around the inside of a curve.
 * @const
 */
Blockly.blockRendering.constants.DISTANCE_45_INSIDE = (1 - Math.SQRT1_2) *
    (Blockly.blockRendering.constants.CORNER_RADIUS -
        Blockly.blockRendering.constants.HIGHLIGHT_OFFSET) +
    Blockly.blockRendering.constants.HIGHLIGHT_OFFSET;

/**
 * Distance from shape edge to intersect with a curved corner at 45 degrees.
 * Applies to highlighting on around the outside of a curve.
 * @const
 */
Blockly.blockRendering.constants.DISTANCE_45_OUTSIDE = (1 - Math.SQRT1_2) *
    (Blockly.blockRendering.constants.CORNER_RADIUS +
        Blockly.blockRendering.constants.HIGHLIGHT_OFFSET) -
    Blockly.blockRendering.constants.HIGHLIGHT_OFFSET;

/**
 * SVG path for drawing next/previous notch from left to right.
 * @const
 */
Blockly.blockRendering.constants.NOTCH_PATH_LEFT = 'l 6,4 3,0 6,-4';

/**
 * SVG path for drawing next/previous notch from left to right with
 * highlighting.
 * @const
 */
Blockly.blockRendering.constants.NOTCH_PATH_LEFT_HIGHLIGHT =
    'h ' + Blockly.blockRendering.constants.HIGHLIGHT_OFFSET + ' ' + Blockly.blockRendering.constants.NOTCH_PATH_LEFT;

/**
 * SVG path for drawing next/previous notch from right to left.
 * @const
 */
Blockly.blockRendering.constants.NOTCH_PATH_RIGHT = 'l -6,4 -3,0 -6,-4';

/**
 * SVG path for drawing the top-left corner of a statement input.
 * Includes the top notch, a horizontal space, and the rounded inside corner.
 * @const
 */
Blockly.blockRendering.constants.INNER_TOP_LEFT_CORNER =
    Blockly.blockRendering.constants.NOTCH_PATH_RIGHT + ' h -' +
    (Blockly.blockRendering.constants.NOTCH_WIDTH -
        Blockly.blockRendering.constants.CORNER_RADIUS) +
    ' a ' + Blockly.blockRendering.constants.CORNER_RADIUS + ',' +
    Blockly.blockRendering.constants.CORNER_RADIUS + ' 0 0,0 -' +
    Blockly.blockRendering.constants.CORNER_RADIUS + ',' +
    Blockly.blockRendering.constants.CORNER_RADIUS;

/**
 * SVG path for drawing the bottom-left corner of a statement input.
 * Includes the rounded inside corner.
 * @const
 */
Blockly.blockRendering.constants.INNER_BOTTOM_LEFT_CORNER =
    Blockly.utils.svgPaths.arc('a', '0 0,0',
        Blockly.blockRendering.constants.CORNER_RADIUS,
        Blockly.utils.svgPaths.point(Blockly.blockRendering.constants.CORNER_RADIUS,
            Blockly.blockRendering.constants.CORNER_RADIUS));


/**
 * SVG path for drawing highlight on the top-left corner of a statement
 * input in RTL.
 * @const
 */
Blockly.blockRendering.constants.INNER_TOP_LEFT_CORNER_HIGHLIGHT_RTL =
    Blockly.utils.svgPaths.arc('a', '0 0,0',
        Blockly.blockRendering.constants.CORNER_RADIUS,
        Blockly.utils.svgPaths.point(
            -Blockly.blockRendering.constants.DISTANCE_45_OUTSIDE -
            Blockly.blockRendering.constants.HIGHLIGHT_OFFSET,
            Blockly.blockRendering.constants.CORNER_RADIUS -
            Blockly.blockRendering.constants.DISTANCE_45_OUTSIDE));

/**
 * SVG path for drawing highlight on the bottom-left corner of a statement
 * input in RTL.
 * @const
 */
Blockly.blockRendering.constants.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_RTL =
    Blockly.utils.svgPaths.arc('a', '0 0,0',
        Blockly.blockRendering.constants.CORNER_RADIUS +
        Blockly.blockRendering.constants.HIGHLIGHT_OFFSET,
        Blockly.utils.svgPaths.point(
            Blockly.blockRendering.constants.CORNER_RADIUS +
            Blockly.blockRendering.constants.HIGHLIGHT_OFFSET,
            Blockly.blockRendering.constants.CORNER_RADIUS +
            Blockly.blockRendering.constants.HIGHLIGHT_OFFSET));

/**
 * SVG path for drawing highlight on the bottom-left corner of a statement
 * input in LTR.
 * @const
 */
Blockly.blockRendering.constants.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_LTR =
    Blockly.utils.svgPaths.arc('a', '0 0,0',
        Blockly.blockRendering.constants.CORNER_RADIUS +
        Blockly.blockRendering.constants.HIGHLIGHT_OFFSET,
        Blockly.utils.svgPaths.point(
            Blockly.blockRendering.constants.CORNER_RADIUS -
            Blockly.blockRendering.constants.DISTANCE_45_OUTSIDE,
            Blockly.blockRendering.constants.DISTANCE_45_OUTSIDE +
            Blockly.blockRendering.constants.HIGHLIGHT_OFFSET));

/**
 * SVG start point for drawing the top-left corner.
 * @const
 */
Blockly.blockRendering.constants.TOP_LEFT_CORNER_START =
    'm 0,' + Blockly.blockRendering.constants.CORNER_RADIUS;

/**
 * SVG path for drawing the rounded top-left corner.
 * @const
 */
Blockly.blockRendering.constants.TOP_LEFT_CORNER =
    'A ' + Blockly.blockRendering.constants.CORNER_RADIUS + ',' +
    Blockly.blockRendering.constants.CORNER_RADIUS + ' 0 0,1 ' +
    Blockly.blockRendering.constants.CORNER_RADIUS + ',0';

Blockly.blockRendering.constants.BOTTOM_LEFT_CORNER = 'a' + Blockly.blockRendering.constants.CORNER_RADIUS + ',' +
               Blockly.blockRendering.constants.CORNER_RADIUS + ' 0 0,1 -' +
               Blockly.blockRendering.constants.CORNER_RADIUS + ',-' +
               Blockly.blockRendering.constants.CORNER_RADIUS;

Blockly.blockRendering.constants.BOTTOM_LEFT_CORNER_HIGHLIGHT_START =
    'M ' + Blockly.blockRendering.constants.DISTANCE_45_INSIDE + ', '; // follow with y pos - distance 45 inside

Blockly.blockRendering.constants.BOTTOM_LEFT_CORNER_HIGHLIGHT_MID   =
    'A ' + (Blockly.blockRendering.constants.CORNER_RADIUS - Blockly.blockRendering.constants.HIGHLIGHT_OFFSET) +
    ',' + (Blockly.blockRendering.constants.CORNER_RADIUS - Blockly.blockRendering.constants.HIGHLIGHT_OFFSET) +
    ' 0 0,1 ' + Blockly.blockRendering.constants.HIGHLIGHT_OFFSET + ','; // follow with y pos - corner radius

/**
 * SVG start point for drawing the top-left corner's highlight in RTL.
 * @const
 */
Blockly.blockRendering.constants.TOP_LEFT_CORNER_START_HIGHLIGHT_RTL =
    'm ' + Blockly.blockRendering.constants.DISTANCE_45_INSIDE + ',' +
    Blockly.blockRendering.constants.DISTANCE_45_INSIDE;

/**
 * SVG start point for drawing the top-left corner's highlight in LTR.
 * @const
 */
Blockly.blockRendering.constants.TOP_LEFT_CORNER_START_HIGHLIGHT_LTR =
    'm 0.5,' + (Blockly.blockRendering.constants.CORNER_RADIUS - 0.5);

/**
 * SVG path for drawing the highlight on the rounded top-left corner.
 * @const
 */
Blockly.blockRendering.constants.TOP_LEFT_CORNER_HIGHLIGHT =
    'A ' + (Blockly.blockRendering.constants.CORNER_RADIUS - 0.5) + ',' +
    (Blockly.blockRendering.constants.CORNER_RADIUS - 0.5) + ' 0 0,1 ' +
    Blockly.blockRendering.constants.CORNER_RADIUS + ',0.5';

/**
 * Information about the hat on a start block.
 */
Blockly.blockRendering.constants.START_HAT = (function() {
  // It's really minus 15, which is super unfortunate.
  var height = Blockly.blockRendering.constants.START_HAT_HEIGHT;
  var width = Blockly.blockRendering.constants.START_HAT_WIDTH;
  var highlightRtlPath =
      Blockly.utils.svgPaths.moveBy(25, -8.7) +
      Blockly.utils.svgPaths.curve('c',
          [
            Blockly.utils.svgPaths.point(29.7, -6.2),
            Blockly.utils.svgPaths.point(57.2, -0.5),
            Blockly.utils.svgPaths.point(75, 8.7)
          ]);

  var highlightLtrPath =
      Blockly.utils.svgPaths.curve('c',
          [
            Blockly.utils.svgPaths.point(17.8, -9.2),
            Blockly.utils.svgPaths.point(45.3, -14.9),
            Blockly.utils.svgPaths.point(75, -8.7)
          ]) +
      Blockly.utils.svgPaths.moveTo(100.5, 0.5);

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
    path: mainPath,
    highlight: function(rtl) {
      return rtl ? highlightRtlPath : highlightLtrPath;
    }
  };
})();

Blockly.blockRendering.constants.PUZZLE_TAB = (function() {
  var tabWidth = Blockly.blockRendering.constants.TAB_WIDTH;
  var tabHeight = Blockly.blockRendering.constants.TAB_HEIGHT;

  // This is how much of the vertical block edge is actually drawn by the puzzle
  // tab.
  var verticalOverlap = 2.5;

  // The main path for the puzzle tab is made out of a few curves (c and s).
  // Those curves are defined with relative positions.  The 'up' and 'down'
  // versions of the paths are the same, but the Y sign flips.  Forward and back
  // are the signs to use to move the cursor in the direction that the path is
  // being drawn.
  function makeMainPath(up) {
    var forward = up ? -1 : 1;
    var back = -forward;

    var overlap = verticalOverlap;
    var halfHeight = tabHeight / 2;
    var control1Y = halfHeight + overlap; // 10
    var control2Y = halfHeight + 0.5; // 8
    var control3Y = overlap; //2.5

    //var startPoint = Blockly.utils.svgPaths.point(0, 0);
    // Center point of the line that is the tab.
    var endPoint1 = Blockly.utils.svgPaths.point(-tabWidth, forward * halfHeight);
    var endPoint2 = Blockly.utils.svgPaths.point(tabWidth, forward * halfHeight);

    return Blockly.utils.svgPaths.curve('c',
        [
          Blockly.utils.svgPaths.point(0, forward * control1Y),
          Blockly.utils.svgPaths.point(-tabWidth, back * control2Y),
          endPoint1
        ]) +
        Blockly.utils.svgPaths.curve('s',
            [
              Blockly.utils.svgPaths.point(tabWidth, back * control3Y),
              endPoint2
            ]);
  }

  var pathUp = makeMainPath(true);
  var pathDown = makeMainPath(false);
  // TODO: Figure out what other tab-related constants can come into here.
  // Some candidates: tab height, offset from top, vertical overlap.

  return {
    // TODO: height
    width: tabWidth,
    height: tabHeight,
    pathDown: pathDown,
    pathUp: pathUp
  };
})();

Blockly.blockRendering.constants.PUZZLE_TAB_HIGHLIGHT = (function() {
  var tabWidth = Blockly.blockRendering.constants.TAB_WIDTH;
  var tabHeight = Blockly.blockRendering.constants.TAB_HEIGHT;

  // This is how much of the vertical block edge is actually drawn by the puzzle
  // tab.
  var verticalOverlap = 2.5;

  // The highlight paths are not simple offsets of the main paths.  Changing
  // them is fiddly work.
  var highlightRtlUp =
      Blockly.utils.svgPaths.moveTo(tabWidth * -0.25, 8.4) +
      Blockly.utils.svgPaths.lineTo(tabWidth * -0.45, -2.1);

  var highlightRtlDown =
      Blockly.utils.svgPaths.lineOnAxis('v', verticalOverlap) +
      Blockly.utils.svgPaths.moveBy(-tabWidth * 0.97, 2.5) +
      Blockly.utils.svgPaths.curve('q',
          [
            Blockly.utils.svgPaths.point(-tabWidth * 0.05, 10),
            Blockly.utils.svgPaths.point(tabWidth * 0.3, 9.5)
          ]) +
      Blockly.utils.svgPaths.moveBy(tabWidth * 0.67, -1.9) +
      Blockly.utils.svgPaths.lineOnAxis('v', verticalOverlap);

  var highlightLtrUp =
      Blockly.utils.svgPaths.lineOnAxis('V',
          tabHeight + Blockly.blockRendering.constants.TAB_OFFSET_FROM_TOP - 1.5) +
      Blockly.utils.svgPaths.moveBy(tabWidth * -0.92, -0.5) +
      Blockly.utils.svgPaths.curve('q',
          [
            Blockly.utils.svgPaths.point(tabWidth * -0.19, -5.5),
            Blockly.utils.svgPaths.point(0,-11)
          ]) +
      Blockly.utils.svgPaths.moveBy(tabWidth * 0.92, 1) +
      Blockly.utils.svgPaths.lineOnAxis('V', 0.5) +
      Blockly.utils.svgPaths.lineOnAxis('H', 1);

  var highlightLtrDown =
      Blockly.utils.svgPaths.moveBy(-5, tabHeight - 0.7) +
      Blockly.utils.svgPaths.lineTo(tabWidth * 0.46, -2.1);
  // TODO: Figure out what other tab-related constants can come into here.
  // Some candidates: tab height, offset from top, vertical overlap.

  return {
    // TODO: height
    // width: tabWidth,
    // height: tabHeight,
    // TODO: does this actually have a height, or should all references go to
    // the puzzle_tab object instead?
    pathUp: function(rtl) {
      return rtl ? highlightRtlUp : highlightLtrUp;
    },
    pathDown: function(rtl) {
      return rtl ? highlightRtlDown : highlightLtrDown;
    }
  };
})();
