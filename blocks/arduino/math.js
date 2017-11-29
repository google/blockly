'use strict';

//To support syntax defined in http://arduino.cc/en/Reference/HomePage

goog.provide('Blockly.Blocks.oxocard.math');

goog.require('Blockly.Blocks');


Blockly.Blocks['math_decrement'] = {
	/**
	 * Block for adding to a variable in place.
	 * @this Blockly.Block
	 */
	init: function() {
	  this.jsonInit({
		"message0": Blockly.Msg.MATH_DECREMENT_TITLE,
		"args0": [
		  {
			"type": "field_variable",
			"name": "VAR",
			"variable": Blockly.Msg.MATH_DECREMENT_TITLE_ITEM
		  },
		  {
			"type": "input_value",
			"name": "DELTA",
			"check": Blockly.Types.NUMBER.checkList,
			"align": "RIGHT"
		  }
		],
		"previousStatement": null,
		"nextStatement": null,
		"colour": Blockly.Blocks.variables.HUE,
		"helpUrl": Blockly.Msg.MATH_DECREMENT_HELPURL
	  });
	  // Assign 'this' to a variable for use in the tooltip closure below.
	  var thisBlock = this;
	  this.setTooltip(function() {
		return Blockly.Msg.MATH_DECREMENT_TOOLTIP.replace('%1',
			thisBlock.getFieldValue('VAR'));
	  });
	},
	/**
	 * Gets the variable type selected in the drop down, always an integer.
	 * @param {!string} varName Name of the variable selected in this block to
	 *     check.
	 * @return {string} String to indicate the variable type.
	 */
	getVarType: function(varName) {
	  return Blockly.Types.NUMBER;
	}
  };