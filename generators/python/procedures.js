/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Python for procedure blocks.
 */
'use strict';

goog.provide('Blockly.Python.procedures');

goog.require('Blockly.Python');


Blockly.Python['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  // First, add a 'global' statement for every variable that is not shadowed by
  // a local parameter.
  const globals = [];
  const workspace = block.workspace;
  const usedVariables = Blockly.Variables.allUsedVarModels(workspace) || [];
  for (let i = 0, variable; (variable = usedVariables[i]); i++) {
    const varName = variable.name;
    if (block.getVars().indexOf(varName) === -1) {
      globals.push(Blockly.Python.nameDB_.getName(varName,
          Blockly.VARIABLE_CATEGORY_NAME));
    }
  }
  // Add developer variables.
  const devVarList = Blockly.Variables.allDeveloperVariables(workspace);
  for (let i = 0; i < devVarList.length; i++) {
    globals.push(Blockly.Python.nameDB_.getName(devVarList[i],
        Blockly.Names.DEVELOPER_VARIABLE_TYPE));
  }

  const globalString = globals.length ?
      Blockly.Python.INDENT + 'global ' + globals.join(', ') + '\n' : '';
  const funcName = Blockly.Python.nameDB_.getName(
      block.getFieldValue('NAME'), Blockly.PROCEDURE_CATEGORY_NAME);
  let xfix1 = '';
  if (Blockly.Python.STATEMENT_PREFIX) {
    xfix1 += Blockly.Python.injectId(Blockly.Python.STATEMENT_PREFIX, block);
  }
  if (Blockly.Python.STATEMENT_SUFFIX) {
    xfix1 += Blockly.Python.injectId(Blockly.Python.STATEMENT_SUFFIX, block);
  }
  if (xfix1) {
    xfix1 = Blockly.Python.prefixLines(xfix1, Blockly.Python.INDENT);
  }
  let loopTrap = '';
  if (Blockly.Python.INFINITE_LOOP_TRAP) {
    loopTrap = Blockly.Python.prefixLines(
        Blockly.Python.injectId(Blockly.Python.INFINITE_LOOP_TRAP, block),
        Blockly.Python.INDENT);
  }
  let branch = Blockly.Python.statementToCode(block, 'STACK');
  let returnValue = Blockly.Python.valueToCode(block, 'RETURN',
      Blockly.Python.ORDER_NONE) || '';
  let xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = Blockly.Python.INDENT + 'return ' + returnValue + '\n';
  } else if (!branch) {
    branch = Blockly.Python.PASS;
  }
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] = Blockly.Python.nameDB_.getName(variables[i],
        Blockly.VARIABLE_CATEGORY_NAME);
  }
  let code = 'def ' + funcName + '(' + args.join(', ') + '):\n' + globalString +
      xfix1 + loopTrap + branch + xfix2 + returnValue;
  code = Blockly.Python.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.Python.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.Python['procedures_defnoreturn'] =
    Blockly.Python['procedures_defreturn'];

Blockly.Python['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  const funcName = Blockly.Python.nameDB_.getName(block.getFieldValue('NAME'),
      Blockly.PROCEDURE_CATEGORY_NAME);
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] = Blockly.Python.valueToCode(block, 'ARG' + i,
        Blockly.Python.ORDER_NONE) || 'None';
  }
  const code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Python['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  // Generated code is for a function call as a statement is the same as a
  // function call as a value, with the addition of line ending.
  const tuple = Blockly.Python['procedures_callreturn'](block);
  return tuple[0] + '\n';
};

Blockly.Python['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  const condition = Blockly.Python.valueToCode(block, 'CONDITION',
      Blockly.Python.ORDER_NONE) || 'False';
  let code = 'if ' + condition + ':\n';
  if (Blockly.Python.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the return is triggered.
    code += Blockly.Python.prefixLines(
        Blockly.Python.injectId(Blockly.Python.STATEMENT_SUFFIX, block),
        Blockly.Python.INDENT);
  }
  if (block.hasReturnValue_) {
    const value = Blockly.Python.valueToCode(block, 'VALUE',
        Blockly.Python.ORDER_NONE) || 'None';
    code += Blockly.Python.INDENT + 'return ' + value + '\n';
  } else {
    code += Blockly.Python.INDENT + 'return\n';
  }
  return code;
};
