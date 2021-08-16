/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing a round corner in a row of a rendered
 * block.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.provide('Blockly.blockRendering.RoundCorner');

goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.blockRendering.ConstantProvider');
 

/**
 * An object containing information about the space a rounded corner takes up
 * during rendering.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {string=} opt_position The position of this corner.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.RoundCorner = function(constants, opt_position) {
  Blockly.blockRendering.RoundCorner.superClass_.constructor.call(this,
      constants);
  this.type = ((!opt_position || opt_position == 'left') ?
      Blockly.blockRendering.Types.LEFT_ROUND_CORNER :
      Blockly.blockRendering.Types.RIGHT_ROUND_CORNER) |
          Blockly.blockRendering.Types.CORNER;
  this.width = this.constants_.CORNER_RADIUS;
  // The rounded corner extends into the next row by 4 so we only take the
  // height that is aligned with this row.
  this.height = this.constants_.CORNER_RADIUS / 2;

};
Blockly.utils.object.inherits(Blockly.blockRendering.RoundCorner,
    Blockly.blockRendering.Measurable);
