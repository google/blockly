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

Blockly.Blocks.oxocard_time_update = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.OXOCARD_TIME_UPDATE_TITLE);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setTooltip(Blockly.Msg.OXOCARD_TIME_UPDATE_TIP);
		this.setColour(Blockly.ColorDefinitions.TIME);
	}
};

Blockly.Blocks.oxocard_get_time = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
		.appendField(Blockly.Msg.OXOCARD_TIME_GET_FROM_TITLE)
		.appendField(new Blockly.FieldDropdown([
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_1, "1"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_2, "2"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_3, "3"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_4, "4"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_5, "5"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_6, "6"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_7, "7"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_8, "8"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_9, "9"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_10, "10"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_11, "11"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_12, "12"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_13, "13"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_14, "14"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_15, "15"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_16, "16"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_17, "17"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_18, "18"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_19, "19"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_20, "20"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_21, "21"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_22, "22"],
			[Blockly.Msg.OXOCARD_TIME_GET_FROM_ID_23, "23"],]), "ZONE");
	this.setPreviousStatement(true, null);
	this.setNextStatement(true, null);
	this.setTooltip(Blockly.Msg.OXOCARD_TIME_GET_FROM_TIP);
	this.setColour(Blockly.ColorDefinitions.TIME);
	}
};

Blockly.Blocks.oxocard_time_get_value = {
	helpUrl: 'http://www.oxocard.ch/oxocard-befehle/',
	init: function() {
		this.appendDummyInput()
		.appendField(Blockly.Msg.OXOCARD_TIME_GET_VALUE_TITLE)
		.appendField(new Blockly.FieldDropdown([[Blockly.Msg.OXOCARD_TIME_GET_VALUE_SECOND, "Second"],
			[Blockly.Msg.OXOCARD_TIME_GET_VALUE_MINUTE, "Minute"],
			[Blockly.Msg.OXOCARD_TIME_GET_VALUE_HOUR, "Hour"],
			[Blockly.Msg.OXOCARD_TIME_GET_VALUE_WEEKDAY, "WeekDay"],
			[Blockly.Msg.OXOCARD_TIME_GET_VALUE_DAY, "Day"],
			[Blockly.Msg.OXOCARD_TIME_GET_VALUE_MONTH, "Month"],
			[Blockly.Msg.OXOCARD_TIME_GET_VALUE_YEAR, "Year"]]), "TYPE");
		this.setOutput(true, 'Number');
		this.setTooltip(Blockly.Msg.OXOCARD_TIME_GET_VALUE_TIP);
		this.setColour(Blockly.ColorDefinitions.TIME);
},
	getBlockType: function() {
		return Blockly.Types.DECIMAL;
	}
};
