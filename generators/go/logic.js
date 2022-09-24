/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Go for logic blocks.
 * @author daarond@gmail.com (Daaron Dwyer)
 */
'use strict';

goog.provide('Blockly.Go.logic');

goog.require('Blockly.Go');


Blockly.Go['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  var code = '', branchCode, conditionCode;
  if (Blockly.Go.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += Blockly.Go.injectId(Blockly.Go.STATEMENT_PREFIX, block);
  }
  do {
    conditionCode = Blockly.Go.valueToCode(block, 'IF' + n,
        Blockly.Go.ORDER_NONE) || 'false';
    branchCode = Blockly.Go.statementToCode(block, 'DO' + n);
    if (Blockly.Go.STATEMENT_SUFFIX) {
      branchCode = Blockly.Go.prefixLines(
          Blockly.Go.injectId(Blockly.Go.STATEMENT_SUFFIX, block),
          Blockly.Go.INDENT) + branchCode;
    }
    code += (n > 0 ? ' else ' : '') +
        'if ' + conditionCode + ' {\n' + branchCode + '}';
    ++n;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE') || Blockly.Go.STATEMENT_SUFFIX) {
    branchCode = Blockly.Go.statementToCode(block, 'ELSE');
    if (Blockly.Go.STATEMENT_SUFFIX) {
      branchCode = Blockly.Go.prefixLines(
          Blockly.Go.injectId(Blockly.Go.STATEMENT_SUFFIX, block),
          Blockly.Go.INDENT) + branchCode;
    }
    code += ' else {\n' + branchCode + '}';
  }
  return code + '\n';
};

Blockly.Go['controls_ifelse'] = Blockly.Go['controls_if'];

Blockly.Go['logic_compare'] = function(block) {
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
  var order = (operator == '==' || operator == '!=') ?
      Blockly.Go.ORDER_EQUALITY : Blockly.Go.ORDER_RELATIONAL;
  var argument0 = Blockly.Go.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Go.valueToCode(block, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Go['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
  var order = (operator == '&&') ? Blockly.Go.ORDER_LOGICAL_AND :
      Blockly.Go.ORDER_LOGICAL_OR;
  var argument0 = Blockly.Go.valueToCode(block, 'A', order);
  var argument1 = Blockly.Go.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'false';
    argument1 = 'false';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == '&&') ? 'true' : 'false';
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

Blockly.Go['logic_negate'] = function(block) {
  // Negation.
  var order = Blockly.Go.ORDER_LOGICAL_NOT;
  var argument0 = Blockly.Go.valueToCode(block, 'BOOL', order) ||
      'true';
  var code = '!' + argument0;
  return [code, order];
};

Blockly.Go['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.Go.ORDER_ATOMIC];
};

Blockly.Go['logic_null'] = function(block) {
  // Null data type.
  return ['nil', Blockly.Go.ORDER_ATOMIC];
};

Blockly.Go['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.Go.valueToCode(block, 'IF',
      Blockly.Go.ORDER_CONDITIONAL) || 'false';
  var value_then = Blockly.Go.valueToCode(block, 'THEN',
      Blockly.Go.ORDER_CONDITIONAL) || 'nil';
  var value_else = Blockly.Go.valueToCode(block, 'ELSE',
      Blockly.Go.ORDER_CONDITIONAL) || 'nil';
  var code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, Blockly.Go.ORDER_CONDITIONAL];
};
