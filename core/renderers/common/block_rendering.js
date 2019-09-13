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

goog.require('Blockly.utils.object');


/**
 * The current renderer.
 * @type {Blockly.blockRendering.Renderer}
 * @private
 */
Blockly.blockRendering.renderer_ = null;

/**
 * The set of all registered renderers, keyed by their name.
 * @type {!Object<string, !Function>}
 * @private
 */
Blockly.blockRendering.rendererMap_ = {};

/**
 * Whether or not the debugger is turned on.
 * @type {boolean}
 * @package
 */
Blockly.blockRendering.useDebugger = false;

/**
 * Registers a new renderer.
 * @param {string} name The name of the renderer.
 * @param {!Function} rendererClass The new renderer class
 *     to register.
 * @throws {Error} if a renderer with the same name has already been registered.
 */
Blockly.blockRendering.register = function(name, rendererClass) {
  if (Blockly.blockRendering.rendererMap_[name]) {
    throw Error('Renderer has already been registered.');
  }
  Blockly.blockRendering.rendererMap_[name] = rendererClass;
};

/**
 * Turn on the blocks debugger.
 * @package
 */
Blockly.blockRendering.startDebugger = function() {
  Blockly.blockRendering.useDebugger_ = true;
};

/**
 * Turn off the blocks debugger.
 * @package
 */
Blockly.blockRendering.stopDebugger = function() {
  Blockly.blockRendering.useDebugger_ = false;
};

/**
 * Initialize anything needed for rendering (constants, etc).
 * @param {!string} name Name of the renderer to initialize.
 * @package
 */
Blockly.blockRendering.init = function(name) {
  if (!Blockly.blockRendering.rendererMap_[name]) {
    throw Error('Renderer not registered: ', name);
  }
  /** @constructor @extends {Blockly.blockRendering.Renderer} */
  var rendererCtor = function() {
    rendererCtor.superClass_.constructor.call(this);
  }
  Blockly.utils.object.inherits(rendererCtor,
      Blockly.blockRendering.rendererMap_[name]);
  Blockly.blockRendering.renderer = new rendererCtor();
  Blockly.blockRendering.renderer.init();
};

/**
 * Render the given block, using the new rendering.
 * Developers should not call this directly.  Instead, call block.render().
 * @param {!Blockly.BlockSvg} block The block to render
 * @public
 */
Blockly.blockRendering.render = function(block) {
  Blockly.blockRendering.renderer.render(block);
};

/**
 * Get the current renderer.
 * @return {Blockly.blockRendering.Renderer} The current renderer.
 */
Blockly.blockRendering.getRenderer = function() {
  return Blockly.blockRendering.renderer;
};

/**
 * Get the current renderer's constant provider.
 * @return {Blockly.blockRendering.ConstantProvider} The current renderer.
 */
Blockly.blockRendering.getConstants = function() {
  return Blockly.blockRendering.renderer.constants;
};
