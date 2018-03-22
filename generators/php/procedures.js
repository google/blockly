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

goog.provide('Blockly.PHP.procedures');

goog.require('Blockly.PHP');

Blockly.PHP['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  // First, add a 'global' statement for every variable that is not shadowed by
  // a local parameter.
  var globals = [];
  var varName;
  var workspace = block.workspace;
  var variables = Blockly.Variables.allUsedVarModels(workspace) || [];
  for (var i = 0, variable; variable = variables[i]; i++) {
    varName = variable.name;
    if (block.arguments_.indexOf(varName) == -1) {
      globals.push(Blockly.PHP.variableDB_.getName(varName,
          Blockly.Variables.NAME_TYPE));
    }
  }
  // Add developer variables.
  var devVarList = Blockly.Variables.allDeveloperVariables(workspace);
  for (var i = 0; i < devVarList.length; i++) {
    globals.push(Blockly.PHP.variableDB_.getName(devVarList[i],
        Blockly.Names.DEVELOPER_VARIABLE_TYPE));
  }
  globals = globals.length ?
      Blockly.PHP.INDENT + 'global ' + globals.join(', ') + ';\n' : '';

  var funcName = Blockly.PHP.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.PHP.statementToCode(block, 'STACK');
  if (Blockly.PHP.STATEMENT_PREFIX) {
    var id = block.id.replace(/\$/g, '$$$$');  // Issue 251.
    branch = Blockly.PHP.prefixLines(
        Blockly.PHP.STATEMENT_PREFIX.replace(
            /%1/g, '\'' + id + '\''), Blockly.PHP.INDENT) + branch;
  }
  if (Blockly.PHP.INFINITE_LOOP_TRAP) {
    branch = Blockly.PHP.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var returnValue = Blockly.PHP.valueToCode(block, 'RETURN',
      Blockly.PHP.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = Blockly.PHP.INDENT + 'return ' + returnValue + ';\n';
  }
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.PHP.variableDB_.getName(block.arguments_[i],
        Blockly.Variables.NAME_TYPE);
  }
  var code = 'function ' + funcName + '(' + args.join(', ') + ') {\n' +
      globals + branch + returnValue + '}';
  code = Blockly.PHP.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.PHP.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.PHP['procedures_defnoreturn'] =
    Blockly.PHP['procedures_defreturn'];

Blockly.PHP['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.PHP.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.PHP.valueToCode(block, 'ARG' + i,
        Blockly.PHP.ORDER_COMMA) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.PHP.ORDER_FUNCTION_CALL];
};

Blockly.PHP['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = Blockly.PHP.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.PHP.valueToCode(block, 'ARG' + i,
        Blockly.PHP.ORDER_COMMA) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ');\n';
  return code;
};

Blockly.PHP['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.PHP.valueToCode(block, 'CONDITION',
      Blockly.PHP.ORDER_NONE) || 'false';
  var code = 'if (' + condition + ') {\n';
  if (block.hasReturnValue_) {
    var value = Blockly.PHP.valueToCode(block, 'VALUE',
        Blockly.PHP.ORDER_NONE) || 'null';
    code += Blockly.PHP.INDENT + 'return ' + value + ';\n';
  } else {
    code += Blockly.PHP.INDENT + 'return;\n';
  }
  code += '}\n';
  return code;
};
