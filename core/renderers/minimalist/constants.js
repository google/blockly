/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An object that provides constants for rendering blocks in the
 * minimalist renderer.
 */
'use strict';

/**
 * An object that provides constants for rendering blocks in the
 * minimalist renderer.
 * @class
 */
goog.module('Blockly.minimalist.ConstantProvider');

const object = goog.require('Blockly.utils.object');
const {ConstantProvider: BaseConstantProvider} = goog.require('Blockly.blockRendering.ConstantProvider');


/**
 * An object that provides constants for rendering blocks in the sample.
 * @constructor
 * @package
 * @extends {BaseConstantProvider}
 * @alias Blockly.minimalist.ConstantProvider
 */
const ConstantProvider = function() {
  ConstantProvider.superClass_.constructor.call(this);
};
object.inherits(ConstantProvider, BaseConstantProvider);

exports.ConstantProvider = ConstantProvider;
