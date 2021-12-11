/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating PHP for procedure blocks.
 */
'use strict';

goog.module('Blockly.PHP.procedures');

const PHP = goog.require('Blockly.PHP');
const Variables = goog.require('Blockly.Variables');
const {NameType} = goog.require('Blockly.Names');


PHP['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  // First, add a 'global' statement for every variable that is not shadowed by
  // a local parameter.
  const globals = [];
  const workspace = block.workspace;
  const usedVariables = Variables.allUsedVarModels(workspace) || [];
  for (let i = 0, variable; variable = usedVariables[i]; i++) {
    const varName = variable.name;
    if (block.getVars().indexOf(varName) === -1) {
      globals.push(PHP.nameDB_.getName(varName, NameType.VARIABLE));
    }
  }
  // Add developer variables.
  const devVarList = Variables.allDeveloperVariables(workspace);
  for (let i = 0; i < devVarList.length; i++) {
    globals.push(
        PHP.nameDB_.getName(devVarList[i], NameType.DEVELOPER_VARIABLE));
  }
  const globalStr =
      globals.length ? PHP.INDENT + 'global ' + globals.join(', ') + ';\n' : '';

  const funcName =
      PHP.nameDB_.getName(block.getFieldValue('NAME'), NameType.PROCEDURE);
  let xfix1 = '';
  if (PHP.STATEMENT_PREFIX) {
    xfix1 += PHP.injectId(PHP.STATEMENT_PREFIX, block);
  }
  if (PHP.STATEMENT_SUFFIX) {
    xfix1 += PHP.injectId(PHP.STATEMENT_SUFFIX, block);
  }
  if (xfix1) {
    xfix1 = PHP.prefixLines(xfix1, PHP.INDENT);
  }
  let loopTrap = '';
  if (PHP.INFINITE_LOOP_TRAP) {
    loopTrap = PHP.prefixLines(
        PHP.injectId(PHP.INFINITE_LOOP_TRAP, block), PHP.INDENT);
  }
  const branch = PHP.statementToCode(block, 'STACK');
  let returnValue = PHP.valueToCode(block, 'RETURN', PHP.ORDER_NONE) || '';
  let xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = PHP.INDENT + 'return ' + returnValue + ';\n';
  }
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] = PHP.nameDB_.getName(variables[i], NameType.VARIABLE);
  }
  let code = 'function ' + funcName + '(' + args.join(', ') + ') {\n' +
      globalStr + xfix1 + loopTrap + branch + xfix2 + returnValue + '}';
  code = PHP.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  PHP.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
PHP['procedures_defnoreturn'] = PHP['procedures_defreturn'];

PHP['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  const funcName =
      PHP.nameDB_.getName(block.getFieldValue('NAME'), NameType.PROCEDURE);
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] = PHP.valueToCode(block, 'ARG' + i, PHP.ORDER_NONE) || 'null';
  }
  const code = funcName + '(' + args.join(', ') + ')';
  return [code, PHP.ORDER_FUNCTION_CALL];
};

PHP['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  // Generated code is for a function call as a statement is the same as a
  // function call as a value, with the addition of line ending.
  const tuple = PHP['procedures_callreturn'](block);
  return tuple[0] + ';\n';
};

PHP['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  const condition =
      PHP.valueToCode(block, 'CONDITION', PHP.ORDER_NONE) || 'false';
  let code = 'if (' + condition + ') {\n';
  if (PHP.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the return is triggered.
    code +=
        PHP.prefixLines(PHP.injectId(PHP.STATEMENT_SUFFIX, block), PHP.INDENT);
  }
  if (block.hasReturnValue_) {
    const value = PHP.valueToCode(block, 'VALUE', PHP.ORDER_NONE) || 'null';
    code += PHP.INDENT + 'return ' + value + ';\n';
  } else {
    code += PHP.INDENT + 'return;\n';
  }
  code += '}\n';
  return code;
};
