/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Objects representing an icon in a row of a rendered
 * block.
 * @author fenichel@google.com (Rachel Fenichel)
 */

goog.module('Blockly.blockRendering.Icon');
goog.module.declareLegacyNamespace();

goog.require('Blockly.blockRendering.Measurable');
goog.require('Blockly.blockRendering.Types');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.blockRendering.ConstantProvider');
goog.requireType('Blockly.Icon');
 
 
/**
 * An object containing information about the space an icon takes up during
 * rendering
 * @param {!Blockly.blockRendering.ConstantProvider} constants The rendering
 *   constants provider.
 * @param {!Blockly.Icon} icon The icon to measure and store information for.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Measurable}
 */
const Icon = function(constants, icon) {
  Icon.superClass_.constructor.call(this, constants);
  this.icon = icon;
  this.isVisible = icon.isVisible();
  this.type |= Blockly.blockRendering.Types.ICON;

  const size = icon.getCorrectedSize();
  this.height = size.height;
  this.width = size.width;
};
Blockly.utils.object.inherits(Icon,
    Blockly.blockRendering.Measurable);

exports = Icon;
