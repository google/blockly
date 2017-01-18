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
 * Applies an extension method to a block. This should only be called during
 * block construction.
 * @param {string} name The name of the extension.
 * @param {!Blockly.Block} block The block to apply the named extension to.
 * @throws {Error} if the extension is not found.
 */
Blockly.Extensions.apply = function(name, block) {
  var extensionFn = Blockly.Extensions.ALL_[name];
  if (!goog.isFunction(extensionFn)) {
    throw new Error('Error: Extension "' + name + '" not found.');
  }
  extensionFn.apply(block);
};

/**
 * Configures the tooltip to mimic the parent block when connected. Otherwise,
 * uses the tooltip text at the time this extension is initialized. This takes
 * advantage of the fact that all other values from JSON are initialized before
 * extensions.
 * @this {Blockly.Block}
 * @private
 */
Blockly.Extensions.extensionParentTooltip_ = function() {
  this.tooltipWhenNotConnected_ = this.tooltip;
  this.setTooltip(function() {
    var parent = this.getParent();
    return (parent &&
      parent.getInputsInline() &&
      parent.tooltip) ||
      this.tooltipWhenNotConnected_;
  }.bind(this));
};
Blockly.Extensions.register('parent_tooltip_when_inline',
    Blockly.Extensions.extensionParentTooltip_);
