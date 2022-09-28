/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An object representing the bottom row of a rendered block.
 */
'use strict';

/**
 * An object representing the bottom row of a rendered block.
 * @class
 */
goog.module('Blockly.zelos.BottomRow');

const {BottomRow: BaseBottomRow} = goog.require('Blockly.blockRendering.BottomRow');
/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');


/**
 * An object containing information about what elements are in the bottom row of
 * a block as well as spacing information for the top row.
 * Elements in a bottom row can consist of corners, spacers and next
 * connections.
 * @extends {BaseBottomRow}
 * @alias Blockly.zelos.BottomRow
 */
class BottomRow extends BaseBottomRow {
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
    return !!block.outputConnection;
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

exports.BottomRow = BottomRow;
