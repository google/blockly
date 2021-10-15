/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing statement inputs with connections on a
 * rendered block.
 */
'use strict';

/**
 * Objects representing statement inputs with connections on a
 * rendered block.
 * @class
 */
goog.module('Blockly.geras.StatementInput');

const BaseStatementInput = goog.require('Blockly.blockRendering.StatementInput');
/* eslint-disable-next-line no-unused-vars */
const ConstantProvider = goog.requireType('Blockly.blockRendering.ConstantProvider');
/* eslint-disable-next-line no-unused-vars */
const Input = goog.requireType('Blockly.Input');
const object = goog.require('Blockly.utils.object');


/**
 * An object containing information about the space a statement input takes up
 * during rendering
 * @param {!ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Input} input The statement input to measure and store
 *     information for.
 * @package
 * @constructor
 * @extends {BaseStatementInput}
 * @alias Blockly.geras.StatementInput
 */
const StatementInput = function(constants, input) {
  StatementInput.superClass_.constructor.call(this, constants, input);

  if (this.connectedBlock) {
    // We allow the dark path to show on the parent block so that the child
    // block looks embossed.  This takes up an extra pixel in both x and y.
    this.height += this.constants_.DARK_PATH_OFFSET;
  }
};
object.inherits(StatementInput, BaseStatementInput);

exports = StatementInput;
