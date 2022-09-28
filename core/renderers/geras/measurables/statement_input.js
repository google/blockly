/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing statement inputs with connections on a
 * rendered block.
 */
'use strict';

/**
 * Objects representing statement inputs with connections on a
 * rendered block.
 * @class
 */
goog.module('Blockly.geras.StatementInput');

/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider: BaseConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider: GerasConstantProvider} = goog.requireType('Blockly.geras.ConstantProvider');
/* eslint-disable-next-line no-unused-vars */
const {Input} = goog.requireType('Blockly.Input');
const {StatementInput: BaseStatementInput} = goog.require('Blockly.blockRendering.StatementInput');


/**
 * An object containing information about the space a statement input takes up
 * during rendering.
 * @extends {BaseStatementInput}
 * @alias Blockly.geras.StatementInput
 */
class StatementInput extends BaseStatementInput {
  /**
   * @param {!BaseConstantProvider} constants The rendering
   *   constants provider.
   * @param {!Input} input The statement input to measure and store
   *     information for.
   * @package
   */
  constructor(constants, input) {
    super(constants, input);

    /** @type {!GerasConstantProvider} */
    this.constants_;

    if (this.connectedBlock) {
      // We allow the dark path to show on the parent block so that the child
      // block looks embossed.  This takes up an extra pixel in both x and y.
      this.height += this.constants_.DARK_PATH_OFFSET;
    }
  }
}

exports.StatementInput = StatementInput;
