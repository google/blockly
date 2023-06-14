/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating JavaScript for variable blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.JavaScript.variables');

import {NameType} from '../../core/names.js';
import {Order, javascriptGenerator} from './javascript_generator.js';


javascriptGenerator.forBlock['variables_get'] = function(block, generator) {
  // Variable getter.
  const code = generator.nameDB_.getName(block.getFieldValue('VAR'),
      NameType.VARIABLE);
  return [code, Order.ATOMIC];
};

javascriptGenerator.forBlock['variables_set'] = function(block, generator) {
  // Variable setter.
  const argument0 = generator.valueToCode(
                        block, 'VALUE', Order.ASSIGNMENT) || '0';
  const varName = generator.nameDB_.getName(
      block.getFieldValue('VAR'), NameType.VARIABLE);
  return varName + ' = ' + argument0 + ';\n';
};
