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

goog.requireType('Blockly.blockRendering.Renderer');
goog.requireType('Blockly.Cursor');
goog.requireType('Blockly.Events.Abstract');
goog.requireType('Blockly.Field');
goog.requireType('Blockly.IBlockDragger');
goog.requireType('Blockly.IConnectionChecker');
goog.requireType('Blockly.IFlyout');
goog.requireType('Blockly.IMetricsManager');
goog.requireType('Blockly.IToolbox');
goog.requireType('Blockly.Options');
goog.requireType('Blockly.Theme');
goog.requireType('Blockly.ToolboxItem');


/**
 * A map of maps. With the keys being the type and name of the class we are
 * registering and the value being the constructor function.
 * e.g. {'field': {'field_angle': Blockly.FieldAngle}}
 *
 * @type {Object<string, Object<string, function(new:?)>>}
 */
Blockly.registry.typeMap_ = Object.create(null);

/**
 * The string used to register the default class for a type of plugin.
 * @type {string}
 */
Blockly.registry.DEFAULT = 'default';

/**
 * A name with the type of the element stored in the generic.
 * @param {string} name The name of the registry type.
 * @constructor
 * @template T
 */
Blockly.registry.Type = function(name) {
  /**
   * @type {string}
   * @private
   */
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

/** @type {!Blockly.registry.Type<Blockly.IConnectionChecker>} */
Blockly.registry.Type.CONNECTION_CHECKER =
    new Blockly.registry.Type('connectionChecker');

/** @type {!Blockly.registry.Type<Blockly.Cursor>} */
Blockly.registry.Type.CURSOR = new Blockly.registry.Type('cursor');

/** @type {!Blockly.registry.Type<Blockly.Events.Abstract>} */
Blockly.registry.Type.EVENT = new Blockly.registry.Type('event');

/** @type {!Blockly.registry.Type<Blockly.Field>} */
Blockly.registry.Type.FIELD = new Blockly.registry.Type('field');

/** @type {!Blockly.registry.Type<Blockly.blockRendering.Renderer>} */
Blockly.registry.Type.RENDERER = new Blockly.registry.Type('renderer');

/** @type {!Blockly.registry.Type<Blockly.IToolbox>} */
Blockly.registry.Type.TOOLBOX = new Blockly.registry.Type('toolbox');

/** @type {!Blockly.registry.Type<Blockly.Theme>} */
Blockly.registry.Type.THEME = new Blockly.registry.Type('theme');

/** @type {!Blockly.registry.Type<Blockly.ToolboxItem>} */
Blockly.registry.Type.TOOLBOX_ITEM = new Blockly.registry.Type('toolboxItem');

/** @type {!Blockly.registry.Type<Blockly.IFlyout>} */
Blockly.registry.Type.FLYOUTS_VERTICAL_TOOLBOX =
    new Blockly.registry.Type('flyoutsVerticalToolbox');

/** @type {!Blockly.registry.Type<Blockly.IFlyout>} */
Blockly.registry.Type.FLYOUTS_HORIZONTAL_TOOLBOX =
    new Blockly.registry.Type('flyoutsHorizontalToolbox');

/** @type {!Blockly.registry.Type<Blockly.IMetricsManager>} */
Blockly.registry.Type.METRICS_MANAGER =
    new Blockly.registry.Type('metricsManager');

/** @type {!Blockly.registry.Type<Blockly.IBlockDragger>} */
Blockly.registry.Type.BLOCK_DRAGGER =
    new Blockly.registry.Type('blockDragger');

/**
 * Registers a class based on a type and name.
 * @param {string|!Blockly.registry.Type<T>} type The type of the plugin.
 *     (e.g. Field, Renderer)
 * @param {string} name The plugin's name. (Ex. field_angle, geras)
 * @param {?function(new:T, ...?)|Object} registryItem The class or object to
 *     register.
 * @param {boolean=} opt_allowOverrides True to prevent an error when overriding
 *     an already registered item.
 * @throws {Error} if the type or name is empty, a name with the given type has
 *     already been registered, or if the given class or object is not valid for
 * it's type.
 * @template T
 */
Blockly.registry.register = function(
    type, name, registryItem, opt_allowOverrides) {
  if ((!(type instanceof Blockly.registry.Type) && typeof type != 'string') ||
      String(type).trim() == '') {
    throw Error(
        'Invalid type "' + type + '". The type must be a' +
        ' non-empty string or a Blockly.registry.Type.');
  }
  type = String(type).toLowerCase();

  if ((typeof name != 'string') || (name.trim() == '')) {
    throw Error(
        'Invalid name "' + name + '". The name must be a' +
        ' non-empty string.');
  }
  name = name.toLowerCase();
  if (!registryItem) {
    throw Error('Can not register a null value');
  }
  var typeRegistry = Blockly.registry.typeMap_[type];
  // If the type registry has not been created, create it.
  if (!typeRegistry) {
    typeRegistry = Blockly.registry.typeMap_[type] = Object.create(null);
  }

  // Validate that the given class has all the required properties.
  Blockly.registry.validate_(type, registryItem);

  // Don't throw an error if opt_allowOverrides is true.
  if (!opt_allowOverrides && typeRegistry[name]) {
    throw Error(
        'Name "' + name + '" with type "' + type + '" already registered.');
  }
  typeRegistry[name] = registryItem;
};

/**
 * Checks the given registry item for properties that are required based on the
 * type.
 * @param {string} type The type of the plugin. (e.g. Field, Renderer)
 * @param {Function|Object} registryItem A class or object that we are checking
 *     for the required properties.
 * @private
 */
Blockly.registry.validate_ = function(type, registryItem) {
  switch (type) {
    case String(Blockly.registry.Type.FIELD):
      if (typeof registryItem.fromJson != 'function') {
        throw Error('Type "' + type + '" must have a fromJson function');
      }
      break;
  }
};

/**
 * Unregisters the registry item with the given type and name.
 * @param {string|!Blockly.registry.Type<T>} type The type of the plugin.
 *     (e.g. Field, Renderer)
 * @param {string} name The plugin's name. (Ex. field_angle, geras)
 * @template T
 */
Blockly.registry.unregister = function(type, name) {
  type = String(type).toLowerCase();
  name = name.toLowerCase();
  var typeRegistry = Blockly.registry.typeMap_[type];
  if (!typeRegistry || !typeRegistry[name]) {
    console.warn('Unable to unregister [' + name + '][' + type + '] from the ' +
      'registry.');
    return;
  }
  delete Blockly.registry.typeMap_[type][name];
};

/**
 * Gets the registry item for the given name and type. This can be either a
 * class or an object.
 * @param {string|!Blockly.registry.Type<T>} type The type of the plugin.
 *     (e.g. Field, Renderer)
 * @param {string} name The plugin's name. (Ex. field_angle, geras)
 * @param {boolean=} opt_throwIfMissing Whether or not to throw an error if we
 *     are unable to find the plugin.
 * @return {?function(new:T, ...?)|Object} The class or object with the given
 *     name and type or null if none exists.
 * @template T
 */
Blockly.registry.getItem_ = function(type, name, opt_throwIfMissing) {
  type = String(type).toLowerCase();
  name = name.toLowerCase();
  var typeRegistry = Blockly.registry.typeMap_[type];
  if (!typeRegistry || !typeRegistry[name]) {
    var msg = 'Unable to find [' + name + '][' + type + '] in the registry.';
    if (opt_throwIfMissing) {
      throw new Error(msg + ' You must require or register a ' + type +
        ' plugin.');
    } else {
      console.warn(msg);
    }
    return null;
  }
  return typeRegistry[name];
};

/**
 * Returns whether or not the registry contains an item with the given type and
 * name.
 * @param {string|!Blockly.registry.Type<T>} type The type of the plugin.
 *     (e.g. Field, Renderer)
 * @param {string} name The plugin's name. (Ex. field_angle, geras)
 * @return {boolean} True if the registry has an item with the given type and
 *     name, false otherwise.
 * @template T
 */
Blockly.registry.hasItem = function(type, name) {
  type = String(type).toLowerCase();
  name = name.toLowerCase();
  var typeRegistry = Blockly.registry.typeMap_[type];
  if (!typeRegistry) {
    return false;
  }
  return !!(typeRegistry[name]);
};

/**
 * Gets the class for the given name and type.
 * @param {string|!Blockly.registry.Type<T>} type The type of the plugin.
 *     (e.g. Field, Renderer)
 * @param {string} name The plugin's name. (Ex. field_angle, geras)
 * @param {boolean=} opt_throwIfMissing Whether or not to throw an error if we
 *     are unable to find the plugin.
 * @return {?function(new:T, ...?)} The class with the given name and type or
 *     null if none exists.
 * @template T
 */
Blockly.registry.getClass = function(type, name, opt_throwIfMissing) {
  return /** @type {?function(new:T, ...?)} */ (
    Blockly.registry.getItem_(type, name, opt_throwIfMissing));
};

/**
 * Gets the object for the given name and type.
 * @param {string|!Blockly.registry.Type<T>} type The type of the plugin.
 *     (e.g. Category)
 * @param {string} name The plugin's name. (Ex. logic_category)
 * @param {boolean=} opt_throwIfMissing Whether or not to throw an error if we
 *     are unable to find the object.
 * @return {?T} The object with the given name and type or null if none exists.
 * @template T
 */
Blockly.registry.getObject = function(type, name, opt_throwIfMissing) {
  return /** @type {T} */ (
    Blockly.registry.getItem_(type, name, opt_throwIfMissing));
};

/**
 * Gets the class from Blockly options for the given type.
 * This is used for plugins that override a built in feature. (e.g. Toolbox)
 * @param {!Blockly.registry.Type<T>} type The type of the plugin.
 * @param {!Blockly.Options} options The option object to check for the given
 *     plugin.
 * @param {boolean=} opt_throwIfMissing Whether or not to throw an error if we
 *     are unable to find the plugin.
 * @return {?function(new:T, ...?)} The class for the plugin.
 * @template T
 */
Blockly.registry.getClassFromOptions = function(type, options,
    opt_throwIfMissing) {
  var typeName = type.toString();
  var plugin = options.plugins[typeName] || Blockly.registry.DEFAULT;

  // If the user passed in a plugin class instead of a registered plugin name.
  if (typeof plugin == 'function') {
    return plugin;
  }
  return Blockly.registry.getClass(type, plugin, opt_throwIfMissing);
};
