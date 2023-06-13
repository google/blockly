/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating JavaScript for procedure blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.JavaScript.procedures');

import {NameType} from '../../core/names.js';
import {Order, javascriptGenerator} from '../javascript.js';


javascriptGenerator.forBlock['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  const funcName = javascriptGenerator.nameDB_.getName(
      block.getFieldValue('NAME'), NameType.PROCEDURE);
  let xfix1 = '';
  if (javascriptGenerator.STATEMENT_PREFIX) {
    xfix1 += javascriptGenerator.injectId(
        javascriptGenerator.STATEMENT_PREFIX, block);
  }
  if (javascriptGenerator.STATEMENT_SUFFIX) {
    xfix1 += javascriptGenerator.injectId(
        javascriptGenerator.STATEMENT_SUFFIX, block);
  }
  if (xfix1) {
    xfix1 = javascriptGenerator.prefixLines(xfix1, javascriptGenerator.INDENT);
  }
  let loopTrap = '';
  if (javascriptGenerator.INFINITE_LOOP_TRAP) {
    loopTrap = javascriptGenerator.prefixLines(
        javascriptGenerator.injectId(
          javascriptGenerator.INFINITE_LOOP_TRAP, block),
        javascriptGenerator.INDENT);
  }
  const branch = javascriptGenerator.statementToCode(block, 'STACK');
  let returnValue =
      javascriptGenerator.valueToCode(block, 'RETURN', Order.NONE) || '';
  let xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = javascriptGenerator.INDENT + 'return ' + returnValue + ';\n';
  }
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] =
        javascriptGenerator.nameDB_.getName(variables[i], NameType.VARIABLE);
  }
  let code = 'function ' + funcName + '(' + args.join(', ') + ') {\n' + xfix1 +
      loopTrap + branch + xfix2 + returnValue + '}';
  code = javascriptGenerator.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  javascriptGenerator.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
javascriptGenerator.forBlock['procedures_defnoreturn'] =
    javascriptGenerator.forBlock['procedures_defreturn'];

javascriptGenerator.forBlock['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  const funcName = javascriptGenerator.nameDB_.getName(
      block.getFieldValue('NAME'), NameType.PROCEDURE);
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] = javascriptGenerator.valueToCode(block, 'ARG' + i, Order.NONE) ||
        'null';
  }
  const code = funcName + '(' + args.join(', ') + ')';
  return [code, Order.FUNCTION_CALL];
};

javascriptGenerator.forBlock['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  // Generated code is for a function call as a statement is the same as a
  // function call as a value, with the addition of line ending.
  const tuple = javascriptGenerator.forBlock['procedures_callreturn'](block);
  return tuple[0] + ';\n';
};

javascriptGenerator.forBlock['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  // Generated code is for a function call as a statement is the same as a
  // function call as a value, with the addition of line ending.
  const tuple = javascriptGenerator.forBlock['procedures_callreturn'](block);
  return tuple[0] + ';\n';
};

javascriptGenerator.forBlock['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  const condition =
      javascriptGenerator.valueToCode(block, 'CONDITION', Order.NONE) ||
      'false';
  let code = 'if (' + condition + ') {\n';
  if (javascriptGenerator.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the return is triggered.
    code += javascriptGenerator.prefixLines(
        javascriptGenerator.injectId(
          javascriptGenerator.STATEMENT_SUFFIX, block),
        javascriptGenerator.INDENT);
  }
  if (block.hasReturnValue_) {
    const value =
        javascriptGenerator.valueToCode(block, 'VALUE', Order.NONE) || 'null';
    code += javascriptGenerator.INDENT + 'return ' + value + ';\n';
  } else {
    code += javascriptGenerator.INDENT + 'return;\n';
  }
  code += '}\n';
  return code;
};
