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
     init: function () {
         this.appendDummyInput()
             .appendField(Blockly.Msg.LEAPHY_MOTOR_TYPE)
             .appendField(new Blockly.FieldDropdown(motorTypeOptionsClick), "MOTOR_TYPE")
         this.appendValueInput("MOTOR_SPEED", 'Number')
             .appendField(Blockly.Msg.LEAPHY_MOTOR_SPEED)
             .setCheck('Number');
         this.setInputsInline(true);
         this.setPreviousStatement(true, null);
         this.setNextStatement(true, null);
         this.setStyle('leaphy_blocks');
     }
 };
 
 //Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
 
 //]);  // END JSON EXTRACT (Do not delete this comment.)
 