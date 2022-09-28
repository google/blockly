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

/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
const {Connection} = goog.require('Blockly.blockRendering.Connection');
/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
/* eslint-disable-next-line no-unused-vars */
const {Input} = goog.requireType('Blockly.Input');
/* eslint-disable-next-line no-unused-vars */
const {RenderedConnection} = goog.requireType('Blockly.RenderedConnection');
const {Types} = goog.require('Blockly.blockRendering.Types');


/**
 * The base class to represent an input that takes up space on a block
 * during rendering
 * @package
 * @extends {Connection}
 * @alias Blockly.blockRendering.InputConnection
 */
class InputConnection extends Connection {
  /**
   * @param {!ConstantProvider} constants The rendering
   *   constants provider.
   * @param {!Input} input The input to measure and store information for.
   */
  constructor(constants, input) {
    super(constants, /** @type {!RenderedConnection} */ (input.connection));

    this.type |= Types.INPUT;

    /** @type {!Input} */
    this.input = input;

    /** @type {number} */
    this.align = input.align;

    /** @type {BlockSvg} */
    this.connectedBlock = input.connection && input.connection.targetBlock() ?
        /** @type {BlockSvg} */ (input.connection.targetBlock()) :
        null;

    if (this.connectedBlock) {
      const bBox = this.connectedBlock.getHeightWidth();
      this.connectedBlockWidth = bBox.width;
      this.connectedBlockHeight = bBox.height;
    } else {
      this.connectedBlockWidth = 0;
      this.connectedBlockHeight = 0;
    }

    /** @type {number} */
    this.connectionOffsetX = 0;

    /** @type {number} */
    this.connectionOffsetY = 0;
  }
}

exports.InputConnection = InputConnection;
