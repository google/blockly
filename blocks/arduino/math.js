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
		this.appendValueInput('VAR', 'Variable')
			.setCheck('Number').setAlign(Blockly.ALIGN_RIGHT);
	

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
		this.appendValueInput('VAR', 'Variable')
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

Blockly.Blocks['math_set_var_with'] = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
			.appendField("Setze")
			.appendField(new Blockly.FieldVariable(
			Blockly.Msg.VARIABLES_DEFAULT_NAME), 'VAR');
		this.appendDummyInput()
			.appendField("mit")
			.appendField(new Blockly.FieldMathInput('1*(1+2)'), 'EXPRESSION')
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip("Tooltip");
		this.setColour('#000000');
	}
};
