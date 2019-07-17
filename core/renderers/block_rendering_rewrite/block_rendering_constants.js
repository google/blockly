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

'use strict'
/**
 * @name Blockly.renderingConstants
 * @namespace
 */
goog.provide('Blockly.renderingConstants');

goog.require('Blockly.utils.Paths');


Blockly.renderingConstants.NO_PADDING = 0;
Blockly.renderingConstants.SMALL_PADDING = 3;
Blockly.renderingConstants.MEDIUM_PADDING = 5;
Blockly.renderingConstants.MEDIUM_LARGE_PADDING = 8;
Blockly.renderingConstants.LARGE_PADDING = 10;

// Offset from the top of the row for placing fields on inline input rows
// and statement input rows.
// Matches existing rendering (in 2019).
Blockly.renderingConstants.TALL_INPUT_FIELD_OFFSET_Y = Blockly.renderingConstants.MEDIUM_PADDING;

Blockly.renderingConstants.HIGHLIGHT_OFFSET = 0.5;

// The dark/shadow path in classic rendering is the same as the normal block
// path, but translated down one and right one.
Blockly.renderingConstants.DARK_PATH_OFFSET = 1;

Blockly.renderingConstants.TAB_HEIGHT = 15;

Blockly.renderingConstants.TAB_OFFSET_FROM_TOP = 5;

Blockly.renderingConstants.TAB_VERTICAL_OVERLAP = 2.5;

Blockly.renderingConstants.TAB_WIDTH = 8;

Blockly.renderingConstants.NOTCH_WIDTH = 15;
Blockly.renderingConstants.NOTCH_HEIGHT = 4;

// This is the minimum width of a block measuring from the end of a rounded
// corner
Blockly.renderingConstants.MIN_BLOCK_WIDTH = 12;

Blockly.renderingConstants.EMPTY_BLOCK_SPACER_HEIGHT = 16;


// Offset from the left side of a block or the inside of a statement input to
// the left side of the notch.
Blockly.renderingConstants.NOTCH_OFFSET_LEFT = Blockly.renderingConstants.NOTCH_WIDTH;

// This is the width from where a rounded corner ends to where a previous
// connection starts.
Blockly.renderingConstants.NOTCH_OFFSET_ROUNDED_CORNER_PREV = 7;

// This is the offset from the vertical part of a statement input
// to where to start the notch, which is on the right side in LTR.
Blockly.renderingConstants.NOTCH_OFFSET_RIGHT = Blockly.renderingConstants.NOTCH_OFFSET_LEFT + Blockly.renderingConstants.NOTCH_WIDTH;

Blockly.renderingConstants.STATEMENT_BOTTOM_SPACER = 5;
Blockly.renderingConstants.STATEMENT_INPUT_PADDING_LEFT = 20;
Blockly.renderingConstants.BETWEEN_STATEMENT_PADDING_Y = 4;

// This is the max width of a bottom row that follows a statement input and
// has inputs inline.
Blockly.renderingConstants.MAX_BOTTOM_WIDTH = 66.5;

/**
 * Rounded corner radius.
 * @const
 */
Blockly.renderingConstants.CORNER_RADIUS = 8;
/**
 * Height of the top hat.
 * @const
 */
Blockly.renderingConstants.START_HAT_HEIGHT = 15;

Blockly.renderingConstants.START_HAT_WIDTH = 100;

Blockly.renderingConstants.SPACER_DEFAULT_HEIGHT = 15;

Blockly.renderingConstants.MIN_BLOCK_HEIGHT = 24;

Blockly.renderingConstants.EMPTY_INLINE_INPUT_WIDTH = 22.5;

Blockly.renderingConstants.EMPTY_INLINE_INPUT_HEIGHT = 26;

Blockly.renderingConstants.EXTERNAL_VALUE_INPUT_WIDTH = 10;

/**
 * The height of an empty statement input.  Note that in the old rendering this
 * varies slightly depending on whether the block has external or inline inputs.
 * In the new rendering this is consistent.  It seems unlikely that the old
 * behaviour was intentional.
 * @const
 * @type {number}
 */
Blockly.renderingConstants.EMPTY_STATEMENT_INPUT_HEIGHT = Blockly.renderingConstants.MIN_BLOCK_HEIGHT;

Blockly.renderingConstants.EMPTY_STATEMENT_INPUT_WIDTH = 32;

Blockly.renderingConstants.POPULATED_STATEMENT_INPUT_WIDTH = 25;


Blockly.renderingConstants.START_POINT = Blockly.utils.Paths.moveBy(0, 0);

Blockly.renderingConstants.START_POINT_HIGHLIGHT =
    Blockly.utils.Paths.moveBy(Blockly.renderingConstants.HIGHLIGHT_OFFSET, Blockly.renderingConstants.HIGHLIGHT_OFFSET);

/**
 * Distance from shape edge to intersect with a curved corner at 45 degrees.
 * Applies to highlighting on around the inside of a curve.
 * @const
 */
Blockly.renderingConstants.DISTANCE_45_INSIDE = (1 - Math.SQRT1_2) *
    (Blockly.renderingConstants.CORNER_RADIUS - Blockly.renderingConstants.HIGHLIGHT_OFFSET) + Blockly.renderingConstants.HIGHLIGHT_OFFSET;

/**
 * Distance from shape edge to intersect with a curved corner at 45 degrees.
 * Applies to highlighting on around the outside of a curve.
 * @const
 */
Blockly.renderingConstants.DISTANCE_45_OUTSIDE = (1 - Math.SQRT1_2) *
    (Blockly.renderingConstants.CORNER_RADIUS + Blockly.renderingConstants.HIGHLIGHT_OFFSET) - Blockly.renderingConstants.HIGHLIGHT_OFFSET;

/**
 * SVG path for drawing a horizontal puzzle tab from top to bottom.
 * @const
 */
Blockly.renderingConstants.TAB_PATH_DOWN =  'c 0,10 -' + Blockly.renderingConstants.TAB_WIDTH +
      ',-8 -' + Blockly.renderingConstants.TAB_WIDTH + ',7.5 s ' +
      Blockly.renderingConstants.TAB_WIDTH + ',-2.5 ' + Blockly.renderingConstants.TAB_WIDTH + ',7.5';


/**
 * SVG path for drawing a horizontal puzzle tab from top to bottom with
 * highlighting from the upper-right.
 * @const
 */
Blockly.renderingConstants.TAB_PATH_DOWN_HIGHLIGHT_RTL = 'm -' +
    (Blockly.renderingConstants.TAB_WIDTH * 0.97) + ',2.5 q -' +
    (Blockly.renderingConstants.TAB_WIDTH * 0.05) + ',10 ' +
    (Blockly.renderingConstants.TAB_WIDTH * 0.3) + ',9.5 m ' +
    (Blockly.renderingConstants.TAB_WIDTH * 0.67) + ',-1.9';

/**
 * SVG path for drawing a horizontal puzzle tab from bottom to top.
 * @const
 */
Blockly.renderingConstants.TAB_PATH_UP =  'c 0,-10 -' + Blockly.renderingConstants.TAB_WIDTH +
      ',8 -' + Blockly.renderingConstants.TAB_WIDTH + ',-7.5 s ' +
      Blockly.renderingConstants.TAB_WIDTH + ',2.5 ' + Blockly.renderingConstants.TAB_WIDTH + ',-7.5';

/**
 * Path of the top hat's curve.
 * @const
 */
Blockly.renderingConstants.START_HAT_PATH =
    Blockly.utils.Paths.curve('c',
        [
          Blockly.utils.Paths.point(30, -Blockly.renderingConstants.START_HAT_HEIGHT),
          Blockly.utils.Paths.point(70, -Blockly.renderingConstants.START_HAT_HEIGHT),
          Blockly.utils.Paths.point(Blockly.renderingConstants.START_HAT_WIDTH, 0)
        ]);
/**
 * SVG path for drawing next/previous notch from left to right.
 * @const
 */
Blockly.renderingConstants.NOTCH_PATH_LEFT = 'l 6,4 3,0 6,-4';

/**
 * SVG path for drawing next/previous notch from left to right with
 * highlighting.
 * @const
 */
Blockly.renderingConstants.NOTCH_PATH_LEFT_HIGHLIGHT =
    'h ' + Blockly.renderingConstants.HIGHLIGHT_OFFSET + ' ' + Blockly.renderingConstants.NOTCH_PATH_LEFT;

/**
 * SVG path for drawing next/previous notch from right to left.
 * @const
 */
Blockly.renderingConstants.NOTCH_PATH_RIGHT = 'l -6,4 -3,0 -6,-4';

/**
 * SVG path for drawing the top-left corner of a statement input.
 * Includes the top notch, a horizontal space, and the rounded inside corner.
 * @const
 */
Blockly.renderingConstants.INNER_TOP_LEFT_CORNER =
    Blockly.renderingConstants.NOTCH_PATH_RIGHT + ' h -' +
    (Blockly.renderingConstants.NOTCH_WIDTH - Blockly.renderingConstants.CORNER_RADIUS) +
    ' a ' + Blockly.renderingConstants.CORNER_RADIUS + ',' +
    Blockly.renderingConstants.CORNER_RADIUS + ' 0 0,0 -' +
    Blockly.renderingConstants.CORNER_RADIUS + ',' +
    Blockly.renderingConstants.CORNER_RADIUS;

/**
 * SVG path for drawing the bottom-left corner of a statement input.
 * Includes the rounded inside corner.
 * @const
 */
Blockly.renderingConstants.INNER_BOTTOM_LEFT_CORNER =
    Blockly.utils.Paths.arc('a', '0 0,0',
        Blockly.renderingConstants.CORNER_RADIUS,
        Blockly.utils.Paths.point(Blockly.renderingConstants.CORNER_RADIUS, Blockly.renderingConstants.CORNER_RADIUS));


/**
 * SVG path for drawing highlight on the top-left corner of a statement
 * input in RTL.
 * @const
 */
Blockly.renderingConstants.INNER_TOP_LEFT_CORNER_HIGHLIGHT_RTL =
    Blockly.utils.Paths.arc('a', '0 0,0',
        Blockly.renderingConstants.CORNER_RADIUS,
        Blockly.utils.Paths.point(
            -Blockly.renderingConstants.DISTANCE_45_OUTSIDE - Blockly.renderingConstants.HIGHLIGHT_OFFSET,
            Blockly.renderingConstants.CORNER_RADIUS - Blockly.renderingConstants.DISTANCE_45_OUTSIDE));

/**
 * SVG path for drawing highlight on the bottom-left corner of a statement
 * input in RTL.
 * @const
 */
Blockly.renderingConstants.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_RTL =
    Blockly.utils.Paths.arc('a', '0 0,0',
        Blockly.renderingConstants.CORNER_RADIUS + Blockly.renderingConstants.HIGHLIGHT_OFFSET,
        Blockly.utils.Paths.point(
            Blockly.renderingConstants.CORNER_RADIUS + Blockly.renderingConstants.HIGHLIGHT_OFFSET,
            Blockly.renderingConstants.CORNER_RADIUS + Blockly.renderingConstants.HIGHLIGHT_OFFSET));

/**
 * SVG path for drawing highlight on the bottom-left corner of a statement
 * input in LTR.
 * @const
 */
Blockly.renderingConstants.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_LTR =
    Blockly.utils.Paths.arc('a', '0 0,0',
        Blockly.renderingConstants.CORNER_RADIUS + Blockly.renderingConstants.HIGHLIGHT_OFFSET,
        Blockly.utils.Paths.point(
            Blockly.renderingConstants.CORNER_RADIUS - Blockly.renderingConstants.DISTANCE_45_OUTSIDE,
            Blockly.renderingConstants.DISTANCE_45_OUTSIDE + Blockly.renderingConstants.HIGHLIGHT_OFFSET));



/**
 * SVG start point for drawing the top-left corner.
 * @const
 */
Blockly.renderingConstants.TOP_LEFT_CORNER_START =
    'm 0,' + Blockly.renderingConstants.CORNER_RADIUS;

/**
 * SVG path for drawing the rounded top-left corner.
 * @const
 */
Blockly.renderingConstants.TOP_LEFT_CORNER =
    'A ' + Blockly.renderingConstants.CORNER_RADIUS + ',' +
    Blockly.renderingConstants.CORNER_RADIUS + ' 0 0,1 ' +
    Blockly.renderingConstants.CORNER_RADIUS + ',0';

Blockly.renderingConstants.BOTTOM_LEFT_CORNER = 'a' + Blockly.renderingConstants.CORNER_RADIUS + ',' +
               Blockly.renderingConstants.CORNER_RADIUS + ' 0 0,1 -' +
               Blockly.renderingConstants.CORNER_RADIUS + ',-' +
               Blockly.renderingConstants.CORNER_RADIUS;

Blockly.renderingConstants.BOTTOM_LEFT_CORNER_HIGHLIGHT_START =
    'M ' + Blockly.renderingConstants.DISTANCE_45_INSIDE + ', '; // follow with y pos - distance 45 inside

Blockly.renderingConstants.BOTTOM_LEFT_CORNER_HIGHLIGHT_MID   =
    'A ' + (Blockly.renderingConstants.CORNER_RADIUS - Blockly.renderingConstants.HIGHLIGHT_OFFSET) +
    ',' + (Blockly.renderingConstants.CORNER_RADIUS - Blockly.renderingConstants.HIGHLIGHT_OFFSET) +
    ' 0 0,1 ' + Blockly.renderingConstants.HIGHLIGHT_OFFSET + ','; // follow with y pos - corner radius

Blockly.renderingConstants.OUTPUT_CONNECTION_HIGHLIGHT_LTR =
    'V ' + (Blockly.renderingConstants.TAB_HEIGHT + Blockly.renderingConstants.TAB_OFFSET_FROM_TOP - 1.5) +
    ' m ' + (Blockly.renderingConstants.TAB_WIDTH * -0.92) + ',-0.5 ' +
    'q ' + (Blockly.renderingConstants.TAB_WIDTH * -0.19) + ',-5.5 0,-11 ' +
    'm ' + (Blockly.renderingConstants.TAB_WIDTH * 0.92) + ',1 ' +
    'V 0.5 H 1';

Blockly.renderingConstants.OUTPUT_CONNECTION_HIGHLIGHT_RTL =
    'M ' + (Blockly.renderingConstants.TAB_WIDTH * -0.25) + ',8.4 l ' +
    (Blockly.renderingConstants.TAB_WIDTH * -0.45) + ',-2.1';

/**
 * SVG start point for drawing the top-left corner's highlight in RTL.
 * @const
 */
Blockly.renderingConstants.TOP_LEFT_CORNER_START_HIGHLIGHT_RTL =
    'm ' + Blockly.renderingConstants.DISTANCE_45_INSIDE + ',' +
    Blockly.renderingConstants.DISTANCE_45_INSIDE;

/**
 * SVG start point for drawing the top-left corner's highlight in LTR.
 * @const
 */
Blockly.renderingConstants.TOP_LEFT_CORNER_START_HIGHLIGHT_LTR =
    'm 0.5,' + (Blockly.renderingConstants.CORNER_RADIUS - 0.5);

/**
 * SVG path for drawing the highlight on the rounded top-left corner.
 * @const
 */
Blockly.renderingConstants.TOP_LEFT_CORNER_HIGHLIGHT =
    'A ' + (Blockly.renderingConstants.CORNER_RADIUS - 0.5) + ',' +
    (Blockly.renderingConstants.CORNER_RADIUS - 0.5) + ' 0 0,1 ' +
    Blockly.renderingConstants.CORNER_RADIUS + ',0.5';

/**
 * Path of the top hat's curve's highlight in LTR.
 * @const
 */
Blockly.renderingConstants.START_HAT_HIGHLIGHT_LTR =
    Blockly.utils.Paths.curve('c',
        [
          Blockly.utils.Paths.point(17.8, -9.2),
          Blockly.utils.Paths.point(45.3, -14.9),
          Blockly.utils.Paths.point(75, -8.7)
        ]) +
    Blockly.utils.Paths.moveTo(100.5, 0.5);

/**
 * Path of the top hat's curve's highlight in RTL.
 * @const
 */
Blockly.renderingConstants.START_HAT_HIGHLIGHT_RTL =
    Blockly.utils.Paths.moveBy(25, -8.7) +
    Blockly.utils.Paths.curve('c',
        [
          Blockly.utils.Paths.point(29.7, -6.2),
          Blockly.utils.Paths.point(57.2, -0.5),
          Blockly.utils.Paths.point(75, 8.7)
        ]);

