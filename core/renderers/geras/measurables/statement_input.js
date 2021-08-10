/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing statement inputs with connections on a
 * rendered block.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.module('Blockly.geras.StatementInput');
goog.module.declareLegacyNamespace();

goog.require('Blockly.blockRendering.StatementInput');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.blockRendering.ConstantProvider');
goog.requireType('Blockly.Input');


/**
 * An object containing information about the space a statement input takes up
 * during rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Blockly.Input} input The statement input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.StatementInput}
 */
const StatementInput = function(constants, input) {
  StatementInput.superClass_.constructor.call(
      this, constants, input);

  if (this.connectedBlock) {
    // We allow the dark path to show on the parent block so that the child
    // block looks embossed.  This takes up an extra pixel in both x and y.
    this.height += this.constants_.DARK_PATH_OFFSET;
  }
};
Blockly.utils.object.inherits(StatementInput,
    Blockly.blockRendering.StatementInput);

exports = StatementInput;
