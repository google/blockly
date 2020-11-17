/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Leaphy Original Blocks for Blockly.
 *
 * This file is scraped to extract a .json file of block definitions. The array
 * passed to defineBlocksWithJsonArray(..) must be strict JSON: double quotes
 * only, no outside references, no functions, no trailing commas, etc. The one
 * exception is end-of-line comments, which the scraper will remove.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.leaphyOriginal');  // Deprecated
goog.provide('Blockly.Constants.LeaphyOriginal');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.Mutator');

/**
 * Unused constant for the common HSV hue for all blocks in this category.
 * @deprecated Use Blockly.Msg['COLOUR_HUE']. (2018 April 5)
 */
Blockly.Constants.Colour.HUE = 20;
var digitalPinOptions = [["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"], ["17", "17"], ["18", "18"], ["19", "19"]];
var analogPinOptions = [["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"]];
var motorTypeOptions = [["M_L", "9"], ["M_R", "10"]];
var motorDirectionOptions = [["%{BKY_LEAPHY_MOTOR_FORWARD}", "1"], ["%{BKY_LEAPHY_MOTOR_BACKWARD}", "2"], ["%{BKY_LEAPHY_MOTOR_LEFT}", "3"], ["%{BKY_LEAPHY_MOTOR_RIGHT}", "4"]];

Blockly.Blocks['leaphy_original_set_led'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.LEAPHY_LED)
        this.appendValueInput("LED_RED", 'Number')
            .appendField(Blockly.Msg.LEAPHY_LED_RED)
            .setCheck('Number');
        this.appendValueInput("LED_GREEN", 'Number')
            .appendField(Blockly.Msg.LEAPHY_LED_GREEN)
            .setCheck('Number');
        this.appendValueInput("LED_BLUE", 'Number')
            .appendField(Blockly.Msg.LEAPHY_LED_BLUE)
            .setCheck('Number');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('leaphy_blocks');
    }
};

Blockly.Blocks['leaphy_original_set_motor'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.LEAPHY_MOTOR_TYPE)
            .appendField(new Blockly.FieldDropdown(motorTypeOptions), "MOTOR_TYPE")
        this.appendValueInput("MOTOR_SPEED", 'Number')
            .appendField(Blockly.Msg.LEAPHY_MOTOR_SPEED)
            .setCheck('Number');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('leaphy_blocks');
    }
};

Blockly.Blocks['leaphy_original_get_distance'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.LEAPHY_GET_DISTANCE);
        this.setOutput(true, 'Number');
        this.setStyle('leaphy_blocks');
    }
};

Blockly.Blocks['leaphy_original_move_motors'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.LEAPHY_MOTOR_DIRECTION)
            .appendField(new Blockly.FieldDropdown(motorDirectionOptions), "MOTOR_DIRECTION")
        this.appendValueInput("MOTOR_SPEED", 'Number')
            .appendField(Blockly.Msg.LEAPHY_MOTOR_SPEED)
            .setCheck('Number');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('leaphy_blocks');
    }
}

Blockly.Blocks['leaphy_original_digital_read'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.LEAPHY_DIGITAL_READ)
            .appendField(new Blockly.FieldDropdown(digitalPinOptions), "PIN");
        this.setOutput(true, 'Number');
        this.setStyle('leaphy_blocks');
    }
};

Blockly.Blocks['leaphy_original_analog_read'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.LEAPHY_ANALOG_READ)
            .appendField(new Blockly.FieldDropdown(analogPinOptions), "PIN");
        this.setOutput(true, 'Number');
        this.setStyle('leaphy_blocks');
    }
};


//Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT

//]);  // END JSON EXTRACT (Do not delete this comment.)
