/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An object that provides constants for rendering blocks.
 */
'use strict';

/**
 * An object that provides constants for rendering blocks.
 * @class
 */
goog.module('Blockly.blockRendering.ConstantProvider');

const colour = goog.require('Blockly.utils.colour');
const dom = goog.require('Blockly.utils.dom');
const object = goog.require('Blockly.utils.object');
const svgPaths = goog.require('Blockly.utils.svgPaths');
const userAgent = goog.require('Blockly.utils.userAgent');
const parsing = goog.require('Blockly.utils.parsing');
const {ConnectionType} = goog.require('Blockly.ConnectionType');
/* eslint-disable-next-line no-unused-vars */
const {RenderedConnection} = goog.requireType('Blockly.RenderedConnection');
const {Svg} = goog.require('Blockly.utils.Svg');
/* eslint-disable-next-line no-unused-vars */
const {Theme} = goog.requireType('Blockly.Theme');


/**
 * An object that provides constants for rendering blocks.
 * @alias Blockly.blockRendering.ConstantProvider
 */
class ConstantProvider {
  /**
   * @package
   */
  constructor() {
    /**
     * The size of an empty spacer.
     * @type {number}
     */
    this.NO_PADDING = 0;

    /**
     * The size of small padding.
     * @type {number}
     */
    this.SMALL_PADDING = 3;

    /**
     * The size of medium padding.
     * @type {number}
     */
    this.MEDIUM_PADDING = 5;

    /**
     * The size of medium-large padding.
     * @type {number}
     */
    this.MEDIUM_LARGE_PADDING = 8;

    /**
     * The size of large padding.
     * @type {number}
     */
    this.LARGE_PADDING = 10;

    /**
     * Offset from the top of the row for placing fields on inline input rows
     * and statement input rows.
     * Matches existing rendering (in 2019).
     * @type {number}
     */
    this.TALL_INPUT_FIELD_OFFSET_Y = this.MEDIUM_PADDING;

    /**
     * The height of the puzzle tab used for input and output connections.
     * @type {number}
     */
    this.TAB_HEIGHT = 15;

    /**
     * The offset from the top of the block at which a puzzle tab is positioned.
     * @type {number}
     */
    this.TAB_OFFSET_FROM_TOP = 5;

    /**
     * Vertical overlap of the puzzle tab, used to make it look more like a
     * puzzle piece.
     * @type {number}
     */
    this.TAB_VERTICAL_OVERLAP = 2.5;

    /**
     * The width of the puzzle tab used for input and output connections.
     * @type {number}
     */
    this.TAB_WIDTH = 8;

    /**
     * The width of the notch used for previous and next connections.
     * @type {number}
     */
    this.NOTCH_WIDTH = 15;

    /**
     * The height of the notch used for previous and next connections.
     * @type {number}
     */
    this.NOTCH_HEIGHT = 4;

    /**
     * The minimum width of the block.
     * @type {number}
     */
    this.MIN_BLOCK_WIDTH = 12;

    this.EMPTY_BLOCK_SPACER_HEIGHT = 16;

    /**
     * The minimum height of a dummy input row.
     * @type {number}
     */
    this.DUMMY_INPUT_MIN_HEIGHT = this.TAB_HEIGHT;

    /**
     * The minimum height of a dummy input row in a shadow block.
     * @type {number}
     */
    this.DUMMY_INPUT_SHADOW_MIN_HEIGHT = this.TAB_HEIGHT;

    /**
     * Rounded corner radius.
     * @type {number}
     */
    this.CORNER_RADIUS = 8;

    /**
     * Offset from the left side of a block or the inside of a statement input
     * to the left side of the notch.
     * @type {number}
     */
    this.NOTCH_OFFSET_LEFT = 15;

    /**
     * Additional offset added to the statement input's width to account for the
     * notch.
     * @type {number}
     */
    this.STATEMENT_INPUT_NOTCH_OFFSET = this.NOTCH_OFFSET_LEFT;

    this.STATEMENT_BOTTOM_SPACER = 0;
    this.STATEMENT_INPUT_PADDING_LEFT = 20;

    /**
     * Vertical padding between consecutive statement inputs.
     * @type {number}
     */
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

    /**
     * Whether to add a 'hat' on top of all blocks with no previous or output
     * connections. Can be overridden by 'hat' property on Theme.BlockStyle.
     * @type {boolean}
     */
    this.ADD_START_HATS = false;

    /**
     * Height of the top hat.
     * @type {number}
     */
    this.START_HAT_HEIGHT = 15;

    /**
     * Width of the top hat.
     * @type {number}
     */
    this.START_HAT_WIDTH = 100;

    this.SPACER_DEFAULT_HEIGHT = 15;

    this.MIN_BLOCK_HEIGHT = 24;

    this.EMPTY_INLINE_INPUT_PADDING = 14.5;

    /**
     * The height of an empty inline input.
     * @type {number}
     */
    this.EMPTY_INLINE_INPUT_HEIGHT = this.TAB_HEIGHT + 11;

    this.EXTERNAL_VALUE_INPUT_PADDING = 2;

    /**
     * The height of an empty statement input.  Note that in the old rendering
     * this varies slightly depending on whether the block has external or
     * inline inputs. In the new rendering this is consistent.  It seems
     * unlikely that the old behaviour was intentional.
     * @type {number}
     */
    this.EMPTY_STATEMENT_INPUT_HEIGHT = this.MIN_BLOCK_HEIGHT;

    this.START_POINT = svgPaths.moveBy(0, 0);

    /**
     * Height of SVG path for jagged teeth at the end of collapsed blocks.
     * @type {number}
     */
    this.JAGGED_TEETH_HEIGHT = 12;

    /**
     * Width of SVG path for jagged teeth at the end of collapsed blocks.
     * @type {number}
     */
    this.JAGGED_TEETH_WIDTH = 6;

    /**
     * Point size of text.
     * @type {number}
     */
    this.FIELD_TEXT_FONTSIZE = 11;

    /**
     * Text font weight.
     * @type {string}
     */
    this.FIELD_TEXT_FONTWEIGHT = 'normal';

    /**
     * Text font family.
     * @type {string}
     */
    this.FIELD_TEXT_FONTFAMILY = 'sans-serif';

    /**
     * Height of text.  This constant is dynamically set in
     * ``setFontConstants_`` to be the height of the text based on the font
     * used.
     * @type {number}
     */
    this.FIELD_TEXT_HEIGHT = -1;  // Dynamically set.

    /**
     * Text baseline.  This constant is dynamically set in ``setFontConstants_``
     * to be the baseline of the text based on the font used.
     * @type {number}
     */
    this.FIELD_TEXT_BASELINE = -1;  // Dynamically set.

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
     * The backing colour of a field's border rect.
     * @type {string}
     * @package
     */
    this.FIELD_BORDER_RECT_COLOUR = '#fff';

    /**
     * A field's text element's dominant baseline.
     * @type {boolean}
     */
    this.FIELD_TEXT_BASELINE_CENTER = !userAgent.IE && !userAgent.EDGE;

    /**
     * A dropdown field's border rect height.
     * @type {number}
     */
    this.FIELD_DROPDOWN_BORDER_RECT_HEIGHT = this.FIELD_BORDER_RECT_HEIGHT;

    /**
     * Whether or not a dropdown field should add a border rect when in a shadow
     * block.
     * @type {boolean}
     */
    this.FIELD_DROPDOWN_NO_BORDER_RECT_SHADOW = false;

    /**
     * Whether or not a dropdown field's div should be coloured to match the
     * block colours.
     * @type {boolean}
     */
    this.FIELD_DROPDOWN_COLOURED_DIV = false;

    /**
     * Whether or not a dropdown field uses a text or SVG arrow.
     * @type {boolean}
     */
    this.FIELD_DROPDOWN_SVG_ARROW = false;

    /**
     * A dropdown field's SVG arrow padding.
     * @type {number}
     */
    this.FIELD_DROPDOWN_SVG_ARROW_PADDING = this.FIELD_BORDER_RECT_X_PADDING;

    /**
     * A dropdown field's SVG arrow size.
     * @type {number}
     */
    this.FIELD_DROPDOWN_SVG_ARROW_SIZE = 12;

    /**
     * A dropdown field's SVG arrow datauri.
     * @type {string}
     */
    this.FIELD_DROPDOWN_SVG_ARROW_DATAURI =
        'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllci' +
        'AxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMi43MSIgaG' +
        'VpZ2h0PSI4Ljc5IiB2aWV3Qm94PSIwIDAgMTIuNzEgOC43OSI+PHRpdGxlPmRyb3Bkb3duLW' +
        'Fycm93PC90aXRsZT48ZyBvcGFjaXR5PSIwLjEiPjxwYXRoIGQ9Ik0xMi43MSwyLjQ0QTIuND' +
        'EsMi40MSwwLDAsMSwxMiw0LjE2TDguMDgsOC4wOGEyLjQ1LDIuNDUsMCwwLDEtMy40NSwwTD' +
        'AuNzIsNC4xNkEyLjQyLDIuNDIsMCwwLDEsMCwyLjQ0LDIuNDgsMi40OCwwLDAsMSwuNzEuNz' +
        'FDMSwwLjQ3LDEuNDMsMCw2LjM2LDBTMTEuNzUsMC40NiwxMiwuNzFBMi40NCwyLjQ0LDAsMC' +
        'wxLDEyLjcxLDIuNDRaIiBmaWxsPSIjMjMxZjIwIi8+PC9nPjxwYXRoIGQ9Ik02LjM2LDcuNz' +
        'lhMS40MywxLjQzLDAsMCwxLTEtLjQyTDEuNDIsMy40NWExLjQ0LDEuNDQsMCwwLDEsMC0yYz' +
        'AuNTYtLjU2LDkuMzEtMC41Niw5Ljg3LDBhMS40NCwxLjQ0LDAsMCwxLDAsMkw3LjM3LDcuMz' +
        'dBMS40MywxLjQzLDAsMCwxLDYuMzYsNy43OVoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=';

    /**
     * Whether or not to show a box shadow around the widget div. This is only a
     * feature of full block fields.
     * @type {boolean}
     */
    this.FIELD_TEXTINPUT_BOX_SHADOW = false;

    /**
     * Whether or not the colour field should display its colour value on the
     * entire block.
     * @type {boolean}
     */
    this.FIELD_COLOUR_FULL_BLOCK = false;

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
     * A random identifier used to ensure a unique ID is used for each
     * filter/pattern for the case of multiple Blockly instances on a page.
     * @type {string}
     * @package
     */
    this.randomIdentifier = String(Math.random()).substring(2);

    /**
     * The defs tag that contains all filters and patterns for this Blockly
     * instance.
     * @type {?SVGElement}
     * @private
     */
    this.defs_ = null;

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
     * The ID of the debug filter, or the empty string if no pattern is set.
     * @type {string}
     * @package
     */
    this.debugFilterId = '';

    /**
     * The <filter> element to use for a debug highlight, or null if not set.
     * @type {SVGElement}
     * @private
     */
    this.debugFilter_ = null;

    /**
     * The <style> element to use for injecting renderer specific CSS.
     * @type {HTMLStyleElement}
     * @private
     */
    this.cssNode_ = null;

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

    /**
     * Whether text input and colour fields fill up the entire source block.
     * @type {boolean}
     * @package
     */
    this.FULL_BLOCK_FIELDS = false;

    /**
     * The main colour of insertion markers, in hex.  The block is rendered a
     * transparent grey by changing the fill opacity in CSS.
     * @type {string}
     * @package
     */
    this.INSERTION_MARKER_COLOUR = '#000000';

    /**
     * The insertion marker opacity.
     * @type {number}
     * @package
     */
    this.INSERTION_MARKER_OPACITY = 0.2;

    /**
     * Enum for connection shapes.
     * @enum {number}
     */
    this.SHAPES = {PUZZLE: 1, NOTCH: 2};
  }

  /**
   * Initialize shape objects based on the constants set in the constructor.
   * @package
   */
  init() {
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
  }

  /**
   * Refresh constants properties that depend on the theme.
   * @param {!Theme} theme The current workspace theme.
   * @package
   */
  setTheme(theme) {
    /**
     * The block styles map.
     * @type {Object<string, !Theme.BlockStyle>}
     * @package
     */
    this.blockStyles = Object.create(null);

    const blockStyles = theme.blockStyles;
    for (const key in blockStyles) {
      this.blockStyles[key] = this.validatedBlockStyle_(blockStyles[key]);
    }

    this.setDynamicProperties_(theme);
  }

  /**
   * Sets dynamic properties that depend on other values or theme properties.
   * @param {!Theme} theme The current workspace theme.
   * @protected
   */
  setDynamicProperties_(theme) {
    this.setFontConstants_(theme);
    this.setComponentConstants_(theme);

    this.ADD_START_HATS =
        theme.startHats !== null ? theme.startHats : this.ADD_START_HATS;
  }

  /**
   * Set constants related to fonts.
   * @param {!Theme} theme The current workspace theme.
   * @protected
   */
  setFontConstants_(theme) {
    if (theme.fontStyle && theme.fontStyle['family']) {
      this.FIELD_TEXT_FONTFAMILY = theme.fontStyle['family'];
    }

    if (theme.fontStyle && theme.fontStyle['weight']) {
      this.FIELD_TEXT_FONTWEIGHT = theme.fontStyle['weight'];
    }

    if (theme.fontStyle && theme.fontStyle['size']) {
      this.FIELD_TEXT_FONTSIZE = theme.fontStyle['size'];
    }

    const fontMetrics = dom.measureFontMetrics(
        'Hg', this.FIELD_TEXT_FONTSIZE + 'pt', this.FIELD_TEXT_FONTWEIGHT,
        this.FIELD_TEXT_FONTFAMILY);

    this.FIELD_TEXT_HEIGHT = fontMetrics.height;
    this.FIELD_TEXT_BASELINE = fontMetrics.baseline;
  }

  /**
   * Set constants from a theme's component styles.
   * @param {!Theme} theme The current workspace theme.
   * @protected
   */
  setComponentConstants_(theme) {
    this.CURSOR_COLOUR =
        theme.getComponentStyle('cursorColour') || this.CURSOR_COLOUR;
    this.MARKER_COLOUR =
        theme.getComponentStyle('markerColour') || this.MARKER_COLOUR;
    this.INSERTION_MARKER_COLOUR =
        theme.getComponentStyle('insertionMarkerColour') ||
        this.INSERTION_MARKER_COLOUR;
    this.INSERTION_MARKER_OPACITY =
        Number(theme.getComponentStyle('insertionMarkerOpacity')) ||
        this.INSERTION_MARKER_OPACITY;
  }

  /**
   * Get or create a block style based on a single colour value.  Generate a
   * name for the style based on the colour.
   * @param {string} colour #RRGGBB colour string.
   * @return {{style: !Theme.BlockStyle, name: string}} An object
   *     containing the style and an autogenerated name for that style.
   * @package
   */
  getBlockStyleForColour(colour) {
    const name = 'auto_' + colour;
    if (!this.blockStyles[name]) {
      this.blockStyles[name] = this.createBlockStyle_(colour);
    }
    return {style: this.blockStyles[name], name: name};
  }

  /**
   * Gets the BlockStyle for the given block style name.
   * @param {?string} blockStyleName The name of the block style.
   * @return {!Theme.BlockStyle} The named block style, or a default style
   *     if no style with the given name was found.
   */
  getBlockStyle(blockStyleName) {
    return this.blockStyles[blockStyleName || ''] ||
        (blockStyleName && blockStyleName.indexOf('auto_') === 0 ?
             this.getBlockStyleForColour(blockStyleName.substring(5)).style :
             this.createBlockStyle_('#000000'));
  }

  /**
   * Create a block style object based on the given colour.
   * @param {string} colour #RRGGBB colour string.
   * @return {!Theme.BlockStyle} A populated block style based on the
   *     given colour.
   * @protected
   */
  createBlockStyle_(colour) {
    return this.validatedBlockStyle_({'colourPrimary': colour});
  }

  /**
   * Get a full block style object based on the input style object.  Populate
   * any missing values.
   * @param {{
   *     colourPrimary:string,
   *     colourSecondary:(string|undefined),
   *     colourTertiary:(string|undefined),
   *     hat:(string|undefined)
   * }} blockStyle A full or partial block style object.

   * @return {!Theme.BlockStyle} A full block style object, with all
   *     required properties populated.
   * @protected
   */
  validatedBlockStyle_(blockStyle) {
    // Make a new object with all of the same properties.
    const valid = /** @type {!Theme.BlockStyle} */ ({});
    if (blockStyle) {
      object.mixin(valid, blockStyle);
    }
    // Validate required properties.
    const parsedColour =
        parsing.parseBlockColour(valid['colourPrimary'] || '#000');
    valid.colourPrimary = parsedColour.hex;
    valid.colourSecondary = valid['colourSecondary'] ?
        parsing.parseBlockColour(valid['colourSecondary']).hex :
        this.generateSecondaryColour_(valid.colourPrimary);
    valid.colourTertiary = valid['colourTertiary'] ?
        parsing.parseBlockColour(valid['colourTertiary']).hex :
        this.generateTertiaryColour_(valid.colourPrimary);

    valid.hat = valid['hat'] || '';
    return valid;
  }

  /**
   * Generate a secondary colour from the passed in primary colour.
   * @param {string} inputColour Primary colour.
   * @return {string} The generated secondary colour.
   * @protected
   */
  generateSecondaryColour_(inputColour) {
    return colour.blend('#fff', inputColour, 0.6) || inputColour;
  }

  /**
   * Generate a tertiary colour from the passed in primary colour.
   * @param {string} inputColour Primary colour.
   * @return {string} The generated tertiary colour.
   * @protected
   */
  generateTertiaryColour_(inputColour) {
    return colour.blend('#fff', inputColour, 0.3) || inputColour;
  }

  /**
   * Dispose of this constants provider.
   * Delete all DOM elements that this provider created.
   * @package
   */
  dispose() {
    if (this.embossFilter_) {
      dom.removeNode(this.embossFilter_);
    }
    if (this.disabledPattern_) {
      dom.removeNode(this.disabledPattern_);
    }
    if (this.debugFilter_) {
      dom.removeNode(this.debugFilter_);
    }
    this.cssNode_ = null;
  }

  /**
   * @return {!Object} An object containing sizing and path information about
   *     collapsed block indicators.
   * @package
   */
  makeJaggedTeeth() {
    const height = this.JAGGED_TEETH_HEIGHT;
    const width = this.JAGGED_TEETH_WIDTH;

    const mainPath = svgPaths.line([
      svgPaths.point(width, height / 4),
      svgPaths.point(-width * 2, height / 2),
      svgPaths.point(width, height / 4),
    ]);
    return {height: height, width: width, path: mainPath};
  }

  /**
   * @return {!Object} An object containing sizing and path information about
   *     start hats.
   * @package
   */
  makeStartHat() {
    const height = this.START_HAT_HEIGHT;
    const width = this.START_HAT_WIDTH;

    const mainPath = svgPaths.curve('c', [
      svgPaths.point(30, -height),
      svgPaths.point(70, -height),
      svgPaths.point(width, 0),
    ]);
    return {height: height, width: width, path: mainPath};
  }

  /**
   * @return {!Object} An object containing sizing and path information about
   *     puzzle tabs.
   * @package
   */
  makePuzzleTab() {
    const width = this.TAB_WIDTH;
    const height = this.TAB_HEIGHT;

    /**
     * Make the main path for the puzzle tab made out of a few curves (c and s).
     * Those curves are defined with relative positions.  The 'up' and 'down'
     * versions of the paths are the same, but the Y sign flips.  Forward and
     * back are the signs to use to move the cursor in the direction that the
     * path is being drawn.
     * @param {boolean} up True if the path should be drawn from bottom to top,
     *     false otherwise.
     * @return {string} A path fragment describing a puzzle tab.
     */
    function makeMainPath(up) {
      const forward = up ? -1 : 1;
      const back = -forward;

      const overlap = 2.5;
      const halfHeight = height / 2;
      const control1Y = halfHeight + overlap;
      const control2Y = halfHeight + 0.5;
      const control3Y = overlap;  // 2.5

      const endPoint1 = svgPaths.point(-width, forward * halfHeight);
      const endPoint2 = svgPaths.point(width, forward * halfHeight);

      return svgPaths.curve(
                 'c',
                 [
                   svgPaths.point(0, forward * control1Y),
                   svgPaths.point(-width, back * control2Y),
                   endPoint1,
                 ]) +
          svgPaths.curve(
              's', [svgPaths.point(width, back * control3Y), endPoint2]);
    }

    // c 0,-10  -8,8  -8,-7.5  s 8,2.5  8,-7.5
    const pathUp = makeMainPath(true);
    // c 0,10  -8,-8  -8,7.5  s 8,-2.5  8,7.5
    const pathDown = makeMainPath(false);

    return {
      type: this.SHAPES.PUZZLE,
      width: width,
      height: height,
      pathDown: pathDown,
      pathUp: pathUp,
    };
  }

  /**
   * @return {!Object} An object containing sizing and path information about
   *     notches.
   * @package
   */
  makeNotch() {
    const width = this.NOTCH_WIDTH;
    const height = this.NOTCH_HEIGHT;
    const innerWidth = 3;
    const outerWidth = (width - innerWidth) / 2;

    /**
     * Make the main path for the notch.
     * @param {number} dir Direction multiplier to apply to horizontal offsets
     *     along the path. Either 1 or -1.
     * @return {string} A path fragment describing a notch.
     */
    function makeMainPath(dir) {
      return svgPaths.line([
        svgPaths.point(dir * outerWidth, height),
        svgPaths.point(dir * innerWidth, 0),
        svgPaths.point(dir * outerWidth, -height),
      ]);
    }
    const pathLeft = makeMainPath(1);
    const pathRight = makeMainPath(-1);

    return {
      type: this.SHAPES.NOTCH,
      width: width,
      height: height,
      pathLeft: pathLeft,
      pathRight: pathRight,
    };
  }

  /**
   * @return {!Object} An object containing sizing and path information about
   *     inside corners.
   * @package
   */
  makeInsideCorners() {
    const radius = this.CORNER_RADIUS;

    const innerTopLeftCorner =
        svgPaths.arc('a', '0 0,0', radius, svgPaths.point(-radius, radius));

    const innerBottomLeftCorner =
        svgPaths.arc('a', '0 0,0', radius, svgPaths.point(radius, radius));

    return {
      width: radius,
      height: radius,
      pathTop: innerTopLeftCorner,
      pathBottom: innerBottomLeftCorner,
    };
  }

  /**
   * @return {!Object} An object containing sizing and path information about
   *     outside corners.
   * @package
   */
  makeOutsideCorners() {
    const radius = this.CORNER_RADIUS;
    /**
     * SVG path for drawing the rounded top-left corner.
     * @const
     */
    const topLeft = svgPaths.moveBy(0, radius) +
        svgPaths.arc('a', '0 0,1', radius, svgPaths.point(radius, -radius));

    /**
     * SVG path for drawing the rounded top-right corner.
     * @const
     */
    const topRight =
        svgPaths.arc('a', '0 0,1', radius, svgPaths.point(radius, radius));

    /**
     * SVG path for drawing the rounded bottom-left corner.
     * @const
     */
    const bottomLeft =
        svgPaths.arc('a', '0 0,1', radius, svgPaths.point(-radius, -radius));

    /**
     * SVG path for drawing the rounded bottom-right corner.
     * @const
     */
    const bottomRight =
        svgPaths.arc('a', '0 0,1', radius, svgPaths.point(-radius, radius));

    return {
      topLeft: topLeft,
      topRight: topRight,
      bottomRight: bottomRight,
      bottomLeft: bottomLeft,
      rightHeight: radius,
    };
  }

  /**
   * Get an object with connection shape and sizing information based on the
   * type of the connection.
   * @param {!RenderedConnection} connection The connection to find a
   *     shape object for
   * @return {!Object} The shape object for the connection.
   * @package
   */
  shapeFor(connection) {
    switch (connection.type) {
      case ConnectionType.INPUT_VALUE:
      case ConnectionType.OUTPUT_VALUE:
        return this.PUZZLE_TAB;
      case ConnectionType.PREVIOUS_STATEMENT:
      case ConnectionType.NEXT_STATEMENT:
        return this.NOTCH;
      default:
        throw Error('Unknown connection type');
    }
  }

  /**
   * Create any DOM elements that this renderer needs (filters, patterns, etc).
   * @param {!SVGElement} svg The root of the workspace's SVG.
   * @param {string} tagName The name to use for the CSS style tag.
   * @param {string} selector The CSS selector to use.
   * @suppress {strictModuleDepCheck} Debug renderer only included in
   * playground.
   * @package
   */
  createDom(svg, tagName, selector) {
    this.injectCSS_(tagName, selector);

    /*
    <defs>
      ... filters go here ...
    </defs>
    */
    this.defs_ = dom.createSvgElement(Svg.DEFS, {}, svg);
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
    const embossFilter = dom.createSvgElement(
        Svg.FILTER, {'id': 'blocklyEmbossFilter' + this.randomIdentifier},
        this.defs_);
    dom.createSvgElement(
        Svg.FEGAUSSIANBLUR,
        {'in': 'SourceAlpha', 'stdDeviation': 1, 'result': 'blur'},
        embossFilter);
    const feSpecularLighting = dom.createSvgElement(
        Svg.FESPECULARLIGHTING, {
          'in': 'blur',
          'surfaceScale': 1,
          'specularConstant': 0.5,
          'specularExponent': 10,
          'lighting-color': 'white',
          'result': 'specOut',
        },
        embossFilter);
    dom.createSvgElement(
        Svg.FEPOINTLIGHT, {'x': -5000, 'y': -10000, 'z': 20000},
        feSpecularLighting);
    dom.createSvgElement(
        Svg.FECOMPOSITE, {
          'in': 'specOut',
          'in2': 'SourceAlpha',
          'operator': 'in',
          'result': 'specOut',
        },
        embossFilter);
    dom.createSvgElement(
        Svg.FECOMPOSITE, {
          'in': 'SourceGraphic',
          'in2': 'specOut',
          'operator': 'arithmetic',
          'k1': 0,
          'k2': 1,
          'k3': 1,
          'k4': 0,
        },
        embossFilter);
    this.embossFilterId = embossFilter.id;
    this.embossFilter_ = embossFilter;

    /*
      <pattern id="blocklyDisabledPattern837493" patternUnits="userSpaceOnUse"
               width="10" height="10">
        <rect width="10" height="10" fill="#aaa" />
        <path d="M 0 0 L 10 10 M 10 0 L 0 10" stroke="#cc0" />
      </pattern>
    */
    const disabledPattern = dom.createSvgElement(
        Svg.PATTERN, {
          'id': 'blocklyDisabledPattern' + this.randomIdentifier,
          'patternUnits': 'userSpaceOnUse',
          'width': 10,
          'height': 10,
        },
        this.defs_);
    dom.createSvgElement(
        Svg.RECT, {'width': 10, 'height': 10, 'fill': '#aaa'}, disabledPattern);
    dom.createSvgElement(
        Svg.PATH, {'d': 'M 0 0 L 10 10 M 10 0 L 0 10', 'stroke': '#cc0'},
        disabledPattern);
    this.disabledPatternId = disabledPattern.id;
    this.disabledPattern_ = disabledPattern;

    this.createDebugFilter();
  }

  /**
   * Create a filter for highlighting the currently rendering block during
   * render debugging.
   * @private
   */
  createDebugFilter() {
    // Only create the debug filter once.
    if (!this.debugFilter_) {
      const debugFilter = dom.createSvgElement(
          Svg.FILTER, {
            'id': 'blocklyDebugFilter' + this.randomIdentifier,
            'height': '160%',
            'width': '180%',
            'y': '-30%',
            'x': '-40%',
          },
          this.defs_);
      // Set all gaussian blur pixels to 1 opacity before applying flood
      const debugComponentTransfer = dom.createSvgElement(
          Svg.FECOMPONENTTRANSFER, {'result': 'outBlur'}, debugFilter);
      dom.createSvgElement(
          Svg.FEFUNCA,
          {'type': 'table', 'tableValues': '0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1'},
          debugComponentTransfer);
      // Color the highlight
      dom.createSvgElement(
          Svg.FEFLOOD, {
            'flood-color': '#ff0000',
            'flood-opacity': 0.5,
            'result': 'outColor',
          },
          debugFilter);
      dom.createSvgElement(
          Svg.FECOMPOSITE, {
            'in': 'outColor',
            'in2': 'outBlur',
            'operator': 'in',
            'result': 'outGlow',
          },
          debugFilter);
      this.debugFilterId = debugFilter.id;
      this.debugFilter_ = debugFilter;
    }
  }

  /**
   * Inject renderer specific CSS into the page.
   * @param {string} tagName The name of the style tag to use.
   * @param {string} selector The CSS selector to use.
   * @protected
   */
  injectCSS_(tagName, selector) {
    const cssArray = this.getCSS_(selector);
    const cssNodeId = 'blockly-renderer-style-' + tagName;
    this.cssNode_ =
        /** @type {!HTMLStyleElement} */ (document.getElementById(cssNodeId));
    const text = cssArray.join('\n');
    if (this.cssNode_) {
      // Already injected, update if the theme changed.
      this.cssNode_.firstChild.textContent = text;
      return;
    }
    // Inject CSS tag at start of head.
    const cssNode =
        /** @type {!HTMLStyleElement} */ (document.createElement('style'));
    cssNode.id = cssNodeId;
    const cssTextNode = document.createTextNode(text);
    cssNode.appendChild(cssTextNode);
    document.head.insertBefore(cssNode, document.head.firstChild);
    this.cssNode_ = cssNode;
  }

  /**
   * Get any renderer specific CSS to inject when the renderer is initialized.
   * @param {string} selector CSS selector to use.
   * @return {!Array<string>} Array of CSS strings.
   * @protected
   */
  getCSS_(selector) {
    return [
      /* eslint-disable indent */
      /* clang-format off */
      // Text.
      selector + ' .blocklyText, ',
      selector + ' .blocklyFlyoutLabelText {',
        'font: ' + this.FIELD_TEXT_FONTWEIGHT + ' ' +
            this.FIELD_TEXT_FONTSIZE + 'pt ' + this.FIELD_TEXT_FONTFAMILY + ';',
      '}',

      // Fields.
      selector + ' .blocklyText {',
        'fill: #fff;',
      '}',
      selector + ' .blocklyNonEditableText>rect,',
      selector + ' .blocklyEditableText>rect {',
        'fill: ' + this.FIELD_BORDER_RECT_COLOUR + ';',
        'fill-opacity: .6;',
        'stroke: none;',
      '}',
      selector + ' .blocklyNonEditableText>text,',
      selector + ' .blocklyEditableText>text {',
        'fill: #000;',
      '}',

      // Flyout labels.
      selector + ' .blocklyFlyoutLabelText {',
        'fill: #000;',
      '}',

      // Bubbles.
      selector + ' .blocklyText.blocklyBubbleText {',
        'fill: #000;',
      '}',

      // Editable field hover.
      selector + ' .blocklyEditableText:not(.editing):hover>rect {',
        'stroke: #fff;',
        'stroke-width: 2;',
      '}',

      // Text field input.
      selector + ' .blocklyHtmlInput {',
        'font-family: ' + this.FIELD_TEXT_FONTFAMILY + ';',
        'font-weight: ' + this.FIELD_TEXT_FONTWEIGHT + ';',
      '}',

      // Selection highlight.
      selector + ' .blocklySelected>.blocklyPath {',
        'stroke: #fc3;',
        'stroke-width: 3px;',
      '}',

      // Connection highlight.
      selector + ' .blocklyHighlightedConnectionPath {',
        'stroke: #fc3;',
      '}',

      // Replaceable highlight.
      selector + ' .blocklyReplaceable .blocklyPath {',
        'fill-opacity: .5;',
      '}',
      selector + ' .blocklyReplaceable .blocklyPathLight,',
      selector + ' .blocklyReplaceable .blocklyPathDark {',
        'display: none;',
      '}',

      // Insertion marker.
      selector + ' .blocklyInsertionMarker>.blocklyPath {',
        'fill-opacity: ' + this.INSERTION_MARKER_OPACITY + ';',
        'stroke: none;',
      '}',
      /* clang-format on */
      /* eslint-enable indent */
    ];
  }
}

exports.ConstantProvider = ConstantProvider;
