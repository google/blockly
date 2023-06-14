/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating PHP for logic blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.PHP.logic');

import {phpGenerator, Order} from '../php.js';


phpGenerator.forBlock['controls_if'] = function(block, generator) {
  // If/elseif/else condition.
  let n = 0;
  let code = '', branchCode, conditionCode;
  if (phpGenerator.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += phpGenerator.injectId(phpGenerator.STATEMENT_PREFIX, block);
  }
  do {
    conditionCode =
        phpGenerator.valueToCode(block, 'IF' + n, Order.NONE) || 'false';
    branchCode = phpGenerator.statementToCode(block, 'DO' + n);
    if (phpGenerator.STATEMENT_SUFFIX) {
      branchCode =
          phpGenerator.prefixLines(
            phpGenerator.injectId(phpGenerator.STATEMENT_SUFFIX, block),
            phpGenerator.INDENT) +
          branchCode;
    }
    code += (n > 0 ? ' else ' : '') + 'if (' + conditionCode + ') {\n' +
        branchCode + '}';
    n++;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE') || phpGenerator.STATEMENT_SUFFIX) {
    branchCode = phpGenerator.statementToCode(block, 'ELSE');
    if (phpGenerator.STATEMENT_SUFFIX) {
      branchCode =
          phpGenerator.prefixLines(
            phpGenerator.injectId(phpGenerator.STATEMENT_SUFFIX, block),
            phpGenerator.INDENT) +
          branchCode;
    }
    code += ' else {\n' + branchCode + '}';
  }
  return code + '\n';
};

phpGenerator.forBlock['controls_ifelse'] = phpGenerator.forBlock['controls_if'];

phpGenerator.forBlock['logic_compare'] = function(block, generator) {
  // Comparison operator.
  const OPERATORS =
      {'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>='};
  const operator = OPERATORS[block.getFieldValue('OP')];
  const order = (operator === '==' || operator === '!=') ? Order.EQUALITY :
                                                           Order.RELATIONAL;
  const argument0 = phpGenerator.valueToCode(block, 'A', order) || '0';
  const argument1 = phpGenerator.valueToCode(block, 'B', order) || '0';
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

phpGenerator.forBlock['logic_operation'] = function(block, generator) {
  // Operations 'and', 'or'.
  const operator = (block.getFieldValue('OP') === 'AND') ? '&&' : '||';
  const order =
      (operator === '&&') ? Order.LOGICAL_AND : Order.LOGICAL_OR;
  let argument0 = phpGenerator.valueToCode(block, 'A', order);
  let argument1 = phpGenerator.valueToCode(block, 'B', order);
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

phpGenerator.forBlock['logic_negate'] = function(block, generator) {
  // Negation.
  const order = Order.LOGICAL_NOT;
  const argument0 = phpGenerator.valueToCode(block, 'BOOL', order) || 'true';
  const code = '!' + argument0;
  return [code, order];
};

phpGenerator.forBlock['logic_boolean'] = function(block, generator) {
  // Boolean values true and false.
  const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'true' : 'false';
  return [code, Order.ATOMIC];
};

phpGenerator.forBlock['logic_null'] = function(block, generator) {
  // Null data type.
  return ['null', Order.ATOMIC];
};

phpGenerator.forBlock['logic_ternary'] = function(block, generator) {
  // Ternary operator.
  const value_if =
      phpGenerator.valueToCode(block, 'IF', Order.CONDITIONAL) || 'false';
  const value_then =
      phpGenerator.valueToCode(block, 'THEN', Order.CONDITIONAL) || 'null';
  const value_else =
      phpGenerator.valueToCode(block, 'ELSE', Order.CONDITIONAL) || 'null';
  const code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, Order.CONDITIONAL];
};
