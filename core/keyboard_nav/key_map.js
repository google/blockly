/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
 * https://developers.google.com/blockly/
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

/**
 * Holds the serialized key to key action mapping.
 * @type {Object<string, Blockly.Action>}
 */
Blockly.user.keyMap.map_ = {};

/**
 * List of modifier keys checked when serializing the key event.
 * @type {Array<string>}
 */
Blockly.user.keyMap.modifierKeys = ['Shift','Control','Alt','Meta'];

/**
 * Update the key map to contain the new action.
 * @param {!string} keyCode The key code serialized by the serializeKeyEvent.
 * @param {!Blockly.Action} action The action to be executed when the keys
 *     corresponding to the serialized key code is pressed.
 * @package
 */
Blockly.user.keyMap.setActionForKey = function(keyCode, action) {
  var oldKey = Blockly.user.keyMap.getKeyByActionName(action.name);
  // If the action already exists in the key map remove it and add the new mapping.
  if (oldKey) {
    delete Blockly.user.keyMap.map_[oldKey];
  }
  Blockly.user.keyMap.map_[keyCode] = action;
};

/**
 * Creates a new key map.
 * @param {Object<string, Blockly.Action>} keyMap The object holding the key
 *     to action mapping.
 * @package
 */
Blockly.user.keyMap.setKeyMap = function(keyMap) {
  Blockly.user.keyMap.map_ = keyMap;
};

/**
 * Gets the current key map.
 * @return {Object<string,Blockly.Action>} The object holding the key to
 *     action mapping.
 * @package
 */
Blockly.user.keyMap.getKeyMap = function() {
  var mapClone = {};
  var keys = Object.keys(Blockly.user.keyMap.map_);
  for (var i = 0, key; key = keys[i]; i++) {
    var action = Blockly.user.keyMap.map_[key];
    mapClone[key] = new Blockly.Action(action.name, action.desc, action.func);
  }
  return mapClone;
};

/**
 * Get the action by the serialized key code.
 * @param {string} keyCode The serialized key code.
 * @return {Blockly.Action|undefined} The action holding the function to
 *     call when the given keyCode is used or undefined if no action exists.
 * @package
 */
Blockly.user.keyMap.getActionByKeyCode = function(keyCode) {
  return Blockly.user.keyMap.map_[keyCode];
};

/**
 * Get the serialized key that corresponds to the action name.
 * @param {!string} actionName The name of the action.
 * @return {string} The serialized key or null if the action does not have
 *     a key mapping.
 * @package
 */
Blockly.user.keyMap.getKeyByActionName = function(actionName) {
  var keys = Object.keys(Blockly.user.keyMap.map_);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var action = Blockly.user.keyMap.map_[key];
    if (actionName === action.name) {
      return key;
    }
  }
  return null;
};

/**
 * Serialize the key event.
 * @param {!Event} e A key up event holding the key code.
 * @return {!string} A string containing the serialized key event.
 */
Blockly.user.keyMap.serializeKeyEvent = function(e) {
  var modifierKeys = Blockly.user.keyMap.modifierKeys;
  var key = '';
  for (var i = 0, keyName; keyName = modifierKeys[i]; i++) {
    if (e.getModifierState(keyName)) {
      key += keyName;
    }
  }
  key += e.keyCode;
  console.log(key);
  return key;
};

/**
 * Creates the default key map.
 * @return {!Object<string,Blockly.Action>} An object holding the default key
 *     to action mapping.
 */
Blockly.user.keyMap.createDefaultKeyMap = function() {
  var map = {};
  map[goog.events.KeyCodes.W] = Blockly.Navigation.ACTION_PREVIOUS;
  map[goog.events.KeyCodes.A] = Blockly.Navigation.ACTION_OUT;
  map[goog.events.KeyCodes.S] = Blockly.Navigation.ACTION_NEXT;
  map[goog.events.KeyCodes.D] = Blockly.Navigation.ACTION_IN;
  map[goog.events.KeyCodes.I] = Blockly.Navigation.ACTION_INSERT;
  map[goog.events.KeyCodes.ENTER] = Blockly.Navigation.ACTION_MARK;
  map[goog.events.KeyCodes.X] = Blockly.Navigation.ACTION_DISCONNECT;
  map[goog.events.KeyCodes.T] = Blockly.Navigation.ACTION_TOOLBOX;
  map[goog.events.KeyCodes.E] = Blockly.Navigation.ACTION_EXIT;
  map[goog.events.KeyCodes.ESC] = Blockly.Navigation.ACTION_EXIT;
  return map;
};
