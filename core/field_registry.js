/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Fields can be created based on a JSON definition. This file
 *    contains methods for registering those JSON definitions, and building the
 *    fields based on JSON.
 * @author bekawestberg@gmail.com (Beka Westberg)
 */
'use strict';

goog.provide('Blockly.fieldRegistry');


/**
 * The set of all registered fields, keyed by field type as used in the JSON
 * definition of a block.
 * @type {!Object<string, !{fromJson: Function}>}
 * @private
 */
Blockly.fieldRegistry.typeMap_ = {};

/**
 * Registers a field type.
 * Blockly.fieldRegistry.fromJson uses this registry to
 * find the appropriate field type.
 * @param {string} type The field type name as used in the JSON definition.
 * @param {!{fromJson: Function}} fieldClass The field class containing a
 *     fromJson function that can construct an instance of the field.
 * @throws {Error} if the type name is empty, the field is already
 *     registered, or the fieldClass is not an object containing a fromJson
 *     function.
 */
Blockly.fieldRegistry.register = function(type, fieldClass) {
  if ((typeof type != 'string') || (type.trim() == '')) {
    throw Error('Invalid field type "' + type + '". The type must be a' +
      ' non-empty string.');
  }
  if (Blockly.fieldRegistry.typeMap_[type]) {
    throw Error('Error: Field "' + type + '" is already registered.');
  }
  if (!fieldClass || (typeof fieldClass.fromJson != 'function')) {
    throw Error('Field "' + fieldClass + '" must have a fromJson function');
  }
  type = type.toLowerCase();
  Blockly.fieldRegistry.typeMap_[type] = fieldClass;
};

/**
 * Unregisters the field registered with the given type.
 * @param {string} type The field type name as used in the JSON definition.
 */
Blockly.fieldRegistry.unregister = function(type) {
  if (Blockly.fieldRegistry.typeMap_[type]) {
    delete Blockly.fieldRegistry.typeMap_[type];
  } else {
    console.warn('No field mapping for type "' + type +
        '" found to unregister');
  }
};

/**
 * Construct a Field from a JSON arg object.
 * Finds the appropriate registered field by the type name as registered using
 * Blockly.fieldRegistry.register.
 * @param {!Object} options A JSON object with a type and options specific
 *     to the field type.
 * @return {Blockly.Field} The new field instance or null if a field wasn't
 *     found with the given type name
 * @package
 */
Blockly.fieldRegistry.fromJson = function(options) {
  var type = options['type'].toLowerCase();
  var fieldClass = Blockly.fieldRegistry.typeMap_[type];
  if (!fieldClass) {
    console.warn('Blockly could not create a field of type ' + options['type'] +
      '. The field is probably not being registered. This could be because' +
      ' the file is not loaded, the field does not register itself (Issue' +
      ' #1584), or the registration is not being reached.');
    return null;
  }
  return fieldClass.fromJson(options);
};
