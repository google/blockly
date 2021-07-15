/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating PHP for variable blocks.
 * @author daarond@gmail.com (Daaron Dwyer)
 */
'use strict';

goog.provide('Blockly.PHP.variables');

goog.require('Blockly.PHP');


Blockly.PHP['variables_get'] = function(block) {
    // Variable getter.
    var code = Blockly.PHP.nameDB_.getName(block.getFieldValue('VAR'),
        Blockly.VARIABLE_CATEGORY_NAME);
    return [code, Blockly.PHP.ORDER_ATOMIC];
};

Blockly.PHP['variables_set'] = function(block) {
    // Variable setter.
    var argument0 = Blockly.PHP.valueToCode(block, 'VALUE',
            Blockly.PHP.ORDER_ASSIGNMENT) || '0';
    var varName = Blockly.PHP.nameDB_.getName(
        block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
    return varName + ' = ' + argument0 + ';\n';
};
