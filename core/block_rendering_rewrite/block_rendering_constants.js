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

//'use strict';

var BRC = {};

BRC.NO_PADDING = 0;
BRC.SMALL_PADDING = 3;
BRC.MEDIUM_PADDING = 5;
BRC.LARGE_PADDING = 10;

// Offset from the top of the row for placing fields on statement input rows.
// Matches existing rendering (in 2019).
BRC.STATEMENT_FIELD_OFFSET_Y = BRC.MEDIUM_PADDING - 1;

// Offset from the top of the row for placing fields on inline input rows.
// Matches existing rendering (in 2019).
BRC.INLINE_INPUT_FIELD_OFFSET_Y = BRC.MEDIUM_PADDING;

BRC.HIGHLIGHT_OFFSET = 0.5;

BRC.TAB_HEIGHT = 15;

BRC.TAB_OFFSET_FROM_TOP = 5;

BRC.TAB_WIDTH = 8;

BRC.NOTCH_WIDTH = 15;
BRC.NOTCH_HEIGHT = 4;

// This is the minimum width of a block measuring from the end of a rounded
// corner
BRC.MIN_BLOCK_WIDTH = 12;

BRC.EMPTY_BLOCK_SPACER_HEIGHT = 16;


// Offset from the left side of a block or the inside of a statement input to
// the left side of the notch.
BRC.NOTCH_OFFSET_LEFT = BRC.NOTCH_WIDTH;

// This is the width from where a rounded corner ends and a next or previous
// connection starts.
BRC.NOTCH_OFFSET_ROUNDED_CORNER = 8 - 0.5;

// This is the offset from the vertical part of a statement input
// to where to start the notch, which is on the right side in LTR.
BRC.NOTCH_OFFSET_RIGHT = BRC.NOTCH_OFFSET_LEFT + BRC.NOTCH_WIDTH;

BRC.STATEMENT_BOTTOM_SPACER = 5;

// This is the max width of a bottom row that follows a statement input and
// has inputs inline.
BRC.MAX_BOTTOM_WIDTH = 66.5;

/**
 * Rounded corner radius.
 * @const
 */
BRC.CORNER_RADIUS = 8;
/**
 * Height of the top hat.
 * @const
 */
BRC.START_HAT_HEIGHT = 15;

BRC.START_HAT_WIDTH = 100;

BRC.SPACER_DEFAULT_HEIGHT = 15;


BRC.EMPTY_INLINE_INPUT_WIDTH = 22.5;

BRC.EMPTY_INLINE_INPUT_HEIGHT = 26;


BRC.START_POINT = 'm 0,0';

BRC.START_POINT_HIGHLIGHT =
    'm ' + BRC.HIGHLIGHT_OFFSET + ',' + BRC.HIGHLIGHT_OFFSET;

/**
 * Distance from shape edge to intersect with a curved corner at 45 degrees.
 * Applies to highlighting on around the inside of a curve.
 * @const
 */
BRC.DISTANCE_45_INSIDE = (1 - Math.SQRT1_2) *
    (BRC.CORNER_RADIUS - BRC.HIGHLIGHT_OFFSET) + BRC.HIGHLIGHT_OFFSET;

/**
 * Distance from shape edge to intersect with a curved corner at 45 degrees.
 * Applies to highlighting on around the outside of a curve.
 * @const
 */
BRC.DISTANCE_45_OUTSIDE = (1 - Math.SQRT1_2) *
    (BRC.CORNER_RADIUS + BRC.HIGHLIGHT_OFFSET) - BRC.HIGHLIGHT_OFFSET;

/**
 * SVG path for drawing a horizontal puzzle tab from top to bottom.
 * @const
 */
BRC.TAB_PATH_DOWN =  'c 0,10 -' + BRC.TAB_WIDTH +
      ',-8 -' + BRC.TAB_WIDTH + ',7.5 s ' +
      BRC.TAB_WIDTH + ',-2.5 ' + BRC.TAB_WIDTH + ',7.5';


/**
 * SVG path for drawing a horizontal puzzle tab from top to bottom with
 * highlighting from the upper-right.
 * @const
 */
BRC.TAB_PATH_DOWN_HIGHLIGHT_RTL = 'm -' +
    (BRC.TAB_WIDTH * 0.97) + ',0 q -' +
    (BRC.TAB_WIDTH * 0.05) + ',10 ' +
    (BRC.TAB_WIDTH * 0.3) + ',9.5 m ' +
    (BRC.TAB_WIDTH * 0.67) + ',-1.9 v 1.4';

/**
 * SVG path for drawing a horizontal puzzle tab from bottom to top.
 * @const
 */
BRC.TAB_PATH_UP =  'c 0,-10 -' + BRC.TAB_WIDTH +
      ',8 -' + BRC.TAB_WIDTH + ',-7.5 s ' +
      BRC.TAB_WIDTH + ',2.5 ' + BRC.TAB_WIDTH + ',-7.5';
/**
 * Path of the top hat's curve.
 * @const
 */
BRC.START_HAT_PATH = 'c 30,-' +
    BRC.START_HAT_HEIGHT + ' 70,-' +
    BRC.START_HAT_HEIGHT + ' ' + BRC.START_HAT_WIDTH + ',0';

/**
 * SVG path for drawing next/previous notch from left to right.
 * @const
 */
BRC.NOTCH_PATH_LEFT = 'l 6,4 3,0 6,-4';

/**
 * SVG path for drawing next/previous notch from left to right with
 * highlighting.
 * @const
 */
BRC.NOTCH_PATH_LEFT_HIGHLIGHT = BRC.NOTCH_PATH_LEFT;

/**
 * SVG path for drawing next/previous notch from right to left.
 * @const
 */
BRC.NOTCH_PATH_RIGHT = 'l -6,4 -3,0 -6,-4';

/**
 * SVG path for drawing the top-left corner of a statement input.
 * Includes the top notch, a horizontal space, and the rounded inside corner.
 * @const
 */
BRC.INNER_TOP_LEFT_CORNER =
    BRC.NOTCH_PATH_RIGHT + ' h -' +
    (BRC.NOTCH_WIDTH - BRC.CORNER_RADIUS) +
    ' a ' + BRC.CORNER_RADIUS + ',' +
    BRC.CORNER_RADIUS + ' 0 0,0 -' +
    BRC.CORNER_RADIUS + ',' +
    BRC.CORNER_RADIUS;

/**
 * SVG path for drawing the bottom-left corner of a statement input.
 * Includes the rounded inside corner.
 * @const
 */
BRC.INNER_BOTTOM_LEFT_CORNER =
    'a ' + BRC.CORNER_RADIUS + ',' +
    BRC.CORNER_RADIUS + ' 0 0,0 ' +
    BRC.CORNER_RADIUS + ',' +
    BRC.CORNER_RADIUS;

/**
 * SVG path for drawing highlight on the top-left corner of a statement
 * input in RTL.
 * @const
 */
BRC.INNER_TOP_LEFT_CORNER_HIGHLIGHT_RTL =
    'a ' + BRC.CORNER_RADIUS + ',' +
    BRC.CORNER_RADIUS + ' 0 0,0 ' +
    (-BRC.DISTANCE_45_OUTSIDE - BRC.HIGHLIGHT_OFFSET) + ',' +
    (BRC.CORNER_RADIUS -
    BRC.DISTANCE_45_OUTSIDE);

/**
 * SVG path for drawing highlight on the bottom-left corner of a statement
 * input in RTL.
 * @const
 */
BRC.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_RTL =
    'a ' + (BRC.CORNER_RADIUS + BRC.HIGHLIGHT_OFFSET) + ',' +
    (BRC.CORNER_RADIUS + BRC.HIGHLIGHT_OFFSET) + ' 0 0,0 ' +
    (BRC.CORNER_RADIUS + BRC.HIGHLIGHT_OFFSET) + ',' +
    (BRC.CORNER_RADIUS + BRC.HIGHLIGHT_OFFSET);

/**
 * SVG path for drawing highlight on the bottom-left corner of a statement
 * input in LTR.
 * @const
 */
BRC.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_LTR =
    'a ' + (BRC.CORNER_RADIUS + BRC.HIGHLIGHT_OFFSET) + ',' +
    (BRC.CORNER_RADIUS + BRC.HIGHLIGHT_OFFSET) + ' 0 0,0 ' +
    (BRC.CORNER_RADIUS - BRC.DISTANCE_45_OUTSIDE) + ',' +
    (BRC.DISTANCE_45_OUTSIDE + BRC.HIGHLIGHT_OFFSET);



/**
 * SVG start point for drawing the top-left corner.
 * @const
 */
BRC.TOP_LEFT_CORNER_START =
    'm 0,' + BRC.CORNER_RADIUS;

/**
 * SVG path for drawing the rounded top-left corner.
 * @const
 */
BRC.TOP_LEFT_CORNER =
    'A ' + BRC.CORNER_RADIUS + ',' +
    BRC.CORNER_RADIUS + ' 0 0,1 ' +
    BRC.CORNER_RADIUS + ',0';

BRC.BOTTOM_LEFT_CORNER = 'a' + BRC.CORNER_RADIUS + ',' +
               BRC.CORNER_RADIUS + ' 0 0,1 -' +
               BRC.CORNER_RADIUS + ',-' +
               BRC.CORNER_RADIUS;

BRC.BOTTOM_LEFT_CORNER_HIGHLIGHT_START =
    'M ' + BRC.DISTANCE_45_INSIDE + ', '; // follow with y pos - distance 45 inside

BRC.BOTTOM_LEFT_CORNER_HIGHLIGHT_MID   =
    'A ' + (BRC.CORNER_RADIUS - BRC.HIGHLIGHT_OFFSET) +
    ',' + (BRC.CORNER_RADIUS - BRC.HIGHLIGHT_OFFSET) +
    ' 0 0,1 ' + BRC.HIGHLIGHT_OFFSET + ','; // follow with y pos - corner radius

BRC.OUTPUT_CONNECTION_HIGHLIGHT_LTR =
    'V ' + (BRC.TAB_HEIGHT + BRC.TAB_OFFSET_FROM_TOP - 1.5) +
    ' m ' + (BRC.TAB_WIDTH * -0.92) + ',-0.5 ' +
    'q ' + (BRC.TAB_WIDTH * -0.19) + ',-5.5 0,-11 ' +
    'm ' + (BRC.TAB_WIDTH * 0.92) + ',1 ' +
    'V 0.5 H 1';

BRC.OUTPUT_CONNECTION_HIGHLIGHT_RTL =
    'M ' + (BRC.TAB_WIDTH * -0.25) + ',8.4 l ' +
    (BRC.TAB_WIDTH * -0.45) + ',-2.1';
