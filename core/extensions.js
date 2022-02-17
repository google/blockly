/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Extensions are functions that help initialize blocks, usually
 *      adding dynamic behavior such as onchange handlers and mutators. These
 *      are applied using Block.applyExtension(), or the JSON "extensions"
 *      array attribute.
 */
'use strict';

/**
 * Extensions are functions that help initialize blocks, usually
 *      adding dynamic behavior such as onchange handlers and mutators. These
 *      are applied using Block.applyExtension(), or the JSON "extensions"
 *      array attribute.
 * @namespace Blockly.Extensions
 */
goog.module('Blockly.Extensions');

const parsing = goog.require('Blockly.utils.parsing');
/* eslint-disable-next-line no-unused-vars */
const {Block} = goog.requireType('Blockly.Block');
const {FieldDropdown} = goog.require('Blockly.FieldDropdown');
goog.requireType('Blockly.Mutator');


/**
 * The set of all registered extensions, keyed by extension name/id.
 * @private
 */
const allExtensions = Object.create(null);
exports.TEST_ONLY = {allExtensions};

/**
 * Registers a new extension function. Extensions are functions that help
 * initialize blocks, usually adding dynamic behavior such as onchange
 * handlers and mutators. These are applied using Block.applyExtension(), or
 * the JSON "extensions" array attribute.
 * @param {string} name The name of this extension.
 * @param {Function} initFn The function to initialize an extended block.
 * @throws {Error} if the extension name is empty, the extension is already
 *     registered, or extensionFn is not a function.
 * @alias Blockly.Extensions.register
 */
const register = function(name, initFn) {
  if ((typeof name !== 'string') || (name.trim() === '')) {
    throw Error('Error: Invalid extension name "' + name + '"');
  }
  if (allExtensions[name]) {
    throw Error('Error: Extension "' + name + '" is already registered.');
  }
  if (typeof initFn !== 'function') {
    throw Error('Error: Extension "' + name + '" must be a function');
  }
  allExtensions[name] = initFn;
};
exports.register = register;

/**
 * Registers a new extension function that adds all key/value of mixinObj.
 * @param {string} name The name of this extension.
 * @param {!Object} mixinObj The values to mix in.
 * @throws {Error} if the extension name is empty or the extension is already
 *     registered.
 * @alias Blockly.Extensions.registerMixin
 */
const registerMixin = function(name, mixinObj) {
  if (!mixinObj || typeof mixinObj !== 'object') {
    throw Error('Error: Mixin "' + name + '" must be a object');
  }
  register(
      name,
      /** @this {Block} */
      function() {
        this.mixin(mixinObj);
      });
};
exports.registerMixin = registerMixin;

/**
 * Registers a new extension function that adds a mutator to the block.
 * At register time this performs some basic sanity checks on the mutator.
 * The wrapper may also add a mutator dialog to the block, if both compose and
 * decompose are defined on the mixin.
 * @param {string} name The name of this mutator extension.
 * @param {!Object} mixinObj The values to mix in.
 * @param {(function())=} opt_helperFn An optional function to apply after
 *     mixing in the object.
 * @param {!Array<string>=} opt_blockList A list of blocks to appear in the
 *     flyout of the mutator dialog.
 * @throws {Error} if the mutation is invalid or can't be applied to the block.
 * @alias Blockly.Extensions.registerMutator
 */
const registerMutator = function(name, mixinObj, opt_helperFn, opt_blockList) {
  const errorPrefix = 'Error when registering mutator "' + name + '": ';

  checkHasMutatorProperties(errorPrefix, mixinObj);
  const hasMutatorDialog = checkMutatorDialog(mixinObj, errorPrefix);

  if (opt_helperFn && (typeof opt_helperFn !== 'function')) {
    throw Error(errorPrefix + 'Extension "' + name + '" is not a function');
  }

  // Sanity checks passed.
  register(
      name,
      /** @this {Block} */
      function() {
        if (hasMutatorDialog) {
          const {Mutator} = goog.module.get('Blockly.Mutator');
          if (!Mutator) {
            throw Error(errorPrefix + 'Missing require for Blockly.Mutator');
          }
          this.setMutator(new Mutator(opt_blockList || []));
        }
        // Mixin the object.
        this.mixin(mixinObj);

        if (opt_helperFn) {
          opt_helperFn.apply(this);
        }
      });
};
exports.registerMutator = registerMutator;

/**
 * Unregisters the extension registered with the given name.
 * @param {string} name The name of the extension to unregister.
 * @alias Blockly.Extensions.unregister
 */
const unregister = function(name) {
  if (isRegistered(name)) {
    delete allExtensions[name];
  } else {
    console.warn(
        'No extension mapping for name "' + name + '" found to unregister');
  }
};
exports.unregister = unregister;

/**
 * Returns whether an extension is registered with the given name.
 * @param {string} name The name of the extension to check for.
 * @return {boolean} True if the extension is registered.  False if it is
 *     not registered.
 * @alias Blockly.Extensions.isRegistered
 */
const isRegistered = function(name) {
  return !!allExtensions[name];
};
exports.isRegistered = isRegistered;

/**
 * Applies an extension method to a block. This should only be called during
 * block construction.
 * @param {string} name The name of the extension.
 * @param {!Block} block The block to apply the named extension to.
 * @param {boolean} isMutator True if this extension defines a mutator.
 * @throws {Error} if the extension is not found.
 * @alias Blockly.Extensions.apply
 */
const apply = function(name, block, isMutator) {
  const extensionFn = allExtensions[name];
  if (typeof extensionFn !== 'function') {
    throw Error('Error: Extension "' + name + '" not found.');
  }
  let mutatorProperties;
  if (isMutator) {
    // Fail early if the block already has mutation properties.
    checkNoMutatorProperties(name, block);
  } else {
    // Record the old properties so we can make sure they don't change after
    // applying the extension.
    mutatorProperties = getMutatorProperties(block);
  }
  extensionFn.apply(block);

  if (isMutator) {
    const errorPrefix = 'Error after applying mutator "' + name + '": ';
    checkHasMutatorProperties(errorPrefix, block);
  } else {
    if (!mutatorPropertiesMatch(
            /** @type {!Array<Object>} */ (mutatorProperties), block)) {
      throw Error(
          'Error when applying extension "' + name + '": ' +
          'mutation properties changed when applying a non-mutator extension.');
    }
  }
};
exports.apply = apply;

/**
 * Check that the given block does not have any of the four mutator properties
 * defined on it.  This function should be called before applying a mutator
 * extension to a block, to make sure we are not overwriting properties.
 * @param {string} mutationName The name of the mutation to reference in error
 *     messages.
 * @param {!Block} block The block to check.
 * @throws {Error} if any of the properties already exist on the block.
 */
const checkNoMutatorProperties = function(mutationName, block) {
  const properties = getMutatorProperties(block);
  if (properties.length) {
    throw Error(
        'Error: tried to apply mutation "' + mutationName +
        '" to a block that already has mutator functions.' +
        '  Block id: ' + block.id);
  }
};

/**
 * Checks if the given object has both the 'mutationToDom' and 'domToMutation'
 * functions.
 * @param {!Object} object The object to check.
 * @param {string} errorPrefix The string to prepend to any error message.
 * @return {boolean} True if the object has both functions.  False if it has
 *     neither function.
 * @throws {Error} if the object has only one of the functions, or either is
 *     not actually a function.
 */
const checkXmlHooks = function(object, errorPrefix) {
  return checkHasFunctionPair(
      object.mutationToDom, object.domToMutation,
      errorPrefix + ' mutationToDom/domToMutation');
};

/**
 * Checks if the given object has both the 'saveExtraState' and 'loadExtraState'
 * functions.
 * @param {!Object} object The object to check.
 * @param {string} errorPrefix The string to prepend to any error message.
 * @return {boolean} True if the object has both functions.  False if it has
 *     neither function.
 * @throws {Error} if the object has only one of the functions, or either is
 *     not actually a function.
 */
const checkJsonHooks = function(object, errorPrefix) {
  return checkHasFunctionPair(
      object.saveExtraState, object.loadExtraState,
      errorPrefix + ' saveExtraState/loadExtraState');
};

/**
 * Checks if the given object has both the 'compose' and 'decompose' functions.
 * @param {!Object} object The object to check.
 * @param {string} errorPrefix The string to prepend to any error message.
 * @return {boolean} True if the object has both functions.  False if it has
 *     neither function.
 * @throws {Error} if the object has only one of the functions, or either is
 *     not actually a function.
 */
const checkMutatorDialog = function(object, errorPrefix) {
  return checkHasFunctionPair(
      object.compose, object.decompose, errorPrefix + ' compose/decompose');
};

/**
 * Checks that both or neither of the given functions exist and that they are
 * indeed functions.
 * @param {*} func1 The first function in the pair.
 * @param {*} func2 The second function in the pair.
 * @param {string} errorPrefix The string to prepend to any error message.
 * @return {boolean} True if the object has both functions.  False if it has
 *     neither function.
 * @throws {Error} If the object has only one of the functions, or either is
 *     not actually a function.
 */
const checkHasFunctionPair = function(func1, func2, errorPrefix) {
  if (func1 && func2) {
    if (typeof func1 !== 'function' || typeof func2 !== 'function') {
      throw Error(errorPrefix + ' must be a function');
    }
    return true;
  } else if (!func1 && !func2) {
    return false;
  }
  throw Error(errorPrefix + 'Must have both or neither functions');
};

/**
 * Checks that the given object required mutator properties.
 * @param {string} errorPrefix The string to prepend to any error message.
 * @param {!Object} object The object to inspect.
 */
const checkHasMutatorProperties = function(errorPrefix, object) {
  const hasXmlHooks = checkXmlHooks(object, errorPrefix);
  const hasJsonHooks = checkJsonHooks(object, errorPrefix);
  if (!hasXmlHooks && !hasJsonHooks) {
    throw Error(
        errorPrefix +
        'Mutations must contain either XML hooks, or JSON hooks, or both');
  }
  // A block with a mutator isn't required to have a mutation dialog, but
  // it should still have both or neither of compose and decompose.
  checkMutatorDialog(object, errorPrefix);
};

/**
 * Get a list of values of mutator properties on the given block.
 * @param {!Block} block The block to inspect.
 * @return {!Array<Object>} A list with all of the defined properties, which
 *     should be functions, but may be anything other than undefined.
 */
const getMutatorProperties = function(block) {
  const result = [];
  // List each function explicitly by reference to allow for renaming
  // during compilation.
  if (block.domToMutation !== undefined) {
    result.push(block.domToMutation);
  }
  if (block.mutationToDom !== undefined) {
    result.push(block.mutationToDom);
  }
  if (block.saveExtraState !== undefined) {
    result.push(block.saveExtraState);
  }
  if (block.loadExtraState !== undefined) {
    result.push(block.loadExtraState);
  }
  if (block.compose !== undefined) {
    result.push(block.compose);
  }
  if (block.decompose !== undefined) {
    result.push(block.decompose);
  }
  return result;
};

/**
 * Check that the current mutator properties match a list of old mutator
 * properties.  This should be called after applying a non-mutator extension,
 * to verify that the extension didn't change properties it shouldn't.
 * @param {!Array<Object>} oldProperties The old values to compare to.
 * @param {!Block} block The block to inspect for new values.
 * @return {boolean} True if the property lists match.
 */
const mutatorPropertiesMatch = function(oldProperties, block) {
  const newProperties = getMutatorProperties(block);
  if (newProperties.length !== oldProperties.length) {
    return false;
  }
  for (let i = 0; i < newProperties.length; i++) {
    if (oldProperties[i] !== newProperties[i]) {
      return false;
    }
  }
  return true;
};

/**
 * Calls a function after the page has loaded, possibly immediately.
 * @param {function()} fn Function to run.
 * @throws Error Will throw if no global document can be found (e.g., Node.js).
 * @package
 */
const runAfterPageLoad = function(fn) {
  if (typeof document !== 'object') {
    throw Error('runAfterPageLoad() requires browser document.');
  }
  if (document.readyState === 'complete') {
    fn();  // Page has already loaded. Call immediately.
  } else {
    // Poll readyState.
    const readyStateCheckInterval = setInterval(function() {
      if (document.readyState === 'complete') {
        clearInterval(readyStateCheckInterval);
        fn();
      }
    }, 10);
  }
};
exports.runAfterPageLoad = runAfterPageLoad;

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
 * @return {!Function} The extension function.
 * @alias Blockly.Extensions.buildTooltipForDropdown
 */
const buildTooltipForDropdown = function(dropdownName, lookupTable) {
  // List of block types already validated, to minimize duplicate warnings.
  const blockTypesChecked = [];

  // Check the tooltip string messages for invalid references.
  // Wait for load, in case Blockly.Msg is not yet populated.
  // runAfterPageLoad() does not run in a Node.js environment due to lack
  // of document object, in which case skip the validation.
  if (typeof document === 'object') {  // Relies on document.readyState
    runAfterPageLoad(function() {
      for (const key in lookupTable) {
        // Will print warnings if reference is missing.
        parsing.checkMessageReferences(lookupTable[key]);
      }
    });
  }

  /**
   * The actual extension.
   * @this {Block}
   */
  const extensionFn = function() {
    if (this.type && blockTypesChecked.indexOf(this.type) === -1) {
      checkDropdownOptionsInTable(this, dropdownName, lookupTable);
      blockTypesChecked.push(this.type);
    }

    this.setTooltip(function() {
      const value = String(this.getFieldValue(dropdownName));
      let tooltip = lookupTable[value];
      if (tooltip === null) {
        if (blockTypesChecked.indexOf(this.type) === -1) {
          // Warn for missing values on generated tooltips.
          let warning = 'No tooltip mapping for value ' + value + ' of field ' +
              dropdownName;
          if (this.type !== null) {
            warning += (' of block type ' + this.type);
          }
          console.warn(warning + '.');
        }
      } else {
        tooltip = parsing.replaceMessageReferences(tooltip);
      }
      return tooltip;
    }.bind(this));
  };
  return extensionFn;
};
exports.buildTooltipForDropdown = buildTooltipForDropdown;

/**
 * Checks all options keys are present in the provided string lookup table.
 * Emits console warnings when they are not.
 * @param {!Block} block The block containing the dropdown
 * @param {string} dropdownName The name of the dropdown
 * @param {!Object<string, string>} lookupTable The string lookup table
 */
const checkDropdownOptionsInTable = function(block, dropdownName, lookupTable) {
  // Validate all dropdown options have values.
  const dropdown = block.getField(dropdownName);
  if (dropdown instanceof FieldDropdown && !dropdown.isOptionListDynamic()) {
    const options = dropdown.getOptions();
    for (let i = 0; i < options.length; i++) {
      const optionKey = options[i][1];  // label, then value
      if (lookupTable[optionKey] === null) {
        console.warn(
            'No tooltip mapping for value ' + optionKey + ' of field ' +
            dropdownName + ' of block type ' + block.type);
      }
    }
  }
};

/**
 * Builds an extension function that will install a dynamic tooltip. The
 * tooltip message should include the string '%1' and that string will be
 * replaced with the text of the named field.
 * @param {string} msgTemplate The template form to of the message text, with
 *     %1 placeholder.
 * @param {string} fieldName The field with the replacement text.
 * @return {!Function} The extension function.
 * @alias Blockly.Extensions.buildTooltipWithFieldText
 */
const buildTooltipWithFieldText = function(msgTemplate, fieldName) {
  // Check the tooltip string messages for invalid references.
  // Wait for load, in case Blockly.Msg is not yet populated.
  // runAfterPageLoad() does not run in a Node.js environment due to lack
  // of document object, in which case skip the validation.
  if (typeof document === 'object') {  // Relies on document.readyState
    runAfterPageLoad(function() {
      // Will print warnings if reference is missing.
      parsing.checkMessageReferences(msgTemplate);
    });
  }

  /**
   * The actual extension.
   * @this {Block}
   */
  const extensionFn = function() {
    this.setTooltip(function() {
      const field = this.getField(fieldName);
      return parsing.replaceMessageReferences(msgTemplate)
          .replace('%1', field ? field.getText() : '');
    }.bind(this));
  };
  return extensionFn;
};
exports.buildTooltipWithFieldText = buildTooltipWithFieldText;

/**
 * Configures the tooltip to mimic the parent block when connected. Otherwise,
 * uses the tooltip text at the time this extension is initialized. This takes
 * advantage of the fact that all other values from JSON are initialized before
 * extensions.
 * @this {Block}
 */
const extensionParentTooltip = function() {
  const tooltipWhenNotConnected = this.tooltip;
  this.setTooltip(function() {
    const parent = this.getParent();
    return (parent && parent.getInputsInline() && parent.tooltip) ||
        tooltipWhenNotConnected;
  }.bind(this));
};
register('parent_tooltip_when_inline', extensionParentTooltip);
