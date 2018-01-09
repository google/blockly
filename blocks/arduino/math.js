'use strict';

//To support syntax defined in http://arduino.cc/en/Reference/HomePage

goog.provide('Blockly.Blocks.oxocard.math');

goog.require('Blockly.Blocks');


Blockly.Blocks.math_decrement = {
	/**
	 * Block for adding to a variable in place.
	 * @this Blockly.Block
	 */
	init: function() {
		this.appendDummyInput()
		.appendField(Blockly.Msg.OXOCARD_MATH_DECREMENT_TITLE);
		this.appendDummyInput()
		  .appendField(new Blockly.FieldVariable(
		  Blockly.Msg.VARIABLES_DEFAULT_NAME), 'VAR');
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_MATH_DECREMENT_TIP);
		this.setColour('#000000');
	},
	getVarType: function(varName) {
		return Blockly.Types.NUMBER;
	}
};

Blockly.Blocks.math_increment = {
	/**
	 * Block for adding to a variable in place.
	 * @this Blockly.Block
	 */
	init: function() {
		this.appendDummyInput()
		.appendField(Blockly.Msg.OXOCARD_MATH_INCREMENT_TITLE);
		this.appendValueInput('VAR')
			.setCheck('Number').setAlign(Blockly.ALIGN_RIGHT);

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_MATH_INCREMENT_TIP);
		this.setColour('#000000');
	},
	getVarType: function(varName) {
		return Blockly.Types.NUMBER;
	}
};

Blockly.Blocks.math_set_var_with = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
			.appendField("T_ Setze")
			.appendField(new Blockly.FieldVariable(
			Blockly.Msg.VARIABLES_DEFAULT_NAME), 'VAR');
		this.appendDummyInput()
			.appendField("T_ mit")
			.appendField(new Blockly.FieldMathInput('1*(1+2)'), 'EXPRESSION')
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip("T_ Tooltip");
		this.setColour('#000000');
	}
};


Blockly.Blocks.math_set_var_random= {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
			.appendField("T_ Zufallszahl in")
			.appendField(new Blockly.FieldVariable(
			Blockly.Msg.VARIABLES_DEFAULT_NAME), 'VAR');
			this.appendValueInput('FROM')
				.appendField('T_ zw.')
				.setCheck('Number')
				.setAlign(Blockly.ALIGN_RIGHT);
			this.appendValueInput('TO')
				.appendField('T_ und')
				.setCheck('Number')
				.setAlign(Blockly.ALIGN_RIGHT);
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip("T_ Tooltip");
		this.setColour('#000000');
	}
};
