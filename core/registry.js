/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview .
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.registry');


Blockly.registry.typeMap_ = {};

// TODO: Add enum for all the types.


Blockly.registry.register = function(type, name, registryClass) {
  if ((typeof type != 'string') || (type.trim() == '')) {
    throw Error('Invalid type "' + type + '". The type must be a' +
      ' non-empty string.');
  }

  if ((typeof name != 'string') || (name.trim() == '')) {
    throw Error('Invalid name "' + name + '". The name must be a' +
      ' non-empty string.');
  }
  type = type.toLowerCase();
  name = name.toLowerCase();
  var typeRegistry = Blockly.registry.typeMap_[type];
  // If the type registry has not been created, create it.
  if (!typeRegistry) {
    typeRegistry = Blockly.registry.typeMap_[type] = {};
  }
  // If the name already exists throw an error
  if (typeRegistry[name]) {
    throw Error('Name "' + name + '" with type "' + type + '" already registered.');
  }
  Blockly.registry.validate_(type, registryClass);
  typeRegistry[name] = registryClass;
};

Blockly.registry.validate_ = function(type, registryClass) {
  if (type == 'field') {
    if (!registryClass || (typeof registryClass.fromJson != 'function')) {
      throw Error('Field "' + registryClass + '" must have a fromJson function');
    }
  } else if (type == 'toolbox') {
    // TODO: Check if it implements an interface. Seems like this would not be trivial.
    if (!registryClass) {
      throw Error('Toolbox "' + registryClass + '" must exist');
    }
  }
};

Blockly.registry.unregister = function(type, name) {
  type = type.toLowerCase();
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
  // TODO: Double check this deletes the correct thing.
  delete Blockly.registry.typeMap_[type][name];
};

/**
 * Get the class for the given name and type.
 * @param {string} type The type of the plugin. (Ex: Field, Toolbox)
 * @param {string} name The name of the plugin. (Ex: field_angle)
 * @return {Object} The class with the given name and type or null if none exists.
 */
Blockly.registry.getClass = function(type, name) {
  type = type.toLowerCase();
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

/**
 * Used for all plugins that have a built in option.
 * @param {!Blockly.Options} options The set of options for a given workspace.
 * @param {string} type The type of the plugin.
 * @return {Object} The class for the plugin.
 * @package
 */
Blockly.registry.getClassFromOptions = function(options, type) {
  var registryClassName = options.plugins[type] || options.plugins[type.toLowerCase()] || 'builtIn';
  return Blockly.registry.getClass(type, registryClassName);
};
