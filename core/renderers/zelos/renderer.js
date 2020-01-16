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
 * @fileoverview Zelos renderer.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.zelos.Renderer');

goog.require('Blockly.blockRendering');
goog.require('Blockly.blockRendering.Renderer');
goog.require('Blockly.utils.object');
goog.require('Blockly.zelos.ConstantProvider');
goog.require('Blockly.zelos.Drawer');
goog.require('Blockly.zelos.RenderInfo');


/**
 * The zelos renderer.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Renderer}
 */
Blockly.zelos.Renderer = function() {
  Blockly.zelos.Renderer.superClass_.constructor.call(this);
};
Blockly.utils.object.inherits(Blockly.zelos.Renderer,
    Blockly.blockRendering.Renderer);

/**
 * Create a new instance of the renderer's constant provider.
 * @return {!Blockly.zelos.ConstantProvider} The constant provider.
 * @protected
 * @override
 */
Blockly.zelos.Renderer.prototype.makeConstants_ = function() {
  return new Blockly.zelos.ConstantProvider();
};

/**
 * Create a new instance of the renderer's render info object.
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @return {!Blockly.zelos.RenderInfo} The render info object.
 * @protected
 * @override
 */
Blockly.zelos.Renderer.prototype.makeRenderInfo_ = function(block) {
  return new Blockly.zelos.RenderInfo(this, block);
};

/**
 * Create a new instance of the renderer's drawer.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.blockRendering.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @return {!Blockly.zelos.Drawer} The drawer.
 * @protected
 * @override
 */
Blockly.zelos.Renderer.prototype.makeDrawer_ = function(block, info) {
  return new Blockly.zelos.Drawer(block,
      /** @type {!Blockly.zelos.RenderInfo} */ (info));
};

Blockly.blockRendering.register('zelos', Blockly.zelos.Renderer);
