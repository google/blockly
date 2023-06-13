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
import {dartGenerator as Dart, Order} from '../dart.js';


Dart.forBlock['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  const funcName =
      Dart.nameDB_.getName(block.getFieldValue('NAME'), NameType.PROCEDURE);
  let xfix1 = '';
  if (Dart.STATEMENT_PREFIX) {
    xfix1 += Dart.injectId(Dart.STATEMENT_PREFIX, block);
  }
  if (Dart.STATEMENT_SUFFIX) {
    xfix1 += Dart.injectId(Dart.STATEMENT_SUFFIX, block);
  }
  if (xfix1) {
    xfix1 = Dart.prefixLines(xfix1, Dart.INDENT);
  }
  let loopTrap = '';
  if (Dart.INFINITE_LOOP_TRAP) {
    loopTrap = Dart.prefixLines(
        Dart.injectId(Dart.INFINITE_LOOP_TRAP, block), Dart.INDENT);
  }
  const branch = Dart.statementToCode(block, 'STACK');
  let returnValue = Dart.valueToCode(block, 'RETURN', Order.NONE) || '';
  let xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = Dart.INDENT + 'return ' + returnValue + ';\n';
  }
  const returnType = returnValue ? 'dynamic' : 'void';
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] = Dart.nameDB_.getName(variables[i], NameType.VARIABLE);
  }
  let code = returnType + ' ' + funcName + '(' + args.join(', ') + ') {\n' +
      xfix1 + loopTrap + branch + xfix2 + returnValue + '}';
  code = Dart.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Dart.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Dart.forBlock['procedures_defnoreturn'] = Dart.forBlock['procedures_defreturn'];

Dart.forBlock['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  const funcName =
      Dart.nameDB_.getName(block.getFieldValue('NAME'), NameType.PROCEDURE);
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] = Dart.valueToCode(block, 'ARG' + i, Order.NONE) || 'null';
  }
  let code = funcName + '(' + args.join(', ') + ')';
  return [code, Order.UNARY_POSTFIX];
};

Dart.forBlock['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  // Generated code is for a function call as a statement is the same as a
  // function call as a value, with the addition of line ending.
  const tuple = Dart.forBlock['procedures_callreturn'](block);
  return tuple[0] + ';\n';
};

Dart.forBlock['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  const condition =
      Dart.valueToCode(block, 'CONDITION', Order.NONE) || 'false';
  let code = 'if (' + condition + ') {\n';
  if (Dart.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the return is triggered.
    code += Dart.prefixLines(
        Dart.injectId(Dart.STATEMENT_SUFFIX, block), Dart.INDENT);
  }
  if (block.hasReturnValue_) {
    const value = Dart.valueToCode(block, 'VALUE', Order.NONE) || 'null';
    code += Dart.INDENT + 'return ' + value + ';\n';
  } else {
    code += Dart.INDENT + 'return;\n';
  }
  code += '}\n';
  return code;
};
