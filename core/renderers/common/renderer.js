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
goog.require('Blockly.blockRendering.MarkerSvg');
goog.require('Blockly.blockRendering.Drawer');
goog.require('Blockly.blockRendering.IPathObject');
goog.require('Blockly.blockRendering.PathObject');
goog.require('Blockly.blockRendering.RenderInfo');

goog.requireType('Blockly.blockRendering.Debug');


/**
 * The base class for a block renderer.
 * @param {string} name The renderer name.
 * @package
 * @constructor
 */
Blockly.blockRendering.Renderer = function(name) {

  /**
   * The renderer name.
   * @type {string}
   * @package
   */
  this.name = name;

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
 * @suppress {strictModuleDepCheck} Debug renderer only included in playground.
 * @protected
 */
Blockly.blockRendering.Renderer.prototype.makeDebugger_ = function() {
  if (!Blockly.blockRendering.Debug) {
    throw Error('Missing require for Blockly.blockRendering.Debug');
  }
  return new Blockly.blockRendering.Debug();
};

/**
 * Create a new instance of the renderer's marker drawer.
 * @param {!Blockly.WorkspaceSvg} workspace The workspace the marker belongs to.
 * @param {!Blockly.Marker} marker The marker.
 * @return {!Blockly.blockRendering.MarkerSvg} The object in charge of drawing
 *     the marker.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.makeMarkerDrawer = function(
    workspace, marker) {
  return new Blockly.blockRendering.MarkerSvg(workspace, this.getConstants(), marker);
};

/**
 * Create a new instance of a renderer path object.
 * @param {!SVGElement} root The root SVG element.
 * @param {!Blockly.Theme.BlockStyle} style The style object to use for
 *     colouring.
 * @return {!Blockly.blockRendering.IPathObject} The renderer path object.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.makePathObject = function(root,
    style) {
  return new Blockly.blockRendering.PathObject(root, style,
      /** @type {!Blockly.blockRendering.ConstantProvider} */ (this.constants_));

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
 * Determine whether or not to highlight a connection.
 * @param {Blockly.Connection} _conn The connection to determine whether or not
 *     to highlight.
 * @return {boolean} True if we should highlight the connection.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.shouldHighlightConnection =
    function(_conn) {
    /* eslint-disable indent */
  return true;
}; /* eslint-enable indent */

/**
 * Determine whether or not to insert a dragged block into a stack.
 * @param {!Blockly.Block} block The target block.
 * @param {!Blockly.Connection} conn The closest connection.
 * @return {boolean} True if we should insert the dragged block into the stack.
 * @package
 */
Blockly.blockRendering.Renderer.prototype.shouldInsertDraggedBlock =
    function(block, conn) {
    /* eslint-disable indent */
  return !conn.isConnected() ||
    !!Blockly.Connection.lastConnectionInRow(block,
        conn.targetConnection.getSourceBlock());
}; /* eslint-enable indent */

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
