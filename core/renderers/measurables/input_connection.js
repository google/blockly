/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class representing inputs with connections on a rendered block.
 */

/**
 * Class representing inputs with connections on a rendered block.
 * @class
 */
goog.module('Blockly.blockRendering.InputConnection');

const object = goog.require('Blockly.utils.object');
const {Connection} = goog.require('Blockly.blockRendering.Connection');
/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
/* eslint-disable-next-line no-unused-vars */
const {Input} = goog.requireType('Blockly.Input');
const {Types} = goog.require('Blockly.blockRendering.Types');


/**
 * The base class to represent an input that takes up space on a block
 * during rendering
 * @param {!ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Input} input The input to measure and store information for.
 * @package
 * @constructor
 * @extends {Connection}
 * @alias Blockly.blockRendering.InputConnection
 */
const InputConnection = function(constants, input) {
  InputConnection.superClass_.constructor.call(
      this, constants, input.connection);

  this.type |= Types.INPUT;
  this.input = input;
  this.align = input.align;
  this.connectedBlock = input.connection && input.connection.targetBlock() ?
      input.connection.targetBlock() :
      null;

  if (this.connectedBlock) {
    const bBox = this.connectedBlock.getHeightWidth();
    this.connectedBlockWidth = bBox.width;
    this.connectedBlockHeight = bBox.height;
  } else {
    this.connectedBlockWidth = 0;
    this.connectedBlockHeight = 0;
  }

  this.connectionOffsetX = 0;
  this.connectionOffsetY = 0;
};
object.inherits(InputConnection, Connection);

exports.InputConnection = InputConnection;
