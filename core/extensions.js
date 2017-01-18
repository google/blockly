/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2017 Google Inc.
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
 * @fileoverview Extensions are functions that help initialize blocks, usually
 *      adding dynamic behavior such as onchange handlers and mutators. These
 *      are applied using Block.applyExtension(), or the JSON "extensions"
 *      array attribute.
 * @author Anm@anm.me (Andrew n marshall)
 */
'use strict';

goog.provide('Blockly.Extensions');


/**
 * The set of all registered extensions, keyed by extension name/id.
 * @private
 */
Blockly.Extensions.ALL_ = {};

/**
 * Registers a new extension function. Extensions are functions that help
 * initialize blocks, usually adding dynamic behavior such as onchange
 * handlers and mutators. These are applied using Block.applyExtension(), or
 * the JSON "extensions" array attribute.
 * @param {string} name The name of this extension.
 * @param {function} initFn The function to initialize an extended block.
 * @throws {Error} if the extension name is empty, the extension is already
 *     registered, or extensionFn is not a function.
 */
Blockly.Extensions.register = function(name, initFn) {
  if (!goog.isString(name) || goog.string.isEmptyOrWhitespace(name)) {
    throw new Error('Error: Invalid extension name "' + name + '"');
  }
  if (Blockly.Extensions.ALL_[name]) {
    throw new Error('Error: Extension "' + name + '" is already registered.');
  }
  if (!goog.isFunction(initFn)) {
    throw new Error('Error: Extension "' + name + '" must be a function');
  }
Blockly.Extensions.ALL_[name] = initFn;
};

/**
 * Applies an extension init method to a block.
 * @param {string} name The name of the extension.
 * @param {Blocky.Block} block The block to initialize with the named extension.
 */
Blockly.Extensions.apply = function(name, block) {
  var extensionFn = Blockly.Extensions.ALL_[name];
  if (!goog.isFunction(extensionFn)) {
    throw new Error('Error: Extension "' + name + '" not found.');
  }
  extensionFn.apply(block);
}
