/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for the Leaphy Original robot.
 */
'use strict';

goog.module('Blockly.libraryBlocks.leaphyOriginal');

// const {BlockDefinition} = goog.requireType('Blockly.blocks');
// TODO (6248): Properly import the BlockDefinition type.
/* eslint-disable-next-line no-unused-vars */
const BlockDefinition = Object;
const { createBlockDefinitionsFromJsonArray, defineBlocks } = goog.require('Blockly.common');

var motorLeftRightDropdown = [["%{BKY_LEAPHY_MOTOR_LEFT_DROPDOWN}", "9"], ["%{BKY_LEAPHY_MOTOR_RIGHT_DROPDOWN}", "10"]]
var motorForwardBackwardDropdown = [["%{BKY_LEAPHY_MOTOR_FORWARD}", "1"], ["%{BKY_LEAPHY_MOTOR_BACKWARD}", "2"], ["%{BKY_LEAPHY_MOTOR_LEFT}", "3"], ["%{BKY_LEAPHY_MOTOR_RIGHT}", "4"]]
var digitalPinOptions = [["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"], ["17", "17"], ["18", "18"], ["19", "19"]]
var analogPinOptions = [["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"]]

/**
 * A dictionary of the block definitions provided by this module.
 * @type {!Object<string, !BlockDefinition>}
 */
const blocks = createBlockDefinitionsFromJsonArray([
  {
    "type": "leaphy_original_set_led",
    "message0": "%%{BKY_LEAPHY_LED} %1 %%{BKY_LEAPHY_LED_RED} %2 %%{BKY_LEAPHY_LED_GREEN} %3 %%{BKY_LEAPHY_LED_BLUE} %4",
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "input_value",
        "name": "LED_RED",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "LED_GREEN",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "LED_BLUE",
        "check": "Number"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "style": "leaphy_blocks",
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "leaphy_original_set_motor",
    "message0": "%%{BKY_LEAPHY_MOTOR_TYPE} %1 %2 %%{BKY_LEAPHY_MOTOR_SPEED} %3",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "MOTOR_TYPE",
        "options": motorLeftRightDropdown
      },
      {
        "type": "input_dummy"
      },
      {
        "type": "input_value",
        "name": "MOTOR_SPEED",
        "check": "Number"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "style": "leaphy_blocks",
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "leaphy_original_get_distance",
    "message0": "%%{BKY_LEAPHY_GET_DISTANCE}",
    "style": "leaphy_blocks",
    "output": "Number",
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "leaphy_original_move_motors",
    "message0": "%%{BKY_LEAPHY_MOTOR_DIRECTION} %1 %2  %3",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "MOTOR_DIRECTION",
        "options": motorForwardBackwardDropdown
      },
      {
        "type": "input_dummy"
      },
      {
        "type": "input_value",
        "name": "MOTOR_SPEED",
        "check": "Number"
      }
    ],
    "inputsInline": true,
    "previousStatement": null,
    "nextStatement": null,
    "style": "leaphy_blocks",
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "leaphy_original_digital_read",
    "message0": "%%{BKY_LEAPHY_DIGITAL_READ} %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "PIN",
        "options": digitalPinOptions
      }
    ],
    "style": "leaphy_blocks",
    "output": "Number",
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "leaphy_original_analog_read",
    "message0": "%%{BKY_LEAPHY_ANALOG_READ} %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "PIN",
        "options": analogPinOptions
      }
    ],
    "style": "leaphy_blocks",
    "output": "Number",
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "leaphy_original_buzz",
    "message0": "%%{BKY_LEAPHY_BUZZ_BUZZ} %1 %%{BKY_LEAPHY_BUZZ_HERTZ} %2 %%{BKY_LEAPHY_BUZZ_MS}",
    "args0": [
      {
        "type": "input_value",
        "name": "FREQUENCY",
        "check": "Number"
      },
      {
        "type": "input_value",
        "name": "DURATION",
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
exports.blocks = blocks;

// Register provided blocks.
defineBlocks(blocks);
