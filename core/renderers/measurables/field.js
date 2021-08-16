/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing a field in a row of a rendered
 * block.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.provide('Blockly.blockRendering.Field');

goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.blockRendering.ConstantProvider');
goog.requireType('Blockly.Field');
goog.requireType('Blockly.Input');
 

/**
 * An object containing information about the space a field takes up during
 * rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Blockly.Field} field The field to measure and store information for.
 * @param {!Blockly.Input} parentInput The parent input for the field.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.Field = function(constants, field, parentInput) {
  Blockly.blockRendering.Field.superClass_.constructor.call(this, constants);
  this.field = field;
  this.isEditable = field.EDITABLE;
  this.flipRtl = field.getFlipRtl();
  this.type |= Blockly.blockRendering.Types.FIELD;

  const size = this.field.getSize();
  this.height = size.height;
  this.width = size.width;
  this.parentInput = parentInput;
};
Blockly.utils.object.inherits(Blockly.blockRendering.Field,
    Blockly.blockRendering.Measurable);
