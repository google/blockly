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

goog.module('Blockly.minimalist.ConstantProvider');
goog.module.declareLegacyNamespace();

goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.utils.object');


/**
 * An object that provides constants for rendering blocks in the sample.
 * @constructor
 * @package
 * @extends {Blockly.blockRendering.ConstantProvider}
 */
const ConstantProvider = function() {
  ConstantProvider.superClass_.constructor.call(this);
};
Blockly.utils.object.inherits(ConstantProvider,
    Blockly.blockRendering.ConstantProvider);

exports = ConstantProvider;
