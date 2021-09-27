/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An object representing the bottom row of a rendered block.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.module('Blockly.zelos.BottomRow');

const BaseBottomRow = goog.require('Blockly.blockRendering.BottomRow');
/* eslint-disable-next-line no-unused-vars */
const ConstantProvider = goog.requireType('Blockly.blockRendering.ConstantProvider');
const object = goog.require('Blockly.utils.object');


/**
 * An object containing information about what elements are in the bottom row of
 * a block as well as spacing information for the top row.
 * Elements in a bottom row can consist of corners, spacers and next
 * connections.
 * @param {!ConstantProvider} constants The rendering
 *   constants provider.
 * @package
 * @constructor
 * @extends {BaseBottomRow}
 */
const BottomRow = function(constants) {
  BottomRow.superClass_.constructor.call(this, constants);
};
object.inherits(BottomRow, BaseBottomRow);

/**
 * @override
 */
BottomRow.prototype.endsWithElemSpacer = function() {
  return false;
};

/**
 * Render a round corner unless the block has an output connection.
 * @override
 */
BottomRow.prototype.hasLeftSquareCorner = function(block) {
  return !!block.outputConnection;
};

/**
 * Render a round corner unless the block has an output connection.
 * @override
 */
BottomRow.prototype.hasRightSquareCorner = function(block) {
  return !!block.outputConnection && !block.statementInputCount &&
      !block.nextConnection;
};

exports = BottomRow;
