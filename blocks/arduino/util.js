'use strict';

//To support syntax defined in http://arduino.cc/en/Reference/HomePage

goog.provide('Blockly.Blocks.oxocard.util');

goog.require('Blockly.Blocks');
goog.require('Blockly.ColorDefinitions');


Blockly.Blocks['oxocard_random'] = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.OXOCARD_RANDOM_TITLE)
			.appendField(new Blockly.FieldTextInput('1', Blockly.FieldTextInput.numberValidator),'NUM');
		this.setOutput(true, 'Number');
		this.setTooltip(Blockly.Msg.OXOCARD_RANDOM_TIP);
		this.setColour(Blockly.ColorDefinitions.VARIABLES);
	},
	getBlockType: function() {
	  return Blockly.Types.NUMBER;
	}
  };

  Blockly.Blocks['infinite_loop'] = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.setColour(Blockly.ColorDefinitions.VARIABLES);
		this.appendDummyInput()
			.appendField(Blockly.Msg.ARD_TIME_INF);
		this.setInputsInline(true);
		this.setPreviousStatement(true);
		this.setTooltip(Blockly.Msg.ARD_TIME_INF_TIP);
	}
  };
