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
	var posX = Blockly.Arduino.valueToCode(this, 'X', Blockly.Arduino.ORDER_NONE) || '0';
	var posY = Blockly.Arduino.valueToCode(this, 'Y', Blockly.Arduino.ORDER_NONE) || '0';
	return code = code  +posX +',' +posY +');\n';
};

Blockly.Arduino.oxocard_matrix_draw_rgb_image = function() {
	var posX = Blockly.Arduino.valueToCode(this, 'X', Blockly.Arduino.ORDER_NONE) || '0';
	var posY = Blockly.Arduino.valueToCode(this, 'Y', Blockly.Arduino.ORDER_NONE) || '0';
	posX = parseInt(posX, 10);
	posY = parseInt(posY, 10);
	var code = '';
	for(var i=0, l=8; i<l; i++){
		for(var j=0, ll=8; j<l; j++){
			let x = j + posX;
			let y = i + posY;
			if((x >= 0) && (x < 8) && (y >= 0) && (y < 8)){
				var value= this.getFieldValue(i + '' + j);
				if(value != 'FALSE'){
					var r = parseInt(value.substring(1,3),16);
					var g = parseInt(value.substring(3,5),16);
					var b = parseInt(value.substring(5,7),16);
					code += 'oxocard.matrix->drawPixel(';
					code += x + ', ' + y + ',';
					code += 'makeRGBVal(' + r + ', ' + g + ', ' + b + '));\n';
					continue;
				}
			}
		}
		code += '';
	}
	return code + '\n';
};

Blockly.Arduino.oxocard_matrix_set_color = function() {
	var code = 'oxocard.matrix->setForeColor(';
	var value = this.getFieldValue('COLOR');
	var r = parseInt(value.substring(1,3),16);
	var g = parseInt(value.substring(3,5),16);
	var b = parseInt(value.substring(5,7),16);
	return code += 'makeRGBVal(' + r + ', ' + g + ', ' + b + '));\n';
};

Blockly.Arduino.oxocard_matrix_set_color_var = function() {
	var code = 'oxocard.matrix->setForeColor(';
	var r = Blockly.Arduino.valueToCode(this, 'R', Blockly.Arduino.ORDER_NONE);
	var g = Blockly.Arduino.valueToCode(this, 'G', Blockly.Arduino.ORDER_NONE);
	var b = Blockly.Arduino.valueToCode(this, 'B', Blockly.Arduino.ORDER_NONE);
	return code += 'makeRGBVal(' + r + ', ' + g + ', ' + b + '));\n';
};

Blockly.Arduino.oxocard_matrix_update = function() {
	return 'oxocard.matrix->update();\n';
};

Blockly.Arduino.oxocard_matrix_draw_all = function(){
	var code = 'oxocard.matrix->fill();\n';
	code += 'oxocard.matrix->drawRectangle(0,0,8,8);\n';
	return code;
};

Blockly.Arduino.oxocard_matrix_clear = function(){
	return 'oxocard.matrix->clear();\n';
};

Blockly.Arduino.oxocard_matrix_set_fill = function(){
	return 'oxocard.matrix->fill();\n';
};

Blockly.Arduino.oxocard_matrix_set_nofill = function(){
	return 'oxocard.matrix->noFill();\n';
};

Blockly.Arduino.oxocard_matrix_set_nofill = function(){
	return 'oxocard.matrix->noFill();\n';
};

Blockly.Arduino.oxocard_matrix_draw_pixel = function() {
	var posX = Blockly.Arduino.valueToCode(this, 'X', Blockly.Arduino.ORDER_NONE);
	var posY = Blockly.Arduino.valueToCode(this, 'Y', Blockly.Arduino.ORDER_NONE);
	return 'oxocard.matrix->drawPixel(' + posX + ', ' + posY + ');\n';
};

Blockly.Arduino.oxocard_matrix_draw_line = function() {
	var fromX = Blockly.Arduino.valueToCode(this, 'FROM_X', Blockly.Arduino.ORDER_NONE);
	var fromY = Blockly.Arduino.valueToCode(this, 'FROM_Y', Blockly.Arduino.ORDER_NONE);
	var toX = Blockly.Arduino.valueToCode(this, 'TO_X', Blockly.Arduino.ORDER_NONE);
	var toY = Blockly.Arduino.valueToCode(this, 'TO_Y', Blockly.Arduino.ORDER_NONE);
	return 'oxocard.matrix->drawLine(' + fromX + ', ' + fromY + ', ' + toX + ', ' + toY + ');\n';
};

Blockly.Arduino.oxocard_matrix_draw_rectangle = function() {
	var x = Blockly.Arduino.valueToCode(this, 'X', Blockly.Arduino.ORDER_NONE);
	var y = Blockly.Arduino.valueToCode(this, 'Y', Blockly.Arduino.ORDER_NONE);
	var w = Blockly.Arduino.valueToCode(this, 'W', Blockly.Arduino.ORDER_NONE);
	var h = Blockly.Arduino.valueToCode(this, 'H', Blockly.Arduino.ORDER_NONE);
	return 'oxocard.matrix->drawRectangle(' + x + ', ' + y + ', ' + w + ', ' + h + ');\n';
};

Blockly.Arduino.oxocard_matrix_draw_triangle = function() {
	var xOne = Blockly.Arduino.valueToCode(this, 'X_ONE', Blockly.Arduino.ORDER_NONE);
	var yOne = Blockly.Arduino.valueToCode(this, 'Y_ONE', Blockly.Arduino.ORDER_NONE);
	var xTwo = Blockly.Arduino.valueToCode(this, 'X_TWO', Blockly.Arduino.ORDER_NONE);
	var yTwo = Blockly.Arduino.valueToCode(this, 'Y_TWO', Blockly.Arduino.ORDER_NONE);
	var xThree = Blockly.Arduino.valueToCode(this, 'X_THREE', Blockly.Arduino.ORDER_NONE);
	var yThree = Blockly.Arduino.valueToCode(this, 'Y_THREE', Blockly.Arduino.ORDER_NONE);
	return 'oxocard.matrix->drawTriangle(' + xOne + ', ' + yOne + ', ' + xTwo + ', ' + yTwo + ', ' + xThree + ', ' + yThree + ');\n';
};

Blockly.Arduino.oxocard_matrix_draw_circle = function() {
	var x = Blockly.Arduino.valueToCode(this, 'X', Blockly.Arduino.ORDER_NONE);
	var y = Blockly.Arduino.valueToCode(this, 'Y', Blockly.Arduino.ORDER_NONE);
	var r = Blockly.Arduino.valueToCode(this, 'R', Blockly.Arduino.ORDER_NONE);
	return 'oxocard.matrix->drawCircle(' + x + ', ' + y + ', ' + r + ');\n';
};

Blockly.Arduino.oxocard_matrix_draw_number = function() {
	var num = Blockly.Arduino.valueToCode(this, 'NUMBER', Blockly.Arduino.ORDER_NONE);
	return 'oxocard.displayNumber(' +num +');\n';
};

Blockly.Arduino.oxocard_matrix_draw_text = function() {
	var text = Blockly.Arduino.valueToCode(this, 'TEXT', Blockly.Arduino.ORDER_NONE);
	var isBigFont = this.getFieldValue('BUTTON').toLowerCase();
	return 'oxocard.displayText(' +text +',' +isBigFont +');\n';
};

Blockly.Arduino.oxocard_matrix_draw_weather = function() {
	return "oxocard.matrix->clear();\n"
			+"oxocard.matrix->setForeColor(oxocard.weather->getDrawableIconColor());\n"
			+"oxocard.matrix->drawImage(oxocard.weather->getDrawableIcon());\n"
			+"oxocard.matrix->update();\n";
};
