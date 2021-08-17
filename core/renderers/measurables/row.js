/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a single row on a rendered block.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.module('Blockly.blockRendering.Row');
goog.module.declareLegacyNamespace();

goog.requireType('Blockly.blockRendering.ConstantProvider');
goog.requireType('Blockly.blockRendering.InputConnection');
goog.requireType('Blockly.blockRendering.InRowSpacer');
goog.requireType('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.Types');


/**
 * An object representing a single row on a rendered block and all of its
 * subcomponents.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @package
 * @constructor
 */
const Row = function(constants) {
  /**
   * The type of this rendering object.
   * @package
   * @type {number}
   */
  this.type = Blockly.blockRendering.Types.ROW;

  /**
   * An array of elements contained in this row.
   * @package
   * @type {!Array<!Blockly.blockRendering.Measurable>}
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

  /**
   * Alignment of the row.
   * @package
   * @type {?number}
   */
  this.align = null;
};

/**
 * Get the last input on this row, if it has one.
 * @return {Blockly.blockRendering.InputConnection} The last input on the row,
 *     or null.
 * @package
 */
// TODO: Consider moving this to InputRow, if possible.
Row.prototype.getLastInput = function() {
  for (var i = this.elements.length - 1, elem; (elem = this.elements[i]); i--) {
    if (Blockly.blockRendering.Types.isInput(elem)) {
      return /** @type {Blockly.blockRendering.InputConnection} */ (elem);
    }
  }
  return null;
};

/**
 * Inspect all subcomponents and populate all size properties on the row.
 * @package
 */
Row.prototype.measure = function() {
  throw Error('Unexpected attempt to measure a base Row.');
};

/**
 * Determines whether this row should start with an element spacer.
 * @return {boolean} Whether the row should start with a spacer.
 * @package
 */
Row.prototype.startsWithElemSpacer = function() {
  return true;
};

/**
 * Determines whether this row should end with an element spacer.
 * @return {boolean} Whether the row should end with a spacer.
 * @package
 */
Row.prototype.endsWithElemSpacer = function() {
  return true;
};

/**
 * Convenience method to get the first spacer element on this row.
 * @return {Blockly.blockRendering.InRowSpacer} The first spacer element on
 *   this row.
 * @package
 */
Row.prototype.getFirstSpacer = function() {
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
Row.prototype.getLastSpacer = function() {
  for (var i = this.elements.length - 1, elem; (elem = this.elements[i]); i--) {
    if (Blockly.blockRendering.Types.isSpacer(elem)) {
      return /** @type {Blockly.blockRendering.InRowSpacer} */ (elem);
    }
  }
  return null;
};

exports = Row;
