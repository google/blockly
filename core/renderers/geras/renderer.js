/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Geras renderer.
 */
'use strict';

/**
 * Geras renderer.
 * @class
 */
goog.module('Blockly.geras.Renderer');

const blockRendering = goog.require('Blockly.blockRendering');
const object = goog.require('Blockly.utils.object');
/* eslint-disable-next-line no-unused-vars */
const {BlockSvg} = goog.requireType('Blockly.BlockSvg');
/* eslint-disable-next-line no-unused-vars */
const {ConstantProvider: BaseConstantProvider} = goog.requireType('Blockly.blockRendering.ConstantProvider');
const {ConstantProvider} = goog.require('Blockly.geras.ConstantProvider');
const {Drawer} = goog.require('Blockly.geras.Drawer');
const {HighlightConstantProvider} = goog.require('Blockly.geras.HighlightConstantProvider');
const {PathObject} = goog.require('Blockly.geras.PathObject');
/* eslint-disable-next-line no-unused-vars */
const {RenderInfo: BaseRenderInfo} = goog.requireType('Blockly.blockRendering.RenderInfo');
const {RenderInfo} = goog.require('Blockly.geras.RenderInfo');
const {Renderer: BaseRenderer} = goog.require('Blockly.blockRendering.Renderer');
/* eslint-disable-next-line no-unused-vars */
const {Theme} = goog.requireType('Blockly.Theme');


/**
 * The geras renderer.
 * @param {string} name The renderer name.
 * @package
 * @constructor
 * @extends {BaseRenderer}
 * @alias Blockly.geras.Renderer
 */
const Renderer = function(name) {
  Renderer.superClass_.constructor.call(this, name);

  /**
   * The renderer's highlight constant provider.
   * @type {HighlightConstantProvider}
   * @private
   */
  this.highlightConstants_ = null;
};
object.inherits(Renderer, BaseRenderer);

/**
 * Initialize the renderer.  Geras has a highlight provider in addition to
 * the normal constant provider.
 * @package
 * @override
 */
Renderer.prototype.init = function(theme, opt_rendererOverrides) {
  Renderer.superClass_.init.call(this, theme, opt_rendererOverrides);
  this.highlightConstants_ = this.makeHighlightConstants_();
  this.highlightConstants_.init();
};

/**
 * @override
 */
Renderer.prototype.refreshDom = function(svg, theme) {
  Renderer.superClass_.refreshDom.call(this, svg, theme);
  this.getHighlightConstants().init();
};

/**
 * @override
 */
Renderer.prototype.makeConstants_ = function() {
  return new ConstantProvider();
};

/**
 * Create a new instance of the renderer's render info object.
 * @param {!BlockSvg} block The block to measure.
 * @return {!RenderInfo} The render info object.
 * @protected
 * @override
 */
Renderer.prototype.makeRenderInfo_ = function(block) {
  return new RenderInfo(this, block);
};

/**
 * Create a new instance of the renderer's drawer.
 * @param {!BlockSvg} block The block to render.
 * @param {!BaseRenderInfo} info An object containing all
 *   information needed to render this block.
 * @return {!Drawer} The drawer.
 * @protected
 * @override
 */
Renderer.prototype.makeDrawer_ = function(block, info) {
  return new Drawer(
      block,
      /** @type {!RenderInfo} */ (info));
};

/**
 * Create a new instance of a renderer path object.
 * @param {!SVGElement} root The root SVG element.
 * @param {!Theme.BlockStyle} style The style object to use for
 *     colouring.
 * @return {!PathObject} The renderer path object.
 * @package
 * @override
 */
Renderer.prototype.makePathObject = function(root, style) {
  return new PathObject(
      root, style,
      /** @type {!ConstantProvider} */ (this.getConstants()));
};

/**
 * Create a new instance of the renderer's highlight constant provider.
 * @return {!HighlightConstantProvider} The highlight constant
 *     provider.
 * @protected
 */
Renderer.prototype.makeHighlightConstants_ = function() {
  return new HighlightConstantProvider(
      /** @type {!BaseConstantProvider} */
      (this.getConstants()));
};

/**
 * Get the renderer's highlight constant provider.  We assume that when this is
 * called, the renderer has already been initialized.
 * @return {!HighlightConstantProvider} The highlight constant
 *     provider.
 * @package
 */
Renderer.prototype.getHighlightConstants = function() {
  return (
      /** @type {!HighlightConstantProvider} */
      (this.highlightConstants_));
};

blockRendering.register('geras', Renderer);

exports.Renderer = Renderer;
