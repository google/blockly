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

goog.provide('Blockly.minimalist.ConstantProvider');

goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.utils.object');


/**
 * An object that provides constants for rendering blocks in the sample.
 * @constructor
 * @package
 * @extends {Blockly.blockRendering.ConstantProvider}
 */
Blockly.minimalist.ConstantProvider = function() {
  Blockly.minimalist.ConstantProvider.superClass_.constructor.call(this);
};
Blockly.utils.object.inherits(Blockly.minimalist.ConstantProvider,
    Blockly.blockRendering.ConstantProvider);
