/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Dart for loop blocks.
 */
'use strict';

goog.module('Blockly.Dart.loops');

const Dart = goog.require('Blockly.Dart');
const stringUtils = goog.require('Blockly.utils.string');
const {NameType} = goog.require('Blockly.Names');


Dart['controls_repeat_ext'] = function(block) {
  let repeats;
  // Repeat n times.
  if (block.getField('TIMES')) {
    // Internal number.
    repeats = String(Number(block.getFieldValue('TIMES')));
  } else {
    // External number.
    repeats = Dart.valueToCode(block, 'TIMES', Dart.ORDER_ASSIGNMENT) || '0';
  }
  let branch = Dart.statementToCode(block, 'DO');
  branch = Dart.addLoopTrap(branch, block);
  let code = '';
  const loopVar = Dart.nameDB_.getDistinctName('count', NameType.VARIABLE);
  let endVar = repeats;
  if (!repeats.match(/^\w+$/) && !stringUtils.isNumber(repeats)) {
    endVar = Dart.nameDB_.getDistinctName('repeat_end', NameType.VARIABLE);
    code += 'var ' + endVar + ' = ' + repeats + ';\n';
  }
  code += 'for (int ' + loopVar + ' = 0; ' + loopVar + ' < ' + endVar + '; ' +
      loopVar + '++) {\n' + branch + '}\n';
  return code;
};

Dart['controls_repeat'] = Dart['controls_repeat_ext'];

Dart['controls_whileUntil'] = function(block) {
  // Do while/until loop.
  const until = block.getFieldValue('MODE') === 'UNTIL';
  let argument0 =
      Dart.valueToCode(
          block, 'BOOL', until ? Dart.ORDER_UNARY_PREFIX : Dart.ORDER_NONE) ||
      'false';
  let branch = Dart.statementToCode(block, 'DO');
  branch = Dart.addLoopTrap(branch, block);
  if (until) {
    argument0 = '!' + argument0;
  }
  return 'while (' + argument0 + ') {\n' + branch + '}\n';
};

Dart['controls_for'] = function(block) {
  // For loop.
  const variable0 =
      Dart.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  const argument0 =
      Dart.valueToCode(block, 'FROM', Dart.ORDER_ASSIGNMENT) || '0';
  const argument1 = Dart.valueToCode(block, 'TO', Dart.ORDER_ASSIGNMENT) || '0';
  const increment = Dart.valueToCode(block, 'BY', Dart.ORDER_ASSIGNMENT) || '1';
  let branch = Dart.statementToCode(block, 'DO');
  branch = Dart.addLoopTrap(branch, block);
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
      startVar =
          Dart.nameDB_.getDistinctName(variable0 + '_start', NameType.VARIABLE);
      code += 'var ' + startVar + ' = ' + argument0 + ';\n';
    }
    let endVar = argument1;
    if (!argument1.match(/^\w+$/) && !stringUtils.isNumber(argument1)) {
      endVar =
          Dart.nameDB_.getDistinctName(variable0 + '_end', NameType.VARIABLE);
      code += 'var ' + endVar + ' = ' + argument1 + ';\n';
    }
    // Determine loop direction at start, in case one of the bounds
    // changes during loop execution.
    const incVar =
        Dart.nameDB_.getDistinctName(variable0 + '_inc', NameType.VARIABLE);
    code += 'num ' + incVar + ' = ';
    if (stringUtils.isNumber(increment)) {
      code += Math.abs(increment) + ';\n';
    } else {
      code += '(' + increment + ').abs();\n';
    }
    code += 'if (' + startVar + ' > ' + endVar + ') {\n';
    code += Dart.INDENT + incVar + ' = -' + incVar + ';\n';
    code += '}\n';
    code += 'for (' + variable0 + ' = ' + startVar + '; ' + incVar +
        ' >= 0 ? ' + variable0 + ' <= ' + endVar + ' : ' + variable0 +
        ' >= ' + endVar + '; ' + variable0 + ' += ' + incVar + ') {\n' +
        branch + '}\n';
  }
  return code;
};

Dart['controls_forEach'] = function(block) {
  // For each loop.
  const variable0 =
      Dart.nameDB_.getName(block.getFieldValue('VAR'), NameType.VARIABLE);
  const argument0 =
      Dart.valueToCode(block, 'LIST', Dart.ORDER_ASSIGNMENT) || '[]';
  let branch = Dart.statementToCode(block, 'DO');
  branch = Dart.addLoopTrap(branch, block);
  const code =
      'for (var ' + variable0 + ' in ' + argument0 + ') {\n' + branch + '}\n';
  return code;
};

Dart['controls_flow_statements'] = function(block) {
  // Flow statements: continue, break.
  let xfix = '';
  if (Dart.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    xfix += Dart.injectId(Dart.STATEMENT_PREFIX, block);
  }
  if (Dart.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the break/continue is triggered.
    xfix += Dart.injectId(Dart.STATEMENT_SUFFIX, block);
  }
  if (Dart.STATEMENT_PREFIX) {
    const loop = block.getSurroundLoop();
    if (loop && !loop.suppressPrefixSuffix) {
      // Inject loop's statement prefix here since the regular one at the end
      // of the loop will not get executed if 'continue' is triggered.
      // In the case of 'break', a prefix is needed due to the loop's suffix.
      xfix += Dart.injectId(Dart.STATEMENT_PREFIX, loop);
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
