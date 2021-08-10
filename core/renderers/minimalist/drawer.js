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

const BaseDrawer = goog.require('Blockly.blockRendering.Drawer');
/* eslint-disable-next-line no-unused-vars */
const BlockSvg = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const RenderInfo = goog.requireType('Blockly.minimalist.RenderInfo');
const object = goog.require('Blockly.utils.object');


/**
 * An object that draws a block based on the given rendering information.
 * @param {!BlockSvg} block The block to render.
 * @param {!RenderInfo} info An object containing all
 *   information needed to render this block.
 * @package
 * @constructor
 * @extends {BaseDrawer}
 */
const Drawer = function(block, info) {
  Drawer.superClass_.constructor.call(this, block, info);
};
object.inherits(Drawer, BaseDrawer);

exports = Drawer;
