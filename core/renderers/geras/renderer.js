/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Geras renderer.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.geras.Renderer');

goog.require('Blockly.blockRendering');
goog.require('Blockly.blockRendering.Renderer');
goog.require('Blockly.geras.ConstantProvider');
goog.require('Blockly.geras.Drawer');
goog.require('Blockly.geras.HighlightConstantProvider');
goog.require('Blockly.geras.PathObject');
goog.require('Blockly.geras.RenderInfo');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.blockRendering.ConstantProvider');
goog.requireType('Blockly.blockRendering.RenderInfo');
goog.requireType('Blockly.BlockSvg');
goog.requireType('Blockly.Theme');


/**
 * The geras renderer.
 * @param {string} name The renderer name.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Renderer}
 */
Blockly.geras.Renderer = function(name) {
  Blockly.geras.Renderer.superClass_.constructor.call(this, name);

  /**
   * The renderer's highlight constant provider.
   * @type {Blockly.geras.HighlightConstantProvider}
   * @private
   */
  this.highlightConstants_ = null;
};
Blockly.utils.object.inherits(Blockly.geras.Renderer,
    Blockly.blockRendering.Renderer);

/**
 * Initialize the renderer.  Geras has a highlight provider in addition to
 * the normal constant provider.
 * @package
 * @override
 */
Blockly.geras.Renderer.prototype.init = function(theme,
    opt_rendererOverrides) {
  Blockly.geras.Renderer.superClass_.init.call(this, theme,
      opt_rendererOverrides);
  this.highlightConstants_ = this.makeHighlightConstants_();
  this.highlightConstants_.init();
};

/**
 * @override
 */
Blockly.geras.Renderer.prototype.refreshDom = function(svg, theme) {
  Blockly.geras.Renderer.superClass_.refreshDom.call(this, svg, theme);
  this.getHighlightConstants().init();
};

/**
 * @override
 */
Blockly.geras.Renderer.prototype.makeConstants_ = function() {
  return new Blockly.geras.ConstantProvider();
};

/**
 * Create a new instance of the renderer's render info object.
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @return {!Blockly.geras.RenderInfo} The render info object.
 * @protected
 * @override
 */
Blockly.geras.Renderer.prototype.makeRenderInfo_ = function(block) {
  return new Blockly.geras.RenderInfo(this, block);
};

/**
 * Create a new instance of the renderer's drawer.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.blockRendering.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @return {!Blockly.geras.Drawer} The drawer.
 * @protected
 * @override
 */
Blockly.geras.Renderer.prototype.makeDrawer_ = function(block, info) {
  return new Blockly.geras.Drawer(block,
      /** @type {!Blockly.geras.RenderInfo} */ (info));
};

/**
 * Create a new instance of a renderer path object.
 * @param {!SVGElement} root The root SVG element.
 * @param {!Blockly.Theme.BlockStyle} style The style object to use for
 *     colouring.
 * @return {!Blockly.geras.PathObject} The renderer path object.
 * @package
 * @override
 */
Blockly.geras.Renderer.prototype.makePathObject = function(root, style) {
  return new Blockly.geras.PathObject(root, style,
      /** @type {!Blockly.geras.ConstantProvider} */ (this.getConstants()));
};

/**
 * Create a new instance of the renderer's highlight constant provider.
 * @return {!Blockly.geras.HighlightConstantProvider} The highlight constant
 *     provider.
 * @protected
 */
Blockly.geras.Renderer.prototype.makeHighlightConstants_ = function() {
  return new Blockly.geras.HighlightConstantProvider(
      /** @type {!Blockly.blockRendering.ConstantProvider} */
      (this.getConstants()));
};

/**
 * Get the renderer's highlight constant provider.  We assume that when this is
 * called, the renderer has already been initialized.
 * @return {!Blockly.geras.HighlightConstantProvider} The highlight constant
 *     provider.
 * @package
 */
Blockly.geras.Renderer.prototype.getHighlightConstants = function() {
  return (
    /** @type {!Blockly.geras.HighlightConstantProvider} */
    (this.highlightConstants_));
};

Blockly.blockRendering.register('geras', Blockly.geras.Renderer);
