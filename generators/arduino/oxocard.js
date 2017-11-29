'use strict';

goog.require('Blockly.Arduino');

Blockly.Arduino.oxocard_draw_image = function() {
	Blockly.Arduino.includes_['oxocard_runner'] = '#include "OXOcardRunner.h"\n';
	var code = 'drawImage(';
	for(var i=0, l=8; i<l; i++){
		if(i!=0) code += '          ';
		code += '0b';
		for(var j=0, ll=8; j<l; j++){
			code += (this.getFieldValue(i + '' + j) == 'TRUE') ? '1' : '0';
		}
		code += ',';
		if (i != l-1) code += '\n';
	}
	var brightness = Blockly.Arduino.valueToCode(this, 'BRIGHTNESS', Blockly.Arduino.ORDER_NONE);
	return code += ' ' + brightness + ');\n';
};