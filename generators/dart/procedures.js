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
 * @fileoverview Generating Dart for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Dart.procedures');

goog.require('Blockly.Dart');


Blockly.Dart['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  var funcName = Blockly.Dart.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.Dart.statementToCode(block, 'STACK');
  if (Blockly.Dart.STATEMENT_PREFIX) {
    var id = block.id.replace(/\$/g, '$$$$');  // Issue 251.
    branch = Blockly.Dart.prefixLines(
        Blockly.Dart.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + id + '\''), Blockly.Dart.INDENT) + branch;
  }
  if (Blockly.Dart.INFINITE_LOOP_TRAP) {
    branch = Blockly.Dart.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var returnValue = Blockly.Dart.valueToCode(block, 'RETURN',
      Blockly.Dart.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = Blockly.Dart.INDENT + 'return ' + returnValue + ';\n';
  }
  var returnType = returnValue ? 'dynamic' : 'void';
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Dart.variableDB_.getName(block.arguments_[i],
        Blockly.Variables.NAME_TYPE);
  }
  var code = returnType + ' ' + funcName + '(' + args.join(', ') + ') {\n' +
      branch + returnValue + '}';
  code = Blockly.Dart.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.Dart.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.Dart['procedures_defnoreturn'] = Blockly.Dart['procedures_defreturn'];

Blockly.Dart['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.Dart.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Dart.valueToCode(block, 'ARG' + i,
        Blockly.Dart.ORDER_NONE) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
};

Blockly.Dart['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = Blockly.Dart.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Dart.valueToCode(block, 'ARG' + i,
        Blockly.Dart.ORDER_NONE) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ');\n';
  return code;
};

Blockly.Dart['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.Dart.valueToCode(block, 'CONDITION',
      Blockly.Dart.ORDER_NONE) || 'false';
  var code = 'if (' + condition + ') {\n';
  if (block.hasReturnValue_) {
    var value = Blockly.Dart.valueToCode(block, 'VALUE',
        Blockly.Dart.ORDER_NONE) || 'null';
    code += Blockly.Dart.INDENT + 'return ' + value + ';\n';
  } else {
    code += Blockly.Dart.INDENT + 'return;\n';
  }
  code += '}\n';
  return code;
};
