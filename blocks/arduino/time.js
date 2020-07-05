/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Blocks for Arduino Time functions.
 *     The arduino built in functions syntax can be found in
 *     http://arduino.cc/en/Reference/HomePage
 */
'use strict';

goog.provide('Blockly.Blocks.time');

goog.require('Blockly.Blocks');
goog.require('Blockly.Types');


/** Common HSV hue for all blocks in this category. */
Blockly.Blocks.time.HUE = 140;

Blockly.Blocks['time_delay'] = {
  /**
   * Delay block definition
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl('http://arduino.cc/en/Reference/Delay');
    this.setColour(Blockly.Blocks.time.HUE);
    this.appendValueInput('DELAY_TIME_MILI')
        .setCheck(Blockly.Types.NUMBER.checkList)
        .appendField(Blockly.Msg.ARD_TIME_DELAY);
    this.appendDummyInput()
        .appendField(Blockly.Msg.ARD_TIME_MS);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.ARD_TIME_DELAY_TIP);
  }
};

Blockly.Blocks['time_delaymicros'] = {
  /**
   * delayMicroseconds block definition
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl('http://arduino.cc/en/Reference/DelayMicroseconds');
    this.setColour(Blockly.Blocks.time.HUE);
    this.appendValueInput('DELAY_TIME_MICRO')
        .setCheck(Blockly.Types.NUMBER.checkList)
        .appendField(Blockly.Msg.ARD_TIME_DELAY);
    this.appendDummyInput()
        .appendField(Blockly.Msg.ARD_TIME_DELAY_MICROS);
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setTooltip(Blockly.Msg.ARD_TIME_DELAY_MICRO_TIP);
  }
};

Blockly.Blocks['time_millis'] = {
  /**
   * Elapsed time in milliseconds block definition
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl('http://arduino.cc/en/Reference/Millis');
    this.setColour(Blockly.Blocks.time.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.ARD_TIME_MILLIS);
    this.setOutput(true, Blockly.Types.LARGE_NUMBER.output);
    this.setTooltip(Blockly.Msg.ARD_TIME_MILLIS_TIP);
  },
  /** @return {string} The type of return value for the block, an integer. */
  getBlockType: function() {
    return Blockly.Types.LARGE_NUMBER;
  }
};

Blockly.Blocks['time_micros'] = {
  /**
   * Elapsed time in microseconds block definition
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl('http://arduino.cc/en/Reference/Micros');
    this.setColour(Blockly.Blocks.time.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.ARD_TIME_MICROS);
    this.setOutput(true, Blockly.Types.LARGE_NUMBER.output);
    this.setTooltip(Blockly.Msg.ARD_TIME_MICROS_TIP);
  },
  /**
   * Should be a long (32bit), but  for for now an int.
   * @return {string} The type of return value for the block, an integer.
   */
  getBlockType: function() {
    return Blockly.Types.LARGE_NUMBER;
  }
};

Blockly.Blocks['infinite_loop'] = {
  /**
   * Waits forever, end of program.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl('');
    this.setColour(Blockly.Blocks.time.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.ARD_TIME_INF);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setTooltip(Blockly.Msg.ARD_TIME_INF_TIP);
  }
};
