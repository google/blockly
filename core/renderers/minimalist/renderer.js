/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Minimalist renderer.
 */
'use strict';

goog.provide('Blockly.minimalist.Renderer');

goog.require('Blockly.blockRendering');
goog.require('Blockly.blockRendering.Renderer');
goog.require('Blockly.utils.object');
goog.require('Blockly.minimalist.ConstantProvider');
goog.require('Blockly.minimalist.Drawer');
goog.require('Blockly.minimalist.RenderInfo');


/**
 * The minimalist renderer.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Renderer}
 */
Blockly.minimalist.Renderer = function() {
  Blockly.minimalist.Renderer.superClass_.constructor.call(this);
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
