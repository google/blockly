/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing connections on rendered blocks.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.provide('Blockly.blockRendering.Connection');
goog.provide('Blockly.blockRendering.NextConnection');
goog.provide('Blockly.blockRendering.OutputConnection');
goog.provide('Blockly.blockRendering.PreviousConnection');

goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');



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

/**
 * An object containing information about the space a next connection takes
 * up during rendering.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {Blockly.RenderedConnection} connectionModel The connection object on
 *     the block that this represents.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Connection}
 */
Blockly.blockRendering.NextConnection = function(constants, connectionModel) {
  Blockly.blockRendering.NextConnection.superClass_.constructor.call(this,
      constants, connectionModel);
  this.type |= Blockly.blockRendering.Types.NEXT_CONNECTION;
  this.height = this.shape.height;
  this.width = this.shape.width;
};
Blockly.utils.object.inherits(Blockly.blockRendering.NextConnection,
    Blockly.blockRendering.Connection);
