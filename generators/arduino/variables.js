/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Arduino for Variable blocks.
 */
'use strict';

goog.module('Blockly.Arduino.variables');

const Arduino = goog.require('Blockly.Arduino');
const {NameType} = goog.require('Blockly.Names');

/**
 * Code generator for variable (X) getter.
 * Arduino code: loop { X }
 * @param {Blockly.Block} block Block to generate the code from.
 * @return {array} Completed code with order of operation.
 */
Arduino['variables_get'] = function (block) {

    var varName = Arduino.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
    return [varName, Blockly.Arduino.ORDER_ATOMIC];
};

/**
 * Code generator for variable (X) setter (Y).
 * Arduino code: type X;
 *               loop { X = Y; }
 * @param {Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
Arduino['variables_set'] = function (block) {

    var argument0 = Arduino.valueToCode(block, 'VALUE', Arduino.ORDER_ASSIGNMENT) || '0';
    var varName = Arduino.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);

    return varName + ' = ' + argument0 + ';\n';
};