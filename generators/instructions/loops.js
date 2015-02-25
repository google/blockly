/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2014 Google Inc.
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
 * @fileoverview Generating Instructions for loop blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Instructions.loops');

goog.require('Blockly.Instructions');


Blockly.Instructions['controls_repeat'] = function(block) {
  // // Repeat n times (internal number).
  // var repeats = Number(block.getFieldValue('TIMES'));

  // var branch = Blockly.Instructions.statementToCode(block, 'DO');
  // branch = Blockly.Instructions.addLoopTrap(branch, block.id);

  // var loopVar = Blockly.Instructions.variableDB_.getDistinctName(
  //     'count', Blockly.Variables.NAME_TYPE);
  // Blockly.Instructions.mapping_[loopVar] = 'r' + Blockly.Instructions.unusedRegister;
  // Blockly.Instructions.unusedRegister++;
  // var loopReg = Blockly.Instructions.mapping_[loopVar];

  // var lineBreaks;
  // for (int i = 0; i < branch.length; i++) {
  //   if (branch[i] == '\n') lineBreaks++;
  // }
  // var finishJump = lineBreaks + 3;
  // var conditionalJump = (-1 * lineBreaks) - 4;
  // // var code = 'for (int ' + loopVar + ' = 0; ' +
  // //     loopVar + ' < ' + repeats + '; ' +
  // //     loopVar + '++) {\n' +
  // //     branch + '}\n';

  // var code = 'beq ' + repeats + ' ' + loopReg + ' ' + finishJump + '\n' +
  //            branch + 'add ' + loopReg + ' ' + loopReg + ' 1\njump ' +
  //            conditionalJump + '\n';

  // return code;
  return " ";
};

Blockly.Instructions['controls_repeat_ext'] = function(block) {
  // // Repeat n times (external number).
  var repeats = Blockly.Instructions.valueToCode(block, 'TIMES',
      Blockly.Instructions.ORDER_ASSIGNMENT) || '0';

  var branch = Blockly.Instructions.statementToCode(block, 'DO');
  branch = Blockly.Instructions.addLoopTrap(branch, block.id);

  var loopVar = Blockly.Instructions.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  Blockly.Instructions.mapping_[loopVar] = 'r' + Blockly.Instructions.unusedRegister;
  Blockly.Instructions.unusedRegister++;
  var loopReg = Blockly.Instructions.mapping_[loopVar];

  var lineBreaks = 0;
  for (var i = 0; i < branch.length; i++) {
    if (branch[i] == '\n') lineBreaks++;
  }
  var finishJump = lineBreaks + 2;
  var conditionalJump = (-1 * lineBreaks) - 3;


  var code = 'beq ' + repeats + ' ' + loopReg + ' ' + finishJump + '\n' +
             branch + 'add ' + loopReg + ' ' + loopReg + ' 1\njump ' +
             conditionalJump + '\n';

  return code;
};

Blockly.Instructions['controls_whileUntil'] = function(block) {
  var until = block.getFieldValue('MODE') == 'UNTIL';

  var argument = '';
  var valueBlock = block.getInputTargetBlock('BOOL') || '0';
  var value = '';
  var operation = (until) ? 'bneq 0 ' : 'beq 0 ';

  if (valueBlock == '0') {
    value = '0';
  } else if (valueBlock.type == 'logic_boolean') {
    value = Blockly.Instructions.valueToCode(block, 'BOOL', 
      Blockly.Instructions.ORDER_NONE);
  } else if (valueBlock.type == 'variables_get') {
    var varName = Blockly.Instructions.variableDB_.getName(valueBlock.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
    value = Blockly.Instructions.mapping_[varName];
  } else if (valueBlock.type == 'logic_compare') {
    //Need to fix for until case
    operation = Blockly.Instructions.valueToCode(block, 'BOOL',
      Blockly.Instructions.ORDER_NONE);
  } else if (valueBlock.type == 'arduino_digital_read') {
    argument = Blockly.Instructions.valueToCode(block, 'BOOL',
      Blockly.Instructions.ORDER_NONE) + '\n';
    value = Blockly.Instructions.mapping_[valueBlock.id];
  }

  var branch = Blockly.Instructions.statementToCode(block, 'DO');
  var lineBreaks = 0;
  for (var i = 0; i < branch.length; i++) {
    if (branch[i] == '\n') lineBreaks++;
  }
  var finishJump = lineBreaks + 1;
  for (var i = 0; i < operation.length; i++) {
    if (operation[i] == '\n') lineBreaks++;
  }
  for (var i = 0; i < argument.length; i++) {
    if (argument[i] == '\n') lineBreaks++;
  }
  
  var jumpBack = (lineBreaks + 2);

  branch += 'jump -' + jumpBack + '\n';

  var code = argument + operation + value + ' ' + finishJump + '\n' + branch;
  return code;
};

Blockly.Instructions['controls_for'] = function(block) {
  // For loop.
  var variable0 = Blockly.Instructions.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Instructions.valueToCode(block, 'FROM',
      Blockly.Instructions.ORDER_ASSIGNMENT) || '0';
  var argument1 = Blockly.Instructions.valueToCode(block, 'TO',
      Blockly.Instructions.ORDER_ASSIGNMENT) || '0';
  var increment = Blockly.Instructions.valueToCode(block, 'BY',
      Blockly.Instructions.ORDER_ASSIGNMENT) || '1';
  var branch = Blockly.Instructions.statementToCode(block, 'DO');
  branch = Blockly.Instructions.addLoopTrap(branch, block.id);
  var code;
  if (Blockly.isNumber(argument0) && Blockly.isNumber(argument1) &&
      Blockly.isNumber(increment)) {
    // All arguments are simple numbers.
    var up = parseFloat(argument0) <= parseFloat(argument1);
    code = 'for (' + variable0 + ' = ' + argument0 + '; ' +
        variable0 + (up ? ' <= ' : ' >= ') + argument1 + '; ' +
        variable0;
    var step = Math.abs(parseFloat(increment));
    if (step == 1) {
      code += up ? '++' : '--';
    } else {
      code += (up ? ' += ' : ' -= ') + step;
    }
    code += ') {\n' + branch + '}\n';
  } else {
    code = '';
    // Cache non-trivial values to variables to prevent repeated look-ups.
    var startVar = argument0;
    if (!argument0.match(/^\w+$/) && !Blockly.isNumber(argument0)) {
      var startVar = Blockly.Instructions.variableDB_.getDistinctName(
          variable0 + '_start', Blockly.Variables.NAME_TYPE);
      code += 'var ' + startVar + ' = ' + argument0 + ';\n';
    }
    var endVar = argument1;
    if (!argument1.match(/^\w+$/) && !Blockly.isNumber(argument1)) {
      var endVar = Blockly.Instructions.variableDB_.getDistinctName(
          variable0 + '_end', Blockly.Variables.NAME_TYPE);
      code += 'var ' + endVar + ' = ' + argument1 + ';\n';
    }
    // Determine loop direction at start, in case one of the bounds
    // changes during loop execution.
    var incVar = Blockly.Instructions.variableDB_.getDistinctName(
        variable0 + '_inc', Blockly.Variables.NAME_TYPE);
    code += 'num ' + incVar + ' = ';
    if (Blockly.isNumber(increment)) {
      code += Math.abs(increment) + ';\n';
    } else {
      code += '(' + increment + ').abs();\n';
    }
    code += 'if (' + startVar + ' > ' + endVar + ') {\n';
    code += Blockly.Instructions.INDENT + incVar + ' = -' + incVar + ';\n';
    code += '}\n';
    code += 'for (' + variable0 + ' = ' + startVar + ';\n' +
        '     ' + incVar + ' >= 0 ? ' +
        variable0 + ' <= ' + endVar + ' : ' +
        variable0 + ' >= ' + endVar + ';\n' +
        '     ' + variable0 + ' += ' + incVar + ') {\n' +
        branch + '}\n';
  }
  return code;
};

Blockly.Instructions['controls_forEach'] = function(block) {
  // For each loop.
  var variable0 = Blockly.Instructions.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Instructions.valueToCode(block, 'LIST',
      Blockly.Instructions.ORDER_ASSIGNMENT) || '[]';
  var branch = Blockly.Instructions.statementToCode(block, 'DO');
  branch = Blockly.Instructions.addLoopTrap(branch, block.id);
  var code = 'for (var ' + variable0 + ' in  ' + argument0 + ') {\n' +
      branch + '}\n';
  return code;
};

Blockly.Instructions['controls_flow_statements'] = function(block) {
  // Flow statements: continue, break.
  switch (block.getFieldValue('FLOW')) {
    case 'BREAK':
      return 'break;\n';
    case 'CONTINUE':
      return 'continue;\n';
  }
  throw 'Unknown flow statement.';
};
