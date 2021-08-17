/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a top row on a rendered block.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.module('Blockly.blockRendering.TopRow');
goog.module.declareLegacyNamespace();

goog.requireType('Blockly.BlockSvg');
goog.requireType('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.blockRendering.PreviousConnection');
goog.require('Blockly.blockRendering.Row');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');


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
 * @return {boolean} Whether or not the top row has a left square corner.
 */
Blockly.blockRendering.TopRow.prototype.hasLeftSquareCorner = function(block) {
  var hasHat = (block.hat ?
      block.hat === 'cap' : this.constants_.ADD_START_HATS) &&
      !block.outputConnection && !block.previousConnection;
  var prevBlock = block.getPreviousBlock();

  return !!block.outputConnection ||
      hasHat || (prevBlock ? prevBlock.getNextBlock() == block : false);
};

/**
 * Returns whether or not the top row has a right square corner.
 * @param {!Blockly.BlockSvg} _block The block whose top row this represents.
 * @return {boolean} Whether or not the top row has a right square corner.
 */
Blockly.blockRendering.TopRow.prototype.hasRightSquareCorner = function(
    _block) {
  return true;
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
 * @override
 */
Blockly.blockRendering.TopRow.prototype.endsWithElemSpacer = function() {
  return false;
};
