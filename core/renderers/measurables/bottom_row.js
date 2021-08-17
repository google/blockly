/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a bottom row on a rendered block.
 * of its subcomponents.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.module('Blockly.blockRendering.BottomRow');
goog.module.declareLegacyNamespace();

goog.requireType('Blockly.BlockSvg');
goog.requireType('Blockly.blockRendering.ConstantProvider');
goog.requireType('Blockly.blockRendering.NextConnection');
goog.require('Blockly.blockRendering.Row');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');


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
const BottomRow = function(constants) {
  BottomRow.superClass_.constructor.call(this,
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
Blockly.utils.object.inherits(BottomRow,
    Blockly.blockRendering.Row);

/**
 * Returns whether or not the bottom row has a left square corner.
 * @param {!Blockly.BlockSvg} block The block whose bottom row this represents.
 * @return {boolean} Whether or not the bottom row has a left square corner.
 */
BottomRow.prototype.hasLeftSquareCorner = function(
    block) {
  return !!block.outputConnection || !!block.getNextBlock();
};

/**
 * Returns whether or not the bottom row has a right square corner.
 * @param {!Blockly.BlockSvg} _block The block whose bottom row this represents.
 * @return {boolean} Whether or not the bottom row has a right square corner.
 */
BottomRow.prototype.hasRightSquareCorner = function(
    _block) {
  return true;
};

/**
 * @override
 */
BottomRow.prototype.measure = function() {
  let height = 0;
  let width = 0;
  let descenderHeight = 0;
  for (let i = 0; i < this.elements.length; i++) {
    const elem = this.elements[i];
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
BottomRow.prototype.startsWithElemSpacer = function() {
  return false;
};

/**
 * @override
 */
BottomRow.prototype.endsWithElemSpacer = function() {
  return false;
};

exports = BottomRow;
