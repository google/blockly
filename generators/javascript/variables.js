/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating JavaScript for variable blocks.
 */
'use strict';

goog.module('Blockly.JavaScript.variables');

const JavaScript = goog.require('Blockly.JavaScript');
const {NameType} = goog.require('Blockly.Names');


JavaScript['variables_get'] = function(block) {
  // Variable getter.
  const code = JavaScript.nameDB_.getName(block.getFieldValue('VAR'),
      NameType.VARIABLE);
  return [code, JavaScript.ORDER_ATOMIC];
};

JavaScript['variables_set'] = function(block) {
  // Variable setter.
  const argument0 = JavaScript.valueToCode(
                        block, 'VALUE', JavaScript.ORDER_ASSIGNMENT) || '0';
  const varName = JavaScript.nameDB_.getName(
      block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' = ' + argument0 + ';\n';
};
