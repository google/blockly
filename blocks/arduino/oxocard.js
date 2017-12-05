'use strict';

//To support syntax defined in http://arduino.cc/en/Reference/HomePage

goog.provide('Blockly.Blocks.oxocard');

goog.require('Blockly.Blocks');


Blockly.Blocks['oxocard_turn_off_with_buttons'] = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
	this.appendDummyInput()
	  .appendField("OXOcard ausschalten.")
	this.appendDummyInput()
		.appendField("Klicke die Tasten, mit denen du wieder")
	this.appendDummyInput()
		.appendField("einschalten möchtest:")
	this.appendDummyInput()
		.appendField(new Blockly.FieldButton(35,35,"L1"),"L1")
		.appendField(new Blockly.FieldPlaceholder(180,50))
		.appendField(new Blockly.FieldButton(35,35,"R1"),"R1")
	this.appendDummyInput()
		.appendField(new Blockly.FieldButton(35,35,"L2"),"L2")
		.appendField(new Blockly.FieldButton(35,35,"L3"),"L3")
		.appendField(new Blockly.FieldPlaceholder(70,60))
		.appendField(new Blockly.FieldButton(35,35,"R3"),"R3")
		.appendField(new Blockly.FieldButton(35,35,"R2"),"R2")
	// this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip("Tooltip");
		this.setColour('#000000');
	}
};
