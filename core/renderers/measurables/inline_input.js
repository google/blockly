/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class representing inline inputs with connections on a rendered
 * block.
 */

/**
 * Class representing inline inputs with connections on a rendered
 * block.
 * @class
 */
goog.module('Blockly.blockRendering.InlineInput');

/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
const {InputConnection} = goog.require('Blockly.blockRendering.InputConnection');
/* eslint-disable-next-line no-unused-vars */
const {Input} = goog.requireType('Blockly.Input');
const {Types} = goog.require('Blockly.blockRendering.Types');


/**
 * An object containing information about the space an inline input takes up
 * during rendering
 * @extends {InputConnection}
 * @struct
 * @alias Blockly.blockRendering.InlineInput
 */
class InlineInput extends InputConnection {
  /**
   * @param {!ConstantProvider} constants The rendering
   *   constants provider.
   * @param {!Input} input The inline input to measure and store
   *     information for.
   * @package
   */
  constructor(constants, input) {
    super(constants, input);
    this.type |= Types.INLINE_INPUT;

    if (!this.connectedBlock) {
      this.height = this.constants_.EMPTY_INLINE_INPUT_HEIGHT;
      this.width = this.constants_.EMPTY_INLINE_INPUT_PADDING;
    } else {
      // We allow the dark path to show on the parent block so that the child
      // block looks embossed.  This takes up an extra pixel in both x and y.
      this.width = this.connectedBlockWidth;
      this.height = this.connectedBlockHeight;
    }

    /** @type {number} */
    this.connectionHeight = !this.isDynamicShape ?
        this.shape.height :
        this.shape.height(this.height);

    /** @type {number} */
    this.connectionWidth =
        !this.isDynamicShape ? this.shape.width : this.shape.width(this.height);
    if (!this.connectedBlock) {
      this.width += this.connectionWidth * (this.isDynamicShape ? 2 : 1);
    }

    /** @type {number} */
    this.connectionOffsetY = this.isDynamicShape ?
        this.shape.connectionOffsetY(this.connectionHeight) :
        this.constants_.TAB_OFFSET_FROM_TOP;

    /** @type {number} */
    this.connectionOffsetX = this.isDynamicShape ?
        this.shape.connectionOffsetX(this.connectionWidth) :
        0;
  }
}

exports.InlineInput = InlineInput;
