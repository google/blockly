/**
 * @license
 * Visual Blocks Editor
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
 * @fileoverview Audio blocks for Blockly.
 * @author lunalovecraft@gmail.com (Luna Meier)
 */
'use strict';

goog.provide('Blockly.Blocks.audio');

goog.require('Blockly.Blocks');


Blockly.Blocks.audio.HUE = 210;

Blockly.Blocks['beep'] = {
  init: function() {
    this.setHelpUrl('http://www.example.com/');
    this.setColour(160);
    this.appendDummyInput()
        .appendField("Beep");
    this.appendValueInput("FREQUENCY")
        .setCheck("Number")
        .appendField("Frequency");
    this.appendValueInput("DURATION")
        .setCheck("Number")
        .appendField("Duration");
    this.appendValueInput("TIMEOUT")
        .setCheck("Number")
        .appendField("Time Until Played");
    this.setInputsInline(true);
    this.setPreviousStatement(true, "null");
    this.setNextStatement(true, "null");
    this.setTooltip('Beeps');
  }
};