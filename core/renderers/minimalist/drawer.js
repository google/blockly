/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Minimalist rendering drawer.
 */
'use strict';

goog.module('Blockly.minimalist.Drawer');
goog.module.declareLegacyNamespace();

goog.require('Blockly.blockRendering.Drawer');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.BlockSvg');
goog.requireType('Blockly.minimalist.RenderInfo');


/**
 * An object that draws a block based on the given rendering information.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.minimalist.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Drawer}
 */
const Drawer = function(block, info) {
  Drawer.superClass_.constructor.call(this, block, info);
};
Blockly.utils.object.inherits(Drawer,
    Blockly.blockRendering.Drawer);

exports = Drawer;
