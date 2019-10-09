/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview An object representing a single row on a rendered block and all
 * of its subcomponents.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.zelos.BottomRow');
goog.provide('Blockly.zelos.TopRow');
goog.provide('Blockly.zelos.AfterStatementSpacerRow');
goog.provide('Blockly.zelos.BeforeStatementSpacerRow');

goog.require('Blockly.blockRendering.BottomRow');
goog.require('Blockly.blockRendering.TopRow');
goog.require('Blockly.blockRendering.SpacerRow');
goog.require('Blockly.utils.object');


/**
 * An object containing information about what elements are in the top row of a
 * block as well as sizing information for the top row.
 * Elements in a top row can consist of corners, hats, spacers, and previous
 * connections.
 * After this constructor is called, the row will contain all non-spacer
 * elements it needs.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.TopRow}
 */
Blockly.zelos.TopRow = function(constants) {
  Blockly.zelos.TopRow.superClass_.constructor.call(this, constants);
};
Blockly.utils.object.inherits(Blockly.zelos.TopRow,
    Blockly.blockRendering.TopRow);

/**
 * @override
 */
Blockly.zelos.TopRow.prototype.endsWithElemSpacer = function() {
  return false;
};

/**
 * Render a round corner unless the block has an output connection.
 * @override
 */
Blockly.zelos.TopRow.prototype.hasLeftSquareCorner = function(block) {
  return !!block.outputConnection;
};

/**
 * Returns whether or not the top row has a right square corner.
 * @param {!Blockly.BlockSvg} block The block whose top row this represents.
 * @returns {boolean} Whether or not the top row has a left square corner.
 */
Blockly.zelos.TopRow.prototype.hasRightSquareCorner = function(block) {
  // Render a round corner unless the block has an output connection.
  return !!block.outputConnection;
};

/**
 * An object containing information about what elements are in the bottom row of
 * a block as well as spacing information for the top row.
 * Elements in a bottom row can consist of corners, spacers and next
 * connections.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.BottomRow}
 */
Blockly.zelos.BottomRow = function(constants) {
  Blockly.zelos.BottomRow.superClass_.constructor.call(this, constants);
};
Blockly.utils.object.inherits(Blockly.zelos.BottomRow,
    Blockly.blockRendering.BottomRow);

/**
 * @override
 */
Blockly.zelos.BottomRow.prototype.endsWithElemSpacer = function() {
  return false;
};

/**
 * Render a round corner unless the block has an output connection.
 * @override
 */
Blockly.zelos.BottomRow.prototype.hasLeftSquareCorner = function(block) {
  return !!block.outputConnection;
};

/**
 * Returns whether or not the bottom row has a right square corner.
 * @param {!Blockly.BlockSvg} block The block whose bottom row this represents.
 * @returns {boolean} Whether or not the bottom row has a left square corner.
 */
Blockly.zelos.BottomRow.prototype.hasRightSquareCorner = function(block) {
  // Render a round corner unless the block has an output connection.
  return !!block.outputConnection;
};

/**
 * An object containing information about a row spacer that comes right
 *   before a statement input.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {number} height The height of the spacer.
 * @param {number} width The width of the spacer.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.SpacerRow}
 */
Blockly.zelos.BeforeStatementSpacerRow = function(constants, height, width) {
  Blockly.zelos.BeforeStatementSpacerRow.superClass_.constructor.call(
      this, constants, height, width);
  this.type |=
      Blockly.blockRendering.Types.getType('BEFORE_STATEMENT_SPACER_ROW');
};
Blockly.utils.object.inherits(Blockly.zelos.BeforeStatementSpacerRow,
    Blockly.blockRendering.SpacerRow);

/**
 * An object containing information about a row spacer that comes right
 *   after a statement input.
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {number} height The height of the spacer.
 * @param {number} width The width of the spacer.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.SpacerRow}
 */
Blockly.zelos.AfterStatementSpacerRow = function(constants, height, width) {
  Blockly.zelos.AfterStatementSpacerRow.superClass_.constructor.call(
      this, constants, height, width);
  this.type |=
      Blockly.blockRendering.Types.getType('AFTER_STATEMENT_SPACER_ROW');
};
Blockly.utils.object.inherits(Blockly.zelos.AfterStatementSpacerRow,
    Blockly.blockRendering.SpacerRow);
