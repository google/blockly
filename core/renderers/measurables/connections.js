/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Objects representing connections on rendered blocks.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.provide('Blockly.blockRendering.Connection');
goog.provide('Blockly.blockRendering.OutputConnection');
goog.provide('Blockly.blockRendering.PreviousConnection');
goog.provide('Blockly.blockRendering.NextConnection');

goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.constants');

/**
 * The base class to represent a connection and the space that it takes up on
 * the block.
 * @param {Blockly.RenderedConnection} connectionModel The connection object on
 *     the block that this represents.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
Blockly.blockRendering.Connection = function(connectionModel) {
  Blockly.blockRendering.Connection.superClass_.constructor.call(this);
  this.connectionModel = connectionModel;
};
goog.inherits(Blockly.blockRendering.Connection,
    Blockly.blockRendering.Measurable);

/**
 * An object containing information about the space an output connection takes
 * up during rendering.
 * @param {Blockly.RenderedConnection} connectionModel The connection object on
 *     the block that this represents.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Connection}
 */
Blockly.blockRendering.OutputConnection = function(connectionModel) {
  Blockly.blockRendering.OutputConnection.superClass_.constructor.call(this,
      connectionModel);
  this.type = 'output connection';
  this.height = this.connectionShape.height;
  this.width = this.connectionShape.width;
  this.connectionOffsetY = Blockly.blockRendering.constants.TAB_OFFSET_FROM_TOP;
  this.startX = this.width;
};
goog.inherits(Blockly.blockRendering.OutputConnection,
    Blockly.blockRendering.Connection);

/**
 * An object containing information about the space a previous connection takes
 * up during rendering.
 * @param {Blockly.RenderedConnection} connectionModel The connection object on
 *     the block that this represents.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Connection}
 */
Blockly.blockRendering.PreviousConnection = function(connectionModel) {
  Blockly.blockRendering.PreviousConnection.superClass_.constructor.call(this,
      connectionModel);
  this.type = 'previous connection';
  this.height = this.notchShape.height;
  this.width = this.notchShape.width;

};
goog.inherits(Blockly.blockRendering.PreviousConnection,
    Blockly.blockRendering.Connection);

/**
 * An object containing information about the space a next connection takes
 * up during rendering.
 * @param {Blockly.RenderedConnection} connectionModel The connection object on
 *     the block that this represents.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Connection}
 */
Blockly.blockRendering.NextConnection = function(connectionModel) {
  Blockly.blockRendering.NextConnection.superClass_.constructor.call(this,
      connectionModel);
  this.type = 'next connection';
  this.height = this.notchShape.height;
  this.width = this.notchShape.width;
};
goog.inherits(Blockly.blockRendering.NextConnection,
    Blockly.blockRendering.Connection);
