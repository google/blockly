/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Go for variable blocks.
 * @author daarond@gmail.com (Daaron Dwyer)
 */
'use strict';

goog.provide('Blockly.Go.variables');

goog.require('Blockly.Go');


Blockly.Go['variables_get'] = function(block) {
    // Variable getter.
    var code = Blockly.Go.variableDB_.getName(block.getFieldValue('VAR'),
        Blockly.VARIABLE_CATEGORY_NAME);
    return [code, Blockly.Go.ORDER_ATOMIC];
};

Blockly.Go['variables_set'] = function(block) {
    // Variable setter.
    var argument0 = Blockly.Go.valueToCode(block, 'VALUE',
            Blockly.Go.ORDER_ASSIGNMENT) || '0';
    var varName = Blockly.Go.variableDB_.getName(
        block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
    return varName + ' = ' + argument0 + '\n';
};
