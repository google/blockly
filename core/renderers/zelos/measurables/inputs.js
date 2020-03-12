/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Zelos specific objects representing inputs with connections on
 * a rendered block.
 * @author samelh@google.com (Sam El-Husseini)
 */

goog.provide('Blockly.zelos.StatementInput');

goog.require('Blockly.blockRendering.StatementInput');
goog.require('Blockly.utils.object');


/**
 * An object containing information about the space a statement input takes up
 * during rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Blockly.Input} input The statement input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.StatementInput}
 */
Blockly.zelos.StatementInput = function(constants, input) {
  Blockly.zelos.StatementInput.superClass_.constructor.call(this,
      constants, input);

  if (this.connectedBlock) {
    // Find the bottom-most connected block in the stack.
    var block = this.connectedBlock;
    while (block.getNextBlock()) {
      block = block.getNextBlock();
    }
    if (!block.nextConnection) {
      this.height = this.connectedBlockHeight;
      this.connectedBottomNextConnection = true;
    }
  }
};
Blockly.utils.object.inherits(Blockly.zelos.StatementInput,
    Blockly.blockRendering.StatementInput);
