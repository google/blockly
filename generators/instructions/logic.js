/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2014 Google Inc.
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
 * @fileoverview Generating Instructions for logic blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Instructions.logic');

goog.require('Blockly.Instructions');


Blockly.Instructions['controls_if'] = function(block) {
  // If/elseif/else condition.
  var conditionalCount = block.elseifCount_;
  if (block.elseCount_) conditionalCount++;
  var code = '';
  var finishJump = 0;

  for (var n = conditionalCount; n >= 0; n--) {
      if (n == conditionalCount && block.elseCount_) {
        branch = Blockly.Instructions.statementToCode(block, 'ELSE');
        code += branch;

        var lineBreaks = 0;
        for (var i = 0; i < branch.length; i++) {
          if (branch[i] == '\n') lineBreaks++;
        }
        finishJump += lineBreaks;
        continue;
      }


      var argument = '';
      var valueBlock = block.getInputTargetBlock('IF' + n) || '0';
      var value = '';
      var operation = 'beq 0 ';

      if (valueBlock == '0') {
        value = '0';
      } else if (valueBlock.type == 'logic_boolean') {
        value = Blockly.Instructions.valueToCode(block, 'IF' + n, 
          Blockly.Instructions.ORDER_NONE);
      } else if (valueBlock.type == 'variables_get') {
        var varName = Blockly.Instructions.variableDB_.getName(valueBlock.getFieldValue('VAR'),
          Blockly.Variables.NAME_TYPE);
        value = Blockly.Instructions.mapping_[varName];
      } else if (valueBlock.type == 'logic_compare') {
        operation = Blockly.Instructions.valueToCode(block, 'IF' + n,
          Blockly.Instructions.ORDER_NONE);
      } else if (valueBlock.type == 'arduino_digital_read') {
        argument = Blockly.Instructions.valueToCode(block, 'IF' + n,
          Blockly.Instructions.ORDER_NONE) + '\n';
        value = Blockly.Instructions.mapping_[valueBlock.id];
      }

      var branch = Blockly.Instructions.statementToCode(block, 'DO' + n);
      branch += 'jump ' + finishJump + '\n';

      var lineBreaks = 0;
      for (var i = 0; i < branch.length; i++) {
        if (branch[i] == '\n') lineBreaks++;
      }
      var toEnd = lineBreaks;
      for (var i = 0; i < operation.length; i++) {
        if (operation[i] == '\n') lineBreaks++;
      }
      for (var i = 0; i < argument.length; i++) {
        if (argument[i] == '\n') lineBreaks++;
      }
      finishJump += (lineBreaks + 1);

      code = argument + operation + value + ' ' + toEnd + '\n' + branch + code;
  }

  return code;
};

Blockly.Instructions['logic_compare'] = function(block) {
  // Comparison operator.
  var OPERATORS = {
    'EQ': 'bneq',
    'NEQ': 'beq',
    'LT': 'bgeq',
    'LTE': 'bge',
    'GT': 'bgeq',
    'GTE': 'bge'
  };
  var fieldOp = block.getFieldValue('OP');
  var first = (fieldOp == 'GT' || fieldOp == 'GTE') ?
      'B' : 'A';
  var second = (first == 'B') ? 'A' : 'B';

  var operator = OPERATORS[fieldOp];
  var order = (operator == 'bneq' || operator == 'beq') ?
      Blockly.Instructions.ORDER_EQUALITY : Blockly.Instructions.ORDER_RELATIONAL;

  var argument0 = ''; 
  var valueBlock0 = block.getInputTargetBlock(first) || '0';
  var value0;
  if (valueBlock0 == '0') {
    value0 = '0';
  } else if (valueBlock0.type == 'math_number') {
    value0 = valueBlock0.getFieldValue('NUM');
  } else if (valueBlock0.type == 'logic_boolean') {
    value0 = Blockly.Instructions.valueToCode(block, first, order);
  } else if (valueBlock0.type == 'variables_get') {
    var varName = Blockly.Instructions.variableDB_.getName(valueBlock0.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
    value0 = Blockly.Instructions.mapping_[varName];
  } else {
    argument0 = Blockly.Instructions.valueToCode(block, first, order) + '\n';
    value0 = Blockly.Instructions.mapping_[valueBlock0.id];
  }

  var argument1 = ''; 
  var valueBlock1 = block.getInputTargetBlock(second) || '0';
  var value1;
  if (valueBlock1 == '0') {
    value1 = '0';
  } else if (valueBlock1.type == 'math_number') {
    value1 = valueBlock1.getFieldValue('NUM');
  } else if (valueBlock1.type == 'logic_boolean') {
    value1 = Blockly.Instructions.valueToCode(block, second, order);
  } else if (valueBlock1.type == 'variables_get') {
    var varName = Blockly.Instructions.variableDB_.getName(valueBlock1.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
    value1 = Blockly.Instructions.mapping_[varName];
  } else {
    argument1 = Blockly.Instructions.valueToCode(block, second, order) + '\n';
    value1 = Blockly.Instructions.mapping_[valueBlock1.id];
  }

  //var code = argument0 + ' ' + operator + ' ' + argument1;
  var code = argument0 + argument1 + operator + ' ' + value0 + ' ' + value1;
  return [code, order];
};

Blockly.Instructions['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? '&&' : '||';
  var order = (operator == '&&') ? Blockly.Instructions.ORDER_LOGICAL_AND :
      Blockly.Instructions.ORDER_LOGICAL_OR;
  var argument0 = Blockly.Instructions.valueToCode(block, 'A', order);
  var argument1 = Blockly.Instructions.valueToCode(block, 'B', order);
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

Blockly.Instructions['logic_negate'] = function(block) {
  // Negation.
  var order = Blockly.Instructions.ORDER_UNARY_PREFIX;
  var argument0 = Blockly.Instructions.valueToCode(block, 'BOOL', order) || 'true';
  var code = '!' + argument0;
  return [code, order];
};

Blockly.Instructions['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? '1' : '0';
  return [code, Blockly.Instructions.ORDER_ATOMIC];
};

Blockly.Instructions['logic_null'] = function(block) {
  // Null data type.
  return ['null', Blockly.Instructions.ORDER_ATOMIC];
};

Blockly.Instructions['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.Instructions.valueToCode(block, 'IF',
      Blockly.Instructions.ORDER_CONDITIONAL) || 'false';
  var value_then = Blockly.Instructions.valueToCode(block, 'THEN',
      Blockly.Instructions.ORDER_CONDITIONAL) || 'null';
  var value_else = Blockly.Instructions.valueToCode(block, 'ELSE',
      Blockly.Instructions.ORDER_CONDITIONAL) || 'null';
  var code = value_if + ' ? ' + value_then + ' : ' + value_else;
  return [code, Blockly.Instructions.ORDER_CONDITIONAL];
};
