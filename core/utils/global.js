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
 * @fileoverview Provides a reference to the global object.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

/**
 * @name Blockly.utils.global
 * @namespace
 */
goog.provide('Blockly.utils.global');


/**
 * Reference to the global object.
 *
 * More info on this implementation here:
 * https://docs.google.com/document/d/1NAeW4Wk7I7FV0Y2tcUFvQdGMc89k2vdgSXInw8_nvCI/edit
 */
Blockly.utils.global = function() {
  if (typeof self === 'object') {
    return self;
  }
  if (typeof window === 'object') {
    return window;
  }
  if (typeof global === 'object') {
    return global;
  }
  return this;
}();
