/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
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

goog.provide('Blockly.BlockSvg.render');

goog.require('Blockly.BlockSvg');


/**
 * An object that holds information about the paths that are used to render the
 * block.  Each path is built up as an array of steps during the render process.
 * The arrays are then turned into strings, which are set in the block's SVG.
 * @constructor
 * @struct
 * @private
 */
Blockly.BlockSvg.PathObject = function() {
  /**
   * The primary outline of the block.
   * @type {!Array.<string|number>}
   */
  this.steps = [];

  /**
   * The highlight on the primary outline of the block.
   * @type {!Array.<string|number>}
   */
  this.highlightSteps = [];

  /**
   * The holes in the block for inline inputs.
   * @type {!Array.<string|number>}
   */
  this.inlineSteps = [];

  /**
   * The highlights on holes in the block for inline inputs.
   * @type {!Array.<string|number>}
   */
  this.highlightInlineSteps = [];
};

// UI constants for rendering blocks.
/**
 * Horizontal space between elements.
 * @const
 */
Blockly.BlockSvg.SEP_SPACE_X = 10;

/**
 * Vertical space between elements.
 * @const
 */
Blockly.BlockSvg.SEP_SPACE_Y = 10;

/**
 * Vertical padding around inline elements.
 * @const
 */
Blockly.BlockSvg.INLINE_PADDING_Y = 5;

/**
 * Minimum height of a block.
 * @const
 */
Blockly.BlockSvg.MIN_BLOCK_Y = 25;

/**
 * Minimum height of a block, if it has a picture.
 * @const
 */
Blockly.BlockSvg.MIN_BLOCK_Y_WITH_PICTURE = 55;

/**
 * Height of horizontal puzzle tab.
 * @const
 */
Blockly.BlockSvg.TAB_HEIGHT = 22.5;
/**
 * Width of horizontal puzzle tab.
 * @const
 */
Blockly.BlockSvg.TAB_WIDTH = 8;
/**
 * Width of vertical tab (inc left margin).
 * @const
 */
Blockly.BlockSvg.NOTCH_WIDTH = 30;
/**
 * Rounded corner radius.
 * @const
 */
Blockly.BlockSvg.CORNER_RADIUS = 8;
/**
 * Do blocks with no previous or output connections have a 'hat' on top?
 * @const
 */
Blockly.BlockSvg.START_HAT = false;
/**
 * Height of the top hat.
 * @const
 */
Blockly.BlockSvg.START_HAT_HEIGHT = 15;
/**
 * Path of the top hat's curve.
 * @const
 */
Blockly.BlockSvg.START_HAT_PATH = 'c 30,-' +
    Blockly.BlockSvg.START_HAT_HEIGHT + ' 70,-' +
    Blockly.BlockSvg.START_HAT_HEIGHT + ' 100,0';
/**
 * Path of the top hat's curve's highlight in LTR.
 * @const
 */
Blockly.BlockSvg.START_HAT_HIGHLIGHT_LTR =
    'c 17.8,-9.2 45.3,-14.9 75,-8.7 M 100.5,0.5';
/**
 * Path of the top hat's curve's highlight in RTL.
 * @const
 */
Blockly.BlockSvg.START_HAT_HIGHLIGHT_RTL =
    'm 25,-8.7 c 29.7,-6.2 57.2,-0.5 75,8.7';
/**
 * Distance from shape edge to intersect with a curved corner at 45 degrees.
 * Applies to highlighting on around the inside of a curve.
 * @const
 */
Blockly.BlockSvg.DISTANCE_45_INSIDE = (1 - Math.SQRT1_2) *
    (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + 0.5;
/**
 * Distance from shape edge to intersect with a curved corner at 45 degrees.
 * Applies to highlighting on around the outside of a curve.
 * @const
 */
Blockly.BlockSvg.DISTANCE_45_OUTSIDE = (1 - Math.SQRT1_2) *
    (Blockly.BlockSvg.CORNER_RADIUS + 0.5) - 0.5;
/**
 * SVG path for drawing next/previous notch from left to right.
 * @const
 */
Blockly.BlockSvg.NOTCH_PATH_LEFT = 'l 7,4 2,0 7,-4';
/**
 * SVG path for drawing next/previous notch from left to right with
 * highlighting.
 * @const
 */
Blockly.BlockSvg.NOTCH_PATH_LEFT_HIGHLIGHT = 'l 7,4 2,0 7,-4';
/**
 * SVG path for drawing next/previous notch from right to left.
 * @const
 */
Blockly.BlockSvg.NOTCH_PATH_RIGHT = 'l -7,4 -2,0 -7,-4';
/**
 * SVG path for drawing jagged teeth at the end of collapsed blocks.
 * @const
 */
Blockly.BlockSvg.JAGGED_TEETH = 'l 8,0 0,4 8,4 -16,8 8,4';
/**
 * Height of SVG path for jagged teeth at the end of collapsed blocks.
 * @const
 */
Blockly.BlockSvg.JAGGED_TEETH_HEIGHT = 20;
/**
 * Width of SVG path for jagged teeth at the end of collapsed blocks.
 * @const
 */
Blockly.BlockSvg.JAGGED_TEETH_WIDTH = 15;
/**
 * SVG path for drawing a horizontal puzzle tab from top to bottom.
 * @const
 */
Blockly.BlockSvg.TAB_PATH_DOWN = 'v 7.5 c 0,10 -' + Blockly.BlockSvg.TAB_WIDTH +
    ',-8 -' + Blockly.BlockSvg.TAB_WIDTH + ',7.5 s ' +
    Blockly.BlockSvg.TAB_WIDTH + ',-2.5 ' + Blockly.BlockSvg.TAB_WIDTH + ',7.5';
/**
 * SVG path for drawing a horizontal puzzle tab from top to bottom with
 * highlighting from the upper-right.
 * @const
 */
Blockly.BlockSvg.TAB_PATH_DOWN_HIGHLIGHT_RTL = 'v 6.5 m -' +
    (Blockly.BlockSvg.TAB_WIDTH * 0.97) + ',3 q -' +
    (Blockly.BlockSvg.TAB_WIDTH * 0.05) + ',10 ' +
    (Blockly.BlockSvg.TAB_WIDTH * 0.3) + ',9.5 m ' +
    (Blockly.BlockSvg.TAB_WIDTH * 0.67) + ',-1.9 v 1.4';

/**
 * SVG start point for drawing the top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_START =
    'm 0,' + Blockly.BlockSvg.CORNER_RADIUS;
/**
 * SVG start point for drawing the top-left corner's highlight in RTL.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_RTL =
    'm ' + Blockly.BlockSvg.DISTANCE_45_INSIDE + ',' +
    Blockly.BlockSvg.DISTANCE_45_INSIDE;
/**
 * SVG start point for drawing the top-left corner's highlight in LTR.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_LTR =
    'm 0.5,' + (Blockly.BlockSvg.CORNER_RADIUS - 0.5);
/**
 * SVG path for drawing the rounded top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER =
    'A ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,1 ' +
    Blockly.BlockSvg.CORNER_RADIUS + ',0';
/**
 * SVG path for drawing the highlight on the rounded top-left corner.
 * @const
 */
Blockly.BlockSvg.TOP_LEFT_CORNER_HIGHLIGHT =
    'A ' + (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + ' 0 0,1 ' +
    Blockly.BlockSvg.CORNER_RADIUS + ',0.5';
/**
 * SVG path for drawing the top-left corner of a statement input.
 * Includes the top notch, a horizontal space, and the rounded inside corner.
 * @const
 */
Blockly.BlockSvg.INNER_TOP_LEFT_CORNER =
    Blockly.BlockSvg.NOTCH_PATH_RIGHT + ' h -' +
    (Blockly.BlockSvg.NOTCH_WIDTH - 15 - Blockly.BlockSvg.CORNER_RADIUS) +
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
 * SVG path for drawing highlight on the top-left corner of a statement
 * input in RTL.
 * @const
 */
Blockly.BlockSvg.INNER_TOP_LEFT_CORNER_HIGHLIGHT_RTL =
    'a ' + Blockly.BlockSvg.CORNER_RADIUS + ',' +
    Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,0 ' +
    (-Blockly.BlockSvg.DISTANCE_45_OUTSIDE - 0.5) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS -
    Blockly.BlockSvg.DISTANCE_45_OUTSIDE);
/**
 * SVG path for drawing highlight on the bottom-left corner of a statement
 * input in RTL.
 * @const
 */
Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_RTL =
    'a ' + (Blockly.BlockSvg.CORNER_RADIUS + 0.5) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS + 0.5) + ' 0 0,0 ' +
    (Blockly.BlockSvg.CORNER_RADIUS + 0.5) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS + 0.5);
/**
 * SVG path for drawing highlight on the bottom-left corner of a statement
 * input in LTR.
 * @const
 */
Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_LTR =
    'a ' + (Blockly.BlockSvg.CORNER_RADIUS + 0.5) + ',' +
    (Blockly.BlockSvg.CORNER_RADIUS + 0.5) + ' 0 0,0 ' +
    (Blockly.BlockSvg.CORNER_RADIUS -
    Blockly.BlockSvg.DISTANCE_45_OUTSIDE) + ',' +
    (Blockly.BlockSvg.DISTANCE_45_OUTSIDE + 0.5);

/**
 * Returns a bounding box describing the dimensions of this block
 * and any blocks stacked below it.
 * @return {!{height: number, width: number}} Object with height and width
 *    properties in workspace units.
 */
Blockly.BlockSvg.prototype.getHeightWidth = function() {
  var height = this.height;
  var width = this.width;
  // Recursively add size of subsequent blocks.
  var nextBlock = this.getNextBlock();
  if (nextBlock) {
    var nextHeightWidth = nextBlock.getHeightWidth();
    height += nextHeightWidth.height - 4;  // Height of tab.
    width = Math.max(width, nextHeightWidth.width);
  } else if (!this.nextConnection && !this.outputConnection) {
    // Add a bit of margin under blocks with no bottom tab.
    height += 2;
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
  inputRows = this.renderComputeSpacing_(inputRows);
  this.renderDraw_(cursorX, inputRows);
  this.renderMoveConnections_();

  if (opt_bubble !== false) {
    // Render all blocks above this one (propagate a reflow).
    var parentBlock = this.getParent();
    if (parentBlock) {
      parentBlock.render(true);
    } else {
      // Top-most block.  Fire an event to allow scrollbars to resize.
      this.workspace.resizeContents();
    }
  }
  Blockly.Field.stopCache();
};

/**
 * Render a list of fields starting at the specified location.
 * @param {!Array.<!Blockly.Field>} fieldList List of fields.
 * @param {number} cursorX X-coordinate to start the fields.
 * @param {number} cursorY Y-coordinate to start the fields.
 * @param {number} rowHeight Height of the entire row. Used to vertically align elements.
 * @return {number} X-coordinate of the end of the field row (plus a gap).
 * @private
 */
Blockly.BlockSvg.prototype.renderFields_ = function(fieldList,
    cursorX, cursorY, rowHeight) {
  // cursorY += Blockly.BlockSvg.INLINE_PADDING_Y;
  if (this.RTL) {
    cursorX = -cursorX;
  }
  for (var t = 0, field; field = fieldList[t]; t++) {
    var root = field.getSvgRoot();
    if (!root) {
      continue;
    }

    //SHAPE: Calculate how much the element should be pushed down.
    //This will ensure vertical alignment.
    var yPos = cursorY;

    //Use the height_ element, if available (ex. available in FieldImage)
    if (field.height_) {
        if (field.height_ < rowHeight) {
            yPos += ((rowHeight - field.height_) / 2);
        }
    }
    //If not, use size_.height, if available (ex. most other field types)
    else if (field.size_.height) {
        if (field.size_.height < rowHeight) {
            yPos += ((rowHeight - field.size_.height) / 2);
        }
    }

    if (this.RTL) {
      cursorX -= field.renderSep + field.renderWidth;
      root.setAttribute('transform',
          'translate(' + cursorX + ',' + yPos + ')');
      if (field.renderWidth) {
        cursorX -= Blockly.BlockSvg.SEP_SPACE_X;
      }
    } else {
      root.setAttribute('transform',
          'translate(' + (cursorX + field.renderSep) + ',' + yPos + ')');
      if (field.renderWidth) {
        cursorX += field.renderSep + field.renderWidth +
            Blockly.BlockSvg.SEP_SPACE_X;
      }
    }
  }
  return this.RTL ? -cursorX : cursorX;
};

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
  inputRows.rightEdge = iconWidth + Blockly.BlockSvg.SEP_SPACE_X * 2;
  if (this.previousConnection || this.nextConnection) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge,
        Blockly.BlockSvg.NOTCH_WIDTH + Blockly.BlockSvg.SEP_SPACE_X);
  }
  var fieldValueWidth = 0;  // Width of longest external value field.
  var fieldStatementWidth = 0;  // Width of longest statement field.
  var hasValue = false;
  var hasStatement = false;
  var hasDummy = false;
  var lastType = undefined;
  var isInline = this.getInputsInline() && !this.isCollapsed();
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
      row = [];
      if (isInline && input.type != Blockly.NEXT_STATEMENT) {
        row.type = Blockly.BlockSvg.INLINE;
      } else {
        row.type = input.type;
      }
      row.height = 0;
      row.alignmentHeight = 0;
      inputRows.push(row);
    } else {
      row = inputRows[inputRows.length - 1];
    }
    row.push(input);

    // Compute minimum input size.
    input.renderHeight = Blockly.BlockSvg.MIN_BLOCK_Y;
    input.alignmentHeight = Blockly.BlockSvg.MIN_BLOCK_Y;

    // The width is currently only needed for inline value inputs.
    if (isInline && input.type == Blockly.INPUT_VALUE) {
      input.renderWidth = Blockly.BlockSvg.TAB_WIDTH +
          Blockly.BlockSvg.SEP_SPACE_X * 1.25;
    } else {
      input.renderWidth = 0;
    }
    // Expand input size if there is a connection.
    if (input.connection && input.connection.isConnected()) {
      var linkedBlock = input.connection.targetBlock();
      var bBox = linkedBlock.getHeightWidth();
      input.renderHeight = Math.max(input.renderHeight, bBox.height);
      input.alignmentHeight = Math.max(input.alignmentHeight, linkedBlock.firstRowHeight);
      input.renderWidth = Math.max(input.renderWidth, bBox.width);
      row.hasInput = true;
    }
    
    // Blocks have a one pixel shadow that should sometimes overhang.
    if (!isInline && i == inputList.length - 1) {
      // Last value input should overhang.
      input.renderHeight--;
    } else if (!isInline && input.type == Blockly.INPUT_VALUE &&
        inputList[i + 1] && inputList[i + 1].type == Blockly.NEXT_STATEMENT) {
      // Value input above statement input should overhang.
      input.renderHeight--;
    }

    row.height = Math.max(row.height, input.renderHeight);
    row.alignmentHeight = Math.max(row.alignmentHeight, input.alignmentHeight);
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
      row.alignmentHeight = Math.max(row.alignmentHeight, fieldSize.height);
      previousFieldEditable = field.EDITABLE;
      
      if (field.imageElement_) {
        row.hasImage = true;
      }
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
  }

  // Make inline rows a bit thicker in order to enclose the values.
  for (var y = 0, row; row = inputRows[y]; y++) {
    row.thicker = false;
    //SHAPE: Removed this as it makes blocks 10 pixels taller if there is another block inside them.
    // if (row.type == Blockly.BlockSvg.INLINE) {
    //   for (var z = 0, input; input = row[z]; z++) {
    //     if (input.type == Blockly.INPUT_VALUE) {
    //       row.height += 2 * Blockly.BlockSvg.INLINE_PADDING_Y;
    //       row.thicker = true;
    //       break;
    //     }
    //   }
    // }
  }

  // Compute the statement edge.
  // This is the width of a block where statements are nested.
  inputRows.statementEdge = 2 * Blockly.BlockSvg.SEP_SPACE_X +
      fieldStatementWidth;
  // Compute the preferred right edge.  Inline blocks may extend beyond.
  // This is the width of the block where external inputs connect.
  if (hasStatement) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge,
        inputRows.statementEdge + Blockly.BlockSvg.NOTCH_WIDTH);
  }
  if (hasValue) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge, fieldValueWidth +
        Blockly.BlockSvg.SEP_SPACE_X * 2 + Blockly.BlockSvg.TAB_WIDTH);
  } else if (hasDummy) {
    inputRows.rightEdge = Math.max(inputRows.rightEdge, fieldValueWidth +
        Blockly.BlockSvg.SEP_SPACE_X * 2);
  }

  inputRows.hasValue = hasValue;
  inputRows.hasStatement = hasStatement;
  inputRows.hasDummy = hasDummy;
  return inputRows;
};

Blockly.BlockSvg.Y_MARGIN_TOP_WITH_IMAGE = 15;
Blockly.BlockSvg.Y_MARGIN_TOP = 5;
Blockly.BlockSvg.ROW_SPACING = 5;

Blockly.BlockSvg.prototype.renderComputeSpacing_ = function(inputRows) {
  for (var y = 0, row; row = inputRows[y]; y++) {
      if ((row.type == Blockly.INPUT_VALUE || row.type == Blockly.NEXT_STATEMENT) && row.hasInput) {
          continue;
      }

      if (y == 0) {
        if (row.hasImage) {
          row.height += Blockly.BlockSvg.Y_MARGIN_TOP_WITH_IMAGE;
          row.alignmentHeight += Blockly.BlockSvg.Y_MARGIN_TOP_WITH_IMAGE;
        }
        else {
          row.height += Blockly.BlockSvg.Y_MARGIN_TOP;
          row.alignmentHeight += Blockly.BlockSvg.Y_MARGIN_TOP;
        }
      }

      if (y + 1 == inputRows.length) {
        if (row.hasImage) {
          row.height += Blockly.BlockSvg.Y_MARGIN_TOP_WITH_IMAGE;
          row.alignmentHeight += Blockly.BlockSvg.Y_MARGIN_TOP_WITH_IMAGE;
        }
        else {
          row.height += Blockly.BlockSvg.Y_MARGIN_TOP;
          row.alignmentHeight += Blockly.BlockSvg.Y_MARGIN_TOP;
        }
      }
      else {
          row.height += Blockly.BlockSvg.ROW_SPACING;
          row.alignmentHeight += Blockly.BlockSvg.ROW_SPACING;
      }
  }
  
  return inputRows;
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
  // Reset the height to zero and let the rendering process add in
  // portions of the block height as it goes. (e.g. hats, inputs, etc.)
  this.height = 0;
  // Should the top and bottom left corners be rounded or square?
  if (this.outputConnection) {
    this.squareTopLeftCorner_ = true;
    this.squareBottomLeftCorner_ = true;
  } else {
    this.squareTopLeftCorner_ = false;
    this.squareBottomLeftCorner_ = false;
    // If this block is in the middle of a stack, square the corners.
    if (this.previousConnection) {
      var prevBlock = this.previousConnection.targetBlock();
      if (prevBlock && prevBlock.getNextBlock() == this) {
        this.squareTopLeftCorner_ = true;
      }
    } else if (Blockly.BlockSvg.START_HAT) {
      // No output or previous connection.
      this.squareTopLeftCorner_ = true;
      this.startHat_ = true;
      this.height += Blockly.BlockSvg.START_HAT_HEIGHT;
      inputRows.rightEdge = Math.max(inputRows.rightEdge, 100);
    }
    var nextBlock = this.getNextBlock();
    if (nextBlock) {
      this.squareBottomLeftCorner_ = true;
    }
  }

  // Assemble the block's path.
  /**
   * @type !Blockly.BlockSvg.PathObject
   */
  var pathObject = new Blockly.BlockSvg.PathObject();

  this.renderDrawTop_(pathObject, inputRows.rightEdge);
  var cursorY = this.renderDrawRight_(pathObject, inputRows, iconWidth);
  this.renderDrawBottom_(pathObject, cursorY);
  this.renderDrawLeft_(pathObject, inputRows);

  this.setPaths_(pathObject);
};

/**
 * Update the block's SVG paths based on the paths that were computed during
 * this render pass.
 * @param {!Blockly.BlockSvg.PathObject} pathObject The object containing
 *     partially constructed SVG paths, which will be modified by this function.
 * @private
 */
Blockly.BlockSvg.prototype.setPaths_ = function(pathObject) {
  var pathString = pathObject.steps.join(' ') + '\n' +
      pathObject.inlineSteps.join(' ');
  this.svgPath_.setAttribute('d', pathString);
  this.svgPathDark_.setAttribute('d', pathString);

  pathString = pathObject.highlightSteps.join(' ') + '\n' +
      pathObject.highlightInlineSteps.join(' ');
  this.svgPathLight_.setAttribute('d', pathString);
  if (this.RTL) {
    // Mirror the block's path.
    this.svgPath_.setAttribute('transform', 'scale(-1 1)');
    this.svgPathLight_.setAttribute('transform', 'scale(-1 1)');
    this.svgPathDark_.setAttribute('transform', 'translate(1,1) scale(-1 1)');
  }
};

/**
 * Update all of the connections on this block with the new locations calculated
 * in renderCompute.  Also move all of the connected blocks based on the new
 * connection locations.
 * @private
 */
Blockly.BlockSvg.prototype.renderMoveConnections_ = function() {
  var blockTL = this.getRelativeToSurfaceXY();
  // Don't tighten previous or output connections because they are inferior
  // connections.
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

/**
 * Render the top edge of the block.
 * @param {!Blockly.BlockSvg.PathObject} pathObject The object containing
 *     partially constructed SVG paths, which will be modified by this function.
 * @param {number} rightEdge Minimum width of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawTop_ = function(pathObject, rightEdge) {
  var steps = pathObject.steps;
  var highlightSteps = pathObject.highlightSteps;
  // Position the cursor at the top-left starting point.
  if (this.squareTopLeftCorner_) {
    steps.push('m 0,0');
    highlightSteps.push('m 0.5,0.5');
    if (this.startHat_) {
      steps.push(Blockly.BlockSvg.START_HAT_PATH);
      highlightSteps.push(this.RTL ?
          Blockly.BlockSvg.START_HAT_HIGHLIGHT_RTL :
          Blockly.BlockSvg.START_HAT_HIGHLIGHT_LTR);
    }
  } else {
    steps.push(Blockly.BlockSvg.TOP_LEFT_CORNER_START);
    highlightSteps.push(this.RTL ?
        Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_RTL :
        Blockly.BlockSvg.TOP_LEFT_CORNER_START_HIGHLIGHT_LTR);
    // Top-left rounded corner.
    steps.push(Blockly.BlockSvg.TOP_LEFT_CORNER);
    highlightSteps.push(Blockly.BlockSvg.TOP_LEFT_CORNER_HIGHLIGHT);
  }

  // Top edge.
  if (this.previousConnection) {
    steps.push('H', Blockly.BlockSvg.NOTCH_WIDTH - 15);
    highlightSteps.push('H', Blockly.BlockSvg.NOTCH_WIDTH - 15);
    steps.push(Blockly.BlockSvg.NOTCH_PATH_LEFT);
    highlightSteps.push(Blockly.BlockSvg.NOTCH_PATH_LEFT_HIGHLIGHT);

    var connectionX = (this.RTL ?
        -Blockly.BlockSvg.NOTCH_WIDTH : Blockly.BlockSvg.NOTCH_WIDTH);
    this.previousConnection.setOffsetInBlock(connectionX, 0);
  }
  steps.push('H', rightEdge);
  highlightSteps.push('H', rightEdge - 0.5);
  this.width = rightEdge;
};

/**
 * Render the right edge of the block.
 * @param {!Blockly.BlockSvg.PathObject} pathObject The object containing
 *     partially constructed SVG paths, which will be modified by this function.
 * @param {!Array.<!Array.<!Object>>} inputRows 2D array of objects, each
 *     containing position information.
 * @param {number} iconWidth Offset of first row due to icons.
 * @return {number} Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawRight_ = function(pathObject, inputRows,
    iconWidth) {
  // Objects to pass to helper functions, which encapsulate a lot of the
  // information we're passing around.  Helper functions will update these
  // objects.
  var cursor = {
    x: 0,
    y: 0
  };

  var connectionPos = {
    x: 0,
    y: 0
  };

  for (var y = 0, row; row = inputRows[y]; y++) {
    cursor.x = Blockly.BlockSvg.SEP_SPACE_X;
    if (y == 0) {
      cursor.x += this.RTL ? -iconWidth : iconWidth;
    }
    pathObject.highlightSteps.push('M', (inputRows.rightEdge - 0.5) + ',' +
        (cursor.y + 0.5));
    if (this.isCollapsed()) {
      this.renderJaggedEdge_(pathObject, row, cursor);
    } else if (row.type == Blockly.BlockSvg.INLINE) {
      this.renderInlineRow_(
          pathObject, row, cursor, connectionPos, inputRows.rightEdge);
    } else if (row.type == Blockly.INPUT_VALUE) {
      this.renderExternalValueInput_(
          pathObject, row, cursor, connectionPos, inputRows.rightEdge);
    } else if (row.type == Blockly.DUMMY_INPUT) {
      this.renderDummyInput_(
          pathObject, row, cursor, inputRows.rightEdge, inputRows.hasValue);
    } else if (row.type == Blockly.NEXT_STATEMENT) {
      this.renderStatementInput_(
          pathObject, row, cursor, connectionPos, inputRows, y);
    }
    cursor.y += row.height;
  }
  if (!inputRows.length) {
    cursor.y = Blockly.BlockSvg.MIN_BLOCK_Y;
    pathObject.steps.push('V', cursor.y);
    if (this.RTL) {
      pathObject.highlightSteps.push('V', cursor.y - 1);
    }
  }
  return cursor.y;
};

/**
 * Render the bottom edge of the block.
 * @param {!Blockly.BlockSvg.PathObject} pathObject The object containing
 *     partially constructed SVG paths, which will be modified by this function.
 * @param {number} cursorY Height of block.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawBottom_ = function(pathObject, cursorY) {
  var steps = pathObject.steps;
  var highlightSteps = pathObject.highlightSteps;
  this.height += cursorY + 1;  // Add one for the shadow.
  if (this.nextConnection) {
    steps.push('H', (Blockly.BlockSvg.NOTCH_WIDTH + (this.RTL ? 0.5 : - 0.5)) +
        ' ' + Blockly.BlockSvg.NOTCH_PATH_RIGHT);
    // Create next block connection.
    var connectionX;
    if (this.RTL) {
      connectionX = -Blockly.BlockSvg.NOTCH_WIDTH;
    } else {
      connectionX = Blockly.BlockSvg.NOTCH_WIDTH;
    }
    this.nextConnection.setOffsetInBlock(connectionX, cursorY + 1);
    this.height += 4;  // Height of tab.
  }

  // Should the bottom-left corner be rounded or square?
  if (this.squareBottomLeftCorner_) {
    steps.push('H 0');
    if (!this.RTL) {
      highlightSteps.push('M', '0.5,' + (cursorY + 0.5));
    }
  } else {
    steps.push('H', Blockly.BlockSvg.CORNER_RADIUS);
    steps.push('a', Blockly.BlockSvg.CORNER_RADIUS + ',' +
               Blockly.BlockSvg.CORNER_RADIUS + ' 0 0,1 -' +
               Blockly.BlockSvg.CORNER_RADIUS + ',-' +
               Blockly.BlockSvg.CORNER_RADIUS);
    if (!this.RTL) {
      highlightSteps.push('M', Blockly.BlockSvg.DISTANCE_45_INSIDE + ',' +
          (cursorY - Blockly.BlockSvg.DISTANCE_45_INSIDE));
      highlightSteps.push('A', (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + ',' +
          (Blockly.BlockSvg.CORNER_RADIUS - 0.5) + ' 0 0,1 ' +
          '0.5,' + (cursorY - Blockly.BlockSvg.CORNER_RADIUS));
    }
  }
};

/**
 * Render the left edge of the block.
 * @param {!Blockly.BlockSvg.PathObject} pathObject The object containing
 *     partially constructed SVG paths, which will be modified by this function.
 * @private
 */
Blockly.BlockSvg.prototype.renderDrawLeft_ = function(pathObject, inputRows) {
  var steps = pathObject.steps;
  var highlightSteps = pathObject.highlightSteps;
  
  //SHAPE: This will calculate the vertical middle of the first row, so the "puzzle" piece can be centered there.
  //SHAPE: On blocks with multiple lines, it will still render the "puzzle" piece in the middle of the first row.
  this.firstRowHeight = inputRows[0].height;
  
  if (this.outputConnection) {
    //SHAPE: 15 is hardcoded because the svg path of the "puzzle" piece is also hardcoded.
    var tabHeight = ((this.firstRowHeight - 15) / 2) + 15;

    // Create output connection.
    this.outputConnection.setOffsetInBlock(0, 0);
    steps.push('V', tabHeight);
    steps.push('c 0,-10 -' + Blockly.BlockSvg.TAB_WIDTH + ',8 -' +
        Blockly.BlockSvg.TAB_WIDTH + ',-7.5 s ' + Blockly.BlockSvg.TAB_WIDTH +
        ',2.5 ' + Blockly.BlockSvg.TAB_WIDTH + ',-7.5');
    if (this.RTL) {
      highlightSteps.push('M', (Blockly.BlockSvg.TAB_WIDTH * -0.25) + ',8.4');
      highlightSteps.push('l', (Blockly.BlockSvg.TAB_WIDTH * -0.45) + ',-2.1');
    } else {
      highlightSteps.push('V', tabHeight - 1.5);
      highlightSteps.push('m', (Blockly.BlockSvg.TAB_WIDTH * -0.92) +
                          ',-0.5 q ' + (Blockly.BlockSvg.TAB_WIDTH * -0.19) +
                          ',-5.5 0,-11');
      highlightSteps.push('m', (Blockly.BlockSvg.TAB_WIDTH * 0.92) +
                          ',1 V 0.5 H 1');
    }
    this.width += Blockly.BlockSvg.TAB_WIDTH;
  } else if (!this.RTL) {
    if (this.squareTopLeftCorner_) {
      // Statement block in a stack.
      highlightSteps.push('V', 0.5);
    } else {
      highlightSteps.push('V', Blockly.BlockSvg.CORNER_RADIUS);
    }
  }
  steps.push('z');
};

/**
 * Render the jagged edge of an input that shows on a collapsed block.
 * @param {!Blockly.BlockSvg.PathObject} pathObject The object containing
 *     partially constructed SVG paths, which will be modified by this function.
 * @param {!Array.<!Object>} row An object containing position information about
 *     inputs on this row of the block.
 * @param {!Object} cursor An object containing the position of the cursor,
 *     which determines where to start laying out fields.
 * @private
 */
Blockly.BlockSvg.prototype.renderJaggedEdge_ = function(pathObject, row,
    cursor) {
  var steps = pathObject.steps;
  var highlightSteps = pathObject.highlightSteps;
  var input = row[0];
  this.renderFields_(input.fieldRow, cursor.x, cursor.y, row.alignmentHeight);
  steps.push(Blockly.BlockSvg.JAGGED_TEETH);
  highlightSteps.push('h 8');
  var remainder = row.height - Blockly.BlockSvg.JAGGED_TEETH_HEIGHT;
  steps.push('v', remainder);
  if (this.RTL) {
    highlightSteps.push('v 3.9 l 7.2,3.4 m -14.5,8.9 l 7.3,3.5');
    highlightSteps.push('v', remainder - 0.7);
  }
  this.width += Blockly.BlockSvg.JAGGED_TEETH_WIDTH;
};

/**
 * Render the right side of an inline row on a block.
 * @param {!Blockly.BlockSvg.PathObject} pathObject The object containing
 *     partially constructed SVG paths, which will be modified by this function.
 * @param {!Array.<!Object>} row An object containing position information about
 *     inputs on this row of the block.
 * @param {!Object} cursor An object containing the position of the cursor,
 *     which determines where to start laying out fields.
 * @param {!Object} connectionPos An object containing the position of the
 *     connection on this input.
 * @param {number} rightEdge The position of the right edge of the block, which
 *     is based on the widest row that has been encountered so far.
 * @private
 */
Blockly.BlockSvg.prototype.renderInlineRow_ = function(pathObject, row, cursor,
    connectionPos, rightEdge) {
  var inlineSteps = pathObject.inlineSteps;
  var highlightInlineSteps = pathObject.highlightInlineSteps;
  var steps = pathObject.steps;
  var highlightSteps = pathObject.highlightSteps;

  for (var x = 0, input; input = row[x]; x++) {
    var fieldX = cursor.x;
    var fieldY = cursor.y;
    if (row.thicker) {
      // Lower the field slightly.
      fieldY += Blockly.BlockSvg.INLINE_PADDING_Y;
    }
    // TODO: Align inline field rows (left/right/centre).
    cursor.x = this.renderFields_(input.fieldRow, fieldX, fieldY, row.alignmentHeight);
    if (input.type != Blockly.DUMMY_INPUT) {
      cursor.x += input.renderWidth + Blockly.BlockSvg.SEP_SPACE_X;
    }
    if (input.type == Blockly.INPUT_VALUE) {
      //SHAPE: Calculate the y-axis start of this inner block. This will align it so it's centered.
      var yStart = (row.height - input.renderHeight) / 2;

      inlineSteps.push('M', (cursor.x - Blockly.BlockSvg.SEP_SPACE_X) +
                       ',' + (cursor.y + yStart));
      inlineSteps.push('h', Blockly.BlockSvg.TAB_WIDTH - 2 -
                       input.renderWidth);
                       
      //SHAPE: Recalculate the vertical alignment of an INNER "puzzle" piece
      //SHAPE: Subtract 7.5 because the TAB_PATH_DOWN variable underneath adds it via hardcoded value
      var vLineHeight = 1 + ((input.alignmentHeight - 15) / 2) - 7.5;
      
      if (vLineHeight > 0) {
          inlineSteps.push('v', vLineHeight);
      }
      
      //Add the "puzzle" piece
      inlineSteps.push(Blockly.BlockSvg.TAB_PATH_DOWN);

      //Calculate the rest of the vertical line and add 2.
      var restOfHeight = 1 + (input.renderHeight - 15 - vLineHeight - 7.5);
        
      if (input.renderHeight == input.alignmentHeight) {
          restOfHeight = vLineHeight + 7.5;
      }
      
      inlineSteps.push('v', restOfHeight);

      inlineSteps.push('h', input.renderWidth + 2 -
                       Blockly.BlockSvg.TAB_WIDTH);
      inlineSteps.push('z');
      if (this.RTL) {
        // Highlight right edge, around back of tab, and bottom.
        highlightInlineSteps.push('M',
              (cursor.x - Blockly.BlockSvg.SEP_SPACE_X - 2.5 +
               Blockly.BlockSvg.TAB_WIDTH - input.renderWidth) + ',' +
              (cursor.y + yStart + 0.5));
        highlightInlineSteps.push(
            Blockly.BlockSvg.TAB_PATH_DOWN_HIGHLIGHT_RTL);
        highlightInlineSteps.push('v',
            input.renderHeight - restOfHeight + 2.5);
        highlightInlineSteps.push('h',
            input.renderWidth - Blockly.BlockSvg.TAB_WIDTH + 2);
      } else {
        // Highlight right edge, bottom.
        highlightInlineSteps.push('M',
              (cursor.x - Blockly.BlockSvg.SEP_SPACE_X + 0.5) + ',' +
              (cursor.y + yStart + 0.5));
        highlightInlineSteps.push('v', input.renderHeight + 1);
        highlightInlineSteps.push('h', Blockly.BlockSvg.TAB_WIDTH - 2 -
                                        input.renderWidth);
        // Short highlight glint at bottom of tab.
        highlightInlineSteps.push('M',
            (cursor.x - input.renderWidth - Blockly.BlockSvg.SEP_SPACE_X +
              0.9) + ',' + (cursor.y + yStart +
              vLineHeight + 7.5 + 15 - 0.7));
        highlightInlineSteps.push('l',
            (Blockly.BlockSvg.TAB_WIDTH * 0.46) + ',-2.1');
      }
      // Create inline input connection.
      if (this.RTL) {
        connectionPos.x = -cursor.x -
            Blockly.BlockSvg.TAB_WIDTH + Blockly.BlockSvg.SEP_SPACE_X +
            input.renderWidth + 1;
      } else {
        connectionPos.x = cursor.x +
            Blockly.BlockSvg.TAB_WIDTH - Blockly.BlockSvg.SEP_SPACE_X -
            input.renderWidth - 1;
      }
      connectionPos.y = cursor.y + yStart + 1;
      input.connection.setOffsetInBlock(connectionPos.x, connectionPos.y);
      input.connection.addHighlightMargin(vLineHeight, restOfHeight);
    }
  }

  cursor.x = Math.max(cursor.x, rightEdge);
  this.width = Math.max(this.width, cursor.x);
  steps.push('H', cursor.x);
  highlightSteps.push('H', cursor.x + 0.5);
  steps.push('v', row.height);
  if (this.RTL) {
    highlightSteps.push('v', row.height - 1);
  }
};

/**
 * Render the right side of an inline row on a block.
 * @param {!Blockly.BlockSvg.PathObject} pathObject The object containing
 *     partially constructed SVG paths, which will be modified by this function.
 * @param {!Array.<!Object>} row An object containing position information about
 *     inputs on this row of the block.
 * @param {!Object} cursor An object containing the position of the cursor,
 *     which determines where to start laying out fields.
 * @param {!Object} connectionPos An object containing the position of the
 *     connection on this input.
 * @param {number} rightEdge The position of the right edge of the block, which
 *     is based on the widest row that has been encountered so far.
 * @private
 */
Blockly.BlockSvg.prototype.renderExternalValueInput_ = function(pathObject, row,
    cursor, connectionPos, rightEdge) {
  var steps = pathObject.steps;
  var highlightSteps = pathObject.highlightSteps;
  // External input.
  var input = row[0];
  var fieldX = cursor.x;
  var fieldY = cursor.y;
  if (input.align != Blockly.ALIGN_LEFT) {
    var fieldRightX = rightEdge - input.fieldWidth -
        Blockly.BlockSvg.TAB_WIDTH - 2 * Blockly.BlockSvg.SEP_SPACE_X;
    if (input.align == Blockly.ALIGN_RIGHT) {
      fieldX += fieldRightX;
    } else if (input.align == Blockly.ALIGN_CENTRE) {
      fieldX += fieldRightX / 2;
    }
  }
  this.renderFields_(input.fieldRow, fieldX, fieldY, row.alignmentHeight);
  
  var topVerticalLine = ((row.height - 15) / 2) - 7.5;

  if (topVerticalLine < 0) {
      topVerticalLine = 0;
  }

  steps.push('v', topVerticalLine);

  steps.push(Blockly.BlockSvg.TAB_PATH_DOWN);
  var v = row.height - Blockly.BlockSvg.TAB_HEIGHT - topVerticalLine;
  steps.push('v', v);

  if (this.RTL) {
    // Highlight around back of tab.
      highlightSteps.push('v', topVerticalLine);
    highlightSteps.push(Blockly.BlockSvg.TAB_PATH_DOWN_HIGHLIGHT_RTL);
    highlightSteps.push('v', v + 0.5);
  } else {
    // Short highlight glint at bottom of tab.
    highlightSteps.push('M', (rightEdge - 5) + ',' +
        (cursor.y + Blockly.BlockSvg.TAB_HEIGHT + topVerticalLine - 0.7));
    highlightSteps.push('l', (Blockly.BlockSvg.TAB_WIDTH * 0.46) +
        ',-2.1');
  }
  // Create external input connection.
  connectionPos.x = this.RTL ? -rightEdge - 1 : rightEdge + 1;
  input.connection.setOffsetInBlock(connectionPos.x, cursor.y);
  input.connection.addHighlightMargin(topVerticalLine, v);
  if (input.connection.isConnected()) {
    this.width = Math.max(this.width, rightEdge +
        input.connection.targetBlock().getHeightWidth().width -
        Blockly.BlockSvg.TAB_WIDTH + 1);
  }
};

/**
 * Render the right side of an inline row on a block.
 * @param {!Blockly.BlockSvg.PathObject} pathObject The object containing
 *     partially constructed SVG paths, which will be modified by this function.
 * @param {!Array.<!Object>} row An object containing position information about
 *     inputs on this row of the block.
 * @param {!Object} cursor An object containing the position of the cursor,
 *     which determines where to start laying out fields.
 * @param {number} rightEdge The position of the right edge of the block, which
 *     is based on the widest row that has been encountered so far.
 * @param {boolean} hasValue True if this block has at least one value input.
 * @private
 */
Blockly.BlockSvg.prototype.renderDummyInput_ = function(pathObject, row,
    cursor, rightEdge, hasValue) {
  var steps = pathObject.steps;
  var highlightSteps = pathObject.highlightSteps;
  var input = row[0];
  var fieldX = cursor.x;
  var fieldY = cursor.y;
  if (input.align != Blockly.ALIGN_LEFT) {
    var fieldRightX = rightEdge - input.fieldWidth -
        2 * Blockly.BlockSvg.SEP_SPACE_X;
    if (hasValue) {
      fieldRightX -= Blockly.BlockSvg.TAB_WIDTH;
    }
    if (input.align == Blockly.ALIGN_RIGHT) {
      fieldX += fieldRightX;
    } else if (input.align == Blockly.ALIGN_CENTRE) {
      fieldX += fieldRightX / 2;
    }
  }
  this.renderFields_(input.fieldRow, fieldX, fieldY, row.alignmentHeight);
  steps.push('v', row.height);
  if (this.RTL) {
    highlightSteps.push('v', row.height - 1);
  }
};


/**
 * Render the right side of an inline row on a block.
 * @param {!Blockly.BlockSvg.PathObject} pathObject The object containing
 *     partially constructed SVG paths, which will be modified by this function.
 * @param {!Array.<!Object>} row An object containing position information about
 *     inputs on this row of the block.
 * @param {!Object} cursor An object containing the position of the cursor,
 *     which determines where to start laying out fields.
 * @param {!Object} connectionPos An object containing the position of the
 *     connection on this input.
 * @param {!Array.<!Array.<!Object>>} inputRows 2D array of objects, each
 *     containing position information.
 * @param {number} index The index of the current row in the inputRows array.
 * @private
 */
Blockly.BlockSvg.prototype.renderStatementInput_ = function(pathObject, row,
    cursor, connectionPos, inputRows, index) {
  var steps = pathObject.steps;
  var highlightSteps = pathObject.highlightSteps;
  var input = row[0];
  if (index == 0) {
    // If the first input is a statement stack, add a small row on top.
    steps.push('v', Blockly.BlockSvg.SEP_SPACE_Y);
    if (this.RTL) {
      highlightSteps.push('v', Blockly.BlockSvg.SEP_SPACE_Y - 1);
    }
    cursor.y += Blockly.BlockSvg.SEP_SPACE_Y;
  }
  var fieldX = cursor.x;
  var fieldY = cursor.y;
  if (input.align != Blockly.ALIGN_LEFT) {
    var fieldRightX = inputRows.statementEdge - input.fieldWidth -
        2 * Blockly.BlockSvg.SEP_SPACE_X;
    if (input.align == Blockly.ALIGN_RIGHT) {
      fieldX += fieldRightX;
    } else if (input.align == Blockly.ALIGN_CENTRE) {
      fieldX += fieldRightX / 2;
    }
  }
  this.renderFields_(input.fieldRow, fieldX, fieldY, row.alignmentHeight);
  cursor.x = inputRows.statementEdge + Blockly.BlockSvg.NOTCH_WIDTH;
  steps.push('H', cursor.x);
  steps.push(Blockly.BlockSvg.INNER_TOP_LEFT_CORNER);
  steps.push('v', row.height - 2 * Blockly.BlockSvg.CORNER_RADIUS);
  steps.push(Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER);
  steps.push('H', inputRows.rightEdge);
  if (this.RTL) {
    highlightSteps.push('M',
        (cursor.x - Blockly.BlockSvg.NOTCH_WIDTH +
         Blockly.BlockSvg.DISTANCE_45_OUTSIDE) +
        ',' + (cursor.y + Blockly.BlockSvg.DISTANCE_45_OUTSIDE));
    highlightSteps.push(
        Blockly.BlockSvg.INNER_TOP_LEFT_CORNER_HIGHLIGHT_RTL);
    highlightSteps.push('v',
        row.height - 2 * Blockly.BlockSvg.CORNER_RADIUS);
    highlightSteps.push(
        Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_RTL);
    highlightSteps.push('H', inputRows.rightEdge - 0.5);
  } else {
    highlightSteps.push('M',
        (cursor.x - Blockly.BlockSvg.NOTCH_WIDTH +
         Blockly.BlockSvg.DISTANCE_45_OUTSIDE) + ',' +
        (cursor.y + row.height - Blockly.BlockSvg.DISTANCE_45_OUTSIDE));
    highlightSteps.push(
        Blockly.BlockSvg.INNER_BOTTOM_LEFT_CORNER_HIGHLIGHT_LTR);
    highlightSteps.push('H', inputRows.rightEdge - 0.5);
  }
  // Create statement connection.
  connectionPos.x = this.RTL ? -cursor.x : cursor.x + 1;
  input.connection.setOffsetInBlock(connectionPos.x, cursor.y + 1);

  if (input.connection.isConnected()) {
    this.width = Math.max(this.width, inputRows.statementEdge +
        input.connection.targetBlock().getHeightWidth().width);
  }
  if (index == inputRows.length - 1 ||
      inputRows[index + 1].type == Blockly.NEXT_STATEMENT) {
    // If the final input is a statement stack, add a small row underneath.
    // Consecutive statement stacks are also separated by a small divider.
    steps.push('v', Blockly.BlockSvg.SEP_SPACE_Y);
    if (this.RTL) {
      highlightSteps.push('v', Blockly.BlockSvg.SEP_SPACE_Y - 1);
    }
    cursor.y += Blockly.BlockSvg.SEP_SPACE_Y;
  }
};
