/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The namespace used to keep track of keyboard actions and the
 * key codes used to execute those actions.
 * This is used primarily for keyboard navigation.
 */
'use strict';

goog.provide('Blockly.KeyboardShortcutRegistry');

goog.require('Blockly.KeyboardShortcutItems');
goog.require('Blockly.utils.KeyCodes');
goog.require('Blockly.utils.object');

/**
 *
 * @constructor
 */
Blockly.KeyboardShortcutRegistry = function() {
  Blockly.KeyboardShortcutRegistry.registry = this;

  /**
   * Holds the serialized key to array of actions.
   * @type {!Object<string, !Array<!Blockly.Action>>}
   * @private
   */
  this.registry_ = {};
  Blockly.KeyboardShortcutItems.registerDefaultShortcuts();
};

/**
 * Object holding valid modifiers.
 * @enum {string}
 * TODO: Figure out what other modifiers we need. Look at vs code.
 */
Blockly.KeyboardShortcutRegistry.modifierKeys = {
  SHIFT: 'Shift',
  CONTROL: 'Control',
  ALT: 'Alt',
  META: 'Meta'
};

/**
 * A
 * @param keyCode
 * @param action
 * @param opt_quiet
 */
Blockly.KeyboardShortcutRegistry.prototype.register = function(keyCode, action, opt_quiet) {
  var existingActions = this.registry_[keyCode];
  if (!existingActions) {
    existingActions = [];
  } else if (!opt_quiet) {
    var warningString = action.name + ' collides with:';
    for (var i = 0, existingAction; (existingAction = existingActions[i]); i++) {
      warningString += ' ' + existingAction.name;
    }
    console.warn(warningString);
  }
  existingActions.unshift(action);
  this.registry_[keyCode] = existingActions;
};

/**
 *
 * @param keyCode
 * @param actionName
 * TODO: Figure out whwat we need to unregister.
 */
Blockly.KeyboardShortcutRegistry.prototype.unregister = function(keyCode, actionName) {

};

/**
 *
 * @param workspace
 * @param e
 * @return {boolean}
 */
Blockly.KeyboardShortcutRegistry.prototype.onKeyDown = function(workspace, e) {
  var key = this.serializeKeyEvent(e);
  var actions = this.getActionsByKeyCode(key);
  if (!actions) {
    return false;
  }
  for (var i = 0, action; (action = actions[i]); i++) {
    // TODO: Check if I should be doing a bind here.
    if (action.preconditionFn && action.preconditionFn(workspace) || !action.preconditionFn) {
      // If the key has been handled, stop processing actions.
      if (action.callback(workspace, e, action)) {
        return true;
      }
    }
  }
};

/**
 * Creates a new key map.
 * @param {!Object<string, Blockly.Action>} keyMap The object holding the key
 *     to action mapping.
 * TODO: Set this up so people can add a batch of key maps.
 * TODO: Change the name to setRegistry?
 */
Blockly.KeyboardShortcutRegistry.prototype.setKeyMap = function(keyMap) {
  this.registry_ = keyMap;
};

/**
 * Gets the current key map.
 * @return {Object<string,!Array<!Blockly.Action>>} The object holding the key to
 *     list of actions.
 * TODO: Change the name to getRegistry?
 */
Blockly.KeyboardShortcutRegistry.prototype.getKeyMap = function() {
  var map = {};
  Blockly.utils.object.mixin(map, this.registry_);
  return map;
};

/**
 * Get the action by the serialized key code.
 * @param {string} keyCode The serialized key code.
 * @return {!Array<!Blockly.Action>|undefined} The list of actions to
 *     call when the given keyCode is used or undefined if no action exists.
 */
Blockly.KeyboardShortcutRegistry.prototype.getActionsByKeyCode = function(keyCode) {
  return this.registry_[keyCode];
};

/**
 * Get the serialized key that corresponds to the action.
 * @param {!Blockly.Action} action The action for which we want to get
 *     the key.
 * @return {?string} The serialized key or null if the action does not have
 *     a key mapping.
 */
Blockly.KeyboardShortcutRegistry.prototype.getKeyByAction = function(action) {
  var keys = Object.keys(this.registry_);
  for (var i = 0, key; (key = keys[i]); i++) {
    if (this.registry_[key].name === action.name) {
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
 * TODO: Use the same format as vs code.
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
