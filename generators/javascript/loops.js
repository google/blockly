/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating JavaScript for loop blocks.
 */
'use strict';

goog.module('Blockly.JavaScript.loops');

const stringUtils = goog.require('Blockly.utils.string');
const JavaScript = goog.require('Blockly.JavaScript');
const {NameType} = goog.require('Blockly.Names');


JavaScript['controls_repeat_ext'] = function(block) {
  // Repeat n times.
  let repeats;
  if (block.getField('TIMES')) {
    // Internal number.
    repeats = String(Number(block.getFieldValue('TIMES')));
  } else {
    // External number.
    repeats =
        JavaScript.valueToCode(block, 'TIMES', JavaScript.ORDER_ASSIGNMENT) ||
        '0';
  }
  let branch = JavaScript.statementToCode(block, 'DO');
  branch = JavaScript.addLoopTrap(branch, block);
  let code = '';
  const loopVar =
      JavaScript.nameDB_.getDistinctName('count', NameType.VARIABLE);
  let endVar = repeats;
  if (!repeats.match(/^\w+$/) && !stringUtils.isNumber(repeats)) {
    endVar =
        JavaScript.nameDB_.getDistinctName('repeat_end', NameType.VARIABLE);
    code += 'var ' + endVar + ' = ' + repeats + ';\n';
  }
  code += 'for (var ' + loopVar + ' = 0; ' + loopVar + ' < ' + endVar + '; ' +
      loopVar + '++) {\n' + branch + '}\n';
  return code;
};

JavaScript['controls_repeat'] = JavaScript['controls_repeat_ext'];

JavaScript['controls_whileUntil'] = function(block) {
  // Do while/until loop.
  const until = block.getFieldValue('MODE') === 'UNTIL';
  let argument0 =
      JavaScript.valueToCode(
          block, 'BOOL',
          until ? JavaScript.ORDER_LOGICAL_NOT : JavaScript.ORDER_NONE) ||
      'false';
  let branch = JavaScript.statementToCode(block, 'DO');
  branch = JavaScript.addLoopTrap(branch, block);
  if (until) {
    argument0 = '!' + argument0;
  }
  return 'while (' + argument0 + ') {\n' + branch + '}\n';
};

JavaScript['controls_for'] = function(block) {
  // For loop.
  const variable0 =
      JavaScript.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  const argument0 =
      JavaScript.valueToCode(block, 'FROM', JavaScript.ORDER_ASSIGNMENT) || '0';
  const argument1 =
      JavaScript.valueToCode(block, 'TO', JavaScript.ORDER_ASSIGNMENT) || '0';
  const increment =
      JavaScript.valueToCode(block, 'BY', JavaScript.ORDER_ASSIGNMENT) || '1';
  let branch = JavaScript.statementToCode(block, 'DO');
  branch = JavaScript.addLoopTrap(branch, block);
  let code;
  if (stringUtils.isNumber(argument0) && stringUtils.isNumber(argument1) &&
      stringUtils.isNumber(increment)) {
    // All arguments are simple numbers.
    const up = Number(argument0) <= Number(argument1);
    code = 'for (' + variable0 + ' = ' + argument0 + '; ' + variable0 +
        (up ? ' <= ' : ' >= ') + argument1 + '; ' + variable0;
    const step = Math.abs(Number(increment));
    if (step === 1) {
      code += up ? '++' : '--';
    } else {
      code += (up ? ' += ' : ' -= ') + step;
    }
    code += ') {\n' + branch + '}\n';
  } else {
    code = '';
    // Cache non-trivial values to variables to prevent repeated look-ups.
    let startVar = argument0;
    if (!argument0.match(/^\w+$/) && !stringUtils.isNumber(argument0)) {
      startVar = JavaScript.nameDB_.getDistinctName(
          variable0 + '_start', NameType.VARIABLE);
      code += 'var ' + startVar + ' = ' + argument0 + ';\n';
    }
    let endVar = argument1;
    if (!argument1.match(/^\w+$/) && !stringUtils.isNumber(argument1)) {
      endVar = JavaScript.nameDB_.getDistinctName(
          variable0 + '_end', NameType.VARIABLE);
      code += 'var ' + endVar + ' = ' + argument1 + ';\n';
    }
    // Determine loop direction at start, in case one of the bounds
    // changes during loop execution.
    const incVar = JavaScript.nameDB_.getDistinctName(
        variable0 + '_inc', NameType.VARIABLE);
    code += 'var ' + incVar + ' = ';
    if (stringUtils.isNumber(increment)) {
      code += Math.abs(increment) + ';\n';
    } else {
      code += 'Math.abs(' + increment + ');\n';
    }
    code += 'if (' + startVar + ' > ' + endVar + ') {\n';
    code += JavaScript.INDENT + incVar + ' = -' + incVar + ';\n';
    code += '}\n';
    code += 'for (' + variable0 + ' = ' + startVar + '; ' + incVar +
        ' >= 0 ? ' + variable0 + ' <= ' + endVar + ' : ' + variable0 +
        ' >= ' + endVar + '; ' + variable0 + ' += ' + incVar + ') {\n' +
        branch + '}\n';
  }
  return code;
};

JavaScript['controls_forEach'] = function(block) {
  // For each loop.
  const variable0 =
      JavaScript.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  const argument0 =
      JavaScript.valueToCode(block, 'LIST', JavaScript.ORDER_ASSIGNMENT) ||
      '[]';
  let branch = JavaScript.statementToCode(block, 'DO');
  branch = JavaScript.addLoopTrap(branch, block);
  let code = '';
  // Cache non-trivial values to variables to prevent repeated look-ups.
  let listVar = argument0;
  if (!argument0.match(/^\w+$/)) {
    listVar = JavaScript.nameDB_.getDistinctName(
        variable0 + '_list', NameType.VARIABLE);
    code += 'var ' + listVar + ' = ' + argument0 + ';\n';
  }
  const indexVar = JavaScript.nameDB_.getDistinctName(
      variable0 + '_index', NameType.VARIABLE);
  branch = JavaScript.INDENT + variable0 + ' = ' + listVar + '[' + indexVar +
      '];\n' + branch;
  code += 'for (var ' + indexVar + ' in ' + listVar + ') {\n' + branch + '}\n';
  return code;
};

JavaScript['controls_flow_statements'] = function(block) {
  // Flow statements: continue, break.
  let xfix = '';
  if (JavaScript.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    xfix += JavaScript.injectId(JavaScript.STATEMENT_PREFIX, block);
  }
  if (JavaScript.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the break/continue is triggered.
    xfix += JavaScript.injectId(JavaScript.STATEMENT_SUFFIX, block);
  }
  if (JavaScript.STATEMENT_PREFIX) {
    const loop = block.getSurroundLoop();
    if (loop && !loop.suppressPrefixSuffix) {
      // Inject loop's statement prefix here since the regular one at the end
      // of the loop will not get executed if 'continue' is triggered.
      // In the case of 'break', a prefix is needed due to the loop's suffix.
      xfix += JavaScript.injectId(JavaScript.STATEMENT_PREFIX, loop);
    }
  }
  switch (block.getFieldValue('FLOW')) {
    case 'BREAK':
      return xfix + 'break;\n';
    case 'CONTINUE':
      return xfix + 'continue;\n';
  }
  throw Error('Unknown flow statement.');
};
