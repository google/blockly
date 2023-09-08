/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for the Leaphy Nano robot.
 */
'use strict';

goog.module('Blockly.libraryBlocks.leaphyNano');

// const {BlockDefinition} = goog.requireType('Blockly.blocks');
// TODO (6248): Properly import the BlockDefinition type.
/* eslint-disable-next-line no-unused-vars */
const BlockDefinition = Object;
const {createBlockDefinitionsFromJsonArray, defineBlocks} = goog.require('Blockly.common');

const motorLeftRightDropdown = [
  ['%{BKY_LEAPHY_MOTOR_LEFT_DROPDOWN}', '9'],
  ['%{BKY_LEAPHY_MOTOR_RIGHT_DROPDOWN}', '10'],
];
const motorForwardBackwardDropdown = [
  ['%{BKY_LEAPHY_MOTOR_FORWARD}', '1'], ['%{BKY_LEAPHY_MOTOR_BACKWARD}', '2'],
  ['%{BKY_LEAPHY_MOTOR_LEFT}', '3'], ['%{BKY_LEAPHY_MOTOR_RIGHT}', '4'],
];
const digitalPinOptions = [
  ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'], ['7', '7'],
  ['8', '8'], ['9', '9'], ['10', '10'], ['11', '11'], ['12', '12'],
  ['13', '13'], ['14', '14'], ['15', '15'], ['16', '16'], ['17', '17'],
  ['18', '18'], ['19', '19'],
];
const analogPinOptions = [
  ['A0', 'A0'], ['A1', 'A1'], ['A2', 'A2'], ['A3', 'A3'], ['A4', 'A4'],
  ['A5', 'A5'], ['A6', 'A6'], ['A7', 'A7'],
];

const motorDropdown = [
  ['%{BKY_LEAPHY_MOTOR_A_DROPDOWN}', '9'],
  ['%{BKY_LEAPHY_MOTOR_B_DROPDOWN}', '10'],
];

/**
 * A dictionary of the block definitions provided by this module.
 * @type {!Object<string, !BlockDefinition>}
 */
const blocks = createBlockDefinitionsFromJsonArray([
  {
    'type': 'leaphy_click_set_motor_nano',
    'message0': '%%{BKY_LEAPHY_MOTOR_TYPE} %1 %2 %%{BKY_LEAPHY_MOTOR_SPEED} %3',
    'args0': [
      {
        'type': 'field_dropdown',
        'name': 'MOTOR_TYPE',
        'options': motorDropdown,
      },
      {'type': 'input_dummy'},
      {'type': 'input_value', 'name': 'MOTOR_SPEED', 'check': 'Number'},
    ],
    'inputsInline': true,
    'previousStatement': null,
    'nextStatement': null,
    'style': 'leaphy_blocks',
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'leaphy_click_rgb_digitalwrite_nano',
    'message0':
        '%%{BKY_ARD_DIGITALWRITE} %1 %%{BKY_ARD_WRITE_TO} %2  %3 %%{BKY_ARD_WRITE_TO} %4  %5 %%{BKY_ARD_WRITE_TO} %6',
    'args0': [
      {'type': 'field_dropdown', 'name': 'PIN1', 'options': digitalPinOptions},
      {'type': 'input_value', 'name': 'State1', 'check': 'Boolean'},
      {'type': 'field_dropdown', 'name': 'PIN2', 'options': digitalPinOptions},
      {'type': 'input_value', 'name': 'State2', 'check': 'Boolean'},
      {'type': 'field_dropdown', 'name': 'PIN3', 'options': digitalPinOptions},
      {'type': 'input_value', 'name': 'State3', 'check': 'Boolean'},
    ],
    'inputsInline': true,
    'previousStatement': null,
    'nextStatement': null,
    'style': 'leaphy_blocks',
    // "extensions": "refreshPinFields",
    'tooltip': '%{BKY_ARD_DIGITALWRITE_TIP}',
    'helpUrl': '',
  },
  {
    'type': 'leaphy_servo_write_nano',
    'message0':
        '%%{BKY_ARD_SERVO_WRITE} %1 %2 %%{BKY_ARD_SERVO_WRITE_TO} %3 %%{BKY_ARD_SERVO_WRITE_DEG_180}',
    'args0': [
      {
        'type': 'field_dropdown',
        'name': 'SERVO_PIN',
        'options': digitalPinOptions,
      },
      {'type': 'input_dummy'},
      {'type': 'input_value', 'name': 'SERVO_ANGLE', 'check': 'Number'},
    ],
    'inputsInline': true,
    'previousStatement': null,
    'nextStatement': null,
    'style': 'leaphy_blocks',
    // "extensions": "refreshServoPinFields",
    'tooltip': '%{BKY_ARD_SERVO_WRITE_TIP}',
    'helpUrl': 'http://arduino.cc/en/Reference/ServoWrite',
  },
  {
    'type': 'leaphy_servo_read_nano',
    'message0': '%%{BKY_ARD_SERVO_READ} %1',
    'args0': [{
      'type': 'field_dropdown',
      'name': 'SERVO_PIN',
      'options': digitalPinOptions,
    }],
    'output': 'Number',
    'style': 'leaphy_blocks',
    // "extensions": "returnAndUpdateServoRead",
    'tooltip': '%{BKY_ARD_SERVO_READ_TIP}',
    'helpUrl': 'http://arduino.cc/en/Reference/ServoRead',
  },
  {
    'type': 'leaphy_io_digitalwrite_nano',
    'message0': '%%{BKY_ARD_DIGITALWRITE} %1 %%{BKY_ARD_WRITE_TO} %2',
    'args0': [
      {'type': 'field_dropdown', 'name': 'PIN', 'options': digitalPinOptions},
      {'type': 'input_value', 'name': 'NAME', 'check': 'Boolean'},
    ],
    'inputsInline': true,
    'previousStatement': null,
    'nextStatement': null,
    'style': 'leaphy_blocks',
    'tooltip': '%{BKY_ARD_DIGITALWRITE_TIP}',
    'helpUrl': 'http://arduino.cc/en/Reference/DigitalWrite',
  },
  {
    'type': 'leaphy_io_analogwrite_nano',
    'message0': '%%{BKY_ARD_ANALOGWRITE} %1 %%{BKY_ARD_WRITE_TO} %2',
    'args0': [
      {'type': 'field_dropdown', 'name': 'PIN', 'options': digitalPinOptions},
      {'type': 'input_value', 'name': 'NUM', 'check': 'Number'},
    ],
    'inputsInline': true,
    'previousStatement': null,
    'nextStatement': null,
    'style': 'leaphy_blocks',
    // "extensions": "inputAndUpdateAnalog",
    'tooltip': '%{BKY_ARD_ANALOGWRITE_TIP}',
    'helpUrl': 'http://arduino.cc/en/Reference/AnalogWrite',
  },
  {
    'type': 'leaphy_sonar_read_nano',
    'message0':
        '%%{BKY_LEAPHY_SONAR_READ_TRIG} %1 %%{BKY_LEAPHY_SONAR_READ_ECHO} %2',
    'args0': [
      {
        'type': 'field_dropdown',
        'name': 'TRIG_PIN',
        'options': digitalPinOptions,
      },
      {
        'type': 'field_dropdown',
        'name': 'ECHO_PIN',
        'options': digitalPinOptions,
      },
    ],
    'output': 'Number',
    'style': 'leaphy_blocks',
    // "extensions": "returnAndUpdateTrig",
    'tooltip': '%{BKY_LEAPHY_SONAR_READ_TIP}',
    'helpUrl': '',
  },
  {
    'type': 'leaphy_original_digital_read_nano',
    'message0': '%%{BKY_LEAPHY_DIGITAL_READ} %1',
    'args0': [
      {'type': 'field_dropdown', 'name': 'PIN', 'options': digitalPinOptions},
    ],
    'style': 'leaphy_blocks',
    'output': 'Number',
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'leaphy_original_analog_read_nano',
    'message0': '%%{BKY_LEAPHY_ANALOG_READ} %1',
    'args0': [
      {'type': 'field_dropdown', 'name': 'PIN', 'options': analogPinOptions},
    ],
    'style': 'leaphy_blocks',
    'output': 'Number',
    'tooltip': '',
    'helpUrl': '',
  },
]);
exports.blocks = blocks;

// Register provided blocks.
defineBlocks(blocks);
