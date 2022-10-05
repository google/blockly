/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Arduino for Arduino blocks.
 */
 'use strict';

goog.module('Blockly.Arduino.arduino');
 
const { arduinoGenerator: Arduino } = goog.require('Blockly.Arduino');
 

Arduino['time_delay'] = function (block) {
    var delayTime = Arduino.valueToCode(
        block, 'DELAY_TIME_MILI', Arduino.ORDER_ATOMIC) || '0';
    var code = 'delay(' + delayTime + ');\n';
    return code;  
};
