/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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
 * @fileoverview Classic theme.
 * Contains multi colored border to create shadow effect.
 */

'use strict';

goog.provide('Blockly.Themes.Classic');

goog.require('Blockly.Theme');

var defaultBlockStyles = {
  "colour_blocks":{
    "primaryColour": "20"
  },
  "list_blocks": {
    "primaryColour": "260"
  },
  "logic_blocks": {
    "primaryColour": "210"
  },
  "loop_blocks": {
    "primaryColour": "120"
  },
  "math_blocks": {
    "primaryColour": "230"
  },
  "procedure_blocks": {
    "primaryColour": "290"
  },
  "text_blocks": {
    "primaryColour": "160"
  },
  "variable_blocks": {
    "primaryColour": "330"
  },
  "variable_dynamic_blocks":{
    "primaryColour": "310"
  },
  "hat_blocks":{
    "primaryColour":"330",
    "hat":"cap"
  }
};

Blockly.Themes.Classic = new Blockly.Theme(defaultBlockStyles);
