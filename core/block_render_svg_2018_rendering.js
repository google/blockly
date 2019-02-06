/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
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
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.BlockSvg.render');

goog.require('Blockly.BlockSvg');
goog.require('Blockly.pxtBlocklyUtils');
goog.require('Blockly.utils');


// UI constants for rendering blocks.
/**
* Grid unit to pixels conversion
* @const
*/
Blockly.BlockSvg.GRID_UNIT = 4;

/**
 * Width of horizontal puzzle tab.
 * @const
 */
Blockly.BlockSvg.TAB_WIDTH = 8;

/**
 * Horizontal space between elements.
 * @const
 */
Blockly.BlockSvg.SEP_SPACE_X = 2 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Vertical space between elements.
 * @const
 */
Blockly.BlockSvg.SEP_SPACE_Y = 2 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Minimum width of a block.
 * @const
 */
Blockly.BlockSvg.MIN_BLOCK_X = 16 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Minimum width of a block with output (reporters).
 * @const
 */
Blockly.BlockSvg.MIN_BLOCK_X_OUTPUT = 12 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Minimum width of a shadow block with output (single fields).
 * @const
 */
Blockly.BlockSvg.MIN_BLOCK_X_SHADOW_OUTPUT = 10 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Minimum height of a block.
 * @const
 */
Blockly.BlockSvg.MIN_BLOCK_Y = 12 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Height of extra row after a statement input.
 * @const
 */
Blockly.BlockSvg.EXTRA_STATEMENT_ROW_Y = 8 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Minimum width of a C- or E-shaped block.
 * @const
 */
Blockly.BlockSvg.MIN_BLOCK_X_WITH_STATEMENT = 40 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Minimum height of a shadow block with output and a single field.
 * This is used for shadow blocks that only contain a field - which are smaller than even reporters.
 * @const
 */
Blockly.BlockSvg.MIN_BLOCK_Y_SINGLE_FIELD_OUTPUT = 8 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Minimum height of a non-shadow block with output, i.e. a reporter.
 * @const
 */
Blockly.BlockSvg.MIN_BLOCK_Y_REPORTER = 10 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Minimum space for a statement input height.
 * @const
 */
Blockly.BlockSvg.MIN_STATEMENT_INPUT_HEIGHT = 6 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Width of vertical notch.
 * @const
 */
Blockly.BlockSvg.NOTCH_WIDTH = 8 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Height of vertical notch.
 * @const
 */
Blockly.BlockSvg.NOTCH_HEIGHT = 2 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Rounded corner radius.
 * @const
 */
Blockly.BlockSvg.CORNER_RADIUS = 1 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Minimum width of statement input edge on the left, in px.
 * @const
 */
Blockly.BlockSvg.STATEMENT_INPUT_EDGE_WIDTH = 4 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Inner space between edge of statement input and notch.
 * @const
 */
Blockly.BlockSvg.STATEMENT_INPUT_INNER_SPACE = 2 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Do blocks with no previous or output connections have a 'hat' on top?
 * @const
 */
Blockly.BlockSvg.START_HAT = false;

/**
 * Height of the top hat.
 * @const
 */
Blockly.BlockSvg.START_HAT_HEIGHT = 16;

/**
 * Height of the vertical separator line for icons that appear at the left edge
 * of a block, such as extension icons.
 * @const
 */
Blockly.BlockSvg.ICON_SEPARATOR_HEIGHT = 10 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Path of the top hat's curve.
 * @const
 */
Blockly.BlockSvg.START_HAT_PATH = 'c 25,-22 71,-22 96,0';

/**
 * SVG path for drawing next/previous notch from left to right.
 * @const
 */
Blockly.BlockSvg.NOTCH_PATH_LEFT = (
  'c 2,0 3,1 4,2 ' +
  'l 4,4 ' +
  'c 1,1 2,2 4,2 ' +
  'h 12 ' +
  'c 2,0 3,-1 4,-2 ' +
  'l 4,-4 ' +
  'c 1,-1 2,-2 4,-2'
);

/**
 * SVG path for drawing next/previous notch from right to left.
 * @const
 */
Blockly.BlockSvg.NOTCH_PATH_RIGHT = (
  'c -2,0 -3,1 -4,2 ' +
  'l -4,4 ' +
  'c -1,1 -2,2 -4,2 ' +
  'h -12 ' +
  'c -2,0 -3,-1 -4,-2 ' +
  'l -4,-4 ' +
  'c -1,-1 -2,-2 -4,-2'
);

/**
 * Amount of padding before the notch.
 * @const
 */
Blockly.BlockSvg.NOTCH_START_PADDING = 3 * Blockly.BlockSvg.GRID_UNIT;

/**
 * SVG start point for drawing the top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_START =
    'm 0,' + Blockly.BlockSvg.CORNER_RADIUS;

/**
 * SVG path for drawing the rounded top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER =
    'A ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,1 ' +
    Blockly.BlockSvg.CORNER_RADIUS + ',0';

/**
 * SVG path for drawing the rounded top-right corner.
 * @const
 */
Blockly.BlockSvg.TOP_RIGHT_CORNER =
    'a ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,1 ' +
    Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS;

/**
 * SVG path for drawing the rounded bottom-right corner.
 * @const
 */
Blockly.BlockSvg.BOTTOM_RIGHT_CORNER =
    ' a ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,1 -' +
    Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS;

/**
 * SVG path for drawing the rounded bottom-left corner.
 * @const
 */
Blockly.BlockSvg.BOTTOM_LEFT_CORNER =
    'a ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
     Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,1 -' +
     Blockly.BlockSvg.CORNER_RADIUS + ',-' +
     Blockly.BlockSvg.CORNER_RADIUS;

/**
 * SVG path for drawing the top-left corner of a statement input.
 * @const
 */
Blockly.BlockSvg.INNER_TOP_LEFT_CORNER =
    ' a ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,0 -' +
    Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS;

/**
 * SVG path for drawing the bottom-left corner of a statement input.
 * Includes the rounded inside corner.
 * @const
 */
Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER =
    'a ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,0 ' +
    Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS;

/**
 * SVG path for an empty hexagonal input shape.
 * @const
 */
Blockly.BlockSvg.INPUT_SHAPE_HEXAGONAL =
    'M ' + 4 * Blockly.BlockSvg.GRID_UNIT + ',0 ' +
    ' h ' + 4 * Blockly.BlockSvg.GRID_UNIT +
    ' l ' + 4 * Blockly.BlockSvg.GRID_UNIT + ',' + 4 * Blockly.BlockSvg.GRID_UNIT +
    ' l ' + -4 * Blockly.BlockSvg.GRID_UNIT + ',' + 4 * Blockly.BlockSvg.GRID_UNIT +
    ' h ' + -4 * Blockly.BlockSvg.GRID_UNIT +
    ' l ' + -4 * Blockly.BlockSvg.GRID_UNIT + ',' + -4 * Blockly.BlockSvg.GRID_UNIT +
    ' l ' + 4 * Blockly.BlockSvg.GRID_UNIT + ',' + -4 * Blockly.BlockSvg.GRID_UNIT +
    ' z';

/**
 * Width of empty boolean input shape.
 * @const
 */
Blockly.BlockSvg.INPUT_SHAPE_HEXAGONAL_WIDTH = 12 * Blockly.BlockSvg.GRID_UNIT;

/**
 * SVG path for an empty square input shape.
 * @const
 */
Blockly.BlockSvg.INPUT_SHAPE_SQUARE =
    Blockly.BlockSvg.TOP_LEFT_CORNER_START +
    Blockly.BlockSvg.TOP_LEFT_CORNER +
    ' h ' + (12 * Blockly.BlockSvg.GRID_UNIT - 2 * Blockly.BlockSvg.CORNER_RADIUS) +
    Blockly.BlockSvg.TOP_RIGHT_CORNER +
    ' v ' + (8 * Blockly.BlockSvg.GRID_UNIT - 2 * Blockly.BlockSvg.CORNER_RADIUS) +
    Blockly.BlockSvg.BOTTOM_RIGHT_CORNER +
    ' h ' + (-12 * Blockly.BlockSvg.GRID_UNIT + 2 * Blockly.BlockSvg.CORNER_RADIUS) +
    Blockly.BlockSvg.BOTTOM_LEFT_CORNER +
    ' z';

/**
 * Width of empty square input shape.
 * @const
 */
Blockly.BlockSvg.INPUT_SHAPE_SQUARE_WIDTH = 10 * Blockly.BlockSvg.GRID_UNIT;

/**
 * SVG path for an empty round input shape.
 * @const
 */

Blockly.BlockSvg.INPUT_SHAPE_ROUND =
  'M ' + (4 * Blockly.BlockSvg.GRID_UNIT) + ',0' +
  ' h ' + (4 * Blockly.BlockSvg.GRID_UNIT) +
  ' a ' + (4 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (4 * Blockly.BlockSvg.GRID_UNIT) + ' 0 0 1 0 ' + (8 * Blockly.BlockSvg.GRID_UNIT) +
  ' h ' + (-4 * Blockly.BlockSvg.GRID_UNIT) +
  ' a ' + (4 * Blockly.BlockSvg.GRID_UNIT) + ' ' +
      (4 * Blockly.BlockSvg.GRID_UNIT) + ' 0 0 1 0 -' + (8 * Blockly.BlockSvg.GRID_UNIT) +
  ' z';

/**
 * Width of empty round input shape.
 * @const
 */
Blockly.BlockSvg.INPUT_SHAPE_ROUND_WIDTH = 12 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Height of empty input shape.
 * @const
 */
Blockly.BlockSvg.INPUT_SHAPE_HEIGHT = 8 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Height of user inputs
 * @const
 */
Blockly.BlockSvg.FIELD_HEIGHT = 8 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Width of user inputs
 * @const
 */
Blockly.BlockSvg.FIELD_WIDTH = 6 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Editable field padding (left/right of the text).
 * @const
 */
Blockly.BlockSvg.EDITABLE_FIELD_PADDING = 6;

/**
 * Square box field padding (left/right of the text).
 * @const
 */
Blockly.BlockSvg.BOX_FIELD_PADDING = 2 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Drop-down arrow padding.
 * @const
 */
Blockly.BlockSvg.DROPDOWN_ARROW_PADDING = 2 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Minimum width of user inputs during editing
 * @const
 */
Blockly.BlockSvg.FIELD_WIDTH_MIN_EDIT = 8 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Maximum width of user inputs during editing
 * @const
 */
Blockly.BlockSvg.FIELD_WIDTH_MAX_EDIT = Infinity;

/**
 * Maximum height of user inputs during editing
 * @const
 */
Blockly.BlockSvg.FIELD_HEIGHT_MAX_EDIT = Blockly.BlockSvg.FIELD_HEIGHT;

/**
 * Top padding of user inputs
 * @const
 */
Blockly.BlockSvg.FIELD_TOP_PADDING = 0.5 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Corner radius of number inputs
 * @const
 */
Blockly.BlockSvg.NUMBER_FIELD_CORNER_RADIUS = 4 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Corner radius of text inputs
 * @const
 */
Blockly.BlockSvg.TEXT_FIELD_CORNER_RADIUS = 1 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Default radius for a field, in px.
 * @const
 */
Blockly.BlockSvg.FIELD_DEFAULT_CORNER_RADIUS = 4 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Max text display length for a field (per-horizontal/vertical)
 * @const
 */
Blockly.BlockSvg.MAX_DISPLAY_LENGTH = Infinity;

/**
 * Minimum X of inputs and fields for blocks with a previous connection.
 * Ensures that inputs will not overlap with the top notch of blocks.
 * @const
 */
Blockly.BlockSvg.INPUT_AND_FIELD_MIN_X = 12 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Vertical padding around inline elements.
 * @const
 */
Blockly.BlockSvg.INLINE_PADDING_Y = 1 * Blockly.BlockSvg.GRID_UNIT;

/**
 * Point size of text field before animation. Must match size in CSS.
 * See implementation in field_textinput.
 */
Blockly.BlockSvg.FIELD_TEXTINPUT_FONTSIZE_INITIAL = 12;

/**
 * Point size of text field after animation.
 * See implementation in field_textinput.
 */
Blockly.BlockSvg.FIELD_TEXTINPUT_FONTSIZE_FINAL = 12;

/**
 * Whether text fields are allowed to expand past their truncated block size.
 * @const{boolean}
 */
Blockly.BlockSvg.FIELD_TEXTINPUT_EXPAND_PAST_TRUNCATION = false;

/**
 * Whether text fields should animate their positioning.
 * @const{boolean}
 */
Blockly.BlockSvg.FIELD_TEXTINPUT_ANIMATE_POSITIONING = false;

/**
 * Map of output/input shapes and the amount they should cause a block to be padded.
 * Outer key is the outer shape, inner key is the inner shape.
 * When a block with the outer shape contains an input block with the inner shape
 * on its left or right edge, that side is extended by the padding specified.
 * See also: `Blockly.BlockSvg.computeOutputPadding_`.
 */
Blockly.BlockSvg.SHAPE_IN_SHAPE_PADDING = {
  1: { // Outer shape: hexagon.
    0: 5 * Blockly.BlockSvg.GRID_UNIT, // Field in hexagon.
    1: 2 * Blockly.BlockSvg.GRID_UNIT, // Hexagon in hexagon.
    2: 5 * Blockly.BlockSvg.GRID_UNIT, // Round in hexagon.
    3: 5 * Blockly.BlockSvg.GRID_UNIT // Square in hexagon.
  },
  2: { // Outer shape: round.
    0: 3 * Blockly.BlockSvg.GRID_UNIT, // Field in round.
    1: 3 * Blockly.BlockSvg.GRID_UNIT, // Hexagon in round.
    2: 1 * Blockly.BlockSvg.GRID_UNIT, // Round in round.
    3: 2 * Blockly.BlockSvg.GRID_UNIT // Square in round.
  },
  3: { // Outer shape: square.
    0: 2 * Blockly.BlockSvg.GRID_UNIT, // Field in square.
    1: 2 * Blockly.BlockSvg.GRID_UNIT, // Hexagon in square.
    2: 2 * Blockly.BlockSvg.GRID_UNIT, // Round in square.
    3: 2 * Blockly.BlockSvg.GRID_UNIT // Square in square.
  }
};

/**
 * Change the colour of a block.
 */
Blockly.BlockSvg.prototype.updateColour = function() {
  var strokeColour = this.getColourTertiary();
  var renderShadowed = this.isShadow() && !Blockly.pxtBlocklyUtils.isShadowArgumentReporter(this);

  if (renderShadowed && this.parentBlock_) {
    // Pull shadow block stroke colour from parent block's tertiary if possible.
    strokeColour = this.parentBlock_.getColourTertiary();
    // Special case: if we contain a colour field, set to a special stroke colour.
    // if (this.inputList[0] &&
    //     this.inputList[0].fieldRow[0] &&
    //     (this.inputList[0].fieldRow[0] instanceof Blockly.FieldColour ||
    //     this.inputList[0].fieldRow[0] instanceof Blockly.FieldColourSlider)) {
    //   strokeColour = Blockly.Colours.colourPickerStroke;
    // }
  }

  // Render block stroke
  this.svgPath_.setAttribute('stroke', strokeColour);

  // Render block fill
  if (this.isGlowingBlock_ || renderShadowed) {
    // Use the block's shadow colour if possible.
    if (this.getShadowColour()) {
      var fillColour = this.getShadowColour();
    } else {
      var fillColour = this.getColourSecondary();
    }
  } else {
    var fillColour = this.getColour();
  }
  this.svgPath_.setAttribute('fill', fillColour);

  // Render opacity
  this.svgPath_.setAttribute('fill-opacity', this.getOpacity());

  // Update colours of input shapes.
  for (var i = 0, input; input = this.inputList[i]; i++) {
    if (input.outlinePath) {
      input.outlinePath.setAttribute('fill', this.getColourTertiary());
    }
  }

  // Render icon(s) if applicable
  var icons = this.getIcons();
  for (var i = 0; i < icons.length; i++) {
    icons[i].updateColour();
  }

  // Bump every dropdown to change its colour.
  for (var x = 0, input; input = this.inputList[x]; x++) {
    for (var y = 0, field; field = input.fieldRow[y]; y++) {
      field.setText(null);
    }
  }
};

/**
 * Visual effect to show that if the dragging block is dropped, this block will
 * be replaced.  If a shadow block it will disappear.  Otherwise it will bump.
 * @param {boolean} add True if highlighting should be added.
 */
Blockly.BlockSvg.prototype.highlightForReplacement = function(add) {
  if (add) {
    var replacementGlowFilterId = this.workspace.options.replacementGlowFilterId
      || 'blocklyReplacementGlowFilter';
    this.svgPath_.setAttribute('filter', 'url(#' + replacementGlowFilterId + ')');
    Blockly.utils.addClass(/** @type {!Element} */ (this.svgGroup_),
        'blocklyReplaceable');
  } else {
    this.svgPath_.removeAttribute('filter');
    Blockly.utils.removeClass(/** @type {!Element} */ (this.svgGroup_),
        'blocklyReplaceable');
  }
};

/**
 * Visual effect to show that if the dragging block is dropped it will connect
 * to this input.
 * @param {Blockly.Connection} conn The connection on the input to highlight.
 * @param {boolean} add True if highlighting should be added.
 */
Blockly.BlockSvg.prototype.highlightShapeForInput = function(conn, add) {
  var input = this.getInputWithConnection(conn);
  if (!input) {
    throw 'No input found for the connection';
  }
  if (!input.outlinePath) {
    return;
  }
  if (add) {
    var replacementGlowFilterId = this.workspace.options.replacementGlowFilterId
      || 'blocklyReplacementGlowFilter';
    input.outlinePath.setAttribute('filter',
        'url(#' + replacementGlowFilterId + ')');
    Blockly.utils.addClass(/** @type {!Element} */ (this.svgGroup_),
        'blocklyReplaceable');
  } else {
    input.outlinePath.removeAttribute('filter');
    Blockly.utils.removeClass(/** @type {!Element} */ (this.svgGroup_),
        'blocklyReplaceable');
  }
};

/**
 * Returns a bounding box describing the dimensions of this block
 * and any blocks stacked below it.
 * @return {!{height: number, width: number}} Object with height and width properties.
 */
Blockly.BlockSvg.prototype.getHeightWidth = function() {
  var height = this.height;
  var width = this.width;
  // Recursively add size of subsequent blocks.
  var nextBlock = this.getNextBlock();
  if (nextBlock) {
    var nextHeightWidth = nextBlock.getHeightWidth();
    height += nextHeightWidth.height;
    height -= Blockly.BlockSvg.NOTCH_HEIGHT; // Exclude height of connected notch.
    width = Math.max(width, nextHeightWidth.width);
  }
  return {height: height, width: width};
};

/**
 * Render the block.
 * Lays out and reflows a block based on its contents and settings.
 * @param {boolean=} opt_bubble If false, just render this block.
 *   If true, also render block's parent, grandparent, etc.  Defaults to true.
 */
Blockly.BlockSvg.prototype.render = function(opt_bubble) {
  Blockly.Field.startCache();
  this.rendered = true;

  var cursorX = Blockly.BlockSvg.SEP_SPACE_X;
  if (this.RTL) {
    cursorX = -cursorX;
  }
  // Move the icons into position.
  var icons = this.getIcons();
  for (var i = 0; i < icons.length; i++) {
    cursorX = icons[i].renderIcon(cursorX);
  }
  cursorX += this.RTL ?
      Blockly.BlockSvg.SEP_SPACE_X : -Blockly.BlockSvg.SEP_SPACE_X;
  // If there are no icons, cursorX will be 0, otherwise it will be the
  // width that the first label needs to move over by.

  var inputRows = this.renderCompute_(cursorX);
  this.renderDraw_(cursorX, inputRows);
  this.renderMoveConnections_();

  this.renderClassify_();

  if (opt_bubble !== false) {
    // Render all blocks above this one (propagate a reflow).
    var parentBlock = this.getParent();
    if (parentBlock) {
      parentBlock.render(true);
    } else {
      // Top-most block.  Fire an event to allow scrollbars to resize.
      Blockly.resizeSvgContents(this.workspace);
    }
  }
  Blockly.Field.stopCache();
};

/**
 * Render a list of fields starting at the specified location.
 * @param {!Array.<!Blockly.Field>} fieldList List of fields.
 * @param {number} cursorX X-coordinate to start the fields.
 * @param {number} cursorY Y-coordinate around which fields are centered.
 * @param {number} rowIndex index of the current row.
 *  (pxtblockly, only need to bump fields on first row)
 * @return {number} X-coordinate of the end of the field row (plus a gap).
 * @private
 */
Blockly.BlockSvg.prototype.renderFields_ =
    function(fieldList, cursorX, cursorY, rowIndex) {
    /* eslint-disable indent */
  if (this.RTL) {
    cursorX = -cursorX;
  }
  for (var t = 0, field; field = fieldList[t]; t++) {
    var root = field.getSvgRoot();
    if (!root) {
      continue;
    }
    // In blocks with a notch, fields should be bumped to a min X,
    // to avoid overlapping with the notch. Label and image fields are
    // excluded.
    if (this.previousConnection && !(field instanceof Blockly.FieldLabel) &&
        !(field instanceof Blockly.FieldImage) && rowIndex == 0) {
      cursorX = this.RTL ?
        Math.min(cursorX, -Blockly.BlockSvg.INPUT_AND_FIELD_MIN_X) :
        Math.max(cursorX, Blockly.BlockSvg.INPUT_AND_FIELD_MIN_X);
    }
    // Offset the field upward by half its height.
    // This vertically centers the fields around cursorY.
    var yOffset = -field.getSize().height / 2;
    var translateX, translateY;
    var scale = '';
    if (this.RTL) {
      cursorX -= field.renderSep + field.renderWidth;
      translateX = cursorX;
      translateY = cursorY + yOffset;
      if (field.renderWidth) {
        cursorX -= Blockly.BlockSvg.SEP_SPACE_X;
      }
    } else {
      translateX = cursorX + field.renderSep;
      translateY = cursorY + yOffset;
      if (field.renderWidth) {
        cursorX += field.renderSep + field.renderWidth +
            Blockly.BlockSvg.SEP_SPACE_X;
      }
    }
    if (this.RTL &&
        field instanceof Blockly.FieldImage &&
        field.getFlipRTL()) {
      scale = 'scale(-1 1)';
      translateX += field.renderWidth;
    }
    root.setAttribute('transform',
      'translate(' + translateX + ', ' + translateY + ') ' + scale
    );
    // Fields are invisible on insertion marker.
    if (this.isInsertionMarker()) {
      root.setAttribute('display', 'none');
    }
  }
  return this.RTL ? -cursorX : cursorX;
}; /* eslint-enable indent */

/**
 * Computes the height and widths for each row and field.
 * @param {number} iconWidth Offset of first row due to icons.
 * @return {!Array.<!Array.<!Object>>} 2D array of objects, each containing
 *     position information.
 * @private
 */
Blockly.BlockSvg.prototype.renderCompute_ = function(iconWidth) {
  var inputList = this.inputList;
  var inputRows = [];
  // Block will be drawn from 0 (left edge) to rightEdge, in px.
  inputRows.rightEdge = 0;
  // Drawn from 0 to bottomEdge vertically.
  inputRows.bottomEdge = 0;
  var fieldValueWidth = 0;  // Width of longest external value field.
  var fieldStatementWidth = 0;  // Width of longest statement field.
  var hasValue = false;
  var hasStatement = false;
  var hasDummy = false;
  var lastType = undefined;
  var isInline = this.getInputsInline(); // (pxtblockly: supporting multi-line blocks)

  // Previously created row, for special-casing row heights on C- and E- shaped blocks.
  var previousRow;
  for (var i = 0, input; input = inputList[i]; i++) {
    if (!input.isVisible()) {
      continue;
    }
    var row;
    if (!isInline || !lastType ||
        lastType == Blockly.NEXT_STATEMENT ||
        input.type == Blockly.NEXT_STATEMENT) {
      // Create new row.
      lastType = input.type;
      row = this.createRowForInput_(input, isInline);
      inputRows.push(row);
    } else {
      row = inputRows[inputRows.length - 1];
    }
    row.push(input);

    // Compute minimum dimensions for this input.
    input.renderHeight = this.computeInputHeight_(input, row, previousRow);
    input.renderWidth = this.computeInputWidth_(input);

    // If the input is a statement input, determine if a notch
    // should be drawn at the inner bottom of the C.
    row.statementNotchAtBottom = true;
    if (input.connection && input.connection.type === Blockly.NEXT_STATEMENT) {
      var linkedBlock = input.connection.targetBlock();
      if (linkedBlock && !linkedBlock.lastConnectionInStack()) {
        row.statementNotchAtBottom = false;
      }
    }

    // Expand input size.
    if (input.connection) {
      var linkedBlock = input.connection.targetBlock();
      var paddedHeight = 0;
      var paddedWidth = 0;
      if (linkedBlock) {
        // A block is connected to the input - use its size.
        var bBox = linkedBlock.getHeightWidth();
        paddedHeight = bBox.height;
        paddedWidth = bBox.width;
      } else {
        // No block connected - use the size of the rendered empty input shape.
        paddedHeight = Blockly.BlockSvg.INPUT_SHAPE_HEIGHT;
      }
      if (input.connection.type === Blockly.INPUT_VALUE) {
        paddedHeight += 2 * Blockly.BlockSvg.INLINE_PADDING_Y;
      }
      if (input.connection.type === Blockly.NEXT_STATEMENT) {
        // Subtract height of notch, only if the last block in the stack has a next connection.
        if (row.statementNotchAtBottom) {
          paddedHeight -= Blockly.BlockSvg.NOTCH_HEIGHT;
        }
      }
      input.renderHeight = Math.max(input.renderHeight, paddedHeight);
      input.renderWidth = Math.max(input.renderWidth, paddedWidth);
    }
    row.height = Math.max(row.height, input.renderHeight);
    input.fieldWidth = 0;
    if (inputRows.length == 1) {
      // The first row gets shifted to accommodate any icons.
      input.fieldWidth += this.RTL ? -iconWidth : iconWidth;
    }
    var previousFieldEditable = false;
    for (var j = 0, field; field = input.fieldRow[j]; j++) {
      if (j != 0) {
        input.fieldWidth += Blockly.BlockSvg.SEP_SPACE_X;
      }
      // Get the dimensions of the field.
      var fieldSize = field.getSize();
      field.renderWidth = fieldSize.width;
      field.renderSep = (previousFieldEditable && field.EDITABLE) ?
          Blockly.BlockSvg.SEP_SPACE_X : 0;
      input.fieldWidth += field.renderWidth + field.renderSep;
      row.height = Math.max(row.height, fieldSize.height);
      previousFieldEditable = field.EDITABLE;
    }

    if (row.type != Blockly.BlockSvg.INLINE) {
      if (row.type == Blockly.NEXT_STATEMENT) {
        hasStatement = true;
        fieldStatementWidth = Math.max(fieldStatementWidth, input.fieldWidth);
      } else {
        if (row.type == Blockly.INPUT_VALUE) {
          hasValue = true;
        } else if (row.type == Blockly.DUMMY_INPUT) {
          hasDummy = true;
        }
        fieldValueWidth = Math.max(fieldValueWidth, input.fieldWidth);
      }
    }
    previousRow = row;
  }

  // Bottom edge is sum of row heights (pxtblockly: do this before computing
  // the padding, used for calculating padding of multi-line blocks)
  for (var i = 0; i < inputRows.length; i++) {
    inputRows.bottomEdge += inputRows[i].height;
  }

  // Compute padding for output blocks.
  // Data is attached to the row.
  this.computeOutputPadding_(inputRows);
  // Compute the statement edge.
  // This is the width of a block where statements are nested.
  inputRows.statementEdge = Blockly.BlockSvg.STATEMENT_INPUT_EDGE_WIDTH +
      fieldStatementWidth;

  // Compute the preferred right edge.
  inputRows.rightEdge = this.computeRightEdge_(inputRows.rightEdge,
      hasStatement);

  inputRows.hasValue = hasValue;
  inputRows.hasStatement = hasStatement;
  inputRows.hasDummy = hasDummy;
  return inputRows;
};

/**
 * Compute the minimum width of this input based on the connection type and
 * outputs.
 * @param {!Blockly.Input} input The input to measure.
 * @return {number} the computed width of this input.
 * @private
 */
Blockly.BlockSvg.prototype.computeInputWidth_ = function(input) {
  // Empty input shape widths.
  if (input.type == Blockly.INPUT_VALUE &&
      (!input.connection || !input.connection.isConnected())) {
    switch (input.connection.getOutputShape()) {
      case Blockly.OUTPUT_SHAPE_SQUARE:
        return Blockly.BlockSvg.INPUT_SHAPE_SQUARE_WIDTH;
      case Blockly.OUTPUT_SHAPE_ROUND:
        return Blockly.BlockSvg.INPUT_SHAPE_ROUND_WIDTH;
      case Blockly.OUTPUT_SHAPE_HEXAGONAL:
        return Blockly.BlockSvg.INPUT_SHAPE_HEXAGONAL_WIDTH;
      default:
        return 0;
    }
  } else {
    return 0;
  }
};

/**
 * Compute the minimum height of this input.
 * @param {!Blockly.Input} input The input to measure.
 * @param {!Object} row The row of the block that is currently being measured.
 * @param {!Object} previousRow The previous row of the block, which was just
 *     measured.
 * @return {number} the computed height of this input.
 * @private
 */
Blockly.BlockSvg.prototype.computeInputHeight_ = function(input, row,
    previousRow) {
  if (this.inputList.length === 1 && this.outputConnection &&
      (this.isShadow())) {
    // "Lone" field blocks are smaller.
    return Blockly.BlockSvg.MIN_BLOCK_Y_SINGLE_FIELD_OUTPUT;
  } else if (this.outputConnection) {
    // All other reporters.
    return Blockly.BlockSvg.MIN_BLOCK_Y_REPORTER;
  } else if (row.type == Blockly.NEXT_STATEMENT) {
    // Statement input.
    return Blockly.BlockSvg.MIN_STATEMENT_INPUT_HEIGHT;
  } else if (previousRow && previousRow.type == Blockly.NEXT_STATEMENT) {
    // Extra row for below statement input.
    return Blockly.BlockSvg.EXTRA_STATEMENT_ROW_Y;
  } else {
    // All other blocks.
    return Blockly.BlockSvg.MIN_BLOCK_Y;
  }
};

/**
 * Create a row for an input and associated fields.
 * @param {!Blockly.Input} input The input that the row is based on.
 * @param {boolean} isInline Whether this block has inline inputs.
 * @return {!Object} The new row, with the correct type and default sizing info.
 */
Blockly.BlockSvg.prototype.createRowForInput_ = function(input, isInline) {
  // Create new row.
  var row = [];
  if (!isInline || input.type != Blockly.NEXT_STATEMENT) {
    row.type = Blockly.BlockSvg.INLINE;
  } else {
    row.type = input.type;
  }
  row.height = 0;
  // Default padding for a block: same as separators between fields/inputs.
  row.paddingStart = Blockly.BlockSvg.SEP_SPACE_X;
  row.paddingEnd = Blockly.BlockSvg.SEP_SPACE_X;
  return row;
};

/**
 * Compute the preferred right edge of the block.
 * @param {number} curEdge The previously calculated right edge.
 * @param {boolean} hasStatement Whether this block has a statement input.
 * @return {number} The preferred right edge of the block.
 */
Blockly.BlockSvg.prototype.computeRightEdge_ = function(curEdge, hasStatement) {
  var edge = curEdge;
  if (this.previousConnection || this.nextConnection) {
    // Blocks with notches
    edge = Math.max(edge, Blockly.BlockSvg.MIN_BLOCK_X);
  } else if (this.outputConnection) {
    if (this.isShadow() && !Blockly.pxtBlocklyUtils.isShadowArgumentReporter(this)) {
      // Single-fields
      edge = Math.max(edge, Blockly.BlockSvg.MIN_BLOCK_X_SHADOW_OUTPUT);
    } else {
      // Reporters
      edge = Math.max(edge, Blockly.BlockSvg.MIN_BLOCK_X_OUTPUT);
    }
  }
  if (hasStatement) {
    // Statement blocks (C- or E- shaped) have a longer minimum width.
    edge = Math.max(edge, Blockly.BlockSvg.MIN_BLOCK_X_WITH_STATEMENT);
  }

  // Ensure insertion markers are at least insertionMarkerMinWidth_ wide.
  if (this.insertionMarkerMinWidth_ > 0) {
    edge = Math.max(edge, this.insertionMarkerMinWidth_);
  }
  return edge;
};

/**
 * For a block with output,
 * determine start and end padding, based on connected inputs.
 * Padding will depend on the shape of the output, the shape of the input,
 * and possibly the size of the input.
 * @param {!Array.<!Array.<!Object>>} inputRows Partially calculated rows.
 */
Blockly.BlockSvg.prototype.computeOutputPadding_ = function(inputRows) {
  // Only apply to blocks with outputs and not single fields (shadows).
  if (!this.getOutputShape() || !this.outputConnection ||
      (this.isShadow() && !Blockly.pxtBlocklyUtils.isShadowArgumentReporter(this))) {
    return;
  }
  // Blocks with outputs must have single row to be padded.
  // (pxtblockly: remove to support multi-line blocks)
  // if (inputRows.length > 1) {
  //   return;
  // }
  var shape = this.getOutputShape();
  // pxtblockly: add padding for each row (multi-line blocks)
  for (var y = 0, row; row = inputRows[y]; y++) {
    // Reset any padding: it's about to be set.
    row.paddingStart = 0;
    row.paddingEnd = 0;
    // Start row padding: based on first input or first field.
    var firstInput = row[0];
    var firstField = firstInput.fieldRow[0];
    var otherShape;
    // In checking the left/start side, a field takes precedence over any input.
    // That's because a field will be rendered before any value input.
    if (firstField) {
      otherShape = 0; // Field comes first in the row.
    } else {
      // Value input comes first in the row.
      var inputConnection = firstInput.connection;
      if (!inputConnection.targetConnection) {
        // Not connected: use the drawn shape.
        otherShape = inputConnection.getOutputShape();
      } else {
        // Connected: use the connected block's output shape.
        otherShape = inputConnection.targetConnection.getSourceBlock().getOutputShape();
      }
      // Special case for hexagonal output: if the connection is larger height
      // than a standard reporter, add some start padding.
      // https://github.com/LLK/scratch-blocks/issues/376
      if (shape == Blockly.OUTPUT_SHAPE_HEXAGONAL &&
          otherShape != Blockly.OUTPUT_SHAPE_HEXAGONAL) {
        var deltaHeight = firstInput.renderHeight - Blockly.BlockSvg.MIN_BLOCK_Y_REPORTER;
        // One grid unit per level of nesting.
        row.paddingStart += deltaHeight / 2;
      }
    }
    row.paddingStart += Blockly.BlockSvg.SHAPE_IN_SHAPE_PADDING[shape][otherShape];
    // End row padding: based on last input or last field.
    var lastInput = row[row.length - 1];
    // In checking the right/end side, any value input takes precedence over any field.
    // That's because fields are rendered before inputs...the last item
    // in the row will be an input, if one exists.
    if (lastInput.connection) {
      // Value input last in the row.
      var inputConnection = lastInput.connection;
      if (!inputConnection.targetConnection) {
        // Not connected: use the drawn shape.
        otherShape = inputConnection.getOutputShape();
      } else {
        // Connected: use the connected block's output shape.
        otherShape = inputConnection.targetConnection.getSourceBlock().getOutputShape();
      }
      // Special case for hexagonal output: if the connection is larger height
      // than a standard reporter, add some end padding.
      // https://github.com/LLK/scratch-blocks/issues/376
      if (shape == Blockly.OUTPUT_SHAPE_HEXAGONAL &&
          otherShape != Blockly.OUTPUT_SHAPE_HEXAGONAL) {
        var deltaHeight = lastInput.renderHeight - Blockly.BlockSvg.MIN_BLOCK_Y_REPORTER;
        // One grid unit per level of nesting.
        row.paddingEnd += deltaHeight / 2;
      }
    } else {
      // No input in this row - mark as field.
      otherShape = 0;
    }
    // pxtblockly: custom padding end to support multi-line blocks
    row.paddingEnd += Blockly.BlockSvg.SHAPE_IN_SHAPE_PADDING[shape][otherShape];
    if (shape == Blockly.OUTPUT_SHAPE_ROUND && inputRows.length > 1 && inputRows.bottomEdge > 0) {
      // Multi-line reporter blocks need extra padding
      // assumes the edge of the circle clamps 2 units vertically at the start of the block
      var radius = inputRows.bottomEdge / 2;
      var topPad = Blockly.BlockSvg.GRID_UNIT * 2;
      var roundPad = radius * (1 - Math.sin(Math.acos((radius - topPad) / radius)));
      row.paddingStart += roundPad;
      row.paddingEnd += roundPad;
    }
  }
};

/**
 * Draw the path of the block.
 * Move the fields to the correct locations.
 * @param {number} iconWidth Offset of first row due to icons.
 * @param {!Array.<!Array.<!Object>>} inputRows 2D array of objects, each
 *     containing position information.
 * @private
 */
Blockly.BlockSvg.prototype.renderDraw_ = function(iconWidth, inputRows) {
  this.startHat_ = false;
  // Should the top left corners be rounded or square?
  // Currently, it is squared only if it's a hat.
  this.squareTopLeftCorner_ = false;
  // pxtblockly: support a starthat on blocks that have it enabled
  if (!this.outputConnection && !this.previousConnection
      && (Blockly.BlockSvg.START_HAT || this.getStartHat())) {
    // No output or previous connection.
    this.squareTopLeftCorner_ = true;
    this.startHat_ = true;
    inputRows.rightEdge = Math.max(inputRows.rightEdge, 100);
  }

  // Amount of space to skip drawing the top and bottom,
  // to make room for the left and right to draw shapes (curves or angles).
  this.edgeShapeWidth_ = 0;
  this.edgeShape_ = null;
  if (this.outputConnection) {
    // Width of the curve/pointy-curve
    var shape = this.getOutputShape();
    if (shape === Blockly.OUTPUT_SHAPE_HEXAGONAL || shape === Blockly.OUTPUT_SHAPE_ROUND) {
      this.edgeShapeWidth_ = inputRows.bottomEdge / 2;
      this.edgeShape_ = shape;
      this.squareTopLeftCorner_ = true;
    }
  }

  // Assemble the block's path.
  var steps = [];

  this.renderDrawTop_(steps, inputRows.rightEdge);
  var cursorY = this.renderDrawRight_(steps, inputRows, iconWidth);
  this.renderDrawBottom_(steps, cursorY);
  this.renderDrawLeft_(steps);

  var pathString = steps.join(' ');
  this.svgPath_.setAttribute('d', pathString);
  if (this.svgPathWarningHighlight_) {this.svgPathWarningHighlight_.setAttribute('d', pathString);}
  if (this.svgPathHighlight_) {this.svgPathHighlight_.setAttribute('d', pathString);}
  if (this.svgPathSelected_) {this.svgPathSelected_.setAttribute('d', pathString);}

  if (this.RTL) {
    // Mirror the block's path.
    // This is awesome.
    this.svgPath_.setAttribute('transform', 'scale(-1 1)');
    if (this.svgPathWarningHighlight_) {this.svgPathWarningHighlight_.setAttribute('transform', 'scale(-1 1)');}
    if (this.svgPathHighlight_) {this.svgPathHighlight_.setAttribute('transform', 'scale(-1 1)');}
    if (this.svgPathSelected_) {this.svgPathSelected_.setAttribute('transform', 'scale(-1 1)');}
  }
};

/**
 * Give the block an attribute 'data-shapes' that lists its shape[s], and an
 *     attribute 'data-category' with its category.
 * @private
 */
Blockly.BlockSvg.prototype.renderClassify_ = function() {
  var shapes = [];

  if (this.outputConnection) {
    if (this.isShadow_) {
      shapes.push('argument');
    } else {
      shapes.push('reporter');
    }
    if (this.edgeShape_ === Blockly.OUTPUT_SHAPE_HEXAGONAL) {
      shapes.push('boolean');
    } else if (this.edgeShape_ === Blockly.OUTPUT_SHAPE_ROUND) {
      shapes.push('round');
    }
  } else {
    // count the number of statement inputs
    var inputList = this.inputList;
    var statementCount = 0;
    for (var i = 0, input; input = inputList[i]; i++) {
      if (input.connection && input.connection.type === Blockly.NEXT_STATEMENT) {
        statementCount++;
      }
    }

    if (statementCount) {
      shapes.push('c-block');
      shapes.push('c-' + statementCount);
    }
    if (this.startHat_) {
      shapes.push('hat'); // c-block+hats are possible (e.x. reprter procedures)
    } else if (!statementCount) {
      shapes.push('stack'); //only call it "stack" if it's not a c-block
    }
    if (!this.nextConnection) {
      shapes.push('end');
    }
  }

  this.svgGroup_.setAttribute('data-shapes', shapes.join(' '));

  /*
  if (this.getCategory()) {
    this.svgGroup_.setAttribute('data-category', this.getCategory());
  }*/
};

/**
 * Render the top edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {number} rightEdge Minimum width of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawTop_ = function(steps, rightEdge) {
  /* eslint-disable indent */
  // Position the cursor at the top-left starting point.
  if (this.squareTopLeftCorner_) {
    steps.push('m 0,0');
    if (this.startHat_) {
      steps.push(Blockly.BlockSvg.START_HAT_PATH);
    }
    // Skip space for the output shape
    if (this.edgeShapeWidth_) {
      steps.push('m ' + this.edgeShapeWidth_ + ',0');
    }
  } else {
    steps.push(Blockly.BlockSvg.TOP_LEFT_CORNER_START);
    // Top-left rounded corner.
    steps.push(Blockly.BlockSvg.TOP_LEFT_CORNER);
  }

  // Top edge.
  if (this.previousConnection) {
    // Space before the notch
    steps.push('H', Blockly.BlockSvg.NOTCH_START_PADDING);
    steps.push(Blockly.BlockSvg.NOTCH_PATH_LEFT);
    // Create previous block connection.
    var connectionX = (this.RTL ?
        -Blockly.BlockSvg.NOTCH_WIDTH : Blockly.BlockSvg.NOTCH_WIDTH);
    this.previousConnection.setOffsetInBlock(connectionX, 0);
  }
  this.width = rightEdge;
};  /* eslint-enable indent */

/**
 * Render the right edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {!Array.<!Array.<!Object>>} inputRows 2D array of objects, each
 *     containing position information.
 * @param {number} iconWidth Offset of first row due to icons.
 * @return {number} Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawRight_ = function(steps,
    inputRows, iconWidth) {
  var cursorX = 0;
  var cursorY = 0;
  var connectionX, connectionY;
  // pxtblockly: we assume that a block maybe a sequence of INLINE blocks,
  // followed by a sequence of statement blocks
  // any kind of mixed bag of those 2 kind of entries is not supported
  var rowHeight = 0;
  var prevCursorX = 0;
  var this_ = this;

  // pxtblockly: align all row right edges together
  function flushRows() {
    // rowHeight will be positive if inline blocks have been rendered,
    // render a single line on the right
    if (rowHeight > 0) {
      if (!this_.edgeShape_) {
        // Include corner radius in drawing the horizontal line.
        steps.push('H', prevCursorX - Blockly.BlockSvg.CORNER_RADIUS - this_.edgeShapeWidth_);
        steps.push(Blockly.BlockSvg.TOP_RIGHT_CORNER);
      } else {
        // Don't include corner radius - no corner (edge shape drawn).
        steps.push('H', prevCursorX - this_.edgeShapeWidth_);
      }
      // Subtract CORNER_RADIUS * 2 to account for the top right corner
      // and also the bottom right corner. Only move vertically the non-corner length.
      if (!this_.edgeShape_) {
        steps.push('v', rowHeight - Blockly.BlockSvg.CORNER_RADIUS * 2);
      }
      rowHeight = 0;
    }
  }

  for (var y = 0, row; row = inputRows[y]; y++) {
    cursorX = row.paddingStart;
    if (y == 0) {
      cursorX += this.RTL ? -iconWidth : iconWidth;
    }
    if (row.type == Blockly.BlockSvg.INLINE) {
      // Inline inputs.
      for (var x = 0, input; input = row[x]; x++) {
        // Align fields vertically within the row.
        // Moves the field to half of the row's height.
        // In renderFields_, the field is further centered
        // by its own rendered height.
        var fieldY = cursorY + row.height / 2;
        var fieldX = Blockly.BlockSvg.getAlignedCursor_(cursorX, input,
            inputRows.rightEdge);

        cursorX = this.renderFields_(input.fieldRow, fieldX, fieldY, y);
        if (input.type == Blockly.INPUT_VALUE) {
          // Create inline input connection.
          // In blocks with a notch, inputs should be bumped to a min X,
          // to avoid overlapping with the notch.
          if (this.previousConnection) {
            cursorX = Math.max(cursorX, Blockly.BlockSvg.INPUT_AND_FIELD_MIN_X);
          }
          connectionX = this.RTL ? -cursorX : cursorX;
          // Attempt to center the connection vertically.
          var connectionYOffset = row.height / 2;
          connectionY = cursorY + connectionYOffset;
          input.connection.setOffsetInBlock(connectionX, connectionY);
          this.renderInputShape_(input, cursorX, cursorY + connectionYOffset);
          cursorX += input.renderWidth + Blockly.BlockSvg.SEP_SPACE_X;

          // pxtblockly: Used for calculating multiple connection points
          input.connection.renderedWidth_ = input.renderWidth;
        }
      }
      // Remove final separator and replace it with right-padding.
      cursorX -= Blockly.BlockSvg.SEP_SPACE_X;
      cursorX += row.paddingEnd;
      // Update right edge for all inputs, such that all rows
      // stretch to be at least the size of all previous rows.
      inputRows.rightEdge = Math.max(cursorX, inputRows.rightEdge);
      // Move to the right edge
      cursorX = Math.max(cursorX, inputRows.rightEdge);
      this.width = Math.max(this.width, cursorX);
      // pxtblockly: keep track of row height
      rowHeight += row.height;
      prevCursorX = cursorX;
    } else if (row.type == Blockly.NEXT_STATEMENT) {
      // pxtblockly:
      flushRows();
      // Nested statement.
      var input = row[0];
      var fieldX = cursorX;
      // Align fields vertically within the row.
      // In renderFields_, the field is further centered by its own height.
      var fieldY = cursorY;
      fieldY += Blockly.BlockSvg.MIN_STATEMENT_INPUT_HEIGHT / 2;
      this.renderFields_(input.fieldRow, fieldX, fieldY, y);
      // Move to the start of the notch.
      cursorX = inputRows.statementEdge + Blockly.BlockSvg.NOTCH_WIDTH;

      Blockly.BlockSvg.drawStatementInputFromTopRight_(steps, cursorX,
          inputRows.rightEdge, row);

      // Create statement connection.
      connectionX = this.RTL ? -cursorX : cursorX;
      input.connection.setOffsetInBlock(connectionX, cursorY);
      if (input.connection.isConnected()) {
        this.width = Math.max(this.width, inputRows.statementEdge +
          input.connection.targetBlock().getHeightWidth().width);
      }
      if (y == inputRows.length - 1 ||
          inputRows[y + 1].type == Blockly.NEXT_STATEMENT) {
        // If the final input is a statement stack, add a small row underneath.
        // Consecutive statement stacks are also separated by a small divider.
        steps.push(Blockly.BlockSvg.TOP_RIGHT_CORNER);
        steps.push('v', Blockly.BlockSvg.EXTRA_STATEMENT_ROW_Y - 2 * Blockly.BlockSvg.CORNER_RADIUS);
        cursorY += Blockly.BlockSvg.EXTRA_STATEMENT_ROW_Y;
      }
    }
    cursorY += row.height;
  }
  // pxtblockly:
  flushRows();
  this.drawEdgeShapeRight_(steps);
  if (!inputRows.length) {
    cursorY = Blockly.BlockSvg.MIN_BLOCK_Y;
    steps.push('V', cursorY);
  }
  return cursorY;
};

/**
 * Render the input shapes.
 * If there's a connected block, hide the input shape.
 * Otherwise, draw and set the position of the input shape.
 * @param {!Blockly.Input} input Input to be rendered.
 * @param {Number} x X offset of input.
 * @param {Number} y Y offset of input.
 */
Blockly.BlockSvg.prototype.renderInputShape_ = function(input, x, y) {
  var inputShape = input.outlinePath;
  if (!inputShape) {
    // No input shape for this input - e.g., the block is an insertion marker.
    return;
  }
  // Input shapes are only visibly rendered on non-connected slots.
  if (input.connection.targetConnection) {
    inputShape.setAttribute('style', 'visibility: hidden');
  } else {
    var inputShapeX = 0, inputShapeY = 0;
    var inputShapeInfo =
        Blockly.BlockSvg.getInputShapeInfo_(input.connection.getOutputShape());
    if (this.RTL) {
      inputShapeX = -x - inputShapeInfo.width;
    } else {
      inputShapeX = x;
    }
    inputShapeY = y - (Blockly.BlockSvg.INPUT_SHAPE_HEIGHT / 2);
    inputShape.setAttribute('d', inputShapeInfo.path);
    inputShape.setAttribute('transform',
        'translate(' + inputShapeX + ',' + inputShapeY + ')'
    );
    inputShape.setAttribute('data-argument-type', inputShapeInfo.argType);
    inputShape.setAttribute('style', 'visibility: visible');
  }
};

/**
 * Render the bottom edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {number} cursorY Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawBottom_ = function(steps, cursorY) {
  this.height = cursorY;
  if (!this.edgeShape_) {
    steps.push(Blockly.BlockSvg.BOTTOM_RIGHT_CORNER);
  }
  if (this.nextConnection) {
    // Move to the right-side of the notch.
    var notchStart = (
      Blockly.BlockSvg.NOTCH_WIDTH +
      Blockly.BlockSvg.NOTCH_START_PADDING +
      Blockly.BlockSvg.CORNER_RADIUS
    );
    steps.push('H', notchStart, ' ');
    steps.push(Blockly.BlockSvg.NOTCH_PATH_RIGHT);
    // Create next block connection.
    var connectionX = this.RTL ? -Blockly.BlockSvg.NOTCH_WIDTH :
        Blockly.BlockSvg.NOTCH_WIDTH;
    this.nextConnection.setOffsetInBlock(connectionX, cursorY);
    // Include height of notch in block height.
    this.height += Blockly.BlockSvg.NOTCH_HEIGHT;
  }
  // Bottom horizontal line
  if (!this.edgeShape_) {
    steps.push('H', Blockly.BlockSvg.CORNER_RADIUS);
    // Bottom left corner
    steps.push(Blockly.BlockSvg.BOTTOM_LEFT_CORNER);
  } else {
    steps.push('H', this.edgeShapeWidth_);
  }
};

/**
 * Render the left edge of the block.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {number} cursorY Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawLeft_ = function(steps) {
  if (this.outputConnection) {
    // Scratch-style reporters have output connection y at half block height.
    this.outputConnection.setOffsetInBlock(0, this.height / 2);
  }
  if (this.edgeShape_) {
    // Draw the left-side edge shape.
    if (this.edgeShape_ === Blockly.OUTPUT_SHAPE_ROUND) {
      // Draw a rounded arc.
      steps.push('a ' + this.edgeShapeWidth_ + ' ' + this.edgeShapeWidth_ + ' 0 0 1 0 -' + this.edgeShapeWidth_ * 2);
    } else if (this.edgeShape_ === Blockly.OUTPUT_SHAPE_HEXAGONAL) {
      // Draw a half-hexagon.
      steps.push('l ' + -this.edgeShapeWidth_ + ' ' + -this.edgeShapeWidth_ +
        ' l ' + this.edgeShapeWidth_ + ' ' + -this.edgeShapeWidth_);
    }
  }
  steps.push('z');
};

/**
 * Draw the edge shape (rounded or hexagonal) on the right side of a block with
 * an output.
 * @param {!Array.<string>} steps Path of block outline.
 * @private
 */
Blockly.BlockSvg.prototype.drawEdgeShapeRight_ = function(steps) {
  if (this.edgeShape_) {
    // Draw the right-side edge shape.
    if (this.edgeShape_ === Blockly.OUTPUT_SHAPE_ROUND) {
      // Draw a rounded arc.
      steps.push('a ' + this.edgeShapeWidth_ + ' ' + this.edgeShapeWidth_ +
          ' 0 0 1 0 ' + this.edgeShapeWidth_ * 2);
    } else if (this.edgeShape_ === Blockly.OUTPUT_SHAPE_HEXAGONAL) {
      // Draw an half-hexagon.
      steps.push('l ' + this.edgeShapeWidth_ + ' ' + this.edgeShapeWidth_ +
          ' l ' + -this.edgeShapeWidth_ + ' ' + this.edgeShapeWidth_);
    }
  }
};

/**
 * Position an new block correctly, so that it doesn't move the existing block
 * when connected to it.
 * @param {!Blockly.Block} newBlock The block to position - either the first
 *     block in a dragged stack or an insertion marker.
 * @param {!Blockly.Connection} newConnection The connection on the new block's
 *     stack - either a connection on newBlock, or the last NEXT_STATEMENT
 *     connection on the stack if the stack's being dropped before another
 *     block.
 * @param {!Blockly.Connection} existingConnection The connection on the
 *     existing block, which newBlock should line up with.
 */
Blockly.BlockSvg.prototype.positionNewBlock =
    function(newBlock, newConnection, existingConnection) {
    /* eslint-disable indent */
  // We only need to position the new block if it's before the existing one,
  // otherwise its position is set by the previous block.
  if (newConnection.type == Blockly.NEXT_STATEMENT) {
    var dx = existingConnection.x_ - newConnection.x_;
    var dy = existingConnection.y_ - newConnection.y_;

    newBlock.moveBy(dx, dy);
  }
};  /* eslint-enable indent */

/**
 * Draw the outline of a statement input, starting at the top right corner.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {number} cursorX The x position of the start of the notch at the top
 *     of the input.
 * @param {number} rightEdge The far right edge of the block, which determines
 *     how wide the statement input is.
 * @param {!Array.<!Object>} row An object containing information about the
 *     current row, including its height and whether it should have a notch at
 *     the bottom.
 * @private
 */
Blockly.BlockSvg.drawStatementInputFromTopRight_ = function(steps, cursorX,
    rightEdge, row) {
  Blockly.BlockSvg.drawStatementInputTop_(steps, cursorX);
  steps.push('v', row.height - 2 * Blockly.BlockSvg.CORNER_RADIUS);
  Blockly.BlockSvg.drawStatementInputBottom_(steps, rightEdge, row);
};

/**
 * Draw the top of the outline of a statement input, starting at the top right
 * corner.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {number} cursorX The x position of the start of the notch at the top
 *     of the input.
 * @private
 */
Blockly.BlockSvg.drawStatementInputTop_ = function(steps, cursorX) {
  steps.push(Blockly.BlockSvg.BOTTOM_RIGHT_CORNER);
  steps.push('H', cursorX + Blockly.BlockSvg.STATEMENT_INPUT_INNER_SPACE +
    2 * Blockly.BlockSvg.CORNER_RADIUS);
  steps.push(Blockly.BlockSvg.NOTCH_PATH_RIGHT);
  steps.push('h', '-' + Blockly.BlockSvg.STATEMENT_INPUT_INNER_SPACE);
  steps.push(Blockly.BlockSvg.INNER_TOP_LEFT_CORNER);
};

/**
 * Draw the bottom of the outline of a statement input, starting at the inner
 * left corner.
 * @param {!Array.<string>} steps Path of block outline.
 * @param {number} rightEdge The far right edge of the block, which determines
 *     how wide the statement input is.
 * @param {!Array.<!Object>} row An object containing information about the
 *     current row, including its height and whether it should have a notch at
 *     the bottom.
 * @private
 */
Blockly.BlockSvg.drawStatementInputBottom_ = function(steps, rightEdge, row) {
  steps.push(Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER);
  if (row.statementNotchAtBottom) {
    steps.push('h ', Blockly.BlockSvg.STATEMENT_INPUT_INNER_SPACE);
    steps.push(Blockly.BlockSvg.NOTCH_PATH_LEFT);
  }
  steps.push('H', rightEdge - Blockly.BlockSvg.CORNER_RADIUS);
};

/**
 * Get some information about the input shape to draw, based on the type of the
 * connection.
 * @param {number} shape An enum representing the shape of the connection we're
 *     drawing around.
 * @return {!Object} An object containing an SVG path, a string representation
 *     of the argument type, and a width.
 * @private
 */
Blockly.BlockSvg.getInputShapeInfo_ = function(shape) {
  var inputShapePath = null;
  var inputShapeArgType = null;
  var inputShapeWidth = 0;

  switch (shape) {
    case Blockly.OUTPUT_SHAPE_HEXAGONAL:
      inputShapePath = Blockly.BlockSvg.INPUT_SHAPE_HEXAGONAL;
      inputShapeWidth = Blockly.BlockSvg.INPUT_SHAPE_HEXAGONAL_WIDTH;
      inputShapeArgType = 'boolean';
      break;
    case Blockly.OUTPUT_SHAPE_ROUND:
      inputShapePath = Blockly.BlockSvg.INPUT_SHAPE_ROUND;
      inputShapeWidth = Blockly.BlockSvg.INPUT_SHAPE_ROUND_WIDTH;
      inputShapeArgType = 'round';
      break;
    case Blockly.OUTPUT_SHAPE_SQUARE:
    default:  // If the input connection is not connected, draw a hole shape.
      inputShapePath = Blockly.BlockSvg.INPUT_SHAPE_SQUARE;
      inputShapeWidth = Blockly.BlockSvg.INPUT_SHAPE_SQUARE_WIDTH;
      inputShapeArgType = 'square';
      break;
  }
  return {
    path: inputShapePath,
    argType: inputShapeArgType,
    width: inputShapeWidth
  };
};

/**
 * Get the correct cursor position for the given input, based on alignment,
 * the total size of the block, and the size of the input.
 * @param {number} cursorX The minimum x value of the cursor.
 * @param {!Blockly.Input} input The input to align the fields for.
 * @param {number} rightEdge The maximum width of the block.  Right-aligned
 *     fields are positioned based on this number.
 * @return {number} The new cursor position.
 * @private
 */
Blockly.BlockSvg.getAlignedCursor_ = function(cursorX, input, rightEdge) {
  // Align inline field rows (left/right/centre).
  if (input.align === Blockly.ALIGN_RIGHT) {
    cursorX = Math.max(cursorX, rightEdge - input.fieldWidth - Blockly.BlockSvg.SEP_SPACE_X);
  } else if (input.align === Blockly.ALIGN_CENTRE) {
    cursorX = Math.max(cursorX, rightEdge / 2 - input.fieldWidth / 2);
  }
  return cursorX;
};

/**
 * Update all of the connections on this block with the new locaitons calculated
 * in renderCompute, and move all of the connected blocks based on the new
 * connection locations.
 * @private
 */
Blockly.BlockSvg.prototype.renderMoveConnections_ = function() {
  var blockTL = this.getRelativeToSurfaceXY();
  // Don't tighten previous or output connections because they are inferior.
  if (this.previousConnection) {
    this.previousConnection.moveToOffset(blockTL);
  }
  if (this.outputConnection) {
    this.outputConnection.moveToOffset(blockTL);
  }

  for (var i = 0; i < this.inputList.length; i++) {
    var conn = this.inputList[i].connection;
    if (conn) {
      conn.moveToOffset(blockTL);
      if (conn.isConnected()) {
        conn.tighten_();
      }
    }
  }

  if (this.nextConnection) {
    this.nextConnection.moveToOffset(blockTL);
    if (this.nextConnection.isConnected()) {
      this.nextConnection.tighten_();
    }
  }
};
