/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Blocks for Arduino Tone generation
 *     The Arduino function syntax can be found at
 *     https://www.arduino.cc/en/Reference/tone
 *
 */
'use strict';

goog.provide('Blockly.Blocks.tone');

goog.require('Blockly.Blocks');
goog.require('Blockly.Types');

/** Common HSV hue for all blocks in this category. */
Blockly.Blocks.tone.HUE = 250;

Blockly.Blocks['io_tone'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.ARD_SETTONE)
        .appendField(new Blockly.FieldDropdown(
            Blockly.Arduino.Boards.selected.digitalPins), "TONEPIN");
    this.appendValueInput("FREQUENCY")
        .setCheck(Blockly.Types.NUMBER.checkList)
        .appendField(Blockly.Msg.ARD_TONEFREQ);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.tone.HUE);
    this.setTooltip(Blockly.Msg.ARD_TONE_TIP);
    this.setHelpUrl('https://www.arduino.cc/en/Reference/tone');
  },
  /**
   * Called whenever anything on the workspace changes.
   * It checks frequency values and sets a warning if out of range.
   * @this Blockly.Block
   */
  onchange: function(event) {
    if (!this.workspace || event.type == Blockly.Events.MOVE ||
        event.type == Blockly.Events.UI) {
        return;  // Block deleted or irrelevant event
    }
    var freq = Blockly.Arduino.valueToCode(
        this, "FREQUENCY", Blockly.Arduino.ORDER_ATOMIC)
    if (freq < 31 || freq > 65535) {
      this.setWarningText(Blockly.Msg.ARD_TONE_WARNING, 'io_tone');
    } else {
      this.setWarningText(null, 'io_tone');
    }
  },
  /** @return {!string} The type of input value for the block, an integer. */
  getBlockType: function() {
    return Blockly.Types.NUMBER;
  }
};

Blockly.Blocks['io_notone'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.ARD_NOTONE)
        .appendField(new Blockly.FieldDropdown(
            Blockly.Arduino.Boards.selected.digitalPins), "TONEPIN");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.tone.HUE);
    this.setTooltip(Blockly.Msg.ARD_NOTONE_TIP);
    this.setHelpUrl('https://www.arduino.cc/en/Reference/noTone');
  },
    /** @return {!string} The type of input value for the block, an integer. */
  getBlockType: function() {
    return Blockly.Types.NUMBER;
  }
};
