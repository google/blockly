/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * The namespace used to keep track of keyboard shortcuts and the
 * key codes used to execute those shortcuts.
 *
 * @class
 */
// Former goog.module ID: Blockly.ShortcutRegistry

import {KeyCodes} from './utils/keycodes.js';
import * as object from './utils/object.js';
import {WorkspaceSvg} from './workspace_svg.js';

/**
 * Class for the registry of keyboard shortcuts. This is intended to be a
 * singleton. You should not create a new instance, and only access this class
 * from ShortcutRegistry.registry.
 */
export class ShortcutRegistry {
  static readonly registry = new ShortcutRegistry();

  /** Registry of all keyboard shortcuts, keyed by name of shortcut. */
  private shortcuts = new Map<string, KeyboardShortcut>();

  /** Map of key codes to an array of shortcut names. */
  private keyMap = new Map<string, string[]>();

  /** Resets the existing ShortcutRegistry singleton. */
  private constructor() {
    this.reset();
  }

  /** Clear and recreate the registry and keyMap. */
  reset() {
    this.shortcuts.clear();
    this.keyMap.clear();
  }

  /**
   * Registers a keyboard shortcut.
   *
   * @param shortcut The shortcut for this key code.
   * @param opt_allowOverrides True to prevent a warning when overriding an
   *     already registered item.
   * @throws {Error} if a shortcut with the same name already exists.
   */
  register(shortcut: KeyboardShortcut, opt_allowOverrides?: boolean) {
    const registeredShortcut = this.shortcuts.get(shortcut.name);
    if (registeredShortcut && !opt_allowOverrides) {
      throw new Error(`Shortcut named "${shortcut.name}" already exists.`);
    }
    this.shortcuts.set(shortcut.name, shortcut);

    const keyCodes = shortcut.keyCodes;
    if (keyCodes && keyCodes.length > 0) {
      for (let i = 0; i < keyCodes.length; i++) {
        this.addKeyMapping(
          keyCodes[i],
          shortcut.name,
          !!shortcut.allowCollision,
        );
      }
    }
  }

  /**
   * Unregisters a keyboard shortcut registered with the given key code. This
   * will also remove any key mappings that reference this shortcut.
   *
   * @param shortcutName The name of the shortcut to unregister.
   * @returns True if an item was unregistered, false otherwise.
   */
  unregister(shortcutName: string): boolean {
    const shortcut = this.shortcuts.get(shortcutName);

    if (!shortcut) {
      console.warn(`Keyboard shortcut named "${shortcutName}" not found.`);
      return false;
    }

    this.removeAllKeyMappings(shortcutName);

    this.shortcuts.delete(shortcutName);
    return true;
  }

  /**
   * Adds a mapping between a keycode and a keyboard shortcut.
   *
   * @param keyCode The key code for the keyboard shortcut. If registering a key
   *     code with a modifier (ex: ctrl+c) use
   *     ShortcutRegistry.registry.createSerializedKey;
   * @param shortcutName The name of the shortcut to execute when the given
   *     keycode is pressed.
   * @param opt_allowCollision True to prevent an error when adding a shortcut
   *     to a key that is already mapped to a shortcut.
   * @throws {Error} if the given key code is already mapped to a shortcut.
   */
  addKeyMapping(
    keyCode: string | number | KeyCodes,
    shortcutName: string,
    opt_allowCollision?: boolean,
  ) {
    keyCode = `${keyCode}`;
    const shortcutNames = this.keyMap.get(keyCode);
    if (shortcutNames && !opt_allowCollision) {
      throw new Error(
        `Shortcut named "${shortcutName}" collides with shortcuts "${shortcutNames}"`,
      );
    } else if (shortcutNames && opt_allowCollision) {
      shortcutNames.unshift(shortcutName);
    } else {
      this.keyMap.set(keyCode, [shortcutName]);
    }
  }

  /**
   * Removes a mapping between a keycode and a keyboard shortcut.
   *
   * @param keyCode The key code for the keyboard shortcut. If registering a key
   *     code with a modifier (ex: ctrl+c) use
   *     ShortcutRegistry.registry.createSerializedKey;
   * @param shortcutName The name of the shortcut to execute when the given
   *     keycode is pressed.
   * @param opt_quiet True to not console warn when there is no shortcut to
   *     remove.
   * @returns True if a key mapping was removed, false otherwise.
   */
  removeKeyMapping(
    keyCode: string,
    shortcutName: string,
    opt_quiet?: boolean,
  ): boolean {
    const shortcutNames = this.keyMap.get(keyCode);

    if (!shortcutNames) {
      if (!opt_quiet) {
        console.warn(
          `No keyboard shortcut named "${shortcutName}" registered with key code "${keyCode}"`,
        );
      }
      return false;
    }

    const shortcutIdx = shortcutNames.indexOf(shortcutName);
    if (shortcutIdx > -1) {
      shortcutNames.splice(shortcutIdx, 1);
      if (shortcutNames.length === 0) {
        this.keyMap.delete(keyCode);
      }
      return true;
    }
    if (!opt_quiet) {
      console.warn(
        `No keyboard shortcut named "${shortcutName}" registered with key code "${keyCode}"`,
      );
    }
    return false;
  }

  /**
   * Removes all the key mappings for a shortcut with the given name.
   * Useful when changing the default key mappings and the key codes registered
   * to the shortcut are unknown.
   *
   * @param shortcutName The name of the shortcut to remove from the key map.
   */
  removeAllKeyMappings(shortcutName: string) {
    for (const keyCode of this.keyMap.keys()) {
      this.removeKeyMapping(keyCode, shortcutName, true);
    }
  }

  /**
   * Sets the key map. Setting the key map will override any default key
   * mappings.
   *
   * @param newKeyMap The object with key code to shortcut names.
   */
  setKeyMap(newKeyMap: {[key: string]: string[]}) {
    this.keyMap.clear();
    for (const key in newKeyMap) {
      this.keyMap.set(key, newKeyMap[key]);
    }
  }

  /**
   * Gets the current key map.
   *
   * @returns The object holding key codes to ShortcutRegistry.KeyboardShortcut.
   */
  getKeyMap(): {[key: string]: string[]} {
    const legacyKeyMap: {[key: string]: string[]} = Object.create(null);
    for (const [key, value] of this.keyMap) {
      legacyKeyMap[key] = value;
    }
    return legacyKeyMap;
  }

  /**
   * Gets the registry of keyboard shortcuts.
   *
   * @returns The registry of keyboard shortcuts.
   */
  getRegistry(): {[key: string]: KeyboardShortcut} {
    const legacyRegistry: {[key: string]: KeyboardShortcut} =
      Object.create(null);
    for (const [key, value] of this.shortcuts) {
      legacyRegistry[key] = value;
    }
    return object.deepMerge(Object.create(null), legacyRegistry);
  }

  /**
   * Handles key down events.
   *
   * @param workspace The main workspace where the event was captured.
   * @param e The key down event.
   * @returns True if the event was handled, false otherwise.
   */
  onKeyDown(workspace: WorkspaceSvg, e: KeyboardEvent): boolean {
    const key = this.serializeKeyEvent_(e);
    const shortcutNames = this.getShortcutNamesByKeyCode(key);
    if (!shortcutNames) {
      return false;
    }
    for (let i = 0, shortcutName; (shortcutName = shortcutNames[i]); i++) {
      const shortcut = this.shortcuts.get(shortcutName);
      if (!shortcut?.preconditionFn || shortcut?.preconditionFn(workspace)) {
        // If the key has been handled, stop processing shortcuts.
        if (shortcut?.callback && shortcut?.callback(workspace, e, shortcut)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Gets the shortcuts registered to the given key code.
   *
   * @param keyCode The serialized key code.
   * @returns The list of shortcuts to call when the given keyCode is used.
   *     Undefined if no shortcuts exist.
   */
  getShortcutNamesByKeyCode(keyCode: string): string[] | undefined {
    return this.keyMap.get(keyCode) || [];
  }

  /**
   * Gets the serialized key codes that the shortcut with the given name is
   * registered under.
   *
   * @param shortcutName The name of the shortcut.
   * @returns An array with all the key codes the shortcut is registered under.
   */
  getKeyCodesByShortcutName(shortcutName: string): string[] {
    const keys = [];
    for (const [keyCode, shortcuts] of this.keyMap) {
      const shortcutIdx = shortcuts.indexOf(shortcutName);
      if (shortcutIdx > -1) {
        keys.push(keyCode);
      }
    }
    return keys;
  }

  /**
   * Serializes a key event.
   *
   * @param e A key down event.
   * @returns The serialized key code for the given event.
   */
  private serializeKeyEvent_(e: KeyboardEvent): string {
    let serializedKey = '';
    for (const modifier in ShortcutRegistry.modifierKeys) {
      if (e.getModifierState(modifier)) {
        if (serializedKey !== '') {
          serializedKey += '+';
        }
        serializedKey += modifier;
      }
    }
    if (serializedKey !== '' && e.keyCode) {
      serializedKey = serializedKey + '+' + e.keyCode;
    } else if (e.keyCode) {
      serializedKey = String(e.keyCode);
    }
    return serializedKey;
  }

  /**
   * Checks whether any of the given modifiers are not valid.
   *
   * @param modifiers List of modifiers to be used with the key.
   * @throws {Error} if the modifier is not in the valid modifiers list.
   */
  private checkModifiers_(modifiers: KeyCodes[]) {
    for (let i = 0, modifier; (modifier = modifiers[i]); i++) {
      if (!(modifier in ShortcutRegistry.modifierKeys)) {
        throw new Error(modifier + ' is not a valid modifier key.');
      }
    }
  }

  /**
   * Creates the serialized key code that will be used in the key map.
   *
   * @param keyCode Number code representing the key.
   * @param modifiers List of modifier key codes to be used with the key. All
   *     valid modifiers can be found in the ShortcutRegistry.modifierKeys.
   * @returns The serialized key code for the given modifiers and key.
   */
  createSerializedKey(keyCode: number, modifiers: KeyCodes[] | null): string {
    let serializedKey = '';

    if (modifiers) {
      this.checkModifiers_(modifiers);
      for (const modifier in ShortcutRegistry.modifierKeys) {
        const modifierKeyCode = (
          ShortcutRegistry.modifierKeys as AnyDuringMigration
        )[modifier];
        if (modifiers.indexOf(modifierKeyCode) > -1) {
          if (serializedKey !== '') {
            serializedKey += '+';
          }
          serializedKey += modifier;
        }
      }
    }

    if (serializedKey !== '' && keyCode) {
      serializedKey = serializedKey + '+' + keyCode;
    } else if (keyCode) {
      serializedKey = `${keyCode}`;
    }
    return serializedKey;
  }
}

export namespace ShortcutRegistry {
  export interface KeyboardShortcut {
    callback?: (p1: WorkspaceSvg, p2: Event, p3: KeyboardShortcut) => boolean;
    name: string;
    preconditionFn?: (p1: WorkspaceSvg) => boolean;
    metadata?: object;
    keyCodes?: (number | string)[];
    allowCollision?: boolean;
  }

  /** Supported modifiers. */
  export enum modifierKeys {
    Shift = KeyCodes.SHIFT,
    Control = KeyCodes.CTRL,
    Alt = KeyCodes.ALT,
    Meta = KeyCodes.META,
  }
}

export type KeyboardShortcut = ShortcutRegistry.KeyboardShortcut;
// No need to export ShorcutRegistry.modifierKeys from the module at this time
// because (1) it wasn't automatically converted by the automatic migration
// script, (2) the name doesn't follow the styleguide.
