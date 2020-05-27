/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
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
