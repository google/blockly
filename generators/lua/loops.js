/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Lua for loop blocks.
 */

import * as goog from '../../closure/goog/goog.js';
goog.declareModuleId('Blockly.Lua.loops');

import * as stringUtils from '../../core/utils/string.js';
import {NameType} from '../../core/names.js';
import {luaGenerator, Order} from '../lua.js';


/**
 * This is the text used to implement a <pre>continue</pre>.
 * It is also used to recognise <pre>continue</pre>s in generated code so that
 * the appropriate label can be put at the end of the loop body.
 * @const {string}
 */
const CONTINUE_STATEMENT = 'goto continue\n';

/**
 * If the loop body contains a "goto continue" statement, add a continue label
 * to the loop body. Slightly inefficient, as continue labels will be generated
 * in all outer loops, but this is safer than duplicating the logic of
 * blockToCode.
 *
 * @param {string} branch Generated code of the loop body
 * @return {string} Generated label or '' if unnecessary
 */
const addContinueLabel = function(branch) {
  if (branch.indexOf(CONTINUE_STATEMENT) !== -1) {
    // False positives are possible (e.g. a string literal), but are harmless.
    return branch + luaGenerator.INDENT + '::continue::\n';
  } else {
    return branch;
  }
};

luaGenerator.forBlock['controls_repeat_ext'] = function(block) {
  // Repeat n times.
  let repeats;
  if (block.getField('TIMES')) {
    // Internal number.
    repeats = String(Number(block.getFieldValue('TIMES')));
  } else {
    // External number.
    repeats = luaGenerator.valueToCode(block, 'TIMES', Order.NONE) || '0';
  }
  if (stringUtils.isNumber(repeats)) {
    repeats = parseInt(repeats, 10);
  } else {
    repeats = 'math.floor(' + repeats + ')';
  }
  let branch = luaGenerator.statementToCode(block, 'DO');
  branch = luaGenerator.addLoopTrap(branch, block);
  branch = addContinueLabel(branch);
  const loopVar = luaGenerator.nameDB_.getDistinctName('count', NameType.VARIABLE);
  const code =
      'for ' + loopVar + ' = 1, ' + repeats + ' do\n' + branch + 'end\n';
  return code;
};

luaGenerator.forBlock['controls_repeat'] =
    luaGenerator.forBlock['controls_repeat_ext'];

luaGenerator.forBlock['controls_whileUntil'] = function(block) {
  // Do while/until loop.
  const until = block.getFieldValue('MODE') === 'UNTIL';
  let argument0 =
      luaGenerator.valueToCode(
          block, 'BOOL', until ? Order.UNARY : Order.NONE) ||
      'false';
  let branch = luaGenerator.statementToCode(block, 'DO');
  branch = luaGenerator.addLoopTrap(branch, block);
  branch = addContinueLabel(branch);
  if (until) {
    argument0 = 'not ' + argument0;
  }
  return 'while ' + argument0 + ' do\n' + branch + 'end\n';
};

luaGenerator.forBlock['controls_for'] = function(block) {
  // For loop.
  const variable0 =
      luaGenerator.nameDB_.getName(
        block.getFieldValue('VAR'), NameType.VARIABLE);
  const startVar = luaGenerator.valueToCode(block, 'FROM', Order.NONE) || '0';
  const endVar = luaGenerator.valueToCode(block, 'TO', Order.NONE) || '0';
  const increment = luaGenerator.valueToCode(block, 'BY', Order.NONE) || '1';
  let branch = luaGenerator.statementToCode(block, 'DO');
  branch = luaGenerator.addLoopTrap(branch, block);
  branch = addContinueLabel(branch);
  let code = '';
  let incValue;
  if (stringUtils.isNumber(startVar) && stringUtils.isNumber(endVar) &&
      stringUtils.isNumber(increment)) {
    // All arguments are simple numbers.
    const up = Number(startVar) <= Number(endVar);
    const step = Math.abs(Number(increment));
    incValue = (up ? '' : '-') + step;
  } else {
    code = '';
    // Determine loop direction at start, in case one of the bounds
    // changes during loop execution.
    incValue =
        luaGenerator.nameDB_.getDistinctName(
          variable0 + '_inc', NameType.VARIABLE);
    code += incValue + ' = ';
    if (stringUtils.isNumber(increment)) {
      code += Math.abs(increment) + '\n';
    } else {
      code += 'math.abs(' + increment + ')\n';
    }
    code += 'if (' + startVar + ') > (' + endVar + ') then\n';
    code += luaGenerator.INDENT + incValue + ' = -' + incValue + '\n';
    code += 'end\n';
  }
  code +=
      'for ' + variable0 + ' = ' + startVar + ', ' + endVar + ', ' + incValue;
  code += ' do\n' + branch + 'end\n';
  return code;
};

luaGenerator.forBlock['controls_forEach'] = function(block) {
  // For each loop.
  const variable0 =
      luaGenerator.nameDB_.getName(
        block.getFieldValue('VAR'), NameType.VARIABLE);
  const argument0 = luaGenerator.valueToCode(block, 'LIST', Order.NONE) || '{}';
  let branch = luaGenerator.statementToCode(block, 'DO');
  branch = luaGenerator.addLoopTrap(branch, block);
  branch = addContinueLabel(branch);
  const code = 'for _, ' + variable0 + ' in ipairs(' + argument0 + ') do \n' +
      branch + 'end\n';
  return code;
};

luaGenerator.forBlock['controls_flow_statements'] = function(block) {
  // Flow statements: continue, break.
  let xfix = '';
  if (luaGenerator.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    xfix += luaGenerator.injectId(luaGenerator.STATEMENT_PREFIX, block);
  }
  if (luaGenerator.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the break/continue is triggered.
    xfix += luaGenerator.injectId(luaGenerator.STATEMENT_SUFFIX, block);
  }
  if (luaGenerator.STATEMENT_PREFIX) {
    const loop = block.getSurroundLoop();
    if (loop && !loop.suppressPrefixSuffix) {
      // Inject loop's statement prefix here since the regular one at the end
      // of the loop will not get executed if 'continue' is triggered.
      // In the case of 'break', a prefix is needed due to the loop's suffix.
      xfix += luaGenerator.injectId(luaGenerator.STATEMENT_PREFIX, loop);
    }
  }
  switch (block.getFieldValue('FLOW')) {
    case 'BREAK':
      return xfix + 'break\n';
    case 'CONTINUE':
      return xfix + CONTINUE_STATEMENT;
  }
  throw Error('Unknown flow statement.');
};
