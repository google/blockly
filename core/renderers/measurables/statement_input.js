/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class representing statement inputs with connections on a
 * rendered block.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.module('Blockly.blockRendering.StatementInput');
goog.module.declareLegacyNamespace();

/* eslint-disable-next-line no-unused-vars */
const ConstantProvider = goog.requireType('Blockly.blockRendering.ConstantProvider');
/* eslint-disable-next-line no-unused-vars */
const Input = goog.requireType('Blockly.Input');
const InputConnection = goog.require('Blockly.blockRendering.InputConnection');
const Types = goog.require('Blockly.blockRendering.Types');
const object = goog.require('Blockly.utils.object');


/**
 * An object containing information about the space a statement input takes up
 * during rendering
 * @param {!ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Input} input The statement input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {InputConnection}
 */
const StatementInput = function(constants, input) {
  StatementInput.superClass_.constructor.call(this, constants, input);
  this.type |= Types.STATEMENT_INPUT;

  if (!this.connectedBlock) {
    this.height = this.constants_.EMPTY_STATEMENT_INPUT_HEIGHT;
  } else {
    // We allow the dark path to show on the parent block so that the child
    // block looks embossed.  This takes up an extra pixel in both x and y.
    this.height =
        this.connectedBlockHeight + this.constants_.STATEMENT_BOTTOM_SPACER;
  }
  this.width = this.constants_.STATEMENT_INPUT_NOTCH_OFFSET + this.shape.width;
};
object.inherits(StatementInput, InputConnection);

exports = StatementInput;
