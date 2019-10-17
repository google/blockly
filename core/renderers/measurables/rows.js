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
 * @fileoverview Objects representing a single row on a rendered block and all
 * of its subcomponents.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.provide('Blockly.blockRendering.BottomRow');
goog.provide('Blockly.blockRendering.InputRow');
goog.provide('Blockly.blockRendering.Row');
goog.provide('Blockly.blockRendering.SpacerRow');
goog.provide('Blockly.blockRendering.TopRow');

goog.require('Blockly.blockRendering.InputConnection');
goog.require('Blockly.blockRendering.InRowSpacer');
goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.NextConnection');
goog.require('Blockly.blockRendering.PreviousConnection');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');


/**
 * An object representing a single row on a rendered block and all of its
 * subcomponents.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @package
 * @constructor
 */
Blockly.blockRendering.Row = function(constants) {
  /**
   * The type of this rendering object.
   * @package
   * @type {number}
   */
  this.type = Blockly.blockRendering.Types.ROW;

  /**
   * An array of elements contained in this row.
   * @package
   * @type {!Array.<!Blockly.blockRendering.Measurable>}
   */
  this.elements = [];

  /**
   * The height of the row.
   * @package
   * @type {number}
   */
  this.height = 0;

  /**
   * The width of the row, from the left edge of the block to the right.
   * Does not include child blocks unless they are inline.
   * @package
   * @type {number}
   */
  this.width = 0;

  /**
   * The minimum height of the row.
   * @package
   * @type {number}
   */
  this.minHeight = 0;

  /**
   * The minimum width of the row, from the left edge of the block to the right.
   * Does not include child blocks unless they are inline.
   * @package
   * @type {number}
   */
  this.minWidth = 0;

  /**
   * The width of the row, from the left edge of the block to the edge of the
   * block or any connected child blocks.
   * @package
   * @type {number}
   */
  this.widthWithConnectedBlocks = 0;

  /**
   * The Y position of the row relative to the origin of the block's svg group.
   * @package
   * @type {number}
   */
  this.yPos = 0;

  /**
   * The X position of the row relative to the origin of the block's svg group.
   * @package
   * @type {number}
   */
  this.xPos = 0;

  /**
   * Whether the row has any external inputs.
   * @package
   * @type {boolean}
   */
  this.hasExternalInput = false;

  /**
   * Whether the row has any statement inputs.
   * @package
   * @type {boolean}
   */
  this.hasStatement = false;

  /**
   * Whether the row has any inline inputs.
   * @package
   * @type {boolean}
   */
  this.hasInlineInput = false;

  /**
   * Whether the row has any dummy inputs.
   * @package
   * @type {boolean}
   */
  this.hasDummyInput = false;

  /**
   * Whether the row has a jagged edge.
   * @package
   * @type {boolean}
   */
  this.hasJaggedEdge = false;

  /**
   * The renderer's constant provider.
   * @type {!Blockly.blockRendering.ConstantProvider}
   * @protected
   */
  this.constants_ = constants;

  this.notchOffset = this.constants_.NOTCH_OFFSET_LEFT;
};

/**
 * Inspect all subcomponents and populate all size properties on the row.
 * @package
 */
Blockly.blockRendering.Row.prototype.measure = function() {
  throw Error('Unexpected attempt to measure a base Row.');
};

/**
 * Get the last input on this row, if it has one.
 * @return {Blockly.blockRendering.InputConnection} The last input on the row,
 *     or null.
 * @package
 */
// TODO: Consider moving this to InputRow, if possible.
Blockly.blockRendering.Row.prototype.getLastInput = function() {
  for (var i = this.elements.length - 1, elem; (elem = this.elements[i]); i--) {
    if (Blockly.blockRendering.Types.isInput(elem)) {
      return /** @type {Blockly.blockRendering.InputConnection} */ (elem);
    }
  }
  return null;
};

/**
 * Determines whether this row should start with an element spacer.
 * @return {boolean} Whether the row should start with a spacer.
 * @package
 */
Blockly.blockRendering.Row.prototype.startsWithElemSpacer = function() {
  return true;
};

/**
 * Determines whether this row should end with an element spacer.
 * @return {boolean} Whether the row should end with a spacer.
 * @package
 */
Blockly.blockRendering.Row.prototype.endsWithElemSpacer = function() {
  return true;
};

/**
 * Convenience method to get the first spacer element on this row.
 * @return {Blockly.blockRendering.InRowSpacer} The first spacer element on
 *   this row.
 * @package
 */
Blockly.blockRendering.Row.prototype.getFirstSpacer = function() {
  for (var i = 0, elem; (elem = this.elements[i]); i++) {
    if (Blockly.blockRendering.Types.isSpacer(elem)) {
      return /** @type {Blockly.blockRendering.InRowSpacer} */ (elem);
    }
  }
  return null;
};

/**
 * Convenience method to get the last spacer element on this row.
 * @return {Blockly.blockRendering.InRowSpacer} The last spacer element on
 *   this row.
 * @package
 */
Blockly.blockRendering.Row.prototype.getLastSpacer = function() {
  for (var i = this.elements.length - 1, elem; (elem = this.elements[i]); i--) {
    if (Blockly.blockRendering.Types.isSpacer(elem)) {
      return /** @type {Blockly.blockRendering.InRowSpacer} */ (elem);
    }
  }
  return null;
};

/**
 * An object containing information about what elements are in the top row of a
 * block as well as sizing information for the top row.
 * Elements in a top row can consist of corners, hats, spacers, and previous
 * connections.
 * After this constructor is called, the row will contain all non-spacer
 * elements it needs.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Row}
 */
Blockly.blockRendering.TopRow = function(constants) {
  Blockly.blockRendering.TopRow.superClass_.constructor.call(this, constants);

  this.type |= Blockly.blockRendering.Types.TOP_ROW;

  /**
   * The starting point for drawing the row, in the y direction.
   * This allows us to draw hats and similar shapes that don't start at the
   * origin. Must be non-negative (see #2820).
   * @package
   * @type {number}
   */
  this.capline = 0;

  /**
   * How much the row extends up above its capline.
   * @type {number}
   */
  this.ascenderHeight = 0;

  /**
   * Whether the block has a previous connection.
   * @package
   * @type {boolean}
   */
  this.hasPreviousConnection = false;

  /**
   * The previous connection on the block, if any.
   * @type {Blockly.blockRendering.PreviousConnection}
   */
  this.connection = null;
};
Blockly.utils.object.inherits(Blockly.blockRendering.TopRow,
    Blockly.blockRendering.Row);

/**
 * Returns whether or not the top row has a left square corner.
 * @param {!Blockly.BlockSvg} block The block whose top row this represents.
 * @returns {boolean} Whether or not the top row has a left square corner.
 */
Blockly.blockRendering.TopRow.prototype.hasLeftSquareCorner = function(block) {
  var hasHat = (block.hat ? block.hat === 'cap' : Blockly.BlockSvg.START_HAT) &&
    !block.outputConnection && !block.previousConnection;
  var prevBlock = block.getPreviousBlock();

  return !!block.outputConnection ||
      hasHat || (prevBlock ? prevBlock.getNextBlock() == block : false);
};

/**
 * @override
 */
Blockly.blockRendering.TopRow.prototype.measure = function() {
  var height = 0;
  var width = 0;
  var ascenderHeight = 0;
  for (var e = 0, elem; (elem = this.elements[e]); e++) {
    width += elem.width;
    if (!(Blockly.blockRendering.Types.isSpacer(elem))) {
      if (Blockly.blockRendering.Types.isHat(elem)) {
        ascenderHeight = Math.max(ascenderHeight, elem.ascenderHeight);
      } else {
        height = Math.max(height, elem.height);
      }
    }
  }
  this.width = Math.max(this.minWidth, width);
  this.height = Math.max(this.minHeight, height) + ascenderHeight;
  this.ascenderHeight = ascenderHeight;
  this.capline = this.ascenderHeight;
  this.widthWithConnectedBlocks = this.width;
};

/**
 * @override
 */
Blockly.blockRendering.TopRow.prototype.startsWithElemSpacer = function() {
  return false;
};

/**
 * An object containing information about what elements are in the bottom row of
 * a block as well as spacing information for the top row.
 * Elements in a bottom row can consist of corners, spacers and next
 * connections.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Row}
 */
Blockly.blockRendering.BottomRow = function(constants) {
  Blockly.blockRendering.BottomRow.superClass_.constructor.call(this,
      constants);
  this.type |= Blockly.blockRendering.Types.BOTTOM_ROW;

  /**
   * Whether this row has a next connection.
   * @package
   * @type {boolean}
   */
  this.hasNextConnection = false;

  /**
   * The next connection on the row, if any.
   * @package
   * @type {Blockly.blockRendering.NextConnection}
   */
  this.connection = null;

  /**
   * The amount that the bottom of the block extends below the horizontal edge,
   * e.g. because of a next connection.  Must be non-negative (see #2820).
   * @package
   * @type {number}
   */
  this.descenderHeight = 0;

  /**
   * The Y position of the bottom edge of the block, relative to the origin
   * of the block rendering.
   * @type {number}
   */
  this.baseline = 0;
};
Blockly.utils.object.inherits(Blockly.blockRendering.BottomRow,
    Blockly.blockRendering.Row);

/**
 * Returns whether or not the bottom row has a left square corner.
 * @param {!Blockly.BlockSvg} block The block whose bottom row this represents.
 * @returns {boolean} Whether or not the bottom row has a left square corner.
 */
Blockly.blockRendering.BottomRow.prototype.hasLeftSquareCorner = function(
    block) {
  return !!block.outputConnection || !!block.getNextBlock();
};

/**
 * @override
 */
Blockly.blockRendering.BottomRow.prototype.measure = function() {
  var height = 0;
  var width = 0;
  var descenderHeight = 0;
  for (var e = 0, elem; (elem = this.elements[e]); e++) {
    width += elem.width;
    if (!(Blockly.blockRendering.Types.isSpacer(elem))) {
      // Note: this assumes that next connections have *only* descenderHeight,
      // with no height above the baseline.
      if (Blockly.blockRendering.Types.isNextConnection(elem)) {
        descenderHeight = Math.max(descenderHeight, elem.height);
      } else {
        height = Math.max(height, elem.height);
      }
    }
  }
  this.width = Math.max(this.minWidth, width);
  this.height = Math.max(this.minHeight, height) + descenderHeight;
  this.descenderHeight = descenderHeight;
  this.widthWithConnectedBlocks = this.width;
};

/**
 * @override
 */
Blockly.blockRendering.BottomRow.prototype.startsWithElemSpacer = function() {
  return false;
};

/**
 * An object containing information about a spacer between two rows.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {number} height The height of the spacer.
 * @param {number} width The width of the spacer.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Row}
 */
Blockly.blockRendering.SpacerRow = function(constants, height, width) {
  Blockly.blockRendering.SpacerRow.superClass_.constructor.call(this,
      constants);
  this.type |= Blockly.blockRendering.Types.SPACER |
      Blockly.blockRendering.Types.BETWEEN_ROW_SPACER;
  this.width = width;
  this.height = height;
  this.followsStatement = false;
  this.widthWithConnectedBlocks = 0;
  this.elements = [
    new Blockly.blockRendering.InRowSpacer(this.constants_, width)];
};
Blockly.utils.object.inherits(Blockly.blockRendering.SpacerRow,
    Blockly.blockRendering.Row);

/**
 * @override
 */
Blockly.blockRendering.SpacerRow.prototype.measure = function() {
  // NOP.  Width and height were set at creation.
};

/**
 * An object containing information about a row that holds one or more inputs.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Row}
 */
Blockly.blockRendering.InputRow = function(constants) {
  Blockly.blockRendering.InputRow.superClass_.constructor.call(this, constants);
  this.type |= Blockly.blockRendering.Types.INPUT_ROW;

  /**
   * The total width of all blocks connected to this row.
   * @type {number}
   * @package
   */
  this.connectedBlockWidths = 0;
};
Blockly.utils.object.inherits(Blockly.blockRendering.InputRow,
    Blockly.blockRendering.Row);

/**
 * Inspect all subcomponents and populate all size properties on the row.
 * @package
 */
Blockly.blockRendering.InputRow.prototype.measure = function() {
  this.width = this.minWidth;
  this.height = this.minHeight;
  var connectedBlockWidths = 0;
  for (var e = 0, elem; (elem = this.elements[e]); e++) {
    this.width += elem.width;
    if (Blockly.blockRendering.Types.isInput(elem)) {
      if (Blockly.blockRendering.Types.isStatementInput(elem)) {
        connectedBlockWidths += elem.connectedBlockWidth;
      } else if (Blockly.blockRendering.Types.isExternalInput(elem) &&
          elem.connectedBlockWidth != 0) {
        connectedBlockWidths += (elem.connectedBlockWidth - elem.connectionWidth);
      }
    }
    if (!(Blockly.blockRendering.Types.isSpacer(elem))) {
      this.height = Math.max(this.height, elem.height);
    }
  }
  this.connectedBlockWidths = connectedBlockWidths;
  this.widthWithConnectedBlocks = this.width + connectedBlockWidths;
};

/**
 * @override
 */
Blockly.blockRendering.InputRow.prototype.endsWithElemSpacer = function() {
  return !this.hasExternalInput && !this.hasStatement;
};
