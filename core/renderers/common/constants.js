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

goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.svgPaths');
goog.require('Blockly.utils.userAgent');


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

  /**
   * The top row's minimum height.
   * @type {number}
   */
  this.TOP_ROW_MIN_HEIGHT = this.MEDIUM_PADDING;

  /**
   * The top row's minimum height if it precedes a statement.
   * @type {number}
   */
  this.TOP_ROW_PRECEDES_STATEMENT_MIN_HEIGHT = this.LARGE_PADDING;

  /**
   * The bottom row's minimum height.
   * @type {number}
   */
  this.BOTTOM_ROW_MIN_HEIGHT = this.MEDIUM_PADDING;

  /**
   * The bottom row's minimum height if it follows a statement input.
   * @type {number}
   */
  this.BOTTOM_ROW_AFTER_STATEMENT_MIN_HEIGHT = this.LARGE_PADDING;

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

  /**
   * Point size of text.  Should match blocklyText's font-size in CSS.
   * @type {number}
   */
  this.FIELD_TEXT_FONTSIZE = 11;

  /**
   * Height of text.
   * @type {number}
   */
  this.FIELD_TEXT_HEIGHT = 13;

  /**
   * Text font weight.  Should match blocklyText's font-weight in CSS.
   * @type {string}
   */
  this.FIELD_TEXT_FONTWEIGHT = 'normal';

  /**
   * Text font family.  Should match blocklyText's font-family in CSS.
   * @type {string}
   */
  this.FIELD_TEXT_FONTFAMILY = 'sans-serif';

  /**
   * A field's border rect corner radius.
   * @type {number}
   */
  this.FIELD_BORDER_RECT_RADIUS = 4;

  /**
   * A field's border rect default height.
   * @type {number}
   */
  this.FIELD_BORDER_RECT_HEIGHT = 16;

  /**
   * A field's border rect X padding.
   * @type {number}
   */
  this.FIELD_BORDER_RECT_X_PADDING = 5;

  /**
   * A field's border rect Y padding.
   * @type {number}
   */
  this.FIELD_BORDER_RECT_Y_PADDING = 3;

  /**
   * Field text baseline. This is only used if `FIELD_TEXT_BASELINE_CENTER` is
   * set to false.
   * @type {number}
   */
  this.FIELD_TEXT_BASELINE_Y = Blockly.utils.userAgent.GECKO ? 12 : 13.09;

  /**
   * A field's text element's dominant baseline.
   * @type {boolean}
   */
  this.FIELD_TEXT_BASELINE_CENTER =
      !Blockly.utils.userAgent.IE && !Blockly.utils.userAgent.EDGE;

  /**
   * A dropdown field's border rect height.
   * @type {number}
   */
  this.FIELD_DROPDOWN_BORDER_RECT_HEIGHT = this.FIELD_BORDER_RECT_HEIGHT;

  /**
   * Whether or not a dropdown field uses a text or SVG arrow.
   * @type {boolean}
   */
  this.FIELD_DROPDOWN_SVG_ARROW = false;

  /**
   * A colour field's default width.
   * @type {number}
   */
  this.FIELD_COLOUR_DEFAULT_WIDTH = 26;

  /**
   * A colour field's default height.
   * @type {number}
   */
  this.FIELD_COLOUR_DEFAULT_HEIGHT = this.FIELD_BORDER_RECT_HEIGHT;

  /**
   * A checkbox field's X offset.
   * @type {number}
   */
  this.FIELD_CHECKBOX_X_OFFSET = this.FIELD_BORDER_RECT_X_PADDING - 3;

  /**
   * A checkbox field's Y offset.
   * @type {number}
   */
  this.FIELD_CHECKBOX_Y_OFFSET = 14;

  /**
   * The ID of the emboss filter, or the empty string if no filter is set.
   * @type {string}
   * @package
   */
  this.embossFilterId = '';

  /**
   * The <filter> element to use for highlighting, or null if not set.
   * @type {SVGElement}
   * @private
   */
  this.embossFilter_ = null;

  /**
   * The ID of the disabled pattern, or the empty string if no pattern is set.
   * @type {string}
   * @package
   */
  this.disabledPatternId = '';

  /**
   * The <pattern> element to use for disabled blocks, or null if not set.
   * @type {SVGElement}
   * @private
   */
  this.disabledPattern_ = null;

  /**
   * Cursor colour.
   * @type {string}
   * @package
   */
  this.CURSOR_COLOUR = '#cc0a0a';

  /**
   * Immovable marker colour.
   * @type {string}
   * @package
   */
  this.MARKER_COLOUR = '#4286f4';

  /**
   * Width of the horizontal cursor.
   * @type {number}
   * @package
   */
  this.CURSOR_WS_WIDTH = 100;

  /**
   * Height of the horizontal cursor.
   * @type {number}
   * @package
   */
  this.WS_CURSOR_HEIGHT = 5;

  /**
   * Padding around a stack.
   * @type {number}
   * @package
   */
  this.CURSOR_STACK_PADDING = 10;

  /**
   * Padding around a block.
   * @type {number}
   * @package
   */
  this.CURSOR_BLOCK_PADDING = 2;

  /**
   * Stroke of the cursor.
   * @type {number}
   * @package
   */
  this.CURSOR_STROKE_WIDTH = 4;

  
  /*
   * Whether text input and colour fields fill up the entire source block.
   * @type {boolean}
   * @package
   */
  this.FULL_BLOCK_FIELDS = false;
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
 * Dispose of this constants provider.
 * Delete all DOM elements that this provider created.
 * @package
 */
Blockly.blockRendering.ConstantProvider.prototype.dispose = function() {
  if (this.embossFilter_) {
    Blockly.utils.dom.removeNode(this.embossFilter_);
  }
  if (this.disabledPattern_) {
    Blockly.utils.dom.removeNode(this.disabledPattern_);
  }
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

  /**
   * SVG path for drawing the rounded top-right corner.
   * @const
   */
  var topRight =
      Blockly.utils.svgPaths.arc('a', '0 0,1', radius,
          Blockly.utils.svgPaths.point(radius, radius));

  /**
   * SVG path for drawing the rounded bottom-left corner.
   * @const
   */
  var bottomLeft = Blockly.utils.svgPaths.arc('a', '0 0,1', radius,
      Blockly.utils.svgPaths.point(-radius, -radius));

  /**
   * SVG path for drawing the rounded bottom-right corner.
   * @const
   */
  var bottomRight = Blockly.utils.svgPaths.arc('a', '0 0,1', radius,
      Blockly.utils.svgPaths.point(-radius, radius));

  return {
    topLeft: topLeft,
    topRight: topRight,
    bottomRight: bottomRight,
    bottomLeft: bottomLeft,
    rightHeight: radius
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

/**
 * Create any DOM elements that this renderer needs (filters, patterns, etc).
 * @param {!SVGElement} svg The root of the workspace's SVG.
 * @package
 */
Blockly.blockRendering.ConstantProvider.prototype.createDom = function(svg) {
  /*
  <defs>
    ... filters go here ...
  </defs>
  */
  var defs = Blockly.utils.dom.createSvgElement('defs', {}, svg);
  // Each filter/pattern needs a unique ID for the case of multiple Blockly
  // instances on a page.  Browser behaviour becomes undefined otherwise.
  // https://neil.fraser.name/news/2015/11/01/
  var rnd = String(Math.random()).substring(2);
  /*
    <filter id="blocklyEmbossFilter837493">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
      <feSpecularLighting in="blur" surfaceScale="1" specularConstant="0.5"
                          specularExponent="10" lighting-color="white"
                          result="specOut">
        <fePointLight x="-5000" y="-10000" z="20000" />
      </feSpecularLighting>
      <feComposite in="specOut" in2="SourceAlpha" operator="in"
                   result="specOut" />
      <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic"
                   k1="0" k2="1" k3="1" k4="0" />
    </filter>
  */
  var embossFilter = Blockly.utils.dom.createSvgElement('filter',
      {'id': 'blocklyEmbossFilter' + rnd}, defs);
  Blockly.utils.dom.createSvgElement('feGaussianBlur',
      {'in': 'SourceAlpha', 'stdDeviation': 1, 'result': 'blur'}, embossFilter);
  var feSpecularLighting = Blockly.utils.dom.createSvgElement('feSpecularLighting',
      {
        'in': 'blur',
        'surfaceScale': 1,
        'specularConstant': 0.5,
        'specularExponent': 10,
        'lighting-color': 'white',
        'result': 'specOut'
      },
      embossFilter);
  Blockly.utils.dom.createSvgElement('fePointLight',
      {'x': -5000, 'y': -10000, 'z': 20000}, feSpecularLighting);
  Blockly.utils.dom.createSvgElement('feComposite',
      {
        'in': 'specOut',
        'in2': 'SourceAlpha',
        'operator': 'in',
        'result': 'specOut'
      }, embossFilter);
  Blockly.utils.dom.createSvgElement('feComposite',
      {
        'in': 'SourceGraphic',
        'in2': 'specOut',
        'operator': 'arithmetic',
        'k1': 0,
        'k2': 1,
        'k3': 1,
        'k4': 0
      }, embossFilter);
  this.embossFilterId = embossFilter.id;
  this.embossFilter_ = embossFilter;

  /*
    <pattern id="blocklyDisabledPattern837493" patternUnits="userSpaceOnUse"
             width="10" height="10">
      <rect width="10" height="10" fill="#aaa" />
      <path d="M 0 0 L 10 10 M 10 0 L 0 10" stroke="#cc0" />
    </pattern>
  */
  var disabledPattern = Blockly.utils.dom.createSvgElement('pattern',
      {
        'id': 'blocklyDisabledPattern' + rnd,
        'patternUnits': 'userSpaceOnUse',
        'width': 10,
        'height': 10
      }, defs);
  Blockly.utils.dom.createSvgElement('rect',
      {'width': 10, 'height': 10, 'fill': '#aaa'}, disabledPattern);
  Blockly.utils.dom.createSvgElement('path',
      {'d': 'M 0 0 L 10 10 M 10 0 L 0 10', 'stroke': '#cc0'}, disabledPattern);
  this.disabledPatternId = disabledPattern.id;
  this.disabledPattern_ = disabledPattern;
};
