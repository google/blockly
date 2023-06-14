/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating PHP for variable blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.PHP.variables');

import {NameType} from '../../core/names.js';
import {phpGenerator, Order} from '../php.js';


phpGenerator.forBlock['variables_get'] = function(block) {
  // Variable getter.
  const code =
      phpGenerator.nameDB_.getName(
        block.getFieldValue('VAR'), NameType.VARIABLE);
  return [code, Order.ATOMIC];
};

phpGenerator.forBlock['variables_set'] = function(block) {
  // Variable setter.
  const argument0 =
      phpGenerator.valueToCode(block, 'VALUE', Order.ASSIGNMENT) || '0';
  const varName =
      phpGenerator.nameDB_.getName(
        block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' = ' + argument0 + ';\n';
};
