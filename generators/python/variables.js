/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Python for variable blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Python.variables');

import {NameType} from '../../core/names.js';
import {pythonGenerator as Python, Order} from '../python.js';


Python.forBlock['variables_get'] = function(block) {
  // Variable getter.
  const code =
      Python.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return [code, Order.ATOMIC];
};

Python.forBlock['variables_set'] = function(block) {
  // Variable setter.
  const argument0 =
      Python.valueToCode(block, 'VALUE', Order.NONE) || '0';
  const varName =
      Python.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' = ' + argument0 + '\n';
};
