/**
 * @license
 * Copyright 2014 Google LLC
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
 * @fileoverview Generating Dart for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Dart.procedures');

goog.require('Blockly.Dart');


Blockly.Dart['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  var funcName = Blockly.Dart.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.PROCEDURE_CATEGORY_NAME);
  var xfix1 = '';
  if (Blockly.Dart.STATEMENT_PREFIX) {
    xfix1 += Blockly.Dart.injectId(Blockly.Dart.STATEMENT_PREFIX, block);
  }
  if (Blockly.Dart.STATEMENT_SUFFIX) {
    xfix1 += Blockly.Dart.injectId(Blockly.Dart.STATEMENT_SUFFIX, block);
  }
  if (xfix1) {
    xfix1 = Blockly.Dart.prefixLines(xfix1, Blockly.Dart.INDENT);
  }
  var loopTrap = '';
  if (Blockly.Dart.INFINITE_LOOP_TRAP) {
    loopTrap = Blockly.Dart.prefixLines(
        Blockly.Dart.injectId(Blockly.Dart.INFINITE_LOOP_TRAP, block),
        Blockly.Dart.INDENT);
  }
  var branch = Blockly.Dart.statementToCode(block, 'STACK');
  var returnValue = Blockly.Dart.valueToCode(block, 'RETURN',
      Blockly.Dart.ORDER_NONE) || '';
  var xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = Blockly.Dart.INDENT + 'return ' + returnValue + ';\n';
  }
  var returnType = returnValue ? 'dynamic' : 'void';
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Dart.variableDB_.getName(block.arguments_[i],
        Blockly.VARIABLE_CATEGORY_NAME);
  }
  var code = returnType + ' ' + funcName + '(' + args.join(', ') + ') {\n' +
      xfix1 + loopTrap + branch + xfix2 + returnValue + '}';
  code = Blockly.Dart.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.Dart.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.Dart['procedures_defnoreturn'] = Blockly.Dart['procedures_defreturn'];

Blockly.Dart['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.Dart.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.PROCEDURE_CATEGORY_NAME);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Dart.valueToCode(block, 'ARG' + i,
        Blockly.Dart.ORDER_NONE) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.Dart.ORDER_UNARY_POSTFIX];
};

Blockly.Dart['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  // Generated code is for a function call as a statement is the same as a
  // function call as a value, with the addition of line ending.
  var tuple = Blockly.Dart['procedures_callreturn'](block);
  return tuple[0] + ';\n';
};

Blockly.Dart['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.Dart.valueToCode(block, 'CONDITION',
      Blockly.Dart.ORDER_NONE) || 'false';
  var code = 'if (' + condition + ') {\n';
  if (Blockly.Dart.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the return is triggered.
    code += Blockly.Dart.prefixLines(
        Blockly.Dart.injectId(Blockly.Dart.STATEMENT_SUFFIX, block),
        Blockly.Dart.INDENT);
  }
  if (block.hasReturnValue_) {
    var value = Blockly.Dart.valueToCode(block, 'VALUE',
        Blockly.Dart.ORDER_NONE) || 'null';
    code += Blockly.Dart.INDENT + 'return ' + value + ';\n';
  } else {
    code += Blockly.Dart.INDENT + 'return;\n';
  }
  code += '}\n';
  return code;
};
