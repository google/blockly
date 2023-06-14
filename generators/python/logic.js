/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Python for logic blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Python.logic');

import {pythonGenerator, Order} from '../python.js';


pythonGenerator.forBlock['controls_if'] = function(block, generator) {
  // If/elseif/else condition.
  let n = 0;
  let code = '', branchCode, conditionCode;
  if (pythonGenerator.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += pythonGenerator.injectId(pythonGenerator.STATEMENT_PREFIX, block);
  }
  do {
    conditionCode =
        pythonGenerator.valueToCode(block, 'IF' + n, Order.NONE) || 'False';
    branchCode =
        pythonGenerator.statementToCode(block, 'DO' + n) ||
        pythonGenerator.PASS;
    if (pythonGenerator.STATEMENT_SUFFIX) {
      branchCode =
          pythonGenerator.prefixLines(
            pythonGenerator.injectId(pythonGenerator.STATEMENT_SUFFIX, block),
            pythonGenerator.INDENT) +
          branchCode;
    }
    code += (n === 0 ? 'if ' : 'elif ') + conditionCode + ':\n' + branchCode;
    n++;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE') || pythonGenerator.STATEMENT_SUFFIX) {
    branchCode =
        pythonGenerator.statementToCode(block, 'ELSE') || pythonGenerator.PASS;
    if (pythonGenerator.STATEMENT_SUFFIX) {
      branchCode =
          pythonGenerator.prefixLines(
            pythonGenerator.injectId(
              pythonGenerator.STATEMENT_SUFFIX, block),
            pythonGenerator.INDENT) +
          branchCode;
    }
    code += 'else:\n' + branchCode;
  }
  return code;
};

pythonGenerator.forBlock['controls_ifelse'] =
    pythonGenerator.forBlock['controls_if'];

pythonGenerator.forBlock['logic_compare'] = function(block, generator) {
  // Comparison operator.
  const OPERATORS =
      {'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>='};
  const operator = OPERATORS[block.getFieldValue('OP')];
  const order = Order.RELATIONAL;
  const argument0 = pythonGenerator.valueToCode(block, 'A', order) || '0';
  const argument1 = pythonGenerator.valueToCode(block, 'B', order) || '0';
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

pythonGenerator.forBlock['logic_operation'] = function(block, generator) {
  // Operations 'and', 'or'.
  const operator = (block.getFieldValue('OP') === 'AND') ? 'and' : 'or';
  const order =
      (operator === 'and') ? Order.LOGICAL_AND : Order.LOGICAL_OR;
  let argument0 = pythonGenerator.valueToCode(block, 'A', order);
  let argument1 = pythonGenerator.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'False';
    argument1 = 'False';
  } else {
    // Single missing arguments have no effect on the return value.
    const defaultArgument = (operator === 'and') ? 'True' : 'False';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

pythonGenerator.forBlock['logic_negate'] = function(block, generator) {
  // Negation.
  const argument0 =
      pythonGenerator.valueToCode(block, 'BOOL', Order.LOGICAL_NOT) || 'True';
  const code = 'not ' + argument0;
  return [code, Order.LOGICAL_NOT];
};

pythonGenerator.forBlock['logic_boolean'] = function(block, generator) {
  // Boolean values true and false.
  const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'True' : 'False';
  return [code, Order.ATOMIC];
};

pythonGenerator.forBlock['logic_null'] = function(block, generator) {
  // Null data type.
  return ['None', Order.ATOMIC];
};

pythonGenerator.forBlock['logic_ternary'] = function(block, generator) {
  // Ternary operator.
  const value_if =
      pythonGenerator.valueToCode(block, 'IF', Order.CONDITIONAL) || 'False';
  const value_then =
      pythonGenerator.valueToCode(block, 'THEN', Order.CONDITIONAL) || 'None';
  const value_else =
      pythonGenerator.valueToCode(block, 'ELSE', Order.CONDITIONAL) || 'None';
  const code = value_then + ' if ' + value_if + ' else ' + value_else;
  return [code, Order.CONDITIONAL];
};
