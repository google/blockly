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
 * @fileoverview Methods for graphically rendering a block as SVG.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.blockRendering.RenderInfo');

goog.require('Blockly.blockRendering.BottomRow');
goog.require('Blockly.blockRendering.ExternalValueInput');
goog.require('Blockly.blockRendering.Hat');
goog.require('Blockly.blockRendering.InlineInput');
goog.require('Blockly.blockRendering.InRowSpacer');
goog.require('Blockly.blockRendering.InputRow');
goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.NextConnection');
goog.require('Blockly.blockRendering.OutputConnection');
goog.require('Blockly.blockRendering.PreviousConnection');
goog.require('Blockly.blockRendering.RoundCorner');
goog.require('Blockly.blockRendering.Row');
goog.require('Blockly.blockRendering.SpacerRow');
goog.require('Blockly.blockRendering.StatementInput');
goog.require('Blockly.blockRendering.SquareCorner');
goog.require('Blockly.blockRendering.TopRow');
goog.require('Blockly.blockRendering.Types');


/**
 * An object containing all sizing information needed to draw this block.
 *
 * This measure pass does not propagate changes to the block (although fields
 * may choose to rerender when getSize() is called).  However, calling it
 * repeatedly may be expensive.
 *
 * @param {!Blockly.blockRendering.Renderer} renderer The renderer in use.
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @constructor
 * @package
 */
Blockly.blockRendering.RenderInfo = function(renderer, block) {
  this.block_ = block;

  /**
   * The block renderer in use.
   * @type {!Blockly.blockRendering.Renderer}
   * @protected
   */
  this.renderer_ = renderer;

  /**
   * The renderer's constant provider.
   * @type {!Blockly.blockRendering.ConstantProvider}
   * @protected
   */
  this.constants_ = this.renderer_.getConstants();

  /**
   * A measurable representing the output connection if the block has one.
   * Otherwise null.
   * @type {Blockly.blockRendering.OutputConnection}
   */
  this.outputConnection = !block.outputConnection ? null :
      new Blockly.blockRendering.OutputConnection(
          this.constants_,
          /** @type {Blockly.RenderedConnection} */(block.outputConnection));

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
   * @type {!Array.<!Blockly.blockRendering.Row>}
   */
  this.rows = [];

  /**
   * An array of measurable objects containing hidden icons.
   * @type {!Array.<!Blockly.blockRendering.Icon>}
   */
  this.hiddenIcons = [];

  /**
   * An object with rendering information about the top row of the block.
   * @type {!Blockly.blockRendering.TopRow}
   */
  this.topRow = new Blockly.blockRendering.TopRow(this.constants_);

  /**
   * An object with rendering information about the bottom row of the block.
   * @type {!Blockly.blockRendering.BottomRow}
   */
  this.bottomRow = new Blockly.blockRendering.BottomRow(this.constants_);

  // The position of the start point for drawing, relative to the block's
  // location.
  this.startX = 0;
  this.startY = 0;
};

/**
 * Get the block renderer in use.
 * @return {!Blockly.blockRendering.Renderer} The block renderer in use.
 * @package
 */
Blockly.blockRendering.RenderInfo.prototype.getRenderer = function() {
  return this.renderer_;
};

/**
 * Populate and return an object containing all sizing information needed to
 * draw this block.
 *
 * This measure pass does not propagate changes to the block (although fields
 * may choose to rerender when getSize() is called).  However, calling it
 * repeatedly may be expensive.
 *
 * @package
 */
Blockly.blockRendering.RenderInfo.prototype.measure = function() {
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
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.createRows_ = function() {
  this.populateTopRow_();
  this.rows.push(this.topRow);
  var activeRow = new Blockly.blockRendering.InputRow(this.constants_);

  // Icons always go on the first row, before anything else.
  var icons = this.block_.getIcons();
  if (icons.length) {
    for (var i = 0, icon; (icon = icons[i]); i++) {
      var iconInfo = new Blockly.blockRendering.Icon(this.constants_, icon);
      if (this.isCollapsed && icon.collapseHidden) {
        this.hiddenIcons.push(iconInfo);
      } else {
        activeRow.elements.push(iconInfo);
      }
    }
  }

  var lastInput = null;
  // Loop across all of the inputs on the block, creating objects for anything
  // that needs to be rendered and breaking the block up into visual rows.
  for (var i = 0, input; (input = this.block_.inputList[i]); i++) {
    if (!input.isVisible()) {
      continue;
    }
    if (this.shouldStartNewRow_(input, lastInput)) {
      // Finish this row and create a new one.
      this.rows.push(activeRow);
      activeRow = new Blockly.blockRendering.InputRow(this.constants_);
    }

    // All of the fields in an input go on the same row.
    for (var j = 0, field; (field = input.fieldRow[j]); j++) {
      activeRow.elements.push(
          new Blockly.blockRendering.Field(this.constants_, field, input));
    }
    this.addInput_(input, activeRow);
    lastInput = input;
  }

  if (this.isCollapsed) {
    activeRow.hasJaggedEdge = true;
    activeRow.elements.push(
        new Blockly.blockRendering.JaggedEdge(this.constants_));
  }

  if (activeRow.elements.length || activeRow.hasDummyInput) {
    this.rows.push(activeRow);
  }
  this.populateBottomRow_();
  this.rows.push(this.bottomRow);
};

/**
 * Create all non-spacer elements that belong on the top row.
 * @package
 */
Blockly.blockRendering.RenderInfo.prototype.populateTopRow_ = function() {
  var hasPrevious = !!this.block_.previousConnection;
  var hasHat = (this.block_.hat ?
    this.block_.hat === 'cap' : Blockly.BlockSvg.START_HAT) &&
    !this.outputConnection && !hasPrevious;
  var leftSquareCorner = this.topRow.hasLeftSquareCorner(this.block_);

  if (leftSquareCorner) {
    this.topRow.elements.push(
        new Blockly.blockRendering.SquareCorner(this.constants_));
  } else {
    this.topRow.elements.push(
        new Blockly.blockRendering.RoundCorner(this.constants_));
  }

  if (hasHat) {
    var hat = new Blockly.blockRendering.Hat(this.constants_);
    this.topRow.elements.push(hat);
    this.topRow.capline = hat.ascenderHeight;
  } else if (hasPrevious) {
    this.topRow.hasPreviousConnection = true;
    this.topRow.connection = new Blockly.blockRendering.PreviousConnection(
        this.constants_,
        /** @type {Blockly.RenderedConnection} */
        (this.block_.previousConnection));
    this.topRow.elements.push(this.topRow.connection);
  }

  var precedesStatement = this.block_.inputList.length &&
      this.block_.inputList[0].type == Blockly.NEXT_STATEMENT;

  // This is the minimum height for the row. If one of its elements has a
  // greater height it will be overwritten in the compute pass.
  if (precedesStatement && !this.block_.isCollapsed()) {
    this.topRow.minHeight = this.constants_.LARGE_PADDING;
  } else {
    this.topRow.minHeight = this.constants_.MEDIUM_PADDING;
  }
};

/**
 * Create all non-spacer elements that belong on the bottom row.
 * @package
 */
Blockly.blockRendering.RenderInfo.prototype.populateBottomRow_ = function() {
  this.bottomRow.hasNextConnection = !!this.block_.nextConnection;

  var followsStatement =
      this.block_.inputList.length &&
      this.block_.inputList[this.block_.inputList.length - 1]
          .type == Blockly.NEXT_STATEMENT;

  // This is the minimum height for the row. If one of its elements has a
  // greater height it will be overwritten in the compute pass.
  if (followsStatement) {
    this.bottomRow.minHeight = this.constants_.LARGE_PADDING;
  } else {
    this.bottomRow.minHeight = this.constants_.MEDIUM_PADDING - 1;
  }

  var leftSquareCorner = this.bottomRow.hasLeftSquareCorner(this.block_);

  if (leftSquareCorner) {
    this.bottomRow.elements.push(
        new Blockly.blockRendering.SquareCorner(this.constants_));
  } else {
    this.bottomRow.elements.push(
        new Blockly.blockRendering.RoundCorner(this.constants_));
  }

  if (this.bottomRow.hasNextConnection) {
    this.bottomRow.connection = new Blockly.blockRendering.NextConnection(
        this.constants_,
        /** @type {Blockly.RenderedConnection} */ (this.block_.nextConnection));
    this.bottomRow.elements.push(this.bottomRow.connection);
  }
};

/**
 * Add an input element to the active row, if needed, and record the type of the
 * input on the row.
 * @param {!Blockly.Input} input The input to record information about.
 * @param {!Blockly.blockRendering.Row} activeRow The row that is currently being
 *     populated.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.addInput_ = function(input, activeRow) {
  // Non-dummy inputs have visual representations onscreen.
  if (this.isInline && input.type == Blockly.INPUT_VALUE) {
    activeRow.elements.push(
        new Blockly.blockRendering.InlineInput(this.constants_, input));
    activeRow.hasInlineInput = true;
  } else if (input.type == Blockly.NEXT_STATEMENT) {
    activeRow.elements.push(
        new Blockly.blockRendering.StatementInput(this.constants_, input));
    activeRow.hasStatement = true;
  } else if (input.type == Blockly.INPUT_VALUE) {
    activeRow.elements.push(
        new Blockly.blockRendering.ExternalValueInput(this.constants_, input));
    activeRow.hasExternalInput = true;
  } else if (input.type == Blockly.DUMMY_INPUT) {
    // Dummy inputs have no visual representation, but the information is still
    // important.
    activeRow.minHeight = Math.max(activeRow.minHeight,
        this.constants_.DUMMY_INPUT_MIN_HEIGHT);
    activeRow.hasDummyInput = true;
  }
  activeRow.align = input.align;
};

/**
 * Decide whether to start a new row between the two Blockly.Inputs.
 * @param {!Blockly.Input} input The first input to consider
 * @param {Blockly.Input} lastInput The input that follows.
 * @return {boolean} True if the next input should be rendered on a new row.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.shouldStartNewRow_ = function(input, lastInput) {
  // If this is the first input, just add to the existing row.
  // That row is either empty or has some icons in it.
  if (!lastInput) {
    return false;
  }
  // A statement input or an input following one always gets a new row.
  if (input.type == Blockly.NEXT_STATEMENT ||
      lastInput.type == Blockly.NEXT_STATEMENT) {
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
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.addElemSpacing_ = function() {
  for (var i = 0, row; (row = this.rows[i]); i++) {
    var oldElems = row.elements;
    row.elements = [];
    // No spacing needed before the corner on the top row or the bottom row.
    if (row.startsWithElemSpacer()) {
      // There's a spacer before the first element in the row.
      row.elements.push(new Blockly.blockRendering.InRowSpacer(
          this.constants_, this.getInRowSpacing_(null, oldElems[0])));
    }
    for (var e = 0; e < oldElems.length - 1; e++) {
      row.elements.push(oldElems[e]);
      var spacing = this.getInRowSpacing_(oldElems[e], oldElems[e + 1]);
      row.elements.push(
          new Blockly.blockRendering.InRowSpacer(this.constants_, spacing));
    }
    row.elements.push(oldElems[oldElems.length - 1]);
    if (row.endsWithElemSpacer()) {
      // There's a spacer after the last element in the row.
      row.elements.push(new Blockly.blockRendering.InRowSpacer(
          this.constants_,
          this.getInRowSpacing_(oldElems[oldElems.length - 1], null)));
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
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.getInRowSpacing_ = function(prev, next) {
  // Between inputs and the end of the row.
  if (prev && Blockly.blockRendering.Types.isInput(prev) && !next) {
    if (Blockly.blockRendering.Types.isExternalInput(prev)) {
      return this.constants_.NO_PADDING;
    } else if (Blockly.blockRendering.Types.isInlineInput(prev)) {
      return this.constants_.LARGE_PADDING;
    } else if (Blockly.blockRendering.Types.isStatementInput(prev)) {
      return this.constants_.NO_PADDING;
    }
  }

  // Spacing between a square corner and a previous or next connection
  if (prev && Blockly.blockRendering.Types.isLeftSquareCorner(prev) && next) {
    if (Blockly.blockRendering.Types.isPreviousConnection(next) ||
        Blockly.blockRendering.Types.isNextConnection(next)) {
      return next.notchOffset;
    }
  }

  // Spacing between a rounded corner and a previous or next connection.
  if (prev && Blockly.blockRendering.Types.isLeftRoundedCorner(prev) && next) {
    if (Blockly.blockRendering.Types.isPreviousConnection(next) ||
      Blockly.blockRendering.Types.isNextConnection(next)) {
      return next.notchOffset - this.constants_.CORNER_RADIUS;
    }
  }

  return this.constants_.MEDIUM_PADDING;
};

/**
 * Figure out where the right edge of the block and right edge of statement inputs
 * should be placed.
 * @protected
 */
// TODO: More cleanup.
Blockly.blockRendering.RenderInfo.prototype.computeBounds_ = function() {
  var widestStatementRowFields = 0;
  var blockWidth = 0;
  var widestRowWithConnectedBlocks = 0;
  for (var i = 0, row; (row = this.rows[i]); i++) {
    row.measure();
    blockWidth = Math.max(blockWidth, row.width);
    if (row.hasStatement) {
      var statementInput = row.getLastInput();
      var innerWidth = row.width - statementInput.width;
      widestStatementRowFields = Math.max(widestStatementRowFields, innerWidth);
    }
    widestRowWithConnectedBlocks =
        Math.max(widestRowWithConnectedBlocks, row.widthWithConnectedBlocks);
  }


  this.statementEdge = widestStatementRowFields;

  this.width = blockWidth;

  for (var i = 0, row; (row = this.rows[i]); i++) {
    if (row.hasStatement) {
      row.statementEdge = this.statementEdge;
    }
  }

  this.widthWithChildren = Math.max(blockWidth, widestRowWithConnectedBlocks);

  if (this.outputConnection) {
    this.startX = this.outputConnection.width;
    this.width += this.outputConnection.width;
    this.widthWithChildren += this.outputConnection.width;
  }
};

/**
 * Extra spacing may be necessary to make sure that the right sides of all
 * rows line up.  This can only be calculated after a first pass to calculate
 * the sizes of all rows.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.alignRowElements_ = function() {
  for (var i = 0, row; (row = this.rows[i]); i++) {
    if (row.hasStatement) {
      this.alignStatementRow_(
          /** @type {!Blockly.blockRendering.InputRow} */ (row));
    } else {
      var currentWidth = row.width;
      var desiredWidth = this.width - this.startX;
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
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.addAlignmentPadding_ = function(row,
    missingSpace) {
  var lastSpacer = row.getLastSpacer();
  if (lastSpacer) {
    lastSpacer.width += missingSpace;
    row.width += missingSpace;
  }
};

/**
 * Align the elements of a statement row based on computed bounds.
 * Unlike other types of rows, statement rows add space in multiple places.
 * @param {!Blockly.blockRendering.InputRow} row The statement row to resize.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.alignStatementRow_ = function(row) {
  var statementInput = row.getLastInput();
  var currentWidth = row.width - statementInput.width;
  var desiredWidth = this.statementEdge;
  // Add padding before the statement input.
  var missingSpace = desiredWidth - currentWidth;
  if (missingSpace) {
    this.addAlignmentPadding_(row, missingSpace);
  }
  // Also widen the statement input to reach to the right side of the
  // block. Note that this does not add padding.
  currentWidth = row.width;
  var rightCornerWidth = this.constants_.INSIDE_CORNERS.rightWidth || 0;
  desiredWidth = this.width - this.startX - rightCornerWidth;
  statementInput.width += (desiredWidth - currentWidth);
  row.width += (desiredWidth - currentWidth);
  row.widthWithConnectedBlocks = Math.max(row.width,
      this.statementEdge + row.connectedBlockWidths);
};

/**
 * Add spacers between rows and set their sizes.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.addRowSpacing_ = function() {
  var oldRows = this.rows;
  this.rows = [];

  for (var r = 0; r < oldRows.length; r++) {
    this.rows.push(oldRows[r]);
    if (r != oldRows.length - 1) {
      this.rows.push(this.makeSpacerRow_(oldRows[r], oldRows[r + 1]));
    }
  }
};

/**
 * Create a spacer row to go between prev and next, and set its size.
 * @param {!Blockly.blockRendering.Row} prev The previous row.
 * @param {!Blockly.blockRendering.Row} next The next row.
 * @return {!Blockly.blockRendering.SpacerRow} The newly created spacer row.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.makeSpacerRow_ = function(prev, next) {
  var height = this.getSpacerRowHeight_(prev, next);
  var width = this.getSpacerRowWidth_(prev, next);
  var spacer = new Blockly.blockRendering.SpacerRow(
      this.constants_, height, width);
  if (prev.hasStatement) {
    spacer.followsStatement = true;
  }
  return spacer;
};

/**
 * Calculate the width of a spacer row.
 * @param {!Blockly.blockRendering.Row} _prev The row before the spacer.
 * @param {!Blockly.blockRendering.Row} _next The row after the spacer.
 * @return {number} The desired width of the spacer row between these two rows.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.getSpacerRowWidth_ = function(
    _prev, _next) {
  return this.width - this.startX;
};

/**
 * Calculate the height of a spacer row.
 * @param {!Blockly.blockRendering.Row} _prev The row before the spacer.
 * @param {!Blockly.blockRendering.Row} _next The row after the spacer.
 * @return {number} The desired height of the spacer row between these two rows.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.getSpacerRowHeight_ = function(
    _prev, _next) {
  return this.constants_.MEDIUM_PADDING;
};

/**
 * Calculate the centerline of an element in a rendered row.
 * This base implementation puts the centerline at the middle of the row
 * vertically, with no special cases.  You will likely need extra logic to
 * handle (at minimum) top and bottom rows.
 * @param {!Blockly.blockRendering.Row} row The row containing the element.
 * @param {!Blockly.blockRendering.Measurable} elem The element to place.
 * @return {number} The desired centerline of the given element, as an offset
 *     from the top left of the block.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.getElemCenterline_ = function(row,
    elem) {
  if (Blockly.blockRendering.Types.isSpacer(elem)) {
    return row.yPos + elem.height / 2;
  }
  if (Blockly.blockRendering.Types.isBottomRow(row)) {
    var baseline = row.yPos + row.height - row.descenderHeight;
    if (Blockly.blockRendering.Types.isNextConnection(elem)) {
      return baseline + elem.height / 2;
    }
    return baseline - elem.height / 2;
  }
  if (Blockly.blockRendering.Types.isTopRow(row)) {
    if (Blockly.blockRendering.Types.isHat(elem)) {
      return row.capline - elem.height / 2;
    }
    return row.capline + elem.height / 2;
  }
  return row.yPos + row.height / 2;
};

/**
 * Record final position information on elements on the given row, for use in
 * drawing.  At minimum this records xPos and centerline on each element.
 * @param {!Blockly.blockRendering.Row} row The row containing the elements.
 * @private
 */
Blockly.blockRendering.RenderInfo.prototype.recordElemPositions_ = function(
    row) {
  var xCursor = row.xPos;
  for (var j = 0, elem; (elem = row.elements[j]); j++) {
    // Now that row heights are finalized, make spacers use the row height.
    if (Blockly.blockRendering.Types.isSpacer(elem)) {
      elem.height = row.height;
    }
    elem.xPos = xCursor;
    elem.centerline = this.getElemCenterline_(row, elem);
    xCursor += elem.width;
  }
};

/**
 * Make any final changes to the rendering information object.  In particular,
 * store the y position of each row, and record the height of the full block.
 * @protected
 */
Blockly.blockRendering.RenderInfo.prototype.finalize_ = function() {
  // Performance note: this could be combined with the draw pass, if the time
  // that this takes is excessive.  But it shouldn't be, because it only
  // accesses and sets properties that already exist on the objects.
  var widestRowWithConnectedBlocks = 0;
  var yCursor = 0;
  for (var i = 0, row; (row = this.rows[i]); i++) {
    row.yPos = yCursor;
    row.xPos = this.startX;
    yCursor += row.height;

    widestRowWithConnectedBlocks =
        Math.max(widestRowWithConnectedBlocks, row.widthWithConnectedBlocks);
    this.recordElemPositions_(row);
  }

  this.widthWithChildren = widestRowWithConnectedBlocks + this.startX;

  this.height = yCursor;
  this.startY = this.topRow.capline;
  this.bottomRow.baseline = yCursor - this.bottomRow.descenderHeight;
};
