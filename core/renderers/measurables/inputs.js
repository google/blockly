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
 * @fileoverview Objects representing inputs with connections on a rendered
 * block.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.provide('Blockly.blockRendering.InputConnection');
goog.provide('Blockly.blockRendering.InlineInput');
goog.provide('Blockly.blockRendering.StatementInput');
goog.provide('Blockly.blockRendering.ExternalValueInput');

goog.require('Blockly.blockRendering.Connection');
goog.require('Blockly.blockRendering.Measurable');


/**
 * The base class to represent an input that takes up space on a block
 * during rendering
 * @param {!Blockly.Input} input The input to measure and store information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Connection}
 */
Blockly.blockRendering.InputConnection = function(input) {
  Blockly.blockRendering.InputConnection.superClass_.constructor.call(this,
      input.connection);

  this.isInput = true;
  this.input = input;
  this.align = input.align;
  this.connectedBlock = input.connection && input.connection.targetBlock() ?
      input.connection.targetBlock() : null;

  if (this.connectedBlock) {
    var bBox = this.connectedBlock.getHeightWidth();
    this.connectedBlockWidth = bBox.width;
    this.connectedBlockHeight = bBox.height;
  } else {
    this.connectedBlockWidth = 0;
    this.connectedBlockHeight = 0;
  }

  // TODO: change references to connectionModel, since that's on Connection.
  this.connection = input.connection;
  this.connectionOffsetX = 0;
  this.connectionOffsetY = 0;
};
goog.inherits(Blockly.blockRendering.InputConnection,
    Blockly.blockRendering.Connection);

/**
 * An object containing information about the space an inline input takes up
 * during rendering
 * @param {!Blockly.Input} input The inline input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.InputConnection}
 */
Blockly.blockRendering.InlineInput = function(input) {
  Blockly.blockRendering.InlineInput.superClass_.constructor.call(this,
      input);
  this.type = 'inline input';

  if (!this.connectedBlock) {
    this.height = this.constants_.EMPTY_INLINE_INPUT_HEIGHT;
    this.width = this.connectionShape.width +
        this.constants_.EMPTY_INLINE_INPUT_PADDING;
  } else {
    // We allow the dark path to show on the parent block so that the child
    // block looks embossed.  This takes up an extra pixel in both x and y.
    this.width = this.connectedBlockWidth +
        this.constants_.DARK_PATH_OFFSET;
    this.height = this.connectedBlockHeight + this.constants_.DARK_PATH_OFFSET;
  }

  this.connectionOffsetY = this.constants_.TAB_OFFSET_FROM_TOP;
  this.connectionHeight = this.connectionShape.height;
  this.connectionWidth = this.connectionShape.width;
};
goog.inherits(Blockly.blockRendering.InlineInput,
    Blockly.blockRendering.InputConnection);

/**
 * An object containing information about the space a statement input takes up
 * during rendering
 * @param {!Blockly.Input} input The statement input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.InputConnection}
 */
Blockly.blockRendering.StatementInput = function(input) {
  Blockly.blockRendering.StatementInput.superClass_.constructor.call(this,
      input);
  this.type = 'statement input';

  if (!this.connectedBlock) {
    this.height = this.constants_.EMPTY_STATEMENT_INPUT_HEIGHT;
  } else {
    this.height =
        this.connectedBlockHeight + this.constants_.STATEMENT_BOTTOM_SPACER;
    if (this.connectedBlock.nextConnection) {
      this.height -= this.notchShape.height;
    }
  }
  this.width = this.constants_.NOTCH_OFFSET_LEFT +
      this.notchShape.width;
};
goog.inherits(Blockly.blockRendering.StatementInput,
    Blockly.blockRendering.InputConnection);

/**
 * An object containing information about the space an external value input
 * takes up during rendering
 * @param {!Blockly.Input} input The external value input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.InputConnection}
 */
Blockly.blockRendering.ExternalValueInput = function(input) {
  Blockly.blockRendering.ExternalValueInput.superClass_.constructor.call(this,
      input);
  this.type = 'external value input';

  if (!this.connectedBlock) {
    this.height = this.connectionShape.height;
  } else {
    this.height =
        this.connectedBlockHeight - 2 * this.constants_.TAB_OFFSET_FROM_TOP;
  }
  this.width = this.connectionShape.width +
      this.constants_.EXTERNAL_VALUE_INPUT_PADDING;

  this.connectionOffsetY = this.constants_.TAB_OFFSET_FROM_TOP;
  this.connectionHeight = this.connectionShape.height;
  this.connectionWidth = this.connectionShape.width;
};
goog.inherits(Blockly.blockRendering.ExternalValueInput,
    Blockly.blockRendering.InputConnection);
