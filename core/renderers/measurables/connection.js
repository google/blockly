/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Base class representing the space a connection takes up during
 * rendering.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.provide('Blockly.blockRendering.Connection');

goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.blockRendering.ConstantProvider');
goog.requireType('Blockly.RenderedConnection');


/**
 * The base class to represent a connection and the space that it takes up on
 * the block.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Blockly.RenderedConnection} connectionModel The connection object on
 *     the block that this represents.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.Connection = function(constants, connectionModel) {
  Blockly.blockRendering.Connection.superClass_.constructor.call(this,
      constants);
  this.connectionModel = connectionModel;
  this.shape = this.constants_.shapeFor(connectionModel);
  this.isDynamicShape = !!this.shape['isDynamic'];
  this.type |= Blockly.blockRendering.Types.CONNECTION;
};
Blockly.utils.object.inherits(Blockly.blockRendering.Connection,
    Blockly.blockRendering.Measurable);
