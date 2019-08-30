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
 * @fileoverview Makecode/scratch-style renderer.
 * Zelos: spirit of eager rivalry, emulation, envy, jealousy, and zeal.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.zelos');
goog.provide('Blockly.zelos.RenderInfo');

goog.require('Blockly.blockRendering.RenderInfo');
goog.require('Blockly.blockRendering.Measurable');
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

goog.require('Blockly.zelos.BottomRow');
goog.require('Blockly.zelos.TopRow');

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
Blockly.zelos.RenderInfo = function(block) {
  Blockly.zelos.RenderInfo.superClass_.constructor.call(this, block);

  /**
   * An object with rendering information about the top row of the block.
   * @type {!Blockly.zelos.TopRow}
   * @override
   */
  this.topRow = new Blockly.zelos.TopRow();

  /**
   * An object with rendering information about the bottom row of the block.
   * @type {!Blockly.zelos.BottomRow}
   * @override
   */
  this.bottomRow = new Blockly.zelos.BottomRow();
};
goog.inherits(Blockly.zelos.RenderInfo, Blockly.blockRendering.RenderInfo);


/**
 * @override
 */
Blockly.zelos.RenderInfo.prototype.getInRowSpacing_ = function(prev, next) {
  if (!prev) {
    // Between an editable field and the beginning of the row.
    if (next.isField() && next.isEditable) {
      return this.constants_.MEDIUM_PADDING;
    }
    // Inline input at the beginning of the row.
    if (next.isInput && next.isInlineInput()) {
      return this.constants_.MEDIUM_LARGE_PADDING;
    }
    if (next.isStatementInput()) {
      return this.constants_.STATEMENT_INPUT_PADDING_LEFT;
    }
    // Anything else at the beginning of the row.
    return this.constants_.LARGE_PADDING;
  }

  // Spacing between a non-input and the end of the row.
  if (!prev.isInput && !next) {
    // Between an editable field and the end of the row.
    if (prev.isField() && prev.isEditable) {
      return this.constants_.MEDIUM_PADDING;
    }
    // Padding at the end of an icon-only row to make the block shape clearer.
    if (prev.isIcon()) {
      return (this.constants_.LARGE_PADDING * 2) + 1;
    }
    if (prev.isHat()) {
      return this.constants_.NO_PADDING;
    }
    // Establish a minimum width for a block with a previous or next connection.
    if (prev.isPreviousConnection() || prev.isNextConnection()) {
      return this.constants_.LARGE_PADDING;
    }
    // Between rounded corner and the end of the row.
    if (prev.isRoundedCorner()) {
      return this.constants_.MIN_BLOCK_WIDTH;
    }
    // Between a right rounded corner and the end of the row.
    if (prev.type == 'round corner right') {
      return this.constants_.NO_PADDING;
    }
    // Between a jagged edge and the end of the row.
    if (prev.isJaggedEdge()) {
      return this.constants_.NO_PADDING;
    }
    // Between noneditable fields and icons and the end of the row.
    return this.constants_.LARGE_PADDING;
  }

  // Between inputs and the end of the row.
  if (prev.isInput && !next) {
    if (prev.isExternalInput()) {
      return this.constants_.NO_PADDING;
    } else if (prev.isInlineInput()) {
      return this.constants_.LARGE_PADDING;
    } else if (prev.isStatementInput()) {
      return this.constants_.NO_PADDING;
    }
  }

  // Spacing between a non-input and an input.
  if (!prev.isInput && next.isInput) {
    // Between an editable field and an input.
    if (prev.isEditable) {
      if (next.isInlineInput()) {
        return this.constants_.SMALL_PADDING;
      } else if (next.isExternalInput()) {
        return this.constants_.SMALL_PADDING;
      }
    } else {
      if (next.isInlineInput()) {
        return this.constants_.MEDIUM_LARGE_PADDING;
      } else if (next.isExternalInput()) {
        return this.constants_.MEDIUM_LARGE_PADDING;
      } else if (next.isStatementInput()) {
        return this.constants_.LARGE_PADDING;
      }
    }
    return this.constants_.LARGE_PADDING - 1;
  }

  // Spacing between an icon and an icon or field.
  if (prev.isIcon() && !next.isInput) {
    return this.constants_.LARGE_PADDING;
  }

  // Spacing between an inline input and a field.
  if (prev.isInlineInput() && !next.isInput) {
    // Editable field after inline input.
    if (next.isEditable) {
      return this.constants_.MEDIUM_PADDING;
    } else {
      // Noneditable field after inline input.
      return this.constants_.LARGE_PADDING;
    }
  }

  if (prev.isSquareCorner()) {
    // Spacing between a hat and a corner
    if (next.isHat()) {
      return this.constants_.NO_PADDING;
    }
    // Spacing between a square corner and a previous or next connection
    if (next.isPreviousConnection()) {
      return next.notchOffset;
    } else if (next.isNextConnection()) {
      // Next connections are shifted slightly to the left (in both LTR and RTL)
      // to make the dark path under the previous connection show through.
      var offset = (this.RTL ? 1 : -1) *
          this.constants_.DARK_PATH_OFFSET / 2;
      return next.notchOffset + offset;
    }
  }

  // Spacing between a rounded corner and a previous or next connection.
  if (prev.isRoundedCorner()) {
    if (next.isPreviousConnection()) {
      return next.notchOffset - this.constants_.CORNER_RADIUS;
    } else if (next.isNextConnection()) {
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
  if (next.isJaggedEdge()) {
    return this.constants_.LARGE_PADDING;
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
  // Skip the right corner element on the top and bottom row, so we don't have
  // any spacing after the right corner element.
  if (row.type == 'top row' || row.type == 'bottom row') {
    lastSpacer = row.elements[row.elements.length - 3];
  }
  if (lastSpacer) {
    lastSpacer.width += missingSpace;
    row.width += missingSpace;
  }
};
