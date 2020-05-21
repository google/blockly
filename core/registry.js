/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview This file is a universal registry that provides generic methods
 *    for registering and unregistering different types of classes.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.registry');


/**
 * A map of maps. With the keys being the type and name of the class we are
 * registering and the value being the constructor function.
 * Ex: {'field': {'field_angle': Blockly.FieldAngle}}
 *
 * @type {Object<string, Object<string, function(new:?)>>}
 */
Blockly.registry.typeMap_ = {};

/**
 * Registry types.
 * @enum {string}
 */
Blockly.registry.types = {
  FIELD: 'field',
  RENDERER: 'renderer'
};

/**
 * Registers a class based on a type and name.
 * @param {!Blockly.registry.types} type The registry type for the class.
 *    (Ex. Field, Renderer)
 * @param {string} name The name given to the specific class.
 *    (Ex. field_angle, geras)
 * @param {Function} registryClass The class to register.
 * @throws {Error} if the type or name is empty, a name with the given type has
 *    already been registered, or if the given class is not valid for it's type.
 */
Blockly.registry.register = function(type, name, registryClass) {
  if ((typeof type != 'string') || (type.trim() == '')) {
    throw Error('Invalid type "' + type + '". The type must be a' +
      ' non-empty string.');
  }

  if ((typeof name != 'string') || (name.trim() == '')) {
    throw Error('Invalid name "' + name + '". The name must be a' +
      ' non-empty string.');
  }
  if (!registryClass) {
    throw Error('Can not register a null value');
  }
  var typeRegistry = Blockly.registry.typeMap_[type.toLowerCase()];
  // If the type registry has not been created, create it.
  if (!typeRegistry) {
    typeRegistry = Blockly.registry.typeMap_[type.toLowerCase()] = {};
  }

  // Validate that the given class has all the required properties.
  Blockly.registry.validate_(type, registryClass);

  // If the name already exists throw an error.
  if (typeRegistry[name.toLowerCase()]) {
    throw Error('Name "' + name + '" with type "' + type + '" already registered.');
  }
  typeRegistry[name.toLowerCase()] = registryClass;
};

/**
 * Checks the given class for properties that are required based on the type.
 * @param {!Blockly.registry.types} type The registry type for the class.
 *    (Ex. Field, Renderer)
 * @param {Function} registryClass A class that we are checking for the required
 *    properties.
 * @private
 */
Blockly.registry.validate_ = function(type, registryClass) {
  switch (type) {
    case Blockly.registry.types.FIELD:
      Blockly.registry.validateProperties_(type, ['fromJson'], registryClass);
      break;
    case Blockly.registry.types.RENDERER:
      Blockly.registry.validateProperties_(type, [], registryClass);
      break;
  }
};

/**
 * Checks that the given class has all the given method names.
 * @param {!Blockly.registry.types} type The registry type for the class.
 *    (Ex. Field, Renderer)
 * @param {Array.<string>} requiredProperties The list of method names we expect the
 *    given class to have.
 * @param {Function} registryClass A class that we are checking for the required
 *    properties.
 * @throws {Error} if the class does not implement all of the method names.
 * @private
 */
Blockly.registry.validateProperties_ = function(type, requiredProperties, registryClass) {
  var unimplemented = requiredProperties.filter(function(property) {
    return !registryClass.hasOwnProperty(property) ||
        (typeof registryClass[property] != 'function');
  });
  if (unimplemented.length) {
    throw Error('Type "' + type + '" requires the following properties "' +
        unimplemented + '"');
  }
};

/**
 * Unregisters the class with the given type and name.
 * @param {!Blockly.registry.types} type The registry type for the class.
 *    (Ex. Field, Renderer)
 * @param {string} name The name given to the specific class.
 *    (Ex. field_angle, geras)
 */
Blockly.registry.unregister = function(type, name) {
  var typeRegistry = Blockly.registry.typeMap_[type.toLowerCase()];
  if (!typeRegistry) {
    console.warn('No type "' + type + '" found');
    return;
  }
  if (!typeRegistry[name]) {
    console.warn('No name "' + name + '" with type "' + type + '" found');
    return;
  }
  delete Blockly.registry.typeMap_[type.toLowerCase()][name.toLowerCase()];
};

/**
 * Get the class for the given name and type.
 * @param {!Blockly.registry.types} type The registry type for the class.
 *    (Ex. Field, Renderer)
 * @param {string} name The name given to the specific class.
 *    (Ex. field_angle, geras)
 * @return {Function} The class with the given name and type or null if none
 *    exists.
 */
Blockly.registry.getClass = function(type, name) {
  var typeRegistry = Blockly.registry.typeMap_[type.toLowerCase()];
  if (!typeRegistry) {
    console.warn('No type "' + type + '" found');
    return null;
  }
  if (!typeRegistry[name.toLowerCase()]) {
    console.warn('No name "' + name + '" with type "' + type + '" found');
    return null;
  }
  return typeRegistry[name.toLowerCase()];
};
