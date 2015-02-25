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
 * @fileoverview Generating Instructions for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Instructions.procedures');

goog.require('Blockly.Instructions');


Blockly.Instructions['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  var funcName = Blockly.Instructions.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.Instructions.statementToCode(block, 'STACK');
  if (Blockly.Instructions.STATEMENT_PREFIX) {
    branch = Blockly.Instructions.prefixLines(
        Blockly.Instructions.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + block.id + '\''), Blockly.Instructions.INDENT) + branch;
  }
  if (Blockly.Instructions.INFINITE_LOOP_TRAP) {
    branch = Blockly.Instructions.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var returnValue = Blockly.Instructions.valueToCode(block, 'RETURN',
      Blockly.Instructions.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = '  return ' + returnValue + ';\n';
  }
  var returnType = returnValue ? 'dynamic' : 'void';
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.Instructions.variableDB_.getName(block.arguments_[x],
        Blockly.Variables.NAME_TYPE);
  }
  var code = returnType + ' ' + funcName + '(' + args.join(', ') + ') {\n' +
      branch + returnValue + '}';
  code = Blockly.Instructions.scrub_(block, code);
  Blockly.Instructions.definitions_[funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.Instructions['procedures_defnoreturn'] = Blockly.Instructions['procedures_defreturn'];

Blockly.Instructions['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.Instructions.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.Instructions.valueToCode(block, 'ARG' + x,
        Blockly.Instructions.ORDER_NONE) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.Instructions.ORDER_UNARY_POSTFIX];
};

Blockly.Instructions['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = Blockly.Instructions.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.Instructions.valueToCode(block, 'ARG' + x,
        Blockly.Instructions.ORDER_NONE) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ');\n';
  return code;
};

Blockly.Instructions['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.Instructions.valueToCode(block, 'CONDITION',
      Blockly.Instructions.ORDER_NONE) || 'false';
  var code = 'if (' + condition + ') {\n';
  if (block.hasReturnValue_) {
    var value = Blockly.Instructions.valueToCode(block, 'VALUE',
        Blockly.Instructions.ORDER_NONE) || 'null';
    code += '  return ' + value + ';\n';
  } else {
    code += '  return;\n';
  }
  code += '}\n';
  return code;
};
