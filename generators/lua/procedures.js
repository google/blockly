/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Generating Lua for procedure blocks.
 * @author rodrigoq@google.com (Rodrigo Queiro)
 */
'use strict';

goog.provide('Blockly.Lua.procedures');

goog.require('Blockly.Lua');


Blockly.Lua['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  var funcName = Blockly.Lua.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.Lua.statementToCode(block, 'STACK');
  if (Blockly.Lua.STATEMENT_PREFIX) {
    var id = block.id.replace(/\$/g, '$$$$');  // Issue 251.
    branch = Blockly.Lua.prefixLines(
        Blockly.Lua.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + id + '\''), Blockly.Lua.INDENT) + branch;
  }
  if (Blockly.Lua.INFINITE_LOOP_TRAP) {
    branch = Blockly.Lua.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var returnValue = Blockly.Lua.valueToCode(block, 'RETURN',
      Blockly.Lua.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = Blockly.Lua.INDENT + 'return ' + returnValue + '\n';
  } else if (!branch) {
    branch = '';
  }
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Lua.variableDB_.getName(block.arguments_[i],
        Blockly.Variables.NAME_TYPE);
  }
  var code = 'function ' + funcName + '(' + args.join(', ') + ')\n' +
      branch + returnValue + 'end\n';
  code = Blockly.Lua.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.Lua.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.Lua['procedures_defnoreturn'] =
    Blockly.Lua['procedures_defreturn'];

Blockly.Lua['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.Lua.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Lua.valueToCode(block, 'ARG' + i,
        Blockly.Lua.ORDER_NONE) || 'nil';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = Blockly.Lua.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Lua.valueToCode(block, 'ARG' + i,
        Blockly.Lua.ORDER_NONE) || 'nil';
  }
  var code = funcName + '(' + args.join(', ') + ')\n';
  return code;
};

Blockly.Lua['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.Lua.valueToCode(block, 'CONDITION',
      Blockly.Lua.ORDER_NONE) || 'false';
  var code = 'if ' + condition + ' then\n';
  if (block.hasReturnValue_) {
    var value = Blockly.Lua.valueToCode(block, 'VALUE',
        Blockly.Lua.ORDER_NONE) || 'nil';
    code += Blockly.Lua.INDENT + 'return ' + value + '\n';
  } else {
    code += Blockly.Lua.INDENT + 'return\n';
  }
  code += 'end\n';
  return code;
};
