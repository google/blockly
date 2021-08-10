/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing inline inputs with connections on a
 * rendered block.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.module('Blockly.geras.InlineInput');
goog.module.declareLegacyNamespace();

goog.require('Blockly.blockRendering.InlineInput');
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
 * @extends {Blockly.blockRendering.InlineInput}
 */
const InlineInput = function(constants, input) {
  InlineInput.superClass_.constructor.call(
      this, constants, input);

  if (this.connectedBlock) {
    // We allow the dark path to show on the parent block so that the child
    // block looks embossed.  This takes up an extra pixel in both x and y.
    this.width += this.constants_.DARK_PATH_OFFSET;
    this.height += this.constants_.DARK_PATH_OFFSET;
  }
};
Blockly.utils.object.inherits(InlineInput,
    Blockly.blockRendering.InlineInput);

exports = InlineInput;
