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

goog.module('Blockly.blockRendering');
goog.module.declareLegacyNamespace();

/* eslint-disable-next-line no-unused-vars */
const Renderer = goog.requireType('Blockly.blockRendering.Renderer');
/* eslint-disable-next-line no-unused-vars */
const Theme = goog.requireType('Blockly.Theme');
const registry = goog.require('Blockly.registry');


/**
 * Whether or not the debugger is turned on.
 * @type {boolean}
 */
let useDebugger = false;
/**
 * Returns whether the debugger is turned on.
 * @return {boolean} Whether the debugger is turned on.
 */
const isDebuggerEnabled = function() {
  return useDebugger;
};
/** @package */
exports.isDebuggerEnabled = isDebuggerEnabled;

/**
 * Registers a new renderer.
 * @param {string} name The name of the renderer.
 * @param {!Function} rendererClass The new renderer class
 *     to register.
 * @throws {Error} if a renderer with the same name has already been registered.
 */
const register = function(name, rendererClass) {
  registry.register(registry.Type.RENDERER, name, rendererClass);
};
exports.register = register;

/**
 * Unregisters the renderer registered with the given name.
 * @param {string} name The name of the renderer.
 */
const unregister = function(name) {
  registry.unregister(registry.Type.RENDERER, name);
};
exports.unregister = unregister;

/**
 * Turn on the blocks debugger.
 * @package
 */
const startDebugger = function() {
  useDebugger = true;
};
/** @package */
exports.startDebugger = startDebugger;

/**
 * Turn off the blocks debugger.
 * @package
 */
const stopDebugger = function() {
  useDebugger = false;
};
/** @package */
exports.stopDebugger = stopDebugger;

/**
 * Initialize anything needed for rendering (constants, etc).
 * @param {!string} name Name of the renderer to initialize.
 * @param {!Theme} theme The workspace theme object.
 * @param {Object=} opt_rendererOverrides Rendering constant overrides.
 * @return {!Renderer} The new instance of a renderer.
 *     Already initialized.
 * @package
 */
const init = function(name, theme, opt_rendererOverrides) {
  const rendererClass = registry.getClass(registry.Type.RENDERER, name);
  const renderer = new rendererClass(name);
  renderer.init(theme, opt_rendererOverrides);
  return renderer;
};
/** @package */
exports.init = init;
