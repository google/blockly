/**
 * AccessibleBlockly
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Angular2 Service for handling keyboard input.
 *
 * @author sll@google.com (Sean Lip)
 */

blocklyApp.KeyboardInputService = ng.core.Class({
  constructor: [function() {
    // Default custom actions for global keystrokes. The keys of this object
    // are string representations of the key codes.
    this.keysToActions = {};
    // Override for the default keysToActions mapping (e.g. in a modal
    // context).
    this.keysToActionsOverride = null;

    // Attach a keydown handler to the entire window.
    var that = this;
    document.addEventListener('keydown', function(evt) {
      var stringifiedKeycode = String(evt.keyCode);
      var actionsObject = that.keysToActionsOverride || that.keysToActions;

      if (actionsObject.hasOwnProperty(stringifiedKeycode)) {
        actionsObject[stringifiedKeycode](evt);
      }
    });
  }],
  setOverride: function(newKeysToActions) {
    this.keysToActionsOverride = newKeysToActions;
  },
  clearOverride: function() {
    this.keysToActionsOverride = null;
  }
});
