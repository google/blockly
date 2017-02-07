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
 * @fileoverview Colour blocks for Blockly.
 *
 * This file is scraped to extract a .json file of block definitions. The array
 * passed to defineBlocksWithJsonArray(..) must be strict JSON: double quotes
 * only, no outside references, no functions, no trailing commas, etc. The one
 * exception is end-of-line comments, which the scraper will remove.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.colour');  // Deprecated
goog.provide('Blockly.Constants.Colour');

goog.require('Blockly.Blocks');


/**
 * Common HSV hue for all blocks in this category.
 * This should be the same as Blockly.Msg.COLOUR_HUE.
 * @readonly
 */
Blockly.Constants.Colour.HUE = 20;
/** @deprecated Use Blockly.Constants.Colour.HUE */
Blockly.Blocks.colour.HUE = Blockly.Constants.Colour.HUE;

Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
  // Block for colour picker.
  {
    "type": "colour_picker",
    "message0": "%1",
    "args0": [
      {
        "type": "field_colour",
        "name": "COLOUR",
        "colour": "#ff0000"
      }
    ],
    "output": "Colour",
    "colour": "%{BKY_COLOUR_HUE}",
    "helpUrl": "%{BKY_COLOUR_PICKER_HELPURL}",
    "tooltip": "%{BKY_COLOUR_PICKER_TOOLTIP}",
    "extensions": ["parent_tooltip_when_inline"]
  },

  // Block for random colour.
  {
    "type": "colour_random",
    "message0": "%{BKY_COLOUR_RANDOM_TITLE}",
    "output": "Colour",
    "colour": "%{BKY_COLOUR_HUE}",
    "helpUrl": "%{BKY_COLOUR_RANDOM_HELPURL}",
    "tooltip": "%{BKY_COLOUR_RANDOM_TOOLTIP}"
  },

  // Block for composing a colour from RGB components.
  {
    "type": "colour_rgb",
    "message0": "%{BKY_COLOUR_RGB_TITLE} %{BKY_COLOUR_RGB_RED} %1 %{BKY_COLOUR_RGB_GREEN} %2 %{BKY_COLOUR_RGB_BLUE} %3",
    "args0": [
      {
        "type": "input_value",
        "name": "RED",
        "check": "Number",
        "align": "RIGHT"
      },
      {
        "type": "input_value",
        "name": "GREEN",
        "check": "Number",
        "align": "RIGHT"
      },
      {
        "type": "input_value",
        "name": "BLUE",
        "check": "Number",
        "align": "RIGHT"
      }
    ],
    "output": "Colour",
    "colour": "%{BKY_COLOUR_HUE}",
    "helpUrl": "%{BKY_COLOUR_RGB_HELPURL}",
    "tooltip": "%{BKY_COLOUR_RGB_TOOLTIP}"
  },

  // Block for blending two colours together.
  {
    "type": "colour_blend",
    "message0": "%{BKY_COLOUR_BLEND_TITLE} %{BKY_COLOUR_BLEND_COLOUR1} %1 %{BKY_COLOUR_BLEND_COLOUR2} %2 %{BKY_COLOUR_BLEND_RATIO} %3",
    "args0": [
      {
        "type": "input_value",
        "name": "COLOUR1",
        "check": "Colour",
        "align": "RIGHT"
      },
      {
        "type": "input_value",
        "name": "COLOUR2",
        "check": "Colour",
        "align": "RIGHT"
      },
      {
        "type": "input_value",
        "name": "RATIO",
        "check": "Number",
        "align": "RIGHT"
      }
    ],
    "output": "Colour",
    "colour": "%{BKY_COLOUR_HUE}",
    "helpUrl": "%{BKY_COLOUR_BLEND_HELPURL}",
    "tooltip": "%{BKY_COLOUR_BLEND_TOOLTIP}"
  }
]);  // END JSON EXTRACT (Do not delete this comment.)
