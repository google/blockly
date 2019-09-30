/**
 * @license
 * Copyright 2018 Google LLC
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
 * @fileoverview Generating Lua for dynamic variable blocks.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

goog.provide('Blockly.Lua.variablesDynamic');

goog.require('Blockly.Lua');
goog.require('Blockly.Lua.variables');


// Lua is dynamically typed.
Blockly.Lua['variables_get_dynamic'] = Blockly.Lua['variables_get'];
Blockly.Lua['variables_set_dynamic'] = Blockly.Lua['variables_set'];
