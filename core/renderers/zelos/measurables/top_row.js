/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An object representing the top row of a rendered block.
 */
'use strict';

/**
 * An object representing the top row of a rendered block.
 * @class
 */
goog.module('Blockly.zelos.TopRow');

/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
const {TopRow: BaseTopRow} = goog.require('Blockly.blockRendering.TopRow');


/**
 * An object containing information about what elements are in the top row of a
 * block as well as sizing information for the top row.
 * Elements in a top row can consist of corners, hats, spacers, and previous
 * connections.
 * After this constructor is called, the row will contain all non-spacer
 * elements it needs.
 * @extends {BaseTopRow}
 * @alias Blockly.zelos.TopRow
 */
class TopRow extends BaseTopRow {
  /**
   * @param {!ConstantProvider} constants The rendering
   *   constants provider.
   * @package
   */
  constructor(constants) {
    super(constants);
  }

  /**
   * @override
   */
  endsWithElemSpacer() {
    return false;
  }

  /**
   * Render a round corner unless the block has an output connection.
   * @override
   */
  hasLeftSquareCorner(block) {
    const hasHat =
        (block.hat ? block.hat === 'cap' : this.constants_.ADD_START_HATS) &&
        !block.outputConnection && !block.previousConnection;
    return !!block.outputConnection || hasHat;
  }

  /**
   * Render a round corner unless the block has an output connection.
   * @override
   */
  hasRightSquareCorner(block) {
    return !!block.outputConnection && !block.statementInputCount &&
        !block.nextConnection;
  }
}

exports.TopRow = TopRow;
