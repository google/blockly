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
 * @fileoverview The class representing a keyboard action.
 * Used primarily for keyboard navigation.
 */
'use strict';

goog.provide('Blockly.KeyAction');

/**
 * Class for a single action.
 * There can be one action for each key. If the action only applies to a
 * single state (toolbox, flyout, workspace) then the function should handle this.
 * @param {string} name The name of the action.
 * @param {string} desc The description of the action.
 * @param {string} func The function to be called when the key is pressed.
 * @constructor
 */
Blockly.KeyAction = function(name, desc, func) {
  this.name = name;
  this.desc = desc;
  this.func = func;
};
