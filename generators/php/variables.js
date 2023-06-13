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
import {phpGenerator as PHP} from '../php.js';


PHP.forBlock['variables_get'] = function(block) {
  // Variable getter.
  const code =
      PHP.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return [code, PHP.ORDER_ATOMIC];
};

PHP.forBlock['variables_set'] = function(block) {
  // Variable setter.
  const argument0 =
      PHP.valueToCode(block, 'VALUE', PHP.ORDER_ASSIGNMENT) || '0';
  const varName =
      PHP.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' = ' + argument0 + ';\n';
};
