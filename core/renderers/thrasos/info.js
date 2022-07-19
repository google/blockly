/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview New (evolving) renderer.
 * Thrasos: spirit of boldness.
 */
'use strict';

/**
 * New (evolving) renderer.
 * Thrasos: spirit of boldness.
 * @class
 */
goog.module('Blockly.thrasos.RenderInfo');

/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const {BottomRow} = goog.requireType('Blockly.blockRendering.BottomRow');
/* eslint-disable-next-line no-unused-vars */
const {Field} = goog.requireType('Blockly.blockRendering.Field');
const {InRowSpacer} = goog.require('Blockly.blockRendering.InRowSpacer');
const {RenderInfo: BaseRenderInfo} = goog.require('Blockly.blockRendering.RenderInfo');
/* eslint-disable-next-line no-unused-vars */
const {Renderer} = goog.requireType('Blockly.thrasos.Renderer');
/* eslint-disable-next-line no-unused-vars */
const {TopRow} = goog.requireType('Blockly.blockRendering.TopRow');
const {Types} = goog.require('Blockly.blockRendering.Types');


/**
 * An object containing all sizing information needed to draw this block.
 *
 * This measure pass does not propagate changes to the block (although fields
 * may choose to rerender when getSize() is called).  However, calling it
 * repeatedly may be expensive.
 * @extends {BaseRenderInfo}
 * @alias Blockly.thrasos.RenderInfo
 */
class RenderInfo extends BaseRenderInfo {
  /**
   * @param {!Renderer} renderer The renderer in use.
   * @param {!BlockSvg} block The block to measure.
   * @package
   */
  constructor(renderer, block) {
    super(renderer, block);
  }

  /**
   * Get the block renderer in use.
   * @return {!Renderer} The block renderer in use.
   * @package
   */
  getRenderer() {
    return /** @type {!Renderer} */ (this.renderer_);
  }

  /**
   * @override
   */
  addElemSpacing_() {
    let hasExternalInputs = false;
    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i];
      if (row.hasExternalInput) {
        hasExternalInputs = true;
        break;
      }
    }
    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i];
      const oldElems = row.elements;
      row.elements = [];
      // No spacing needed before the corner on the top row or the bottom row.
      if (row.startsWithElemSpacer()) {
        // There's a spacer before the first element in the row.
        row.elements.push(new InRowSpacer(
            this.constants_, this.getInRowSpacing_(null, oldElems[0])));
      }
      for (let e = 0; e < oldElems.length - 1; e++) {
        row.elements.push(oldElems[e]);
        const spacing = this.getInRowSpacing_(oldElems[e], oldElems[e + 1]);
        row.elements.push(new InRowSpacer(this.constants_, spacing));
      }
      row.elements.push(oldElems[oldElems.length - 1]);
      if (row.endsWithElemSpacer()) {
        let spacing =
            this.getInRowSpacing_(oldElems[oldElems.length - 1], null);
        if (hasExternalInputs && row.hasDummyInput) {
          spacing += this.constants_.TAB_WIDTH;
        }
        // There's a spacer after the last element in the row.
        row.elements.push(new InRowSpacer(this.constants_, spacing));
      }
    }
  }

  /**
   * @override
   */
  getInRowSpacing_(prev, next) {
    if (!prev) {
      // Between an editable field and the beginning of the row.
      if (next && Types.isField(next) &&
          (/** @type {Field} */ (next)).isEditable) {
        return this.constants_.MEDIUM_PADDING;
      }
      // Inline input at the beginning of the row.
      if (next && Types.isInlineInput(next)) {
        return this.constants_.MEDIUM_LARGE_PADDING;
      }
      if (next && Types.isStatementInput(next)) {
        return this.constants_.STATEMENT_INPUT_PADDING_LEFT;
      }
      // Anything else at the beginning of the row.
      return this.constants_.LARGE_PADDING;
    }

    // Spacing between a non-input and the end of the row.
    if (!Types.isInput(prev) && !next) {
      // Between an editable field and the end of the row.
      if (Types.isField(prev) && (/** @type {Field} */ (prev)).isEditable) {
        return this.constants_.MEDIUM_PADDING;
      }
      // Padding at the end of an icon-only row to make the block shape clearer.
      if (Types.isIcon(prev)) {
        return (this.constants_.LARGE_PADDING * 2) + 1;
      }
      if (Types.isHat(prev)) {
        return this.constants_.NO_PADDING;
      }
      // Establish a minimum width for a block with a previous or next
      // connection.
      if (Types.isPreviousOrNextConnection(prev)) {
        return this.constants_.LARGE_PADDING;
      }
      // Between rounded corner and the end of the row.
      if (Types.isLeftRoundedCorner(prev)) {
        return this.constants_.MIN_BLOCK_WIDTH;
      }
      // Between a jagged edge and the end of the row.
      if (Types.isJaggedEdge(prev)) {
        return this.constants_.NO_PADDING;
      }
      // Between noneditable fields and icons and the end of the row.
      return this.constants_.LARGE_PADDING;
    }

    // Between inputs and the end of the row.
    if (Types.isInput(prev) && !next) {
      if (Types.isExternalInput(prev)) {
        return this.constants_.NO_PADDING;
      } else if (Types.isInlineInput(prev)) {
        return this.constants_.LARGE_PADDING;
      } else if (Types.isStatementInput(prev)) {
        return this.constants_.NO_PADDING;
      }
    }

    // Spacing between a non-input and an input.
    if (!Types.isInput(prev) && next && Types.isInput(next)) {
      // Between an editable field and an input.
      if (Types.isField(prev) && (/** @type {Field} */ (prev)).isEditable) {
        if (Types.isInlineInput(next)) {
          return this.constants_.SMALL_PADDING;
        } else if (Types.isExternalInput(next)) {
          return this.constants_.SMALL_PADDING;
        }
      } else {
        if (Types.isInlineInput(next)) {
          return this.constants_.MEDIUM_LARGE_PADDING;
        } else if (Types.isExternalInput(next)) {
          return this.constants_.MEDIUM_LARGE_PADDING;
        } else if (Types.isStatementInput(next)) {
          return this.constants_.LARGE_PADDING;
        }
      }
      return this.constants_.LARGE_PADDING - 1;
    }

    // Spacing between an icon and an icon or field.
    if (Types.isIcon(prev) && next && !Types.isInput(next)) {
      return this.constants_.LARGE_PADDING;
    }

    // Spacing between an inline input and a field.
    if (Types.isInlineInput(prev) && next && Types.isField(next)) {
      // Editable field after inline input.
      if ((/** @type {Field} */ (next)).isEditable) {
        return this.constants_.MEDIUM_PADDING;
      } else {
        // Noneditable field after inline input.
        return this.constants_.LARGE_PADDING;
      }
    }

    if (Types.isLeftSquareCorner(prev) && next) {
      // Spacing between a hat and a corner
      if (Types.isHat(next)) {
        return this.constants_.NO_PADDING;
      }
      // Spacing between a square corner and a previous or next connection
      if (Types.isPreviousConnection(next) || Types.isNextConnection(next)) {
        return next.notchOffset;
      }
    }

    // Spacing between a rounded corner and a previous or next connection.
    if (Types.isLeftRoundedCorner(prev) && next) {
      return next.notchOffset - this.constants_.CORNER_RADIUS;
    }

    // Spacing between two fields of the same editability.
    if (Types.isField(prev) && next && Types.isField(next) &&
        ((/** @type {Field} */ (prev)).isEditable ===
         (/** @type {Field} */ (next)).isEditable)) {
      return this.constants_.LARGE_PADDING;
    }

    // Spacing between anything and a jagged edge.
    if (next && Types.isJaggedEdge(next)) {
      return this.constants_.LARGE_PADDING;
    }

    return this.constants_.MEDIUM_PADDING;
  }

  /**
   * @override
   */
  getSpacerRowHeight_(prev, next) {
    // If we have an empty block add a spacer to increase the height.
    if (Types.isTopRow(prev) && Types.isBottomRow(next)) {
      return this.constants_.EMPTY_BLOCK_SPACER_HEIGHT;
    }
    // Top and bottom rows act as a spacer so we don't need any extra padding.
    if (Types.isTopRow(prev) || Types.isBottomRow(next)) {
      return this.constants_.NO_PADDING;
    }
    if (prev.hasExternalInput && next.hasExternalInput) {
      return this.constants_.LARGE_PADDING;
    }
    if (!prev.hasStatement && next.hasStatement) {
      return this.constants_.BETWEEN_STATEMENT_PADDING_Y;
    }
    if (prev.hasStatement && next.hasStatement) {
      return this.constants_.LARGE_PADDING;
    }
    if (prev.hasDummyInput || next.hasDummyInput) {
      return this.constants_.LARGE_PADDING;
    }
    return this.constants_.MEDIUM_PADDING;
  }

  /**
   * @override
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

    let result = row.yPos;
    if (Types.isField(elem) && row.hasStatement) {
      const offset =
          this.constants_.TALL_INPUT_FIELD_OFFSET_Y + elem.height / 2;
      result += offset;
    } else {
      result += (row.height / 2);
    }
    return result;
  }

  /**
   * @override
   */
  finalize_() {
    // Performance note: this could be combined with the draw pass, if the time
    // that this takes is excessive.  But it shouldn't be, because it only
    // accesses and sets properties that already exist on the objects.
    let widestRowWithConnectedBlocks = 0;
    let yCursor = 0;
    for (let i = 0; i < this.rows.length; i++) {
      const row = this.rows[i];
      row.yPos = yCursor;
      row.xPos = this.startX;
      yCursor += row.height;

      widestRowWithConnectedBlocks =
          Math.max(widestRowWithConnectedBlocks, row.widthWithConnectedBlocks);
      // Add padding to the bottom row if block height is less than minimum
      const heightWithoutHat = yCursor - this.topRow.ascenderHeight;
      if (row === this.bottomRow &&
          heightWithoutHat < this.constants_.MIN_BLOCK_HEIGHT) {
        // But the hat height shouldn't be part of this.
        const diff = this.constants_.MIN_BLOCK_HEIGHT - heightWithoutHat;
        this.bottomRow.height += diff;
        yCursor += diff;
      }
      this.recordElemPositions_(row);
    }
    if (this.outputConnection && this.block_.nextConnection &&
        this.block_.nextConnection.isConnected()) {
      // Include width of connected block in value to stack width measurement.
      widestRowWithConnectedBlocks = Math.max(
          widestRowWithConnectedBlocks,
          this.block_.nextConnection.targetBlock().getHeightWidth().width);
    }

    this.bottomRow.baseline = yCursor - this.bottomRow.descenderHeight;
    this.widthWithChildren = widestRowWithConnectedBlocks + this.startX;

    this.height = yCursor;
    this.startY = this.topRow.capline;
  }
}

exports.RenderInfo = RenderInfo;
