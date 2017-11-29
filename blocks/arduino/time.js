Blockly.Blocks['time_delaymicros'] = {
	/**
	 * delayMicroseconds block definition
	 * @this Blockly.Block
	 */
	init: function() {
	  this.setHelpUrl('http://arduino.cc/en/Reference/DelayMicroseconds');
	  this.setColour(Blockly.Blocks.time.HUE);
	  this.appendValueInput('DELAY_TIME_MICRO')
		  .setCheck(Blockly.Types.NUMBER.checkList)
		  .appendField(Blockly.Msg.ARD_TIME_DELAY);
	  this.appendDummyInput()
		  .appendField(Blockly.Msg.ARD_TIME_DELAY_MICROS);
	  this.setInputsInline(true);
	  this.setPreviousStatement(true, null);
	  this.setNextStatement(true, null);
	  this.setTooltip(Blockly.Msg.ARD_TIME_DELAY_MICRO_TIP);
	}
  };
  
  Blockly.Blocks['time_millis'] = {
	/**
	 * Elapsed time in milliseconds block definition
	 * @this Blockly.Block
	 */
	init: function() {
	  this.setHelpUrl('http://arduino.cc/en/Reference/Millis');
	  this.setColour(Blockly.Blocks.time.HUE);
	  this.appendDummyInput()
		  .appendField(Blockly.Msg.ARD_TIME_MILLIS);
	  this.setOutput(true, Blockly.Types.LARGE_NUMBER.output);
	  this.setTooltip(Blockly.Msg.ARD_TIME_MILLIS_TIP);
	},
	/** @return {string} The type of return value for the block, an integer. */
	getBlockType: function() {
	  return Blockly.Types.LARGE_NUMBER;
	}
  };
  
  Blockly.Blocks['time_micros'] = {
	/**
	 * Elapsed time in microseconds block definition
	 * @this Blockly.Block
	 */
	init: function() {
	  this.setHelpUrl('http://arduino.cc/en/Reference/Micros');
	  this.setColour(Blockly.Blocks.time.HUE);
	  this.appendDummyInput()
		  .appendField(Blockly.Msg.ARD_TIME_MICROS);
	  this.setOutput(true, Blockly.Types.LARGE_NUMBER.output);
	  this.setTooltip(Blockly.Msg.ARD_TIME_MICROS_TIP);
	},
	/**
	 * Should be a long (32bit), but  for for now an int.
	 * @return {string} The type of return value for the block, an integer.
	 */
	getBlockType: function() {
	  return Blockly.Types.LARGE_NUMBER;
	}
  };