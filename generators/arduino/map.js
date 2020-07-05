/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Code generator for the Arduino map functionality.
 *     Arduino built-in function docs: http://arduino.cc/en/Reference/HomePage
 */
'use strict';

goog.provide('Blockly.Arduino.map');

goog.require('Blockly.Arduino');


/**
 * Code generator for the map block.
 * Arduino code: loop { map(x, 0, 1024, 0, y) }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Completed code with order of operation.
 */
Blockly.Arduino['base_map'] = function(block) {
  var valueNum = Blockly.Arduino.valueToCode(
      block, 'NUM', Blockly.Arduino.ORDER_NONE) || '0';
  var valueDmax = Blockly.Arduino.valueToCode(
      block, 'DMAX', Blockly.Arduino.ORDER_ATOMIC) || '0';

  var code = 'map(' + valueNum + ', 0, 1024, 0, ' + valueDmax + ')';
  return [code, Blockly.Arduino.ORDER_NONE];
};
