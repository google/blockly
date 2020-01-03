/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview The namespace used to keep track of keyboard actions and the
 * key codes used to execute those actions.
 * This is used primarily for keyboard navigation.
 */
'use strict';

goog.provide('Blockly.user.keyMap');

// TODO: Fix circular dependency.
// goog.require('Blockly.navigation');
goog.require('Blockly.utils.KeyCodes');
goog.require('Blockly.utils.object');


/**
 * Holds the serialized key to key action mapping.
 * @type {!Object<string, Blockly.Action>}
 * @private
 */
Blockly.user.keyMap.map_ = {};

/**
 * Object holding valid modifiers.
 * @enum {string}
 */
Blockly.user.keyMap.modifierKeys = {
  SHIFT: 'Shift',
  CONTROL: 'Control',
  ALT: 'Alt',
  META: 'Meta'
};

/**
 * Update the key map to contain the new action.
 * @param {string} keyCode The key code serialized by the serializeKeyEvent.
 * @param {!Blockly.Action} action The action to be executed when the keys
 *     corresponding to the serialized key code is pressed.
 */
Blockly.user.keyMap.setActionForKey = function(keyCode, action) {
  var oldKey = Blockly.user.keyMap.getKeyByAction(action);
  // If the action already exists in the key map remove it and add the new mapping.
  if (oldKey) {
    delete Blockly.user.keyMap.map_[oldKey];
  }
  Blockly.user.keyMap.map_[keyCode] = action;
};

/**
 * Creates a new key map.
 * @param {!Object<string, Blockly.Action>} keyMap The object holding the key
 *     to action mapping.
 */
Blockly.user.keyMap.setKeyMap = function(keyMap) {
  Blockly.user.keyMap.map_ = keyMap;
};

/**
 * Gets the current key map.
 * @return {Object<string,Blockly.Action>} The object holding the key to
 *     action mapping.
 */
Blockly.user.keyMap.getKeyMap = function() {
  var map = {};
  Blockly.utils.object.mixin(map, Blockly.user.keyMap.map_);
  return map;
};

/**
 * Get the action by the serialized key code.
 * @param {string} keyCode The serialized key code.
 * @return {Blockly.Action|undefined} The action holding the function to
 *     call when the given keyCode is used or undefined if no action exists.
 */
Blockly.user.keyMap.getActionByKeyCode = function(keyCode) {
  return Blockly.user.keyMap.map_[keyCode];
};

/**
 * Get the serialized key that corresponds to the action.
 * @param {!Blockly.Action} action The action for which we want to get
 *     the key.
 * @return {?string} The serialized key or null if the action does not have
 *     a key mapping.
 */
Blockly.user.keyMap.getKeyByAction = function(action) {
  var keys = Object.keys(Blockly.user.keyMap.map_);
  for (var i = 0, key; (key = keys[i]); i++) {
    if (Blockly.user.keyMap.map_[key].name === action.name) {
      return key;
    }
  }
  return null;
};

/**
 * Serialize the key event.
 * @param {!Event} e A key up event holding the key code.
 * @return {string} A string containing the serialized key event.
 * @package
 */
Blockly.user.keyMap.serializeKeyEvent = function(e) {
  var modifiers = Blockly.utils.object.values(Blockly.user.keyMap.modifierKeys);
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
Blockly.user.keyMap.checkModifiers_ = function(modifiers, validModifiers) {
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
 *     All valid modifiers can be found in the Blockly.user.keyMap.modifierKeys.
 * @return {string} The serialized key code for the given modifiers and key.
 */
Blockly.user.keyMap.createSerializedKey = function(keyCode, modifiers) {
  var key = '';
  var validModifiers = Blockly.utils.object.values(Blockly.user.keyMap.modifierKeys);
  Blockly.user.keyMap.checkModifiers_(modifiers, validModifiers);
  for (var i = 0, validModifier; (validModifier = validModifiers[i]); i++) {
    if (modifiers.indexOf(validModifier) > -1) {
      key += validModifier;
    }
  }
  key += keyCode;
  return key;
};

/**
 * Creates the default key map.
 * @return {!Object<string,Blockly.Action>} An object holding the default key
 *     to action mapping.
 */
Blockly.user.keyMap.createDefaultKeyMap = function() {
  var map = {};
  var controlK = Blockly.user.keyMap.createSerializedKey(
      Blockly.utils.KeyCodes.K, [Blockly.user.keyMap.modifierKeys.CONTROL,
        Blockly.user.keyMap.modifierKeys.SHIFT]);
  var shiftW = Blockly.user.keyMap.createSerializedKey(
      Blockly.utils.KeyCodes.W, [Blockly.user.keyMap.modifierKeys.SHIFT]);
  var shiftA = Blockly.user.keyMap.createSerializedKey(
      Blockly.utils.KeyCodes.A, [Blockly.user.keyMap.modifierKeys.SHIFT]);
  var shiftS = Blockly.user.keyMap.createSerializedKey(
      Blockly.utils.KeyCodes.S, [Blockly.user.keyMap.modifierKeys.SHIFT]);
  var shiftD = Blockly.user.keyMap.createSerializedKey(
      Blockly.utils.KeyCodes.D, [Blockly.user.keyMap.modifierKeys.SHIFT]);

  map[Blockly.utils.KeyCodes.W] = Blockly.navigation.ACTION_PREVIOUS;
  map[Blockly.utils.KeyCodes.A] = Blockly.navigation.ACTION_OUT;
  map[Blockly.utils.KeyCodes.S] = Blockly.navigation.ACTION_NEXT;
  map[Blockly.utils.KeyCodes.D] = Blockly.navigation.ACTION_IN;
  map[Blockly.utils.KeyCodes.I] = Blockly.navigation.ACTION_INSERT;
  map[Blockly.utils.KeyCodes.ENTER] = Blockly.navigation.ACTION_MARK;
  map[Blockly.utils.KeyCodes.X] = Blockly.navigation.ACTION_DISCONNECT;
  map[Blockly.utils.KeyCodes.T] = Blockly.navigation.ACTION_TOOLBOX;
  map[Blockly.utils.KeyCodes.E] = Blockly.navigation.ACTION_EXIT;
  map[Blockly.utils.KeyCodes.ESC] = Blockly.navigation.ACTION_EXIT;
  map[controlK] = Blockly.navigation.ACTION_TOGGLE_KEYBOARD_NAV;
  map[shiftW] = Blockly.navigation.ACTION_MOVE_WS_CURSOR_UP;
  map[shiftA] = Blockly.navigation.ACTION_MOVE_WS_CURSOR_LEFT;
  map[shiftS] = Blockly.navigation.ACTION_MOVE_WS_CURSOR_DOWN;
  map[shiftD] = Blockly.navigation.ACTION_MOVE_WS_CURSOR_RIGHT;
  return map;
};
