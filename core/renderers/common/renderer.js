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
 * @fileoverview Base renderer.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.blockRendering.Renderer');

goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.blockRendering.Drawer');
goog.require('Blockly.blockRendering.IPathObject');
goog.require('Blockly.blockRendering.PathObject');
goog.require('Blockly.blockRendering.RenderInfo');
goog.require('Blockly.CursorSvg');


/**
 * The base class for a block renderer.
 * @package
 * @constructor
 */
Blockly.blockRendering.Renderer = function() {

  /**
   * The renderer's constant provider.
   * @type {Blockly.blockRendering.ConstantProvider}
   * @private
   */
  this.constants_ = null;
};

/**
 * Initialize the renderer.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.init = function() {
  this.constants_ = this.makeConstants_();
  this.constants_.init();
};

/**
 * Create a new instance of the renderer's constant provider.
 * @return {!Blockly.blockRendering.ConstantProvider} The constant provider.
 * @protected
 */
Blockly.blockRendering.Renderer.prototype.makeConstants_ = function() {
  return new Blockly.blockRendering.ConstantProvider();
};

/**
 * Create a new instance of the renderer's render info object.
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @return {!Blockly.blockRendering.RenderInfo} The render info object.
 * @protected
 */
Blockly.blockRendering.Renderer.prototype.makeRenderInfo_ = function(block) {
  return new Blockly.blockRendering.RenderInfo(this, block);
};

/**
 * Create a new instance of the renderer's drawer.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.blockRendering.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @return {!Blockly.blockRendering.Drawer} The drawer.
 * @protected
 */
Blockly.blockRendering.Renderer.prototype.makeDrawer_ = function(block, info) {
  return new Blockly.blockRendering.Drawer(block, info);
};

/**
 * Create a new instance of the renderer's debugger.
 * @return {!Blockly.blockRendering.Debug} The renderer debugger.
 * @protected
 */
Blockly.blockRendering.Renderer.prototype.makeDebugger_ = function() {
  if (!Blockly.blockRendering.Debug) {
    throw Error('Missing require for Blockly.blockRendering.Debug');
  }
  return new Blockly.blockRendering.Debug();
};

/**
 * Create a new instance of the renderer's cursor drawer.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace the cursor belongs to.
 * @param {boolean=} opt_marker True if the cursor is a marker. A marker is used
 *     to save a location and is an immovable cursor. False or undefined if the
 *     cursor is not a marker.
 * @return {!Blockly.CursorSvg} The cursor drawer.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.makeCursorDrawer = function(
    workspace, opt_marker) {
  return new Blockly.CursorSvg(workspace, opt_marker);
};

/**
 * Create a new instance of a renderer path object.
 * @param {!SVGElement} root The root SVG element.
 * @return {!Blockly.blockRendering.IPathObject} The renderer path object.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.makePathObject = function(root) {
  return new Blockly.blockRendering.PathObject(root);
};

/**
 * Get the current renderer's constant provider.  We assume that when this is
 * called, the renderer has already been initialized.
 * @return {!Blockly.blockRendering.ConstantProvider} The constant provider.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.getConstants = function() {
  return (
    /** @type {!Blockly.blockRendering.ConstantProvider} */
    (this.constants_));
};

/**
 * Render the block.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.render = function(block) {
  if (Blockly.blockRendering.useDebugger && !block.renderingDebugger) {
    block.renderingDebugger = this.makeDebugger_();
  }
  var info = this.makeRenderInfo_(block);
  info.measure();
  this.makeDrawer_(block, info).draw();
};
