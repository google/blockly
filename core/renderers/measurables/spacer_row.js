/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a spacer between two rows.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.module('Blockly.blockRendering.SpacerRow');
goog.module.declareLegacyNamespace();

goog.requireType('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.blockRendering.InRowSpacer');
goog.require('Blockly.blockRendering.Row');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');


/**
 * An object containing information about a spacer between two rows.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {number} height The height of the spacer.
 * @param {number} width The width of the spacer.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Row}
 */
const SpacerRow = function(constants, height, width) {
  SpacerRow.superClass_.constructor.call(this,
      constants);
  this.type |= Blockly.blockRendering.Types.SPACER |
      Blockly.blockRendering.Types.BETWEEN_ROW_SPACER;
  this.width = width;
  this.height = height;
  this.followsStatement = false;
  this.widthWithConnectedBlocks = 0;
  this.elements = [
    new Blockly.blockRendering.InRowSpacer(this.constants_, width)];
};
Blockly.utils.object.inherits(SpacerRow,
    Blockly.blockRendering.Row);

/**
 * @override
 */
SpacerRow.prototype.measure = function() {
  // NOP.  Width and height were set at creation.
};

exports = SpacerRow;
