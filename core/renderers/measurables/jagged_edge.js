/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing a jagged edge in a row of a rendered
 * block.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.module('Blockly.blockRendering.JaggedEdge');
goog.module.declareLegacyNamespace();

/* eslint-disable-next-line no-unused-vars */
const ConstantProvider = goog.requireType('Blockly.blockRendering.ConstantProvider');
const Measurable = goog.require('Blockly.blockRendering.Measurable');
const Types = goog.require('Blockly.blockRendering.Types');
const object = goog.require('Blockly.utils.object');


/**
 * An object containing information about the jagged edge of a collapsed block
 * takes up during rendering
 * @param {!ConstantProvider} constants The rendering
 *   constants provider.
 * @package
 * @constructor
 * @extends {Measurable}
 */
const JaggedEdge = function(constants) {
  JaggedEdge.superClass_.constructor.call(
      this, constants);
  this.type |= Types.JAGGED_EDGE;
  this.height = this.constants_.JAGGED_TEETH.height;
  this.width = this.constants_.JAGGED_TEETH.width;
};
object.inherits(JaggedEdge,
    Measurable);

exports = JaggedEdge;
