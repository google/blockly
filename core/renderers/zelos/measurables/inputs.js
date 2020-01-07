/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
