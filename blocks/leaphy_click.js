/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for the Leaphy Click robot.
 */
'use strict';

goog.module('Blockly.libraryBlocks.leaphyClick');

// const {BlockDefinition} = goog.requireType('Blockly.blocks');
// TODO (6248): Properly import the BlockDefinition type.
/* eslint-disable-next-line no-unused-vars */
const BlockDefinition = Object;
const {createBlockDefinitionsFromJsonArray, defineBlocks} = goog.require('Blockly.common');
const Extensions = goog.require('Blockly.Extensions');

var motorDropdown = [
  ['%{BKY_LEAPHY_MOTOR_A_DROPDOWN}', '9'],
  ['%{BKY_LEAPHY_MOTOR_B_DROPDOWN}', '10']
];
var digitalPinOptions = [
  ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6'], ['7', '7'],
  ['8', '8'], ['9', '9'], ['10', '10'], ['11', '11'], ['12', '12'],
  ['13', '13'], ['14', '14'], ['15', '15'], ['16', '16'], ['17', '17'],
  ['18', '18'], ['19', '19']
];

/**
 * A dictionary of the block definitions provided by this module.
 * @type {!Object<string, !BlockDefinition>}
 */
const blocks = createBlockDefinitionsFromJsonArray([
  {
    'type': 'leaphy_click_set_motor',
    'message0': '%%{BKY_LEAPHY_MOTOR_TYPE} %1 %2 %%{BKY_LEAPHY_MOTOR_SPEED} %3',
    'args0': [
      {
        'type': 'field_dropdown',
        'name': 'MOTOR_TYPE',
        'options': motorDropdown
      },
      {'type': 'input_dummy'},
      {'type': 'input_value', 'name': 'MOTOR_SPEED', 'check': 'Number'}
    ],
    'inputsInline': true,
    'previousStatement': null,
    'nextStatement': null,
    'style': 'leaphy_blocks',
    'tooltip': '',
    'helpUrl': ''
  },
  {
    'type': 'leaphy_click_rgb_digitalwrite',
    'message0':
        '%%{BKY_ARD_DIGITALWRITE} %1 %%{BKY_ARD_WRITE_TO} %2  %3 %%{BKY_ARD_WRITE_TO} %4  %5 %%{BKY_ARD_WRITE_TO} %6',
    'args0': [
      {'type': 'field_dropdown', 'name': 'PIN1', 'options': digitalPinOptions},
      {'type': 'input_value', 'name': 'State1', 'check': 'Boolean'},
      {'type': 'field_dropdown', 'name': 'PIN2', 'options': digitalPinOptions},
      {'type': 'input_value', 'name': 'State2', 'check': 'Boolean'},
      {'type': 'field_dropdown', 'name': 'PIN3', 'options': digitalPinOptions},
      {'type': 'input_value', 'name': 'State3', 'check': 'Boolean'}
    ],
    'inputsInline': true,
    'previousStatement': null,
    'nextStatement': null,
    'style': 'leaphy_blocks',
    //"extensions": "refreshPinFields",
    'tooltip': '%{BKY_ARD_DIGITALWRITE_TIP}',
    'helpUrl': ''
  }
])

exports.blocks = blocks;

// Register provided blocks.
defineBlocks(blocks);
