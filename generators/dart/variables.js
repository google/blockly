/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Dart for variable blocks.
 */
'use strict';

goog.module('Blockly.Dart.variables');

const Blockly = goog.require('Blockly');
const Dart = goog.require('Blockly.Dart');


Dart['variables_get'] = function(block) {
  // Variable getter.
  const code = Dart.nameDB_.getName(block.getFieldValue('VAR'),
      Blockly.VARIABLE_CATEGORY_NAME);
  return [code, Dart.ORDER_ATOMIC];
};

Dart['variables_set'] = function(block) {
  // Variable setter.
  const argument0 = Dart.valueToCode(block, 'VALUE',
      Dart.ORDER_ASSIGNMENT) || '0';
  const varName = Dart.nameDB_.getName(block.getFieldValue('VAR'),
      Blockly.VARIABLE_CATEGORY_NAME);
  return varName + ' = ' + argument0 + ';\n';
};
