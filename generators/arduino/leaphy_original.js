/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Arduino for leaphy_original blocks.
 */
 'use strict';

goog.module('Blockly.Arduino.leaphyOriginal');
 
const Arduino = goog.require('Blockly.Arduino');
 
 
Arduino['leaphy_original_get_distance'] = function (block) {
    Blockly.Arduino.definitions_['define_leaphy_original'] = '#include "Leaphyoriginal1.h"\n';
    var code = 'getDistance()';
    return [code, Blockly.Arduino.ORDER_ATOMIC];
};