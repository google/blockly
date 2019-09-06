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
 * @fileoverview Base renderer.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.blockRendering.Renderer');

goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.blockRendering.Debug');
goog.require('Blockly.blockRendering.Drawer');
goog.require('Blockly.blockRendering.PathObject');
goog.require('Blockly.blockRendering.RenderInfo');

/**
 * The base class for a block renderer.
 * @package
 * @constructor
 */
Blockly.blockRendering.Renderer = function() {
  this.constantProvider = Blockly.blockRendering.ConstantProvider;
  this.renderInfo = Blockly.blockRendering.RenderInfo;
  this.drawer = Blockly.blockRendering.Drawer;
  this.debugger = Blockly.blockRendering.Debug;
  this.pathObject = Blockly.blockRendering.PathObject;
};

/**
 * Initialize the renderer
 * @package
 */
Blockly.blockRendering.Renderer.prototype.init = function() {
  this.constants = new this.constantProvider();
  this.constants.init();
};

/**
 * Render the block.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.render = function(block) {
  if (!block.renderingDebugger) {
    block.renderingDebugger = new this.debugger();
  }
  var info = new this.renderInfo(block);
  info.measure();
  new this.drawer(block, info).draw();
};

Blockly.blockRendering.Renderer.prototype.makePathObject = function(root) {
  return new this.pathObject(root);
};
