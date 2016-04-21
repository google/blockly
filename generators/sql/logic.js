/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2015 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating PHP for logic blocks.
 * @author daarond@gmail.com (Daaron Dwyer)
 */
'use strict';

goog.provide('Blockly.SQL.logic');

goog.require('Blockly.SQL');


Blockly.SQL['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  var argument = Blockly.SQL.valueToCode(block, 'IF' + n,
      Blockly.SQL.ORDER_NONE) || 'false';
  var branch = Blockly.SQL.statementToCode(block, 'DO' + n);
  var code = 'IF (' + argument + ') THEN\n' + branch + '\n';
  for (n = 1; n <= block.elseifCount_; n++) {
    argument = Blockly.SQL.valueToCode(block, 'IF' + n,
        Blockly.SQL.ORDER_NONE) || 'false';
    branch = Blockly.SQL.statementToCode(block, 'DO' + n);
    code += 'ELSEIF (' + argument + ') THEN\n' + branch + '\n';
  }
  if (block.elseCount_) {
    branch = Blockly.SQL.statementToCode(block, 'ELSE');
    code += 'ELSE \n' + branch + '\n';
  }
  return code + 'END IF;\n';
};

Blockly.SQL['logic_compare'] = function(block) {
  // Comparison operator.
  var OPERATORS = {
    'EQ': '=',
    'NEQ': '<>',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = (operator == '=' || operator == '<>') ?
      Blockly.SQL.ORDER_EQUALITY : Blockly.SQL.ORDER_RELATIONAL;
  var argument0 = Blockly.SQL.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.SQL.valueToCode(block, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.SQL['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
  var order = (operator == '&&') ? Blockly.SQL.ORDER_LOGICAL_AND :
      Blockly.SQL.ORDER_LOGICAL_OR;
  var argument0 = Blockly.SQL.valueToCode(block, 'A', order);
  var argument1 = Blockly.SQL.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'FALSE';
    argument1 = 'FALSE';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == '&&') ? 'TRUE' : 'FALSE';
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

Blockly.SQL['logic_negate'] = function(block) {
  // Negation.
  var order = Blockly.SQL.ORDER_LOGICAL_NOT;
  var argument0 = Blockly.SQL.valueToCode(block, 'BOOL', order) ||
      'TRUE';
  var code = '!' + argument0;
  return [code, order];
};

Blockly.SQL['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'TRUE' : 'FALSE';
  return [code, Blockly.SQL.ORDER_ATOMIC];
};

Blockly.SQL['logic_null'] = function(block) {
  // Null data type.
  return ['NULL', Blockly.SQL.ORDER_ATOMIC];
};

Blockly.SQL['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.SQL.valueToCode(block, 'IF',
      Blockly.SQL.ORDER_CONDITIONAL) || 'FALSE';
  var value_then = Blockly.SQL.valueToCode(block, 'THEN',
      Blockly.SQL.ORDER_CONDITIONAL) || 'NULL';
  var value_else = Blockly.SQL.valueToCode(block, 'ELSE',
      Blockly.SQL.ORDER_CONDITIONAL) || 'NULL';
  var code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, Blockly.SQL.ORDER_CONDITIONAL];
};
