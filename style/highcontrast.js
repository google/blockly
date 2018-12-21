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
 * @fileoverview High contrast style.
 * Darker colors to contrast the white block font.
 * @author aschmiedt@google.com (Abby Schmiedt)
 */
'use strict';

goog.provide('Blockly.Styles.HighContrast');

goog.require('Blockly.Style');

var defaultBlockStyles = {
  "colour":{
    "primaryColour": "#a52714",
    "secondaryColour":"#FB9B8C",
    "tertiaryColour":"#FBE1DD"
  },
  "lists": {
    "primaryColour": "#4a148c",
    "secondaryColour":"#AD7BE9",
    "tertiaryColour":"#CDB6E9"
  },
  "logic": {
    "primaryColour": "#01579b",
    "secondaryColour":"#64C7FF",
    "tertiaryColour":"#C5EAFF"
  },
  "loops": {
    "primaryColour": "#33691e",
    "secondaryColour":"#9AFF78",
    "tertiaryColour":"#E1FFD7"
  },
  "math": {
    "primaryColour": "#1a237e",
    "secondaryColour":"#8A9EFF",
    "tertiaryColour":"#DCE2FF"
  },
  "procedures": {
    "primaryColour": "#006064",
    "secondaryColour":"#77E6EE",
    "tertiaryColour":"#CFECEE"
  },
  "text": {
    "primaryColour": "#004d40",
    "secondaryColour":"#5ae27c",
    "tertiaryColour":"#D2FFDD"
  },
  "variables": {
    "primaryColour": "#880e4f",
    "secondaryColour":"#FF73BE",
    "tertiaryColour":"#FFD4EB"
  },
  "variables_dynamic": {
    "primaryColour": "#880e4f",
    "secondaryColour":"#FF73BE",
    "tertiaryColour":"#FFD4EB"
  }
};

//This style is still being fleshed out and may change.
Blockly.Styles.HighContrast = new Blockly.Style(defaultBlockStyles);
