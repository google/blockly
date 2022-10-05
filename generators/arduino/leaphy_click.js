/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Arduino for Leaphy Click blocks.
 */
 'use strict';

goog.module('Blockly.Arduino.leaphyClick');
 
const { arduinoGenerator: Arduino } = goog.require('Blockly.Arduino');

Arduino['leaphy_click_rgb_digitalwrite'] = function (block) {
    var pin1 = block.getFieldValue('PIN1');
    var state1Output = Arduino.valueToCode(
        block, 'STATE1', Arduino.ORDER_ATOMIC) || 'LOW';

    Arduino.reservePin(
        block, pin1, Arduino.PinTypes.OUTPUT, 'Digital Write');

    var pin1SetupCode = 'pinMode(' + pin1 + ', OUTPUT);';
    Arduino.addSetup('io_' + pin1, pin1SetupCode, false);

    var pin2 = block.getFieldValue('PIN2');
    var state2Output = Arduino.valueToCode(
        block, 'STATE2', Arduino.ORDER_ATOMIC) || 'LOW';

    Arduino.reservePin(
        block, pin2, Arduino.PinTypes.OUTPUT, 'Digital Write');

    var pin2SetupCode = 'pinMode(' + pin2 + ', OUTPUT);';
    Arduino.addSetup('io_' + pin2, pin2SetupCode, false);

    var pin3 = block.getFieldValue('PIN3');
    var state3Output = Arduino.valueToCode(
        block, 'STATE3', Arduino.ORDER_ATOMIC) || 'LOW';

    Arduino.reservePin(
        block, pin3, Arduino.PinTypes.OUTPUT, 'Digital Write');

    var pin3SetupCode = 'pinMode(' + pin3 + ', OUTPUT);';
    Arduino.addSetup('io_' + pin3, pin3SetupCode, false);

    var code = 'digitalWrite(' + pin1 + ', ' + state1Output + ');\n'
                     + 'digitalWrite(' + pin2 + ', ' + state2Output + ');\n'
                     + 'digitalWrite(' + pin3 + ', ' + state3Output + ');\n';
                     
    return code;
};

