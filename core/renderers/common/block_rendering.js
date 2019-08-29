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
goog.require('Blockly.geras.HighlightConstantProvider');

goog.require('Blockly.geras.Drawer');
goog.require('Blockly.geras.RenderInfo');
goog.require('Blockly.thrasos.RenderInfo');
goog.require('Blockly.zelos.Drawer');
goog.require('Blockly.zelos.RenderInfo');
goog.require('Blockly.zelos.ConstantProvider');

// TODO (#2702): Pick an API for choosing a renderer.
Blockly.blockRendering.rendererName = 'geras';

Blockly.blockRendering.useDebugger = false;

/**
 * Initialize anything needed for rendering (constants, etc).
 * @package
 */
Blockly.blockRendering.init = function() {
  if (Blockly.blockRendering.rendererName == 'geras') {
    Blockly.blockRendering.constants =
      new Blockly.blockRendering.ConstantProvider();
    Blockly.blockRendering.constants.init();
    // No one else has a highlight provider.
    Blockly.blockRendering.highlightConstants =
        new Blockly.geras.HighlightConstantProvider();
  } else if (Blockly.blockRendering.rendererName == 'thrasos') {
    Blockly.blockRendering.constants =
      new Blockly.blockRendering.ConstantProvider();
    Blockly.blockRendering.constants.init();
  } else if (Blockly.blockRendering.rendererName == 'zelos') {
    Blockly.blockRendering.constants =
      new Blockly.zelos.ConstantProvider();
    Blockly.blockRendering.constants.init();
  }
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
  if (Blockly.blockRendering.rendererName == 'geras') {
    var info = new Blockly.geras.RenderInfo(block);
    new Blockly.geras.Drawer(block, info).draw();
  } else if (Blockly.blockRendering.rendererName == 'thrasos') {
    var info = new Blockly.thrasos.RenderInfo(block);
    new Blockly.blockRendering.Drawer(block, info).draw();
  } else if (Blockly.blockRendering.rendererName == 'zelos') {
    var info = new Blockly.zelos.RenderInfo(block);
    new Blockly.zelos.Drawer(block, info).draw();
  }
};

Blockly.blockRendering.getConstants = function() {
  return Blockly.blockRendering.constants;
};

Blockly.blockRendering.getHighlightConstants = function() {
  return Blockly.blockRendering.highlightConstants;
};
