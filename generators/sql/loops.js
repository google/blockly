/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2015 Google Inc.
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
 * @fileoverview Generating PHP for loop blocks.
 * @author daarond@gmail.com (Daaron Dwyer)
 */
'use strict';

goog.provide('Blockly.SQL.loops');

goog.require('Blockly.SQL');


Blockly.SQL['controls_repeat_ext'] = function(block) {
  // Repeat n times.
  if (block.getField('TIMES')) {
    // Internal number.
    var repeats = String(Number(block.getFieldValue('TIMES')));
  } else {
    // External number.
    var repeats = Blockly.SQL.valueToCode(block, 'TIMES',
        Blockly.SQL.ORDER_ASSIGNMENT) || '0';
  }
  var branch = Blockly.SQL.statementToCode(block, 'DO');
  branch = Blockly.SQL.addLoopTrap(branch, block.id);
  var code = '';
  var loopVar = Blockly.SQL.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  var endVar = repeats;
  if (!repeats.match(/^\w+$/) && !Blockly.isNumber(repeats)) {
    var endVar = Blockly.SQL.variableDB_.getDistinctName(
        'repeat_end', Blockly.Variables.NAME_TYPE);
    code += endVar + ' = ' + repeats + ';\n';
  }
  code += 'SET '+loopVar+'=0;\nREPEAT\n' +
      branch + '\nSET '+loopVar+'='+loopVar+'+1;\nUNTIL '+loopVar+'='+endVar+'\nEND REPEAT;\n';
  return code;
};

Blockly.SQL['controls_repeat'] = Blockly.SQL['controls_repeat_ext'];

Blockly.SQL['controls_whileUntil'] = function(block) {
  // Do while/until loop.
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Blockly.SQL.valueToCode(block, 'BOOL',
      until ? Blockly.SQL.ORDER_LOGICAL_NOT :
      Blockly.SQL.ORDER_NONE) || 'FALSE';
  var branch = Blockly.SQL.statementToCode(block, 'DO');
  branch = Blockly.SQL.addLoopTrap(branch, block.id);
  if (until) {
    argument0 = '!' + argument0;
  }
  return 'WHILE ' + argument0 + ' DO\n' + branch + '\nEND WHILE;\n';
};

Blockly.SQL['controls_for'] = function(block) {
  // For loop.
  var variable0 = Blockly.SQL.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.SQL.valueToCode(block, 'FROM',
      Blockly.SQL.ORDER_ASSIGNMENT) || '0';
  var argument1 = Blockly.SQL.valueToCode(block, 'TO',
      Blockly.SQL.ORDER_ASSIGNMENT) || '0';
  var increment = Blockly.SQL.valueToCode(block, 'BY',
      Blockly.SQL.ORDER_ASSIGNMENT) || '1';
  var branch = Blockly.SQL.statementToCode(block, 'DO');
  branch = Blockly.SQL.addLoopTrap(branch, block.id);
  var code;
  if (Blockly.isNumber(argument0) && Blockly.isNumber(argument1) &&
      Blockly.isNumber(increment)) {
    // All arguments are simple numbers.
    var up = parseFloat(argument0) <= parseFloat(argument1);
    code = 'SET ' + variable0+' = ' + argument0 + ';\n';
    code += 'WHILE (' + variable0 + (up ? ' <= ' : ' >= ') + argument1 + ') DO\n';
    code += branch;
    var step = Math.abs(parseFloat(increment));
    if (step == 1) {
      code += up ? ('SET ' + variable0 + ' = ' + variable0 + '+1;\n') : ('SET ' + variable0 + ' = ' + variable0 + '-1;\n');
    } else {
      code += ('SET ' + variable0 + ' = ' + variable0) + (up ? ' + ' : ' - ') + step + ';\n';
    }
    code += 'END WHILE;\n';
    
  } else {
    code = '';
    // Cache non-trivial values to variables to prevent repeated look-ups.
    var startVar = argument0;
    if (!argument0.match(/^\w+$/) && !Blockly.isNumber(argument0)) {
      startVar = Blockly.SQL.variableDB_.getDistinctName(
          variable0 + '_start', Blockly.Variables.NAME_TYPE);
      code += startVar + ' := ' + argument0 + ';\n';
    }
    var endVar = argument1;
    if (!argument1.match(/^\w+$/) && !Blockly.isNumber(argument1)) {
      var endVar = Blockly.SQL.variableDB_.getDistinctName(
          variable0 + '_end', Blockly.Variables.NAME_TYPE);
      code += endVar + ' := ' + argument1 + ';\n';
    }
    // Determine loop direction at start, in case one of the bounds
    // changes during loop execution.
    var incVar = Blockly.SQL.variableDB_.getDistinctName(
        variable0 + '_inc', Blockly.Variables.NAME_TYPE);
    code += incVar + ' := ';
    if (Blockly.isNumber(increment)) {
      code += Math.abs(increment) + ';\n';
    } else {
      code += 'ABS(' + increment + ');\n';
    }
    code += 'IF (' + startVar + ' > ' + endVar + ') THEN\n';
    code += Blockly.SQL.INDENT + incVar + ' = -' + incVar + ';\n';
    code += 'END IF\n';
    
    code += 'SET ' + variable0 + ' = ' + startVar + ';\n';
    code += 'IF ' + incVar + ' >= 0 THEN\n';
    code += 'WHILE ' + variable0 + ' <= ' + endVar + ' DO\n';
    code += branch;
    code += 'SET ' + variable0 + ' = ' + variable0 + ' + ' + incVar + ';\n';
    code += '\nEND WHILE;\nELSE\n';
    code += 'WHILE ' + variable0 + ' >= ' + endVar + ' DO\n';
    code += branch;
    code += 'SET ' + variable0 + ' = ' + variable0 + ' + ' + incVar + ';\n';
    code += '\nEND WHILE;\nEND IF\n';
  }
  return code;
};

Blockly.SQL['controls_forEach'] = function(block) {
  /*
  // For each loop.
  var variable0 = Blockly.SQL.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.SQL.valueToCode(block, 'LIST',
      Blockly.SQL.ORDER_ASSIGNMENT) || '[]';
  var branch = Blockly.SQL.statementToCode(block, 'DO');
  branch = Blockly.SQL.addLoopTrap(branch, block.id);
  var code = '';
  code += 'foreach (' + argument0 + ' as ' + variable0 +
      ') {\n' + branch + '}\n';
  return code;*/
    return '';
};

Blockly.SQL['controls_flow_statements'] = function(block) {
    /*
  // Flow statements: continue, break.
  switch (block.getFieldValue('FLOW')) {
    case 'BREAK':
      return 'break;\n';
    case 'CONTINUE':
      return 'continue;\n';
  }
  throw 'Unknown flow statement.';*/
    return '';
};
