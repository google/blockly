/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Arduino for text blocks.
 */
'use strict';

goog.module('Blockly.Arduino.text');

const { arduinoGenerator: Arduino } = goog.require('Blockly.Arduino');

/**
* Code generator for a literal String (X).
* Arduino code: loop { "X" }
* @param {!Blockly.Block} block Block to generate the code from.
* @return {array} Completed code with order of operation.
*/
Arduino['text'] = function (block) {
    var code = Arduino.quote_(block.getFieldValue('TEXT'));
    return [code, Arduino.ORDER_ATOMIC];
};