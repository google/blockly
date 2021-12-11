/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Dart for logic blocks.
 */
'use strict';

goog.module('Blockly.Dart.logic');

const Dart = goog.require('Blockly.Dart');


Dart['controls_if'] = function(block) {
  // If/elseif/else condition.
  let n = 0;
  let code = '', branchCode, conditionCode;
  if (Dart.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += Dart.injectId(Dart.STATEMENT_PREFIX, block);
  }
  do {
    conditionCode =
        Dart.valueToCode(block, 'IF' + n, Dart.ORDER_NONE) || 'false';
    branchCode = Dart.statementToCode(block, 'DO' + n);
    if (Dart.STATEMENT_SUFFIX) {
      branchCode =
          Dart.prefixLines(
              Dart.injectId(Dart.STATEMENT_SUFFIX, block), Dart.INDENT) +
          branchCode;
    }
    code += (n > 0 ? 'else ' : '') + 'if (' + conditionCode + ') {\n' +
        branchCode + '}';
    n++;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE') || Dart.STATEMENT_SUFFIX) {
    branchCode = Dart.statementToCode(block, 'ELSE');
    if (Dart.STATEMENT_SUFFIX) {
      branchCode =
          Dart.prefixLines(
              Dart.injectId(Dart.STATEMENT_SUFFIX, block), Dart.INDENT) +
          branchCode;
    }
    code += ' else {\n' + branchCode + '}';
  }
  return code + '\n';
};

Dart['controls_ifelse'] = Dart['controls_if'];

Dart['logic_compare'] = function(block) {
  // Comparison operator.
  const OPERATORS =
      {'EQ': '==', 'NEQ': '!=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>='};
  const operator = OPERATORS[block.getFieldValue('OP')];
  const order = (operator === '==' || operator === '!=') ?
      Dart.ORDER_EQUALITY :
      Dart.ORDER_RELATIONAL;
  const argument0 = Dart.valueToCode(block, 'A', order) || '0';
  const argument1 = Dart.valueToCode(block, 'B', order) || '0';
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Dart['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  const operator = (block.getFieldValue('OP') === 'AND') ? '&&' : '||';
  const order =
      (operator === '&&') ? Dart.ORDER_LOGICAL_AND : Dart.ORDER_LOGICAL_OR;
  let argument0 = Dart.valueToCode(block, 'A', order);
  let argument1 = Dart.valueToCode(block, 'B', order);
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

Dart['logic_negate'] = function(block) {
  // Negation.
  const order = Dart.ORDER_UNARY_PREFIX;
  const argument0 = Dart.valueToCode(block, 'BOOL', order) || 'true';
  const code = '!' + argument0;
  return [code, order];
};

Dart['logic_boolean'] = function(block) {
  // Boolean values true and false.
  const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'true' : 'false';
  return [code, Dart.ORDER_ATOMIC];
};

Dart['logic_null'] = function(block) {
  // Null data type.
  return ['null', Dart.ORDER_ATOMIC];
};

Dart['logic_ternary'] = function(block) {
  // Ternary operator.
  const value_if =
      Dart.valueToCode(block, 'IF', Dart.ORDER_CONDITIONAL) || 'false';
  const value_then =
      Dart.valueToCode(block, 'THEN', Dart.ORDER_CONDITIONAL) || 'null';
  const value_else =
      Dart.valueToCode(block, 'ELSE', Dart.ORDER_CONDITIONAL) || 'null';
  const code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, Dart.ORDER_CONDITIONAL];
};
