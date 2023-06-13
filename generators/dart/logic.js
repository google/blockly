/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Dart for logic blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Dart.logic');

import {dartGenerator, Order} from '../dart.js';


dartGenerator.forBlock['controls_if'] = function(block) {
  // If/elseif/else condition.
  let n = 0;
  let code = '', branchCode, conditionCode;
  if (dartGenerator.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += dartGenerator.injectId(dartGenerator.STATEMENT_PREFIX, block);
  }
  do {
    conditionCode =
        dartGenerator.valueToCode(block, 'IF' + n, Order.NONE) || 'false';
    branchCode = dartGenerator.statementToCode(block, 'DO' + n);
    if (dartGenerator.STATEMENT_SUFFIX) {
      branchCode =
          dartGenerator.prefixLines(
            dartGenerator.injectId(
              dartGenerator.STATEMENT_SUFFIX, block), dartGenerator.INDENT) +
          branchCode;
    }
    code += (n > 0 ? 'else ' : '') + 'if (' + conditionCode + ') {\n' +
        branchCode + '}';
    n++;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE') || dartGenerator.STATEMENT_SUFFIX) {
    branchCode = dartGenerator.statementToCode(block, 'ELSE');
    if (dartGenerator.STATEMENT_SUFFIX) {
      branchCode =
          dartGenerator.prefixLines(
            dartGenerator.injectId(
              dartGenerator.STATEMENT_SUFFIX, block), dartGenerator.INDENT) +
          branchCode;
    }
    code += ' else {\n' + branchCode + '}';
  }
  return code + '\n';
};

dartGenerator.forBlock['controls_ifelse'] =
    dartGenerator.forBlock['controls_if'];

dartGenerator.forBlock['logic_compare'] = function(block) {
  // Comparison operator.
  const OPERATORS =
      {'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>='};
  const operator = OPERATORS[block.getFieldValue('OP')];
  const order = (operator === '==' || operator === '!=') ?
      Order.EQUALITY :
      Order.RELATIONAL;
  const argument0 = dartGenerator.valueToCode(block, 'A', order) || '0';
  const argument1 = dartGenerator.valueToCode(block, 'B', order) || '0';
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

dartGenerator.forBlock['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  const operator = (block.getFieldValue('OP') === 'AND') ? '&&' : '||';
  const order =
      (operator === '&&') ? Order.LOGICAL_AND : Order.LOGICAL_OR;
  let argument0 = dartGenerator.valueToCode(block, 'A', order);
  let argument1 = dartGenerator.valueToCode(block, 'B', order);
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

dartGenerator.forBlock['logic_negate'] = function(block) {
  // Negation.
  const order = Order.UNARY_PREFIX;
  const argument0 = dartGenerator.valueToCode(block, 'BOOL', order) || 'true';
  const code = '!' + argument0;
  return [code, order];
};

dartGenerator.forBlock['logic_boolean'] = function(block) {
  // Boolean values true and false.
  const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'true' : 'false';
  return [code, Order.ATOMIC];
};

dartGenerator.forBlock['logic_null'] = function(block) {
  // Null data type.
  return ['null', Order.ATOMIC];
};

dartGenerator.forBlock['logic_ternary'] = function(block) {
  // Ternary operator.
  const value_if =
      dartGenerator.valueToCode(block, 'IF', Order.CONDITIONAL) || 'false';
  const value_then =
      dartGenerator.valueToCode(block, 'THEN', Order.CONDITIONAL) || 'null';
  const value_else =
      dartGenerator.valueToCode(block, 'ELSE', Order.CONDITIONAL) || 'null';
  const code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, Order.CONDITIONAL];
};
