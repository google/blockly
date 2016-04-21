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
 * @fileoverview Generating PHP for procedure blocks.
 * @author daarond@gmail.com (Daaron Dwyer)
 */
'use strict';

goog.provide('Blockly.SQL.procedures');

goog.require('Blockly.SQL');

Blockly.SQL['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  // First, add a 'global' statement for every variable that is assigned.
  var globals = Blockly.Variables.allVariables(block);
  for (var i = globals.length - 1; i >= 0; i--) {
      var varName = globals[i];
      if (block.arguments_.indexOf(varName) == -1) {
          globals[i] = Blockly.SQL.variableDB_.getName(varName,
              Blockly.Variables.NAME_TYPE);
      } else {
          // This variable is actually a parameter name.  Do not include it in
          // the list of globals, thus allowing it be of local scope.
          globals.splice(i, 1);
      }
  }
  globals = globals.length ? '  global ' + globals.join(', ') + ';\n' : '';

  var funcName = Blockly.SQL.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.SQL.statementToCode(block, 'STACK');
  if (Blockly.SQL.STATEMENT_PREFIX) {
    branch = Blockly.SQL.prefixLines(
        Blockly.SQL.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + block.id + '\''), Blockly.SQL.INDENT) + branch;
  }
  if (Blockly.SQL.INFINITE_LOOP_TRAP) {
    branch = Blockly.SQL.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var returnValue = Blockly.SQL.valueToCode(block, 'RETURN',
      Blockly.SQL.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = '  return ' + returnValue + ';\n';
  }
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.SQL.variableDB_.getName(block.arguments_[x],
        Blockly.Variables.NAME_TYPE);
  }
  var code = 'function ' + funcName + '(' + args.join(', ') + ') {\n' +
      globals + branch + returnValue + '}';
  code = Blockly.SQL.scrub_(block, code);
  Blockly.SQL.definitions_[funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.SQL['procedures_defnoreturn'] =
    Blockly.SQL['procedures_defreturn'];

Blockly.SQL['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.SQL.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.SQL.valueToCode(block, 'ARG' + x,
        Blockly.SQL.ORDER_COMMA) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.SQL.ORDER_FUNCTION_CALL];
};

Blockly.SQL['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = Blockly.SQL.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.SQL.valueToCode(block, 'ARG' + x,
        Blockly.SQL.ORDER_COMMA) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ');\n';
  return code;
};

Blockly.SQL['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.SQL.valueToCode(block, 'CONDITION',
      Blockly.SQL.ORDER_NONE) || 'false';
  var code = 'if (' + condition + ') {\n';
  if (block.hasReturnValue_) {
    var value = Blockly.SQL.valueToCode(block, 'VALUE',
        Blockly.SQL.ORDER_NONE) || 'null';
    code += '  return ' + value + ';\n';
  } else {
    code += '  return;\n';
  }
  code += '}\n';
  return code;
};
