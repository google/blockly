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


/**
 * An object containing information about what elements are in the top row of a
 * block as well as sizing information for the top row.
 * Elements in a top row can consist of corners, hats, spacers, and previous
 * connections.
 * After this constructor is called, the row will contain all non-spacer
 * elements it needs.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.TopRow}
 */
Blockly.zelos.TopRow = function() {
  Blockly.zelos.TopRow.superClass_.constructor.call(this);
};
goog.inherits(Blockly.zelos.TopRow, Blockly.blockRendering.TopRow);

/**
 * Create all non-spacer elements that belong on the top row.
 * @param {!Blockly.BlockSvg} block The block whose top row this represents.
 * @package
 * @override
 */
Blockly.zelos.TopRow.prototype.populate = function(block) {
  Blockly.zelos.TopRow.superClass_.populate.call(this, block);

  var rightSquareCorner = this.hasRightSquareCorner(block);

  if (rightSquareCorner) {
    this.elements.push(new Blockly.blockRendering.SquareCorner('right'));
  } else {
    this.elements.push(new Blockly.blockRendering.RoundCorner('right'));
  }
};

/**
 * Render a round corner unless the block has an output connection.
 * @override
 */
Blockly.zelos.TopRow.prototype.hasLeftSquareCorner = function(block) {
  return block.outputConnection;
};

/**
 * Returns whether or not the top row has a right square corner.
 * @param {!Blockly.BlockSvg} block The block whose top row this represents.
 * @returns {boolean} Whether or not the top row has a left square corner.
 */
Blockly.zelos.TopRow.prototype.hasRightSquareCorner = function(block) {
  // Render a round corner unless the block has an output connection.
  return block.outputConnection;
};

/**
 * An object containing information about what elements are in the bottom row of
 * a block as well as spacing information for the top row.
 * Elements in a bottom row can consist of corners, spacers and next
 * connections.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.BottomRow}
 */
Blockly.zelos.BottomRow = function() {
  Blockly.zelos.BottomRow.superClass_.constructor.call(this);
};
goog.inherits(Blockly.zelos.BottomRow, Blockly.blockRendering.BottomRow);

/**
 * Create all non-spacer elements that belong on the bottom row.
 * @param {!Blockly.BlockSvg} block The block whose bottom row this represents.
 * @package
 * @override
 */
Blockly.zelos.BottomRow.prototype.populate = function(block) {
  Blockly.zelos.BottomRow.superClass_.populate.call(this, block);

  var rightSquareCorner = this.hasRightSquareCorner(block);

  if (rightSquareCorner) {
    this.elements.push(new Blockly.blockRendering.SquareCorner('right'));
  } else {
    this.elements.push(new Blockly.blockRendering.RoundCorner('right'));
  }
};

/**
 * Render a round corner unless the block has an output connection.
 * @override
 */
Blockly.zelos.BottomRow.prototype.hasLeftSquareCorner = function(block) {
  return block.outputConnection;
};

/**
 * Returns whether or not the bottom row has a right square corner.
 * @param {!Blockly.BlockSvg} block The block whose bottom row this represents.
 * @returns {boolean} Whether or not the bottom row has a left square corner.
 */
Blockly.zelos.BottomRow.prototype.hasRightSquareCorner = function(block) {
  // Render a round corner unless the block has an output connection.
  return block.outputConnection;
};

/**
 * An object containing information about a row spacer that comes right
 *   before a statement input.
 * @param {number} height The height of the spacer.
 * @param {number} width The width of the spacer.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.SpacerRow}
 */
Blockly.zelos.BeforeStatementSpacerRow = function(height, width) {
  Blockly.zelos.BeforeStatementSpacerRow.superClass_.constructor.call(
      this, height, width);
  this.type |=
      Blockly.blockRendering.Types.getType('BEFORE_STATEMENT_SPACER_ROW');
};
goog.inherits(Blockly.zelos.BeforeStatementSpacerRow,
    Blockly.blockRendering.SpacerRow);

/**
 * An object containing information about a row spacer that comes right
 *   after a statement input.
 * @param {number} height The height of the spacer.
 * @param {number} width The width of the spacer.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.SpacerRow}
 */
Blockly.zelos.AfterStatementSpacerRow = function(height, width) {
  Blockly.zelos.AfterStatementSpacerRow.superClass_.constructor.call(
      this, height, width);
  this.type |=
      Blockly.blockRendering.Types.getType('AFTER_STATEMENT_SPACER_ROW');
};
goog.inherits(Blockly.zelos.AfterStatementSpacerRow,
    Blockly.blockRendering.SpacerRow);
