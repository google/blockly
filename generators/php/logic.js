/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating PHP for logic blocks.
 */
'use strict';

goog.module('Blockly.PHP.logic');

const PHP = goog.require('Blockly.PHP');


PHP['controls_if'] = function(block) {
  // If/elseif/else condition.
  let n = 0;
  let code = '', branchCode, conditionCode;
  if (PHP.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += PHP.injectId(PHP.STATEMENT_PREFIX, block);
  }
  do {
    conditionCode = PHP.valueToCode(block, 'IF' + n, PHP.ORDER_NONE) || 'false';
    branchCode = PHP.statementToCode(block, 'DO' + n);
    if (PHP.STATEMENT_SUFFIX) {
      branchCode = PHP.prefixLines(
                       PHP.injectId(PHP.STATEMENT_SUFFIX, block), PHP.INDENT) +
          branchCode;
    }
    code += (n > 0 ? ' else ' : '') + 'if (' + conditionCode + ') {\n' +
        branchCode + '}';
    n++;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE') || PHP.STATEMENT_SUFFIX) {
    branchCode = PHP.statementToCode(block, 'ELSE');
    if (PHP.STATEMENT_SUFFIX) {
      branchCode = PHP.prefixLines(
                       PHP.injectId(PHP.STATEMENT_SUFFIX, block), PHP.INDENT) +
          branchCode;
    }
    code += ' else {\n' + branchCode + '}';
  }
  return code + '\n';
};

PHP['controls_ifelse'] = PHP['controls_if'];

PHP['logic_compare'] = function(block) {
  // Comparison operator.
  const OPERATORS =
      {'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>='};
  const operator = OPERATORS[block.getFieldValue('OP')];
  const order = (operator === '==' || operator === '!=') ? PHP.ORDER_EQUALITY :
                                                           PHP.ORDER_RELATIONAL;
  const argument0 = PHP.valueToCode(block, 'A', order) || '0';
  const argument1 = PHP.valueToCode(block, 'B', order) || '0';
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

PHP['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  const operator = (block.getFieldValue('OP') === 'AND') ? '&&' : '||';
  const order =
      (operator === '&&') ? PHP.ORDER_LOGICAL_AND : PHP.ORDER_LOGICAL_OR;
  let argument0 = PHP.valueToCode(block, 'A', order);
  let argument1 = PHP.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'false';
    argument1 = 'false';
  } else {
    // Single missing arguments have no effect on the return value.
    const defaultArgument = (operator === '&&') ? 'true' : 'false';
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

PHP['logic_negate'] = function(block) {
  // Negation.
  const order = PHP.ORDER_LOGICAL_NOT;
  const argument0 = PHP.valueToCode(block, 'BOOL', order) || 'true';
  const code = '!' + argument0;
  return [code, order];
};

PHP['logic_boolean'] = function(block) {
  // Boolean values true and false.
  const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'true' : 'false';
  return [code, PHP.ORDER_ATOMIC];
};

PHP['logic_null'] = function(block) {
  // Null data type.
  return ['null', PHP.ORDER_ATOMIC];
};

PHP['logic_ternary'] = function(block) {
  // Ternary operator.
  const value_if =
      PHP.valueToCode(block, 'IF', PHP.ORDER_CONDITIONAL) || 'false';
  const value_then =
      PHP.valueToCode(block, 'THEN', PHP.ORDER_CONDITIONAL) || 'null';
  const value_else =
      PHP.valueToCode(block, 'ELSE', PHP.ORDER_CONDITIONAL) || 'null';
  const code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, PHP.ORDER_CONDITIONAL];
};
