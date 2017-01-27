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
 * Builds an extension function that will map a dropdown value to a tooltip string.
 * Tooltip strings will be passed through Blockly.utils.checkMessageReferences(..)
 * immediately and Blockly.utils.replaceMessageReferences(..) at display time.
 * @param {string} dropdownName The name of the field whose value is the key
 *     to the lookup table.
 * @param {!Object<string, string>} lookupTable The table of field values to
 *     tooltip text.
 * @return {Function} The extension function.
 */
Blockly.Extensions.buildTooltipForDropdown = function(dropdownName, lookupTable) {
  // List of block types already validated, to minimize duplicate warnings.
  var blockTypesChecked = [];

  // Check the tooltip string messages for invalid references.
  // Wait for load, in case Blockly.Msg is not yet populated.
  // runAfterPageLoad() does not run in a Node.js environment due to lack of
  // document object, in which case skip the validation.
  if (document) { // Relies on document.readyState
    Blockly.utils.runAfterPageLoad(function() {
      for (var key in lookupTable) {
        Blockly.utils.checkMessageReferences(lookupTable[key]);
      }
    });
  }

  /**
   * The actual extension.
   * @this {Blockly.Block}
   */
  var extensionFn = function() {
    var thisBlock = this;

    if (this.type && blockTypesChecked.indexOf(this.type) === -1) {
      Blockly.Extensions.checkDropdownOptionsInTable_(
        this, dropdownName, lookupTable);
      blockTypesChecked.push(this.type);
    }

    this.setTooltip(function() {
      var value = thisBlock.getFieldValue(dropdownName);
      var tooltip = lookupTable[value];
      if (tooltip == null) {
        if (blockTypesChecked.indexOf(thisBlock.type) === -1) {
          // Warn for missing values on generated tooltips
          var warning = 'No tooltip mapping for value ' + value +
              ' of field ' + dropdownName;
          if (thisBlock.type != null) {
            warning += (' of block type ' + thisBlock.type);
          }
          console.warn(warning + '.');
        }
      } else {
        tooltip = Blockly.utils.replaceMessageReferences(tooltip);
      }
      return tooltip;
    });
  };
  return extensionFn;
};

/**
 * Checks all options keys are present in the provided string lookup table.
 * Emits console warnings when they are not.
 * @param {!Blockly.Block} block The block containing the dropdown
 * @param {string} dropdownName The name of the dropdown
 * @param {!Object<string, string>} lookupTable The string lookup table
 */
Blockly.Extensions.checkDropdownOptionsInTable_ =
  function(block, dropdownName, lookupTable) {
    // Validate all dropdown options have values.
    var dropdown = block.getField(dropdownName);
    if (!dropdown.isOptionListDynamic()) {
      var options = dropdown.getOptions();
      for (var i = 0; i < options.length; ++i) {
        var optionKey = options[i][1]; // label, then value
        if (lookupTable[optionKey] == null) {
          console.warn('No tooltip mapping for value ' + optionKey +
            ' of field ' + dropdownName + ' of block type ' + block.type);
        }
      }
    }
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
