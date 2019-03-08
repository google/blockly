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
    "colourPrimary": "#a52714",
    "colourSecondary":"#FB9B8C",
    "colourTertiary":"#FBE1DD"
  },
  "list_blocks": {
    "colourPrimary": "#4a148c",
    "colourSecondary":"#AD7BE9",
    "colourTertiary":"#CDB6E9"
  },
  "logic_blocks": {
    "colourPrimary": "#01579b",
    "colourSecondary":"#64C7FF",
    "colourTertiary":"#C5EAFF"
  },
  "loop_blocks": {
    "colourPrimary": "#33691e",
    "colourSecondary":"#9AFF78",
    "colourTertiary":"#E1FFD7"
  },
  "math_blocks": {
    "colourPrimary": "#1a237e",
    "colourSecondary":"#8A9EFF",
    "colourTertiary":"#DCE2FF"
  },
  "procedure_blocks": {
    "colourPrimary": "#006064",
    "colourSecondary":"#77E6EE",
    "colourTertiary":"#CFECEE"
  },
  "text_blocks": {
    "colourPrimary": "#004d40",
    "colourSecondary":"#5ae27c",
    "colourTertiary":"#D2FFDD"
  },
  "variable_blocks": {
    "colourPrimary": "#880e4f",
    "colourSecondary":"#FF73BE",
    "colourTertiary":"#FFD4EB"
  },
  "variable_dynamic_blocks": {
    "colourPrimary": "#880e4f",
    "colourSecondary":"#FF73BE",
    "colourTertiary":"#FFD4EB"
  },
  "hat_blocks" : {
    "colourPrimary": "#880e4f",
    "colourSecondary":"#FF73BE",
    "colourTertiary":"#FFD4EB",
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
