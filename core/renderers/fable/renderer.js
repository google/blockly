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
 * @fileoverview fable renderer.
 * @author ivan@shaperobotics.com (Ivan Mladenov)
 */
'use strict';

goog.provide('Blockly.fable.Renderer');

goog.require('Blockly.blockRendering');
goog.require('Blockly.blockRendering.Renderer');
goog.require('Blockly.fable.ConstantProvider');
goog.require('Blockly.fable.Drawer');
goog.require('Blockly.fable.HighlightConstantProvider');
goog.require('Blockly.fable.PathObject');
goog.require('Blockly.fable.RenderInfo');
goog.require('Blockly.utils.object');

/**
 * The fable renderer.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Renderer}
 */
Blockly.fable.Renderer = function () {
  Blockly.fable.Renderer.superClass_.constructor.call(this);

  /**
   * The renderer's highlight constant provider.
   * @type {Blockly.fable.HighlightConstantProvider}
   * @private
   */
  this.highlightConstants_ = null;
};
Blockly.utils.object.inherits(Blockly.fable.Renderer,
  Blockly.blockRendering.Renderer);

/**
 * Initialize the renderer.  fable has a highlight provider in addition to
 * the normal constant provider.
 * @package
 * @override
 */
Blockly.fable.Renderer.prototype.init = function () {
  Blockly.fable.Renderer.superClass_.init.call(this);
  this.highlightConstants_ = this.makeHighlightConstants_();
};

/**
 * @override
 */
Blockly.fable.Renderer.prototype.makeConstants_ = function () {
  return new Blockly.fable.ConstantProvider();
};

/**
 * Create a new instance of the renderer's render info object.
 * @param {!Blockly.BlockSvg} block The block to measure.
 * @return {!Blockly.fable.RenderInfo} The render info object.
 * @protected
 * @override
 */
Blockly.fable.Renderer.prototype.makeRenderInfo_ = function (block) {
  return new Blockly.fable.RenderInfo(this, block);
};

/**
 * Create a new instance of the renderer's drawer.
 * @param {!Blockly.BlockSvg} block The block to render.
 * @param {!Blockly.blockRendering.RenderInfo} info An object containing all
 *   information needed to render this block.
 * @return {!Blockly.fable.Drawer} The drawer.
 * @protected
 * @override
 */
Blockly.fable.Renderer.prototype.makeDrawer_ = function (block, info) {
  return new Blockly.fable.Drawer(block,
    /** @type {!Blockly.fable.RenderInfo} */ (info));
};

/**
 * Create a new instance of a renderer path object.
 * @param {!SVGElement} root The root SVG element.
 * @return {!Blockly.fable.PathObject} The renderer path object.
 * @package
 * @override
 */
Blockly.fable.Renderer.prototype.makePathObject = function (root) {
  return new Blockly.fable.PathObject(root);
};

/**
 * Create a new instance of the renderer's highlight constant provider.
 * @return {!Blockly.fable.HighlightConstantProvider} The highlight constant
 *     provider.
 * @protected
 */
Blockly.blockRendering.Renderer.prototype.makeHighlightConstants_ = function () {
  return new Blockly.fable.HighlightConstantProvider(
    /** @type {!Blockly.blockRendering.ConstantProvider} */
    (this.getConstants()));
};

/**
 * Get the renderer's highlight constant provider.  We assume that when this is
 * called, the renderer has already been initialized.
 * @return {!Blockly.fable.HighlightConstantProvider} The highlight constant
 *     provider.
 * @package
 */
Blockly.fable.Renderer.prototype.getHighlightConstants = function () {
  return (
    /** @type {!Blockly.fable.HighlightConstantProvider} */
    (this.highlightConstants_));
};

Blockly.blockRendering.register('fable', Blockly.fable.Renderer);
