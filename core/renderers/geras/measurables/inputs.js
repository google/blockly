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
 * @author kozbial@google.com (Monica Kozbial)
 */
'use strict';

goog.provide('Blockly.geras.ExternalValueInput');
goog.provide('Blockly.geras.InlineInput');
goog.provide('Blockly.geras.InputConnection');
goog.provide('Blockly.geras.StatementInput');

goog.require('Blockly.blockRendering.Connection');
goog.require('Blockly.utils.object');

/**
 * The base class to represent an input that takes up space on a block
 * during rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Blockly.Input} input The input to measure and store information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Connection}
 */
Blockly.geras.InputConnection = function(constants, input) {
  Blockly.geras.InputConnection.superClass_.constructor.call(
      this, constants, input);
};
Blockly.utils.object.inherits(Blockly.geras.InputConnection,
    Blockly.blockRendering.InputConnection);

/**
 * An object containing information about the space an inline input takes up
 * during rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Blockly.Input} input The inline input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.InputConnection}
 */
Blockly.geras.InlineInput = function(constants, input) {
  Blockly.geras.InlineInput.superClass_.constructor.call(
      this, constants, input);

  if (this.connectedBlock) {
    // We allow the dark path to show on the parent block so that the child
    // block looks embossed.  This takes up an extra pixel in both x and y.
    this.width += this.constants_.DARK_PATH_OFFSET;
    this.height += this.constants_.DARK_PATH_OFFSET;
  }
};
Blockly.utils.object.inherits(Blockly.geras.InlineInput,
    Blockly.blockRendering.InlineInput);

/**
 * An object containing information about the space a statement input takes up
 * during rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Blockly.Input} input The statement input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.InputConnection}
 */
Blockly.geras.StatementInput = function(constants, input) {
  Blockly.geras.StatementInput.superClass_.constructor.call(
      this, constants, input);

  if (this.connectedBlock) {
    // We allow the dark path to show on the parent block so that the child
    // block looks embossed.  This takes up an extra pixel in both x and y.
    this.height += this.constants_.DARK_PATH_OFFSET;
  }
};
Blockly.utils.object.inherits(Blockly.geras.StatementInput,
    Blockly.blockRendering.StatementInput);



/**
 * An object containing information about the space an external value input
 * takes up during rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Blockly.Input} input The external value input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.InputConnection}
 */
Blockly.geras.ExternalValueInput = function(constants, input) {
  Blockly.geras.ExternalValueInput.superClass_.constructor.call(
      this, constants, input);
};
Blockly.utils.object.inherits(Blockly.geras.ExternalValueInput,
    Blockly.blockRendering.ExternalValueInput);

