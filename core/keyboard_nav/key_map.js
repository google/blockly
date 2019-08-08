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
 * @fileoverview The class representing a cursor.
 * Used primarily for keyboard navigation.
 */
'use strict';

goog.provide('Blockly.user.keyMap');

/**
 * Holds the key to action mapping.
 * @type {Object}
 */
Blockly.user.keyMap.map_ = {};

/**
 * Holds the list of key actions.
 * @type {Array<Blockly.KeyAction>}
 */
Blockly.user.keyMap.actions_ = [];

/**
 * Update the key map and actions array to contain the new action.
 * @param {!string} keyCode The key code serialized by the serializeKeyEvent.
 * @param {!Blockly.KeyAction} action The action to be executed when the keys
 *     corresponding to the serialized key code is pressed.
 * @package
 */
Blockly.user.keyMap.setActionForKey = function(keyCode, action) {
  var key = Blockly.user.keyMap.getKeyByActionName(action.name);
  // If the action already exists in the key map remove it and add the new mapping.
  if (key) {
    delete Blockly.user.keyMap.map_[key];
  }
  Blockly.user.keyMap.map_[keyCode] = action;
  // If the action is not in the actions array add it.
  if (Blockly.user.keyMap.actions_.indexOf(action) === -1) {
    Blockly.user.keyMap.actions_.push(action);
  }
};

/**
 * Creates a new key map and a new actions array.
 * @param {Object<string, Blockly.KeyAction>} keyMap The object holding the key
 *     to action mapping.
 * @package
 */
Blockly.user.keyMap.setKeyMap = function(keyMap) {
  var keys = Object.keys(keyMap);
  // Update the actions array to include any new actions found in the new key map.
  for (var i = 0; i < keys.length; i++) {
    var action = keyMap[keys[i]];
    if (Blockly.user.keyMap.actions_.indexOf(action) === -1) {
      Blockly.user.keyMap.actions_.push(action);
    }
  }
  Blockly.user.keyMap.map_ = keyMap;
};

/**
 * Get the key map.
 * @return {Object<string,Blockly.KeyAction>} The object holding the key to
 *     action mapping.
 * @package
 */
Blockly.user.keyMap.getKeyMap = function() {
  return Blockly.user.keyMap.map_;
};

/**
 * Get the action by the serialized key code.
 * @param {string} keyCode The serialized key code.
 * @return {Blockly.KeyAction|undefined} The key action holding the function to
 *     call or undefined if no action exists.
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
  var key = "";
  if (e.getModifierState('Shift')) {
    key += '+';
  }
  if (e.getModifierState('Control')) {
    key += 'ctrl';
  }
  if (e.getModifierState('Alt')) {
    key += 'alt';
  }
  if (e.getModifierState('Meta')) {
    key += 'meta';
  }
  key += e.keyCode;
  return key;
};

/**
 * Creates the default key map.
 * @return {!Object<string,Blockly.KeyAction>} The key is the serialized
 *     key event and the value is a Blockly.KeyAction.
 */
Blockly.user.keyMap.createDefaultKeyMap = function() {
  //Set W
  var wAction = new Blockly.KeyAction('previous', 'Goes to the previous location', function() {
    if (Blockly.Navigation.currentState_ === Blockly.Navigation.STATE_WS) {
      Blockly.Navigation.cursor_.prev();
    } else if (Blockly.Navigation.currentState_ === Blockly.Navigation.STATE_FLYOUT) {
      Blockly.Navigation.selectPreviousBlockInFlyout();
    } else if (Blockly.Navigation.currentState_ === Blockly.Navigation.STATE_TOOLBOX) {
      Blockly.Navigation.previousCategory();
    }
  });

  //Set A
  var aAction = new Blockly.KeyAction('out', 'Goes out', function() {
    if (Blockly.Navigation.currentState_ === Blockly.Navigation.STATE_WS) {
      Blockly.Navigation.cursor_.out();
    } else if (Blockly.Navigation.currentState_ === Blockly.Navigation.STATE_FLYOUT) {
      Blockly.Navigation.focusToolbox();
    } else if (Blockly.Navigation.currentState_ === Blockly.Navigation.STATE_TOOLBOX) {
      Blockly.Navigation.outCategory();
    }
  });

  //Set S
  var sAction = new Blockly.KeyAction('next', 'Goes to the next location', function() {
    if (Blockly.Navigation.currentState_ === Blockly.Navigation.STATE_WS) {
      Blockly.Navigation.cursor_.next();
    } else if (Blockly.Navigation.currentState_ === Blockly.Navigation.STATE_FLYOUT) {
      Blockly.Navigation.selectNextBlockInFlyout();
    } else if (Blockly.Navigation.currentState_ === Blockly.Navigation.STATE_TOOLBOX) {
      Blockly.Navigation.nextCategory();
    }
  });

  //Set D
  var dAction = new Blockly.KeyAction('in', 'Goes in', function() {
    if (Blockly.Navigation.currentState_ === Blockly.Navigation.STATE_WS) {
      Blockly.Navigation.cursor_.in();
    } else if (Blockly.Navigation.currentState_ === Blockly.Navigation.STATE_TOOLBOX) {
      Blockly.Navigation.inCategory();
    }
  });

  //Set I
  var iAction = new Blockly.KeyAction('insert',
      'Tries to connect the current location to the marked location', function() {
        if (Blockly.Navigation.currentState_ === Blockly.Navigation.STATE_WS) {
          Blockly.Navigation.modify();
        }
      });

  //Set Enter
  var enterAction = new Blockly.KeyAction('mark', 'Marks the current location', function() {
    if (Blockly.Navigation.currentState_ === Blockly.Navigation.STATE_WS) {
      Blockly.Navigation.handleEnterForWS();
    } else if (Blockly.Navigation.currentState_ === Blockly.Navigation.STATE_FLYOUT) {
      Blockly.Navigation.insertFromFlyout();
    }
  });

  //Set X
  var xAction = new Blockly.KeyAction('disconnect', 'Disconnect the blocks', function() {
    if (Blockly.Navigation.currentState_ === Blockly.Navigation.STATE_WS) {
      Blockly.Navigation.disconnectBlocks();
    }
  });

  //Set T
  var tAction = new Blockly.KeyAction('toolbox', 'Open the toolbox', function() {
    if (!Blockly.getMainWorkspace().getToolbox()) {
      Blockly.Navigation.focusFlyout();
    } else {
      Blockly.Navigation.focusToolbox();
    }
  });

  //Set E
  var eAction = new Blockly.KeyAction('exit', 'Exit the toolbox', function() {
    if (Blockly.Navigation.currentState_ === Blockly.Navigation.STATE_TOOLBOX) {
      Blockly.Navigation.focusWorkspace();
    }
  });

  //Set ESC
  var escAction = new Blockly.KeyAction('escape', 'Exit the toolbox', function() {
    if (Blockly.Navigation.currentState_ === Blockly.Navigation.STATE_TOOLBOX) {
      Blockly.Navigation.focusWorkspace();
    }
  });

  var map = {};
  map[goog.events.KeyCodes.W] = wAction;
  map[goog.events.KeyCodes.A] = aAction;
  map[goog.events.KeyCodes.S] = sAction;
  map[goog.events.KeyCodes.D] = dAction;
  map[goog.events.KeyCodes.I] = iAction;
  map[goog.events.KeyCodes.ENTER] = enterAction;
  map[goog.events.KeyCodes.X] = xAction;
  map[goog.events.KeyCodes.T] = tAction;
  map[goog.events.KeyCodes.E] = eAction;
  map[goog.events.KeyCodes.ESC] = escAction;
  return map;
};
