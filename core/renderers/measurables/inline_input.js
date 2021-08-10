/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class representing inline inputs with connections on a rendered
 * block.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.provide('Blockly.blockRendering.InlineInput');

goog.require('Blockly.blockRendering.InputConnection');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.blockRendering.ConstantProvider');
goog.requireType('Blockly.Input');


/**
 * An object containing information about the space an inline input takes up
 * during rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Blockly.Input} input The inline input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.InputConnection}
 */
Blockly.blockRendering.InlineInput = function(constants, input) {
  Blockly.blockRendering.InlineInput.superClass_.constructor.call(this,
      constants, input);
  this.type |= Blockly.blockRendering.Types.INLINE_INPUT;

  if (!this.connectedBlock) {
    this.height = this.constants_.EMPTY_INLINE_INPUT_HEIGHT;
    this.width = this.constants_.EMPTY_INLINE_INPUT_PADDING;
  } else {
    // We allow the dark path to show on the parent block so that the child
    // block looks embossed.  This takes up an extra pixel in both x and y.
    this.width = this.connectedBlockWidth;
    this.height = this.connectedBlockHeight;
  }

  this.connectionHeight = !this.isDynamicShape ? this.shape.height :
      this.shape.height(this.height);
  this.connectionWidth = !this.isDynamicShape ? this.shape.width :
      this.shape.width(this.height);
  if (!this.connectedBlock) {
    this.width += this.connectionWidth * (this.isDynamicShape ? 2 : 1);
  }
  this.connectionOffsetY = this.isDynamicShape ?
      this.shape.connectionOffsetY(this.connectionHeight) :
      this.constants_.TAB_OFFSET_FROM_TOP;
  this.connectionOffsetX = this.isDynamicShape ?
      this.shape.connectionOffsetX(this.connectionWidth) : 0;
};
Blockly.utils.object.inherits(Blockly.blockRendering.InlineInput,
    Blockly.blockRendering.InputConnection);
