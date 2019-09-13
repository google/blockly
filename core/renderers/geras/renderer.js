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
 * @fileoverview Geras renderer.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.geras.Renderer');

goog.require('Blockly.blockRendering');
goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.blockRendering.Debug');
goog.require('Blockly.blockRendering.Renderer');
goog.require('Blockly.geras.Drawer');
goog.require('Blockly.geras.HighlightConstantProvider');
goog.require('Blockly.geras.RenderInfo');
goog.require('Blockly.utils.object');


/**
 * The geras renderer.
 * @package
 * @constructor
 * @extends {Blockly.blockRendering.Renderer}
 */
Blockly.geras.Renderer = function() {
  this.constantProvider = Blockly.blockRendering.ConstantProvider;
  this.renderInfo = Blockly.geras.RenderInfo;
  this.drawer = Blockly.geras.Drawer;
  this.debugger = Blockly.blockRendering.Debug;

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
 */
Blockly.geras.Renderer.prototype.init = function() {
  Blockly.geras.Renderer.superClass_.init.call(this);
  this.highlightConstants_ = new Blockly.geras.HighlightConstantProvider();
};

/**
 * Get the renderer's highlight constant provider.
 * @return {Blockly.geras.HighlightConstantProvider} The highlight constant
 *     provider.
 * @package
 */
Blockly.geras.Renderer.prototype.getHighlightConstants = function() {
  return this.highlightConstants_;
};

Blockly.blockRendering.register('geras', Blockly.geras.Renderer);
