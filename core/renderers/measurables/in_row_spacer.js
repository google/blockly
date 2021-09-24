/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing a spacer in a row of a rendered
 * block.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.module('Blockly.blockRendering.InRowSpacer');

/* eslint-disable-next-line no-unused-vars */
const ConstantProvider = goog.requireType('Blockly.blockRendering.ConstantProvider');
const Measurable = goog.require('Blockly.blockRendering.Measurable');
const Types = goog.require('Blockly.blockRendering.Types');
const object = goog.require('Blockly.utils.object');


/**
 * An object containing information about a spacer between two elements on a
 * row.
 * @param {!ConstantProvider} constants The rendering
 *   constants provider.
 * @param {number} width The width of the spacer.
 * @package
 * @constructor
 * @extends {Measurable}
 */
const InRowSpacer = function(constants, width) {
  InRowSpacer.superClass_.constructor.call(this, constants);
  this.type |= Types.SPACER | Types.IN_ROW_SPACER;
  this.width = width;
  this.height = this.constants_.SPACER_DEFAULT_HEIGHT;
};
object.inherits(InRowSpacer, Measurable);

exports = InRowSpacer;
