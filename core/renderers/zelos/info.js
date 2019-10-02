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
 * @fileoverview Makecode/scratch-style renderer.
 * Zelos: spirit of eager rivalry, emulation, envy, jealousy, and zeal.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.zelos');
goog.provide('Blockly.zelos.RenderInfo');

goog.require('Blockly.blockRendering.BottomRow');
goog.require('Blockly.blockRendering.ExternalValueInput');
goog.require('Blockly.blockRendering.InlineInput');
goog.require('Blockly.blockRendering.InputRow');
goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.NextConnection');
goog.require('Blockly.blockRendering.OutputConnection');
goog.require('Blockly.blockRendering.PreviousConnection');
goog.require('Blockly.blockRendering.RenderInfo');
goog.require('Blockly.blockRendering.RoundCorner');
goog.require('Blockly.blockRendering.Row');
goog.require('Blockly.blockRendering.SquareCorner');
goog.require('Blockly.blockRendering.SpacerRow');
goog.require('Blockly.blockRendering.StatementInput');
goog.require('Blockly.blockRendering.TopRow');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');
goog.require('Blockly.zelos.AfterStatementSpacerRow');
goog.require('Blockly.zelos.BeforeStatementSpacerRow');
goog.require('Blockly.zelos.BottomRow');
goog.require('Blockly.zelos.TopRow');


/**
 * An object containing all sizing information needed to draw this block.
 *
 * This measure pass does not propagate changes to the block (although fields
 * may choose to rerender when getSize() is called).  However, calling it
 * repeatedly may be expensive.
 *
 * @param {!Blockly.zelos.Renderer} renderer The renderer in use.
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @constructor
 * @package
 * @extends {Blockly.blockRendering.RenderInfo}
 */
Blockly.zelos.RenderInfo = function(renderer, block) {
  Blockly.zelos.RenderInfo.superClass_.constructor.call(this, renderer, block);

  /**
   * An object with rendering information about the top row of the block.
   * @type {!Blockly.zelos.TopRow}
   * @override
   */
  this.topRow = new Blockly.zelos.TopRow(this.constants_);

  /**
   * An object with rendering information about the bottom row of the block.
   * @type {!Blockly.zelos.BottomRow}
   * @override
   */
  this.bottomRow = new Blockly.zelos.BottomRow(this.constants_);
};
Blockly.utils.object.inherits(Blockly.zelos.RenderInfo,
    Blockly.blockRendering.RenderInfo);

/**
 * Get the block renderer in use.
 * @return {!Blockly.zelos.Renderer} The block renderer in use.
 * @package
 */
Blockly.zelos.RenderInfo.prototype.getRenderer = function() {
  return /** @type {!Blockly.zelos.Renderer} */ (this.renderer_);
};

/**
 * Create all non-spacer elements that belong on the top row.
 * @package
 * @override
 */
Blockly.zelos.RenderInfo.prototype.populateTopRow_ = function() {
  Blockly.zelos.RenderInfo.superClass_.populateTopRow_.call(this);

  var rightSquareCorner = this.topRow.hasRightSquareCorner(this.block_);

  if (rightSquareCorner) {
    this.topRow.elements.push(
        new Blockly.blockRendering.SquareCorner(this.constants_, 'right'));
  } else {
    this.topRow.elements.push(
        new Blockly.blockRendering.RoundCorner(this.constants_, 'right'));
  }
};

/**
 * Create all non-spacer elements that belong on the bottom row.
 * @package
 * @override
 */
Blockly.zelos.RenderInfo.prototype.populateBottomRow_ = function() {
  Blockly.zelos.RenderInfo.superClass_.populateBottomRow_.call(this);

  var rightSquareCorner = this.bottomRow.hasRightSquareCorner(this.block_);

  if (rightSquareCorner) {
    this.bottomRow.elements.push(
        new Blockly.blockRendering.SquareCorner(this.constants_, 'right'));
  } else {
    this.bottomRow.elements.push(
        new Blockly.blockRendering.RoundCorner(this.constants_, 'right'));
  }
};

/**
 * @override
 */
Blockly.zelos.RenderInfo.prototype.getInRowSpacing_ = function(prev, next) {
  if (!prev || !next) {
    // No need for padding at the beginning or end of the row if the
    // output shape is dynamic.
    if (this.outputConnection && this.outputConnection.isDynamic()) {
      return this.constants_.NO_PADDING;
    }
  }
  if (!prev) {
    // Between an editable field and the beginning of the row.
    if (next && Blockly.blockRendering.Types.isField(next) && next.isEditable) {
      return this.constants_.MEDIUM_PADDING;
    }
    // Inline input at the beginning of the row.
    if (next && Blockly.blockRendering.Types.isInlineInput(next)) {
      return this.constants_.MEDIUM_LARGE_PADDING;
    }
    if (next && Blockly.blockRendering.Types.isStatementInput(next)) {
      return this.constants_.STATEMENT_INPUT_PADDING_LEFT;
    }
    // Anything else at the beginning of the row.
    return this.constants_.LARGE_PADDING;
  }

  // Spacing between a non-input and the end of the row.
  if (!Blockly.blockRendering.Types.isInput(prev) && !next) {
    // Between an editable field and the end of the row.
    if (Blockly.blockRendering.Types.isField(prev) && prev.isEditable) {
      return this.constants_.MEDIUM_PADDING;
    }
    // Padding at the end of an icon-only row to make the block shape clearer.
    if (Blockly.blockRendering.Types.isIcon(prev)) {
      return (this.constants_.LARGE_PADDING * 2) + 1;
    }
    if (Blockly.blockRendering.Types.isHat(prev)) {
      return this.constants_.NO_PADDING;
    }
    // Establish a minimum width for a block with a previous or next connection.
    if (Blockly.blockRendering.Types.isPreviousOrNextConnection(prev)) {
      return this.constants_.LARGE_PADDING;
    }
    // Between rounded corner and the end of the row.
    if (Blockly.blockRendering.Types.isLeftRoundedCorner(prev)) {
      return this.constants_.MIN_BLOCK_WIDTH;
    }
    // Between a right rounded corner and the end of the row.
    if (Blockly.blockRendering.Types.isRightRoundedCorner(prev)) {
      return this.constants_.NO_PADDING;
    }
    // Between a jagged edge and the end of the row.
    if (Blockly.blockRendering.Types.isJaggedEdge(prev)) {
      return this.constants_.NO_PADDING;
    }
    // Between noneditable fields and icons and the end of the row.
    return this.constants_.LARGE_PADDING;
  }

  // Between inputs and the end of the row.
  if (Blockly.blockRendering.Types.isInput(prev) && !next) {
    if (Blockly.blockRendering.Types.isExternalInput(prev)) {
      return this.constants_.NO_PADDING;
    } else if (Blockly.blockRendering.Types.isInlineInput(prev)) {
      return this.constants_.LARGE_PADDING;
    } else if (Blockly.blockRendering.Types.isStatementInput(prev)) {
      return this.constants_.NO_PADDING;
    }
  }

  // Spacing between a non-input and an input.
  if (!Blockly.blockRendering.Types.isInput(prev) &&
      next && Blockly.blockRendering.Types.isInput(next)) {
    // Between an editable field and an input.
    if (prev.isEditable) {
      if (Blockly.blockRendering.Types.isInlineInput(next)) {
        return this.constants_.SMALL_PADDING;
      } else if (Blockly.blockRendering.Types.isExternalInput(next)) {
        return this.constants_.SMALL_PADDING;
      }
    } else {
      if (Blockly.blockRendering.Types.isInlineInput(next)) {
        return this.constants_.MEDIUM_LARGE_PADDING;
      } else if (Blockly.blockRendering.Types.isExternalInput(next)) {
        return this.constants_.MEDIUM_LARGE_PADDING;
      } else if (Blockly.blockRendering.Types.isStatementInput(next)) {
        return this.constants_.LARGE_PADDING;
      }
    }
    return this.constants_.LARGE_PADDING - 1;
  }

  // Spacing between an icon and an icon or field.
  if (Blockly.blockRendering.Types.isIcon(prev) &&
      next && !Blockly.blockRendering.Types.isInput(next)) {
    return this.constants_.LARGE_PADDING;
  }

  // Spacing between an inline input and a field.
  if (Blockly.blockRendering.Types.isInlineInput(prev) &&
      next && !Blockly.blockRendering.Types.isInput(next)) {
    // Editable field after inline input.
    if (next.isEditable) {
      return this.constants_.MEDIUM_PADDING;
    } else {
      // Noneditable field after inline input.
      return this.constants_.LARGE_PADDING;
    }
  }

  if (Blockly.blockRendering.Types.isLeftSquareCorner(prev) && next) {
    // Spacing between a hat and a corner
    if (Blockly.blockRendering.Types.isHat(next)) {
      return this.constants_.NO_PADDING;
    }
    // Spacing between a square corner and a previous or next connection
    if (Blockly.blockRendering.Types.isPreviousConnection(next) ||
        Blockly.blockRendering.Types.isNextConnection(next)) {
      return next.notchOffset;
    }
  }

  // Spacing between a rounded corner and a previous or next connection.
  if (Blockly.blockRendering.Types.isLeftRoundedCorner(prev) && next) {
    if (Blockly.blockRendering.Types.isPreviousConnection(next) ||
        Blockly.blockRendering.Types.isNextConnection(next)) {
      return next.notchOffset - this.constants_.CORNER_RADIUS;
    }
  }

  // Spacing between two fields of the same editability.
  if (!Blockly.blockRendering.Types.isInput(prev) &&
      next && !Blockly.blockRendering.Types.isInput(next) &&
      (prev.isEditable == next.isEditable)) {
    return this.constants_.LARGE_PADDING;
  }

  // Spacing between anything and a jagged edge.
  if (next && Blockly.blockRendering.Types.isJaggedEdge(next)) {
    return this.constants_.LARGE_PADDING;
  }

  return this.constants_.MEDIUM_PADDING;
};

/**
 * Create a spacer row to go between prev and next, and set its size.
 * @param {?Blockly.blockRendering.Row} prev The previous row, or null.
 * @param {?Blockly.blockRendering.Row} next The next row, or null.
 * @return {!Blockly.blockRendering.SpacerRow} The newly created spacer row.
 * @protected
 */
Blockly.zelos.RenderInfo.prototype.makeSpacerRow_ = function(prev, next) {
  var height = this.getSpacerRowHeight_(prev, next);
  var width = this.getSpacerRowWidth_(prev, next);
  if (Blockly.blockRendering.Types.isInputRow(next) && next.hasStatement) {
    var spacer =
        new Blockly.zelos.BeforeStatementSpacerRow(
            this.constants_,
            Math.max(height, this.constants_.INSIDE_CORNERS.rightHeight || 0),
            width);
  } else if (Blockly.blockRendering.Types.isInputRow(prev) && prev.hasStatement) {
    var spacer =
        new Blockly.zelos.AfterStatementSpacerRow(
            this.constants_,
            Math.max(height, this.constants_.INSIDE_CORNERS.rightHeight || 0),
            width);
  } else {
    var spacer = new Blockly.blockRendering.SpacerRow(
        this.constants_, height, width);
  }
  if (prev.hasStatement) {
    spacer.followsStatement = true;
  }
  return spacer;
};


/**
 * @override
 */
Blockly.zelos.RenderInfo.prototype.getSpacerRowHeight_ = function(
    prev, next) {
  // If we have an empty block add a spacer to increase the height.
  if (Blockly.blockRendering.Types.isTopRow(prev) &&
      Blockly.blockRendering.Types.isBottomRow(next)) {
    return this.constants_.EMPTY_BLOCK_SPACER_HEIGHT;
  }
  // Top and bottom rows act as a spacer so we don't need any extra padding.
  if ((Blockly.blockRendering.Types.isTopRow(prev) && !prev.hasPreviousConnection)) {
    return this.constants_.NO_PADDING;
  }
  if ((Blockly.blockRendering.Types.isBottomRow(next) && !next.hasNextConnection)) {
    return this.constants_.NO_PADDING;
  }
  return this.constants_.MEDIUM_PADDING;
};

/**
 * Modify the given row to add the given amount of padding around its fields.
 * The exact location of the padding is based on the alignment property of the
 * last input in the field.
 * @param {Blockly.blockRendering.Row} row The row to add padding to.
 * @param {number} missingSpace How much padding to add.
 * @protected
 */
Blockly.zelos.RenderInfo.prototype.addAlignmentPadding_ = function(row,
    missingSpace) {
  var lastSpacer = row.getLastSpacer();
  if (lastSpacer) {
    lastSpacer.width += missingSpace;
    row.width += missingSpace;
  }
};

/**
 * @override
 */
Blockly.zelos.RenderInfo.prototype.finalize_ = function() {
  // Performance note: this could be combined with the draw pass, if the time
  // that this takes is excessive.  But it shouldn't be, because it only
  // accesses and sets properties that already exist on the objects.
  var yCursor = 0;
  for (var i = 0, row; (row = this.rows[i]); i++) {
    row.yPos = yCursor;
    yCursor += row.height;
  }
  // Dynamic output connections depend on the height of the block. Adjust the
  // height and width of the connection, and then adjust the startX and width of the
  // block accordingly.
  var outputConnectionWidth = 0;
  if (this.outputConnection && !this.outputConnection.height) {
    this.outputConnection.height = yCursor;
    outputConnectionWidth = yCursor; // Twice the width to account for the right side.
    this.outputConnection.width = outputConnectionWidth / 2;
  }
  this.startX += outputConnectionWidth / 2;
  this.width += outputConnectionWidth;

  var widestRowWithConnectedBlocks = 0;
  for (var i = 0, row; (row = this.rows[i]); i++) {
    row.xPos = this.startX;

    widestRowWithConnectedBlocks =
        Math.max(widestRowWithConnectedBlocks, row.widthWithConnectedBlocks);
    this.recordElemPositions_(row);
  }

  this.widthWithChildren = widestRowWithConnectedBlocks + this.startX;

  this.height = yCursor;
  this.startY = this.topRow.capline;
  this.bottomRow.baseline = yCursor - this.bottomRow.descenderHeight;
};
