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

goog.provide('Blockly.BlockRendering.Measure');

/**
 * @param {!Blockly.BlockSvg}
 */
Blockly.BlockRendering.Measure = function(block) {
  /**
   *
   * @type {boolean}
   */
  this.startHat = block.hat ? block.hat === 'cap' : Blockly.BlockSvg.START_HAT;

  /**
   * True if the block has a previous connection.
   * @type {boolean}
   */
  this.hasPreviousConnection = !!block.previousConnection;

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

  var prevBlock = block.getPreviousBlock();

  /**
   * True if the top left corner of the block should be squared.
   * @type {boolean}
   */
  this.squareTopLeftCorner = !!block.outputConnection ||
      this.startHat || (prevBlock && prevBlock.getNextBlock() == this);

  /**
   * True if the bottom left corner of the block should be squared.
   * @type {boolean}
   */
  this.squareBottomLeftCorner = !!block.outputConnection || !!block.getNextBlock();

  /**
   * The height of the rendered block, including child blocks.
   * @type {number}
   */
  this.height = 0;

  /**
   * The width of the rendered block, including child blocks.
   * @type {number}
   */
  this.width = 0;

  /**
   *
   * @type {number}
   */
  this.rightEdge = 0;

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
};

/**
 * Populate and return an object containing all sizing information needed to
 * draw this block.
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @return {!Blockly.BlockRendering.Measure} An object containing rendering
 * information about the block.
 * @package
 */
Blockly.BlockRendering.Measure.renderCompute = function(block) {
  var renderInfo = new Blockly.BlockRendering.Measure(block);
  renderInfo.createRows(block);
  renderInfo.addElemSpacing();
  renderInfo.computeBounds();
  renderInfo.alignRowElements();
  renderInfo.addRowSpacing();
  renderInfo.finalize();

  console.log(renderInfo);
  block.height = renderInfo.height;
  block.width = renderInfo.widthWithConnectedBlocks;
  return renderInfo;
};

/**
 * Create rows of Measurable objects representing all renderable parts of the
 * block.
 * @param {!Blockly.BlockSvg}  block The block to create rows from.
 * @package
 */
Blockly.BlockRendering.Measure.prototype.createRows = function(block) {
  var activeRow = new Blockly.BlockRendering.Row();

  var icons = block.getIcons();
  if (icons.length) {
    for (var i = 0; i < icons.length; i++) {
      activeRow.elements.push(
          new Blockly.BlockRendering.Icon(icons[i]));
    }
  }

  for (var i = 0; i < block.inputList.length; i++) {
    var input = block.inputList[i];
    if (this.shouldStartNewRow(input, block.inputList[i - 1])) {
      this.rows.push(activeRow);
      activeRow = new Blockly.BlockRendering.Row();
    }
    for (var f = 0; f < input.fieldRow.length; f++) {
      var field = input.fieldRow[f];
      activeRow.elements.push(
          new Blockly.BlockRendering.Field(field));
    }

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
  }

  if (activeRow.elements.length) {
    this.rows.push(activeRow);
  }
};

/**
 * Decide whether to start a new row between the two Blockly.Inputs.
 * @param {Blockly.Input}  input The first input to consider
 * @param {Blockly.Input}  lastInput The input that follows.
 * @return {boolean} True if the next input should be rendered on a new row.
 * @package
 */
Blockly.BlockRendering.Measure.prototype.shouldStartNewRow = function(input, lastInput) {
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
 * @package
 */
Blockly.BlockRendering.Measure.prototype.addElemSpacing = function() {
  for (var r = 0; r < this.rows.length; r++) {
    var row = this.rows[r];
    var oldElems = row.elements;
    row.elements = [];
    // There's a spacer before the first element in the row.
    row.elements.push(new Blockly.BlockRendering.InRowSpacer(
        this.getInRowSpacing(null, oldElems[0])));
    for (var e = 0; e < oldElems.length; e++) {
      row.elements.push(oldElems[e]);
      var spacing = this.getInRowSpacing(oldElems[e], oldElems[e + 1]);
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
 * @package
 */
Blockly.BlockRendering.Measure.prototype.getInRowSpacing = function(prev, next) {
  if (!prev) {
    // Between an editable field and the beginning of the row.
    if (next.isField() && next.isEditable) {
      return 5;
    }
    // Inline input at the beginning of the row.
    if (next.isInput && next instanceof Blockly.BlockRendering.InlineInput) {
      return 9;
    }
    // Anything else at the beginning of the row.
    return 10;
  }

  // Spacing between a field or icon and the end of the row.
  if (!prev.isInput && !next) {
    // Between an editable field and the end of the row.
    if (prev.isField() && prev.isEditable) {
      return 5;
    }
    // Between noneditable fields and icons and the end of the row.
    return 10;
  }

  // Between inputs and the end of the row.
  if (prev.isInput && !next) {
    if (prev instanceof Blockly.BlockRendering.ExternalValueInput) {
      return 0;
    } else if (prev instanceof Blockly.BlockRendering.InlineInput) {
      return 10;
    } else if (prev instanceof Blockly.BlockRendering.StatementInput) {
      return 0;
    }
  }

  // Between anything else and the end of the row?  Probably gets folded into
  // the previous two checks.
  if (!next) {
    return 5;
  }

  // Spacing between a field or icon and an input.
  if (!prev.isInput && next.isInput) {
    // Between an editable field and an input.
    if (prev.isEditable) {
      if (next instanceof Blockly.BlockRendering.InlineInput) {
        return 3;
      } else if (next instanceof Blockly.BlockRendering.ExternalValueInput) {
        return 5;
      }
    }
    return 9;
  }

  // Spacing between an icon and an icon or field.
  if (prev.isIcon() && !next.isInput) {
    return 11;
  }

  // Spacing between an inline input and a field.
  if (prev instanceof Blockly.BlockRendering.InlineInput && !next.isInput) {
    // Editable field after inline input.
    if (next.isEditable) {
      return 5;
    } else {
      // Noneditable field after inline input.
      return 10;
    }
  }

  return 5;
};

/**
 * Figure out where the right edge of the block and right edge of statement inputs
 * should be placed.
 * @package
 */
Blockly.BlockRendering.Measure.prototype.computeBounds = function() {
  var widestStatementRowFields = 0;
  var widestValueOrDummyRow = 0;
  var widestRowWithConnectedBlocks = 0;
  for (var r = 0; r < this.rows.length; r++) {
    var row = this.rows[r];
    row.measure();
    if (!row.hasStatement) {
      widestValueOrDummyRow = Math.max(widestValueOrDummyRow, row.width);
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
    this.maxValueOrDummyWidth =
        Math.max(widestValueOrDummyRow,
            widestStatementRowFields + BRC.NOTCH_WIDTH * 2);
  } else {
    this.maxValueOrDummyWidth = widestValueOrDummyRow;
  }

  for (var r = 0; r < this.rows.length; r++) {
    var row = this.rows[r];
    if (row.hasStatement) {
      row.statementEdge = this.statementEdge;
    }
  }

  this.widthWithConnectedBlocks =
      Math.max(widestValueOrDummyRow, widestRowWithConnectedBlocks);
};

/**
 * Extra spacing may be necessary to make sure that the right sides of all
 * rows line up.  This can only be calculated after a first pass to calculate
 * the sizes of all rows.
 * @package
 */
Blockly.BlockRendering.Measure.prototype.alignRowElements = function() {
  for (var r = 0; r < this.rows.length; r++) {
    var row = this.rows[r];
    if (!row.hasStatement && !row.hasInlineInput) {
      var currentWidth = row.width;
      var desiredWidth = this.maxValueOrDummyWidth;
      var missingSpace = desiredWidth - currentWidth;
      if (missingSpace) {
        this.addAlignmentPadding(row, missingSpace);
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
 * @package
 */
Blockly.BlockRendering.Measure.prototype.addAlignmentPadding = function(row, missingSpace) {
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
 * @package
 */
Blockly.BlockRendering.Measure.prototype.addRowSpacing = function() {
  var oldRows = this.rows;
  this.rows = [];

  // There's a spacer before the first row.
  this.rows.push(this.makeSpacerRow(null, oldRows[0]));
  for (var r = 0; r < oldRows.length; r++) {
    this.rows.push(oldRows[r]);
    this.rows.push(this.makeSpacerRow(oldRows[r], oldRows[r + 1]));
  }
};

Blockly.BlockRendering.Measure.prototype.makeSpacerRow = function(prev, next) {
  var height = this.getSpacerRowHeight(prev, next);
  var width = this.getSpacerRowWidth(prev, next);
  return new Blockly.BlockRendering.BetweenRowSpacer(height, width);
};

/**
 * Calculate the width of a spacer row.  Almost all spacers will be the full
 * width of the block, but there are some exceptions (e.g. the small spacer row
 * after a statement input)
 * @param {Blockly.BlockRendering.Row} prev The row before the spacer.
 * @param {Blockly.BlockRendering.Row} next The row after the spacer.
 * @return {number} The desired width of the spacer row between these two rows.
 * @package
 */
Blockly.BlockRendering.Measure.prototype.getSpacerRowWidth = function(prev, next) {
  if (!prev) {
    return this.maxValueOrDummyWidth;
  }

  // spacer row after the last statement input.
  if (!next && prev.hasStatement) {
    if (this.isInline) {
      return this.maxValueOrDummyWidth;
    } else {
      return this.maxValueOrDummyWidth;
    }
  }

  return this.maxValueOrDummyWidth;
};

/**
 * Calculate the height of a spacer row.
 * @param {Blockly.BlockRendering.Row} prev The row before the spacer.
 * @param {Blockly.BlockRendering.Row} next The row after the spacer.
 * @return {number} The desired height of the spacer row between these two rows.
 * @package
 */
Blockly.BlockRendering.Measure.prototype.getSpacerRowHeight = function(prev, next) {
  // First row is always (?) 5.
  if (!prev) {
    if (next && next.hasStatement) {
      return 10;
    }
    return 5;
  }

  // Slightly taller row after the last statement input.
  if (!next && prev.hasStatement) {
    return 10;
  }

  if (!next) {
    return 5;
  }

  if (prev.hasExternalInput && next.hasExternalInput) {
    return 10;
  }
  return 5;
};

/**
 * Make any final changes to the rendering information object.  In particular,
 * store the y position of each row, and record the height of the full block.
 * @package
 */
Blockly.BlockRendering.Measure.prototype.finalize = function() {
  // Performance note: this could be combined with the draw pass, if the time
  // that this takes is excessive.
  var yCursor = 0;
  for (var r = 0; r < this.rows.length; r++) {
    var row = this.rows[r];
    row.yPos = yCursor;
    var xCursor = 0;
    //if (!(row.isSpacer())) {
      if (row instanceof Blockly.BlockRendering.Row) {
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
  this.height = yCursor;
};
