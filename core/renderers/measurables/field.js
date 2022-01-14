/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing a field in a row of a rendered
 * block.
 */

/**
 * Objects representing a field in a row of a rendered
 * block.
 * @class
 */
goog.module('Blockly.blockRendering.Field');

const object = goog.require('Blockly.utils.object');
/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
/* eslint-disable-next-line no-unused-vars */
const {Field: BlocklyField} = goog.requireType('Blockly.Field');
/* eslint-disable-next-line no-unused-vars */
const {Input} = goog.requireType('Blockly.Input');
const {Measurable} = goog.require('Blockly.blockRendering.Measurable');
const {Types} = goog.require('Blockly.blockRendering.Types');


/**
 * An object containing information about the space a field takes up during
 * rendering
 * @param {!ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!BlocklyField} field The field to measure and store information for.
 * @param {!Input} parentInput The parent input for the field.
 * @package
 * @constructor
 * @struct
 * @extends {Measurable}
 * @alias Blockly.blockRendering.Field
 */
const Field = function(constants, field, parentInput) {
  Field.superClass_.constructor.call(this, constants);

  /** @type {!BlocklyField} */
  this.field = field;

  /** @type {boolean} */
  this.isEditable = field.EDITABLE;

  /** @type {boolean} */
  this.flipRtl = field.getFlipRtl();
  this.type |= Types.FIELD;

  const size = this.field.getSize();

  /** @type {number} */
  this.height = size.height;

  /** @type {number} */
  this.width = size.width;

  /** @type {!Input} */
  this.parentInput = parentInput;
};
object.inherits(Field, Measurable);

exports.Field = Field;
