/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Dart for variable blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Dart.variables');

import {NameType} from '../../core/names.js';
import {dartGenerator as Dart, Order} from '../dart.js';


Dart.forBlock['variables_get'] = function(block) {
  // Variable getter.
  const code =
      Dart.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return [code, Order.ATOMIC];
};

Dart.forBlock['variables_set'] = function(block) {
  // Variable setter.
  const argument0 =
      Dart.valueToCode(block, 'VALUE', Order.ASSIGNMENT) || '0';
  const varName =
      Dart.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' = ' + argument0 + ';\n';
};
