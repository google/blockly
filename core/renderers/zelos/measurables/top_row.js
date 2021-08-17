/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An object representing the top row of a rendered block.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.module('Blockly.zelos.TopRow');
goog.module.declareLegacyNamespace();

goog.require('Blockly.blockRendering.TopRow');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.blockRendering.ConstantProvider');


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
 * @extends {Blockly.blockRendering.TopRow}
 */
const TopRow = function(constants) {
  TopRow.superClass_.constructor.call(this, constants);
};
Blockly.utils.object.inherits(TopRow,
    Blockly.blockRendering.TopRow);

/**
 * @override
 */
TopRow.prototype.endsWithElemSpacer = function() {
  return false;
};

/**
 * Render a round corner unless the block has an output connection.
 * @override
 */
TopRow.prototype.hasLeftSquareCorner = function(block) {
  const hasHat = (block.hat ?
      block.hat === 'cap' : this.constants_.ADD_START_HATS) &&
      !block.outputConnection && !block.previousConnection;
  return !!block.outputConnection || hasHat;
};

/**
 * Render a round corner unless the block has an output connection.
 * @override
 */
TopRow.prototype.hasRightSquareCorner = function(block) {
  return !!block.outputConnection && !block.statementInputCount &&
    !block.nextConnection;
};

exports = TopRow;
