/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Arduino code generator for the Time blocks.
 *     Arduino built-in function docs: http://arduino.cc/en/Reference/HomePage
 */
'use strict';

goog.provide('Blockly.Arduino.time');

goog.require('Blockly.Arduino');


/**
 * Code generator for the delay Arduino block.
 * Arduino code: loop { delay(X); }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
 Blockly.Arduino['time_delay'] = function(block) {
  var delayTime = Blockly.Arduino.valueToCode(
      block, 'DELAY_TIME_MILI', Blockly.Arduino.ORDER_ATOMIC) || '0';
  var code = 'delay(' + delayTime + ');\n';
  return code;
};

/**
 * Code generator for the delayMicroseconds block.
 * Arduino code: loop { delayMicroseconds(X); }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
 Blockly.Arduino['time_delaymicros'] = function(block) {
  var delayTimeMs = Blockly.Arduino.valueToCode(
      block, 'DELAY_TIME_MICRO', Blockly.Arduino.ORDER_ATOMIC) || '0';
  var code = 'delayMicroseconds(' + delayTimeMs + ');\n';
  return code;
};

/**
 * Code generator for the elapsed time in milliseconds block.
 * Arduino code: loop { millis() }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Completed code with order of operation.
 */
 Blockly.Arduino['time_millis'] = function(block) {
  var code = 'millis()';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

/**
 * Code generator for the elapsed time in microseconds block.
 * Arduino code: loop { micros() }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Completed code with order of operation.
 */
 Blockly.Arduino['time_micros'] = function(block) {
  var code = 'micros()';
  return [code, Blockly.Arduino.ORDER_ATOMIC];
};

/**
 * Code generator for the wait forever (end of program) block
 * Arduino code: loop { while(true); }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
 Blockly.Arduino['infinite_loop'] = function(block) {
  return 'while(true);\n';
};
