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
 * @fileoverview Generating Instructions for arduino blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Instructions.arduino');

goog.require('Blockly.Instructions');


Blockly.Instructions['arduino_digital_write'] = function(block) {
  var toggle = block.getFieldValue('TOGGLE') == 'TRUE' ? 'on' : 'off';
  var pin = block.getFieldValue('PIN');
  var code = toggle + ' ' + pin + '\n';
  return code;
};

Blockly.Instructions['arduino_digital_read'] = function(block) {
  var mode = 'd'; // digital mode

  var id = block.id;
  Blockly.Instructions.mapping_[id] = 'r' + Blockly.Instructions.unusedRegister;
  Blockly.Instructions.unusedRegister++;
  var destination = Blockly.Instructions.mapping_[id];

  var pin = block.getFieldValue('PIN');

  var code = 'read ' + mode + ' ' + destination + ' ' + pin; 
  return [code, Blockly.Instructions.ORDER_ATOMIC];
};

Blockly.Instructions['arduino_analog_write'] = function(block) {
  var pin = block.getFieldValue('PIN');

  var argument = '';
  var valueBlock = block.getInputTargetBlock('Val') || '0';
  var value;
  if (valueBlock == '0') {
    value = '0';
  } else if (valueBlock.type == 'math_number') {
    value = Blockly.Instructions.valueToCode(block, 'Val',
      Blockly.Instructions.ORDER_ASSIGNMENT);
  } else if (valueBlock.type == 'variables_get') {
    var varName = Blockly.Instructions.variableDB_.getName(valueBlock.getFieldValue('VAR'),
          Blockly.Variables.NAME_TYPE);
    value = Blockly.Instructions.mapping_[varName];
  } else {
    argument = Blockly.Instructions.valueToCode(block, 'Val',
      Blockly.Instructions.ORDER_ASSIGNMENT) + '\n';
    value = Blockly.Instructions.mapping_[valueBlock.id];
  }

  var code = argument + 'aw ' + pin + ' ' + value + '\n';
  return code;
};

Blockly.Instructions['arduino_analog_read'] = function(block) {
  var mode = 'a'; // analog mode

  var id = block.id;
  Blockly.Instructions.mapping_[id] = 'r' + Blockly.Instructions.unusedRegister;
  Blockly.Instructions.unusedRegister++;
  var destination = Blockly.Instructions.mapping_[id];

  var pin = block.getFieldValue('PIN');
  var code = 'read ' + mode + ' ' + destination + ' ' + pin; 
  return [code, Blockly.Instructions.ORDER_ATOMIC];
};

Blockly.Instructions['arduino_tone'] = function(block) {
  var pin = block.getFieldValue('PIN');

  var argument = '';
  var toneBlock = block.getInputTargetBlock('tone') || '0';
  var freq;
  if (toneBlock == '0') {
    freq = 0;
  } else if (toneBlock.type == 'math_number') {
    freq = Blockly.Instructions.valueToCode(block, 'tone',
        Blockly.Instructions.ORDER_NONE);
  } else if (toneBlock.type == 'variables_get') {
    var varName = Blockly.Instructions.variableDB_.getName(toneBlock.getFieldValue('VAR'),
          Blockly.Variables.NAME_TYPE);
    freq = Blockly.Instructions.mapping_[varName];
  } else {
    argument = Blockly.Instructions.valueToCode(block, 'tone',
        Blockly.Instructions.ORDER_NONE) + '\n';
    freq = Blockly.Instructions.mapping_[toneBlock.id];
  }

  if (freq == '0')
    return 'noTone ' + pin + '\n';
  else
    return argument + 'tone ' + pin + ' ' + freq + '\n';
};

Blockly.Instructions['arduino_delay'] = function(block) {
  var argument = '';
  var timeBlock = block.getInputTargetBlock('delay') || '0';
  var time;
  if (timeBlock == '0') {
    time = 0;
  } else if (timeBlock.type == 'math_number') {
    time = Blockly.Instructions.valueToCode(block, 'delay',
        Blockly.Instructions.ORDER_NONE);
  } else if (timeBlock.type == 'variables_get') {
    var varName = Blockly.Instructions.variableDB_.getName(timeBlock.getFieldValue('VAR'),
          Blockly.Variables.NAME_TYPE);
    time = Blockly.Instructions.mapping_[varName];
  } else {
    argument = Blockly.Instructions.valueToCode(block, 'delay',
        Blockly.Instructions.ORDER_NONE) + '\n';
    time = Blockly.Instructions.mapping_[timeBlock.id];
  }

  var code = argument + 'delay ' + time + '\n';
  return code;
};