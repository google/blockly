/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Python for variable blocks.
 */
'use strict';

goog.module('Blockly.Python.variables');

const Python = goog.require('Blockly.Python');
const {NameType} = goog.require('Blockly.Names');


Python['variables_get'] = function(block) {
  // Variable getter.
  const code =
      Python.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return [code, Python.ORDER_ATOMIC];
};

Python['variables_set'] = function(block) {
  // Variable setter.
  const argument0 =
      Python.valueToCode(block, 'VALUE', Python.ORDER_NONE) || '0';
  const varName =
      Python.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' = ' + argument0 + '\n';
};
