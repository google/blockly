/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Fields can be created based on a JSON definition. This file
 *    contains methods for registering those JSON definitions, and building the
 *    fields based on JSON.
 */
'use strict';

/**
 * Fields can be created based on a JSON definition. This file
 *    contains methods for registering those JSON definitions, and building the
 *    fields based on JSON.
 * @namespace Blockly.fieldRegistry
 */
goog.module('Blockly.fieldRegistry');

const registry = goog.require('Blockly.registry');
/* eslint-disable-next-line no-unused-vars */
const {Field} = goog.requireType('Blockly.Field');
/* eslint-disable-next-line no-unused-vars */
const {IRegistrableField} = goog.requireType('Blockly.IRegistrableField');


/**
 * Registers a field type.
 * fieldRegistry.fromJson uses this registry to
 * find the appropriate field type.
 * @param {string} type The field type name as used in the JSON definition.
 * @param {!IRegistrableField} fieldClass The field class containing a
 *     fromJson function that can construct an instance of the field.
 * @throws {Error} if the type name is empty, the field is already
 *     registered, or the fieldClass is not an object containing a fromJson
 *     function.
 * @alias Blockly.fieldRegistry.register
 */
const register = function(type, fieldClass) {
  registry.register(registry.Type.FIELD, type, fieldClass);
};
exports.register = register;

/**
 * Unregisters the field registered with the given type.
 * @param {string} type The field type name as used in the JSON definition.
 * @alias Blockly.fieldRegistry.unregister
 */
const unregister = function(type) {
  registry.unregister(registry.Type.FIELD, type);
};
exports.unregister = unregister;

/**
 * Construct a Field from a JSON arg object.
 * Finds the appropriate registered field by the type name as registered using
 * fieldRegistry.register.
 * @param {!Object} options A JSON object with a type and options specific
 *     to the field type.
 * @return {?Field} The new field instance or null if a field wasn't
 *     found with the given type name
 * @alias Blockly.fieldRegistry.fromJson
 * @package
 */
const fromJson = function(options) {
  const fieldObject = /** @type {?IRegistrableField} */ (
      registry.getObject(registry.Type.FIELD, options['type']));
  if (!fieldObject) {
    console.warn(
        'Blockly could not create a field of type ' + options['type'] +
        '. The field is probably not being registered. This could be because' +
        ' the file is not loaded, the field does not register itself (Issue' +
        ' #1584), or the registration is not being reached.');
    return null;
  }
  return fieldObject.fromJson(options);
};
exports.fromJson = fromJson;
