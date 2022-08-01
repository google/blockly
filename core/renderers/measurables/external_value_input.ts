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

/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
const {InputConnection} = goog.require('Blockly.blockRendering.InputConnection');
/* eslint-disable-next-line no-unused-vars */
const {Input} = goog.requireType('Blockly.Input');
const {Types} = goog.require('Blockly.blockRendering.Types');


/**
 * An object containing information about the space an external value input
 * takes up during rendering
 * @struct
 * @extends {InputConnection}
 * @alias Blockly.blockRendering.ExternalValueInput
 */
class ExternalValueInput extends InputConnection {
  /**
   * @param {!ConstantProvider} constants The rendering
   *   constants provider.
   * @param {!Input} input The external value input to measure and store
   *     information for.
   * @package
   */
  constructor(constants, input) {
    super(constants, input);
    this.type |= Types.EXTERNAL_VALUE_INPUT;

    /** @type {number} */
    this.height = 0;
    if (!this.connectedBlock) {
      this.height = this.shape.height;
    } else {
      this.height = this.connectedBlockHeight -
          this.constants_.TAB_OFFSET_FROM_TOP - this.constants_.MEDIUM_PADDING;
    }

    /** @type {number} */
    this.width =
        this.shape.width + this.constants_.EXTERNAL_VALUE_INPUT_PADDING;

    /** @type {number} */
    this.connectionOffsetY = this.constants_.TAB_OFFSET_FROM_TOP;

    /** @type {number} */
    this.connectionHeight = this.shape.height;

    /** @type {number} */
    this.connectionWidth = this.shape.width;
  }
}

exports.ExternalValueInput = ExternalValueInput;
