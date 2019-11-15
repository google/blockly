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
goog.require('Blockly.zelos.PathObject');
goog.require('Blockly.zelos.RenderInfo');
goog.require('Blockly.zelos.CursorSvg');


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

/**
 * Create a new instance of the renderer's cursor drawer.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace the cursor belongs to.
 * @param {boolean=} opt_marker True if the cursor is a marker. A marker is used
 *     to save a location and is an immovable cursor. False or undefined if the
 *     cursor is not a marker.
 * @return {!Blockly.blockRendering.CursorSvg} The cursor drawer.
 * @package
 * @override
 */
Blockly.zelos.Renderer.prototype.makeCursorDrawer = function(
    workspace, opt_marker) {
  return new Blockly.zelos.CursorSvg(workspace, this.getConstants(), opt_marker);
};

/**
 * Create a new instance of a renderer path object.
 * @param {!SVGElement} root The root SVG element.
 * @return {!Blockly.zelos.PathObject} The renderer path object.
 * @package
 * @override
 */
Blockly.zelos.Renderer.prototype.makePathObject = function(root) {
  return new Blockly.zelos.PathObject(root,
      /** @type {!Blockly.zelos.ConstantProvider} */ (this.getConstants()));
};

/**
 * @override
 */
Blockly.zelos.Renderer.prototype.shouldHighlightConnection = function(conn) {
  return conn.type != Blockly.INPUT_VALUE && conn.type !== Blockly.OUTPUT_VALUE;
};

/**
 * @override
 */
Blockly.zelos.Renderer.prototype.shouldInsertDraggedBlock = function(_block,
    _conn) {
  return false;
};

Blockly.blockRendering.register('zelos', Blockly.zelos.Renderer);
