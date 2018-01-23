'use strict';

goog.provide('Blockly.Arduino.time');

goog.require('Blockly.Arduino');


/**
 * Code generator for the delay Arduino block.
 * Arduino code: loop { delay(X); }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
 Blockly.Arduino['oxocard_time_delay'] = function(block) {
  var delayTime = Blockly.Arduino.valueToCode(
      block, 'DELAY_TIME_MILI', Blockly.Arduino.ORDER_ATOMIC) || '0';
  var code = 'delay(' + delayTime + ');\n';
  return code;
};

Blockly.Arduino.oxocard_time_update = function(block) {
	return '//oxocard.time->updateTime();\n';
};

Blockly.Arduino.oxocard_get_time = function() {
	var timeZone = this.getFieldValue('ZONE');
	return '//oxocard.time->getTime(' +timeZone +');\n';
};

Blockly.Arduino.oxocard_time_get_value = function() {
  var valueType = this.getFieldValue('TYPE');
  var code = '1/*oxocard.time->get' +valueType +'()*/';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};
