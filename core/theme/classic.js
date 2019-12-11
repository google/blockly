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
  "data_blocks":{
    "colourPrimary": "#ef476e"
  },
  "action_blocks":{
    "colourPrimary": "#4bcdcc"
  },
  "sense_blocks":{
    "colourPrimary": "#ffa04e"
  },
  "vision_blocks":{
    "colourPrimary": "#d84235"
  },
  "colour_blocks":{
    "colourPrimary": "#7ed136"
  },
  "list_blocks": {
    "colourPrimary": "#613f93"
  },
  "logic_blocks": {
    "colourPrimary": "#0894c5"
  },
  "loop_blocks": {
    "colourPrimary": "#2aab53"
  },
  "math_blocks": {
    "colourPrimary": "#1d53ba"
  },
  "procedure_blocks": {
    "colourPrimary": "#fbc23d"
  },
  "text_blocks": {
    "colourPrimary": "#8c1bb5"
  },
  "variable_blocks": {
    "colourPrimary": "#ae3998"
  },
  "variable_dynamic_blocks":{
    "colourPrimary": "#ae3998"
  },
  "hat_blocks":{
    "colourPrimary":"#ae3998",
    "hat":"cap"
  }
};

var categoryStyles = {
  "data_category":{
    "colourPrimary": "#ef476e"
  },
  "action_category":{
    "colourPrimary": "#4bcdcc"
  },
  "sense_category":{
    "colourPrimary": "#ffa04e"
  },
  "vision_category":{
    "colourPrimary": "#d84235"
  },
  "colour_category":{
    "colourPrimary": "#7ed136"
  },
  "list_category": {
    "colourPrimary": "#613f93"
  },
  "logic_category": {
    "colourPrimary": "#0894c5"
  },
  "loop_category": {
    "colourPrimary": "#2aab53"
  },
  "math_category": {
    "colourPrimary": "#1d53ba"
  },
  "procedure_category": {
    "colourPrimary": "#fbc23d"
  },
  "text_category": {
    "colourPrimary": "#8c1bb5"
  },
  "variable_category": {
    "colourPrimary": "#ae3998"
  },
  "variable_dynamic_category":{
    "colourPrimary": "#ae3998"
  },
};

Blockly.Themes.Classic = new Blockly.Theme(defaultBlockStyles, categoryStyles);
