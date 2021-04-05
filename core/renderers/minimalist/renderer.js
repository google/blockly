/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Minimalist renderer.
 */
'use strict';

goog.provide('Blockly.minimalist.Renderer');

goog.require('Blockly.blockRendering');
goog.require('Blockly.blockRendering.Renderer');
goog.require('Blockly.minimalist.ConstantProvider');
goog.require('Blockly.minimalist.Drawer');
goog.require('Blockly.minimalist.RenderInfo');
goog.require('Blockly.utils.object');


/**
 * The minimalist renderer.
 * @param {string} name The renderer name.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Renderer}
 */
Blockly.minimalist.Renderer = function(name) {
  Blockly.minimalist.Renderer.superClass_.constructor.call(this, name);
};
Blockly.utils.object.inherits(Blockly.minimalist.Renderer,
    Blockly.blockRendering.Renderer);

/**
 * Create a new instance of the renderer's constant provider.
 * @return {!Blockly.minimalist.ConstantProvider} The constant provider.
 * @protected
 * @override
 */
Blockly.minimalist.Renderer.prototype.makeConstants_ = function() {
  return new Blockly.minimalist.ConstantProvider();
};

/**
 * Create a new instance of the renderer's render info object.
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @return {!Blockly.minimalist.RenderInfo} The render info object.
 * @protected
 * @override
 */
Blockly.minimalist.Renderer.prototype.makeRenderInfo_ = function(block) {
  return new Blockly.minimalist.RenderInfo(this, block);
};

/**
 * Create a new instance of the renderer's drawer.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.blockRendering.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @return {!Blockly.minimalist.Drawer} The drawer.
 * @protected
 * @override
 */
Blockly.minimalist.Renderer.prototype.makeDrawer_ = function(block, info) {
  return new Blockly.minimalist.Drawer(block,
      /** @type {!Blockly.minimalist.RenderInfo} */ (info));
};

Blockly.blockRendering.register('minimalist', Blockly.minimalist.Renderer);
