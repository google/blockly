/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Python for logic blocks.
 */
'use strict';

goog.module('Blockly.Python.logic');

const Python = goog.require('Blockly.Python');


Python['controls_if'] = function(block) {
  // If/elseif/else condition.
  let n = 0;
  let code = '', branchCode, conditionCode;
  if (Python.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += Python.injectId(Python.STATEMENT_PREFIX, block);
  }
  do {
    conditionCode =
        Python.valueToCode(block, 'IF' + n, Python.ORDER_NONE) || 'False';
    branchCode = Python.statementToCode(block, 'DO' + n) || Python.PASS;
    if (Python.STATEMENT_SUFFIX) {
      branchCode =
          Python.prefixLines(
              Python.injectId(Python.STATEMENT_SUFFIX, block), Python.INDENT) +
          branchCode;
    }
    code += (n === 0 ? 'if ' : 'elif ') + conditionCode + ':\n' + branchCode;
    n++;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE') || Python.STATEMENT_SUFFIX) {
    branchCode = Python.statementToCode(block, 'ELSE') || Python.PASS;
    if (Python.STATEMENT_SUFFIX) {
      branchCode =
          Python.prefixLines(
              Python.injectId(Python.STATEMENT_SUFFIX, block), Python.INDENT) +
          branchCode;
    }
    code += 'else:\n' + branchCode;
  }
  return code;
};

Python['controls_ifelse'] = Python['controls_if'];

Python['logic_compare'] = function(block) {
  // Comparison operator.
  const OPERATORS =
      {'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>='};
  const operator = OPERATORS[block.getFieldValue('OP')];
  const order = Python.ORDER_RELATIONAL;
  const argument0 = Python.valueToCode(block, 'A', order) || '0';
  const argument1 = Python.valueToCode(block, 'B', order) || '0';
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Python['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  const operator = (block.getFieldValue('OP') === 'AND') ? 'and' : 'or';
  const order =
      (operator === 'and') ? Python.ORDER_LOGICAL_AND : Python.ORDER_LOGICAL_OR;
  let argument0 = Python.valueToCode(block, 'A', order);
  let argument1 = Python.valueToCode(block, 'B', order);
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

Python['logic_negate'] = function(block) {
  // Negation.
  const argument0 =
      Python.valueToCode(block, 'BOOL', Python.ORDER_LOGICAL_NOT) || 'True';
  const code = 'not ' + argument0;
  return [code, Python.ORDER_LOGICAL_NOT];
};

Python['logic_boolean'] = function(block) {
  // Boolean values true and false.
  const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'True' : 'False';
  return [code, Python.ORDER_ATOMIC];
};

Python['logic_null'] = function(block) {
  // Null data type.
  return ['None', Python.ORDER_ATOMIC];
};

Python['logic_ternary'] = function(block) {
  // Ternary operator.
  const value_if =
      Python.valueToCode(block, 'IF', Python.ORDER_CONDITIONAL) || 'False';
  const value_then =
      Python.valueToCode(block, 'THEN', Python.ORDER_CONDITIONAL) || 'None';
  const value_else =
      Python.valueToCode(block, 'ELSE', Python.ORDER_CONDITIONAL) || 'None';
  const code = value_then + ' if ' + value_if + ' else ' + value_else;
  return [code, Python.ORDER_CONDITIONAL];
};
