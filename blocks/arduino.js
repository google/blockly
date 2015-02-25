'use strict';

goog.provide('Blockly.Blocks.arduino');

goog.require('Blockly.Blocks');



Blockly.Blocks['arduino_digital_write'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.setColour(30);
        this.appendDummyInput()
            .appendField("digital write")
            .appendField(new Blockly.FieldArduino('A'), 'PIN')
            .appendField("on/off")
            .appendField(new Blockly.FieldLight(true), 'TOGGLE')
            .appendField(" ");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
    }
};

Blockly.Blocks['arduino_digital_read'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.setColour(30);
        this.appendDummyInput()
            .appendField("digital read")
            .appendField(new Blockly.FieldArduino('1'), 'PIN')
            .appendField("  ");
        this.setInputsInline(true);
        this.setOutput(true, 'Boolean');
        this.setTooltip('');
    }
};



Blockly.Blocks['arduino_analog_write'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.setColour(30);
        this.appendDummyInput()
            .appendField("analog write")
            .appendField(new Blockly.FieldArduino('A'), 'PIN')
            .appendField("value");
        this.appendValueInput("Val")
            .setCheck("Number");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
    }
};

Blockly.Blocks['arduino_analog_read'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.setColour(30);
        this.appendDummyInput()
            .appendField("analog read")
            .appendField(new Blockly.FieldArduino('1'), 'PIN')
            .appendField("  ");
        this.setInputsInline(true);
        this.setOutput(true, 'Number');
        this.setTooltip('');
    }
};

Blockly.Blocks['arduino_tone'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.setColour(30);
        this.appendValueInput("tone")
            .setCheck("Number")
            .appendField("tone")
            .appendField(new Blockly.FieldArduino('A'), 'PIN')
            .appendField("note");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
    }
};

Blockly.Blocks['arduino_delay'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.setColour(135);
        this.appendDummyInput()
            .appendField("delay");
        this.appendValueInput("delay")
            .setCheck("Number");
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
    }
};