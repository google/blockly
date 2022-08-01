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
 * @extends {BaseRenderer}
 * @alias Blockly.geras.Renderer
 */
class Renderer extends BaseRenderer {
  /**
   * @param {string} name The renderer name.
   * @package
   */
  constructor(name) {
    super(name);

    /**
     * The renderer's highlight constant provider.
     * @type {HighlightConstantProvider}
     * @private
     */
    this.highlightConstants_ = null;
  }

  /**
   * Initialize the renderer.  Geras has a highlight provider in addition to
   * the normal constant provider.
   * @package
   * @override
   */
  init(theme, opt_rendererOverrides) {
    super.init(theme, opt_rendererOverrides);
    this.highlightConstants_ = this.makeHighlightConstants_();
    this.highlightConstants_.init();
  }

  /**
   * @override
   */
  refreshDom(svg, theme) {
    super.refreshDom(svg, theme);
    this.getHighlightConstants().init();
  }

  /**
   * @override
   */
  makeConstants_() {
    return new ConstantProvider();
  }

  /**
   * Create a new instance of the renderer's render info object.
   * @param {!BlockSvg} block The block to measure.
   * @return {!RenderInfo} The render info object.
   * @protected
   * @override
   */
  makeRenderInfo_(block) {
    return new RenderInfo(this, block);
  }

  /**
   * Create a new instance of the renderer's drawer.
   * @param {!BlockSvg} block The block to render.
   * @param {!BaseRenderInfo} info An object containing all information needed
   *     to render this block.
   * @return {!Drawer} The drawer.
   * @protected
   * @override
   */
  makeDrawer_(block, info) {
    return new Drawer(
        block,
        /** @type {!RenderInfo} */ (info));
  }

  /**
   * Create a new instance of a renderer path object.
   * @param {!SVGElement} root The root SVG element.
   * @param {!Theme.BlockStyle} style The style object to use for colouring.
   * @return {!PathObject} The renderer path object.
   * @package
   * @override
   */
  makePathObject(root, style) {
    return new PathObject(
        root, style,
        /** @type {!ConstantProvider} */ (this.getConstants()));
  }

  /**
   * Create a new instance of the renderer's highlight constant provider.
   * @return {!HighlightConstantProvider} The highlight constant provider.
   * @protected
   */
  makeHighlightConstants_() {
    return new HighlightConstantProvider(
        /** @type {!BaseConstantProvider} */
        (this.getConstants()));
  }

  /**
   * Get the renderer's highlight constant provider.  We assume that when this
   * is called, the renderer has already been initialized.
   * @return {!HighlightConstantProvider} The highlight constant provider.
   * @package
   */
  getHighlightConstants() {
    return (
        /** @type {!HighlightConstantProvider} */
        (this.highlightConstants_));
  }
}

blockRendering.register('geras', Renderer);

exports.Renderer = Renderer;
