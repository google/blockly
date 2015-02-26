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
 * @fileoverview Generating Arduino for arduino blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Arduino.arduino');

goog.require('Blockly.Arduino');

var PINTOVAR = {
  '1' : 'INPUT_1',
  '2' : 'INPUT_2',
  '3' : 'INPUT_3',
  '4' : 'INPUT_4',
  '5' : 'INPUT_5',
  '6' : 'INPUT_6',
  'A' : 'OUTPUT_A',
  'B' : 'OUTPUT_B',
  'C' : 'OUTPUT_C',
  'D' : 'OUTPUT_D',
  'E' : 'OUTPUT_E',
  'F' : 'OUTPUT_F'
}

Blockly.Arduino['arduino_digital_write'] = function(block) {
  var toggle = block.getFieldValue('TOGGLE') == 'TRUE' ? 'on' : 'off';
  var pin = block.getFieldValue('PIN');
  var code = toggle + '(' + PINTOVAR[pin] + ');\n';
  return code;
};

Blockly.Arduino['arduino_digital_read'] = function(block) {
  var pin = block.getFieldValue('PIN');

  var code = 'digitalRead(' + PINTOVAR[pin] + ')\n'; 
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_analog_write'] = function(block) {
  var pin = block.getFieldValue('PIN');

  var argument = '';
  var valueBlock = block.getInputTargetBlock('Val') || '0';
  var value;
  if (valueBlock == '0') {
    value = '0';
  } else if (valueBlock.type == 'math_number') {
    value = Blockly.Arduino.valueToCode(block, 'Val',
      Blockly.Arduino.ORDER_ASSIGNMENT);
  } else if (valueBlock.type == 'variables_get') {
    var varName = Blockly.Arduino.variableDB_.getName(valueBlock.getFieldValue('VAR'),
          Blockly.Variables.NAME_TYPE);
    value = varName;
  } else {
    value = Blockly.Arduino.valueToCode(block, 'Val',
      Blockly.Arduino.ORDER_ASSIGNMENT);
  }

  var code = 'analogWrite(' + PINTOVAR[pin] + ', ' + value + ');\n';
  return code;
};

Blockly.Arduino['arduino_analog_read'] = function(block) {
  var pin = block.getFieldValue('PIN');
  var code = 'analogRead(' + PINTOVAR[pin] + ')'; 
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_tone'] = function(block) {
  var pin = block.getFieldValue('PIN');

  var argument = '';
  var toneBlock = block.getInputTargetBlock('tone') || '0';
  var freq;
  if (toneBlock == '0') {
    freq = 0;
  } else if (toneBlock.type == 'math_number') {
    freq = Blockly.Arduino.valueToCode(block, 'tone',
        Blockly.Arduino.ORDER_NONE);
  } else if (toneBlock.type == 'variables_get') {
    var varName = Blockly.Arduino.variableDB_.getName(toneBlock.getFieldValue('VAR'),
          Blockly.Variables.NAME_TYPE);
    freq = varName;
  } else {
    freq = Blockly.Arduino.valueToCode(block, 'tone',
        Blockly.Arduino.ORDER_NONE);
  }

  if (freq == '0')
    return 'noTone(' + pin + ');\n';
  else
    return 'tone(' + pin + ', ' + freq + ');\n';
};

Blockly.Arduino['arduino_delay'] = function(block) {
  var argument = '';
  var timeBlock = block.getInputTargetBlock('delay') || '0';
  var time;
  if (timeBlock == '0') {
    time = 0;
  } else if (timeBlock.type == 'math_number') {
    time = Blockly.Arduino.valueToCode(block, 'delay',
        Blockly.Arduino.ORDER_NONE);
  } else if (timeBlock.type == 'variables_get') {
    var varName = Blockly.Arduino.variableDB_.getName(timeBlock.getFieldValue('VAR'),
          Blockly.Variables.NAME_TYPE);
    time = varName;
  } else {
    time = Blockly.Arduino.valueToCode(block, 'delay',
        Blockly.Arduino.ORDER_NONE) + '\n';
  }

  var code = 'delay(' + time + ');\n';
  return code;
};