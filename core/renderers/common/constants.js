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
 * @fileoverview An object that provides constants for rendering blocks.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.blockRendering.ConstantProvider');

goog.require('Blockly.utils.svgPaths');


/**
 * An object that provides constants for rendering blocks.
 * @constructor
 * @package
 */
Blockly.blockRendering.ConstantProvider = function() {
  this.NO_PADDING = 0;
  this.SMALL_PADDING = 3;
  this.MEDIUM_PADDING = 5;
  this.MEDIUM_LARGE_PADDING = 8;
  this.LARGE_PADDING = 10;

  // Offset from the top of the row for placing fields on inline input rows
  // and statement input rows.
  // Matches existing rendering (in 2019).
  this.TALL_INPUT_FIELD_OFFSET_Y = this.MEDIUM_PADDING;

  this.TAB_HEIGHT = 15;

  this.TAB_OFFSET_FROM_TOP = 5;

  this.TAB_VERTICAL_OVERLAP = 2.5;

  this.TAB_WIDTH = 8;

  this.NOTCH_WIDTH = 15;
  this.NOTCH_HEIGHT = 4;

  // This is the minimum width of a block measuring from the end of a rounded
  // corner
  this.MIN_BLOCK_WIDTH = 12;

  this.EMPTY_BLOCK_SPACER_HEIGHT = 16;

  /**
   * The minimum height of a dummy input row.
   * @type {number}
   */
  this.DUMMY_INPUT_MIN_HEIGHT = this.TAB_HEIGHT;

  /**
   * Rounded corner radius.
   * @type {number}
   */
  this.CORNER_RADIUS = 8;

  // Offset from the left side of a block or the inside of a statement input to
  // the left side of the notch.
  this.NOTCH_OFFSET_LEFT = 15;

  this.STATEMENT_BOTTOM_SPACER = 0;
  this.STATEMENT_INPUT_PADDING_LEFT = 20;
  this.BETWEEN_STATEMENT_PADDING_Y = 4;

  // This is the max width of a bottom row that follows a statement input and
  // has inputs inline.
  this.MAX_BOTTOM_WIDTH = 66.5;

  /**
   * Height of the top hat.
   * @const
   * @private
   */
  this.START_HAT_HEIGHT = 15;

  /**
   * Width of the top hat.
   * @const
   * @private
   */
  this.START_HAT_WIDTH = 100;

  this.SPACER_DEFAULT_HEIGHT = 15;

  this.MIN_BLOCK_HEIGHT = 24;

  this.EMPTY_INLINE_INPUT_PADDING = 14.5;

  this.EMPTY_INLINE_INPUT_HEIGHT = this.TAB_HEIGHT + 11;

  this.EXTERNAL_VALUE_INPUT_PADDING = 2;

  /**
   * The height of an empty statement input.  Note that in the old rendering this
   * varies slightly depending on whether the block has external or inline inputs.
   * In the new rendering this is consistent.  It seems unlikely that the old
   * behaviour was intentional.
   * @const
   * @type {number}
   */
  this.EMPTY_STATEMENT_INPUT_HEIGHT = this.MIN_BLOCK_HEIGHT;

  this.START_POINT = Blockly.utils.svgPaths.moveBy(0, 0);

  /**
   * Height of SVG path for jagged teeth at the end of collapsed blocks.
   * @const
   */
  this.JAGGED_TEETH_HEIGHT = 12;

  /**
   * Width of SVG path for jagged teeth at the end of collapsed blocks.
   * @const
   */
  this.JAGGED_TEETH_WIDTH = 6;
};

/**
 * Initialize shape objects based on the constants set in the constructor.
 * @package
 */
Blockly.blockRendering.ConstantProvider.prototype.init = function() {

  /**
   * An object containing sizing and path information about collapsed block
   * indicators.
   * @type {!Object}
   */
  this.JAGGED_TEETH = this.makeJaggedTeeth();

  /**
   * An object containing sizing and path information about notches.
   * @type {!Object}
   */
  this.NOTCH = this.makeNotch();

  /**
   * An object containing sizing and path information about start hats
   * @type {!Object}
   */
  this.START_HAT = this.makeStartHat();

  /**
   * An object containing sizing and path information about puzzle tabs.
   * @type {!Object}
   */
  this.PUZZLE_TAB = this.makePuzzleTab();

  /**
   * An object containing sizing and path information about inside corners
   * @type {!Object}
   */
  this.INSIDE_CORNERS = this.makeInsideCorners();

  /**
   * An object containing sizing and path information about outside corners.
   * @type {!Object}
   */
  this.OUTSIDE_CORNERS = this.makeOutsideCorners();
};

/**
 * @return {!Object} An object containing sizing and path information about
 *     collapsed block indicators.
 * @package
 */
Blockly.blockRendering.ConstantProvider.prototype.makeJaggedTeeth = function() {
  var height = this.JAGGED_TEETH_HEIGHT;
  var width = this.JAGGED_TEETH_WIDTH;

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
};

/**
 * @return {!Object} An object containing sizing and path information about
 *     start hats.
 * @package
 */
Blockly.blockRendering.ConstantProvider.prototype.makeStartHat = function() {
  var height = this.START_HAT_HEIGHT;
  var width = this.START_HAT_WIDTH;

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
};

/**
 * @return {!Object} An object containing sizing and path information about
 *     puzzle tabs.
 * @package
 */
Blockly.blockRendering.ConstantProvider.prototype.makePuzzleTab = function() {
  var width = this.TAB_WIDTH;
  var height = this.TAB_HEIGHT;

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
};

/**
 * @return {!Object} An object containing sizing and path information about
 *     notches.
 * @package
 */
Blockly.blockRendering.ConstantProvider.prototype.makeNotch = function() {
  var width = this.NOTCH_WIDTH;
  var height = this.NOTCH_HEIGHT;
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
};

/**
 * @return {!Object} An object containing sizing and path information about
 *     inside corners.
 * @package
 */
Blockly.blockRendering.ConstantProvider.prototype.makeInsideCorners = function() {
  var radius = this.CORNER_RADIUS;

  var innerTopLeftCorner = Blockly.utils.svgPaths.arc('a', '0 0,0', radius,
      Blockly.utils.svgPaths.point(-radius, radius));

  var innerBottomLeftCorner = Blockly.utils.svgPaths.arc('a', '0 0,0', radius,
      Blockly.utils.svgPaths.point(radius, radius));

  return {
    width: radius,
    height: radius,
    pathTop: innerTopLeftCorner,
    pathBottom: innerBottomLeftCorner
  };
};

/**
 * @return {!Object} An object containing sizing and path information about
 *     outside corners.
 * @package
 */
Blockly.blockRendering.ConstantProvider.prototype.makeOutsideCorners = function() {
  var radius = this.CORNER_RADIUS;
  /**
   * SVG path for drawing the rounded top-left corner.
   * @const
   */
  var topLeft =
      Blockly.utils.svgPaths.moveBy(0, radius) +
      Blockly.utils.svgPaths.arc('a', '0 0,1', radius,
          Blockly.utils.svgPaths.point(radius, -radius));

  var bottomLeft = Blockly.utils.svgPaths.arc('a', '0 0,1', radius,
      Blockly.utils.svgPaths.point(-radius, -radius));

  return {
    topLeft: topLeft,
    bottomLeft: bottomLeft
  };
};

/**
 * Get an object with connection shape and sizing information based on the type
 * of the connection.
 * @param {!Blockly.RenderedConnection} connection The connection to find a
 *     shape object for
 * @return {!Object} The shape object for the connection.
 * @package
 */
Blockly.blockRendering.ConstantProvider.prototype.shapeFor = function(
    connection) {
  switch (connection.type) {
    case Blockly.INPUT_VALUE:
    case Blockly.OUTPUT_VALUE:
      return this.PUZZLE_TAB;
    case Blockly.PREVIOUS_STATEMENT:
    case Blockly.NEXT_STATEMENT:
      return this.NOTCH;
    default:
      throw Error('Unknown connection type');
  }
};
