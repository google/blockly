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

const Dart = goog.require('Blockly.Dart');
const {NameType} = goog.require('Blockly.Names');


Dart['variables_get'] = function(block) {
  // Variable getter.
  const code =
      Dart.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return [code, Dart.ORDER_ATOMIC];
};

Dart['variables_set'] = function(block) {
  // Variable setter.
  const argument0 =
      Dart.valueToCode(block, 'VALUE', Dart.ORDER_ASSIGNMENT) || '0';
  const varName =
      Dart.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' = ' + argument0 + ';\n';
};
