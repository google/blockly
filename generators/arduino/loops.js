/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Arduino for loops blocks.
 */
 'use strict';


goog.module('Blockly.Arduino.loops');

const Arduino = goog.require('Blockly.Arduino');
const {NameType} = goog.require('Blockly.Names');

/**
 * Generator for the repeat block (number in a drop down) using a For loop
 * statement.
 * Arduino code: loop { for (int count = 0; count < X; count++) { Y } }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
Arduino['controls_repeat'] = function(block) {
  var repeats = Number(block.getFieldValue('TIMES'));
  var branch = Arduino.statementToCode(block, 'DO');
  branch = Arduino.addLoopTrap(branch, block.id);
  var loopVar = Arduino.nameDB_.getDistinctName('count', NameType.VARIABLE);
  var code = 'for (int ' + loopVar + ' = 0; ' +
      loopVar + ' < ' + repeats + '; ' +
      loopVar + '++) {\n' +
      branch + '}\n';
  return code;
};

/**
 * Generator for the repeat block (using external number block) using a
 * For loop statement.
 * Arduino code: loop { for (int count = 0; count < X; count++) { Y } }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
Arduino['controls_repeat_ext'] = function(block) {
  var repeats = Arduino.valueToCode(block, 'TIMES',
      Arduino.ORDER_ADDITIVE) || '0';
  var branch = Arduino.statementToCode(block, 'DO');
  branch = Arduino.addLoopTrap(branch, block.id);
  var code = '';
  var loopVar = Arduino.nameDB_.getDistinctName(
      'count', NameType.VARIABLE);
  var endVar = repeats;
  if (!repeats.match(/^\w+$/) && !Blockly.isNumber(repeats)) {
    var endVar = Arduino.nameDB_.getDistinctName(
        'repeat_end', NameType.VARIABLE);
    code += 'int ' + endVar + ' = ' + repeats + ';\n';
  }
  code += 'for (int ' + loopVar + ' = 0; ' +
      loopVar + ' < ' + endVar + '; ' +
      loopVar + '++) {\n' +
      branch + '}\n';
  return code;
};

Arduino['controls_repeat_forever'] = function(block) {
  var branch = Arduino.statementToCode(block, 'DO');
  branch = Arduino.addLoopTrap(branch, block.id);
  return 'while (true) {\n' + branch + '}\n';
};

/**
 * Generator for the repeat while block using a While statement.
 * Arduino code: loop { while (X) { Y } }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
Arduino['controls_whileUntil'] = function(block) {
  // Do while/until loop.
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Arduino.valueToCode(block, 'BOOL',
      until ? Arduino.ORDER_LOGICAL_OR :
      Arduino.ORDER_NONE) || 'false';
  var branch = Arduino.statementToCode(block, 'DO');
  branch = Arduino.addLoopTrap(branch, block.id);
  if (until) {
    if (!argument0.match(/^\w+$/)) {
      argument0 = '(' + argument0 + ')';
    }
    argument0 = '!' + argument0;
  }
  return 'while (' + argument0 + ') {\n' + branch + '}\n';
};

/**
 * Generator for the For loop statements.
 * Arduino code: loop { for (i = X; i <= Y; i+=Z) { } }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
Arduino['controls_for'] = function(block) {
  var variable0 = Arduino.nameDB_.getName(
      block.getFieldValue('VAR'), NameType.VARIABLE);
  var argument0 = Arduino.valueToCode(block, 'FROM',
      Arduino.ORDER_ASSIGNMENT) || '0';
  var argument1 = Arduino.valueToCode(block, 'TO',
      Arduino.ORDER_ASSIGNMENT) || '0';
  var increment = Arduino.valueToCode(block, 'BY',
      Arduino.ORDER_ASSIGNMENT) || '1';
  var branch = Arduino.statementToCode(block, 'DO');
  branch = Arduino.addLoopTrap(branch, block.id);
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
      var startVar = Arduino.nameDB_.getDistinctName(
          variable0 + '_start', NameType.VARIABLE);
      code += 'int ' + startVar + ' = ' + argument0 + ';\n';
    }
    var endVar = argument1;
    if (!argument1.match(/^\w+$/) && !Blockly.isNumber(argument1)) {
      var endVar = Arduino.nameDB_.getDistinctName(
          variable0 + '_end', NameType.VARIABLE);
      code += 'int ' + endVar + ' = ' + argument1 + ';\n';
    }
    // Determine loop direction at start, in case one of the bounds
    // changes during loop execution.
    var incVar = Arduino.nameDB_.getDistinctName(
        variable0 + '_inc', NameType.VARIABLE);
    code += 'int ' + incVar + ' = ';
    if (Blockly.isNumber(increment)) {
      code += Math.abs(increment) + ';\n';
    } else {
      code += 'abs(' + increment + ');\n';
    }
    code += 'if (' + startVar + ' > ' + endVar + ') {\n';
    code += Arduino.INDENT + incVar + ' = -' + incVar + ';\n';
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

/**
 * A "for each" block.
 * TODO: Removed for now from toolbox as lists are not yet implemented.
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
Arduino['controls_forEach'] = Arduino.noGeneratorCodeLine;

/**
 * Generator for the loop flow control statements.
 * Arduino code: loop { break;/continue; }
 * @param {!Blockly.Block} block Block to generate the code from.
 * @return {string} Completed code.
 */
Arduino['controls_flow_statements'] = function(block) {
  switch (block.getFieldValue('FLOW')) {
    case 'BREAK':
      return 'break;\n';
    case 'CONTINUE':
      return 'continue;\n';
  }
  throw 'Unknown flow statement.';
};
