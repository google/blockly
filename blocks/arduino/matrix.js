'use strict';

//To support syntax defined in http://arduino.cc/en/Reference/HomePage

goog.provide('Blockly.Blocks.oxocard.display');

goog.require('Blockly.Blocks');

Blockly.Blocks.oxocard_matrix_draw_image = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.OXOCARD_MATRIX_DRAW_IMAGE_TITLE);
		for(var i=0, l=8; i<l; i++){
			var input = this.appendDummyInput();
			for(var j=0, ll=8; j<ll; j++){
				input.appendField(new Blockly.FieldLed('FALSE'), i + '' + j);
			}
		}
		this.appendDummyInput();
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_MATRIX_DRAW_IMAGE_TIP);
		this.setColour('#000000');
	}
};


Blockly.Blocks.oxocard_matrix_draw_rgb_image = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		var theColor = new Blockly.FieldColour();

		this.appendDummyInput()
			.appendField(Blockly.Msg.OXOCARD_MATRIX_DRAW_RGB_IMAGE_TITLE);
		for(var i=0, l=8; i<l; i++){
			var input = this.appendDummyInput();
			for(var j=0, ll=8; j<ll; j++){
				var rgbLed = new Blockly.FieldRGBLed('FALSE');
				rgbLed.setSource(theColor);
				input.appendField(rgbLed , i + '' + j);
			}
		}
		this.appendDummyInput().appendField(theColor, 'COLOR');
		this.appendDummyInput();
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_MATRIX_DRAW_RGB_IMAGE_TIP);
		this.setColour('#000000');
	}
};

Blockly.Blocks.oxocard_matrix_set_color = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
		.appendField(Blockly.Msg.OXOCARD_MATRIX_SET_COLOR_TITLE)
		.appendField(new Blockly.FieldColour(), 'COLOR');
		this.appendDummyInput();
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_MATRIX_SET_COLOR_TIP);
		this.setColour('#000000');
	}
};

Blockly.Blocks.oxocard_matrix_update = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
		.appendField(Blockly.Msg.OXOCARD_MATRIX_UPDATE_TITLE);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_MATRIX_UPDATE_TIP);
		this.setColour('#000000');
	}
};