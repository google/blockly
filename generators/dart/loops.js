/**
 * @license
 * Copyright 2014 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Dart for loop blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Dart.loops');

import {dartGenerator, Order} from '../dart.js';
import * as stringUtils from '../../core/utils/string.js';
import {NameType} from '../../core/names.js';


dartGenerator.forBlock['controls_repeat_ext'] = function(block, generator) {
  let repeats;
  // Repeat n times.
  if (block.getField('TIMES')) {
    // Internal number.
    repeats = String(Number(block.getFieldValue('TIMES')));
  } else {
    // External number.
    repeats =
        dartGenerator.valueToCode(block, 'TIMES', Order.ASSIGNMENT) || '0';
  }
  let branch = dartGenerator.statementToCode(block, 'DO');
  branch = dartGenerator.addLoopTrap(branch, block);
  let code = '';
  const loopVar =
      dartGenerator.nameDB_.getDistinctName('count', NameType.VARIABLE);
  let endVar = repeats;
  if (!repeats.match(/^\w+$/) && !stringUtils.isNumber(repeats)) {
    endVar =
        dartGenerator.nameDB_.getDistinctName('repeat_end', NameType.VARIABLE);
    code += 'var ' + endVar + ' = ' + repeats + ';\n';
  }
  code += 'for (int ' + loopVar + ' = 0; ' + loopVar + ' < ' + endVar + '; ' +
      loopVar + '++) {\n' + branch + '}\n';
  return code;
};

dartGenerator.forBlock['controls_repeat'] =
    dartGenerator.forBlock['controls_repeat_ext'];

dartGenerator.forBlock['controls_whileUntil'] = function(block, generator) {
  // Do while/until loop.
  const until = block.getFieldValue('MODE') === 'UNTIL';
  let argument0 =
      dartGenerator.valueToCode(
          block, 'BOOL', until ? Order.UNARY_PREFIX : Order.NONE) ||
      'false';
  let branch = dartGenerator.statementToCode(block, 'DO');
  branch = dartGenerator.addLoopTrap(branch, block);
  if (until) {
    argument0 = '!' + argument0;
  }
  return 'while (' + argument0 + ') {\n' + branch + '}\n';
};

dartGenerator.forBlock['controls_for'] = function(block, generator) {
  // For loop.
  const variable0 =
        dartGenerator.nameDB_.getName(
          block.getFieldValue('VAR'), NameType.VARIABLE);
  const argument0 =
      dartGenerator.valueToCode(block, 'FROM', Order.ASSIGNMENT) || '0';
  const argument1 =
        dartGenerator.valueToCode(block, 'TO', Order.ASSIGNMENT) || '0';
  const increment =
        dartGenerator.valueToCode(block, 'BY', Order.ASSIGNMENT) || '1';
  let branch = dartGenerator.statementToCode(block, 'DO');
  branch = dartGenerator.addLoopTrap(branch, block);
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
          dartGenerator.nameDB_.getDistinctName(
            variable0 + '_start', NameType.VARIABLE);
      code += 'var ' + startVar + ' = ' + argument0 + ';\n';
    }
    let endVar = argument1;
    if (!argument1.match(/^\w+$/) && !stringUtils.isNumber(argument1)) {
      endVar =
          dartGenerator.nameDB_.getDistinctName(
            variable0 + '_end', NameType.VARIABLE);
      code += 'var ' + endVar + ' = ' + argument1 + ';\n';
    }
    // Determine loop direction at start, in case one of the bounds
    // changes during loop execution.
    const incVar =
        dartGenerator.nameDB_.getDistinctName(
          variable0 + '_inc', NameType.VARIABLE);
    code += 'num ' + incVar + ' = ';
    if (stringUtils.isNumber(increment)) {
      code += Math.abs(increment) + ';\n';
    } else {
      code += '(' + increment + ').abs();\n';
    }
    code += 'if (' + startVar + ' > ' + endVar + ') {\n';
    code += dartGenerator.INDENT + incVar + ' = -' + incVar + ';\n';
    code += '}\n';
    code += 'for (' + variable0 + ' = ' + startVar + '; ' + incVar +
        ' >= 0 ? ' + variable0 + ' <= ' + endVar + ' : ' + variable0 +
        ' >= ' + endVar + '; ' + variable0 + ' += ' + incVar + ') {\n' +
        branch + '}\n';
  }
  return code;
};

dartGenerator.forBlock['controls_forEach'] = function(block, generator) {
  // For each loop.
  const variable0 =
      dartGenerator.nameDB_.getName(
        block.getFieldValue('VAR'), NameType.VARIABLE);
  const argument0 =
      dartGenerator.valueToCode(block, 'LIST', Order.ASSIGNMENT) || '[]';
  let branch = dartGenerator.statementToCode(block, 'DO');
  branch = dartGenerator.addLoopTrap(branch, block);
  const code =
      'for (var ' + variable0 + ' in ' + argument0 + ') {\n' + branch + '}\n';
  return code;
};

dartGenerator.forBlock['controls_flow_statements'] = function(block, generator) {
  // Flow statements: continue, break.
  let xfix = '';
  if (dartGenerator.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    xfix += dartGenerator.injectId(dartGenerator.STATEMENT_PREFIX, block);
  }
  if (dartGenerator.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the break/continue is triggered.
    xfix += dartGenerator.injectId(dartGenerator.STATEMENT_SUFFIX, block);
  }
  if (dartGenerator.STATEMENT_PREFIX) {
    const loop = block.getSurroundLoop();
    if (loop && !loop.suppressPrefixSuffix) {
      // Inject loop's statement prefix here since the regular one at the end
      // of the loop will not get executed if 'continue' is triggered.
      // In the case of 'break', a prefix is needed due to the loop's suffix.
      xfix += dartGenerator.injectId(dartGenerator.STATEMENT_PREFIX, loop);
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
