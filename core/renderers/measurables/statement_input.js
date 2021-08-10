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

goog.provide('Blockly.blockRendering.StatementInput');

goog.require('Blockly.blockRendering.InputConnection');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.blockRendering.ConstantProvider');
goog.requireType('Blockly.Input');


/**
 * An object containing information about the space a statement input takes up
 * during rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Blockly.Input} input The statement input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.InputConnection}
 */
Blockly.blockRendering.StatementInput = function(constants, input) {
  Blockly.blockRendering.StatementInput.superClass_.constructor.call(this,
      constants, input);
  this.type |= Blockly.blockRendering.Types.STATEMENT_INPUT;

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
Blockly.utils.object.inherits(Blockly.blockRendering.StatementInput,
    Blockly.blockRendering.InputConnection);
