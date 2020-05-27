/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Dart for logic blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Dart.logic');

goog.require('Blockly.Dart');


Blockly.Dart['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  var code = '', branchCode, conditionCode;
  if (Blockly.Dart.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += Blockly.Dart.injectId(Blockly.Dart.STATEMENT_PREFIX, block);
  }
  do {
    conditionCode = Blockly.Dart.valueToCode(block, 'IF' + n,
        Blockly.Dart.ORDER_NONE) || 'false';
    branchCode = Blockly.Dart.statementToCode(block, 'DO' + n);
    if (Blockly.Dart.STATEMENT_SUFFIX) {
      branchCode = Blockly.Dart.prefixLines(
          Blockly.Dart.injectId(Blockly.Dart.STATEMENT_SUFFIX, block),
          Blockly.Dart.INDENT) + branchCode;
    }
    code += (n > 0 ? 'else ' : '') +
        'if (' + conditionCode + ') {\n' + branchCode + '}';
    ++n;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE') || Blockly.Dart.STATEMENT_SUFFIX) {
    branchCode = Blockly.Dart.statementToCode(block, 'ELSE');
    if (Blockly.Dart.STATEMENT_SUFFIX) {
      branchCode = Blockly.Dart.prefixLines(
          Blockly.Dart.injectId(Blockly.Dart.STATEMENT_SUFFIX, block),
          Blockly.Dart.INDENT) + branchCode;
    }
    code += ' else {\n' + branchCode + '}';
  }
  return code + '\n';
};

Blockly.Dart['controls_ifelse'] = Blockly.Dart['controls_if'];

Blockly.Dart['logic_compare'] = function(block) {
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
      Blockly.Dart.ORDER_EQUALITY : Blockly.Dart.ORDER_RELATIONAL;
  var argument0 = Blockly.Dart.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Dart.valueToCode(block, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Dart['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
  var order = (operator == '&&') ? Blockly.Dart.ORDER_LOGICAL_AND :
      Blockly.Dart.ORDER_LOGICAL_OR;
  var argument0 = Blockly.Dart.valueToCode(block, 'A', order);
  var argument1 = Blockly.Dart.valueToCode(block, 'B', order);
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

Blockly.Dart['logic_negate'] = function(block) {
  // Negation.
  var order = Blockly.Dart.ORDER_UNARY_PREFIX;
  var argument0 = Blockly.Dart.valueToCode(block, 'BOOL', order) || 'true';
  var code = '!' + argument0;
  return [code, order];
};

Blockly.Dart['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.Dart.ORDER_ATOMIC];
};

Blockly.Dart['logic_null'] = function(block) {
  // Null data type.
  return ['null', Blockly.Dart.ORDER_ATOMIC];
};

Blockly.Dart['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.Dart.valueToCode(block, 'IF',
      Blockly.Dart.ORDER_CONDITIONAL) || 'false';
  var value_then = Blockly.Dart.valueToCode(block, 'THEN',
      Blockly.Dart.ORDER_CONDITIONAL) || 'null';
  var value_else = Blockly.Dart.valueToCode(block, 'ELSE',
      Blockly.Dart.ORDER_CONDITIONAL) || 'null';
  var code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, Blockly.Dart.ORDER_CONDITIONAL];
};
