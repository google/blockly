/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Lua for logic blocks.
 */
'use strict';

goog.provide('Blockly.Lua.logic');

goog.require('Blockly.Lua');


Blockly.Lua['controls_if'] = function(block) {
  // If/elseif/else condition.
  let n = 0;
  let code = '';
  if (Blockly.Lua.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += Blockly.Lua.injectId(Blockly.Lua.STATEMENT_PREFIX, block);
  }
  do {
    const conditionCode = Blockly.Lua.valueToCode(block, 'IF' + n,
        Blockly.Lua.ORDER_NONE) || 'false';
    let branchCode = Blockly.Lua.statementToCode(block, 'DO' + n);
    if (Blockly.Lua.STATEMENT_SUFFIX) {
      branchCode = Blockly.Lua.prefixLines(
          Blockly.Lua.injectId(Blockly.Lua.STATEMENT_SUFFIX, block),
          Blockly.Lua.INDENT) + branchCode;
    }
    code += (n > 0 ? 'else' : '') +
        'if ' + conditionCode + ' then\n' + branchCode;
    n++;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE') || Blockly.Lua.STATEMENT_SUFFIX) {
    let branchCode = Blockly.Lua.statementToCode(block, 'ELSE');
    if (Blockly.Lua.STATEMENT_SUFFIX) {
      branchCode = Blockly.Lua.prefixLines(
          Blockly.Lua.injectId(Blockly.Lua.STATEMENT_SUFFIX, block),
          Blockly.Lua.INDENT) + branchCode;
    }
    code += 'else\n' + branchCode;
  }
  return code + 'end\n';
};

Blockly.Lua['controls_ifelse'] = Blockly.Lua['controls_if'];

Blockly.Lua['logic_compare'] = function(block) {
  // Comparison operator.
  const OPERATORS = {
    'EQ': '==',
    'NEQ': '~=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  const operator = OPERATORS[block.getFieldValue('OP')];
  const argument0 = Blockly.Lua.valueToCode(block, 'A',
      Blockly.Lua.ORDER_RELATIONAL) || '0';
  const argument1 = Blockly.Lua.valueToCode(block, 'B',
      Blockly.Lua.ORDER_RELATIONAL) || '0';
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, Blockly.Lua.ORDER_RELATIONAL];
};

Blockly.Lua['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  const operator = (block.getFieldValue('OP') === 'AND') ? 'and' : 'or';
  const order = (operator === 'and') ? Blockly.Lua.ORDER_AND :
      Blockly.Lua.ORDER_OR;
  let argument0 = Blockly.Lua.valueToCode(block, 'A', order);
  let argument1 = Blockly.Lua.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'false';
    argument1 = 'false';
  } else {
    // Single missing arguments have no effect on the return value.
    const defaultArgument = (operator === 'and') ? 'true' : 'false';
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

Blockly.Lua['logic_negate'] = function(block) {
  // Negation.
  const argument0 = Blockly.Lua.valueToCode(block, 'BOOL',
      Blockly.Lua.ORDER_UNARY) || 'true';
  const code = 'not ' + argument0;
  return [code, Blockly.Lua.ORDER_UNARY];
};

Blockly.Lua['logic_boolean'] = function(block) {
  // Boolean values true and false.
  const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'true' : 'false';
  return [code, Blockly.Lua.ORDER_ATOMIC];
};

Blockly.Lua['logic_null'] = function(block) {
  // Null data type.
  return ['nil', Blockly.Lua.ORDER_ATOMIC];
};

Blockly.Lua['logic_ternary'] = function(block) {
  // Ternary operator.
  const value_if = Blockly.Lua.valueToCode(block, 'IF',
      Blockly.Lua.ORDER_AND) || 'false';
  const value_then = Blockly.Lua.valueToCode(block, 'THEN',
      Blockly.Lua.ORDER_AND) || 'nil';
  const value_else = Blockly.Lua.valueToCode(block, 'ELSE',
      Blockly.Lua.ORDER_OR) || 'nil';
  const code = value_if + ' and ' + value_then + ' or ' + value_else;
  return [code, Blockly.Lua.ORDER_OR];
};
