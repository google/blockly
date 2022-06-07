/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Zelos specific objects representing inputs with connections on
 * a rendered block.
 */

/**
 * Zelos specific objects representing inputs with connections on
 * a rendered block.
 * @class
 */
goog.module('Blockly.zelos.StatementInput');

/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
/* eslint-disable-next-line no-unused-vars */
const {Input} = goog.requireType('Blockly.Input');
const {StatementInput: BaseStatementInput} = goog.require('Blockly.blockRendering.StatementInput');


/**
 * An object containing information about the space a statement input takes up
 * during rendering.
 * @extends {BaseStatementInput}
 * @alias Blockly.zelos.StatementInput
 */
class StatementInput extends BaseStatementInput {
  /**
   * @param {!ConstantProvider} constants The rendering constants provider.
   * @param {!Input} input The statement input to measure and store information
   *    for.
   * @package
   */
  constructor(constants, input) {
    super(constants, input);

    if (this.connectedBlock) {
      // Find the bottom-most connected block in the stack.
      let block = this.connectedBlock;
      let nextBlock;
      while ((nextBlock = block.getNextBlock())) {
        block = nextBlock;
      }
      if (!block.nextConnection) {
        this.height = this.connectedBlockHeight;
        this.connectedBottomNextConnection = true;
      }
    }
  }
}

exports.StatementInput = StatementInput;
