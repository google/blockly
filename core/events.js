/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Events fired as a result of actions in Blockly's editor.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Events');

/**
 * Allow change events to be created and fired.
 * @type {boolean}
 */
Blockly.Events.enabled = true;

/**
 * Create a custom event and fire it.
 * @param {Object} detail Custom data for event.
 */
Blockly.Events.fire = function(detail) {
  var workspace = Blockly.Workspace.getById(detail.workspace);
  if (workspace.rendered) {
    // Create a custom event in a browser-compatible way.
    if (typeof CustomEvent == 'function') {
      // W3
      var evt = new CustomEvent('blocklyWorkspaceChange', {'detail': detail});
    } else {
      // MSIE
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(eventName, false, false, detail);
    }
    workspace.getCanvas().dispatchEvent(evt);
  }
};
