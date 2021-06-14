/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Leaphy Click Blocks for Blockly.
 *
 * This file is scraped to extract a .json file of block definitions. The array
 * passed to defineBlocksWithJsonArray(..) must be strict JSON: double quotes
 * only, no outside references, no functions, no trailing commas, etc. The one
 * exception is end-of-line comments, which the scraper will remove.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.leaphyClick');  // Deprecated
goog.provide('Blockly.Constants.LeaphyClick');
 
goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.Mutator');
 
var motorTypeOptionsClick = [["%{BKY_LEAPHY_MOTOR_A_DROPDOWN}", "9"], ["%{BKY_LEAPHY_MOTOR_B_DROPDOWN}", "10"]];
 
Blockly.Blocks['leaphy_click_set_motor'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.LEAPHY_MOTOR_TYPE)
        .appendField(new Blockly.FieldDropdown(motorTypeOptionsClick), "MOTOR_TYPE");
    this.appendValueInput("MOTOR_SPEED", 'Number')
        .appendField(Blockly.Msg.LEAPHY_MOTOR_SPEED)
        .setCheck('Number');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('leaphy_blocks');
  }
};

var digitalPinOptions = [["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"], ["17", "17"], ["18", "18"], ["19", "19"]];

Blockly.Blocks['leaphy_click_rgb_digitalwrite'] = {
  /**
     * Block for creating setting multiple pins to a state in one go.
     * @this Blockly.Block
     */
  init: function() {
    this.setHelpUrl('http://arduino.cc/en/Reference/DigitalWrite');
    this.setColour(Blockly.Blocks.io.HUE);
    this.appendValueInput('STATE1')
        .appendField(Blockly.Msg.ARD_DIGITALWRITE)
        .appendField(new Blockly.FieldDropdown(digitalPinOptions), 'PIN1')
        .appendField(Blockly.Msg.ARD_WRITE_TO)
        .setCheck(Blockly.Types.BOOLEAN.checkList);
    this.appendValueInput('STATE2')
        .appendField(new Blockly.FieldDropdown(digitalPinOptions), 'PIN2')
        .appendField(Blockly.Msg.ARD_WRITE_TO)
        .setCheck(Blockly.Types.BOOLEAN.checkList);
    this.appendValueInput('STATE3')
        .appendField(new Blockly.FieldDropdown(digitalPinOptions), 'PIN3')
        .appendField(Blockly.Msg.ARD_WRITE_TO)
        .setCheck(Blockly.Types.BOOLEAN.checkList);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.ARD_DIGITALWRITE_TIP);
    this.setStyle('leaphy_blocks');
  },
  /**
     * Updates the content of the the pin related fields.
     * @this Blockly.Block
     */
  updateFields: function() {
    Blockly.Arduino.Boards.refreshBlockFieldDropdown(
        this, 'PIN1', 'digitalPins');
    Blockly.Arduino.Boards.refreshBlockFieldDropdown(
        this, 'PIN2', 'digitalPins');
    Blockly.Arduino.Boards.refreshBlockFieldDropdown(
        this, 'PIN3', 'digitalPins');
  }
};

 
// Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
 
// ]);  // END JSON EXTRACT (Do not delete this comment.)
 
