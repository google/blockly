/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Python for logic blocks.
 */
'use strict';

goog.provide('Blockly.Python.logic');

goog.require('Blockly.Python');


Blockly.Python['controls_if'] = function(block) {
  // If/elseif/else condition.
  let n = 0;
  let code = '', branchCode, conditionCode;
  if (Blockly.Python.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += Blockly.Python.injectId(Blockly.Python.STATEMENT_PREFIX, block);
  }
  do {
    conditionCode = Blockly.Python.valueToCode(block, 'IF' + n,
        Blockly.Python.ORDER_NONE) || 'False';
    branchCode = Blockly.Python.statementToCode(block, 'DO' + n) ||
        Blockly.Python.PASS;
    if (Blockly.Python.STATEMENT_SUFFIX) {
      branchCode = Blockly.Python.prefixLines(
          Blockly.Python.injectId(Blockly.Python.STATEMENT_SUFFIX, block),
          Blockly.Python.INDENT) + branchCode;
    }
    code += (n === 0 ? 'if ' : 'elif ') + conditionCode + ':\n' + branchCode;
    n++;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE') || Blockly.Python.STATEMENT_SUFFIX) {
    branchCode = Blockly.Python.statementToCode(block, 'ELSE') ||
        Blockly.Python.PASS;
    if (Blockly.Python.STATEMENT_SUFFIX) {
      branchCode = Blockly.Python.prefixLines(
          Blockly.Python.injectId(Blockly.Python.STATEMENT_SUFFIX, block),
          Blockly.Python.INDENT) + branchCode;
    }
    code += 'else:\n' + branchCode;
  }
  return code;
};

Blockly.Python['controls_ifelse'] = Blockly.Python['controls_if'];

Blockly.Python['logic_compare'] = function(block) {
  // Comparison operator.
  const OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  const operator = OPERATORS[block.getFieldValue('OP')];
  const order = Blockly.Python.ORDER_RELATIONAL;
  const argument0 = Blockly.Python.valueToCode(block, 'A', order) || '0';
  const argument1 = Blockly.Python.valueToCode(block, 'B', order) || '0';
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Python['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  const operator = (block.getFieldValue('OP') === 'AND') ? 'and' : 'or';
  const order = (operator === 'and') ? Blockly.Python.ORDER_LOGICAL_AND :
      Blockly.Python.ORDER_LOGICAL_OR;
  let argument0 = Blockly.Python.valueToCode(block, 'A', order);
  let argument1 = Blockly.Python.valueToCode(block, 'B', order);
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

Blockly.Python['logic_negate'] = function(block) {
  // Negation.
  const argument0 = Blockly.Python.valueToCode(block, 'BOOL',
      Blockly.Python.ORDER_LOGICAL_NOT) || 'True';
  const code = 'not ' + argument0;
  return [code, Blockly.Python.ORDER_LOGICAL_NOT];
};

Blockly.Python['logic_boolean'] = function(block) {
  // Boolean values true and false.
  const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'True' : 'False';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['logic_null'] = function(block) {
  // Null data type.
  return ['None', Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['logic_ternary'] = function(block) {
  // Ternary operator.
  const value_if = Blockly.Python.valueToCode(block, 'IF',
      Blockly.Python.ORDER_CONDITIONAL) || 'False';
  const value_then = Blockly.Python.valueToCode(block, 'THEN',
      Blockly.Python.ORDER_CONDITIONAL) || 'None';
  const value_else = Blockly.Python.valueToCode(block, 'ELSE',
      Blockly.Python.ORDER_CONDITIONAL) || 'None';
  const code = value_then + ' if ' + value_if + ' else ' + value_else;
  return [code, Blockly.Python.ORDER_CONDITIONAL];
};
