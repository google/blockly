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
 * @author Anm@anm.me (Andrew n marshall)
 */
'use strict';

/**
 * @name Blockly.Extensions
 * @namespace
 */
goog.module('Blockly.Extensions');
goog.module.declareLegacyNamespace();

const Block = goog.requireType('Blockly.Block');
const {checkMessageReferences, replaceMessageReferences, runAfterPageLoad} = goog.require('Blockly.utils');


/**
 * The set of all registered extensions, keyed by extension name/id.
 * @private
 */
const ALL = Object.create(null);

/**
 * Registers a new extension function. Extensions are functions that help
 * initialize blocks, usually adding dynamic behavior such as onchange
 * handlers and mutators. These are applied using Block.applyExtension(), or
 * the JSON "extensions" array attribute.
 * @param {string} name The name of this extension.
 * @param {Function} initFn The function to initialize an extended block.
 * @throws {Error} if the extension name is empty, the extension is already
 *     registered, or extensionFn is not a function.
 */
const register = function(name, initFn) {
  if ((typeof name != 'string') || (name.trim() == '')) {
    throw Error('Error: Invalid extension name "' + name + '"');
  }
  if (ALL[name]) {
    throw Error('Error: Extension "' + name + '" is already registered.');
  }
  if (typeof initFn != 'function') {
    throw Error('Error: Extension "' + name + '" must be a function');
  }
  ALL[name] = initFn;
};

/**
 * Registers a new extension function that adds all key/value of mixinObj.
 * @param {string} name The name of this extension.
 * @param {!Object} mixinObj The values to mix in.
 * @throws {Error} if the extension name is empty or the extension is already
 *     registered.
 */
const registerMixin = function(name, mixinObj) {
  if (!mixinObj || typeof mixinObj != 'object') {
    throw Error('Error: Mixin "' + name + '" must be a object');
  }
  register(name, function() {
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
 * @param {(function())=} opt_helperFn An optional function to apply after
 *     mixing in the object.
 * @param {!Array<string>=} opt_blockList A list of blocks to appear in the
 *     flyout of the mutator dialog.
 * @throws {Error} if the mutation is invalid or can't be applied to the block.
 */
const registerMutator = function(name, mixinObj, opt_helperFn,
    opt_blockList) {
  const errorPrefix = 'Error when registering mutator "' + name + '": ';

  // Sanity check the mixin object before registering it.
  checkHasFunction(
      errorPrefix, mixinObj.domToMutation, 'domToMutation');
  checkHasFunction(
      errorPrefix, mixinObj.mutationToDom, 'mutationToDom');

  const hasMutatorDialog =
      checkMutatorDialog(mixinObj, errorPrefix);

  if (opt_helperFn && (typeof opt_helperFn != 'function')) {
    throw Error('Extension "' + name + '" is not a function');
  }

  // Sanity checks passed.
  register(name, function() {
    if (hasMutatorDialog) {
      if (!Blockly.Mutator) {
        throw Error(errorPrefix + 'Missing require for Blockly.Mutator');
      }
      this.setMutator(new Blockly.Mutator(opt_blockList || []));
    }
    // Mixin the object.
    this.mixin(mixinObj);

    if (opt_helperFn) {
      opt_helperFn.apply(this);
    }
  });
};

/**
 * Unregisters the extension registered with the given name.
 * @param {string} name The name of the extension to unregister.
 */
const unregister = function(name) {
  if (ALL[name]) {
    delete ALL[name];
  } else {
    console.warn('No extension mapping for name "' + name +
        '" found to unregister');
  }
};

/**
 * Applies an extension method to a block. This should only be called during
 * block construction.
 * @param {string} name The name of the extension.
 * @param {!Block} block The block to apply the named extension to.
 * @param {boolean} isMutator True if this extension defines a mutator.
 * @throws {Error} if the extension is not found.
 */
const apply = function(name, block, isMutator) {
  const extensionFn = ALL[name];
  if (typeof extensionFn != 'function') {
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
    checkBlockHasMutatorProperties(errorPrefix, block);
  } else {
    if (!mutatorPropertiesMatch(
        /** @type {!Array<Object>} */ (mutatorProperties), block)) {
      throw Error('Error when applying extension "' + name + '": ' +
          'mutation properties changed when applying a non-mutator extension.');
    }
  }
};

/**
 * Check that the given value is a function.
 * @param {string} errorPrefix The string to prepend to any error message.
 * @param {*} func Function to check.
 * @param {string} propertyName Which property to check.
 * @throws {Error} if the property does not exist or is not a function.
 * @private
 */
const checkHasFunction = function(errorPrefix, func,
    propertyName) {
  if (!func) {
    throw Error(errorPrefix +
        'missing required property "' + propertyName + '"');
  } else if (typeof func != 'function') {
    throw Error(errorPrefix +
        '" required property "' + propertyName + '" must be a function');
  }
};

/**
 * Check that the given block does not have any of the four mutator properties
 * defined on it.  This function should be called before applying a mutator
 * extension to a block, to make sure we are not overwriting properties.
 * @param {string} mutationName The name of the mutation to reference in error
 *     messages.
 * @param {!Block} block The block to check.
 * @throws {Error} if any of the properties already exist on the block.
 * @private
 */
const checkNoMutatorProperties = function(mutationName, block) {
  const properties = getMutatorProperties(block);
  if (properties.length) {
    throw Error('Error: tried to apply mutation "' + mutationName +
        '" to a block that already has mutator functions.' +
        '  Block id: ' + block.id);
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
const checkMutatorDialog = function(object, errorPrefix) {
  const hasCompose = object.compose !== undefined;
  const hasDecompose = object.decompose !== undefined;

  if (hasCompose && hasDecompose) {
    if (typeof object.compose != 'function') {
      throw Error(errorPrefix + 'compose must be a function.');
    } else if (typeof object.decompose != 'function') {
      throw Error(errorPrefix + 'decompose must be a function.');
    }
    return true;
  } else if (!hasCompose && !hasDecompose) {
    return false;
  }
  throw Error(errorPrefix +
      'Must have both or neither of "compose" and "decompose"');
};

/**
 * Check that a block has required mutator properties.  This should be called
 * after applying a mutation extension.
 * @param {string} errorPrefix The string to prepend to any error message.
 * @param {!Block} block The block to inspect.
 * @private
 */
const checkBlockHasMutatorProperties = function(errorPrefix,
    block) {
  if (typeof block.domToMutation != 'function') {
    throw Error(errorPrefix + 'Applying a mutator didn\'t add "domToMutation"');
  }
  if (typeof block.mutationToDom != 'function') {
    throw Error(errorPrefix + 'Applying a mutator didn\'t add "mutationToDom"');
  }

  // A block with a mutator isn't required to have a mutation dialog, but
  // it should still have both or neither of compose and decompose.
  checkMutatorDialog(block, errorPrefix);
};

/**
 * Get a list of values of mutator properties on the given block.
 * @param {!Block} block The block to inspect.
 * @return {!Array<Object>} A list with all of the defined properties, which
 *     should be functions, but may be anything other than undefined.
 * @private
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
 * @private
 */
const mutatorPropertiesMatch = function(oldProperties, block) {
  const newProperties = getMutatorProperties(block);
  if (newProperties.length != oldProperties.length) {
    return false;
  }
  for (let i = 0; i < newProperties.length; i++) {
    if (oldProperties[i] != newProperties[i]) {
      return false;
    }
  }
  return true;
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
 * @return {!Function} The extension function.
 */
const buildTooltipForDropdown = function(dropdownName,
    lookupTable) {
  // List of block types already validated, to minimize duplicate warnings.
  const blockTypesChecked = [];

  // Check the tooltip string messages for invalid references.
  // Wait for load, in case Blockly.Msg is not yet populated.
  // runAfterPageLoad() does not run in a Node.js environment due to lack of
  // document object, in which case skip the validation.
  if (typeof document == 'object') {  // Relies on document.readyState
    runAfterPageLoad(function() {
      for (let key in lookupTable) {
        // Will print warnings if reference is missing.
        checkMessageReferences(lookupTable[key]);
      }
    });
  }

  /**
   * The actual extension.
   * @this {Block}
   */
  const extensionFn = function () {
    if (this.type && blockTypesChecked.indexOf(this.type) == -1) {
      checkDropdownOptionsInTable(
          this, dropdownName, lookupTable);
      blockTypesChecked.push(this.type);
    }

    this.setTooltip(function () {
      const value = String(this.getFieldValue(dropdownName));
      let tooltip = lookupTable[value];
      if (tooltip == null) {
        if (blockTypesChecked.indexOf(this.type) == -1) {
          // Warn for missing values on generated tooltips.
          let warning = 'No tooltip mapping for value ' + value +
              ' of field ' + dropdownName;
          if (this.type != null) {
            warning += (' of block type ' + this.type);
          }
          console.warn(warning + '.');
        }
      } else {
        tooltip = replaceMessageReferences(tooltip);
      }
      return tooltip;
    }.bind(this));
  };
  return extensionFn;
};

/**
 * Checks all options keys are present in the provided string lookup table.
 * Emits console warnings when they are not.
 * @param {!Block} block The block containing the dropdown
 * @param {string} dropdownName The name of the dropdown
 * @param {!Object<string, string>} lookupTable The string lookup table
 * @private
 */
const checkDropdownOptionsInTable = function(block, dropdownName,
    lookupTable) {
  // Validate all dropdown options have values.
  const dropdown = block.getField(dropdownName);
  if (!dropdown.isOptionListDynamic()) {
    const options = dropdown.getOptions();
    for (let i = 0; i < options.length; ++i) {
      const optionKey = options[i][1];  // label, then value
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
 * replaced with the text of the named field.
 * @param {string} msgTemplate The template form to of the message text, with
 *     %1 placeholder.
 * @param {string} fieldName The field with the replacement text.
 * @return {!Function} The extension function.
 */
const buildTooltipWithFieldText = function(msgTemplate,
    fieldName) {
  // Check the tooltip string messages for invalid references.
  // Wait for load, in case Blockly.Msg is not yet populated.
  // runAfterPageLoad() does not run in a Node.js environment due to lack of
  // document object, in which case skip the validation.
  if (typeof document == 'object') {  // Relies on document.readyState
    runAfterPageLoad(function() {
      // Will print warnings if reference is missing.
      checkMessageReferences(msgTemplate);
    });
  }

  /**
   * The actual extension.
   * @this {Block}
   */
  const extensionFn = function () {
    this.setTooltip(function () {
      const field = this.getField(fieldName);
      return replaceMessageReferences(msgTemplate)
          .replace('%1', field ? field.getText() : '');
    }.bind(this));
  };
  return extensionFn;
};

/**
 * Configures the tooltip to mimic the parent block when connected. Otherwise,
 * uses the tooltip text at the time this extension is initialized. This takes
 * advantage of the fact that all other values from JSON are initialized before
 * extensions.
 * @this {Block}
 * @private
 */
const extensionParentTooltip = function() {
  this.tooltipWhenNotConnected = this.tooltip;
  this.setTooltip(function() {
    const parent = this.getParent();
    return (parent && parent.getInputsInline() && parent.tooltip) ||
        this.tooltipWhenNotConnected;
  }.bind(this));
};
register('parent_tooltip_when_inline',
    extensionParentTooltip);

exports = {ALL_: ALL, register, registerMixin, registerMutator, unregister, apply, buildTooltipForDropdown, buildTooltipWithFieldText};
