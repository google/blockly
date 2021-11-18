/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Methods for graphically rendering a block as SVG.
 */

'use strict';

/**
 * Methods for graphically rendering a block as SVG.
 * @class
 */
goog.module('Blockly.blockRendering.Measurable');

/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
const {Types} = goog.require('Blockly.blockRendering.Types');


/**
 * The base class to represent a part of a block that takes up space during
 * rendering.  The constructor for each non-spacer Measurable records the size
 * of the block element (e.g. field, statement input).
 * @param {!ConstantProvider} constants The rendering
 *   constants provider.
 * @package
 * @constructor
 * @alias Blockly.blockRendering.Measurable
 */
const Measurable = function(constants) {
  this.width = 0;
  this.height = 0;
  this.type = Types.NONE;

  this.xPos = 0;
  this.centerline = 0;

  /**
   * The renderer's constant provider.
   * @type {!ConstantProvider}
   * @protected
   */
  this.constants_ = constants;

  this.notchOffset = this.constants_.NOTCH_OFFSET_LEFT;
};

exports.Measurable = Measurable;
