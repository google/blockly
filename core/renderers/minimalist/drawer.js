/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Minimalist rendering drawer.
 */
'use strict';

goog.provide('Blockly.minimalist.Drawer');

goog.require('Blockly.blockRendering.Drawer');
goog.require('Blockly.utils.object');
goog.require('Blockly.minimalist.RenderInfo');


/**
 * An object that draws a block based on the given rendering information.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.minimalist.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Drawer}
 */
Blockly.minimalist.Drawer = function(block, info) {
  Blockly.minimalist.Drawer.superClass_.constructor.call(this, block, info);
};
Blockly.utils.object.inherits(Blockly.minimalist.Drawer,
    Blockly.blockRendering.Drawer);
