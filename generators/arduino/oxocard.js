'use strict';

goog.require('Blockly.Arduino');


Blockly.Arduino.oxocard_button_ispressed = function() {
  var dropdown_button = this.getFieldValue('BUTTON');
  var code = 'isButton' + dropdown_button + 'Pressed()';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};


Blockly.Arduino['oxocard_turn_off_with_buttons'] = function(block) {
	var valueL1= this.getFieldValue("L1").toLowerCase();
	var valueL2= this.getFieldValue("L2").toLowerCase();
	var valueL3= this.getFieldValue("L3").toLowerCase();
	var valueR1= this.getFieldValue("R1").toLowerCase();
	var valueR2= this.getFieldValue("R2").toLowerCase();
	var valueR3= this.getFieldValue("R3").toLowerCase();
	 return 'turnOff(createButtonByte(' +valueL1 +', ' +valueL2 +', '
		+ valueL3 +', ' +valueR1 +', ' +valueR2 +', ' +valueR3 +');\n';
};


Blockly.Arduino.oxocard_connect_to_internet = function(block) {
	 return 'oxocard.wifi->init();\noxocard.wifi->begin();\n';
};


Blockly.Arduino.oxocard_statemachine = function(block) {

	var defs = 'int statemachine_value = 0;\n';
	var code = '';
	console.log(block);
	console.log(block.stateCount_);

	for (var i = 0; i < block.states_.length; i++) {
		var stateName = block.states_[i].toUpperCase();
		defs = '#define STATE_'+ stateName + ' ' + i + '\n' + defs;

		var state_code = Blockly.Arduino.statementToCode(block, 'STATE' + i, Blockly.Arduino.ORDER_NONE);
		if(i > 0) code += 'else ';
		code += 'if(statemachine_value == ' + stateName + '){\n' + state_code + '\n}';

	}

	Blockly.Arduino.addDeclaration('STATEMENT_MACHINE', defs);

	return code += '\n';
};


/* ---------- Accelerometer ---------- */
Blockly.Arduino.oxocard_get_acceleration = function() {
  Blockly.Arduino.includes_['oxocard_runner'] = '#include "OXOcardRunner.h"\n';
  var dropdown_button = this.getFieldValue('AXIS');
  var code = 'getAccelerometer' + dropdown_button +'()';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

Blockly.Arduino.oxocard_set_cursor = function() {
	var posX = Blockly.Arduino.valueToCode(this, 'X', Blockly.Arduino.ORDER_NONE);
	var posY = Blockly.Arduino.valueToCode(this, 'Y', Blockly.Arduino.ORDER_NONE);
	return 'oxocard.setAccelerometerRootCursor(' + posX + ',' + posY + ');\n';
};
