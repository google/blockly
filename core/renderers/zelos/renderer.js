/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Zelos renderer.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.zelos.Renderer');

goog.require('Blockly.blockRendering');
goog.require('Blockly.blockRendering.Renderer');
goog.require('Blockly.InsertionMarkerManager');
goog.require('Blockly.utils.object');
goog.require('Blockly.zelos.ConstantProvider');
goog.require('Blockly.zelos.Drawer');
goog.require('Blockly.zelos.PathObject');
goog.require('Blockly.zelos.RenderInfo');
goog.require('Blockly.zelos.MarkerSvg');


/**
 * The zelos renderer.
 * @param {string} name The renderer name.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Renderer}
 */
Blockly.zelos.Renderer = function(name) {
  Blockly.zelos.Renderer.superClass_.constructor.call(this, name);
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
 * @param {!Blockly.Marker} marker The marker.
 * @return {!Blockly.blockRendering.MarkerSvg} The object in charge of drawing
 *     the marker.
 * @package
 * @override
 */
Blockly.zelos.Renderer.prototype.makeMarkerDrawer = function(
    workspace, marker) {
  return new Blockly.zelos.MarkerSvg(workspace, this.getConstants(), marker);
};

/**
 * Create a new instance of a renderer path object.
 * @param {!SVGElement} root The root SVG element.
 * @param {!Blockly.Theme.BlockStyle} style The style object to use for
 *     colouring.
 * @return {!Blockly.zelos.PathObject} The renderer path object.
 * @package
 * @override
 */
Blockly.zelos.Renderer.prototype.makePathObject = function(root, style) {
  return new Blockly.zelos.PathObject(root, style,
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
Blockly.zelos.Renderer.prototype.getConnectionPreviewMethod =
    function(closest, local, topBlock) {
      if (local.type == Blockly.OUTPUT_VALUE) {
        if (!closest.isConnected()) {
          return Blockly.InsertionMarkerManager.PREVIEW_TYPE.INPUT_OUTLINE;
        }
        // TODO: Returning this is a total hack, because we don't want to show
        //   a replacement fade, we want to show an outline affect.
        //   Sadly zelos does not support showing an outline around filled
        //   inputs, so we have to pretend like the connected block is getting
        //   replaced.
        return Blockly.InsertionMarkerManager.PREVIEW_TYPE.REPLACEMENT_FADE;
      }

      return Blockly.zelos.Renderer.superClass_
          .getConnectionPreviewMethod(closest, local, topBlock);
    };

Blockly.blockRendering.register('zelos', Blockly.zelos.Renderer);
