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

goog.module('Blockly.blockRendering.Field');
goog.module.declareLegacyNamespace();

/* eslint-disable-next-line no-unused-vars */
const ConstantProvider = goog.requireType('Blockly.blockRendering.ConstantProvider');
/* eslint-disable-next-line no-unused-vars */
const BlocklyField = goog.requireType('Blockly.Field');
/* eslint-disable-next-line no-unused-vars */
const Input = goog.requireType('Blockly.Input');
const Measurable = goog.require('Blockly.blockRendering.Measurable');
const Types = goog.require('Blockly.blockRendering.Types');
const object = goog.require('Blockly.utils.object');


/**
 * An object containing information about the space a field takes up during
 * rendering
 * @param {!ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!BlocklyField} field The field to measure and store information for.
 * @param {!Input} parentInput The parent input for the field.
 * @package
 * @constructor
 * @extends {Measurable}
 */
const Field = function(constants, field, parentInput) {
  Field.superClass_.constructor.call(this, constants);
  this.field = field;
  this.isEditable = field.EDITABLE;
  this.flipRtl = field.getFlipRtl();
  this.type |= Types.FIELD;

  const size = this.field.getSize();
  this.height = size.height;
  this.width = size.width;
  this.parentInput = parentInput;
};
object.inherits(Field, Measurable);

exports = Field;
