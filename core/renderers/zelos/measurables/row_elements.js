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
 * @fileoverview Zelos specific objects representing elements in a row of a
 * rendered block.
 * @author samelh@google.com (Sam El-Husseini)
 */

goog.provide('Blockly.zelos.RightConnectionShape');

goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');


/**
 * An object containing information about the space a right connection shape
 * takes up during rendering.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.zelos.RightConnectionShape = function(constants) {
  Blockly.zelos.RightConnectionShape.superClass_.constructor.call(this, constants);
  this.type |= Blockly.blockRendering.Types.getType('RIGHT_CONNECTION');
  // Size is dynamic
  this.height = 0;
  this.width = 0;
};
Blockly.utils.object.inherits(Blockly.zelos.RightConnectionShape,
    Blockly.blockRendering.Measurable);
