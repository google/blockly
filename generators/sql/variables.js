/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2015 Google Inc.
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
 * @fileoverview Generating PHP for variable blocks.
 * @author daarond@gmail.com (Daaron Dwyer)
 */
'use strict';

goog.provide('Blockly.SQL.variables');

goog.require('Blockly.SQL');


Blockly.SQL['variables_get'] = function(block) {
    // Variable getter.
    var code = Blockly.SQL.variableDB_.getName(block.getFieldValue('VAR'),
        Blockly.Variables.NAME_TYPE);
    return [code, Blockly.SQL.ORDER_ATOMIC];
};

Blockly.SQL['variables_set'] = function(block) {
    // Variable setter.
    var argument0 = Blockly.SQL.valueToCode(block, 'VALUE',
            Blockly.SQL.ORDER_ASSIGNMENT) || '0';
    var varName = Blockly.SQL.variableDB_.getName(
        block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
    return 'SET ' + varName + ' = ' + argument0 + ';\n';
};

Blockly.SQL['aliases_get'] = function(block) {
  // Variable getter.
  var code = Blockly.SQL.variableDB_.getName(block.data,
      Blockly.Variables.NAME_TYPE);
  return [code, Blockly.SQL.ORDER_ATOMIC];
};

Blockly.SQL['aliases_set'] = function(block) {
  // Variable setter.
  var argument0 = Blockly.SQL.valueToCode(block, 'VALUE',
      Blockly.SQL.ORDER_ASSIGNMENT) || '0';
  var varName = Blockly.SQL.variableDB_.getName(
      block.data, Blockly.Variables.NAME_TYPE);
  return 'SET ' + varName + ' = ' + argument0 + ';\n';
};