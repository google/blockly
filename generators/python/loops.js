/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Python for loop blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Python.loops');

goog.require('Blockly.Python');


Blockly.Python['controls_repeat_ext'] = function(block) {
  // Repeat n times.
  if (block.getField('TIMES')) {
    // Internal number.
    var repeats = String(parseInt(block.getFieldValue('TIMES'), 10));
  } else {
    // External number.
    var repeats = Blockly.Python.valueToCode(block, 'TIMES',
        Blockly.Python.ORDER_NONE) || '0';
  }
  if (Blockly.isNumber(repeats)) {
    repeats = parseInt(repeats, 10);
  } else {
    repeats = 'int(' + repeats + ')';
  }
  var branch = Blockly.Python.statementToCode(block, 'DO');
  branch = Blockly.Python.addLoopTrap(branch, block) || Blockly.Python.PASS;
  var loopVar = Blockly.Python.variableDB_.getDistinctName(
      'count', Blockly.VARIABLE_CATEGORY_NAME);
  var code = 'for ' + loopVar + ' in range(' + repeats + '):\n' + branch;
  return code;
};

Blockly.Python['controls_repeat'] = Blockly.Python['controls_repeat_ext'];

Blockly.Python['controls_whileUntil'] = function(block) {
  // Do while/until loop.
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Blockly.Python.valueToCode(block, 'BOOL',
      until ? Blockly.Python.ORDER_LOGICAL_NOT :
      Blockly.Python.ORDER_NONE) || 'False';
  var branch = Blockly.Python.statementToCode(block, 'DO');
  branch = Blockly.Python.addLoopTrap(branch, block) || Blockly.Python.PASS;
  if (until) {
    argument0 = 'not ' + argument0;
  }
  return 'while ' + argument0 + ':\n' + branch;
};

Blockly.Python['controls_for'] = function(block) {
  // For loop.
  var variable0 = Blockly.Python.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  var argument0 = Blockly.Python.valueToCode(block, 'FROM',
      Blockly.Python.ORDER_NONE) || '0';
  var argument1 = Blockly.Python.valueToCode(block, 'TO',
      Blockly.Python.ORDER_NONE) || '0';
  var increment = Blockly.Python.valueToCode(block, 'BY',
      Blockly.Python.ORDER_NONE) || '1';
  var branch = Blockly.Python.statementToCode(block, 'DO');
  branch = Blockly.Python.addLoopTrap(branch, block) || Blockly.Python.PASS;

  var code = '';
  var range;

  // Helper functions.
  var defineUpRange = function() {
    return Blockly.Python.provideFunction_(
        'upRange',
        ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ +
            '(start, stop, step):',
         '  while start <= stop:',
         '    yield start',
         '    start += abs(step)']);
  };
  var defineDownRange = function() {
    return Blockly.Python.provideFunction_(
        'downRange',
        ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ +
            '(start, stop, step):',
         '  while start >= stop:',
         '    yield start',
         '    start -= abs(step)']);
  };
  // Arguments are legal Python code (numbers or strings returned by scrub()).
  var generateUpDownRange = function(start, end, inc) {
    return '(' + start + ' <= ' + end + ') and ' +
        defineUpRange() + '(' + start + ', ' + end + ', ' + inc + ') or ' +
        defineDownRange() + '(' + start + ', ' + end + ', ' + inc + ')';
  };

  if (Blockly.isNumber(argument0) && Blockly.isNumber(argument1) &&
      Blockly.isNumber(increment)) {
    // All parameters are simple numbers.
    argument0 = Number(argument0);
    argument1 = Number(argument1);
    increment = Math.abs(Number(increment));
    if (argument0 % 1 === 0 && argument1 % 1 === 0 && increment % 1 === 0) {
      // All parameters are integers.
      if (argument0 <= argument1) {
        // Count up.
        argument1++;
        if (argument0 == 0 && increment == 1) {
          // If starting index is 0, omit it.
          range = argument1;
        } else {
          range = argument0 + ', ' + argument1;
        }
        // If increment isn't 1, it must be explicit.
        if (increment != 1) {
          range += ', ' + increment;
        }
      } else {
        // Count down.
        argument1--;
        range = argument0 + ', ' + argument1 + ', -' + increment;
      }
      range = 'range(' + range + ')';
    } else {
      // At least one of the parameters is not an integer.
      if (argument0 < argument1) {
        range = defineUpRange();
      } else {
        range = defineDownRange();
      }
      range += '(' + argument0 + ', ' + argument1 + ', ' + increment + ')';
    }
  } else {
    // Cache non-trivial values to variables to prevent repeated look-ups.
    var scrub = function(arg, suffix) {
      if (Blockly.isNumber(arg)) {
        // Simple number.
        arg = Number(arg);
      } else if (arg.match(/^\w+$/)) {
        // Variable.
        arg = 'float(' + arg + ')';
      } else {
        // It's complicated.
        var varName = Blockly.Python.variableDB_.getDistinctName(
            variable0 + suffix, Blockly.VARIABLE_CATEGORY_NAME);
        code += varName + ' = float(' + arg + ')\n';
        arg = varName;
      }
      return arg;
    };
    var startVar = scrub(argument0, '_start');
    var endVar = scrub(argument1, '_end');
    var incVar = scrub(increment, '_inc');

    if (typeof startVar == 'number' && typeof endVar == 'number') {
      if (startVar < endVar) {
        range = defineUpRange();
      } else {
        range = defineDownRange();
      }
      range += '(' + startVar + ', ' + endVar + ', ' + incVar + ')';
    } else {
      // We cannot determine direction statically.
      range = generateUpDownRange(startVar, endVar, incVar);
    }
  }
  code += 'for ' + variable0 + ' in ' + range + ':\n' + branch;
  return code;
};

Blockly.Python['controls_forEach'] = function(block) {
  // For each loop.
  var variable0 = Blockly.Python.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.VARIABLE_CATEGORY_NAME);
  var argument0 = Blockly.Python.valueToCode(block, 'LIST',
      Blockly.Python.ORDER_RELATIONAL) || '[]';
  var branch = Blockly.Python.statementToCode(block, 'DO');
  branch = Blockly.Python.addLoopTrap(branch, block) || Blockly.Python.PASS;
  var code = 'for ' + variable0 + ' in ' + argument0 + ':\n' + branch;
  return code;
};

Blockly.Python['controls_flow_statements'] = function(block) {
  // Flow statements: continue, break.
  var xfix = '';
  if (Blockly.Python.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    xfix += Blockly.Python.injectId(Blockly.Python.STATEMENT_PREFIX, block);
  }
  if (Blockly.Python.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the break/continue is triggered.
    xfix += Blockly.Python.injectId(Blockly.Python.STATEMENT_SUFFIX, block);
  }
  if (Blockly.Python.STATEMENT_PREFIX) {
    var loop = Blockly.Constants.Loops
        .CONTROL_FLOW_IN_LOOP_CHECK_MIXIN.getSurroundLoop(block);
    if (loop && !loop.suppressPrefixSuffix) {
      // Inject loop's statement prefix here since the regular one at the end
      // of the loop will not get executed if 'continue' is triggered.
      // In the case of 'break', a prefix is needed due to the loop's suffix.
      xfix += Blockly.Python.injectId(Blockly.Python.STATEMENT_PREFIX, loop);
    }
  }
  switch (block.getFieldValue('FLOW')) {
    case 'BREAK':
      return xfix + 'break\n';
    case 'CONTINUE':
      return xfix + 'continue\n';
  }
  throw Error('Unknown flow statement.');
};
