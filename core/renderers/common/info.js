/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Methods for graphically rendering a block as SVG.
 */
'use strict';

/**
 * Methods for graphically rendering a block as SVG.
 * @class
 */
goog.module('Blockly.blockRendering.RenderInfo');

const {Align} = goog.require('Blockly.Input');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
const {BottomRow} = goog.require('Blockly.blockRendering.BottomRow');
/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
const {ExternalValueInput} = goog.require('Blockly.blockRendering.ExternalValueInput');
const {Field} = goog.require('Blockly.blockRendering.Field');
const {Hat} = goog.require('Blockly.blockRendering.Hat');
const {Icon} = goog.require('Blockly.blockRendering.Icon');
const {InRowSpacer} = goog.require('Blockly.blockRendering.InRowSpacer');
const {InlineInput} = goog.require('Blockly.blockRendering.InlineInput');
const {InputRow} = goog.require('Blockly.blockRendering.InputRow');
/* eslint-disable-next-line no-unused-vars */
const {Input} = goog.requireType('Blockly.Input');
const {JaggedEdge} = goog.require('Blockly.blockRendering.JaggedEdge');
/* eslint-disable-next-line no-unused-vars */
const {Measurable} = goog.requireType('Blockly.blockRendering.Measurable');
const {NextConnection} = goog.require('Blockly.blockRendering.NextConnection');
const {OutputConnection} = goog.require('Blockly.blockRendering.OutputConnection');
const {PreviousConnection} = goog.require('Blockly.blockRendering.PreviousConnection');
/* eslint-disable-next-line no-unused-vars */
const {RenderedConnection} = goog.requireType('Blockly.RenderedConnection');
/* eslint-disable-next-line no-unused-vars */
const {Renderer} = goog.requireType('Blockly.blockRendering.Renderer');
const {RoundCorner} = goog.require('Blockly.blockRendering.RoundCorner');
/* eslint-disable-next-line no-unused-vars */
const {Row} = goog.requireType('Blockly.blockRendering.Row');
const {SpacerRow} = goog.require('Blockly.blockRendering.SpacerRow');
const {SquareCorner} = goog.require('Blockly.blockRendering.SquareCorner');
const {StatementInput} = goog.require('Blockly.blockRendering.StatementInput');
const {TopRow} = goog.require('Blockly.blockRendering.TopRow');
const {Types} = goog.require('Blockly.blockRendering.Types');
const {inputTypes} = goog.require('Blockly.inputTypes');


/**
 * An object containing all sizing information needed to draw this block.
 *
 * This measure pass does not propagate changes to the block (although fields
 * may choose to rerender when getSize() is called).  However, calling it
 * repeatedly may be expensive.
 * @alias Blockly.blockRendering.RenderInfo
 */
class RenderInfo {
  /**
   * @param {!Renderer} renderer The renderer in use.
   * @param {!BlockSvg} block The block to measure.
   * @package
   */
  constructor(renderer, block) {
    this.block_ = block;

    /**
     * The block renderer in use.
     * @type {!Renderer}
     * @protected
     */
    this.renderer_ = renderer;

    /**
     * The renderer's constant provider.
     * @type {!ConstantProvider}
     * @protected
     */
    this.constants_ = this.renderer_.getConstants();

    /**
     * A measurable representing the output connection if the block has one.
     * Otherwise null.
     * @type {OutputConnection}
     */
    this.outputConnection = !block.outputConnection ?
        null :
        new OutputConnection(
            this.constants_,
            /** @type {!RenderedConnection} */ (block.outputConnection));

    /**
     * Whether the block should be rendered as a single line, either because
     * it's inline or because it has been collapsed.
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
     * The width of the rendered block, excluding child blocks.  This is the
     * right edge of the block when rendered LTR.
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
     * @type {!Array<!Row>}
     */
    this.rows = [];

    /**
     * An array of input rows on the block.
     * @type {!Array<!InputRow>}
     */
    this.inputRows = [];

    /**
     * An array of measurable objects containing hidden icons.
     * @type {!Array<!Icon>}
     */
    this.hiddenIcons = [];

    /**
     * An object with rendering information about the top row of the block.
     * @type {!TopRow}
     */
    this.topRow = new TopRow(this.constants_);

    /**
     * An object with rendering information about the bottom row of the block.
     * @type {!BottomRow}
     */
    this.bottomRow = new BottomRow(this.constants_);

    // The position of the start point for drawing, relative to the block's
    // location.
    this.startX = 0;
    this.startY = 0;
  }

  /**
   * Get the block renderer in use.
   * @return {!Renderer} The block renderer in use.
   * @package
   */
  getRenderer() {
    return this.renderer_;
  }

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
  measure() {
    this.createRows_();
    this.addElemSpacing_();
    this.addRowSpacing_();
    this.computeBounds_();
    this.alignRowElements_();
    this.finalize_();
  }

  /**
   * Create rows of Measurable objects representing all renderable parts of the
   * block.
   * @protected
   */
  createRows_() {
    this.populateTopRow_();
    this.rows.push(this.topRow);
    let activeRow = new InputRow(this.constants_);
    this.inputRows.push(activeRow);

    // Icons always go on the first row, before anything else.
    const icons = this.block_.getIcons();
    for (let i = 0, icon; (icon = icons[i]); i++) {
      const iconInfo = new Icon(this.constants_, icon);
      if (this.isCollapsed && icon.collapseHidden) {
        this.hiddenIcons.push(iconInfo);
      } else {
        activeRow.elements.push(iconInfo);
      }
    }

    let lastInput = null;
    // Loop across all of the inputs on the block, creating objects for anything
    // that needs to be rendered and breaking the block up into visual rows.
    for (let i = 0, input; (input = this.block_.inputList[i]); i++) {
      if (!input.isVisible()) {
        continue;
      }
      if (this.shouldStartNewRow_(input, lastInput)) {
        // Finish this row and create a new one.
        this.rows.push(activeRow);
        activeRow = new InputRow(this.constants_);
        this.inputRows.push(activeRow);
      }

      // All of the fields in an input go on the same row.
      for (let j = 0, field; (field = input.fieldRow[j]); j++) {
        activeRow.elements.push(new Field(this.constants_, field, input));
      }
      this.addInput_(input, activeRow);
      lastInput = input;
    }

    if (this.isCollapsed) {
      activeRow.hasJaggedEdge = true;
      activeRow.elements.push(new JaggedEdge(this.constants_));
    }

    if (activeRow.elements.length || activeRow.hasDummyInput) {
      this.rows.push(activeRow);
    }
    this.populateBottomRow_();
    this.rows.push(this.bottomRow);
  }

  /**
   * Create all non-spacer elements that belong on the top row.
   * @package
   */
  populateTopRow_() {
    const hasPrevious = !!this.block_.previousConnection;
    const hasHat = (this.block_.hat ? this.block_.hat === 'cap' :
                                      this.constants_.ADD_START_HATS) &&
        !this.outputConnection && !hasPrevious;

    let cornerClass = this.topRow.hasLeftSquareCorner(this.block_) ?
        SquareCorner :
        RoundCorner;
    this.topRow.elements.push(new cornerClass(this.constants_));

    if (hasHat) {
      const hat = new Hat(this.constants_);
      this.topRow.elements.push(hat);
      this.topRow.capline = hat.ascenderHeight;
    } else if (hasPrevious) {
      this.topRow.hasPreviousConnection = true;
      this.topRow.connection = new PreviousConnection(
          this.constants_,
          /** @type {!RenderedConnection} */
          (this.block_.previousConnection));
      this.topRow.elements.push(this.topRow.connection);
    }

    const precedesStatement = this.block_.inputList.length &&
        this.block_.inputList[0].type === inputTypes.STATEMENT;

    // This is the minimum height for the row. If one of its elements has a
    // greater height it will be overwritten in the compute pass.
    if (precedesStatement && !this.block_.isCollapsed()) {
      this.topRow.minHeight =
          this.constants_.TOP_ROW_PRECEDES_STATEMENT_MIN_HEIGHT;
    } else {
      this.topRow.minHeight = this.constants_.TOP_ROW_MIN_HEIGHT;
    }

    cornerClass = this.topRow.hasRightSquareCorner(this.block_) ? SquareCorner :
                                                                  RoundCorner;
    this.topRow.elements.push(new cornerClass(this.constants_, 'right'));
  }

  /**
   * Create all non-spacer elements that belong on the bottom row.
   * @package
   */
  populateBottomRow_() {
    this.bottomRow.hasNextConnection = !!this.block_.nextConnection;

    const followsStatement = this.block_.inputList.length &&
        this.block_.inputList[this.block_.inputList.length - 1].type ===
            inputTypes.STATEMENT;

    // This is the minimum height for the row. If one of its elements has a
    // greater height it will be overwritten in the compute pass.
    if (followsStatement) {
      this.bottomRow.minHeight =
          this.constants_.BOTTOM_ROW_AFTER_STATEMENT_MIN_HEIGHT;
    } else {
      this.bottomRow.minHeight = this.constants_.BOTTOM_ROW_MIN_HEIGHT;
    }

    const leftSquareCorner = this.bottomRow.hasLeftSquareCorner(this.block_);

    if (leftSquareCorner) {
      this.bottomRow.elements.push(new SquareCorner(this.constants_));
    } else {
      this.bottomRow.elements.push(new RoundCorner(this.constants_));
    }

    if (this.bottomRow.hasNextConnection) {
      this.bottomRow.connection = new NextConnection(
          this.constants_,
          /** @type {!RenderedConnection} */ (this.block_.nextConnection));
      this.bottomRow.elements.push(this.bottomRow.connection);
    }

    const rightSquareCorner = this.bottomRow.hasRightSquareCorner(this.block_);

    if (rightSquareCorner) {
      this.bottomRow.elements.push(new SquareCorner(this.constants_, 'right'));
    } else {
      this.bottomRow.elements.push(new RoundCorner(this.constants_, 'right'));
    }
  }

  /**
   * Add an input element to the active row, if needed, and record the type of
   * the input on the row.
   * @param {!Input} input The input to record information about.
   * @param {!Row} activeRow The row that is currently being
   *     populated.
   * @protected
   */
  addInput_(input, activeRow) {
    // Non-dummy inputs have visual representations onscreen.
    if (this.isInline && input.type === inputTypes.VALUE) {
      activeRow.elements.push(new InlineInput(this.constants_, input));
      activeRow.hasInlineInput = true;
    } else if (input.type === inputTypes.STATEMENT) {
      activeRow.elements.push(new StatementInput(this.constants_, input));
      activeRow.hasStatement = true;
    } else if (input.type === inputTypes.VALUE) {
      activeRow.elements.push(new ExternalValueInput(this.constants_, input));
      activeRow.hasExternalInput = true;
    } else if (input.type === inputTypes.DUMMY) {
      // Dummy inputs have no visual representation, but the information is
      // still important.
      activeRow.minHeight = Math.max(
          activeRow.minHeight,
          input.getSourceBlock() && input.getSourceBlock().isShadow() ?
              this.constants_.DUMMY_INPUT_SHADOW_MIN_HEIGHT :
              this.constants_.DUMMY_INPUT_MIN_HEIGHT);
      activeRow.hasDummyInput = true;
    }
    if (activeRow.align === null) {
      activeRow.align = input.align;
    }
  }

  /**
   * Decide whether to start a new row between the two Blockly.Inputs.
   * @param {!Input} input The first input to consider
   * @param {Input} lastInput The input that follows.
   * @return {boolean} True if the next input should be rendered on a new row.
   * @protected
   */
  shouldStartNewRow_(input, lastInput) {
    // If this is the first input, just add to the existing row.
    // That row is either empty or has some icons in it.
    if (!lastInput) {
      return false;
    }
    // A statement input or an input following one always gets a new row.
    if (input.type === inputTypes.STATEMENT ||
        lastInput.type === inputTypes.STATEMENT) {
      return true;
    }
    // Value and dummy inputs get new row if inputs are not inlined.
    if (input.type === inputTypes.VALUE || input.type === inputTypes.DUMMY) {
      return !this.isInline;
    }
    return false;
  }

  /**
   * Add horizontal spacing between and around elements within each row.
   * @protected
   */
  addElemSpacing_() {
    for (let i = 0, row; (row = this.rows[i]); i++) {
      const oldElems = row.elements;
      row.elements = [];
      // No spacing needed before the corner on the top row or the bottom row.
      if (row.startsWithElemSpacer()) {
        // There's a spacer before the first element in the row.
        row.elements.push(new InRowSpacer(
            this.constants_, this.getInRowSpacing_(null, oldElems[0])));
      }
      if (!oldElems.length) {
        continue;
      }
      for (let e = 0; e < oldElems.length - 1; e++) {
        row.elements.push(oldElems[e]);
        const spacing = this.getInRowSpacing_(oldElems[e], oldElems[e + 1]);
        row.elements.push(new InRowSpacer(this.constants_, spacing));
      }
      row.elements.push(oldElems[oldElems.length - 1]);
      if (row.endsWithElemSpacer()) {
        // There's a spacer after the last element in the row.
        row.elements.push(new InRowSpacer(
            this.constants_,
            this.getInRowSpacing_(oldElems[oldElems.length - 1], null)));
      }
    }
  }

  /**
   * Calculate the width of a spacer element in a row based on the previous and
   * next elements in that row.  For instance, extra padding is added between
   * two editable fields.
   * @param {Measurable} prev The element before the
   *     spacer.
   * @param {Measurable} next The element after the spacer.
   * @return {number} The size of the spacing between the two elements.
   * @protected
   */
  getInRowSpacing_(prev, next) {
    if (!prev) {
      // Statement input padding.
      if (next && Types.isStatementInput(next)) {
        return this.constants_.STATEMENT_INPUT_PADDING_LEFT;
      }
    }
    // Between inputs and the end of the row.
    if (prev && Types.isInput(prev) && !next) {
      if (Types.isExternalInput(prev)) {
        return this.constants_.NO_PADDING;
      } else if (Types.isInlineInput(prev)) {
        return this.constants_.LARGE_PADDING;
      } else if (Types.isStatementInput(prev)) {
        return this.constants_.NO_PADDING;
      }
    }

    // Spacing between a square corner and a previous or next connection
    if (prev && Types.isLeftSquareCorner(prev) && next) {
      if (Types.isPreviousConnection(next) || Types.isNextConnection(next)) {
        return next.notchOffset;
      }
    }

    // Spacing between a rounded corner and a previous or next connection.
    if (prev && Types.isLeftRoundedCorner(prev) && next) {
      if (Types.isPreviousConnection(next) || Types.isNextConnection(next)) {
        return next.notchOffset - this.constants_.CORNER_RADIUS;
      }
    }

    return this.constants_.MEDIUM_PADDING;
  }

  /**
   * Figure out where the right edge of the block and right edge of statement
   * inputs should be placed.
   * @protected
   */
  computeBounds_() {
    let widestStatementRowFields = 0;
    let blockWidth = 0;
    let widestRowWithConnectedBlocks = 0;
    for (let i = 0, row; (row = this.rows[i]); i++) {
      row.measure();
      blockWidth = Math.max(blockWidth, row.width);
      if (row.hasStatement) {
        const statementInput = row.getLastInput();
        const innerWidth = row.width - statementInput.width;
        widestStatementRowFields =
            Math.max(widestStatementRowFields, innerWidth);
      }
      widestRowWithConnectedBlocks =
          Math.max(widestRowWithConnectedBlocks, row.widthWithConnectedBlocks);
    }

    this.statementEdge = widestStatementRowFields;
    this.width = blockWidth;

    for (let i = 0, row; (row = this.rows[i]); i++) {
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
  }

  /**
   * Extra spacing may be necessary to make sure that the right sides of all
   * rows line up.  This can only be calculated after a first pass to calculate
   * the sizes of all rows.
   * @protected
   */
  alignRowElements_() {
    for (let i = 0, row; (row = this.rows[i]); i++) {
      if (row.hasStatement) {
        this.alignStatementRow_(
            /** @type {!InputRow} */ (row));
      } else {
        const currentWidth = row.width;
        const desiredWidth = this.getDesiredRowWidth_(row);
        const missingSpace = desiredWidth - currentWidth;
        if (missingSpace > 0) {
          this.addAlignmentPadding_(row, missingSpace);
        }
        if (Types.isTopOrBottomRow(row)) {
          row.widthWithConnectedBlocks = row.width;
        }
      }
    }
  }

  /**
   * Calculate the desired width of an input row.
   * @param {!Row} _row The input row.
   * @return {number} The desired width of the input row.
   * @protected
   */
  getDesiredRowWidth_(_row) {
    return this.width - this.startX;
  }

  /**
   * Modify the given row to add the given amount of padding around its fields.
   * The exact location of the padding is based on the alignment property of the
   * last input in the field.
   * @param {!Row} row The row to add padding to.
   * @param {number} missingSpace How much padding to add.
   * @protected
   */
  addAlignmentPadding_(row, missingSpace) {
    const firstSpacer = row.getFirstSpacer();
    const lastSpacer = row.getLastSpacer();
    if (row.hasExternalInput || row.hasStatement) {
      row.widthWithConnectedBlocks += missingSpace;
    }

    // Decide where the extra padding goes.
    if (row.align === Align.LEFT) {
      // Add padding to the end of the row.
      lastSpacer.width += missingSpace;
    } else if (row.align === Align.CENTRE) {
      // Split the padding between the beginning and end of the row.
      firstSpacer.width += missingSpace / 2;
      lastSpacer.width += missingSpace / 2;
    } else if (row.align === Align.RIGHT) {
      // Add padding at the beginning of the row.
      firstSpacer.width += missingSpace;
    } else {
      // Default to left-aligning.
      lastSpacer.width += missingSpace;
    }
    row.width += missingSpace;
  }

  /**
   * Align the elements of a statement row based on computed bounds.
   * Unlike other types of rows, statement rows add space in multiple places.
   * @param {!InputRow} row The statement row to resize.
   * @protected
   */
  alignStatementRow_(row) {
    const statementInput = row.getLastInput();
    let currentWidth = row.width - statementInput.width;
    let desiredWidth = this.statementEdge;
    // Add padding before the statement input.
    const missingSpace = desiredWidth - currentWidth;
    if (missingSpace > 0) {
      this.addAlignmentPadding_(row, missingSpace);
    }
    // Also widen the statement input to reach to the right side of the
    // block. Note that this does not add padding.
    currentWidth = row.width;
    desiredWidth = this.getDesiredRowWidth_(row);
    statementInput.width += (desiredWidth - currentWidth);
    statementInput.height = Math.max(statementInput.height, row.height);
    row.width += (desiredWidth - currentWidth);
    row.widthWithConnectedBlocks =
        Math.max(row.width, this.statementEdge + row.connectedBlockWidths);
  }

  /**
   * Add spacers between rows and set their sizes.
   * @protected
   */
  addRowSpacing_() {
    const oldRows = this.rows;
    this.rows = [];

    for (let r = 0; r < oldRows.length; r++) {
      this.rows.push(oldRows[r]);
      if (r !== oldRows.length - 1) {
        this.rows.push(this.makeSpacerRow_(oldRows[r], oldRows[r + 1]));
      }
    }
  }

  /**
   * Create a spacer row to go between prev and next, and set its size.
   * @param {!Row} prev The previous row.
   * @param {!Row} next The next row.
   * @return {!SpacerRow} The newly created spacer row.
   * @protected
   */
  makeSpacerRow_(prev, next) {
    const height = this.getSpacerRowHeight_(prev, next);
    const width = this.getSpacerRowWidth_(prev, next);
    const spacer = new SpacerRow(this.constants_, height, width);
    if (prev.hasStatement) {
      spacer.followsStatement = true;
    }
    if (next.hasStatement) {
      spacer.precedesStatement = true;
    }
    return spacer;
  }

  /**
   * Calculate the width of a spacer row.
   * @param {!Row} _prev The row before the spacer.
   * @param {!Row} _next The row after the spacer.
   * @return {number} The desired width of the spacer row between these two
   *     rows.
   * @protected
   */
  getSpacerRowWidth_(_prev, _next) {
    return this.width - this.startX;
  }

  /**
   * Calculate the height of a spacer row.
   * @param {!Row} _prev The row before the spacer.
   * @param {!Row} _next The row after the spacer.
   * @return {number} The desired height of the spacer row between these two
   *     rows.
   * @protected
   */
  getSpacerRowHeight_(_prev, _next) {
    return this.constants_.MEDIUM_PADDING;
  }

  /**
   * Calculate the centerline of an element in a rendered row.
   * This base implementation puts the centerline at the middle of the row
   * vertically, with no special cases.  You will likely need extra logic to
   * handle (at minimum) top and bottom rows.
   * @param {!Row} row The row containing the element.
   * @param {!Measurable} elem The element to place.
   * @return {number} The desired centerline of the given element, as an offset
   *     from the top left of the block.
   * @protected
   */
  getElemCenterline_(row, elem) {
    if (Types.isSpacer(elem)) {
      return row.yPos + elem.height / 2;
    }
    if (Types.isBottomRow(row)) {
      const bottomRow = /** @type {!BottomRow} */ (row);
      const baseline =
          bottomRow.yPos + bottomRow.height - bottomRow.descenderHeight;
      if (Types.isNextConnection(elem)) {
        return baseline + elem.height / 2;
      }
      return baseline - elem.height / 2;
    }
    if (Types.isTopRow(row)) {
      const topRow = /** @type {!TopRow} */ (row);
      if (Types.isHat(elem)) {
        return topRow.capline - elem.height / 2;
      }
      return topRow.capline + elem.height / 2;
    }
    return row.yPos + row.height / 2;
  }

  /**
   * Record final position information on elements on the given row, for use in
   * drawing.  At minimum this records xPos and centerline on each element.
   * @param {!Row} row The row containing the elements.
   * @protected
   */
  recordElemPositions_(row) {
    let xCursor = row.xPos;
    for (let j = 0, elem; (elem = row.elements[j]); j++) {
      // Now that row heights are finalized, make spacers use the row height.
      if (Types.isSpacer(elem)) {
        elem.height = row.height;
      }
      elem.xPos = xCursor;
      elem.centerline = this.getElemCenterline_(row, elem);
      xCursor += elem.width;
    }
  }

  /**
   * Make any final changes to the rendering information object.  In particular,
   * store the y position of each row, and record the height of the full block.
   * @protected
   */
  finalize_() {
    // Performance note: this could be combined with the draw pass, if the time
    // that this takes is excessive.  But it shouldn't be, because it only
    // accesses and sets properties that already exist on the objects.
    let widestRowWithConnectedBlocks = 0;
    let yCursor = 0;
    for (let i = 0, row; (row = this.rows[i]); i++) {
      row.yPos = yCursor;
      row.xPos = this.startX;
      yCursor += row.height;

      widestRowWithConnectedBlocks =
          Math.max(widestRowWithConnectedBlocks, row.widthWithConnectedBlocks);
      this.recordElemPositions_(row);
    }
    if (this.outputConnection && this.block_.nextConnection &&
        this.block_.nextConnection.isConnected()) {
      // Include width of connected block in value to stack width measurement.
      widestRowWithConnectedBlocks = Math.max(
          widestRowWithConnectedBlocks,
          this.block_.nextConnection.targetBlock().getHeightWidth().width);
    }

    this.widthWithChildren = widestRowWithConnectedBlocks + this.startX;

    this.height = yCursor;
    this.startY = this.topRow.capline;
    this.bottomRow.baseline = yCursor - this.bottomRow.descenderHeight;
  }
}

exports.RenderInfo = RenderInfo;
