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

var digitalPinOptions = [["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"], ["6", "6"], ["7", "7"], ["8", "8"], ["9", "9"], ["10", "10"], ["11", "11"], ["12", "12"], ["13", "13"], ["14", "14"], ["15", "15"], ["16", "16"], ["17", "17"], ["18", "18"], ["19", "19"]];
var ledstripDemoOptions = [["%{BKY_LEAPHY_LED_STRIP_LIGHTBANK}", "0"], ["%{BKY_LEAPHY_LED_STRIP_BREATHE}", "1"], ["%{BKY_LEAPHY_LED_STRIP_GULF}", "3"], ["%{BKY_LEAPHY_LED_STRIP_RAINBOW}", "4"], ["%{BKY_LEAPHY_LED_STRIP_COLORGULF}", "5"]];

var colorTypes = [["%{BKY_LEAPHY_RGB_COLOR_RED}", "0"], ["%{BKY_LEAPHY_RGB_COLOR_GREEN}", "1"], ["%{BKY_LEAPHY_RGB_COLOR_BLUE}", "2"]];
var colorTypesRaw = [["%{BKY_LEAPHY_RGB_RAW_COLOR_RED}", "0"], ["%{BKY_LEAPHY_RGB_RAW_COLOR_GREEN}", "1"], ["%{BKY_LEAPHY_RGB_RAW_COLOR_BLUE}", "2"]];

Blockly.Blocks["leaphy_rgb_color"] = {
  init: function(){
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(colorTypes), "COLOR_TYPE");
    this.setOutput(true, 'Number');
    this.setStyle('leaphy_blocks');
  }
};

Blockly.Blocks["leaphy_rgb_color_raw"] = {
  init: function(){
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(colorTypesRaw), "COLOR_TYPE_RAW");
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
};

Blockly.Blocks['leaphy_servo_write'] = {
  /**
     * Block for writing an angle value into a servo pin.
     * @this Blockly.Block
     */
  init: function() {
    this.setHelpUrl('http://arduino.cc/en/Reference/ServoWrite');
    this.setColour(Blockly.Blocks.servo.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.ARD_SERVO_WRITE)
        .appendField(new Blockly.FieldDropdown(digitalPinOptions), 'SERVO_PIN');
    this.setInputsInline(false);
    this.appendValueInput('SERVO_ANGLE')
        .setCheck(Blockly.Types.NUMBER.checkList)
        .appendField(Blockly.Msg.ARD_SERVO_WRITE_TO);
    this.appendDummyInput()
        .appendField(Blockly.Msg.ARD_SERVO_WRITE_DEG_180);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.ARD_SERVO_WRITE_TIP);
    this.setStyle('leaphy_blocks');
  },
  /**
     * Updates the content of the the pin related fields.
     * @this Blockly.Block
     */
  updateFields: function() {
    Blockly.Arduino.Boards.refreshBlockFieldDropdown(
        this, 'SERVO_PIN', 'digitalPins');
  }
};
  
Blockly.Blocks['leaphy_servo_read'] = {
  /**
     * Block for reading an angle value of a servo pin.
     * @this Blockly.Block
     */
  init: function() {
    this.setHelpUrl('http://arduino.cc/en/Reference/ServoRead');
    this.setColour(Blockly.Blocks.servo.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.ARD_SERVO_READ)
        .appendField(new Blockly.FieldDropdown(
            Blockly.Arduino.Boards.selected.digitalPins), 'SERVO_PIN');
    this.setOutput(true, Blockly.Types.NUMBER.output);
    this.setTooltip(Blockly.Msg.ARD_SERVO_READ_TIP);
    this.setStyle('leaphy_blocks');
  },
  /** @return {string} The type of     return value for the block, an integer. */
  getBlockType: function() {
    return Blockly.Types.NUMBER;
  },
  /**
     * Updates the content of the the pin related fields.
     * @this Blockly.Block
     */
  updateFields: function() {
    Blockly.Arduino.Boards.refreshBlockFieldDropdown(
        this, 'SERVO_PIN', 'digitalPins');
  }
};

Blockly.Blocks['leaphy_io_digitalwrite'] = {
  /**
     * Block for creating a 'set pin' to a state.
     * @this Blockly.Block
     */
  init: function() {
    this.setHelpUrl('http://arduino.cc/en/Reference/DigitalWrite');
    this.setColour(Blockly.Blocks.io.HUE);
    this.appendValueInput('STATE')
        .appendField(Blockly.Msg.ARD_DIGITALWRITE)
        .appendField(new Blockly.FieldDropdown(digitalPinOptions), 'PIN')
        .appendField(Blockly.Msg.ARD_WRITE_TO)
        .setCheck(Blockly.Types.BOOLEAN.checkList);
    this.setInputsInline(false);
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
        this, 'PIN', 'digitalPins');
  }
};

Blockly.Blocks['leaphy_io_analogwrite'] = {
  /**
     * Block for creating a 'set pin' to an analogue value.
     * @this Blockly.Block
     */
  init: function() {
    this.setHelpUrl('http://arduino.cc/en/Reference/AnalogWrite');
    this.setColour(Blockly.Blocks.io.HUE);
    this.appendValueInput('NUM')
        .appendField(Blockly.Msg.ARD_ANALOGWRITE)
        .appendField(new Blockly.FieldDropdown(
            Blockly.Arduino.Boards.selected.pwmPins), 'PIN')
        .appendField(Blockly.Msg.ARD_WRITE_TO)
        .setCheck(Blockly.Types.NUMBER.output);
    this.setInputsInline(false);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.ARD_ANALOGWRITE_TIP);
    this.setStyle('leaphy_blocks');
  },
  /**
   * Updates the content of the the pin related fields.
   * @this Blockly.Block
   */
  updateFields: function() {
    Blockly.Arduino.Boards.refreshBlockFieldDropdown(this, 'PIN', 'pwmPins');
  },
  /** @return {!string} The type of input value for the block, an integer. */
  getBlockType: function() {
    return Blockly.Types.NUMBER;
  },
};

Blockly.Blocks['leaphy_sonar_read'] = {
  /**
     * Block for reading sonar value.
     * @this Blockly.Block
     */
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.LEAPHY_SONAR_READ_TRIG)
        .appendField(new Blockly.FieldDropdown(digitalPinOptions), 'TRIG_PIN')
        .appendField(Blockly.Msg.LEAPHY_SONAR_READ_ECHO)
        .appendField(new Blockly.FieldDropdown(digitalPinOptions), 'ECHO_PIN');
    this.setOutput(true, Blockly.Types.NUMBER.output);
    this.setTooltip(Blockly.Msg.LEAPHY_SONAR_READ_TIP);
    this.setStyle('leaphy_blocks');
  },
  /** @return {string} The type of return value for the block, an integer. */
  getBlockType: function() {
    return Blockly.Types.NUMBER;
  },
  /**
     * Updates the content of the the pin related fields.
     * @this Blockly.Block
     */
  updateFields: function() {
    Blockly.Arduino.Boards.refreshBlockFieldDropdown(
        this, 'TRIG_PIN', 'digitalPins');
  }
};

Blockly.Blocks['leaphy_display_print_line'] = {
  /**
     * Block for printing line to OLED display
     * @this Blockly.Block
     */
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.LEAPHY_DISPLAY_PRINT);
    this.appendValueInput('VALUE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('leaphy_blocks');
  },
};

Blockly.Blocks['leaphy_display_print_value'] = {
  /**
     * Block for printing value to OLED display
     * @this Blockly.Block
     */
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.LEAPHY_DISPLAY_PRINT);
    this.appendValueInput('NAME');
    this.appendDummyInput()
        .appendField("=");
    this.appendValueInput('VALUE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setStyle('leaphy_blocks');
  },
};

