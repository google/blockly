/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Generating JavaScript for arduino blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.JavaScript.arduino');

goog.require('Blockly.JavaScript');


Blockly.JavaScript['arduino_tone'] = function(block) {
  var frequency = Blockly.JavaScript.valueToCode(block, 'frequency', Blockly.Arduino.ORDER_NONE) || '0';
  var duration = Blockly.JavaScript.valueToCode(block, 'duration', Blockly.Arduino.ORDER_NONE) || '0';

  if(frequency == "None") {
    var code = 'var context = null;\n';
    code += 'if(!context) {context = new AudioContext;}\n';
    code += 'oscillator = context.createOscillator();\n';
    code += 'oscillator.frequency.value = ' + 0 + ';\n';
    code += 'oscillator.connect(context.destination);\n';
    code += 'oscillator.start(0);\n';
    code += 'setTimeout(function() {oscillator.stop(0);}, ' + duration + ');\n';
  } else {

    switch(frequency) {
      case "NOTE_C4": frequency = 262; break;
      case "NOTE_CS4": frequency = 277; break;
      case "NOTE_D4": frequency = 294; break;
      case "NOTE_DS4": frequency = 311; break;
      case "NOTE_E4": frequency = 330; break;
      case "NOTE_F4": frequency = 349; break;
      case "NOTE_FS4": frequency = 370; break;
      case "NOTE_G4": frequency = 392; break;
      case "NOTE_GS4": frequency = 415; break;
      case "NOTE_A4": frequency = 440; break;
      case "NOTE_AS4": frequency = 466; break;
      case "NOTE_B4": frequency = 494; break;
      default: frequency = 0;
    }

    var code = 'var context = null;\n';
    code += 'if(!context) {context = new AudioContext;}\n';
    code += 'oscillator = context.createOscillator();\n';
    code += 'oscillator.frequency.value = ' + frequency + ';\n';
    code += 'oscillator.connect(context.destination);\n';
    code += 'oscillator.start(0);\n';
    code += 'setTimeout(function() {oscillator.stop(0);}, ' + duration + ');\n'; 
  }

  return code;
};

Blockly.JavaScript['arduino_run_once'] = function(block) {
  var branch = Blockly.JavaScript.statementToCode(block, 'DO');
  branch = Blockly.JavaScript.addLoopTrap(branch, block.id);
  var code = 'for(var i = 0; i < 1; i++) {\n' + branch + '\n}\n';
  return code;
};

Blockly.JavaScript['arduino_frequency'] = function(block) {
  var code = block.getFieldValue('NUM');
  console.log(code);
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};


