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
 * A name with the type of the element stored in the generic.
 * @param {string} name The name of the registry type.
 * @constructor
 * @template T
 */
Blockly.registry.Type = function(name) {
  /** @private {string} */
  this.name_ = name;
};

/**
 * Returns the name of the type.
 * @return {string} The name.
 * @override
 */
Blockly.registry.Type.prototype.toString = function() {
  return this.name_;
};

/** @type {!Blockly.registry.Type<Blockly.blockRendering.Renderer>} */
Blockly.registry.Type.RENDERER = new Blockly.registry.Type('renderer');

/** @type {!Blockly.registry.Type<Blockly.Field>} */
Blockly.registry.Type.FIELD = new Blockly.registry.Type('field');

/**
 * Registers a class based on a type and name.
 * @param {string|Blockly.registry.Type<T>} type The type of the plugin.
 *     (Ex: Field, Renderer)
 * @param {string} name The plugin's name. (Ex. field_angle, geras)
 * @param {?function(new:T, ...?)} registryClass The class to register.
 * @throws {Error} if the type or name is empty, a name with the given type has
 *     already been registered, or if the given class is not valid for it's type.
 * @template T
 */
Blockly.registry.register = function(type, name, registryClass) {
  if ((!(type instanceof Blockly.registry.Type) && typeof type != 'string') || String(type).trim() == '') {
    throw Error('Invalid type "' + type + '". The type must be a' +
      ' non-empty string or a Blockly.registry.Type.');
  }
  type = String(type).toLowerCase();

  if ((typeof name != 'string') || (name.trim() == '')) {
    throw Error('Invalid name "' + name + '". The name must be a' +
      ' non-empty string.');
  }
  name = name.toLowerCase();
  if (!registryClass) {
    throw Error('Can not register a null value');
  }
  var typeRegistry = Blockly.registry.typeMap_[type];
  // If the type registry has not been created, create it.
  if (!typeRegistry) {
    typeRegistry = Blockly.registry.typeMap_[type] = {};
  }

  // Validate that the given class has all the required properties.
  Blockly.registry.validate_(type, registryClass);

  // If the name already exists throw an error.
  if (typeRegistry[name]) {
    throw Error('Name "' + name + '" with type "' + type + '" already registered.');
  }
  typeRegistry[name] = registryClass;
};

/**
 * Checks the given class for properties that are required based on the type.
 * @param {string} type The type of the plugin. (Ex: Field, Renderer)
 * @param {Function} registryClass A class that we are checking for the required
 *    properties.
 * @private
 */
Blockly.registry.validate_ = function(type, registryClass) {
  switch (type) {
    case String(Blockly.registry.Type.FIELD):
      Blockly.registry.validateProperties_(type, ['fromJson'], registryClass);
      break;
  }
};

/**
 * Checks that the given class has all the given method names.
 * @param {string} type The type of the plugin. (Ex: Field, Renderer)
 * @param {Array.<string>} requiredProperties The list of method names we expect the
 *     given class to have.
 * @param {Function} registryClass A class that we are checking for the required
 *     properties.
 * @throws {Error} if the class does not implement all of the method names.
 * @private
 */
Blockly.registry.validateProperties_ = function(type, requiredProperties, registryClass) {
  var unimplemented = requiredProperties.filter(function(property) {
    return !(registryClass[property] || registryClass.prototype[property]) ||
        (typeof registryClass[property] != 'function' &&
        typeof registryClass.prototype[property] != 'function');
  });
  if (unimplemented.length) {
    throw Error('Type "' + type + '" requires the following properties "' +
        unimplemented.join() + '"');
  }
};

/**
 * Unregisters the class with the given type and name.
 * @param {string|Blockly.registry.Type<T>} type The type of the plugin.
 *     (eg: Field, Renderer)
 * @param {string} name The plugin's name. (Ex. field_angle, geras)
 * @template T
 */
Blockly.registry.unregister = function(type, name) {
  type = String(type).toLowerCase();
  name = name.toLowerCase();
  var typeRegistry = Blockly.registry.typeMap_[type];
  if (!typeRegistry) {
    console.warn('No type "' + type + '" found');
    return;
  }
  if (!typeRegistry[name]) {
    console.warn('No name "' + name + '" with type "' + type + '" found');
    return;
  }
  delete Blockly.registry.typeMap_[type][name];
};

/**
 * Get the class for the given name and type.
 * @param {string|Blockly.registry.Type<T>} type The type of the plugin.
 *     (eg: Field, Renderer)
 * @param {string} name The plugin's name. (Ex. field_angle, geras)
 * @return {?function(new:T, ...?)} The class with the given name and type or
 *     null if none exists.
 * @template T
 */
Blockly.registry.getClass = function(type, name) {
  type = String(type).toLowerCase();
  name = name.toLowerCase();
  var typeRegistry = Blockly.registry.typeMap_[type];
  if (!typeRegistry) {
    console.warn('No type "' + type + '" found');
    return null;
  }
  if (!typeRegistry[name]) {
    console.warn('No name "' + name + '" with type "' + type + '" found');
    return null;
  }
  return typeRegistry[name];
};
