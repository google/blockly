/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating PHP for variable blocks.
 */
'use strict';

goog.module('Blockly.PHP.variables');

const Blockly = goog.require('Blockly');
const PHP = goog.require('Blockly.PHP');


PHP['variables_get'] = function(block) {
    // Variable getter.
    const code = PHP.nameDB_.getName(block.getFieldValue('VAR'),
        Blockly.VARIABLE_CATEGORY_NAME);
    return [code, PHP.ORDER_ATOMIC];
};

PHP['variables_set'] = function(block) {
    // Variable setter.
    const argument0 = PHP.valueToCode(block, 'VALUE',
            PHP.ORDER_ASSIGNMENT) || '0';
    const varName = PHP.nameDB_.getName(
        block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
    return varName + ' = ' + argument0 + ';\n';
};
