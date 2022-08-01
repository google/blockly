/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview This file is a universal registry that provides generic methods
 *    for registering and unregistering different types of classes.
 */
'use strict';

/**
 * This file is a universal registry that provides generic methods
 *    for registering and unregistering different types of classes.
 * @namespace Blockly.registry
 */
goog.module('Blockly.registry');

/* eslint-disable-next-line no-unused-vars */
const {Abstract} = goog.requireType('Blockly.Events.Abstract');
/* eslint-disable-next-line no-unused-vars */
const {Cursor} = goog.requireType('Blockly.Cursor');
/* eslint-disable-next-line no-unused-vars */
const {Field} = goog.requireType('Blockly.Field');
/* eslint-disable-next-line no-unused-vars */
const {IBlockDragger} = goog.requireType('Blockly.IBlockDragger');
/* eslint-disable-next-line no-unused-vars */
const {IConnectionChecker} = goog.requireType('Blockly.IConnectionChecker');
/* eslint-disable-next-line no-unused-vars */
const {IFlyout} = goog.requireType('Blockly.IFlyout');
/* eslint-disable-next-line no-unused-vars */
const {IMetricsManager} = goog.requireType('Blockly.IMetricsManager');
/* eslint-disable-next-line no-unused-vars */
const {ISerializer} = goog.requireType('Blockly.serialization.ISerializer');
/* eslint-disable-next-line no-unused-vars */
const {IToolbox} = goog.requireType('Blockly.IToolbox');
/* eslint-disable-next-line no-unused-vars */
const {Options} = goog.requireType('Blockly.Options');
/* eslint-disable-next-line no-unused-vars */
const {Renderer} = goog.requireType('Blockly.blockRendering.Renderer');
/* eslint-disable-next-line no-unused-vars */
const {Theme} = goog.requireType('Blockly.Theme');
/* eslint-disable-next-line no-unused-vars */
const {ToolboxItem} = goog.requireType('Blockly.ToolboxItem');


/**
 * A map of maps. With the keys being the type and name of the class we are
 * registering and the value being the constructor function.
 * e.g. {'field': {'field_angle': Blockly.FieldAngle}}
 *
 * @type {!Object<string, !Object<string, (function(new:?)|!Object)>>}
 */
const typeMap = Object.create(null);
exports.TEST_ONLY = {typeMap};

/**
 * A map of maps. With the keys being the type and caseless name of the class we
 * are registring, and the value being the most recent cased name for that
 * registration.
 * @type {!Object<string, !Object<string, string>>}
 */
const nameMap = Object.create(null);

/**
 * The string used to register the default class for a type of plugin.
 * @type {string}
 * @alias Blockly.registry.DEFAULT
 */
const DEFAULT = 'default';
exports.DEFAULT = DEFAULT;

/**
 * A name with the type of the element stored in the generic.
 * @template T
 * @alias Blockly.registry.Type
 */
class Type {
  /**
   * @param {string} name The name of the registry type.
   */
  constructor(name) {
    /**
     * @type {string}
     * @private
     */
    this.name_ = name;
  }

  /**
   * Returns the name of the type.
   * @return {string} The name.
   */
  toString() {
    return this.name_;
  }
}
exports.Type = Type;


/** @type {!Type<IConnectionChecker>} */
Type.CONNECTION_CHECKER = new Type('connectionChecker');

/** @type {!Type<Cursor>} */
Type.CURSOR = new Type('cursor');

/** @type {!Type<Abstract>} */
Type.EVENT = new Type('event');

/** @type {!Type<Field>} */
Type.FIELD = new Type('field');

/** @type {!Type<Renderer>} */
Type.RENDERER = new Type('renderer');

/** @type {!Type<IToolbox>} */
Type.TOOLBOX = new Type('toolbox');

/** @type {!Type<Theme>} */
Type.THEME = new Type('theme');

/** @type {!Type<ToolboxItem>} */
Type.TOOLBOX_ITEM = new Type('toolboxItem');

/** @type {!Type<IFlyout>} */
Type.FLYOUTS_VERTICAL_TOOLBOX = new Type('flyoutsVerticalToolbox');

/** @type {!Type<IFlyout>} */
Type.FLYOUTS_HORIZONTAL_TOOLBOX = new Type('flyoutsHorizontalToolbox');

/** @type {!Type<IMetricsManager>} */
Type.METRICS_MANAGER = new Type('metricsManager');

/** @type {!Type<IBlockDragger>} */
Type.BLOCK_DRAGGER = new Type('blockDragger');

/**
 * @type {!Type<ISerializer>}
 * @package
 */
Type.SERIALIZER = new Type('serializer');

/**
 * Registers a class based on a type and name.
 * @param {string|!Type<T>} type The type of the plugin.
 *     (e.g. Field, Renderer)
 * @param {string} name The plugin's name. (Ex. field_angle, geras)
 * @param {?function(new:T, ...?)|Object} registryItem The class or object to
 *     register.
 * @param {boolean=} opt_allowOverrides True to prevent an error when overriding
 *     an already registered item.
 * @throws {Error} if the type or name is empty, a name with the given type has
 *     already been registered, or if the given class or object is not valid for
 *     its type.
 * @template T
 * @alias Blockly.registry.register
 */
const register = function(type, name, registryItem, opt_allowOverrides) {
  if ((!(type instanceof Type) && typeof type !== 'string') ||
      String(type).trim() === '') {
    throw Error(
        'Invalid type "' + type + '". The type must be a' +
        ' non-empty string or a Blockly.registry.Type.');
  }
  type = String(type).toLowerCase();

  if ((typeof name !== 'string') || (name.trim() === '')) {
    throw Error(
        'Invalid name "' + name + '". The name must be a' +
        ' non-empty string.');
  }
  const caselessName = name.toLowerCase();
  if (!registryItem) {
    throw Error('Can not register a null value');
  }
  let typeRegistry = typeMap[type];
  let nameRegistry = nameMap[type];
  // If the type registry has not been created, create it.
  if (!typeRegistry) {
    typeRegistry = typeMap[type] = Object.create(null);
    nameRegistry = nameMap[type] = Object.create(null);
  }

  // Validate that the given class has all the required properties.
  validate(type, registryItem);

  // Don't throw an error if opt_allowOverrides is true.
  if (!opt_allowOverrides && typeRegistry[caselessName]) {
    throw Error(
        'Name "' + caselessName + '" with type "' + type +
        '" already registered.');
  }
  typeRegistry[caselessName] = registryItem;
  nameRegistry[caselessName] = name;
};
exports.register = register;

/**
 * Checks the given registry item for properties that are required based on the
 * type.
 * @param {string} type The type of the plugin. (e.g. Field, Renderer)
 * @param {Function|Object} registryItem A class or object that we are checking
 *     for the required properties.
 */
const validate = function(type, registryItem) {
  switch (type) {
    case String(Type.FIELD):
      if (typeof registryItem.fromJson !== 'function') {
        throw Error('Type "' + type + '" must have a fromJson function');
      }
      break;
  }
};

/**
 * Unregisters the registry item with the given type and name.
 * @param {string|!Type<T>} type The type of the plugin.
 *     (e.g. Field, Renderer)
 * @param {string} name The plugin's name. (Ex. field_angle, geras)
 * @template T
 * @alias Blockly.registry.unregister
 */
const unregister = function(type, name) {
  type = String(type).toLowerCase();
  name = name.toLowerCase();
  const typeRegistry = typeMap[type];
  if (!typeRegistry || !typeRegistry[name]) {
    console.warn(
        'Unable to unregister [' + name + '][' + type + '] from the ' +
        'registry.');
    return;
  }
  delete typeMap[type][name];
  delete nameMap[type][name];
};
exports.unregister = unregister;

/**
 * Gets the registry item for the given name and type. This can be either a
 * class or an object.
 * @param {string|!Type<T>} type The type of the plugin.
 *     (e.g. Field, Renderer)
 * @param {string} name The plugin's name. (Ex. field_angle, geras)
 * @param {boolean=} opt_throwIfMissing Whether or not to throw an error if we
 *     are unable to find the plugin.
 * @return {?function(new:T, ...?)|Object} The class or object with the given
 *     name and type or null if none exists.
 * @template T
 */
const getItem = function(type, name, opt_throwIfMissing) {
  type = String(type).toLowerCase();
  name = name.toLowerCase();
  const typeRegistry = typeMap[type];
  if (!typeRegistry || !typeRegistry[name]) {
    const msg = 'Unable to find [' + name + '][' + type + '] in the registry.';
    if (opt_throwIfMissing) {
      throw new Error(
          msg + ' You must require or register a ' + type + ' plugin.');
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
 * @param {string|!Type<T>} type The type of the plugin.
 *     (e.g. Field, Renderer)
 * @param {string} name The plugin's name. (Ex. field_angle, geras)
 * @return {boolean} True if the registry has an item with the given type and
 *     name, false otherwise.
 * @template T
 * @alias Blockly.registry.hasItem
 */
const hasItem = function(type, name) {
  type = String(type).toLowerCase();
  name = name.toLowerCase();
  const typeRegistry = typeMap[type];
  if (!typeRegistry) {
    return false;
  }
  return !!(typeRegistry[name]);
};
exports.hasItem = hasItem;

/**
 * Gets the class for the given name and type.
 * @param {string|!Type<T>} type The type of the plugin.
 *     (e.g. Field, Renderer)
 * @param {string} name The plugin's name. (Ex. field_angle, geras)
 * @param {boolean=} opt_throwIfMissing Whether or not to throw an error if we
 *     are unable to find the plugin.
 * @return {?function(new:T, ...?)} The class with the given name and type or
 *     null if none exists.
 * @template T
 * @alias Blockly.registry.getClass
 */
const getClass = function(type, name, opt_throwIfMissing) {
  return /** @type {?function(new:T, ...?)} */ (
      getItem(type, name, opt_throwIfMissing));
};
exports.getClass = getClass;

/**
 * Gets the object for the given name and type.
 * @param {string|!Type<T>} type The type of the plugin.
 *     (e.g. Category)
 * @param {string} name The plugin's name. (Ex. logic_category)
 * @param {boolean=} opt_throwIfMissing Whether or not to throw an error if we
 *     are unable to find the object.
 * @return {?T} The object with the given name and type or null if none exists.
 * @template T
 * @alias Blockly.registry.getObject
 */
const getObject = function(type, name, opt_throwIfMissing) {
  return /** @type {T} */ (getItem(type, name, opt_throwIfMissing));
};
exports.getObject = getObject;

/**
 * Returns a map of items registered with the given type.
 * @param {string|!Type<T>} type The type of the plugin. (e.g. Category)
 * @param {boolean} opt_cased Whether or not to return a map with cased keys
 *     (rather than caseless keys). False by default.
 * @param {boolean=} opt_throwIfMissing Whether or not to throw an error if we
 *     are unable to find the object. False by default.
 * @return {?Object<string, ?T|?function(new:T, ...?)>} A map of objects with
 *     the given type, or null if none exists.
 * @template T
 * @alias Blockly.registry.getAllItems
 */
const getAllItems = function(type, opt_cased, opt_throwIfMissing) {
  type = String(type).toLowerCase();
  const typeRegistry = typeMap[type];
  if (!typeRegistry) {
    const msg = `Unable to find [${type}] in the registry.`;
    if (opt_throwIfMissing) {
      throw new Error(`${msg} You must require or register a ${type} plugin.`);
    } else {
      console.warn(msg);
    }
    return null;
  }
  if (!opt_cased) {
    return typeRegistry;
  }
  const nameRegistry = nameMap[type];
  const casedRegistry = Object.create(null);
  const keys = Object.keys(typeRegistry);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    casedRegistry[nameRegistry[key]] = typeRegistry[key];
  }
  return casedRegistry;
};
exports.getAllItems = getAllItems;

/**
 * Gets the class from Blockly options for the given type.
 * This is used for plugins that override a built in feature. (e.g. Toolbox)
 * @param {!Type<T>} type The type of the plugin.
 * @param {!Options} options The option object to check for the given
 *     plugin.
 * @param {boolean=} opt_throwIfMissing Whether or not to throw an error if we
 *     are unable to find the plugin.
 * @return {?function(new:T, ...?)} The class for the plugin.
 * @template T
 * @alias Blockly.registry.getClassFromOptions
 */
const getClassFromOptions = function(type, options, opt_throwIfMissing) {
  const typeName = type.toString();
  const plugin = options.plugins[typeName] || DEFAULT;

  // If the user passed in a plugin class instead of a registered plugin name.
  if (typeof plugin === 'function') {
    return plugin;
  }
  return getClass(type, plugin, opt_throwIfMissing);
};
exports.getClassFromOptions = getClassFromOptions;
