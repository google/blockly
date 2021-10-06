/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Python for logic blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Python.logic');

goog.require('Blockly.Python');


Blockly.Python['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  var code = '', branchCode, conditionCode;
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
    code += (n == 0 ? 'if ' : 'elif ') + conditionCode + ':\n' + branchCode;
    ++n;
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
  var OPERATORS = {
    'EQ': '==',
    'NEQ': '!=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = Blockly.Python.ORDER_RELATIONAL;
  var argument0 = Blockly.Python.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Python.valueToCode(block, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Python['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? 'and' : 'or';
  var order = (operator == 'and') ? Blockly.Python.ORDER_LOGICAL_AND :
      Blockly.Python.ORDER_LOGICAL_OR;
  var argument0 = Blockly.Python.valueToCode(block, 'A', order);
  var argument1 = Blockly.Python.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'False';
    argument1 = 'False';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == 'and') ? 'True' : 'False';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Python['logic_negate'] = function(block) {
  // Negation.
  var argument0 = Blockly.Python.valueToCode(block, 'BOOL',
      Blockly.Python.ORDER_LOGICAL_NOT) || 'True';
  var code = 'not ' + argument0;
  return [code, Blockly.Python.ORDER_LOGICAL_NOT];
};

Blockly.Python['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'True' : 'False';
  return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['logic_null'] = function(block) {
  // Null data type.
  return ['None', Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.Python.valueToCode(block, 'IF',
      Blockly.Python.ORDER_CONDITIONAL) || 'False';
  var value_then = Blockly.Python.valueToCode(block, 'THEN',
      Blockly.Python.ORDER_CONDITIONAL) || 'None';
  var value_else = Blockly.Python.valueToCode(block, 'ELSE',
      Blockly.Python.ORDER_CONDITIONAL) || 'None';
  var code = value_then + ' if ' + value_if + ' else ' + value_else;
  return [code, Blockly.Python.ORDER_CONDITIONAL];
};
