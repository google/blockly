/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview Objects representing inputs with connections on a rendered
 * block.
 * @author fenichel@google.com (Sam El-Husseini)
 */

goog.provide('Blockly.zelos.ExternalValueInput');

goog.require('Blockly.blockRendering.InlineInput');


/**
 * An object containing information about the space an external input takes up
 * during rendering.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Blockly.Input} input The external input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.InlineInput}
 */
Blockly.zelos.ExternalValueInput = function(constants, input) {
  Blockly.zelos.ExternalValueInput.superClass_.constructor.call(this,
      constants, input);
};
Blockly.utils.object.inherits(Blockly.zelos.ExternalValueInput,
    Blockly.blockRendering.InlineInput);
