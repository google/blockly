/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
 * https://developers.google.com/blockly/
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
 * @fileoverview Sample renderer.
 */
'use strict';

goog.provide('Blockly.sample.Renderer');

goog.require('Blockly.blockRendering');
goog.require('Blockly.blockRendering.Renderer');
goog.require('Blockly.utils.object');
goog.require('Blockly.sample.ConstantProvider');
goog.require('Blockly.sample.Drawer');
goog.require('Blockly.sample.RenderInfo');


/**
 * The sample renderer.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Renderer}
 */
Blockly.sample.Renderer = function() {
  Blockly.sample.Renderer.superClass_.constructor.call(this);
};
Blockly.utils.object.inherits(Blockly.sample.Renderer,
    Blockly.blockRendering.Renderer);

/**
 * Create a new instance of the renderer's constant provider.
 * @return {!Blockly.sample.ConstantProvider} The constant provider.
 * @protected
 * @override
 */
Blockly.sample.Renderer.prototype.makeConstants_ = function() {
  return new Blockly.sample.ConstantProvider();
};

/**
 * Create a new instance of the renderer's render info object.
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @return {!Blockly.sample.RenderInfo} The render info object.
 * @protected
 * @override
 */
Blockly.sample.Renderer.prototype.makeRenderInfo_ = function(block) {
  return new Blockly.sample.RenderInfo(this, block);
};

/**
 * Create a new instance of the renderer's drawer.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.blockRendering.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @return {!Blockly.sample.Drawer} The drawer.
 * @protected
 * @override
 */
Blockly.sample.Renderer.prototype.makeDrawer_ = function(block, info) {
  return new Blockly.sample.Drawer(block,
      /** @type {!Blockly.sample.RenderInfo} */ (info));
};

Blockly.blockRendering.register('sample', Blockly.sample.Renderer);
