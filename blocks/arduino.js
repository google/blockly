/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for Arduino boards.
 */
'use strict';

goog.module('Blockly.libraryBlocks.arduino');

// const {BlockDefinition} = goog.requireType('Blockly.blocks');
// TODO (6248): Properly import the BlockDefinition type.
/* eslint-disable-next-line no-unused-vars */
const BlockDefinition = Object;
const {createBlockDefinitionsFromJsonArray, defineBlocks} = goog.require('Blockly.common');

/**
 * A dictionary of the block definitions provided by this module.
 * @type {!Object<string, !BlockDefinition>}
 */
const blocks = createBlockDefinitionsFromJsonArray([{
  'type': 'time_delay',
  'message0': '%{BKY_ARD_TIME_DELAY} %1 %{BKY_ARD_TIME_MS}',
  'args0':
      [{'type': 'input_value', 'name': 'DELAY_TIME_MILI', 'check': 'Number'}],
  'inputsInline': true,
  'previousStatement': null,
  'nextStatement': null,
  'style': 'situation_blocks',
  'tooltip': '%{BKY_ARD_TIME_DELAY_TIP}',
  'helpUrl': 'http://arduino.cc/en/Reference/Delay'
}]);
exports.blocks = blocks;

// Register provided blocks.
defineBlocks(blocks);
