/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing a hat in a row of a rendered
 * block.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.provide('Blockly.blockRendering.Hat');

goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.blockRendering.ConstantProvider');


/**
 * An object containing information about the space a hat takes up during
 * rendering.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.Hat = function(constants) {
  Blockly.blockRendering.Hat.superClass_.constructor.call(this, constants);
  this.type |= Blockly.blockRendering.Types.HAT;
  this.height = this.constants_.START_HAT.height;
  this.width = this.constants_.START_HAT.width;
  this.ascenderHeight = this.height;

};
Blockly.utils.object.inherits(Blockly.blockRendering.Hat,
    Blockly.blockRendering.Measurable);
