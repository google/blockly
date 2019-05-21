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

goog.provide('Blockly.BlockRendering.RenderInfo');

/**
 * An object containing all sizing information needed to draw this block.
 *
 * This measure pass does not propagate changes to the block (although fields
 * may choose to rerender when getSize() is called).  However, calling it
 * repeatedly may be expensive.
 *
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @constructor
 * @package
 */
Blockly.BlockRendering.RenderInfo = function(block) {
  this.block_ = block;

  /**
   * Whether the block has an output connection.
   * @type {boolean}
   */
  this.hasOutputConnection = !!block.outputConnection;

  /**
   * Whether the block should be rendered as a single line, either because it's
   * inline or because it has been collapsed.
   * @type {boolean}
   */
  this.isInline = block.getInputsInline() && !block.isCollapsed();

  /**
   * True if the block should be rendered right-to-left.
   * @type {boolean}
   */
  this.RTL = block.RTL;

  /**
   * The height of the rendered block, including child blocks.
   * @type {number}
   */
  this.height = 0;

  /**
   * The width of the rendered block, including child blocks.
   * @type {number}
   */
  this.widthWithChildren = 0;

  /**
   * The width of the rendered block, excluding child blocks.  This is the right
   * edge of the block when rendered LTR.
   * @type {number}
   */
  this.width = 0;

  /**
   *
   * @type {number}
   */
  this.statementEdge = 0;

  /**
   * An array of Row objects containing sizing information.
   * @type {Array}
   */
  this.rows = [];

  this.topRow = null;
  this.bottomRow = null;

  this.measure_();
};

/**
 * Populate and return an object containing all sizing information needed to
 * draw this block.
 *
 * This measure pass does not propagate changes to the block (although fields
 * may choose to rerender when getSize() is called).  However, calling it
 * repeatedly may be expensive.
 *
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @private
 */
Blockly.BlockRendering.RenderInfo.prototype.measure_ = function() {
  this.createRows_();
  this.addElemSpacing_();
  this.computeBounds_();
  this.alignRowElements_();
  this.addRowSpacing_();
  this.finalize_();

  console.log(this);
};

/**
 * Create rows of Measurable objects representing all renderable parts of the
 * block.
 * @param {!Blockly.BlockSvg}  block The block to create rows from.
 * @private
 */
Blockly.BlockRendering.RenderInfo.prototype.createRows_ = function() {
  var activeRow = new Blockly.BlockRendering.Row();
  this.topRow = this.createTopRow_();
  this.rows.push(this.topRow);

  // Icons always go on the first row, before anything else.
  var icons = this.block_.getIcons();
  if (icons.length) {
    for (var i = 0; i < icons.length; i++) {
      activeRow.elements.push(
          new Blockly.BlockRendering.Icon(icons[i]));
    }
  }

  // Loop across all of the inputs on the block, creating objects for anything
  // that needs to be rendered and breaking the block up into visual rows.
  for (var i = 0; i < this.block_.inputList.length; i++) {
    var input = this.block_.inputList[i];
    if (this.shouldStartNewRow_(input, this.block_.inputList[i - 1])) {
      // Finish this row and create a new one.
      this.rows.push(activeRow);
      activeRow = new Blockly.BlockRendering.Row();
    }

    // All of the fields in an input go on the same row.
    for (var f = 0; f < input.fieldRow.length; f++) {
      var field = input.fieldRow[f];
      activeRow.elements.push(new Blockly.BlockRendering.Field(field));
    }
    this.addInput_(input, activeRow);
  }

  if (activeRow.elements.length) {
    this.rows.push(activeRow);
  }
};

/**
 * Create the top row and fill the elements list with the correct measurables
 * based on values from the block.
 * @return {Blockly.BlockRendering.TopRow} The top row with all the elements
 *     created.
 */
Blockly.BlockRendering.RenderInfo.prototype.createTopRow_ = function() {
  var hasHat = this.block_.hat ? this.block_.hat === 'cap' : Blockly.BlockSvg.START_HAT;
  var hasPrevious = !!this.block_.previousConnection;
  var prevBlock = this.block_.getPreviousBlock();
  var squareCorner = !!this.block_.outputConnection ||
      hasHat || (prevBlock && prevBlock.getNextBlock() == this.block_);
  var topRow = new Blockly.BlockRendering.TopRow(this.block_);

  if (squareCorner) {
    topRow.elements.push(new Blockly.BlockRendering.SquareCorner(this.width));
  } else {
    topRow.elements.push(new Blockly.BlockRendering.RoundCorner(this.width));
  }

  if (hasHat) {
    topRow.elements.push(new Blockly.BlockRendering.Hat(this.width));
  } else if (hasPrevious) {
    topRow.elements.push(
        new Blockly.BlockRendering.PreviousConnection(this.width));
  }

  return topRow;
};


Blockly.BlockRendering.RenderInfo.prototype.addInput_ = function(input, activeRow) {
  // Non-dummy inputs have visual representations onscreen.
  if (this.isInline && input.type == Blockly.INPUT_VALUE) {
    activeRow.elements.push(new Blockly.BlockRendering.InlineInput(input));
    activeRow.hasInlineInput = true;
  } else if (input.type == Blockly.NEXT_STATEMENT) {
    activeRow.elements.push(new Blockly.BlockRendering.StatementInput(input));
    activeRow.hasStatement = true;
  } else if (input.type == Blockly.INPUT_VALUE) {
    activeRow.elements.push(new Blockly.BlockRendering.ExternalValueInput(input));
    activeRow.hasExternalInput = true;
  }
};

/**
 * Decide whether to start a new row between the two Blockly.Inputs.
 * @param {Blockly.Input}  input The first input to consider
 * @param {Blockly.Input}  lastInput The input that follows.
 * @return {boolean} True if the next input should be rendered on a new row.
 * @private
 */
Blockly.BlockRendering.RenderInfo.prototype.shouldStartNewRow_ = function(input, lastInput) {
  // If this is the first input, just add to the existing row.
  // That row is either empty or has some icons in it.
  if (!lastInput) {
    return false;
  }
  // A statement input always gets a new row.
  if (input.type == Blockly.NEXT_STATEMENT) {
    return true;
  }
  // External value inputs get their own rows.
  if (input.type == Blockly.INPUT_VALUE && !this.isInline) {
    return true;
  }
  return false;
};

/**
 * Add horizontal spacing between and around elements within each row.
 * @private
 */
Blockly.BlockRendering.RenderInfo.prototype.addElemSpacing_ = function() {
  for (var r = 0; r < this.rows.length; r++) {
    var row = this.rows[r];
    var oldElems = row.elements;
    row.elements = [];
    // No spacing needed before the corner on the top row.
    if (row.type != 'top row') {
      // There's a spacer before the first element in the row.
      row.elements.push(new Blockly.BlockRendering.InRowSpacer(
          this.getInRowSpacing_(null, oldElems[0])));
    }

    for (var e = 0; e < oldElems.length; e++) {
      row.elements.push(oldElems[e]);
      var spacing = this.getInRowSpacing_(oldElems[e], oldElems[e + 1]);
      row.elements.push(new Blockly.BlockRendering.InRowSpacer(spacing));
    }
  }
};

/**
 * Calculate the width of a spacer element in a row based on the previous and
 * next elements in that row.  For instance, extra padding is added between two
 * editable fields.
 * @param {Blockly.BlockRendering.Measurable} prev The element before the
 *     spacer.
 * @param {Blockly.BlockRendering.Measurable} next The element after the spacer.
 * @return {number} The size of the spacing between the two elements.
 * @private
 */
Blockly.BlockRendering.RenderInfo.prototype.getInRowSpacing_ = function(prev, next) {
  if (!prev) {
    // Between an editable field and the beginning of the row.
    if (next.isField() && next.isEditable) {
      return BRC.MEDIUM_PADDING;
    }
    // Inline input at the beginning of the row.
    if (next.isInput && next.isInlineInput()) {
      return BRC.LARGE_PADDING - 1;
    }
    // Anything else at the beginning of the row.
    return BRC.LARGE_PADDING;
  }

  // Spacing between a field or icon and the end of the row.
  if (!prev.isInput && !next) {
    // Between an editable field and the end of the row.
    if (prev.isField() && prev.isEditable) {
      return BRC.MEDIUM_PADDING;
    }
    if (prev.isHat()){
      return BRC.NO_PADDING;
    }
    if (prev.isPreviousConnection() || prev.isNextConnection()) {
      // TODO: Need to figure out minimum padding between connection and end of
      // the block.
      return BRC.NO_PADDING;
    }
    // Between noneditable fields and icons and the end of the row.
    return BRC.LARGE_PADDING;
  }

  // Between inputs and the end of the row.
  if (prev.isInput && !next) {
    if (prev.isExternalInput()) {
      return BRC.NO_PADDING;
    } else if (prev.isInlineInput()) {
      return BRC.LARGE_PADDING;
    } else if (prev.isStatementInput()) {
      return BRC.NO_PADDING;
    }
  }

  // Spacing between a field or icon and an input.
  if (!prev.isInput && next.isInput) {
    // Between an editable field and an input.
    if (prev.isEditable) {
      if (next.isInlineInput()) {
        return BRC.SMALL_PADDING;
      } else if (next.isExternalInput()) {
        return BRC.MEDIUM_PADDING;
      }
    }
    return BRC.LARGE_PADDING - 1;
  }

  // Spacing between an icon and an icon or field.
  if (prev.isIcon() && !next.isInput) {
    return BRC.LARGE_PADDING + 1;
  }

  // Spacing between an inline input and a field.
  if (prev.isInlineInput() && !next.isInput) {
    // Editable field after inline input.
    if (next.isEditable) {
      return BRC.MEDIUM_PADDING;
    } else {
      // Noneditable field after inline input.
      return BRC.LARGE_PADDING;
    }
  }

  // Spacing between a hat and a corner
  if (prev.isRoundedCorner() || prev.isSquareCorner()) {
    if (next.isHat()) {
      return BRC.NO_PADDING;
    }
  }

  // Spacing between a rounded corner and a previous connection
  if (prev.isRoundedCorner() && next.isPreviousConnection()){
    return BRC.NOTCH_OFFSET_ROUNDED_CORNER;
  }

  // Spacing between a square corner and a previous connection
  if (prev.isSquareCorner() && next.isPreviousConnection()) {
    return BRC.NOTCH_OFFSET_LEFT;
  }

  return BRC.MEDIUM_PADDING;
};

/**
 * Figure out where the right edge of the block and right edge of statement inputs
 * should be placed.
 * TODO: More cleanup.
 * @private
 */
Blockly.BlockRendering.RenderInfo.prototype.computeBounds_ = function() {
  var widestStatementRowFields = 0;
  var blockWidth = 0;
  var widestRowWithConnectedBlocks = 0;
  for (var r = 0; r < this.rows.length; r++) {
    var row = this.rows[r];
    row.measure();
    if (!row.hasStatement) {
      blockWidth = Math.max(blockWidth, row.width);
    }
    if (row.hasStatement) {
      var statementInput = row.getLastInput();
      var innerWidth = row.width - statementInput.width;
      widestStatementRowFields = Math.max(widestStatementRowFields, innerWidth);
    }
    widestRowWithConnectedBlocks =
        Math.max(widestRowWithConnectedBlocks, row.widthWithConnectedBlocks);
  }


  this.statementEdge = widestStatementRowFields;

  if (widestStatementRowFields) {
    this.width =
        Math.max(blockWidth,
            widestStatementRowFields + BRC.NOTCH_WIDTH * 2);
  } else {
    this.width = blockWidth;
  }

  for (var r = 0; r < this.rows.length; r++) {
    var row = this.rows[r];
    if (row.hasStatement) {
      row.statementEdge = this.statementEdge;
    }
  }

  this.widthWithChildren =
      Math.max(blockWidth, widestRowWithConnectedBlocks);
};

/**
 * Extra spacing may be necessary to make sure that the right sides of all
 * rows line up.  This can only be calculated after a first pass to calculate
 * the sizes of all rows.
 * @private
 */
Blockly.BlockRendering.RenderInfo.prototype.alignRowElements_ = function() {
  for (var r = 0; r < this.rows.length; r++) {
    var row = this.rows[r];
    if (!row.hasStatement && !row.hasInlineInput) {
      var currentWidth = row.width;
      var desiredWidth = this.width;
      var missingSpace = desiredWidth - currentWidth;
      if (missingSpace) {
        if (row.type === 'top row') {
          row.getLastSpacer().width += missingSpace;
        } else {
          this.addAlignmentPadding_(row, missingSpace);
        }
      }
    }
  }
};

/**
 * Modify the given row to add the given amount of padding around its fields.
 * The exact location of the padding is based on the alignment property of the
 * last input in the field.
 * @param {Blockly.BlockRendering.Row} row The row to add padding to.
 * @param {number} missingSpace How much padding to add.
 * @private
 */
Blockly.BlockRendering.RenderInfo.prototype.addAlignmentPadding_ = function(row, missingSpace) {
  var elems = row.elements;
  if (row.hasExternalInput) { // TODO: handle for dummy inputs.
    var externalInput = row.getLastInput();
    // Decide where the extra padding goes.
    if (externalInput.align == Blockly.ALIGN_LEFT) {
      // Add padding just before the input socket.
      elems[elems.length - 3].width += missingSpace;
    } else if (externalInput.align == Blockly.ALIGN_CENTRE) {
      // Split the padding between the beginning of the row and just
      // before the socket.
      row.getFirstSpacer().width += missingSpace / 2;
      elems[elems.length - 3].width += missingSpace / 2;
    } else if (externalInput.align == Blockly.ALIGN_RIGHT) {
      // Add padding at the beginning of the row.
      row.getFirstSpacer().width += missingSpace;
    }
    row.width += missingSpace;
  }
};

/**
 * Add spacers between rows and set their sizes.
 * @private
 */
Blockly.BlockRendering.RenderInfo.prototype.addRowSpacing_ = function() {
  var oldRows = this.rows;
  this.rows = [];

  for (var r = 0; r < oldRows.length; r++) {
    this.rows.push(oldRows[r]);
    if (r !== oldRows.length - 1) {
      this.rows.push(this.makeSpacerRow_(oldRows[r], oldRows[r + 1]));
    }
  }
  this.bottomRow = new Blockly.BlockRendering.BottomRow(this.block_, this.width);
  this.rows.push(this.bottomRow);
};

/**
 * Create a spacer row to go between prev and next, and set its size.
 * @param {?Blockly.BlockRendering.Measurable} prev The previous row, or null.
 * @param {?Blockly.BlockRendering.Measurable} next The next row, or null.
 * @return {!Blockly.BlockSvg.BetweenRowSpacer} The newly created spacer row.
 * @private
 */
Blockly.BlockRendering.RenderInfo.prototype.makeSpacerRow_ = function(prev, next) {
  var height = this.getSpacerRowHeight_(prev, next);
  var width = this.getSpacerRowWidth_(prev, next);
  return new Blockly.BlockRendering.BetweenRowSpacer(height, width);
};

/**
 * Calculate the width of a spacer row.  Almost all spacers will be the full
 * width of the block, but there are some exceptions (e.g. the small spacer row
 * after a statement input)
 * @param {Blockly.BlockRendering.Row} prev The row before the spacer.
 * @param {Blockly.BlockRendering.Row} next The row after the spacer.
 * @return {number} The desired width of the spacer row between these two rows.
 * @private
 */
Blockly.BlockRendering.RenderInfo.prototype.getSpacerRowWidth_ = function(prev, next) {
  return this.width;
};

/**
 * Calculate the height of a spacer row.
 * @param {Blockly.BlockRendering.Row} prev The row before the spacer.
 * @param {Blockly.BlockRendering.Row} next The row after the spacer.
 * @return {number} The desired height of the spacer row between these two rows.
 * @private
 */
Blockly.BlockRendering.RenderInfo.prototype.getSpacerRowHeight_ = function(prev, next) {
  // Top row acts a spacer so we don't need any extra padding
  if (prev.type === 'top row') {
    return BRC.NO_PADDING;
  }
  if (prev.hasExternalInput && next.hasExternalInput) {
    return BRC.LARGE_PADDING;
  }
  return BRC.MEDIUM_PADDING;
};

/**
 * Make any final changes to the rendering information object.  In particular,
 * store the y position of each row, and record the height of the full block.
 * @private
 */
Blockly.BlockRendering.RenderInfo.prototype.finalize_ = function() {
  // Performance note: this could be combined with the draw pass, if the time
  // that this takes is excessive.  But it shouldn't be, because it only
  // accesses and sets properties that already exist on the objects.
  var yCursor = 0;
  for (var r = 0; r < this.rows.length; r++) {
    var row = this.rows[r];
    row.yPos = yCursor;
    var xCursor = 0;
    if (!(row.isSpacer())) {
      var centerline = yCursor + row.height / 2;
      for (var e = 0; e < row.elements.length; e++) {
        var elem = row.elements[e];
        elem.xPos = xCursor;
        elem.centerline = centerline;
        xCursor += elem.width;
      }
    }
    yCursor += row.height;
  }
  this.blockBottom = yCursor;
  this.overhang = 0;

  if (!this.hasOutputConnection) {
    // No output and no next.
    this.overhang = 2; // for the shadow.
  }
  this.height = yCursor + this.overhang;
};
