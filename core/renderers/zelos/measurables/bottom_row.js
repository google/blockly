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
goog.module.declareLegacyNamespace();

goog.require('Blockly.blockRendering.BottomRow');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.blockRendering.ConstantProvider');


/**
 * An object containing information about what elements are in the bottom row of
 * a block as well as spacing information for the top row.
 * Elements in a bottom row can consist of corners, spacers and next
 * connections.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.BottomRow}
 */
const BottomRow = function(constants) {
  BottomRow.superClass_.constructor.call(this, constants);
};
Blockly.utils.object.inherits(BottomRow,
    Blockly.blockRendering.BottomRow);

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
