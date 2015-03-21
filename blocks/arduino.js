'use strict';

goog.provide('Blockly.Blocks.arduino');

goog.require('Blockly.Blocks');

Blockly.Blocks.arduino.HUE = 210;
Blockly.Blocks.arduino.HUE_INNER_1 = 30;
Blockly.Blocks.arduino.HUE_INNER_2 = 290;

/*
var DIGITAL_WRITE = 'digitalWrite';
var DIGITAL_READ = 'digitalRead';
var ANALOG_WRITE = 'analogWrite';
var ANALOG_READ = 'analogRead';
var DELAY = 'delay';
var TONE = 'tone';
var NO_TONE = 'noTone';
*/

var DIGITAL_WRITE = 'turn';
var DIGITAL_READ = 'digital value of';
var ANALOG_WRITE = 'make';
var ANALOG_READ = 'analog value of';
var DELAY = 'wait';
var TONE = 'play';
var NO_TONE = 'stop playing on';
var REPEAT_FOREVER = 'start loop';
var DO = '';


Blockly.Blocks['arduino_pin'] = {
  init: function() {
    this.setColour(Blockly.Blocks.arduino.HUE_INNER_1);
    this.appendDummyInput()
        .appendField(new Blockly.FieldArduino('Output A'), 'PIN');
    this.setOutput(true, 'Pin');
    this.setTooltip('');
  }
};

Blockly.Blocks['arduino_uno_pin'] = {
  init: function() {
    this.setColour(Blockly.Blocks.arduino.HUE_INNER_1);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(
           [["Light", "13 "],
            ["Pin\u00A01", "1"],
            ["Pin\u00A02", "2"],
            ["Pin\u00A03", "3"],
            ["Pin\u00A04", "4"],
            ["Pin\u00A05", "5"],
            ["Pin\u00A06", "6"],
            ["Pin\u00A07", "7"],
            ["Pin\u00A08", "8"],
            ["Pin\u00A09", "9"],
            ["Pin\u00A010", "10"],
            ["Pin\u00A011", "11"],
            ["Pin\u00A012", "12"],
            ["Pin\u00A013", "13"],
            ["Pin\u00A0A0", "A0"],
            ["Pin\u00A0A1", "A1"],
            ["Pin\u00A0A2", "A2"],
            ["Pin\u00A0A3", "A3"],
            ["Pin\u00A0A4", "A4"],
            ["Pin\u00A0A5", "A5"]]
        ), 'PIN');
    this.setOutput(true, 'Pin');
    this.setTooltip('');
  }
};

Blockly.Blocks['arduino_digital'] = {
  init: function() {
    this.setColour(Blockly.Blocks.arduino.HUE_INNER_2);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["On", "HIGH"], ["Off", "LOW"]]), 'DIGITAL');
    this.setOutput(true, 'Digital');
    this.setTooltip('');
  }
};

Blockly.Blocks['arduino_switchstate'] = {
  init: function() {
    this.setColour(Blockly.Blocks.arduino.HUE_INNER_2);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["Unpressed", "HIGH"], ["Pressed", "LOW"]]), 'DIGITAL');
    this.setOutput(true, 'Digital');
    this.setTooltip('');
  }
};

Blockly.Blocks['arduino_frequency'] = {
  init: function() {
    this.setColour(Blockly.Blocks.math.HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(
            // [["Note B0", "NOTE_B0"],
            // ["Note C1", "NOTE_C1"],
            // ["Note CS1", "NOTE_CS1"],
            // ["Note D1", "NOTE_D1"],
            // ["Note DS1", "NOTE_DS1"],
            // ["Note E1", "NOTE_E1"],
            // ["Note F1", "NOTE_F1"],
            // ["Note FS1", "NOTE_FS1"],
            // ["Note G1", "NOTE_G1"],
            // ["Note GS1", "NOTE_GS1"],
            // ["Note A1", "NOTE_A1"],
            // ["Note AS1", "NOTE_AS1"],
            // ["Note B1", "NOTE_B1"],
            // ["Note C2", "NOTE_C2"],
            // ["Note CS2", "NOTE_CS2"],
            // ["Note D2", "NOTE_D2"],
            // ["Note DS2", "NOTE_DS2"],
            // ["Note E2", "NOTE_E2"],
            // ["Note F2", "NOTE_F2"],
            // ["Note FS2", "NOTE_FS2"],
            // ["Note G2", "NOTE_G2"],
            // ["Note GS2", "NOTE_GS2"],
            // ["Note A2", "NOTE_A2"],
            // ["Note AS2", "NOTE_AS2"],
            // ["Note B2", "NOTE_B2"],
            // ["Note C3", "NOTE_C3"],
            // ["Note CS3", "NOTE_CS3"],
            // ["Note D3", "NOTE_D3"],
            // ["Note DS3", "NOTE_DS3"],
            // ["Note E3", "NOTE_E3"],
            // ["Note F3", "NOTE_F3"],
            // ["Note FS3", "NOTE_FS3"],
            // ["Note G3", "NOTE_G3"],
            // ["Note GS3", "NOTE_GS3"],
            // ["Note A3", "NOTE_A3"],
            // ["Note AS3", "NOTE_AS3"],
            // ["Note B3", "NOTE_B3"],
            [["Note\u00A0C4", "NOTE_C4"],
            ["Note\u00A0CS4", "NOTE_CS4"],
            ["Note\u00A0D4", "NOTE_D4"],
            ["Note\u00A0DS4", "NOTE_DS4"],
            ["Note\u00A0E4", "NOTE_E4"],
            ["Note\u00A0F4", "NOTE_F4"],
            ["Note\u00A0FS4", "NOTE_FS4"],
            ["Note\u00A0G4", "NOTE_G4"],
            ["Note\u00A0GS4", "NOTE_GS4"],
            ["Note\u00A0A4", "NOTE_A4"],
            ["Note\u00A0AS4", "NOTE_AS4"],
            ["Note\u00A0B4", "NOTE_B4"]]
            // ["Note C5", "NOTE_C5"],
            // ["Note CS5", "NOTE_CS5"],
            // ["Note D5", "NOTE_D5"],
            // ["Note DS5", "NOTE_DS5"],
            // ["Note E5", "NOTE_E5"],
            // ["Note F5", "NOTE_F5"],
            // ["Note FS5", "NOTE_FS5"],
            // ["Note G5", "NOTE_G5"],
            // ["Note GS5", "NOTE_GS5"],
            // ["Note A5", "NOTE_A5"],
            // ["Note AS5", "NOTE_AS5"],
            // ["Note B5", "NOTE_B5"],
            // ["Note C6", "NOTE_C6"],
            // ["Note CS6", "NOTE_CS6"],
            // ["Note D6", "NOTE_D6"],
            // ["Note DS6", "NOTE_DS6"],
            // ["Note E6", "NOTE_E6"],
            // ["Note F6", "NOTE_F6"],
            // ["Note FS6", "NOTE_FS6"],
            // ["Note G6", "NOTE_G6"],
            // ["Note GS6", "NOTE_GS6"],
            // ["Note A6", "NOTE_A6"],
            // ["Note AS6", "NOTE_AS6"],
            // ["Note B6", "NOTE_B6"],
            // ["Note C7", "NOTE_C7"],
            // ["Note CS7", "NOTE_CS7"],
            // ["Note D7", "NOTE_D7"],
            // ["Note DS7", "NOTE_DS7"],
            // ["Note E7", "NOTE_E7"],
            // ["Note F7", "NOTE_F7"],
            // ["Note FS7", "NOTE_FS7"],
            // ["Note G7", "NOTE_G7"],
            // ["Note GS7", "NOTE_GS7"],
            // ["Note A7", "NOTE_A7"],
            // ["Note AS7", "NOTE_AS7"],
            // ["Note B7", "NOTE_B7"],
            // ["Note C8", "NOTE_C8"],
            // ["Note CS8", "NOTE_CS8"],
            // ["Note D8", "NOTE_D8"],
            // ["Note DS8", "NOTE_DS8"]]
        ), 'NUM');
    this.setOutput(true, 'Number');
    this.setTooltip('');
  }
};

Blockly.Blocks['arduino_digital_write'] = {
  init: function() {
    this.setColour(Blockly.Blocks.arduino.HUE);
    this.appendDummyInput()
        .appendField(DIGITAL_WRITE);
    this.appendValueInput("pin").setCheck("Pin");
    this.appendValueInput("value").setCheck("Digital");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setTooltip('');
  }
};

Blockly.Blocks['arduino_digital_read'] = {
    init: function() {
        this.setColour(Blockly.Blocks.arduino.HUE);
        this.appendDummyInput()
            .appendField(DIGITAL_READ);
        this.appendValueInput("pin").setCheck("Pin");
        this.setInputsInline(true);
        this.setOutput(true, 'Digital');
        this.setTooltip('');
    }
};

Blockly.Blocks['arduino_analog_write'] = {
    init: function() {
        this.setColour(Blockly.Blocks.arduino.HUE);
        this.appendDummyInput()
            .appendField(ANALOG_WRITE);
        this.appendValueInput("pin").setCheck("Pin");
        this.appendValueInput("value").setCheck("Number");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setInputsInline(true);
        this.setTooltip('');
    }
};

Blockly.Blocks['arduino_analog_read'] = {
    init: function() {
        this.setColour(Blockly.Blocks.arduino.HUE);
        this.appendDummyInput()
            .appendField(ANALOG_READ);
        this.appendValueInput("pin").setCheck("Pin");
        this.setInputsInline(true);
        this.setOutput(true, 'Number');
        this.setTooltip('');
    }
};

Blockly.Blocks['arduino_tone'] = {
    init: function() {
        this.setColour(Blockly.Blocks.arduino.HUE);
        this.appendDummyInput().appendField(TONE);
        this.appendValueInput("frequency").setCheck("Number");
        this.appendDummyInput().appendField("on");
        this.appendValueInput("pin").setCheck("pin");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
    }
};

Blockly.Blocks['arduino_notone'] = {
    init: function() {
        this.setColour(Blockly.Blocks.arduino.HUE);
        this.appendDummyInput().appendField(NO_TONE);
        this.appendValueInput("pin").setCheck("pin");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
    }
};

Blockly.Blocks['arduino_delay'] = {
    init: function() {
        this.setColour(Blockly.Blocks.arduino.HUE);
        this.appendDummyInput().appendField(DELAY);
        this.appendValueInput("time").setCheck("Number");
        this.appendDummyInput().appendField("milliseconds");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
    }
};

Blockly.Blocks['arduino_repeat_forever'] = {
  init: function() {
    this.setColour(Blockly.Blocks.loops.HUE);
    this.appendDummyInput()
        .appendField(REPEAT_FOREVER);
    this.appendStatementInput('DO')
        .appendField(DO);
    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setMovable(false);
  }
};

Blockly.Blocks['arduino_disable_input_lights'] = {
    init: function() {
        this.setColour(Blockly.Blocks.loops.HUE);
        this.appendDummyInput()
        .appendField("disable input lights");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
    }
};