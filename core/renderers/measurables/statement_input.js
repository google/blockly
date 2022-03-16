/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class representing statement inputs with connections on a
 * rendered block.
 */

/**
 * Class representing statement inputs with connections on a
 * rendered block.
 * @class
 */
goog.module('Blockly.blockRendering.StatementInput');

/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
const {InputConnection} = goog.require('Blockly.blockRendering.InputConnection');
/* eslint-disable-next-line no-unused-vars */
const {Input} = goog.requireType('Blockly.Input');
const {Types} = goog.require('Blockly.blockRendering.Types');


/**
 * An object containing information about the space a statement input takes up
 * during rendering
 * @struct
 * @extends {InputConnection}
 * @alias Blockly.blockRendering.StatementInput
 */
class StatementInput extends InputConnection {
  /**
   * @param {!ConstantProvider} constants The rendering
   *   constants provider.
   * @param {!Input} input The statement input to measure and store
   *     information for.
   * @package
   */
  constructor(constants, input) {
    super(constants, input);
    this.type |= Types.STATEMENT_INPUT;

    if (!this.connectedBlock) {
      this.height = this.constants_.EMPTY_STATEMENT_INPUT_HEIGHT;
    } else {
      // We allow the dark path to show on the parent block so that the child
      // block looks embossed.  This takes up an extra pixel in both x and y.
      this.height =
          this.connectedBlockHeight + this.constants_.STATEMENT_BOTTOM_SPACER;
    }
    this.width =
        this.constants_.STATEMENT_INPUT_NOTCH_OFFSET + this.shape.width;
  }
}

exports.StatementInput = StatementInput;
