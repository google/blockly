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
 * Unregisters the renderer registered with the given name.
 * @param {string} name The name of the renderer.
 */
Blockly.blockRendering.unregister = function(name) {
  if (Blockly.blockRendering.rendererMap_[name]) {
    delete Blockly.blockRendering.rendererMap_[name];
  } else {
    console.warn('No renderer mapping for name "' + name +
        '" found to unregister');
  }
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
 * @return {!Blockly.blockRendering.Renderer} The new instance of a renderer.
 *     Already initialized.
 * @package
 */
Blockly.blockRendering.init = function(name) {
  if (!Blockly.blockRendering.rendererMap_[name]) {
    throw Error('Renderer not registered: ', name);
  }
  /**
   * Wrap the renderer constructor into a temporary constructor
   * function so the closure compiler treats it as a constructor.
   * @param {string} name The renderer name.
   * @constructor
   * @extends {Blockly.blockRendering.Renderer}
   */
  var rendererCtor = function(name) {
    rendererCtor.superClass_.constructor.call(this, name);
  };
  Blockly.utils.object.inherits(rendererCtor,
      Blockly.blockRendering.rendererMap_[name]);
  var renderer = new rendererCtor(name);
  renderer.init();
  return renderer;
};
