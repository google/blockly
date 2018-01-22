'use strict';

goog.provide('Blockly.Blocks.time');

goog.require('Blockly.Blocks');
goog.require('Blockly.Types');
goog.require('Blockly.ColorDefinitions');


/** Common HSV hue for all blocks in this category. */
Blockly.Blocks.time.HUE = 140;

Blockly.Blocks['oxocard_time_delay'] = {
	init: function() {
	this.setHelpUrl('http://arduino.cc/en/Reference/Delay');
	this.setColour(Blockly.ColorDefinitions.TIME);
	this.appendValueInput('DELAY_TIME_MILI')
		.setCheck(Blockly.Types.NUMBER.checkList).appendField(Blockly.Msg.ARD_TIME_DELAY);
	this.appendDummyInput()
		.appendField(Blockly.Msg.ARD_TIME_MS);

	this.setInputsInline(true);
	this.setPreviousStatement(true, null);
	this.setNextStatement(true, null);
	this.setTooltip(Blockly.Msg.ARD_TIME_DELAY_TIP);
	}
};
