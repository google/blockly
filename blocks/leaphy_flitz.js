/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for the Leaphy Flitz robot.
 */
'use strict';

goog.module('Blockly.libraryBlocks.leaphyFlitz');

// const {BlockDefinition} = goog.requireType('Blockly.blocks');
// TODO (6248): Properly import the BlockDefinition type.
/* eslint-disable-next-line no-unused-vars */
const BlockDefinition = Object;
const {createBlockDefinitionsFromJsonArray, defineBlocks} = goog.require('Blockly.common');

const stomachSensorOptions =
  [
    ['%{BKY_LEAPHY_STOMACH_SENSOR_TYPE1}', '1'],
    ['%{BKY_LEAPHY_STOMACH_SENSOR_TYPE2}', '2'],
  ];

/**
 * A dictionary of the block definitions provided by this module.
 * @type {!Object<string, !BlockDefinition>}
 */
const blocks = createBlockDefinitionsFromJsonArray([
  {
    'type': 'leaphy_flitz_read_stomach_sensor',
    'message0': '%%{BKY_LEAPHY_READ_STOMACH} %1',
    'args0': [{
      'type': 'field_dropdown',
      'name': 'SENSOR_TYPE',
      'options': stomachSensorOptions,
    }],
    'output': 'Number',
    'style': 'leaphy_blocks',
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'leaphy_flitz_read_hand_sensor',
    'message0': '%%{BKY_LEAPHY_READ_HAND}',
    'output': 'Number',
    'style': 'leaphy_blocks',
    'tooltip': '',
    'helpUrl': '',
  },
  {
    'type': 'leaphy_flitz_led',
    'message0':
      '%%{BKY_LEAPHY_FLITZ_LED} %1 %%{BKY_LEAPHY_FLITZ_LED_R} %2 %%{BKY_LEAPHY_FLITZ_LED_G} %3 %%{BKY_LEAPHY_FLITZ_LED_B} %4',
    'args0': [
      {'type': 'input_dummy'},
      {'type': 'input_value', 'name': 'FLITZ_LED_R', 'check': 'Number'},
      {'type': 'input_value', 'name': 'FLITZ_LED_G', 'check': 'Number'},
      {'type': 'input_value', 'name': 'FLITZ_LED_B', 'check': 'Number'},
    ],
    'inputsInline': true,
    'previousStatement': null,
    'nextStatement': null,
    'style': 'leaphy_blocks',
    'tooltip': '',
    'helpUrl': '',
  },
]);

exports.blocks = blocks;

// Register provided blocks.
defineBlocks(blocks);
