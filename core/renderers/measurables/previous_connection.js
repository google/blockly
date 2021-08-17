/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Class representing the space a previous connection takes up
 * during rendering.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.provide('Blockly.blockRendering.PreviousConnection');

goog.require('Blockly.blockRendering.Connection');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.blockRendering.ConstantProvider');
goog.requireType('Blockly.RenderedConnection');


/**
 * An object containing information about the space a previous connection takes
 * up during rendering.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {Blockly.RenderedConnection} connectionModel The connection object on
 *     the block that this represents.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Connection}
 */
Blockly.blockRendering.PreviousConnection = function(
    constants, connectionModel) {
  Blockly.blockRendering.PreviousConnection.superClass_.constructor.call(this,
      constants, connectionModel);
  this.type |= Blockly.blockRendering.Types.PREVIOUS_CONNECTION;
  this.height = this.shape.height;
  this.width = this.shape.width;

};
Blockly.utils.object.inherits(Blockly.blockRendering.PreviousConnection,
    Blockly.blockRendering.Connection);
