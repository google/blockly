/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The namespace used to keep track of keyboard shortcuts and the
 * key codes used to execute those shortcuts.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.ShortcutRegistry');

goog.require('Blockly.utils.KeyCodes');
goog.require('Blockly.utils.object');

goog.requireType('Blockly.Workspace');


/**
 * Class for the registry of keyboard shortcuts. This is intended to be a
 * singleton. You should not create a new instance, and only access this class
 * from Blockly.ShortcutRegistry.registry.
 * @constructor
 */
Blockly.ShortcutRegistry = function() {
  // Singleton instance should be registered once.
  Blockly.ShortcutRegistry.registry = this;

  /**
   * Registry of all keyboard shortcuts, keyed by name of shortcut.
   * @type {!Object<string, !Blockly.ShortcutRegistry.KeyboardShortcut>}
   * @private
   */
  this.registry_ = Object.create(null);

  /**
   * Map of key codes to an array of shortcut names.
   * @type {!Object<string, !Array<string>>}
   * @private
   */
  this.keyMap_ = Object.create(null);
};

/**
 * Enum of valid modifiers.
 * @enum {!Blockly.utils.KeyCodes<number>}
 */
Blockly.ShortcutRegistry.modifierKeys = {
  'Shift': Blockly.utils.KeyCodes.SHIFT,
  'Control': Blockly.utils.KeyCodes.CTRL,
  'Alt': Blockly.utils.KeyCodes.ALT,
  'Meta': Blockly.utils.KeyCodes.META
};

/**
 * A keyboard shortcut.
 * @typedef {{
 *    callback: ((function(!Blockly.Workspace, Event,
 * !Blockly.ShortcutRegistry.KeyboardShortcut):boolean)|undefined),
 *    name: string,
 *    preconditionFn: ((function(!Blockly.Workspace):boolean)|undefined),
 *    metadata: (Object|undefined)
 * }}
 */
Blockly.ShortcutRegistry.KeyboardShortcut;

/**
 * Registers a keyboard shortcut.
 * @param {!Blockly.ShortcutRegistry.KeyboardShortcut} shortcut The
 *     shortcut for this key code.
 * @param {boolean=} opt_allowOverrides True to prevent a warning when
 *     overriding an already registered item.
 * @throws {Error} if a shortcut with the same name already exists.
 * @public
 */
Blockly.ShortcutRegistry.prototype.register = function(
    shortcut, opt_allowOverrides) {
  var registeredShortcut = this.registry_[shortcut.name];
  if (registeredShortcut && !opt_allowOverrides) {
    throw new Error(
        'Shortcut with name "' + shortcut.name + '" already exists.');
  }
  this.registry_[shortcut.name] = shortcut;
};

/**
 * Unregisters a keyboard shortcut registered with the given key code. This will
 * also remove any key mappings that reference this shortcut.
 * @param {string} shortcutName The name of the shortcut to unregister.
 * @return {boolean} True if an item was unregistered, false otherwise.
 * @public
 */
Blockly.ShortcutRegistry.prototype.unregister = function(shortcutName) {
  var shortcut = this.registry_[shortcutName];

  if (!shortcut) {
    console.warn(
        'Keyboard shortcut with name "' + shortcutName + '" not found.');
    return false;
  }

  this.removeAllKeyMappings(shortcutName);

  delete this.registry_[shortcutName];
  return true;
};

/**
 * Adds a mapping between a keycode and a keyboard shortcut.
 * @param {string|Blockly.utils.KeyCodes} keyCode The key code for the keyboard
 *     shortcut. If registering a key code with a modifier (ex: ctrl+c) use
 *     Blockly.ShortcutRegistry.registry.createSerializedKey;
 * @param {string} shortcutName The name of the shortcut to execute when the
 *     given keycode is pressed.
 * @param {boolean=} opt_allowCollision True to prevent an error when adding a
 *     shortcut to a key that is already mapped to a shortcut.
 * @throws {Error} if the given key code is already mapped to a shortcut.
 * @public
 */
Blockly.ShortcutRegistry.prototype.addKeyMapping = function(
    keyCode, shortcutName, opt_allowCollision) {
  keyCode = String(keyCode);
  var shortcutNames = this.keyMap_[keyCode];
  if (shortcutNames && !opt_allowCollision) {
    throw new Error(
        'Shortcut with name "' + shortcutName + '" collides with shortcuts ' +
        shortcutNames.toString());
  } else if (shortcutNames && opt_allowCollision) {
    shortcutNames.unshift(shortcutName);
  } else {
    this.keyMap_[keyCode] = [shortcutName];
  }
};

/**
 * Removes a mapping between a keycode and a keyboard shortcut.
 * @param {string} keyCode The key code for the keyboard shortcut. If
 *     registering a key code with a modifier (ex: ctrl+c) use
 *     Blockly.ShortcutRegistry.registry.createSerializedKey;
 * @param {string} shortcutName The name of the shortcut to execute when the
 *     given keycode is pressed.
 * @param {boolean=} opt_quiet True to not console warn when there is no
 *     shortcut to remove.
 * @return {boolean} True if a key mapping was removed, false otherwise.
 * @public
 */
Blockly.ShortcutRegistry.prototype.removeKeyMapping = function(
    keyCode, shortcutName, opt_quiet) {
  var shortcutNames = this.keyMap_[keyCode];

  if (!shortcutNames && !opt_quiet) {
    console.warn(
        'No keyboard shortcut with name "' + shortcutName +
        '" registered with key code "' + keyCode + '"');
    return false;
  }

  var shortcutIdx = shortcutNames.indexOf(shortcutName);
  if (shortcutIdx > -1) {
    shortcutNames.splice(shortcutIdx, 1);
    if (shortcutNames.length == 0) {
      delete this.keyMap_[keyCode];
    }
    return true;
  }
  if (!opt_quiet) {
    console.warn('No keyboard shortcut with name "' + shortcutName +
        '" registered with key code "' + keyCode + '"');
  }
  return false;
};

/**
 * Removes all the key mappings for a shortcut with the given name.
 * Useful when changing the default key mappings and the key codes registered to the shortcut are
 * unknown.
 * @param {string} shortcutName The name of the shortcut to remove from the key map.
 * @public
 */
Blockly.ShortcutRegistry.prototype.removeAllKeyMappings = function(shortcutName) {
  for (var keyCode in this.keyMap_) {
    this.removeKeyMapping(keyCode, shortcutName, true);
  }
};

/**
 * Sets the key map. Setting the key map will override any default key mappings.
 * @param {!Object<string, !Array<string>>} keyMap The object with key code to
 *     shortcut names.
 * @public
 */
Blockly.ShortcutRegistry.prototype.setKeyMap = function(keyMap) {
  this.keyMap_ = keyMap;
};

/**
 * Gets the current key map.
 * @return {!Object<string,!Array<!Blockly.ShortcutRegistry.KeyboardShortcut>>}
 *     The object holding key codes to Blockly.ShortcutRegistry.KeyboardShortcut.
 * @public
 */
Blockly.ShortcutRegistry.prototype.getKeyMap = function() {
  return Blockly.utils.object.deepMerge(Object.create(null), this.keyMap_);
};

/**
 * Gets the registry of keyboard shortcuts.
 * @return {!Object<string, !Blockly.ShortcutRegistry.KeyboardShortcut>}
 *     The registry of keyboard shortcuts.
 * @public
 */
Blockly.ShortcutRegistry.prototype.getRegistry = function() {
  return Blockly.utils.object.deepMerge(Object.create(null), this.registry_);
};

/**
 * Handles key down events.
 * @param {!Blockly.Workspace} workspace The main workspace where the event was
 *     captured.
 * @param {!Event} e The key down event.
 * @return {boolean} True if the event was handled, false otherwise.
 * @public
 */
Blockly.ShortcutRegistry.prototype.onKeyDown = function(workspace, e) {
  var key = this.serializeKeyEvent_(e);
  var shortcutNames = this.getShortcutNamesByKeyCode(key);
  if (!shortcutNames) {
    return false;
  }
  for (var i = 0, shortcutName; (shortcutName = shortcutNames[i]); i++) {
    var shortcut = this.registry_[shortcutName];
    if (!shortcut.preconditionFn || shortcut.preconditionFn(workspace)) {
      // If the key has been handled, stop processing shortcuts.
      if (shortcut.callback && shortcut.callback(workspace, e, shortcut)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Gets the shortcuts registered to the given key code.
 * @param {string} keyCode The serialized key code.
 * @return {!Array<string>|undefined} The list of shortcuts to call when the
 *     given keyCode is used. Undefined if no shortcuts exist.
 * @public
 */
Blockly.ShortcutRegistry.prototype.getShortcutNamesByKeyCode = function(
    keyCode) {
  return this.keyMap_[keyCode] || [];
};

/**
 * Gets the serialized key codes that the shortcut with the given name is
 * registered under.
 * @param {string} shortcutName The name of the shortcut.
 * @return {!Array<string>} An array with all the key codes the shortcut is
 *     registered under.
 * @public
 */
Blockly.ShortcutRegistry.prototype.getKeyCodesByShortcutName = function(
    shortcutName) {
  var keys = [];
  for (var keyCode in this.keyMap_) {
    var shortcuts = this.keyMap_[keyCode];
    var shortcutIdx = shortcuts.indexOf(shortcutName);
    if (shortcutIdx > -1) {
      keys.push(keyCode);
    }
  }
  return keys;
};

/**
 * Serializes a key event.
 * @param {!Event} e A key down event.
 * @return {string} The serialized key code for the given event.
 * @private
 */
Blockly.ShortcutRegistry.prototype.serializeKeyEvent_ = function(e) {
  var serializedKey = '';
  for (var modifier in Blockly.ShortcutRegistry.modifierKeys) {
    if (e.getModifierState(modifier)) {
      if (serializedKey != '') {
        serializedKey += '+';
      }
      serializedKey += modifier;
    }
  }
  if (serializedKey != '' && e.keyCode) {
    serializedKey = serializedKey + '+' + e.keyCode;
  } else if (e.keyCode) {
    serializedKey = e.keyCode.toString();
  }
  return serializedKey;
};

/**
 * Checks whether any of the given modifiers are not valid.
 * @param {!Array<string>} modifiers List of modifiers to be used with the key.
 * @throws {Error} if the modifier is not in the valid modifiers list.
 * @private
 */
Blockly.ShortcutRegistry.prototype.checkModifiers_ = function(
    modifiers) {
  var validModifiers = Blockly.utils.object.values(
      Blockly.ShortcutRegistry.modifierKeys);
  for (var i = 0, modifier; (modifier = modifiers[i]); i++) {
    if (validModifiers.indexOf(modifier) < 0) {
      throw new Error(modifier + ' is not a valid modifier key.');
    }
  }
};

/**
 * Creates the serialized key code that will be used in the key map.
 * @param {number} keyCode Number code representing the key.
 * @param {?Array<string>} modifiers List of modifier key codes to be used with
 *     the key. All valid modifiers can be found in the
 *     Blockly.ShortcutRegistry.modifierKeys.
 * @return {string} The serialized key code for the given modifiers and key.
 * @public
 */
Blockly.ShortcutRegistry.prototype.createSerializedKey = function(
    keyCode, modifiers) {
  var serializedKey = '';

  if (modifiers) {
    this.checkModifiers_(modifiers);
    for (var modifier in Blockly.ShortcutRegistry.modifierKeys) {
      var modifierKeyCode =
          Blockly.ShortcutRegistry.modifierKeys[modifier];
      if (modifiers.indexOf(modifierKeyCode) > -1) {
        if (serializedKey != '') {
          serializedKey += '+';
        }
        serializedKey += modifier;
      }
    }
  }

  if (serializedKey != '' && keyCode) {
    serializedKey = serializedKey + '+' + keyCode;
  } else if (keyCode) {
    serializedKey = keyCode.toString();
  }
  return serializedKey;
};

// Creates and assigns the singleton instance.
new Blockly.ShortcutRegistry();
