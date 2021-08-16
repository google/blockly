/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing a spacer in a row of a rendered
 * block.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.provide('Blockly.blockRendering.InRowSpacer');

goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.blockRendering.ConstantProvider');
 

/**
 * An object containing information about a spacer between two elements on a
 * row.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {number} width The width of the spacer.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.InRowSpacer = function(constants, width) {
  Blockly.blockRendering.InRowSpacer.superClass_.constructor.call(this,
      constants);
  this.type |= Blockly.blockRendering.Types.SPACER |
      Blockly.blockRendering.Types.IN_ROW_SPACER;
  this.width = width;
  this.height = this.constants_.SPACER_DEFAULT_HEIGHT;
};
Blockly.utils.object.inherits(Blockly.blockRendering.InRowSpacer,
    Blockly.blockRendering.Measurable);
