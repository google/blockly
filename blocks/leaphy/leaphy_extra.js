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

goog.provide('Blockly.Blocks.leaphyExtra');  // Deprecated
goog.provide('Blockly.Constants.LeaphyExtra');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.Mutator');

/**
 * Unused constant for the common HSV hue for all blocks in this category.
 * @deprecated Use Blockly.Msg['COLOUR_HUE']. (2018 April 5)
 */

 Blockly.Blocks["leaphy_rgb_read_sensor"] = {
     init: function(){
         this.appendDummyInput()
             .appendField(Blockly.Msg.LEAPHY_RGB_READ_SENSOR);
        this.setOutput(true, 'Number');
        this.setStyle('leaphy_blocks');
     }
 };

 Blockly.Blocks["leaphy_rgb_color_red"] = {
     init: function(){
         this.appendDummyInput()
             .appendField(Blockly.Msg.LEAPHY_RGB_COLOR_RED);
        this.setOutput(true, 'Number');
        this.setStyle('leaphy_blocks');
     }
 };

 Blockly.Blocks["leaphy_rgb_color_green"] = {
    init: function(){
        this.appendDummyInput()
            .appendField(Blockly.Msg.LEAPHY_RGB_COLOR_GREEN);
       this.setOutput(true, 'Number');
       this.setStyle('leaphy_blocks');
    }
};

Blockly.Blocks["leaphy_rgb_color_blue"] = {
    init: function(){
        this.appendDummyInput()
            .appendField(Blockly.Msg.LEAPHY_RGB_COLOR_BLUE);
       this.setOutput(true, 'Number');
       this.setStyle('leaphy_blocks');
    }
};

Blockly.Blocks["leaphy_rgb_raw_color_red"] = {
    init: function(){
        this.appendDummyInput()
            .appendField(Blockly.Msg.LEAPHY_RGB_RAW_COLOR_RED);
       this.setOutput(true, 'Number');
       this.setStyle('leaphy_blocks');
    }
};

Blockly.Blocks["leaphy_rgb_raw_color_green"] = {
    init: function(){
        this.appendDummyInput()
            .appendField(Blockly.Msg.LEAPHY_RGB_RAW_COLOR_GREEN);
       this.setOutput(true, 'Number');
       this.setStyle('leaphy_blocks');
    }
};

Blockly.Blocks["leaphy_rgb_raw_color_blue"] = {
    init: function(){
        this.appendDummyInput()
            .appendField(Blockly.Msg.LEAPHY_RGB_RAW_COLOR_BLUE);
       this.setOutput(true, 'Number');
       this.setStyle('leaphy_blocks');
    }
};