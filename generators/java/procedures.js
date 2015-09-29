/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Generating Java for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Java.procedures');

goog.require('Blockly.Java');


Blockly.Java['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  var funcPrefix = block.getFieldValue('NAME');
  var funcName = Blockly.Java.variableDB_.getName(funcPrefix,
      Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.Java.statementToCode(block, 'STACK');
  if (Blockly.Java.STATEMENT_PREFIX) {
    branch = Blockly.Java.prefixLines(
        Blockly.Java.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + block.id + '\''), Blockly.Java.INDENT) + branch;
  }
  if (Blockly.Java.INFINITE_LOOP_TRAP) {
    branch = Blockly.Java.INFINITE_LOOP_TRAP.replace(/%1/g,
        '"' + block.id + '"') + branch;
  }
  var retType = 'void';
  if (this.hasReturnValue_) {
    retType = Blockly.Java.GetVariableType(funcPrefix + '.');
  }

  var returnValue = Blockly.Java.valueToCode(block, 'RETURN',
      Blockly.Java.ORDER_NONE) || '';
  if (returnValue) {
    if (retType === 'Var') {
      returnValue = '  return Var.valueOf(' + returnValue + ');\n';
    } else {
      returnValue = '  return ' + returnValue + ';\n';
    }
  } else if (!branch) {
    branch = Blockly.Java.PASS;
  }
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    var type = Blockly.Java.GetVariableType(funcPrefix + '.' +
                                            block.arguments_[x]['name']);
    args[x] = type + ' ' +
              Blockly.Java.variableDB_.getName(block.arguments_[x]['name'],
                                               Blockly.Variables.NAME_TYPE);
  }

  var code = 'public ' + retType + ' ' +
              funcName + '(' + args.join(', ') + '){\n' +
             branch + returnValue + "}";
  code = Blockly.Java.scrub_(block, code);
  Blockly.Java.definitions_[funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.Java['procedures_defnoreturn'] =
    Blockly.Java['procedures_defreturn'];

Blockly.Java['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.Java.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.Java.valueToCode(block, 'ARG' + x,
        Blockly.Java.ORDER_NONE) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.Java.ORDER_FUNCTION_CALL];
};

Blockly.Java['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = Blockly.Java.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var x = 0; x < block.arguments_.length; x++) {
    args[x] = Blockly.Java.valueToCode(block, 'ARG' + x,
        Blockly.Java.ORDER_NONE) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ');\n';
  return code;
};

Blockly.Java['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.Java.valueToCode(block, 'CONDITION',
      Blockly.Java.ORDER_NONE) || 'False';
  var code = 'if (' + condition + '){\n';
  if (block.hasReturnValue_) {
    var value = Blockly.Java.valueToCode(block, 'VALUE',
        Blockly.Java.ORDER_NONE) || 'None';
    code += '  return ' + value + ';\n}';
  } else {
    code += '  return;\n}';
  }
  return code;
};
