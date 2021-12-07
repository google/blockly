/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class representing external value inputs with connections on a
 * rendered block.
 */

/**
 * Class representing external value inputs with connections on a
 * rendered block.
 * @class
 */
goog.module('Blockly.blockRendering.ExternalValueInput');

const object = goog.require('Blockly.utils.object');
/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
const {InputConnection} = goog.require('Blockly.blockRendering.InputConnection');
/* eslint-disable-next-line no-unused-vars */
const {Input} = goog.requireType('Blockly.Input');
const {Types} = goog.require('Blockly.blockRendering.Types');


/**
 * An object containing information about the space an external value input
 * takes up during rendering
 * @param {!ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Input} input The external value input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {InputConnection}
 * @alias Blockly.blockRendering.ExternalValueInput
 */
const ExternalValueInput = function(constants, input) {
  ExternalValueInput.superClass_.constructor.call(this, constants, input);
  this.type |= Types.EXTERNAL_VALUE_INPUT;
  if (!this.connectedBlock) {
    this.height = this.shape.height;
  } else {
    this.height = this.connectedBlockHeight -
        this.constants_.TAB_OFFSET_FROM_TOP - this.constants_.MEDIUM_PADDING;
  }
  this.width = this.shape.width + this.constants_.EXTERNAL_VALUE_INPUT_PADDING;

  this.connectionOffsetY = this.constants_.TAB_OFFSET_FROM_TOP;
  this.connectionHeight = this.shape.height;
  this.connectionWidth = this.shape.width;
};
object.inherits(ExternalValueInput, InputConnection);

exports.ExternalValueInput = ExternalValueInput;
