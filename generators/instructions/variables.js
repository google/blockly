/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2014 Google Inc.
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
 * @fileoverview Generating Instructions for variable blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Instructions.variables');

goog.require('Blockly.Instructions');


Blockly.Instructions['variables_get'] = function(block) {
  // Variable getter.
  var varName = Blockly.Instructions.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  var code = Blockly.Instructions.mapping_[varName];
  return [code, Blockly.Instructions.ORDER_ATOMIC];
};

Blockly.Instructions['variables_set'] = function(block) {
  // Variable setter.
  var argument = '';
  var valueBlock = block.getInputTargetBlock('VALUE') || '0';
  var value;
  if (valueBlock == '0') {
    value = '0';
  } else if (valueBlock.type == 'math_number' || valueBlock.type == 'logic_boolean') {
    value = Blockly.Instructions.valueToCode(block, 'VALUE',
      Blockly.Instructions.ORDER_ASSIGNMENT);
  } else {
    argument = Blockly.Instructions.valueToCode(block, 'VALUE',
      Blockly.Instructions.ORDER_ASSIGNMENT) + '\n';
    value = Blockly.Instructions.mapping_[valueBlock.id];
  }

  var varName = Blockly.Instructions.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  var destination = Blockly.Instructions.mapping_[varName];
  
  return argument + 'mov ' + destination + ' ' + value + '\n';
};
