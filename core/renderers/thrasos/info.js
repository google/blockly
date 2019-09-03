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
 * @fileoverview New (evolving) renderer.
 * Thrasos: spirit of boldness.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.thrasos');
goog.provide('Blockly.thrasos.RenderInfo');

goog.require('Blockly.blockRendering.RenderInfo');
goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.blockRendering.BottomRow');
goog.require('Blockly.blockRendering.InputRow');
goog.require('Blockly.blockRendering.Row');
goog.require('Blockly.blockRendering.SpacerRow');
goog.require('Blockly.blockRendering.TopRow');

goog.require('Blockly.blockRendering.InlineInput');
goog.require('Blockly.blockRendering.ExternalValueInput');
goog.require('Blockly.blockRendering.StatementInput');

goog.require('Blockly.blockRendering.PreviousConnection');
goog.require('Blockly.blockRendering.NextConnection');
goog.require('Blockly.blockRendering.OutputConnection');

goog.require('Blockly.RenderedConnection');

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
 * @extends {Blockly.blockRendering.RenderInfo}
 */
Blockly.thrasos.RenderInfo = function(block) {
  Blockly.thrasos.RenderInfo.superClass_.constructor.call(this, block);
};
goog.inherits(Blockly.thrasos.RenderInfo, Blockly.blockRendering.RenderInfo);

/**
 * @override
 */
Blockly.thrasos.RenderInfo.prototype.shouldStartNewRow_ = function(input, lastInput) {
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
 * @override
 */
Blockly.thrasos.RenderInfo.prototype.getInRowSpacing_ = function(prev, next) {
  if (!prev) {
    // Between an editable field and the beginning of the row.
    if (Blockly.blockRendering.Types.isField(next) && next.isEditable) {
      return this.constants_.MEDIUM_PADDING;
    }
    // Inline input at the beginning of the row.
    if (next.isInput && Blockly.blockRendering.Types.isInlineInput(next)) {
      return this.constants_.MEDIUM_LARGE_PADDING;
    }
    if (Blockly.blockRendering.Types.isStatementInput(next)) {
      return this.constants_.STATEMENT_INPUT_PADDING_LEFT;
    }
    // Anything else at the beginning of the row.
    return this.constants_.LARGE_PADDING;
  }

  // Spacing between a non-input and the end of the row.
  if (!prev.isInput && !next) {
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
    // Between a jagged edge and the end of the row.
    if (Blockly.blockRendering.Types.isJaggedEdge(prev)) {
      return this.constants_.NO_PADDING;
    }
    // Between noneditable fields and icons and the end of the row.
    return this.constants_.LARGE_PADDING;
  }

  // Between inputs and the end of the row.
  if (prev.isInput && !next) {
    if (Blockly.blockRendering.Types.isExternalInput(prev)) {
      return this.constants_.NO_PADDING;
    } else if (Blockly.blockRendering.Types.isInlineInput(prev)) {
      return this.constants_.LARGE_PADDING;
    } else if (Blockly.blockRendering.Types.isStatementInput(prev)) {
      return this.constants_.NO_PADDING;
    }
  }

  // Spacing between a non-input and an input.
  if (!prev.isInput && next.isInput) {
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
  if (Blockly.blockRendering.Types.isIcon(prev) && !next.isInput) {
    return this.constants_.LARGE_PADDING;
  }

  // Spacing between an inline input and a field.
  if (Blockly.blockRendering.Types.isInlineInput(prev) && !next.isInput) {
    // Editable field after inline input.
    if (next.isEditable) {
      return this.constants_.MEDIUM_PADDING;
    } else {
      // Noneditable field after inline input.
      return this.constants_.LARGE_PADDING;
    }
  }

  if (Blockly.blockRendering.Types.isLeftSquareCorner(prev)) {
    // Spacing between a hat and a corner
    if (Blockly.blockRendering.Types.isHat(next)) {
      return this.constants_.NO_PADDING;
    }
    // Spacing between a square corner and a previous or next connection
    if (Blockly.blockRendering.Types.isPreviousConnection(next)) {
      return next.notchOffset;
    } else if (Blockly.blockRendering.Types.isNextConnection(next)) {
      // Next connections are shifted slightly to the left (in both LTR and RTL)
      // to make the dark path under the previous connection show through.
      var offset = (this.RTL ? 1 : -1) *
          this.constants_.DARK_PATH_OFFSET / 2;
      return next.notchOffset + offset;
    }
  }

  // Spacing between a rounded corner and a previous or next connection.
  if (Blockly.blockRendering.Types.isLeftRoundedCorner(prev)) {
    if (Blockly.blockRendering.Types.isPreviousConnection(next)) {
      return next.notchOffset - this.constants_.CORNER_RADIUS;
    } else if (Blockly.blockRendering.Types.isNextConnection(next)) {
      // Next connections are shifted slightly to the left (in both LTR and RTL)
      // to make the dark path under the previous connection show through.
      var offset = (this.RTL ? 1 : -1) *
          this.constants_.DARK_PATH_OFFSET / 2;
      return next.notchOffset - this.constants_.CORNER_RADIUS + offset;
    }
  }

  // Spacing between two fields of the same editability.
  if (!prev.isInput && !next.isInput && (prev.isEditable == next.isEditable)) {
    return this.constants_.LARGE_PADDING;
  }

  // Spacing between anything and a jagged edge.
  if (Blockly.blockRendering.Types.isJaggedEdge(next)) {
    return this.constants_.LARGE_PADDING;
  }

  return this.constants_.MEDIUM_PADDING;
};

/**
 * @override
 */
Blockly.thrasos.RenderInfo.prototype.addAlignmentPadding_ = function(row, missingSpace) {
  var input = row.getLastInput();
  if (input) {
    var firstSpacer = row.getFirstSpacer();
    var lastSpacer = row.getLastSpacer();
    if (row.hasExternalInput || row.hasStatement) {
      // Get the spacer right before the input socket.
      row.widthWithConnectedBlocks += missingSpace;
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
  } else if (Blockly.blockRendering.Types.isTopOrBottomRow(row)) {
    row.getLastSpacer().width += missingSpace;
    row.width += missingSpace;
  }
};

/**
 * @override
 */
Blockly.thrasos.RenderInfo.prototype.getSpacerRowHeight_ = function(
    prev, next) {
  // If we have an empty block add a spacer to increase the height.
  if (Blockly.blockRendering.Types.isTopRow(prev) &&
      Blockly.blockRendering.Types.isBottomRow(next)) {
    return this.constants_.EMPTY_BLOCK_SPACER_HEIGHT;
  }
  // Top and bottom rows act as a spacer so we don't need any extra padding.
  if (Blockly.blockRendering.Types.isTopRow(prev) ||
      Blockly.blockRendering.Types.isBottomRow(next)) {
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
  if (next.hasDummyInput) {
    return this.constants_.LARGE_PADDING;
  }
  return this.constants_.MEDIUM_PADDING;
};

/**
 * @override
 */
Blockly.thrasos.RenderInfo.prototype.getElemCenterline_ = function(row, elem) {
  var result = row.yPos;
  if (Blockly.blockRendering.Types.isField(elem) && row.hasStatement) {
    var offset = this.constants_.TALL_INPUT_FIELD_OFFSET_Y +
        elem.height / 2;
    result += offset;
  } else if (Blockly.blockRendering.Types.isNextConnection(elem)) {
    result += (row.height - row.overhangY + elem.height / 2);
  } else {
    result += (row.height / 2);
  }
  return result;
};

/**
 * @override
 */
Blockly.thrasos.RenderInfo.prototype.finalize_ = function() {
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
    // Add padding to the bottom row if block height is less than minimum
    var heightWithoutHat = yCursor - this.topRow.startY;
    if (row == this.bottomRow &&
        heightWithoutHat < this.constants_.MIN_BLOCK_HEIGHT) {
      // But the hat height shouldn't be part of this.
      var diff = this.constants_.MIN_BLOCK_HEIGHT - heightWithoutHat;
      this.bottomRow.height += diff;
      yCursor += diff;
    }
    var xCursor = row.xPos;
    for (var j = 0, elem; (elem = row.elements[j]); j++) {
      elem.xPos = xCursor;
      elem.centerline = this.getElemCenterline_(row, elem);
      xCursor += elem.width;
    }
  }

  this.widthWithChildren = widestRowWithConnectedBlocks + this.startX;

  this.height = yCursor;
  this.startY = this.topRow.startY;
};
