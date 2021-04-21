/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
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

goog.require('Blockly.registry');

goog.requireType('Blockly.blockRendering.Renderer');
goog.requireType('Blockly.Theme');


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
  Blockly.registry.register(Blockly.registry.Type.RENDERER, name,
      rendererClass);
};

/**
 * Unregisters the renderer registered with the given name.
 * @param {string} name The name of the renderer.
 */
Blockly.blockRendering.unregister = function(name) {
  Blockly.registry.unregister(Blockly.registry.Type.RENDERER, name);
};
/**
 * Turn on the blocks debugger.
 * @package
 */
Blockly.blockRendering.startDebugger = function() {
  Blockly.blockRendering.useDebugger = true;
};

/**
 * Turn off the blocks debugger.
 * @package
 */
Blockly.blockRendering.stopDebugger = function() {
  Blockly.blockRendering.useDebugger = false;
};

/**
 * Initialize anything needed for rendering (constants, etc).
 * @param {!string} name Name of the renderer to initialize.
 * @param {!Blockly.Theme} theme The workspace theme object.
 * @param {Object=} opt_rendererOverrides Rendering constant overrides.
 * @return {!Blockly.blockRendering.Renderer} The new instance of a renderer.
 *     Already initialized.
 * @package
 */

Blockly.blockRendering.init = function(name, theme, opt_rendererOverrides) {
  var rendererClass = Blockly.registry.getClass(
      Blockly.registry.Type.RENDERER, name);
  var renderer = new rendererClass(name);
  renderer.init(theme, opt_rendererOverrides);
  return renderer;
};
