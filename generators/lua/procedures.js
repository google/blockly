/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Lua for procedure blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Lua.procedures');

import {NameType} from '../../core/names.js';
import {luaGenerator, Order} from '../lua.js';


luaGenerator.forBlock['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  const funcName =
      luaGenerator.nameDB_.getName(
        block.getFieldValue('NAME'), NameType.PROCEDURE);
  let xfix1 = '';
  if (luaGenerator.STATEMENT_PREFIX) {
    xfix1 += luaGenerator.injectId(luaGenerator.STATEMENT_PREFIX, block);
  }
  if (luaGenerator.STATEMENT_SUFFIX) {
    xfix1 += luaGenerator.injectId(luaGenerator.STATEMENT_SUFFIX, block);
  }
  if (xfix1) {
    xfix1 = luaGenerator.prefixLines(xfix1, luaGenerator.INDENT);
  }
  let loopTrap = '';
  if (luaGenerator.INFINITE_LOOP_TRAP) {
    loopTrap = luaGenerator.prefixLines(
        luaGenerator.injectId(
          luaGenerator.INFINITE_LOOP_TRAP, block), luaGenerator.INDENT);
  }
  let branch = luaGenerator.statementToCode(block, 'STACK');
  let returnValue = luaGenerator.valueToCode(block, 'RETURN', Order.NONE) || '';
  let xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = luaGenerator.INDENT + 'return ' + returnValue + '\n';
  } else if (!branch) {
    branch = '';
  }
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] = luaGenerator.nameDB_.getName(variables[i], NameType.VARIABLE);
  }
  let code = 'function ' + funcName + '(' + args.join(', ') + ')\n' + xfix1 +
      loopTrap + branch + xfix2 + returnValue + 'end\n';
  code = luaGenerator.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  luaGenerator.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
luaGenerator.forBlock['procedures_defnoreturn'] =
    luaGenerator.forBlock['procedures_defreturn'];

luaGenerator.forBlock['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  const funcName =
      luaGenerator.nameDB_.getName(
        block.getFieldValue('NAME'), NameType.PROCEDURE);
  const args = [];
  const variables = block.getVars();
  for (let i = 0; i < variables.length; i++) {
    args[i] = luaGenerator.valueToCode(block, 'ARG' + i, Order.NONE) || 'nil';
  }
  const code = funcName + '(' + args.join(', ') + ')';
  return [code, Order.HIGH];
};

luaGenerator.forBlock['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  // Generated code is for a function call as a statement is the same as a
  // function call as a value, with the addition of line ending.
  const tuple = luaGenerator.forBlock['procedures_callreturn'](block);
  return tuple[0] + '\n';
};

luaGenerator.forBlock['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  const condition =
      luaGenerator.valueToCode(block, 'CONDITION', Order.NONE) || 'false';
  let code = 'if ' + condition + ' then\n';
  if (luaGenerator.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the return is triggered.
    code +=
        luaGenerator.prefixLines(
          luaGenerator.injectId(luaGenerator.STATEMENT_SUFFIX, block),
          luaGenerator.INDENT);
  }
  if (block.hasReturnValue_) {
    const value = luaGenerator.valueToCode(block, 'VALUE', Order.NONE) || 'nil';
    code += luaGenerator.INDENT + 'return ' + value + '\n';
  } else {
    code += luaGenerator.INDENT + 'return\n';
  }
  code += 'end\n';
  return code;
};
