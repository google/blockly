'use strict';

goog.require('Blockly.Arduino');

Blockly.Arduino['oxocard_turn_off_with_buttons'] = function(block) {
  var code = '';

  var valueL1= this.getFieldValue("L1").toLowerCase();
  var valueL2= this.getFieldValue("L2").toLowerCase();
  var valueL3= this.getFieldValue("L3").toLowerCase();
  var valueR1= this.getFieldValue("R1").toLowerCase();
  var valueR2= this.getFieldValue("R2").toLowerCase();
  var valueR3= this.getFieldValue("R3").toLowerCase();

  return code += 'turnOff(createButtonByte(' +valueL1 +', ' +valueL2 +', '
  			+valueL3 +', ' +valueR1 +', ' +valueR2 +', ' +valueR3 +');\n';
};
