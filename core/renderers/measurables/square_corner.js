/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing a square corner in a row of a rendered
 * block.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.provide('Blockly.blockRendering.SquareCorner');

goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.blockRendering.ConstantProvider');


/**
 * An object containing information about the space a square corner takes up
 * during rendering.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {string=} opt_position The position of this corner.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.SquareCorner = function(constants, opt_position) {
  Blockly.blockRendering.SquareCorner.superClass_.constructor.call(this,
      constants);
  this.type = ((!opt_position || opt_position == 'left') ?
      Blockly.blockRendering.Types.LEFT_SQUARE_CORNER :
      Blockly.blockRendering.Types.RIGHT_SQUARE_CORNER) |
          Blockly.blockRendering.Types.CORNER;
  this.height = this.constants_.NO_PADDING;
  this.width = this.constants_.NO_PADDING;

};
Blockly.utils.object.inherits(Blockly.blockRendering.SquareCorner,
    Blockly.blockRendering.Measurable);
