/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating JavaScript for logic blocks.
 */
'use strict';

goog.module('Blockly.JavaScript.logic');

const JavaScript = goog.require('Blockly.JavaScript');


JavaScript['controls_if'] = function(block) {
  // If/elseif/else condition.
  let n = 0;
  let code = '';
  if (JavaScript.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += JavaScript.injectId(JavaScript.STATEMENT_PREFIX, block);
  }
  do {
    const conditionCode =
        JavaScript.valueToCode(block, 'IF' + n, JavaScript.ORDER_NONE) ||
        'false';
    let branchCode = JavaScript.statementToCode(block, 'DO' + n);
    if (JavaScript.STATEMENT_SUFFIX) {
      branchCode = JavaScript.prefixLines(
                       JavaScript.injectId(JavaScript.STATEMENT_SUFFIX, block),
                       JavaScript.INDENT) +
          branchCode;
    }
    code += (n > 0 ? ' else ' : '') + 'if (' + conditionCode + ') {\n' +
        branchCode + '}';
    n++;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE') || JavaScript.STATEMENT_SUFFIX) {
    let branchCode = JavaScript.statementToCode(block, 'ELSE');
    if (JavaScript.STATEMENT_SUFFIX) {
      branchCode = JavaScript.prefixLines(
                       JavaScript.injectId(JavaScript.STATEMENT_SUFFIX, block),
                       JavaScript.INDENT) +
          branchCode;
    }
    code += ' else {\n' + branchCode + '}';
  }
  return code + '\n';
};

JavaScript['controls_ifelse'] = JavaScript['controls_if'];

JavaScript['logic_compare'] = function(block) {
  // Comparison operator.
  const OPERATORS =
      {'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>='};
  const operator = OPERATORS[block.getFieldValue('OP')];
  const order = (operator === '==' || operator === '!=') ?
      JavaScript.ORDER_EQUALITY :
      JavaScript.ORDER_RELATIONAL;
  const argument0 = JavaScript.valueToCode(block, 'A', order) || '0';
  const argument1 = JavaScript.valueToCode(block, 'B', order) || '0';
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

JavaScript['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  const operator = (block.getFieldValue('OP') === 'AND') ? '&&' : '||';
  const order = (operator === '&&') ? JavaScript.ORDER_LOGICAL_AND :
                                      JavaScript.ORDER_LOGICAL_OR;
  let argument0 = JavaScript.valueToCode(block, 'A', order);
  let argument1 = JavaScript.valueToCode(block, 'B', order);
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

JavaScript['logic_negate'] = function(block) {
  // Negation.
  const order = JavaScript.ORDER_LOGICAL_NOT;
  const argument0 = JavaScript.valueToCode(block, 'BOOL', order) || 'true';
  const code = '!' + argument0;
  return [code, order];
};

JavaScript['logic_boolean'] = function(block) {
  // Boolean values true and false.
  const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'true' : 'false';
  return [code, JavaScript.ORDER_ATOMIC];
};

JavaScript['logic_null'] = function(block) {
  // Null data type.
  return ['null', JavaScript.ORDER_ATOMIC];
};

JavaScript['logic_ternary'] = function(block) {
  // Ternary operator.
  const value_if =
      JavaScript.valueToCode(block, 'IF', JavaScript.ORDER_CONDITIONAL) ||
      'false';
  const value_then =
      JavaScript.valueToCode(block, 'THEN', JavaScript.ORDER_CONDITIONAL) ||
      'null';
  const value_else =
      JavaScript.valueToCode(block, 'ELSE', JavaScript.ORDER_CONDITIONAL) ||
      'null';
  const code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, JavaScript.ORDER_CONDITIONAL];
};
