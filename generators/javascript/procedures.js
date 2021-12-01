/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating JavaScript for procedure blocks.
 */
'use strict';

goog.module('Blockly.JavaScript.procedures');

const JavaScript = goog.require('Blockly.JavaScript');
const {NameType} = goog.require('Blockly.Names');


JavaScript['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  const funcName = JavaScript.nameDB_.getName(
      block.getFieldValue('NAME'), NameType.PROCEDURE);
  let xfix1 = '';
  if (JavaScript.STATEMENT_PREFIX) {
    xfix1 += JavaScript.injectId(JavaScript.STATEMENT_PREFIX, block);
  }
  if (JavaScript.STATEMENT_SUFFIX) {
    xfix1 += JavaScript.injectId(JavaScript.STATEMENT_SUFFIX, block);
  }
  if (xfix1) {
    xfix1 = JavaScript.prefixLines(xfix1, JavaScript.INDENT);
  }
  let loopTrap = '';
  if (JavaScript.INFINITE_LOOP_TRAP) {
    loopTrap = JavaScript.prefixLines(
        JavaScript.injectId(JavaScript.INFINITE_LOOP_TRAP, block),
        JavaScript.INDENT);
  }
  const branch = JavaScript.statementToCode(block, 'STACK');
  let returnValue =
      JavaScript.valueToCode(block, 'RETURN', JavaScript.ORDER_NONE) || '';
  let xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = JavaScript.INDENT + 'return ' + returnValue + ';\n';
  }
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] = JavaScript.nameDB_.getName(variables[i], NameType.VARIABLE);
  }
  let code = 'function ' + funcName + '(' + args.join(', ') + ') {\n' + xfix1 +
      loopTrap + branch + xfix2 + returnValue + '}';
  code = JavaScript.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  JavaScript.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
JavaScript['procedures_defnoreturn'] = JavaScript['procedures_defreturn'];

JavaScript['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  const funcName = JavaScript.nameDB_.getName(
      block.getFieldValue('NAME'), NameType.PROCEDURE);
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] = JavaScript.valueToCode(block, 'ARG' + i, JavaScript.ORDER_NONE) ||
        'null';
  }
  const code = funcName + '(' + args.join(', ') + ')';
  return [code, JavaScript.ORDER_FUNCTION_CALL];
};

JavaScript['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  // Generated code is for a function call as a statement is the same as a
  // function call as a value, with the addition of line ending.
  const tuple = JavaScript['procedures_callreturn'](block);
  return tuple[0] + ';\n';
};

JavaScript['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  const condition =
      JavaScript.valueToCode(block, 'CONDITION', JavaScript.ORDER_NONE) ||
      'false';
  let code = 'if (' + condition + ') {\n';
  if (JavaScript.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the return is triggered.
    code += JavaScript.prefixLines(
        JavaScript.injectId(JavaScript.STATEMENT_SUFFIX, block),
        JavaScript.INDENT);
  }
  if (block.hasReturnValue_) {
    const value =
        JavaScript.valueToCode(block, 'VALUE', JavaScript.ORDER_NONE) || 'null';
    code += JavaScript.INDENT + 'return ' + value + ';\n';
  } else {
    code += JavaScript.INDENT + 'return;\n';
  }
  code += '}\n';
  return code;
};
