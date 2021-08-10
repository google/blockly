/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class representing inputs with connections on a rendered block.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.provide('Blockly.blockRendering.InputConnection');

goog.require('Blockly.blockRendering.Connection');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.blockRendering.ConstantProvider');
goog.requireType('Blockly.Input');


/**
 * The base class to represent an input that takes up space on a block
 * during rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Blockly.Input} input The input to measure and store information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Connection}
 */
Blockly.blockRendering.InputConnection = function(constants, input) {
  Blockly.blockRendering.InputConnection.superClass_.constructor.call(this,
      constants, input.connection);

  this.type |= Blockly.blockRendering.Types.INPUT;
  this.input = input;
  this.align = input.align;
  this.connectedBlock = input.connection && input.connection.targetBlock() ?
      input.connection.targetBlock() : null;

  if (this.connectedBlock) {
    var bBox = this.connectedBlock.getHeightWidth();
    this.connectedBlockWidth = bBox.width;
    this.connectedBlockHeight = bBox.height;
  } else {
    this.connectedBlockWidth = 0;
    this.connectedBlockHeight = 0;
  }

  this.connectionOffsetX = 0;
  this.connectionOffsetY = 0;
};
Blockly.utils.object.inherits(Blockly.blockRendering.InputConnection,
    Blockly.blockRendering.Connection);
