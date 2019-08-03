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

'use strict';

goog.provide('Blockly.blockRendering.RenderInfo');

goog.require('Blockly.blockRendering.constants');
goog.require('Blockly.blockRendering.Measurable');

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
Blockly.blockRendering.RenderInfo = function(block) {
  this.block_ = block;

  /**
   * A measurable representing the output connection if the block has one.
   * Otherwise null.
   * @type {Blockly.blockRendering.OutputConnection}
   */
  this.outputConnection = !block.outputConnection ? null :
      new Blockly.blockRendering.OutputConnection();

  /**
   * Whether the block should be rendered as a single line, either because it's
   * inline or because it has been collapsed.
   * @type {boolean}
   */
  this.isInline = block.getInputsInline() && !block.isCollapsed();

  /**
   * Whether the block is collapsed.
   * @type {boolean}
   */
  this.isCollapsed = block.isCollapsed();

  /**
   * Whether the block is an insertion marker.  Insertion markers are the same
   * shape as normal blocks, but don't show fields.
   * @type {boolean}
   */
  this.isInsertionMarker = block.isInsertionMarker();

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

  /**
   * An array of measureable objects containing hidden icons.
   * @type {!Array.<!Blockly.blockRendering.Icon>}
   */
  this.hiddenIcons = [];

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
Blockly.blockRendering.RenderInfo.prototype.measure_ = function() {
  this.createRows_();
  this.addElemSpacing_();
  this.computeBounds_();
  this.alignRowElements_();
  this.addRowSpacing_();
  this.finalize_();
};

/**
 * Create rows of Measurable objects representing all renderable parts of the
 * block.
 * @param {!Blockly.BlockSvg}  block The block to create rows from.
 * @private
 */
Blockly.blockRendering.RenderInfo.prototype.createRows_ = function() {
  this.createTopRow_();
  this.rows.push(this.topRow);

  var activeRow = new Blockly.blockRendering.Row();

  // Icons always go on the first row, before anything else.
  var icons = this.block_.getIcons();
  if (icons.length) {
    for (var i = 0; i < icons.length; i++) {
      var icon = icons[i];
      var iconInfo = new Blockly.blockRendering.Icon(icon);
      if (this.isCollapsed && icon.collapseHidden) {
        this.hiddenIcons.push(iconInfo);
      } else {
        activeRow.elements.push(iconInfo);
      }
    }
  }

  var lastInput = undefined;
  // Loop across all of the inputs on the block, creating objects for anything
  // that needs to be rendered and breaking the block up into visual rows.
  for (var i = 0; i < this.block_.inputList.length; i++) {
    var input = this.block_.inputList[i];
    if (!input.isVisible()) {
      continue;
    }
    if (this.shouldStartNewRow_(input, lastInput)) {
      // Finish this row and create a new one.
      this.rows.push(activeRow);
      activeRow = new Blockly.blockRendering.Row();
    }

    // All of the fields in an input go on the same row.
    for (var f = 0; f < input.fieldRow.length; f++) {
      var field = input.fieldRow[f];
      activeRow.elements.push(new Blockly.blockRendering.Field(field, input));
    }
    this.addInput_(input, activeRow);
    lastInput = input;
  }

  if (this.isCollapsed) {
    activeRow.hasJaggedEdge = true;
    activeRow.elements.push(new Blockly.blockRendering.JaggedEdge());
  }

  if (activeRow.elements.length) {
    this.rows.push(activeRow);
  }
  this.createBottomRow_();
  this.rows.push(this.bottomRow);
};

/**
 * Create the top row and fill the elements list with all non-spacer elements
 * created.
 */
Blockly.blockRendering.RenderInfo.prototype.createTopRow_ = function() {
  var hasHat = this.block_.hat ? this.block_.hat === 'cap' : Blockly.BlockSvg.START_HAT;
  var hasPrevious = !!this.block_.previousConnection;
  var prevBlock = this.block_.getPreviousBlock();
  var squareCorner = !!this.block_.outputConnection ||
      hasHat || (prevBlock && prevBlock.getNextBlock() == this.block_);
  this.topRow = new Blockly.blockRendering.TopRow(this.block_);

  if (squareCorner) {
    this.topRow.elements.push(new Blockly.blockRendering.SquareCorner());
  } else {
    this.topRow.elements.push(new Blockly.blockRendering.RoundCorner());
  }

  if (hasHat) {
    this.topRow.elements.push(new Blockly.blockRendering.Hat());
  } else if (hasPrevious) {
    this.topRow.elements.push(new Blockly.blockRendering.PreviousConnection());
  }
};

/**
 * Create the bottom row and fill the elements list with all non-spacer elements
 * created.
 */
Blockly.blockRendering.RenderInfo.prototype.createBottomRow_ = function() {
  var squareCorner = !!this.block_.outputConnection || !!this.block_.getNextBlock();
  this.bottomRow = new Blockly.blockRendering.BottomRow(this.block_);

  if (squareCorner) {
    this.bottomRow.elements.push(new Blockly.blockRendering.SquareCorner());
  } else {
    this.bottomRow.elements.push(new Blockly.blockRendering.RoundCorner());
  }

  if (this.bottomRow.hasNextConnection) {
    this.bottomRow.elements.push(new Blockly.blockRendering.NextConnection());
  }
};


/**
 * Add an input element to the active row, if needed, and record the type of the
 * input on the row.
 * @param {!Blockly.Input} input The input to record information about.
 * @param {!Blockly.blockRendering.Row} activeRow The row that is currently being
 *     populated.
 * @private
 */
Blockly.blockRendering.RenderInfo.prototype.addInput_ = function(input, activeRow) {
  // Non-dummy inputs have visual representations onscreen.
  if (this.isInline && input.type == Blockly.INPUT_VALUE) {
    activeRow.elements.push(new Blockly.blockRendering.InlineInput(input));
    activeRow.hasInlineInput = true;
  } else if (input.type == Blockly.NEXT_STATEMENT) {
    activeRow.elements.push(new Blockly.blockRendering.StatementInput(input));
    activeRow.hasStatement = true;
  } else if (input.type == Blockly.INPUT_VALUE) {
    activeRow.elements.push(new Blockly.blockRendering.ExternalValueInput(input));
    activeRow.hasExternalInput = true;
  } else if (input.type == Blockly.DUMMY_INPUT) {
    // Dummy inputs have no visual representation, but the information is still
    // important.
    activeRow.hasDummyInput = true;
  }
};

/**
 * Decide whether to start a new row between the two Blockly.Inputs.
 * @param {!Blockly.Input}  input The first input to consider
 * @param {Blockly.Input}  lastInput The input that follows.
 * @return {boolean} True if the next input should be rendered on a new row.
 * @private
 */
Blockly.blockRendering.RenderInfo.prototype.shouldStartNewRow_ = function(input, lastInput) {
  // If this is the first input, just add to the existing row.
  // That row is either empty or has some icons in it.
  if (!lastInput) {
    return false;
  }
  // A statement input always gets a new row.
  if (input.type == Blockly.NEXT_STATEMENT) {
    return true;
  }
  // Value and dummy inputs get new row if inputs are not inlined.
  if (input.type == Blockly.INPUT_VALUE || input.type == Blockly.DUMMY_INPUT) {
    return !this.isInline;
  }
  return false;
};

/**
 * Add horizontal spacing between and around elements within each row.
 * @private
 */
Blockly.blockRendering.RenderInfo.prototype.addElemSpacing_ = function() {
  for (var r = 0; r < this.rows.length; r++) {
    var row = this.rows[r];
    var oldElems = row.elements;
    row.elements = [];
    // No spacing needed before the corner on the top row or the bottom row.
    if (row.type != 'top row' && row.type != 'bottom row') {
      // There's a spacer before the first element in the row.
      row.elements.push(new Blockly.blockRendering.InRowSpacer(
          this.getInRowSpacing_(null, oldElems[0])));
    }
    for (var e = 0; e < oldElems.length; e++) {
      row.elements.push(oldElems[e]);
      var spacing = this.getInRowSpacing_(oldElems[e], oldElems[e + 1]);
      row.elements.push(new Blockly.blockRendering.InRowSpacer(spacing));
    }
  }
};

/**
 * Calculate the width of a spacer element in a row based on the previous and
 * next elements in that row.  For instance, extra padding is added between two
 * editable fields.
 * @param {Blockly.blockRendering.Measurable} prev The element before the
 *     spacer.
 * @param {Blockly.blockRendering.Measurable} next The element after the spacer.
 * @return {number} The size of the spacing between the two elements.
 * @private
 */
Blockly.blockRendering.RenderInfo.prototype.getInRowSpacing_ = function(prev, next) {
  if (!prev) {
    // Between an editable field and the beginning of the row.
    if (next.isField() && next.isEditable) {
      return Blockly.blockRendering.constants.MEDIUM_PADDING;
    }
    // Inline input at the beginning of the row.
    if (next.isInput && next.isInlineInput()) {
      return Blockly.blockRendering.constants.MEDIUM_LARGE_PADDING;
    }
    if (next.isStatementInput()) {
      return Blockly.blockRendering.constants.STATEMENT_INPUT_PADDING_LEFT;
    }
    // Anything else at the beginning of the row.
    return Blockly.blockRendering.constants.LARGE_PADDING;
  }

  // Spacing between a non-input and the end of the row.
  if (!prev.isInput && !next) {
    // Between an editable field and the end of the row.
    if (prev.isField() && prev.isEditable) {
      return Blockly.blockRendering.constants.MEDIUM_PADDING;
    }
    // Padding at the end of an icon-only row to make the block shape clearer.
    if (prev.isIcon()) {
      return (Blockly.blockRendering.constants.LARGE_PADDING * 2) + 1;
    }
    if (prev.isHat()) {
      return Blockly.blockRendering.constants.NO_PADDING;
    }
    // Establish a minimum width for a block with a previous or next connection.
    if (prev.isPreviousConnection() || prev.isNextConnection()) {
      return Blockly.blockRendering.constants.LARGE_PADDING;
    }
    // Between rounded corner and the end of the row.
    if (prev.isRoundedCorner()) {
      return Blockly.blockRendering.constants.MIN_BLOCK_WIDTH;
    }
    // Between a jagged edge and the end of the row.
    if (prev.isJaggedEdge()) {
      return Blockly.blockRendering.constants.NO_PADDING;
    }
    // Between noneditable fields and icons and the end of the row.
    return Blockly.blockRendering.constants.LARGE_PADDING;
  }

  // Between inputs and the end of the row.
  if (prev.isInput && !next) {
    if (prev.isExternalInput()) {
      return Blockly.blockRendering.constants.NO_PADDING;
    } else if (prev.isInlineInput()) {
      return Blockly.blockRendering.constants.LARGE_PADDING;
    } else if (prev.isStatementInput()) {
      return Blockly.blockRendering.constants.NO_PADDING;
    }
  }

  // Spacing between a non-input and an input.
  if (!prev.isInput && next.isInput) {
    // Between an editable field and an input.
    if (prev.isEditable) {
      if (next.isInlineInput()) {
        return Blockly.blockRendering.constants.SMALL_PADDING;
      } else if (next.isExternalInput()) {
        return Blockly.blockRendering.constants.SMALL_PADDING;
      }
    } else {
      if (next.isInlineInput()) {
        return Blockly.blockRendering.constants.MEDIUM_LARGE_PADDING;
      } else if (next.isExternalInput()) {
        return Blockly.blockRendering.constants.MEDIUM_LARGE_PADDING;
      } else if (next.isStatementInput()) {
        return Blockly.blockRendering.constants.LARGE_PADDING;
      }
    }
    return Blockly.blockRendering.constants.LARGE_PADDING - 1;
  }

  // Spacing between an icon and an icon or field.
  if (prev.isIcon() && !next.isInput) {
    return Blockly.blockRendering.constants.LARGE_PADDING;
  }

  // Spacing between an inline input and a field.
  if (prev.isInlineInput() && !next.isInput) {
    // Editable field after inline input.
    if (next.isEditable) {
      return Blockly.blockRendering.constants.MEDIUM_PADDING;
    } else {
      // Noneditable field after inline input.
      return Blockly.blockRendering.constants.LARGE_PADDING;
    }
  }

  if (prev.isSquareCorner()) {
    // Spacing between a hat and a corner
    if (next.isHat()) {
      return Blockly.blockRendering.constants.NO_PADDING;
    }
    // Spacing between a square corner and a previous or next connection
    if (next.isPreviousConnection()) {
      return Blockly.blockRendering.constants.NOTCH_OFFSET_LEFT;
    } else if (next.isNextConnection()) {
      // Next connections are shifted slightly to the left (in both LTR and RTL)
      // to make the dark path under the previous connection show through.
      var offset = (this.RTL ? 1 : -1) *
          Blockly.blockRendering.constants.DARK_PATH_OFFSET / 2;
      return Blockly.blockRendering.constants.NOTCH_OFFSET_LEFT + offset;
    }
  }

  // Spacing between a rounded corner and a previous or next connection.
  if (prev.isRoundedCorner()) {
    if (next.isPreviousConnection()) {
      return Blockly.blockRendering.constants.NOTCH_OFFSET_ROUNDED_CORNER_PREV;
    } else if (next.isNextConnection()) {
      // Next connections are shifted slightly to the left (in both LTR and RTL)
      // to make the dark path under the previous connection show through.
      var offset = (this.RTL ? 1 : -1) *
          Blockly.blockRendering.constants.DARK_PATH_OFFSET / 2;
      return Blockly.blockRendering.constants.NOTCH_OFFSET_ROUNDED_CORNER_PREV + offset;
    }
  }

  // Spacing between two fields of the same editability.
  if (!prev.isInput && !next.isInput && (prev.isEditable == next.isEditable)) {
    return Blockly.blockRendering.constants.LARGE_PADDING;
  }

  // Spacing between anything and a jagged edge.
  if (next.isJaggedEdge()) {
    return Blockly.blockRendering.constants.LARGE_PADDING;
  }

  return Blockly.blockRendering.constants.MEDIUM_PADDING;
};

/**
 * Figure out where the right edge of the block and right edge of statement inputs
 * should be placed.
 * TODO: More cleanup.
 * @private
 */
Blockly.blockRendering.RenderInfo.prototype.computeBounds_ = function() {
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
            widestStatementRowFields + Blockly.blockRendering.constants.NOTCH.width * 2);
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
Blockly.blockRendering.RenderInfo.prototype.alignRowElements_ = function() {
  for (var r = 0; r < this.rows.length; r++) {
    var row = this.rows[r];
    if (!row.hasStatement && !row.hasInlineInput) {
      var currentWidth = row.width;
      var desiredWidth = this.width;
      if (row.type === 'bottom row' && row.hasFixedWidth) {
        desiredWidth = Blockly.blockRendering.constants.MAX_BOTTOM_WIDTH;
      }
      var missingSpace = desiredWidth - currentWidth;
      if (missingSpace) {
        this.addAlignmentPadding_(row, missingSpace);
      }
    }
  }
};

/**
 * Modify the given row to add the given amount of padding around its fields.
 * The exact location of the padding is based on the alignment property of the
 * last input in the field.
 * @param {Blockly.blockRendering.Row} row The row to add padding to.
 * @param {number} missingSpace How much padding to add.
 * @private
 */
Blockly.blockRendering.RenderInfo.prototype.addAlignmentPadding_ = function(row, missingSpace) {
  var elems = row.elements;
  var input = row.getLastInput();
  if (input) {
    var firstSpacer = row.getFirstSpacer();
    var lastSpacer = row.getLastSpacer();
    if (row.hasExternalInput) {
      // Get the spacer right before the input socket.
      lastSpacer = elems[elems.length - 3];
    }
    // Decide where the extra padding goes.
    if (input.align == Blockly.ALIGN_LEFT) {
      // Add padding to the end of the row.
      lastSpacer.width += missingSpace;
    } else if (input.align == Blockly.ALIGN_CENTRE) {
      // Split the padding between the beginning and end of the row.
      firstSpacer.width += missingSpace / 2;
      lastSpacer.width += missingSpace / 2;
    } else if (input.align == Blockly.ALIGN_RIGHT) {
      // Add padding at the beginning of the row.
      firstSpacer.width += missingSpace;
    }
    row.width += missingSpace;
    // Top and bottom rows are always left aligned.
  } else if (row.type === 'top row' || row.type === 'bottom row') {
    row.getLastSpacer().width += missingSpace;
    row.width += missingSpace;
  }
};

/**
 * Add spacers between rows and set their sizes.
 * @private
 */
Blockly.blockRendering.RenderInfo.prototype.addRowSpacing_ = function() {
  var oldRows = this.rows;
  this.rows = [];

  for (var r = 0; r < oldRows.length; r++) {
    this.rows.push(oldRows[r]);
    if (r !== oldRows.length - 1) {
      this.rows.push(this.makeSpacerRow_(oldRows[r], oldRows[r + 1]));
    }
  }
};

/**
 * Create a spacer row to go between prev and next, and set its size.
 * @param {?Blockly.blockRendering.Measurable} prev The previous row, or null.
 * @param {?Blockly.blockRendering.Measurable} next The next row, or null.
 * @return {!Blockly.BlockSvg.BetweenRowSpacer} The newly created spacer row.
 * @private
 */
Blockly.blockRendering.RenderInfo.prototype.makeSpacerRow_ = function(prev, next) {
  var height = this.getSpacerRowHeight_(prev, next);
  var width = this.getSpacerRowWidth_(prev, next);
  var spacer = new Blockly.blockRendering.BetweenRowSpacer(height, width);
  if (prev.hasStatement) {
    spacer.followsStatement = true;
  }
  return spacer;
};

/**
 * Calculate the width of a spacer row.  Almost all spacers will be the full
 * width of the block, but there are some exceptions (e.g. the small spacer row
 * after a statement input)
 * @param {Blockly.blockRendering.Row} prev The row before the spacer.
 * @param {Blockly.blockRendering.Row} next The row after the spacer.
 * @return {number} The desired width of the spacer row between these two rows.
 * @private
 */
Blockly.blockRendering.RenderInfo.prototype.getSpacerRowWidth_ = function(prev, next) {
  // The width of the spacer before the bottom row should be the same as the
  // bottom row.
  if (next.type === 'bottom row' && next.hasFixedWidth) {
    return next.width;
  }
  return this.width;
};

/**
 * Calculate the height of a spacer row.
 * @param {Blockly.blockRendering.Row} prev The row before the spacer.
 * @param {Blockly.blockRendering.Row} next The row after the spacer.
 * @return {number} The desired height of the spacer row between these two rows.
 * @private
 */
Blockly.blockRendering.RenderInfo.prototype.getSpacerRowHeight_ = function(prev, next) {
  // If we have an empty block add a spacer to increase the height
  if (prev.type === 'top row' && next.type === 'bottom row') {
    return Blockly.blockRendering.constants.EMPTY_BLOCK_SPACER_HEIGHT;
  }
  // Top and bottom rows act as a spacer so we don't need any extra padding
  if (prev.type === 'top row' || next.type === 'bottom row') {
    return Blockly.blockRendering.constants.NO_PADDING;
  }
  if (prev.hasExternalInput && next.hasExternalInput) {
    return Blockly.blockRendering.constants.LARGE_PADDING;
  }
  if (!prev.hasStatement && next.hasStatement) {
    return Blockly.blockRendering.constants.BETWEEN_STATEMENT_PADDING_Y;
  }
  if (prev.hasStatement && next.hasStatement) {
    return Blockly.blockRendering.constants.LARGE_PADDING;
  }
  if (next.hasDummyInput) {
    return Blockly.blockRendering.constants.LARGE_PADDING;
  }
  return Blockly.blockRendering.constants.MEDIUM_PADDING;
};

/**
 * Calculate the centerline of an element in a rendered row.
 * @param {Blockly.blockRendering.Row} row The row containing the element.
 * @param {Blockly.blockRendering.Measurable} elem The element to place.
 * @return {number} The desired centerline of the given element, as an offset
 *     from the top left of the block.
 * @private
 */
Blockly.blockRendering.RenderInfo.prototype.getElemCenterline_ = function(row, elem) {
  var result = row.yPos;
  if (elem.isField()) {
    result += (elem.height / 2);
    if (row.hasInlineInput || row.hasStatement) {
      result += Blockly.blockRendering.constants.TALL_INPUT_FIELD_OFFSET_Y;
    }
  } else if (elem.isInlineInput()) {
    result += elem.height / 2;
  } else if (elem.isNextConnection()) {
    result += row.height + elem.height / 2;
  } else {
    result += (row.height / 2);
  }
  return result;
};
/**
 * Make any final changes to the rendering information object.  In particular,
 * store the y position of each row, and record the height of the full block.
 * @private
 */
Blockly.blockRendering.RenderInfo.prototype.finalize_ = function() {
  // Performance note: this could be combined with the draw pass, if the time
  // that this takes is excessive.  But it shouldn't be, because it only
  // accesses and sets properties that already exist on the objects.
  var yCursor = 0;
  for (var r = 0; r < this.rows.length; r++) {
    var row = this.rows[r];
    row.yPos = yCursor;
    yCursor += row.height;
    // Add padding to the bottom row if block height is less than minimum
    if (row == this.bottomRow &&
        yCursor < Blockly.blockRendering.constants.MIN_BLOCK_HEIGHT) {
      this.bottomRow.height +=
          Blockly.blockRendering.constants.MIN_BLOCK_HEIGHT - yCursor;
      yCursor = Blockly.blockRendering.constants.MIN_BLOCK_HEIGHT;
    }
    if (!(row.isSpacer())) {
      var xCursor = 0;
      for (var e = 0; e < row.elements.length; e++) {
        var elem = row.elements[e];
        elem.xPos = xCursor;
        elem.centerline = this.getElemCenterline_(row, elem);
        xCursor += elem.width;
      }
    }
  }
  this.blockBottom = yCursor;

  this.height = yCursor;
};
