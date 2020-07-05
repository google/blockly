/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Code generator for Arduino Digital and Analogue input/output.
 *     Arduino built in function docs: http://arduino.cc/en/Reference/HomePage
 */
'use strict';

goog.provide('Blockly.Arduino.tone');

goog.require('Blockly.Arduino');


/**
 * Function for turning the tone library on on a given pin (X).
 * Arduino code: setup { pinMode(X, OUTPUT) }
 *               loop  { tone(X, frequency) }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {array} Completed code with order of operation.
 */

Blockly.Arduino['io_tone'] = function(block) {
  var pin = block.getFieldValue('TONEPIN');
  var freq = Blockly.Arduino.valueToCode(block, 'FREQUENCY', Blockly.Arduino.ORDER_ATOMIC);
  Blockly.Arduino.reservePin(
      block, pin, Blockly.Arduino.PinTypes.OUTPUT, 'Tone Pin');

  var pinSetupCode = 'pinMode(' + pin + ', OUTPUT);\n';
  Blockly.Arduino.addSetup('io_' + pin, pinSetupCode, false);

  var code = 'tone(' + pin + ',' + freq + ');\n';
  return code;
};

Blockly.Arduino['io_notone'] = function(block) {
  var pin = block.getFieldValue("TONEPIN");
  Blockly.Arduino.reservePin(
      block, pin, Blockly.Arduino.PinTypes.OUTPUT, 'Tone Pin');
  
  var pinSetupCode = 'pinMode(' + pin + ', OUTPUT);\n';
  Blockly.Arduino.addSetup('io_' + pin, pinSetupCode, false);

  var code = 'noTone(' + pin + ');\n';
  return code;
};
