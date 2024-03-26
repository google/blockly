/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Former goog.module ID: Blockly.registry

import type {Abstract} from './events/events_abstract.js';
import type {Field} from './field.js';
import type {IBlockDragger} from './interfaces/i_block_dragger.js';
import type {IConnectionChecker} from './interfaces/i_connection_checker.js';
import type {IFlyout} from './interfaces/i_flyout.js';
import type {IMetricsManager} from './interfaces/i_metrics_manager.js';
import type {IIcon} from './interfaces/i_icon.js';
import type {Input} from './inputs/input.js';
import type {ISerializer} from './interfaces/i_serializer.js';
import type {IToolbox} from './interfaces/i_toolbox.js';
import type {Cursor} from './keyboard_nav/cursor.js';
import type {Options} from './options.js';
import type {Renderer} from './renderers/common/renderer.js';
import type {Theme} from './theme.js';
import type {ToolboxItem} from './toolbox/toolbox_item.js';
import type {IPaster} from './interfaces/i_paster.js';
import type {ICopyData, ICopyable} from './interfaces/i_copyable.js';
import type {IConnectionPreviewer} from './interfaces/i_connection_previewer.js';

/**
 * A map of maps. With the keys being the type and name of the class we are
 * registering and the value being the constructor function.
 * e.g. {'field': {'field_angle': Blockly.FieldAngle}}
 */
const typeMap: {
  [key: string]: {
    [key: string]: (new () => AnyDuringMigration) | AnyDuringMigration;
  };
} = Object.create(null);
export const TEST_ONLY = {typeMap};

/**
 * A map of maps.  Record the case-insensitive version of each name.
 * e.g. {'field': {'field_angle': 'fIeLd_AnGle'}}
 * This enables an error to be thrown if a name of conflicting case is used.
 */
const noCaseNameMap: {
  [key: string]: {[key: string]: string}
} = Object.create(null);

/**
 * The string used to register the default class for a type of plugin.
 */
export const DEFAULT = 'default';

/**
 * A name with the type of the element stored in the generic.
 */
export class Type<_T> {
  /** @param name The name of the registry type. */
  constructor(private readonly name: string) {}

  /**
   * Returns the name of the type.
   *
   * @returns The name.
   */
  toString(): string {
    return this.name;
  }

  static CONNECTION_CHECKER = new Type<IConnectionChecker>('connectionChecker');

  static CONNECTION_PREVIEWER = new Type<IConnectionPreviewer>(
    'connectionPreviewer',
  );

  static CURSOR = new Type<Cursor>('cursor');

  static EVENT = new Type<Abstract>('event');

  static FIELD = new Type<Field>('field');

  static INPUT = new Type<Input>('input');

  static RENDERER = new Type<Renderer>('renderer');

  static TOOLBOX = new Type<IToolbox>('toolbox');

  static THEME = new Type<Theme>('theme');

  static TOOLBOX_ITEM = new Type<ToolboxItem>('toolboxItem');

  static FLYOUTS_VERTICAL_TOOLBOX = new Type<IFlyout>('flyoutsVerticalToolbox');

  static FLYOUTS_HORIZONTAL_TOOLBOX = new Type<IFlyout>(
    'flyoutsHorizontalToolbox',
  );

  static METRICS_MANAGER = new Type<IMetricsManager>('metricsManager');

  static BLOCK_DRAGGER = new Type<IBlockDragger>('blockDragger');

  /** @internal */
  static SERIALIZER = new Type<ISerializer>('serializer');

  /** @internal */
  static ICON = new Type<IIcon>('icon');

  /** @internal */
  static PASTER = new Type<IPaster<ICopyData, ICopyable<ICopyData>>>('paster');
}

/**
 * Registers a class based on a type and name.
 *
 * @param type The type of the plugin.
 *     (e.g. Field, Renderer)
 * @param name The plugin's name. (Ex. field_angle, geras)
 * @param registryItem The class or object to register.
 * @param opt_allowOverrides True to prevent an error when overriding an already
 *     registered item.
 * @throws {Error} if the type or name is empty, a name with the given type has
 *     already been registered, or if the given class or object is not valid for
 *     its type.
 */
export function register<T>(
  type: string | Type<T>,
  name: string,
  registryItem:
    | (new (...p1: AnyDuringMigration[]) => T)
    | null
    | AnyDuringMigration,
  opt_allowOverrides?: boolean,
): void {
  type = normalizeType(type);
  name = normalizeName(name);
  if (!registryItem) {
    throw Error('Can not register a null value');
  }
  let typeRegistry = typeMap[type];
  // If the type registry has not been created, create it.
  if (!typeRegistry) {
    typeRegistry = typeMap[type] = Object.create(null);
    noCaseNameMap[type] = Object.create(null);
  }

  // Validate that the given class has all the required properties.
  validateItem(type, registryItem);
  validateCase(type, name);

  // Don't throw an error if opt_allowOverrides is true.
  // Don't throw an error if the registryItem is not changing.
  if (
    !opt_allowOverrides &&
    typeRegistry[name] &&
    typeRegistry[name] !== registryItem
  ) {
    throw Error(`Name "${name}" with type "${type}" already registered`);
  }
  typeRegistry[name] = registryItem;
  noCaseNameMap[type][name.toLowerCase()] = name;
}

/**
 * Checks the given registry item for properties that are required based on the
 * type.
 *
 * @param type The type of the plugin. (e.g. Field, Renderer)
 * @param registryItem A class or object that we are checking for the required
 *     properties.
 */
function validateItem(type: string, registryItem: Function | AnyDuringMigration) {
  switch (type) {
    case String(Type.FIELD):
      if (typeof registryItem.fromJson !== 'function') {
        throw Error(`Type "${type}" must have a fromJson function`);
      }
      break;
  }
}

/**
 * Checks that the name hasn't been registered using a different case.
 *
 * @param type The type of the plugin. (e.g. Field, Renderer)
 * @param name The plugin's name. (Ex. field_angle, geras)
 */
function validateCase(type: string, name: string) {
  const caseName = noCaseNameMap[type]?.[name.toLowerCase()];
  if (caseName && caseName !== name) {
    throw Error(`Inconsistent case with name "${name}" vs "${caseName}"`);
  }
}

/**
 * Unregisters the registry item with the given type and name.
 *
 * @param type The type of the plugin.
 *     (e.g. Field, Renderer)
 * @param name The plugin's name. (Ex. field_angle, geras)
 */
export function unregister<T>(type: string | Type<T>, name: string) {
  type = normalizeType(type);
  name = normalizeName(name);
  validateCase(type, name);
  const typeRegistry = typeMap[type];
  if (!typeRegistry || !typeRegistry[name]) {
    console.warn(`Unable to unregister [${name}][${type}] from the registry`);
    return;
  }
  delete typeRegistry[name];
  delete noCaseNameMap[type][name.toLowerCase()];
}

/**
 * Gets the registry item for the given name and type. This can be either a
 * class or an object.
 *
 * @param type The type of the plugin.
 *     (e.g. Field, Renderer)
 * @param name The plugin's name. (Ex. field_angle, geras)
 * @param opt_throwIfMissing Whether or not to throw an error if we are unable
 *     to find the plugin.
 * @returns The class or object with the given name and type or null if none
 *     exists.
 */
function getItem<T>(
  type: string | Type<T>,
  name: string,
  opt_throwIfMissing?: boolean,
): (new (...p1: AnyDuringMigration[]) => T) | null | AnyDuringMigration {
  type = normalizeType(type);
  name = normalizeName(name);
  validateCase(type, name);
  const typeRegistry = typeMap[type];
  if (!typeRegistry || !typeRegistry[name]) {
    const msg = `Unable to find [${name}][${type}] in the registry.`;
    if (opt_throwIfMissing) {
      throw Error(`${msg} You must require or register a ${type} plugin`);
    } else {
      console.warn(msg);
    }
    return null;
  }
  return typeRegistry[name];
}

/**
 * Returns whether or not the registry contains an item with the given type and
 * name.
 *
 * @param type The type of the plugin.
 *     (e.g. Field, Renderer)
 * @param name The plugin's name. (Ex. field_angle, geras)
 * @returns True if the registry has an item with the given type and name, false
 *     otherwise.
 */
export function hasItem<T>(type: string | Type<T>, name: string): boolean {
  type = normalizeType(type);
  name = normalizeName(name);
  validateCase(type, name);
  const typeRegistry = typeMap[type];
  if (!typeRegistry) {
    return false;
  }
  return !!typeRegistry[name];
}

/**
 * Normalize a string to be used as a type.  Trim whitespaces and lowercase.
 *
 * @param name The type. (Ex. 'FiELd ')
 * @returns A normalized string. (Ex. 'field')
 */
function normalizeType(type: any): string {
  type = `${type}`.trim().toLowerCase();
  if (!type) throw Error('Empty type');
  return type;
}

/**
 * Normalize a string to be used as a key.  Trim whitespaces.
 *
 * @param name The key's name. (Ex. 'field_angle ')
 * @returns A normalized string. (Ex. 'field_angle')
 */
function normalizeName(name: string): string {
  if (typeof name !== 'string') throw Error('Invalid name');
  name = name.trim();
  if (!name) throw Error('Empty name');
  return name;
}

/**
 * Gets the class for the given name and type.
 *
 * @param type The type of the plugin.
 *     (e.g. Field, Renderer)
 * @param name The plugin's name. (Ex. field_angle, geras)
 * @param opt_throwIfMissing Whether or not to throw an error if we are unable
 *     to find the plugin.
 * @returns The class with the given name and type or null if none exists.
 */
export function getClass<T>(
  type: string | Type<T>,
  name: string,
  opt_throwIfMissing?: boolean,
): (new (...p1: AnyDuringMigration[]) => T) | null {
  return getItem(type, name, opt_throwIfMissing) as
    | (new (...p1: AnyDuringMigration[]) => T)
    | null;
}

/**
 * Gets the object for the given name and type.
 *
 * @param type The type of the plugin.
 *     (e.g. Category)
 * @param name The plugin's name. (Ex. logic_category)
 * @param opt_throwIfMissing Whether or not to throw an error if we are unable
 *     to find the object.
 * @returns The object with the given name and type or null if none exists.
 */
export function getObject<T>(
  type: string | Type<T>,
  name: string,
  opt_throwIfMissing?: boolean,
): T | null {
  return getItem(type, name, opt_throwIfMissing) as T;
}

/**
 * Returns a map of items registered with the given type.
 *
 * @param type The type of the plugin. (e.g. Category)
 * @param opt_cased Deprecated.
 * @param opt_throwIfMissing Whether or not to throw an error if we are unable
 *     to find the object. False by default.
 * @returns A map of objects with the given type, or null if none exists.
 */
export function getAllItems<T>(
  type: string | Type<T>,
  opt_cased?: any,
  opt_throwIfMissing?: boolean,
): {[key: string]: T | null | (new (...p1: AnyDuringMigration[]) => T)} | null {
  if (typeof opt_cased !== 'undefined') {
    console.warn('Blockly.registry.getAllItems deprecated "cased" argument');
  }
  type = normalizeType(type);
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
  return typeRegistry;
}

/**
 * Gets the class from Blockly options for the given type.
 * This is used for plugins that override a built in feature. (e.g. Toolbox)
 *
 * @param type The type of the plugin.
 * @param options The option object to check for the given plugin.
 * @param opt_throwIfMissing Whether or not to throw an error if we are unable
 *     to find the plugin.
 * @returns The class for the plugin.
 */
export function getClassFromOptions<T>(
  type: Type<T>,
  options: Options,
  opt_throwIfMissing?: boolean,
): (new (...p1: AnyDuringMigration[]) => T) | null {
  const plugin = options.plugins[String(type)] || DEFAULT;

  // If the user passed in a plugin class instead of a registered plugin name.
  if (typeof plugin === 'function') {
    return plugin;
  }
  return getClass(type, plugin, opt_throwIfMissing);
}
