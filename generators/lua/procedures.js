/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Lua for procedure blocks.
 */
'use strict';

goog.module('Blockly.Lua.procedures');

const Lua = goog.require('Blockly.Lua');
const {NameType} = goog.require('Blockly.Names');


Lua['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  const funcName =
      Lua.nameDB_.getName(block.getFieldValue('NAME'), NameType.PROCEDURE);
  let xfix1 = '';
  if (Lua.STATEMENT_PREFIX) {
    xfix1 += Lua.injectId(Lua.STATEMENT_PREFIX, block);
  }
  if (Lua.STATEMENT_SUFFIX) {
    xfix1 += Lua.injectId(Lua.STATEMENT_SUFFIX, block);
  }
  if (xfix1) {
    xfix1 = Lua.prefixLines(xfix1, Lua.INDENT);
  }
  let loopTrap = '';
  if (Lua.INFINITE_LOOP_TRAP) {
    loopTrap = Lua.prefixLines(
        Lua.injectId(Lua.INFINITE_LOOP_TRAP, block), Lua.INDENT);
  }
  let branch = Lua.statementToCode(block, 'STACK');
  let returnValue = Lua.valueToCode(block, 'RETURN', Lua.ORDER_NONE) || '';
  let xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = Lua.INDENT + 'return ' + returnValue + '\n';
  } else if (!branch) {
    branch = '';
  }
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] = Lua.nameDB_.getName(variables[i], NameType.VARIABLE);
  }
  let code = 'function ' + funcName + '(' + args.join(', ') + ')\n' + xfix1 +
      loopTrap + branch + xfix2 + returnValue + 'end\n';
  code = Lua.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Lua.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Lua['procedures_defnoreturn'] = Lua['procedures_defreturn'];

Lua['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  const funcName =
      Lua.nameDB_.getName(block.getFieldValue('NAME'), NameType.PROCEDURE);
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] = Lua.valueToCode(block, 'ARG' + i, Lua.ORDER_NONE) || 'nil';
  }
  const code = funcName + '(' + args.join(', ') + ')';
  return [code, Lua.ORDER_HIGH];
};

Lua['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  // Generated code is for a function call as a statement is the same as a
  // function call as a value, with the addition of line ending.
  const tuple = Lua['procedures_callreturn'](block);
  return tuple[0] + '\n';
};

Lua['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  const condition =
      Lua.valueToCode(block, 'CONDITION', Lua.ORDER_NONE) || 'false';
  let code = 'if ' + condition + ' then\n';
  if (Lua.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the return is triggered.
    code +=
        Lua.prefixLines(Lua.injectId(Lua.STATEMENT_SUFFIX, block), Lua.INDENT);
  }
  if (block.hasReturnValue_) {
    const value = Lua.valueToCode(block, 'VALUE', Lua.ORDER_NONE) || 'nil';
    code += Lua.INDENT + 'return ' + value + '\n';
  } else {
    code += Lua.INDENT + 'return\n';
  }
  code += 'end\n';
  return code;
};
