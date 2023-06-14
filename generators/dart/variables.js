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
import {dartGenerator, Order} from '../dart.js';


dartGenerator.forBlock['variables_get'] = function(block, generator) {
  // Variable getter.
  const code =
      dartGenerator.nameDB_.getName(
        block.getFieldValue('VAR'), NameType.VARIABLE);
  return [code, Order.ATOMIC];
};

dartGenerator.forBlock['variables_set'] = function(block, generator) {
  // Variable setter.
  const argument0 =
      dartGenerator.valueToCode(block, 'VALUE', Order.ASSIGNMENT) || '0';
  const varName =
      dartGenerator.nameDB_.getName(
        block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' = ' + argument0 + ';\n';
};
