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

Blockly.Arduino['arduino_digital'] = function(block) {
  var code = block.getFieldValue('DIGITAL');
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_switchstate'] = function(block) {
  var code = block.getFieldValue('DIGITAL');
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_frequency'] = function(block) {
  var code = block.getFieldValue('NUM');
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_pin'] = function(block) {
  var code = block.getFieldValue('PIN');
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_tutorial_pin'] = function(block) {
  var code = block.getFieldValue('PIN');
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_uno_pin'] = function(block) {
  var code = block.getFieldValue('PIN');
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_digital_write'] = function(block) {
  var value = Blockly.Arduino.valueToCode(block, 'value', Blockly.Arduino.ORDER_NONE) || '0';
  var pin = Blockly.Arduino.valueToCode(block, 'pin', Blockly.Arduino.ORDER_NONE) || '0';
  var code = 'digitalWrite(' + pin + ', ' + value + ');\n';
  return code;
};

Blockly.Arduino['arduino_digital_read'] = function(block) {
  var pin = Blockly.Arduino.valueToCode(block, 'pin', Blockly.Arduino.ORDER_NONE) || '0';
  var code = 'digitalRead(' + pin + ')'; 
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_analog_write'] = function(block) {
  var value = Blockly.Arduino.valueToCode(block, 'value', Blockly.Arduino.ORDER_NONE) || '0';
  var pin = Blockly.Arduino.valueToCode(block, 'pin', Blockly.Arduino.ORDER_NONE) || '0';
  var code = 'analogWrite(' + pin + ', ' + value + ');\n';
  return code;
};

Blockly.Arduino['arduino_analog_read'] = function(block) {
  var pin = Blockly.Arduino.valueToCode(block, 'pin', Blockly.Arduino.ORDER_NONE) || '0';
  var code = 'analogRead(' + pin + ')'; 
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino['arduino_tone'] = function(block) {
  var pin = Blockly.Arduino.valueToCode(block, 'pin', Blockly.Arduino.ORDER_NONE) || '0';
  var frequency = Blockly.Arduino.valueToCode(block, 'frequency', Blockly.Arduino.ORDER_NONE) || '0';

  return 'tone(' + pin + ', ' + frequency + ');\n';
};

Blockly.Arduino['arduino_notone'] = function(block) {
  var pin = Blockly.Arduino.valueToCode(block, 'pin', Blockly.Arduino.ORDER_NONE) || '0';

  return 'noTone(' + pin + ');\n';
};


Blockly.Arduino['arduino_delay'] = function(block) {
  var time = Blockly.Arduino.valueToCode(block, 'time', Blockly.Arduino.ORDER_NONE) || '0';
  var code = 'delay(' + time + ');\n';
  return code;
};

Blockly.Arduino['arduino_repeat_forever'] = function(block) {
  var branch = Blockly.Arduino.statementToCode(block, 'DO');
  branch = Blockly.Arduino.addLoopTrap(branch, block.id);
  var code = 'while(1) {\n' + branch + '}\n';
  return code;
};

Blockly.Arduino['arduino_disable_input_lights'] = function(block) {
  var code = 'disableInputLights();\n';
  return code;
};