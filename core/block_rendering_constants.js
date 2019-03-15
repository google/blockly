//goog.provide('BRC');

var BRC = {};


BRC.TAB_HEIGHT = 15;

BRC.TAB_OFFSET_FROM_TOP = 5;

BRC.TAB_WIDTH = 8;

BRC.NOTCH_WIDTH = 15;

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

/**
 * SVG path for drawing a horizontal puzzle tab from top to bottom.
 * @const
 */
BRC.TAB_PATH_DOWN =  'c 0,10 -' + BRC.TAB_WIDTH +
      ',-8 -' + BRC.TAB_WIDTH + ',7.5 s ' +
      BRC.TAB_WIDTH + ',-2.5 ' + BRC.TAB_WIDTH + ',7.5';

/**
 * Path of the top hat's curve.
 * @const
 */
BRC.START_HAT_PATH = 'c 30,-' +
    BRC.START_HAT_HEIGHT + ' 70,-' +
    BRC.START_HAT_HEIGHT + ' 100,0';

/**
 * SVG path for drawing next/previous notch from left to right.
 * @const
 */
BRC.NOTCH_PATH_LEFT = 'l 6,4 3,0 6,-4';

/**
 * SVG path for drawing next/previous notch from right to left.
 * @const
 */
BRC.NOTCH_PATH_RIGHT = 'l -6,4 -3,0 -6,-4';


BRC.LINE = 'h ' + BRC.NOTCH_WIDTH;

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

// This is the offset from the vertical part of a statement input
// to where to start the notch.
BRC.NOTCH_OFFSET = BRC.NOTCH_WIDTH * 2;

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
