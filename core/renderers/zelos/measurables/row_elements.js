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

goog.module('Blockly.zelos.RightConnectionShape');
goog.module.declareLegacyNamespace();

/* eslint-disable-next-line no-unused-vars */
const ConstantProvider = goog.requireType('Blockly.blockRendering.ConstantProvider');
const Measurable = goog.require('Blockly.blockRendering.Measurable');
const Types = goog.require('Blockly.blockRendering.Types');
const object = goog.require('Blockly.utils.object');


/**
 * An object containing information about the space a right connection shape
 * takes up during rendering.
 * @param {!ConstantProvider} constants The rendering
 *   constants provider.
 * @package
 * @constructor
 * @extends {Measurable}
 */
const RightConnectionShape = function(constants) {
  RightConnectionShape.superClass_.constructor.call(this, constants);
  this.type |= Types.getType('RIGHT_CONNECTION');
  // Size is dynamic
  this.height = 0;
  this.width = 0;
};
object.inherits(RightConnectionShape, Measurable);

exports = RightConnectionShape;
