/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing inputs with connections on a rendered
 * block.
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Blockly.geras.InlineInput');
goog.provide('Blockly.geras.StatementInput');

goog.require('Blockly.utils.object');


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
Blockly.geras.InlineInput = function(constants, input) {
  Blockly.geras.InlineInput.superClass_.constructor.call(
      this, constants, input);

  if (this.connectedBlock) {
    // We allow the dark path to show on the parent block so that the child
    // block looks embossed.  This takes up an extra pixel in both x and y.
    this.width += this.constants_.DARK_PATH_OFFSET;
    this.height += this.constants_.DARK_PATH_OFFSET;
  }
};
Blockly.utils.object.inherits(Blockly.geras.InlineInput,
    Blockly.blockRendering.InlineInput);

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
Blockly.geras.StatementInput = function(constants, input) {
  Blockly.geras.StatementInput.superClass_.constructor.call(
      this, constants, input);

  if (this.connectedBlock) {
    // We allow the dark path to show on the parent block so that the child
    // block looks embossed.  This takes up an extra pixel in both x and y.
    this.height += this.constants_.DARK_PATH_OFFSET;
  }
};
Blockly.utils.object.inherits(Blockly.geras.StatementInput,
    Blockly.blockRendering.StatementInput);
