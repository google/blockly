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
 * @fileoverview High contrast theme.
 * Darker colors to contrast the white font.
 */
'use strict';

goog.provide('Blockly.Themes.HighContrast');

goog.require('Blockly.Theme');

var defaultBlockStyles = {
  "colour_blocks":{
    "primaryColour": "#a52714",
    "secondaryColour":"#FB9B8C",
    "tertiaryColour":"#FBE1DD"
  },
  "list_blocks": {
    "primaryColour": "#4a148c",
    "secondaryColour":"#AD7BE9",
    "tertiaryColour":"#CDB6E9"
  },
  "logic_blocks": {
    "primaryColour": "#01579b",
    "secondaryColour":"#64C7FF",
    "tertiaryColour":"#C5EAFF"
  },
  "loop_blocks": {
    "primaryColour": "#33691e",
    "secondaryColour":"#9AFF78",
    "tertiaryColour":"#E1FFD7"
  },
  "math_blocks": {
    "primaryColour": "#1a237e",
    "secondaryColour":"#8A9EFF",
    "tertiaryColour":"#DCE2FF"
  },
  "procedure_blocks": {
    "primaryColour": "#006064",
    "secondaryColour":"#77E6EE",
    "tertiaryColour":"#CFECEE"
  },
  "text_blocks": {
    "primaryColour": "#004d40",
    "secondaryColour":"#5ae27c",
    "tertiaryColour":"#D2FFDD"
  },
  "variable_blocks": {
    "primaryColour": "#880e4f",
    "secondaryColour":"#FF73BE",
    "tertiaryColour":"#FFD4EB"
  },
  "variable_dynamic_blocks": {
    "primaryColour": "#880e4f",
    "secondaryColour":"#FF73BE",
    "tertiaryColour":"#FFD4EB"
  },
  "hat_blocks" : {
    "primaryColour": "#880e4f",
    "secondaryColour":"#FF73BE",
    "tertiaryColour":"#FFD4EB",
    "hat": "cap"
  }
};

var categoryStyles = {
  "colour_category":{
    "colour": "#a52714",
  },
  "list_category": {
    "colour": "#4a148c",
  },
  "logic_category": {
    "colour": "#01579b",
  },
  "loop_category": {
    "colour": "#33691e",
  },
  "math_category": {
    "colour": "#1a237e",
  },
  "procedure_category": {
    "colour": "#006064",
  },
  "text_category": {
    "colour": "#004d40",
  },
  "variable_category": {
    "colour": "#880e4f",
  },
  "variable_dynamic_category":{
    "colour": "#880e4f",
  }
};

//This style is still being fleshed out and may change.
Blockly.Themes.HighContrast = new Blockly.Theme(defaultBlockStyles, categoryStyles);
