/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class representing external value inputs with connections on a
 * rendered block.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.module('Blockly.blockRendering.ExternalValueInput');
goog.module.declareLegacyNamespace();

goog.require('Blockly.blockRendering.InputConnection');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.blockRendering.ConstantProvider');
goog.requireType('Blockly.Input');


/**
 * An object containing information about the space an external value input
 * takes up during rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Blockly.Input} input The external value input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.InputConnection}
 */
const ExternalValueInput = function(constants, input) {
  ExternalValueInput.superClass_.constructor.call(this,
      constants, input);
  this.type |= Blockly.blockRendering.Types.EXTERNAL_VALUE_INPUT;
  if (!this.connectedBlock) {
    this.height = this.shape.height;
  } else {
    this.height =
        this.connectedBlockHeight - this.constants_.TAB_OFFSET_FROM_TOP -
        this.constants_.MEDIUM_PADDING;
  }
  this.width = this.shape.width +
      this.constants_.EXTERNAL_VALUE_INPUT_PADDING;

  this.connectionOffsetY = this.constants_.TAB_OFFSET_FROM_TOP;
  this.connectionHeight = this.shape.height;
  this.connectionWidth = this.shape.width;
};
Blockly.utils.object.inherits(ExternalValueInput,
    Blockly.blockRendering.InputConnection);

exports = ExternalValueInput;
