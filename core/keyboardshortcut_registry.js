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
 * TODO: Remove all Blockly.Action types.
 * TODO: How is this not a circular dependency with KeyboardShortcutItems?
 */
Blockly.KeyboardShortcutRegistry = function() {

  // Singleton instance should be registered once.
  Blockly.KeyboardShortcutRegistry.registry = this;

  /**
   * Registry of all keyboard shortcuts, keyed by serialized key code.
   * @type {!Object<string, !Array<!Blockly.KeyboardShortcutRegistry.KeyboardShortcut>>}
   * @private
   */
  this.registry_ = {};
  Blockly.KeyboardShortcutItems.registerDefaultShortcuts();
  Blockly.navigation.registerNavigationShortcuts();
};

/**
 * Enum of valid modifiers.
 * @enum {string}
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
 * @param {string} keyCode The key code for the keyboard shortcut. If registering a key code with a
 *     modifier (ex: ctrl + c) use Blockly.KeyboardShortcutRegistry.registry.createSerializedKey;
 * @param {!Blockly.KeyboardShortcutRegistry.KeyboardShortcut} shortcut The shortcut for this
 *     key code.
 * @param {boolean=} opt_allowOverrides True to prevent a warning when overriding an already
 *     registered item.
 * @public
 */
Blockly.KeyboardShortcutRegistry.prototype.register = function(
    keyCode, shortcut, opt_allowOverrides) {
  var shortcuts = this.registry_[keyCode];
  if (!shortcuts) {
    shortcuts = [];
  } else if (!opt_allowOverrides) {
    var warningString = shortcut.name + ' collides with:';
    for (var i = 0, shortcut; (shortcut = shortcuts[i]); i++) {
      warningString += ' ' + shortcut.name;
    }
    console.warn(warningString);
  }
  shortcuts.unshift(shortcut);
  this.registry_[keyCode] = shortcuts;
};

/**
 * Unregisters a keyboard shortcut registered with the given keyCode. If the same shortcut is
 * registered under different key codes this method will need to be called for each key code.
 * @param {string} keyCode The serialized key code.
 * @param {string} shortcutName The name of the shortcut to unregister.
 * @public
 */
Blockly.KeyboardShortcutRegistry.prototype.unregister = function(keyCode, shortcutName) {
  var shortcuts = this.registry_[keyCode];
  for (var i = 0, shortcut; (shortcut = shortcuts[i]); i++) {
    if (shortcut.name == shortcutName) {
      shortcuts.splice(i, 1);
    }
  }
  if (shortcuts.length == 0) {
    delete shortcuts[keyCode];
  }
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
  var actions = this.getKeyboardShortcuts(key);
  if (!actions) {
    return false;
  }
  for (var i = 0, action; (action = actions[i]); i++) {
    // TODO: Check if I should be doing a bind here.
    if (!action.preconditionFn || action.preconditionFn(workspace)) {
      // If the key has been handled, stop processing actions.
      // TODO: Do we really need this action? "this" is technically the action.
      if (action.callback(workspace, e, action)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Creates a new key map.
 * @param {!Object<string, !Blockly.KeyboardShortcutRegistry.KeyboardShortcut>} registry The object
 * holding key codes to Blockly.KeyboardShortcutRegistry.KeyboardShortcut.
 * @public
 * TODO: Set this up so people can add a batch of key maps???
 */
Blockly.KeyboardShortcutRegistry.prototype.setRegistry = function(registry) {
  this.registry_ = registry;
};

/**
 * Gets the current key map.
 * @return {Object<string,!Array<!Blockly.KeyboardShortcutRegistry.KeyboardShortcut>>} The object
 * holding key codes to Blockly.KeyboardShortcutRegistry.KeyboardShortcut.
 * @public
 */
Blockly.KeyboardShortcutRegistry.prototype.getRegistry = function() {
  var map = {};
  Blockly.utils.object.mixin(map, this.registry_);
  return map;
};

/**
 * Get the action by the serialized key code.
 * @param {string} keyCode The serialized key code.
 * @return {!Array<!Blockly.KeyboardShortcutRegistry.KeyboardShortcut>|undefined} The list of
 *     shortcuts to call when the given keyCode is used. Undefined if no shortcuts exist.
 * @public
 */
Blockly.KeyboardShortcutRegistry.prototype.getKeyboardShortcuts = function(keyCode) {
  return this.registry_[keyCode];
};

/**
 * Gets the serialized key code that the action is registered under.
 * @param {!Blockly.KeyboardShortcutRegistry.KeyboardShortcut} shortcutName The name of the
 *     shortcut.
 * @return {?string} The serialized key or null if the shortcut does not exist.
 * @public
 */
Blockly.KeyboardShortcutRegistry.prototype.getKeyByAction = function(shortcutName) {
  var keys = Object.keys(this.registry_);
  for (var i = 0, key; (key = keys[i]); i++) {
    if (this.registry_[key].name === shortcutName) {
      return key;
    }
  }
  return null;
};

/**
 * Serialize the key event.
 * @param {!KeyboardEvent} e A key up event holding the key code.
 * @return {string} A string containing the serialized key event.
 * @package
 */
Blockly.KeyboardShortcutRegistry.prototype.serializeKeyEvent = function(e) {
  var modifiers = Blockly.utils.object.values(Blockly.KeyboardShortcutRegistry.modifierKeys);
  var key = '';
  for (var i = 0, keyName; (keyName = modifiers[i]); i++) {
    if (e.getModifierState(keyName)) {
      key += keyName;
    }
  }
  key += e.keyCode;
  return key;
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
 * Create the serialized key code that will be used in the key map.
 * @param {number} keyCode Number code representing the key.
 * @param {!Array.<string>} modifiers List of modifiers to be used with the key.
 *     All valid modifiers can be found in the Blockly.KeyboardShortcutRegistry.modifierKeys.
 * @return {string} The serialized key code for the given modifiers and key.
 * TODO: Use the same format as vs code. Only if it helps in the key maps demo.
 */
Blockly.KeyboardShortcutRegistry.prototype.createSerializedKey = function(keyCode, modifiers) {
  var key = '';
  var validModifiers = Blockly.utils.object.values(Blockly.KeyboardShortcutRegistry.modifierKeys);
  this.checkModifiers_(modifiers, validModifiers);
  for (var i = 0, validModifier; (validModifier = validModifiers[i]); i++) {
    if (modifiers.indexOf(validModifier) > -1) {
      key += validModifier;
    }
  }
  key += keyCode;
  return key;
};

// Creates and assigns the singleton instance.
new Blockly.KeyboardShortcutRegistry();
