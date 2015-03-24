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


Blockly.Javascript['arduino_tone'] = function(block) {
  var frequency = Blockly.Javascript.valueToCode(block, 'frequency', Blockly.Arduino.ORDER_NONE) || '0';
  var duration = Blockly.Javascript.valueToCode(block, 'duration', Blockly.Arduino.ORDER_NONE) || '0';

  var code = 'context = new AudioContext;\n';
  code += 'oscillator = context.createOscillator();\n';
  code += 'oscillator.frequency.value =' + frequency + ';\n';
  code += 'oscillator.connect(context.destination);\n';
  code += 'oscillator.start(0);\n';
  code += 'setTimeout(function() { oscillator.stop(0); },' + duration + ');\n';

  console.log(code);

  return code;
};