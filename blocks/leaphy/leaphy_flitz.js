/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Leaphy Flitz Blocks for Blockly.
 *
 * This file is scraped to extract a .json file of block definitions. The array
 * passed to defineBlocksWithJsonArray(..) must be strict JSON: double quotes
 * only, no outside references, no functions, no trailing commas, etc. The one
 * exception is end-of-line comments, which the scraper will remove.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.leaphyFlitz');  // Deprecated
goog.provide('Blockly.Constants.LeaphyFlitz');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.Mutator');

var stomachSensorOptions = [["%{BKY_LEAPHY_STOMACH_SENSOR_TYPE1}", "1"], ["%{BKY_LEAPHY_STOMACH_SENSOR_TYPE2}", "2"]]

Blockly.defineBlocksWithJsonArray([
  {
    "type": "leaphy_flitz_read_stomach_sensor",
    "message0": "%%{BKY_LEAPHY_READ_STOMACH} %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "SENSOR_TYPE",
        "options": stomachSensorOptions
      }
    ],
    "output": "Number",
    "style": "leaphy_blocks",
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "leaphy_flitz_read_hand_sensor",
    "message0": "%%{BKY_LEAPHY_READ_HAND}",
    "output": "Number",
    "style": "leaphy_blocks",
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "leaphy_flitz_led",
    "message0": "%%{BKY_LEAPHY_FLITZ_LED} %1 %%{BKY_LEAPHY_FLITZ_LED_R} %2 %%{BKY_LEAPHY_FLITZ_LED_G} %3 %%{BKY_LEAPHY_FLITZ_LED_B} %4",
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "input_value",
        "name": "FLITZ_LED_R",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "FLITZ_LED_G",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "FLITZ_LED_B",
        "check": "Number"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "style": "leaphy_blocks",
    "tooltip": "",
    "helpUrl": ""
  }
]);