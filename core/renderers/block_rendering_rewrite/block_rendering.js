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
 * @fileoverview Namespace for block rendering functionality.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

/**
 * The top level namespace for block rendering.
 * @namespace Blockly.blockRendering
 */
goog.provide('Blockly.blockRendering');

goog.require('Blockly.blockRendering.Debug');
goog.require('Blockly.blockRendering.Drawer');
goog.require('Blockly.blockRendering.RenderInfo');
goog.require('Blockly.blockRendering.ConstantProvider');
goog.require('Blockly.blockRendering.HighlightConstantProvider');

goog.require('Blockly.geras.RenderInfo');
goog.require('Blockly.thrasos.RenderInfo');
goog.require('Blockly.zelos.RenderInfo');

/**
 * Initialize anything needed for rendering (constants, etc).
 * @package
 */
Blockly.blockRendering.init = function() {
  Blockly.blockRendering.constants =
      new Blockly.blockRendering.ConstantProvider();
  Blockly.blockRendering.highlightConstants =
      new Blockly.blockRendering.HighlightConstantProvider();
};

/**
 * Render the given block, using the new rendering.
 * Developers should not call this directly.  Instead, call block.render().
 * @param {!Blockly.BlockSvg} block The block to render
 * @public
 */
Blockly.blockRendering.render = function(block) {
  if (!block.renderingDebugger) {
    block.renderingDebugger = new Blockly.blockRendering.Debug();
  }
  var info = new Blockly.geras.RenderInfo(block);
  new Blockly.blockRendering.Drawer(block, info).draw_();
};

Blockly.blockRendering.getConstants = function() {
  return Blockly.blockRendering.constants;
};

Blockly.blockRendering.getHighlightConstants = function() {
  return Blockly.blockRendering.highlightConstants;
};
