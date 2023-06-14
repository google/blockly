/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Dart for procedure blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Dart.procedures');

import {NameType} from '../../core/names.js';
import {dartGenerator, Order} from '../dart.js';


dartGenerator.forBlock['procedures_defreturn'] = function(block, generator) {
  // Define a procedure with a return value.
  const funcName =
      dartGenerator.nameDB_.getName(
        block.getFieldValue('NAME'), NameType.PROCEDURE);
  let xfix1 = '';
  if (dartGenerator.STATEMENT_PREFIX) {
    xfix1 += dartGenerator.injectId(dartGenerator.STATEMENT_PREFIX, block);
  }
  if (dartGenerator.STATEMENT_SUFFIX) {
    xfix1 += dartGenerator.injectId(dartGenerator.STATEMENT_SUFFIX, block);
  }
  if (xfix1) {
    xfix1 = dartGenerator.prefixLines(xfix1, dartGenerator.INDENT);
  }
  let loopTrap = '';
  if (dartGenerator.INFINITE_LOOP_TRAP) {
    loopTrap = dartGenerator.prefixLines(
        dartGenerator.injectId(dartGenerator.INFINITE_LOOP_TRAP, block),
        dartGenerator.INDENT);
  }
  const branch = dartGenerator.statementToCode(block, 'STACK');
  let returnValue =
      dartGenerator.valueToCode(block, 'RETURN', Order.NONE) || '';
  let xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = dartGenerator.INDENT + 'return ' + returnValue + ';\n';
  }
  const returnType = returnValue ? 'dynamic' : 'void';
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] = dartGenerator.nameDB_.getName(variables[i], NameType.VARIABLE);
  }
  let code = returnType + ' ' + funcName + '(' + args.join(', ') + ') {\n' +
      xfix1 + loopTrap + branch + xfix2 + returnValue + '}';
  code = dartGenerator.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  dartGenerator.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
dartGenerator.forBlock['procedures_defnoreturn'] = dartGenerator.forBlock['procedures_defreturn'];

dartGenerator.forBlock['procedures_callreturn'] = function(block, generator) {
  // Call a procedure with a return value.
  const funcName =
      dartGenerator.nameDB_.getName(
        block.getFieldValue('NAME'),NameType.PROCEDURE);
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] = dartGenerator.valueToCode(block, 'ARG' + i, Order.NONE) || 'null';
  }
  let code = funcName + '(' + args.join(', ') + ')';
  return [code, Order.UNARY_POSTFIX];
};

dartGenerator.forBlock['procedures_callnoreturn'] = function(block, generator) {
  // Call a procedure with no return value.
  // Generated code is for a function call as a statement is the same as a
  // function call as a value, with the addition of line ending.
  const tuple = dartGenerator.forBlock['procedures_callreturn'](block);
  return tuple[0] + ';\n';
};

dartGenerator.forBlock['procedures_ifreturn'] = function(block, generator) {
  // Conditionally return value from a procedure.
  const condition =
      dartGenerator.valueToCode(block, 'CONDITION', Order.NONE) || 'false';
  let code = 'if (' + condition + ') {\n';
  if (dartGenerator.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the return is triggered.
    code += dartGenerator.prefixLines(
        dartGenerator.injectId(
          dartGenerator.STATEMENT_SUFFIX, block), dartGenerator.INDENT);
  }
  if (block.hasReturnValue_) {
    const value =
        dartGenerator.valueToCode(block, 'VALUE', Order.NONE) || 'null';
    code += dartGenerator.INDENT + 'return ' + value + ';\n';
  } else {
    code += dartGenerator.INDENT + 'return;\n';
  }
  code += '}\n';
  return code;
};
