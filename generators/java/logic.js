/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Generating Java for logic blocks.
 * @author toebes@extremenetworks.com (John Toebes)
 * Based on Python version by q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Java.logic');

goog.require('Blockly.Java');

Blockly.Java['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  var argument = Blockly.Java.valueToCode(block, 'IF' + n,
      Blockly.Java.ORDER_NONE) || 'false';
  var branch = Blockly.Java.statementToCode(block, 'DO' + n) ||
      Blockly.Java.PASS;
  var code = 'if (' + argument + ') {\n' + branch;
  for (n = 1; n <= block.elseifCount_; n++) {
    argument = Blockly.Java.valueToCode(block, 'IF' + n,
        Blockly.Java.ORDER_NONE) || 'false';
    branch = Blockly.Java.statementToCode(block, 'DO' + n) ||
        Blockly.Java.PASS;
    code += '} else if (' + argument + ') {\n' + branch;
  }
  if (block.elseCount_) {
    branch = Blockly.Java.statementToCode(block, 'ELSE') ||
        Blockly.Java.PASS;
    code += '} else {\n' + branch;
  }
  code += '}\n';
  return code;
};

Blockly.Java['logic_compare'] = function(block) {
  // Comparison operator.
  var OPERATORS = {
    'EQ': '',   // a.equals(b)
    'NEQ': '!',  // !a.equals(b)
    'LT': '<',    //  a.compareTo(b) < 0
    'LTE': '<=',  //  a.compareTo(b) <= 0
    'GT': '>',    //  a.compareTo(b) > 0
    'GTE': '>='   //  a.compareTo(b) >= 0
  };

  var FLIPOPERATORS = {
    '': '',
    '!' : '!',
    '<' : '>',
    '<=' : '>=',
    '>' : '<',
    '>=' : '<='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var argument0Type = Blockly.Java.getValueType(block, 'A');
  var argument1Type = Blockly.Java.getValueType(block, 'B');
  var code = '';
  var argument0 = Blockly.Java.valueToCode(block, 'A', Blockly.Java.ORDER_RELATIONAL);
  var argument1 = Blockly.Java.valueToCode(block, 'B', Blockly.Java.ORDER_RELATIONAL);
  if (argument0.slice(-14) === '.cloneObject()' ) {
    argument0 = argument0.slice(0,-14);
    if (argument1.slice(-14) === '.cloneObject()' ) {
      argument1 = argument1.slice(0,-14);
    }
  } else if (argument1.slice(-14) === '.cloneObject()' ) {
    operator = FLIPOPERATORS[operator];
    var temp = argument0;
    argument0 = argument1.slice(0,-14);
    argument1 = temp;
  }

  if (!argument0) {
    argument0 = '""';
  } else {
    argument0 = 'Var.valueOf(' + argument0 + ')';
    Blockly.Java.provideVarClass();
  }
  if (!argument1) {
    argument1 = '""';
  }
  if (operator === '' || operator === '!') {
    code = operator + argument0 + '.equals(' + argument1 + ')';
  } else {
    code = argument0 + '.compareTo(' + argument1 + ') ' + operator + ' 0';
  }
  return [code, Blockly.Java.ORDER_RELATIONAL];
};

Blockly.Java['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? ' && ' : ' || ';
  var order = (operator == 'and') ? Blockly.Java.ORDER_LOGICAL_AND :
      Blockly.Java.ORDER_LOGICAL_OR;
  var argument0 = Blockly.Java.valueToCode(block, 'A', order);
  var argument1 = Blockly.Java.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'false';
    argument1 = 'false';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == ' && ') ? 'true' : 'false';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.Java['logic_negate'] = function(block) {
  // Negation.
  var argument0 = Blockly.Java.valueToCode(block, 'BOOL',
      Blockly.Java.ORDER_LOGICAL_NOT) || 'true';
  var code = '!(' + argument0 + ')';
  return [code, Blockly.Java.ORDER_LOGICAL_NOT];
};

Blockly.Java['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java['logic_null'] = function(block) {
  // Null data type.
  return ['null', Blockly.Java.ORDER_ATOMIC];
};

Blockly.Java['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.Java.valueToCode(block, 'IF',
      Blockly.Java.ORDER_CONDITIONAL) || 'false';
  var value_then = Blockly.Java.valueToCode(block, 'THEN',
      Blockly.Java.ORDER_CONDITIONAL) || 'null';
  var value_else = Blockly.Java.valueToCode(block, 'ELSE',
      Blockly.Java.ORDER_CONDITIONAL) || 'null';
  var code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, Blockly.Java.ORDER_CONDITIONAL];
};
