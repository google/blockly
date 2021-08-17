
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class representing the space a output connection takes up
 * during rendering.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.provide('Blockly.blockRendering.OutputConnection');

goog.require('Blockly.blockRendering.Connection');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.blockRendering.ConstantProvider');
goog.requireType('Blockly.RenderedConnection');


/**
 * An object containing information about the space an output connection takes
 * up during rendering.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {Blockly.RenderedConnection} connectionModel The connection object on
 *     the block that this represents.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Connection}
 */
Blockly.blockRendering.OutputConnection = function(constants, connectionModel) {
  Blockly.blockRendering.OutputConnection.superClass_.constructor.call(this,
      constants, connectionModel);
  this.type |= Blockly.blockRendering.Types.OUTPUT_CONNECTION;

  this.height = !this.isDynamicShape ? this.shape.height : 0;
  this.width = !this.isDynamicShape ? this.shape.width : 0;
  this.startX = this.width;

  this.connectionOffsetY = this.constants_.TAB_OFFSET_FROM_TOP;
  this.connectionOffsetX = 0;
};
Blockly.utils.object.inherits(Blockly.blockRendering.OutputConnection,
    Blockly.blockRendering.Connection);
