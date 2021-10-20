/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Object representing a spacer between two rows.
 */

/**
 * Object representing a spacer between two rows.
 * @class
 */
goog.module('Blockly.blockRendering.SpacerRow');

const object = goog.require('Blockly.utils.object');
/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
const {InRowSpacer} = goog.require('Blockly.blockRendering.InRowSpacer');
const {Row} = goog.require('Blockly.blockRendering.Row');
const {Types} = goog.require('Blockly.blockRendering.Types');


/**
 * An object containing information about a spacer between two rows.
 * @param {!ConstantProvider} constants The rendering
 *   constants provider.
 * @param {number} height The height of the spacer.
 * @param {number} width The width of the spacer.
 * @package
 * @constructor
 * @extends {Row}
 * @alias Blockly.blockRendering.SpacerRow
 */
const SpacerRow = function(constants, height, width) {
  SpacerRow.superClass_.constructor.call(this, constants);
  this.type |= Types.SPACER | Types.BETWEEN_ROW_SPACER;
  this.width = width;
  this.height = height;
  this.followsStatement = false;
  this.widthWithConnectedBlocks = 0;
  this.elements = [new InRowSpacer(this.constants_, width)];
};
object.inherits(SpacerRow, Row);

/**
 * @override
 */
SpacerRow.prototype.measure = function() {
  // NOP.  Width and height were set at creation.
};

exports.SpacerRow = SpacerRow;
