/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Dart for variable blocks.
 * @suppress {missingRequire}
 */
'use strict';

goog.provide('Blockly.Dart.variables');

goog.require('Blockly.Dart');


Blockly.Dart['variables_get'] = function(block) {
  // Variable getter.
  const code = Blockly.Dart.nameDB_.getName(block.getFieldValue('VAR'),
      Blockly.VARIABLE_CATEGORY_NAME);
  return [code, Blockly.Dart.ORDER_ATOMIC];
};

Blockly.Dart['variables_set'] = function(block) {
  // Variable setter.
  const argument0 = Blockly.Dart.valueToCode(block, 'VALUE',
      Blockly.Dart.ORDER_ASSIGNMENT) || '0';
  const varName = Blockly.Dart.nameDB_.getName(block.getFieldValue('VAR'),
      Blockly.VARIABLE_CATEGORY_NAME);
  return varName + ' = ' + argument0 + ';\n';
};
