/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Arduino blocks for the Servo library.
 *     The Arduino Servo functions can be found in
 *     http://arduino.cc/en/reference/servo
 *
 * TODO: Add angle selector instead of block input.
 */
'use strict';

goog.provide('Blockly.Blocks.servo');

goog.require('Blockly.Blocks');
goog.require('Blockly.Types');


/** Common HSV hue for all blocks in this category. */
Blockly.Blocks.servo.HUE = 60;

Blockly.Blocks['servo_write'] = {
  /**
   * Block for writing an angle value into a servo pin.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl('http://arduino.cc/en/Reference/ServoWrite');
    this.setColour(Blockly.Blocks.servo.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.ARD_SERVO_WRITE)
        .appendField(new Blockly.FieldDropdown(
            Blockly.Arduino.Boards.selected.digitalPins), 'SERVO_PIN');
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

Blockly.Blocks['servo_read'] = {
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
        this, 'SERVO_PIN', 'digitalPins');
  }
};
