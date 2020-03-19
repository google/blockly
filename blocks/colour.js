/**
 * @license
 * Copyright 2012 Google LLC
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

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.Blocks.Definitions');
goog.require('Blockly.FieldColour');
goog.require('Blockly.FieldLabel');

/**
 * Unused constant for the common HSV hue for all blocks in this category.
 * @deprecated Use Blockly.Msg['COLOUR_HUE']. (2018 April 5)
 */
Blockly.Constants.Colour.HUE = 20;

Blockly.Blocks.colour_picker = {
  /**
     * Block to display and pick colors from a table.
     */
  init: function () {
    // Inputs:
    var colour = new Blockly.FieldColour('#ffff00');

    colour.setColours(Blockly.FieldColour.COLOURS);

    colour.setColumns(7);

    this.appendDummyInput()
      .appendField(colour, 'COLOUR');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.colorsStyle);
    this.setTooltip(Blockly.Msg.COLOUR_PICKER_TOOLTIP);
    this.setOutput(true, ['Colour', 'Array']);
    this.setHelpUrl(Blockly.Msg.COLOUR_PICKER_HELPURL);
  },
  ensureSearchKeywords: function () {
    var keywords = [
      '%{BKY_COLORS}'
    ];

    var toolboxKeywords = [];

    Blockly.Search.preprocessSearchKeywords('colour_picker', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.color_channel = {
  /**
     *
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    var rgbChannels = [[Blockly.Msg.RED, 'R'],
      [Blockly.Msg.GREEN, 'G'],
      [Blockly.Msg.BLUE, 'B']];

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_GET_COLOR_CHANNEL);

    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown(rgbChannels), 'COLOR_CHANNEL');

    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_GET_COLOR_CHANNEL_FROM);

    this.appendValueInput('COLOR')
      .setCheck('Colour');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.colorsStyle);
    this.setTooltip(Blockly.Msg.FABLE_GET_COLOR_CHANNEL_TOOLTIP);
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setHelpUrl(Blockly.Msg.COLOUR_PICKER_HELPURL);
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_GET_COLOR_CHANNEL,
      Blockly.Msg.FABLE_GET_COLOR_CHANNEL_FROM
    ];

    var toolboxKeywords = [
      Blockly.Msg.RED,
      Blockly.Msg.GREEN,
      Blockly.Msg.BLUE,
      '%{BKY_COLORS}'
    ];

    Blockly.Search.preprocessSearchKeywords('color_channel', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.custom_color_blend = {
  /**
     * Block that blends between two colors by having a specified ratio between the two.
     * For example, blending red and blue should give purple (if the ratio is 50/50).
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_CUSTOM_COLOR_BLEND);

    this.appendValueInput('FIRST')
      .setCheck('Colour');

    this.appendValueInput('SECOND')
      .setCheck('Colour');

    this.appendValueInput('RATIO')
      .appendField(Blockly.Msg.FABLE_COLOR_RATIO)
      .setCheck('Number');
    // .appendField(new Blockly.FieldNumber('50', 0, 100), 'RATIO');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.colorsStyle);
    this.setTooltip(Blockly.Msg.FABLE_COLOR_BLEND_TOOLTIP);
    this.setOutput(true, ['Colour', 'Array']);
    this.setInputsInline(true);
    this.setHelpUrl(Blockly.Msg.COLOUR_PICKER_HELPURL);
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_CUSTOM_COLOR_BLEND,
      Blockly.Msg.FABLE_COLOR_RATIO
    ];

    var toolboxKeywords = [
      '%{BKY_COLORS}'
    ];

    Blockly.Search.preprocessSearchKeywords('custom_color_blend', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.random_color = {
  /**
     * Block that generates a random color, or rather an array with 3 random numbers from 0 to 255.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_RANDOM_COLOR);

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.colorsStyle);
    this.setTooltip(Blockly.Msg.FABLE_RANDOM_COLOR_TOOLTIP);
    this.setOutput(true, ['Colour', 'Array']);
    this.setHelpUrl(Blockly.Msg.COLOUR_PICKER_HELPURL);
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_RANDOM_COLOR,
      '%{BKY_COLORS}'
    ];

    var toolboxKeywords = [];

    Blockly.Search.preprocessSearchKeywords('random_color', keywords, toolboxKeywords);
  }
};

Blockly.Blocks.custom_color = {
  /**
     * Block that generates a 'custom' color by having users input 3 numbers from 0 to 255.
     * @this Blockly.Block
     */
  init: function () {
    // Inputs:
    this.appendDummyInput()
      .appendField(Blockly.Msg.FABLE_CUSTOM_COLOR);

    this.appendValueInput('RED')
      .appendField(Blockly.Msg.RED + ':')
      .setCheck('Number');

    this.appendValueInput('GREEN')
      .appendField(Blockly.Msg.GREEN + ':')
      .setCheck('Number');

    this.appendValueInput('BLUE')
      .appendField(Blockly.Msg.BLUE + ':')
      .setCheck('Number');

    // Properties:
    this.setStyle(Blockly.Blocks.Definitions.colorsStyle);
    this.setTooltip(Blockly.Msg.FABLE_CUSTOM_COLOR_TOOLTIP);
    this.setOutput(true, ['Colour', 'Array']);
    this.setInputsInline(true);
    this.setHelpUrl(Blockly.Msg.COLOUR_PICKER_HELPURL);
  },
  ensureSearchKeywords: function () {
    var keywords = [
      Blockly.Msg.FABLE_CUSTOM_COLOR
    ];

    var toolboxKeywords = [
      Blockly.Msg.RED,
      Blockly.Msg.GREEN,
      Blockly.Msg.BLUE,
      '%{BKY_COLORS}'
    ];

    Blockly.Search.preprocessSearchKeywords('custom_color', keywords, toolboxKeywords);
  }
};

Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
  // Block for colour picker.
  // {
  //   "type": "colour_picker",
  //   "message0": "%1",
  //   "args0": [
  //     {
  //       "type": "field_colour",
  //       "name": "COLOUR",
  //       "colour": "#ff0000"
  //     }
  //   ],
  //   "output": "Colour",
  //   "helpUrl": "%{BKY_COLOUR_PICKER_HELPURL}",
  //   "style": "colour_blocks",
  //   "tooltip": "%{BKY_COLOUR_PICKER_TOOLTIP}",
  //   "extensions": ["parent_tooltip_when_inline"]
  // },

  // Block for random colour.
  {
    "type": "colour_random",
    "message0": "%{BKY_COLOUR_RANDOM_TITLE}",
    "output": "Colour",
    "helpUrl": "%{BKY_COLOUR_RANDOM_HELPURL}",
    "style": "colour_blocks",
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
    "helpUrl": "%{BKY_COLOUR_RGB_HELPURL}",
    "style": "colour_blocks",
    "tooltip": "%{BKY_COLOUR_RGB_TOOLTIP}"
  },

  // Block for blending two colours together.
  {
    "type": "colour_blend",
    "message0": "%{BKY_COLOUR_BLEND_TITLE} %{BKY_COLOUR_BLEND_COLOUR1} " +
        "%1 %{BKY_COLOUR_BLEND_COLOUR2} %2 %{BKY_COLOUR_BLEND_RATIO} %3",
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
    "helpUrl": "%{BKY_COLOUR_BLEND_HELPURL}",
    "style": "colour_blocks",
    "tooltip": "%{BKY_COLOUR_BLEND_TOOLTIP}"
  }
]);  // END JSON EXTRACT (Do not delete this comment.)
