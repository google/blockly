'use strict';

goog.require('Blockly.Arduino');

Blockly.Arduino.oxocard_matrix_draw_image = function() {
	
	var code = 'oxocard.matrix->drawImage(';
	for(var i=0, l=8; i<l; i++){
		if(i!=0) code += "\t\t";
		code += '0b';
		for(var j=0, ll=8; j<l; j++){
			code += (this.getFieldValue(i + '' + j) == 'TRUE') ? '1' : '0';
		}
		code += ',';
		if (i != l-1) code += '\n';
	}
	console.log(code);
	return code += ' 0, 0);\n';
};


Blockly.Arduino.oxocard_matrix_set_color = function() {
	var code = 'oxocard.matrix->setForeColor(';
	var value= this.getFieldValue('COLOR');
	var r = parseInt(value.substring(1,3),16);
	var g = parseInt(value.substring(3,5),16);
	var b = parseInt(value.substring(5,7),16);
	return code += 'makeRGBVal(' + r + ', ' + g + ', ' + b + '));\n';
};


Blockly.Arduino.oxocard_matrix_update = function() {
	return 'oxocard.matrix->update();';
};