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

Blockly.Constants.Colour.HUE = 20;
var ledstripDemoOptions = [["%{BKY_LEAPHY_LED_STRIP_LIGHTBANK}", "0"], ["%{BKY_LEAPHY_LED_STRIP_BREATHE}", "1"], ["%{BKY_LEAPHY_LED_STRIP_GULF}", "3"], ["%{BKY_LEAPHY_LED_STRIP_RAINBOW}", "4"], ["%{BKY_LEAPHY_LED_STRIP_COLORGULF}", "5"]];

 Blockly.Blocks["leaphy_rgb_read_sensor"] = {
     init: function(){
        this.appendDummyInput()
             .appendField(Blockly.Msg.LEAPHY_RGB_READ_SENSOR);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);     
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

Blockly.Blocks["leaphy_led_set_strip"] = {
    init: function(){
        this.appendDummyInput()
            .appendField(Blockly.Msg.LEAPHY_LED_SET_STRIP);
        this.appendValueInput("LED_SET_PIN", 'Number')
            .appendField(Blockly.Msg.LEAPHY_LED_SET_PIN)
            .setCheck('Number');
        this.appendValueInput("LED_SET_LEDS", 'Number')
            .appendField(Blockly.Msg.LEAPHY_LED_SET_LEDS)
            .setCheck('Number');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('leaphy_blocks');        
    }
};

Blockly.Blocks["leaphy_led_set_basic"] = {
    init: function(){
        this.appendDummyInput()
            .appendField(Blockly.Msg.LEAPHY_LED_SET_BASIC);
        this.appendValueInput("LED_SET_LED", 'Number')
            .appendField(Blockly.Msg.LEAPHY_LED_BASIC_LED)
            .setCheck('Number');
        this.appendValueInput("LED_BASIC_RED", 'Number')
            .appendField(Blockly.Msg.LEAPHY_LED_BASIC_RED)
            .setCheck('Number');
        this.appendValueInput("LED_BASIC_GREEN", 'Number')
            .appendField(Blockly.Msg.LEAPHY_LED_BASIC_GREEN)
            .setCheck('Number');
        this.appendValueInput("LED_BASIC_BLUE", 'Number')
            .appendField(Blockly.Msg.LEAPHY_LED_BASIC_BLUE)
            .setCheck('Number');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('leaphy_blocks');        
    }
};  

Blockly.Blocks["leaphy_led_set_speed"] = {
    init: function(){
        this.appendDummyInput()
            .appendField(Blockly.Msg.LEAPHY_LED_SET_SPEED);
        this.appendValueInput("LED_SET_SPEEDVALUE", 'Number')
            .appendField(Blockly.Msg.LEAPHY_LED_SET_SPEEDVALUE)
            .setCheck('Number');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('leaphy_blocks');
    }
};

Blockly.Blocks["leaphy_led_strip_demo"] = {
    init: function(){
        this.appendDummyInput()
            .appendField(Blockly.Msg.LEAPHY_LED_STRIP_DEMO)
            .appendField(new Blockly.FieldDropdown(ledstripDemoOptions), "DEMO_TYPE");
        this.appendValueInput("LED_STRIP_DEMO_RED", 'Number')
            .appendField(Blockly.Msg.LEAPHY_LED_STRIP_DEMO_RED)
            .setCheck('Number');
        this.appendValueInput("LED_STRIP_DEMO_GREEN", 'Number')
            .appendField(Blockly.Msg.LEAPHY_LED_STRIP_DEMO_GREEN)
            .setCheck('Number');
        this.appendValueInput("LED_STRIP_DEMO_BLUE", 'Number')
            .appendField(Blockly.Msg.LEAPHY_LED_STRIP_DEMO_BLUE)
            .setCheck('Number');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setStyle('leaphy_blocks');
    }
}