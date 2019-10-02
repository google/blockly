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
 * @fileoverview The class representing an action.
 * Used primarily for keyboard navigation.
 */
'use strict';

goog.provide('Blockly.Action');


/**
 * Class for a single action.
 * An action describes user intent. (ex go to next or go to previous)
 * @param {string} name The name of the action.
 * @param {string} desc The description of the action.
 * @constructor
 */
Blockly.Action = function(name, desc) {
  this.name = name;
  this.desc = desc;
};
