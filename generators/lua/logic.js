/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Lua for logic blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Lua.logic');

import {luaGenerator as Lua, Order} from '../lua.js';


Lua.forBlock['controls_if'] = function(block) {
  // If/elseif/else condition.
  let n = 0;
  let code = '';
  if (Lua.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += Lua.injectId(Lua.STATEMENT_PREFIX, block);
  }
  do {
    const conditionCode =
        Lua.valueToCode(block, 'IF' + n, Order.NONE) || 'false';
    let branchCode = Lua.statementToCode(block, 'DO' + n);
    if (Lua.STATEMENT_SUFFIX) {
      branchCode = Lua.prefixLines(
          Lua.injectId(Lua.STATEMENT_SUFFIX, block), Lua.INDENT) + branchCode;
    }
    code +=
        (n > 0 ? 'else' : '') + 'if ' + conditionCode + ' then\n' + branchCode;
    n++;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE') || Lua.STATEMENT_SUFFIX) {
    let branchCode = Lua.statementToCode(block, 'ELSE');
    if (Lua.STATEMENT_SUFFIX) {
      branchCode = Lua.prefixLines(
                       Lua.injectId(Lua.STATEMENT_SUFFIX, block), Lua.INDENT) +
          branchCode;
    }
    code += 'else\n' + branchCode;
  }
  return code + 'end\n';
};

Lua.forBlock['controls_ifelse'] = Lua.forBlock['controls_if'];

Lua.forBlock['logic_compare'] = function(block) {
  // Comparison operator.
  const OPERATORS =
      {'EQ': '==', 'NEQ': '~=', 'LT': '<', 'LTE': '<=', 'GT': '>', 'GTE': '>='};
  const operator = OPERATORS[block.getFieldValue('OP')];
  const argument0 = Lua.valueToCode(block, 'A', Order.RELATIONAL) || '0';
  const argument1 = Lua.valueToCode(block, 'B', Order.RELATIONAL) || '0';
  const code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, Order.RELATIONAL];
};

Lua.forBlock['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  const operator = (block.getFieldValue('OP') === 'AND') ? 'and' : 'or';
  const order = (operator === 'and') ? Order.AND : Order.OR;
  let argument0 = Lua.valueToCode(block, 'A', order);
  let argument1 = Lua.valueToCode(block, 'B', order);
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

Lua.forBlock['logic_negate'] = function(block) {
  // Negation.
  const argument0 = Lua.valueToCode(block, 'BOOL', Order.UNARY) || 'true';
  const code = 'not ' + argument0;
  return [code, Order.UNARY];
};

Lua.forBlock['logic_boolean'] = function(block) {
  // Boolean values true and false.
  const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'true' : 'false';
  return [code, Order.ATOMIC];
};

Lua.forBlock['logic_null'] = function(block) {
  // Null data type.
  return ['nil', Order.ATOMIC];
};

Lua.forBlock['logic_ternary'] = function(block) {
  // Ternary operator.
  const value_if = Lua.valueToCode(block, 'IF', Order.AND) || 'false';
  const value_then = Lua.valueToCode(block, 'THEN', Order.AND) || 'nil';
  const value_else = Lua.valueToCode(block, 'ELSE', Order.OR) || 'nil';
  const code = value_if + ' and ' + value_then + ' or ' + value_else;
  return [code, Order.OR];
};
