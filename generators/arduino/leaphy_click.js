/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * @fileoverview Code generator for Leaphy Click Blocks.
 */
'use strict';
goog.provide('Blockly.Arduino.LeaphyClick');

goog.require('Blockly.Arduino');

Blockly.Arduino['leaphy_click_rgb_digitalwrite'] = function (block) {
    var pin1 = block.getFieldValue('PIN1');
    var state1Output = Blockly.Arduino.valueToCode(
        block, 'STATE1', Blockly.Arduino.ORDER_ATOMIC) || 'LOW';

    Blockly.Arduino.reservePin(
        block, pin1, Blockly.Arduino.PinTypes.OUTPUT, 'Digital Write');

    var pin1SetupCode = 'pinMode(' + pin1 + ', OUTPUT);';
    Blockly.Arduino.addSetup('io_' + pin1, pin1SetupCode, false);

    var pin2 = block.getFieldValue('PIN2');
    var state2Output = Blockly.Arduino.valueToCode(
        block, 'STATE2', Blockly.Arduino.ORDER_ATOMIC) || 'LOW';

    Blockly.Arduino.reservePin(
        block, pin2, Blockly.Arduino.PinTypes.OUTPUT, 'Digital Write');

    var pin2SetupCode = 'pinMode(' + pin2 + ', OUTPUT);';
    Blockly.Arduino.addSetup('io_' + pin2, pin2SetupCode, false);

    var pin3 = block.getFieldValue('PIN3');
    var state3Output = Blockly.Arduino.valueToCode(
        block, 'STATE3', Blockly.Arduino.ORDER_ATOMIC) || 'LOW';

    Blockly.Arduino.reservePin(
        block, pin3, Blockly.Arduino.PinTypes.OUTPUT, 'Digital Write');

    var pin3SetupCode = 'pinMode(' + pin3 + ', OUTPUT);';
    Blockly.Arduino.addSetup('io_' + pin3, pin3SetupCode, false);

    var code = 'digitalWrite(' + pin1 + ', ' + state1Output + ');\n'
                     + 'digitalWrite(' + pin2 + ', ' + state2Output + ');\n'
                     + 'digitalWrite(' + pin3 + ', ' + state3Output + ');\n';
                     
    return code;
};

