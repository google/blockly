/**
 * @license
 * Copyright 2016 Google LLC
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
 * @fileoverview Generating Lua for variable blocks.
 * @author rodrigoq@google.com (Rodrigo Queiro)
 */
'use strict';

goog.provide('Blockly.Lua.variables');

goog.require('Blockly.Lua');


Blockly.Lua['variables_get'] = function(block) {
  // Variable getter.
  var code = Blockly.Lua.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.VARIABLE_CATEGORY_NAME);
  return [code, Blockly.Lua.ORDER_ATOMIC];
};

Blockly.Lua['variables_set'] = function(block) {
  // Variable setter.
  var argument0 = Blockly.Lua.valueToCode(block, 'VALUE',
      Blockly.Lua.ORDER_NONE) || '0';
  var varName = Blockly.Lua.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  return varName + ' = ' + argument0 + '\n';
};
