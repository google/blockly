/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Go for procedure blocks.
 * @author daarond@gmail.com (Daaron Dwyer)
 */
'use strict';

goog.provide('Blockly.Go.procedures');

goog.require('Blockly.Go');

Blockly.Go['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  // First, add a 'global' statement for every variable that is not shadowed by
  // a local parameter.
  //var globals = [];
  var varName;
  var workspace = block.workspace;
  var variables = Blockly.Variables.allUsedVarModels(workspace) || [];
  /*for (var i = 0, variable; variable = variables[i]; i++) {
    varName = variable.name;
    if (block.arguments_.indexOf(varName) == -1) {
      globals.push(Blockly.Go.variableDB_.getName(varName,
          Blockly.VARIABLE_CATEGORY_NAME));
    }
  }*/
  // Add developer variables.
  /*var devVarList = Blockly.Variables.allDeveloperVariables(workspace);
  for (var i = 0; i < devVarList.length; i++) {
    globals.push(Blockly.Go.variableDB_.getName(devVarList[i],
        Blockly.Names.DEVELOPER_VARIABLE_TYPE));
  }
  globals = globals.length ?
      Blockly.Go.INDENT + 'global ' + globals.join(', ') + '\n' : '';
*/
  var funcName = Blockly.Go.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.PROCEDURE_CATEGORY_NAME);
  var xfix1 = '';
  if (Blockly.Go.STATEMENT_PREFIX) {
    xfix1 += Blockly.Go.injectId(Blockly.Go.STATEMENT_PREFIX, block);
  }
  if (Blockly.Go.STATEMENT_SUFFIX) {
    xfix1 += Blockly.Go.injectId(Blockly.Go.STATEMENT_SUFFIX, block);
  }
  if (xfix1) {
    xfix1 = Blockly.Go.prefixLines(xfix1, Blockly.Go.INDENT);
  }
  var loopTrap = '';
  if (Blockly.Go.INFINITE_LOOP_TRAP) {
    loopTrap = Blockly.Go.prefixLines(
        Blockly.Go.injectId(Blockly.Go.INFINITE_LOOP_TRAP, block),
        Blockly.Go.INDENT);
  }
  var branch = Blockly.Go.statementToCode(block, 'STACK');
  var returnValue = Blockly.Go.valueToCode(block, 'RETURN',
      Blockly.Go.ORDER_NONE) || '';
  var xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = Blockly.Go.INDENT + 'return ' + returnValue + '\n';
  }
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Go.variableDB_.getName(block.arguments_[i],
        Blockly.VARIABLE_CATEGORY_NAME);
  }
  var code = 'func ' + funcName + '(' + args.join(', ') + ') {\n' +
       xfix1 + loopTrap + branch + xfix2 + returnValue + '}';
  code = Blockly.Go.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.Go.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.Go['procedures_defnoreturn'] =
    Blockly.Go['procedures_defreturn'];

Blockly.Go['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.Go.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.PROCEDURE_CATEGORY_NAME);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Go.valueToCode(block, 'ARG' + i,
        Blockly.Go.ORDER_COMMA) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.Go.ORDER_FUNCTION_CALL];
};

Blockly.Go['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  // Generated code is for a function call as a statement is the same as a
  // function call as a value, with the addition of line ending.
  var tuple = Blockly.Go['procedures_callreturn'](block);
  return tuple[0] + '\n';
};

Blockly.Go['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.Go.valueToCode(block, 'CONDITION',
      Blockly.Go.ORDER_NONE) || 'false';
  var code = 'if (' + condition + ') {\n';
  if (Blockly.Go.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the return is triggered.
    code += Blockly.Go.prefixLines(
        Blockly.Go.injectId(Blockly.Go.STATEMENT_SUFFIX, block),
        Blockly.Go.INDENT);
  }
  if (block.hasReturnValue_) {
    var value = Blockly.Go.valueToCode(block, 'VALUE',
        Blockly.Go.ORDER_NONE) || 'null';
    code += Blockly.Go.INDENT + 'return ' + value + '\n';
  } else {
    code += Blockly.Go.INDENT + 'return\n';
  }
  code += '}\n';
  return code;
};
