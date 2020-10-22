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

goog.provide('Blockly.KeyboardShortcutRegistry');

goog.require('Blockly.KeyboardShortcutItems');
goog.require('Blockly.navigation');
goog.require('Blockly.utils.object');


/**
 * Class for the registry of keyboard shortcuts. This is intended to be a singleton. You should
 * not create a new instance, and only access this class from
 * Blockly.KeyboardShortcutRegistry.registry.
 * @constructor
 * TODO: How is this not a circular dependency with KeyboardShortcutItems?
 */
Blockly.KeyboardShortcutRegistry = function() {

  // Singleton instance should be registered once.
  Blockly.KeyboardShortcutRegistry.registry = this;

  /**
   * Registry of all keyboard shortcuts, keyed by name of shortcut.
   * @type {!Object<string, !Blockly.KeyboardShortcutRegistry.KeyboardShortcut>}
   * @private
   */
  this.registry_ = {};

  /**
   * Registry of keyboard shortcut names, keyed by serialized key code.
   * @type {!Object<string, !Array<string>>}
   * @private
   */
  this.keyMap_ = {};

  Blockly.KeyboardShortcutItems.registerDefaultShortcuts();
  Blockly.navigation.registerNavigationShortcuts();
};

/**
 * Enum of valid modifiers.
 * @enum {string}
 * TODO: Should this just be the keyCode? Instead of them having to use a name?
 */
Blockly.KeyboardShortcutRegistry.modifierKeys = {
  SHIFT: 'Shift',
  CONTROL: 'Control',
  ALT: 'Alt',
  META: 'Meta'
};

/**
 * A keyboard shortcut.
 * @typedef {{
 *    callback: function(!Blockly.Workspace, !Blockly.KeyboardShortcutRegistry.KeyboardShortcut),
 *    name: string,
 *    preconditionFn: function(!Blockly.Workspace):boolean,
 *    metadata: Object
 * }}
*/
Blockly.KeyboardShortcutRegistry.KeyboardShortcut;

/**
 * Registers a keyboard shortcut.
 * @param {!Blockly.KeyboardShortcutRegistry.KeyboardShortcut} shortcut The shortcut for this
 *     key code.
 * @param {boolean=} opt_allowOverrides True to prevent a warning when overriding an already
 *     registered item.
 * @public
 */
Blockly.KeyboardShortcutRegistry.prototype.register = function(shortcut, opt_allowOverrides) {
  var registeredShortcut = this.registry_[shortcut.name];
  if (registeredShortcut && !opt_allowOverrides) {
    throw new Error('Shortcut with name "' + shortcut.name + '" already exists.');
  }
  this.registry_[shortcut.name] = shortcut;
};

/**
 * Unregisters a keyboard shortcut registered with the given key code. This will also remove any key
 *     mappings that reference this shortcut.
 * @param {string} shortcutName The name of the shortcut to unregister.
 * @public
 */
Blockly.KeyboardShortcutRegistry.prototype.unregister = function(shortcutName) {
  var shortcut = this.registry_[shortcutName];

  if (!shortcut) {
    console.warn('Keyboard shortcut with name "' + shortcutName + '" not found.');
  }

  // Remove all key mappings with this shortcut.
  for (var keyCode in this.keyMap_) {
    this.removeKeyMapping(keyCode, shortcutName, true);
  }

  delete this.registry_[shortcutName];
};

/**
 * Adds a mapping between a keycode and a keyboard shortcut.
 * @param {string} keyCode The key code for the keyboard shortcut. If registering a key code with a
 *     modifier (ex: ctrl + c) use Blockly.KeyboardShortcutRegistry.registry.createSerializedKey;
 * @param {string} shortcutName The name of the shortcut to execute when the given keycode is
 *     pressed.
 * @param {boolean=} opt_allowCollision True to prevent a warning when overriding an already
 *     registered item.
 * @public
 */
Blockly.KeyboardShortcutRegistry.prototype.addKeyMapping = function(
    keyCode, shortcutName, opt_allowCollision) {
  var shortcutNames = this.keyMap_[keyCode];
  if (shortcutNames && !opt_allowCollision) {
    throw new Error('Shortcut with name "' + shortcutName + '" collides with shortcuts ' + shortcutNames.toString());
  } else if (shortcutNames && opt_allowCollision) {
    shortcutNames.unshift(shortcutName);
  } else {
    this.keyMap_[keyCode] = [shortcutName];
  }
};

/**
 * Adds a mapping between a keycode and a keyboard shortcut.
 * @param {string} keyCode The key code for the keyboard shortcut. If registering a key code with a
 *     modifier (ex: ctrl + c) use Blockly.KeyboardShortcutRegistry.registry.createSerializedKey;
 * @param {string} shortcutName The name of the shortcut to execute when the given keycode is
 *     pressed.
 * @param {boolean=} opt_quiet True to not console warn when there is no shortcut to remove.
 * @public
 */
Blockly.KeyboardShortcutRegistry.prototype.removeKeyMapping = function(
    keyCode, shortcutName, opt_quiet) {
  var shortcutNames = this.keyMap_[keyCode];
  if (!shortcutNames) {
    console.warn('No keyboard shortcut with name "' + shortcutName + '" registered with key code "' + keyCode + '"');
    return;
  }
  var shortcutIdx = shortcutNames.indexOf(shortcutName);
  if (shortcutIdx > -1) {
    shortcutNames.splice(shortcutIdx, 1);
    if (shortcutNames.length == 0) {
      delete this.keyMap_[keyCode];
    }
  } else if (!opt_quiet) {
    console.warn('No keyboard shortcut with name "' + shortcutName + '" registered with key code "' + keyCode + '"');
  }
};

/**
 * Creates a new key map.
 * @param {!Object<string, !Array<string>>} keyMap The object with key code to shortcut names.
 * @public
 */
Blockly.KeyboardShortcutRegistry.prototype.setKeyMap = function(keyMap) {
  this.keyMap_ = keyMap;
};

/**
 * Gets the current key map.
 * @return {Object<string,!Array<!Blockly.KeyboardShortcutRegistry.KeyboardShortcut>>} The object
 *     holding key codes to Blockly.KeyboardShortcutRegistry.KeyboardShortcut.
 * @public
 */
Blockly.KeyboardShortcutRegistry.prototype.getKeyMap = function() {
  var keyMap = {};
  Blockly.utils.object.mixin(keyMap, this.keyMap_);
  return keyMap;
};

/**
 * Gets the registry of keyboard shortcuts.
 * @return {!Object<string, !Blockly.KeyboardShortcutRegistry.KeyboardShortcut>} The registry of
 *     keyboard shortcuts.
 */
Blockly.KeyboardShortcutRegistry.prototype.getRegistry = function() {
  var registry = {};
  Blockly.utils.object.mixin(registry, this.registry_);
  return registry;
};

/**
 * Handles key down events.
 * @param {!Blockly.Workspace} workspace The main workspace when the event was captured.
 * @param {!Event} e The key down event.
 * @return {boolean} True if the event was handled, false otherwise.
 * @public
 */
Blockly.KeyboardShortcutRegistry.prototype.onKeyDown = function(workspace, e) {
  var key = this.serializeKeyEvent(e);
  var shortcutNames = this.getKeyboardShortcuts(key);
  if (!shortcutNames) {
    return false;
  }
  for (var i = 0, shortcutName; (shortcutName = shortcutNames[i]); i++) {
    var shortcut = this.registry_[shortcutName];
    if (!shortcut.preconditionFn || shortcut.preconditionFn(workspace)) {
      // If the key has been handled, stop processing shortcuts.
      if (shortcut.callback(workspace, e, shortcut)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Gets the shortcuts registered to the given key code.
 * @param {string} keyCode The serialized key code.
 * @return {!Array<!Blockly.KeyboardShortcutRegistry.KeyboardShortcut>|undefined} The list of
 *     shortcuts to call when the given keyCode is used. Undefined if no shortcuts exist.
 * @public
 */
Blockly.KeyboardShortcutRegistry.prototype.getKeyboardShortcuts = function(keyCode) {
  return this.keyMap_[keyCode] || [];
};

/**
 * Gets the serialized key codes that the shortcut is registered under.
 * @param {!Blockly.KeyboardShortcutRegistry.KeyboardShortcut} shortcutName The name of the
 *     shortcut.
 * @return {!Array<string>} An array with all the key codes the shortcut is registered under.
 * @public
 */
Blockly.KeyboardShortcutRegistry.prototype.getKeysByShortcutName = function(shortcutName) {
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
 * Serializes the key event.
 * @param {!KeyboardEvent} e A key up event holding the key code.
 * @return {string} A string containing the serialized key event.
 * @package
 */
Blockly.KeyboardShortcutRegistry.prototype.serializeKeyEvent = function(e) {
  var modifiers = Blockly.utils.object.values(Blockly.KeyboardShortcutRegistry.modifierKeys);
  var serializedKey = '';
  for (var i = 0, modifier; (modifier = modifiers[i]); i++) {
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
    serializedKey = e.keyCode;
  }
  return serializedKey;
};

/**
 * Checks whether any of the given modifiers are not valid.
 * @param {!Array.<string>} modifiers List of modifiers to be used with the key.
 * @param {!Array.<string>} validModifiers List of modifiers we support.
 * @throws {Error} if the modifier is not in the valid modifiers list.
 * @private
 */
Blockly.KeyboardShortcutRegistry.prototype.checkModifiers_ = function(modifiers, validModifiers) {
  for (var i = 0, modifier; (modifier = modifiers[i]); i++) {
    if (validModifiers.indexOf(modifier) < 0) {
      throw Error(modifier + ' is not a valid modifier key.');
    }
  }
};

/**
 * Creates the serialized key code that will be used in the key map.
 * @param {number} keyCode Number code representing the key.
 * @param {Array.<string>} modifiers List of modifiers to be used with the key.
 *     All valid modifiers can be found in the Blockly.KeyboardShortcutRegistry.modifierKeys.
 * @return {string} The serialized key code for the given modifiers and key.
 * @public
 */
Blockly.KeyboardShortcutRegistry.prototype.createSerializedKey = function(keyCode, modifiers) {
  var serializedKey = '';
  var validModifiers = Blockly.utils.object.values(Blockly.KeyboardShortcutRegistry.modifierKeys);
  if (modifiers) {
    this.checkModifiers_(modifiers, validModifiers);
    for (var i = 0, validModifier; (validModifier = validModifiers[i]); i++) {
      if (modifiers.indexOf(validModifier) > -1) {
        if (serializedKey != '') {
          serializedKey += '+';
        }
        serializedKey += validModifier;
      }
    }
  }

  if (serializedKey != '' && keyCode) {
    serializedKey = serializedKey + '+' + keyCode;
  } else if (keyCode) {
    serializedKey = keyCode;
  }
  return serializedKey;
};

// Creates and assigns the singleton instance.
new Blockly.KeyboardShortcutRegistry();
