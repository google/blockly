'use strict';

//To support syntax defined in http://arduino.cc/en/Reference/HomePage

goog.provide('Blockly.Blocks.oxocard.display');

goog.require('Blockly.Blocks');

Blockly.Blocks.oxocard_matrix_draw_image = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.OXOCARD_DRAW_IMAGE_TITLE);
		for(var i=0, l=8; i<l; i++){
			var input = this.appendDummyInput();
			for(var j=0, ll=8; j<ll; j++){
				input.appendField(new Blockly.FieldLed('FALSE'), i + '' + j);
			}
		}
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_DRAW_IMAGE_TIP);
		this.setColour(100);
	}
};

Blockly.Blocks.oxocard_matrix_set_color = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
		.appendField(Blockly.Msg.OXOCARD_DRAW_IMAGE_TITLE)
		.appendField(new Blockly.FieldColour(), 'COLOR');
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		//this.setTooltip(Blockly.Msg.OXOCARD_DRAW_IMAGE_TIP);
		this.setColour(100);
	}
};

Blockly.Blocks.oxocard_matrix_update = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
		.appendField("Update");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		//this.setTooltip(Blockly.Msg.OXOCARD_DRAW_IMAGE_TIP);
		this.setColour(100);
	}
};