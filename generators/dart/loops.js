/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Dart for loop blocks.
 */
'use strict';

goog.provide('Blockly.Dart.loops');

goog.require('Blockly.Dart');


Blockly.Dart['controls_repeat_ext'] = function(block) {
  let repeats;
  // Repeat n times.
  if (block.getField('TIMES')) {
    // Internal number.
    repeats = String(Number(block.getFieldValue('TIMES')));
  } else {
    // External number.
    repeats = Blockly.Dart.valueToCode(block, 'TIMES',
        Blockly.Dart.ORDER_ASSIGNMENT) || '0';
  }
  let branch = Blockly.Dart.statementToCode(block, 'DO');
  branch = Blockly.Dart.addLoopTrap(branch, block);
  let code = '';
  const loopVar = Blockly.Dart.nameDB_.getDistinctName(
      'count', Blockly.VARIABLE_CATEGORY_NAME);
  let endVar = repeats;
  if (!repeats.match(/^\w+$/) && !Blockly.isNumber(repeats)) {
    endVar = Blockly.Dart.nameDB_.getDistinctName(
        'repeat_end', Blockly.VARIABLE_CATEGORY_NAME);
    code += 'var ' + endVar + ' = ' + repeats + ';\n';
  }
  code += 'for (int ' + loopVar + ' = 0; ' +
      loopVar + ' < ' + endVar + '; ' +
      loopVar + '++) {\n' +
      branch + '}\n';
  return code;
};

Blockly.Dart['controls_repeat'] = Blockly.Dart['controls_repeat_ext'];

Blockly.Dart['controls_whileUntil'] = function(block) {
  // Do while/until loop.
  const until = block.getFieldValue('MODE') === 'UNTIL';
  let argument0 = Blockly.Dart.valueToCode(block, 'BOOL',
      until ? Blockly.Dart.ORDER_UNARY_PREFIX :
      Blockly.Dart.ORDER_NONE) || 'false';
  let branch = Blockly.Dart.statementToCode(block, 'DO');
  branch = Blockly.Dart.addLoopTrap(branch, block);
  if (until) {
    argument0 = '!' + argument0;
  }
  return 'while (' + argument0 + ') {\n' + branch + '}\n';
};

Blockly.Dart['controls_for'] = function(block) {
  // For loop.
  const variable0 = Blockly.Dart.nameDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  const argument0 = Blockly.Dart.valueToCode(block, 'FROM',
      Blockly.Dart.ORDER_ASSIGNMENT) || '0';
  const argument1 = Blockly.Dart.valueToCode(block, 'TO',
      Blockly.Dart.ORDER_ASSIGNMENT) || '0';
  const increment = Blockly.Dart.valueToCode(block, 'BY',
      Blockly.Dart.ORDER_ASSIGNMENT) || '1';
  let branch = Blockly.Dart.statementToCode(block, 'DO');
  branch = Blockly.Dart.addLoopTrap(branch, block);
  let code;
  if (Blockly.isNumber(argument0) && Blockly.isNumber(argument1) &&
      Blockly.isNumber(increment)) {
    // All arguments are simple numbers.
    const up = Number(argument0) <= Number(argument1);
    code = 'for (' + variable0 + ' = ' + argument0 + '; ' +
        variable0 + (up ? ' <= ' : ' >= ') + argument1 + '; ' +
        variable0;
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
    if (!argument0.match(/^\w+$/) && !Blockly.isNumber(argument0)) {
      startVar = Blockly.Dart.nameDB_.getDistinctName(
          variable0 + '_start', Blockly.VARIABLE_CATEGORY_NAME);
      code += 'var ' + startVar + ' = ' + argument0 + ';\n';
    }
    let endVar = argument1;
    if (!argument1.match(/^\w+$/) && !Blockly.isNumber(argument1)) {
      endVar = Blockly.Dart.nameDB_.getDistinctName(
          variable0 + '_end', Blockly.VARIABLE_CATEGORY_NAME);
      code += 'var ' + endVar + ' = ' + argument1 + ';\n';
    }
    // Determine loop direction at start, in case one of the bounds
    // changes during loop execution.
    const incVar = Blockly.Dart.nameDB_.getDistinctName(
        variable0 + '_inc', Blockly.VARIABLE_CATEGORY_NAME);
    code += 'num ' + incVar + ' = ';
    if (Blockly.isNumber(increment)) {
      code += Math.abs(increment) + ';\n';
    } else {
      code += '(' + increment + ').abs();\n';
    }
    code += 'if (' + startVar + ' > ' + endVar + ') {\n';
    code += Blockly.Dart.INDENT + incVar + ' = -' + incVar + ';\n';
    code += '}\n';
    code += 'for (' + variable0 + ' = ' + startVar + '; ' +
        incVar + ' >= 0 ? ' +
        variable0 + ' <= ' + endVar + ' : ' +
        variable0 + ' >= ' + endVar + '; ' +
        variable0 + ' += ' + incVar + ') {\n' +
        branch + '}\n';
  }
  return code;
};

Blockly.Dart['controls_forEach'] = function(block) {
  // For each loop.
  const variable0 = Blockly.Dart.nameDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  const argument0 = Blockly.Dart.valueToCode(block, 'LIST',
      Blockly.Dart.ORDER_ASSIGNMENT) || '[]';
  let branch = Blockly.Dart.statementToCode(block, 'DO');
  branch = Blockly.Dart.addLoopTrap(branch, block);
  const code = 'for (var ' + variable0 + ' in ' + argument0 + ') {\n' +
      branch + '}\n';
  return code;
};

Blockly.Dart['controls_flow_statements'] = function(block) {
  // Flow statements: continue, break.
  let xfix = '';
  if (Blockly.Dart.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    xfix += Blockly.Dart.injectId(Blockly.Dart.STATEMENT_PREFIX, block);
  }
  if (Blockly.Dart.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the break/continue is triggered.
    xfix += Blockly.Dart.injectId(Blockly.Dart.STATEMENT_SUFFIX, block);
  }
  if (Blockly.Dart.STATEMENT_PREFIX) {
    const loop = Blockly.Constants.Loops
        .CONTROL_FLOW_IN_LOOP_CHECK_MIXIN.getSurroundLoop(block);
    if (loop && !loop.suppressPrefixSuffix) {
      // Inject loop's statement prefix here since the regular one at the end
      // of the loop will not get executed if 'continue' is triggered.
      // In the case of 'break', a prefix is needed due to the loop's suffix.
      xfix += Blockly.Dart.injectId(Blockly.Dart.STATEMENT_PREFIX, loop);
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
