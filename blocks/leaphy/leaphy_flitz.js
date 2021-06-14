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

var stomachSensorTypes = [["%{BKY_LEAPHY_STOMACH_SENSOR_TYPE1}", "1"], ["%{BKY_LEAPHY_STOMACH_SENSOR_TYPE2}", "2"]];

Blockly.Blocks['leaphy_flitz_read_stomach_sensor'] = {
  init: function(){
    this.appendDummyInput()
        .appendField(Blockly.Msg.LEAPHY_READ_STOMACH)
        .appendField(new Blockly.FieldDropdown(stomachSensorTypes), "SENSOR_TYPE");
    this.setOutput(true, 'Number');
    this.setStyle('leaphy_blocks');
  }
};

Blockly.Blocks['leaphy_flitz_read_hand_sensor'] = {
  init: function(){
    this.appendDummyInput()
        .appendField(Blockly.Msg.LEAPHY_READ_HAND);
    this.setOutput(true, 'Number');
    this.setStyle('leaphy_blocks');
  }
};

Blockly.Blocks['leaphy_flitz_led'] = {
  init: function(){
    this.appendDummyInput()
        .appendField(Blockly.Msg.LEAPHY_FLITZ_LED);
    this.appendValueInput("FLITZ_LED_R")
        .appendField(Blockly.Msg.LEAPHY_FLITZ_LED_R)
        .setCheck('Number');
    this.appendValueInput("FLITZ_LED_G")
        .appendField(Blockly.Msg.LEAPHY_FLITZ_LED_G)
        .setCheck('Number');
    this.appendValueInput("FLITZ_LED_B")
        .appendField(Blockly.Msg.LEAPHY_FLITZ_LED_B)
        .setCheck('Number');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('leaphy_blocks');
  }
};

// Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT

// ]);  // END JSON EXTRACT (Do not delete this comment.)
