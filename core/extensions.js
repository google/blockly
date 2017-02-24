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

/**
 * @name Blockly.Extensions
 * @namespace
 **/
goog.provide('Blockly.Extensions');


/**
 * The set of all registered extensions, keyed by extension name/id.
 * @private
 */
Blockly.Extensions.ALL_ = {};

/**
 * The set of properties on a block that may only be set by a mutator.
 * @type {!Array.<string>}
 * @private
 * @constant
 */
Blockly.Extensions.MUTATOR_PROPERTIES_ =
    ['domToMutation', 'mutationToDom', 'compose', 'decompose'];

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
 * Registers a new extension function that adds all key/value of mixinObj.
 * @param {string} name The name of this extension.
 * @param {!Object} mixinObj The values to mix in.
 * @throws {Error} if the extension name is empty or the extension is already
 *     registered.
 */
Blockly.Extensions.registerMixin = function(name, mixinObj) {
  Blockly.Extensions.register(name, function() {
    this.mixin(mixinObj);
  });
};

/**
 * Registers a new extension function that adds a mutator to the block.
 * At register time this performs some basic sanity checks on the mutator.
 * The wrapper may also add a mutator dialog to the block, if both compose and
 * decompose are defined on the mixin.
 * @param {string} name The name of this mutator extension.
 * @param {!Object} mixinObj The values to mix in.
 * @param {function()=} opt_helperFn An optional function to apply after mixing
 *     in the object.
 * @param {Array.<string>=} opt_blockList A list of blocks to appear in the
 *     flyout of the mutator dialog.
 * @throws {Error} if the mutation is invalid or can't be applied to the block.
 */
Blockly.Extensions.registerMutator = function(name, mixinObj, opt_helperFn,
    opt_blockList) {
  var errorPrefix = 'Error when registering mutator "' + name + '": ';

  // Sanity check the mixin object before registering it.
  Blockly.Extensions.checkHasFunction_(errorPrefix, mixinObj, 'domToMutation');
  Blockly.Extensions.checkHasFunction_(errorPrefix, mixinObj, 'mutationToDom');

  var hasMutatorDialog = Blockly.Extensions.checkMutatorDialog_(mixinObj,
    errorPrefix);

  if (opt_helperFn && !goog.isFunction(opt_helperFn)) {
    throw new Error('Extension "' + name + '" is not a function');
  }

  // Sanity checks passed.
  Blockly.Extensions.register(name, function() {
    if (hasMutatorDialog) {
      this.setMutator(new Blockly.Mutator(opt_blockList));
    }
    // Mixin the object.
    this.mixin(mixinObj);

    if (opt_helperFn) {
      opt_helperFn.apply(this);
    }
  });
};

/**
 * Applies an extension method to a block. This should only be called during
 * block construction.
 * @param {string} name The name of the extension.
 * @param {!Blockly.Block} block The block to apply the named extension to.
 * @param {boolean} isMutator True if this extension defines a mutator.
 * @throws {Error} if the extension is not found.
 */
Blockly.Extensions.apply = function(name, block, isMutator) {
  var extensionFn = Blockly.Extensions.ALL_[name];
  if (!goog.isFunction(extensionFn)) {
    throw new Error('Error: Extension "' + name + '" not found.');
  }
  if (isMutator) {
    // Fail early if the block already has mutation properties.
    Blockly.Extensions.checkNoMutatorProperties_(name, block);
  } else {
    // Record the old properties so we can make sure they don't change after
    // applying the extension.
    var mutatorProperties = Blockly.Extensions.getMutatorProperties_(block);
  }
  extensionFn.apply(block);

  if (isMutator) {
    var errorPrefix = 'Error after applying mutator "' + name + '": ';
    Blockly.Extensions.checkBlockHasMutatorProperties_(name, block, errorPrefix);
  } else {
    if (!Blockly.Extensions.mutatorPropertiesMatch_(mutatorProperties, block)) {
      throw new Error('Error when applying extension "' + name +
          '": mutation properties changed when applying a non-mutator extension.');
    }
  }
};

/**
 * Check that the given object has a property with the given name, and that the
 * property is a function.
 * @param {string} errorPrefix The string to prepend to any error message.
 * @param {!Object} object The object to check.
 * @param {string} propertyName Which property to check.
 * @throws {Error} if the property does not exist or is not a function.
 * @private
 */
Blockly.Extensions.checkHasFunction_ = function(errorPrefix, object,
    propertyName) {
  if (!object.hasOwnProperty(propertyName)) {
    throw new Error(errorPrefix +
        'missing required property "' + propertyName + '"');
  } else if (typeof object[propertyName] !== "function") {
    throw new Error(errorPrefix +
      '" required property "' + propertyName + '" must be a function');
  }
};

/**
 * Check that the given block does not have any of the four mutator properties
 * defined on it.  This function should be called before applying a mutator
 * extension to a block, to make sure we are not overwriting properties.
 * @param {string} mutationName The name of the mutation to reference in error
 *     messages.
 * @param {!Blockly.Block} block The block to check.
 * @throws {Error} if any of the properties already exist on the block.
 * @private
 */
Blockly.Extensions.checkNoMutatorProperties_ = function(mutationName, block) {
  for (var i = 0; i < Blockly.Extensions.MUTATOR_PROPERTIES_.length; i++) {
    var propertyName = Blockly.Extensions.MUTATOR_PROPERTIES_[i];
    if (block.hasOwnProperty(propertyName)) {
      throw new Error('Error: tried to apply mutation "' + mutationName +
          '" to a block that already has a "' + propertyName +
          '" function.  Block id: ' + block.id);
    }
  }
};

/**
 * Check that the given object has both or neither of the functions required
 * to have a mutator dialog.
 * These functions are 'compose' and 'decompose'.  If a block has one, it must
 * have both.
 * @param {!Object} object The object to check.
 * @param {string} errorPrefix The string to prepend to any error message.
 * @return {boolean} True if the object has both functions.  False if it has
 *     neither function.
 * @throws {Error} if the object has only one of the functions.
 * @private
 */
Blockly.Extensions.checkMutatorDialog_ = function(object, errorPrefix) {
  var hasCompose = object.hasOwnProperty('compose');
  var hasDecompose = object.hasOwnProperty('decompose');

  if (hasCompose && hasDecompose) {
    if (typeof object['compose'] !== "function") {
      throw new Error(errorPrefix + 'compose must be a function.');
    } else if (typeof object['decompose'] !== "function") {
      throw new Error(errorPrefix + 'decompose must be a function.');
    }
    return true;
  } else if (!hasCompose && !hasDecompose) {
    return false;
  } else {
    throw new Error(errorPrefix +
        'Must have both or neither of "compose" and "decompose"');
  }
};

/**
 * Check that a block has required mutator properties.  This should be called
 * after applying a mutation extension.
 * @param {string} errorPrefix The string to prepend to any error message.
 * @param {!Blockly.Block} block The block to inspect.
 * @private
 */
Blockly.Extensions.checkBlockHasMutatorProperties_ = function(errorPrefix,
    block) {
  if (!block.hasOwnProperty('domToMutation')) {
    throw new Error(errorPrefix + 'Applying a mutator didn\'t add "domToMutation"');
  }
  if (!block.hasOwnProperty('mutationToDom')) {
    throw new Error(errorPrefix + 'Applying a mutator didn\'t add "mutationToDom"');
  }

  // A block with a mutator isn't required to have a mutation dialog, but
  // it should still have both or neither of compose and decompose.
  Blockly.Extensions.checkMutatorDialog_(block, errorPrefix);
};

/**
 * Get a list of values of mutator properties on the given block.
 * @param {!Blockly.Block} block The block to inspect.
 * @return {!Array.<Object>} a list with all of the properties, which should be
 *     functions or undefined, but are not guaranteed to be.
 * @private
 */
Blockly.Extensions.getMutatorProperties_ = function(block) {
  var result = [];
  for (var i = 0; i < Blockly.Extensions.MUTATOR_PROPERTIES_.length; i++) {
    result.push(block[Blockly.Extensions.MUTATOR_PROPERTIES_[i]]);
  }
  return result;
};

/**
 * Check that the current mutator properties match a list of old mutator
 * properties.  This should be called after applying a non-mutator extension,
 * to verify that the extension didn't change properties it shouldn't.
 * @param {!Array.<Object>} oldProperties The old values to compare to.
 * @param {!Blockly.Block} block The block to inspect for new values.
 * @return {boolean} True if the property lists match.
 * @private
 */
Blockly.Extensions.mutatorPropertiesMatch_ = function(oldProperties, block) {
  var match = true;
  var newProperties = Blockly.Extensions.getMutatorProperties_(block);
  if (newProperties.length != oldProperties.length) {
    match = false;
  } else {
    for (var i = 0; i < newProperties.length; i++) {
      if (oldProperties[i] != newProperties[i]) {
        match = false;
      }
    }
  }

  return match;
};

/**
 * Builds an extension function that will map a dropdown value to a tooltip
 * string.
 *
 * This method includes multiple checks to ensure tooltips, dropdown options,
 * and message references are aligned. This aims to catch errors as early as
 * possible, without requiring developers to manually test tooltips under each
 * option. After the page is loaded, each tooltip text string will be checked
 * for matching message keys in the internationalized string table. Deferring
 * this until the page is loaded decouples loading dependencies. Later, upon
 * loading the first block of any given type, the extension will validate every
 * dropdown option has a matching tooltip in the lookupTable.  Errors are
 * reported as warnings in the console, and are never fatal.
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
        // Will print warnings is reference is missing.
        Blockly.utils.checkMessageReferences(lookupTable[key]);
      }
    });
  }

  /**
   * The actual extension.
   * @this {Blockly.Block}
   */
  var extensionFn = function() {
    if (this.type && blockTypesChecked.indexOf(this.type) === -1) {
      Blockly.Extensions.checkDropdownOptionsInTable_(
        this, dropdownName, lookupTable);
      blockTypesChecked.push(this.type);
    }

    this.setTooltip(function() {
      var value = this.getFieldValue(dropdownName);
      var tooltip = lookupTable[value];
      if (tooltip == null) {
        if (blockTypesChecked.indexOf(this.type) === -1) {
          // Warn for missing values on generated tooltips
          var warning = 'No tooltip mapping for value ' + value +
              ' of field ' + dropdownName;
          if (this.type != null) {
            warning += (' of block type ' + this.type);
          }
          console.warn(warning + '.');
        }
      } else {
        tooltip = Blockly.utils.replaceMessageReferences(tooltip);
      }
      return tooltip;
    }.bind(this));
  };
  return extensionFn;
};

/**
 * Checks all options keys are present in the provided string lookup table.
 * Emits console warnings when they are not.
 * @param {!Blockly.Block} block The block containing the dropdown
 * @param {string} dropdownName The name of the dropdown
 * @param {!Object<string, string>} lookupTable The string lookup table
 * @private
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
 * Builds an extension function that will install a dynamic tooltip. The
 * tooltip message should include the string '%1' and that string will be
 * replaced with the value of the named field.
 * @param {string} msgTemplate The template form to of the message text, with
 *     %1 placeholder.
 * @param {string} fieldName The field with the replacement value.
 * @returns {Function} The extension function.
 */
Blockly.Extensions.buildTooltipWithFieldValue =
  function(msgTemplate, fieldName) {
    // Check the tooltip string messages for invalid references.
    // Wait for load, in case Blockly.Msg is not yet populated.
    // runAfterPageLoad() does not run in a Node.js environment due to lack of
    // document object, in which case skip the validation.
    if (document) { // Relies on document.readyState
      Blockly.utils.runAfterPageLoad(function() {
        // Will print warnings is reference is missing.
        Blockly.utils.checkMessageReferences(msgTemplate);
      });
    }

    /**
     * The actual extension.
     * @this {Blockly.Block}
     */
    var extensionFn = function() {
      this.setTooltip(function() {
        return Blockly.utils.replaceMessageReferences(msgTemplate)
            .replace('%1', this.getFieldValue(fieldName));
      }.bind(this));
    };
    return extensionFn;
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


