/**
 * @license
 * Copyright 2016 Google LLC
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
 * @fileoverview Generating Lua for loop blocks.
 * @author rodrigoq@google.com (Rodrigo Queiro)
 */
'use strict';

goog.provide('Blockly.Lua.loops');

goog.require('Blockly.Lua');


/**
 * This is the text used to implement a <pre>continue</pre>.
 * It is also used to recognise <pre>continue</pre>s in generated code so that
 * the appropriate label can be put at the end of the loop body.
 * @const {string}
 */
Blockly.Lua.CONTINUE_STATEMENT = 'goto continue\n';

/**
 * If the loop body contains a "goto continue" statement, add a continue label
 * to the loop body. Slightly inefficient, as continue labels will be generated
 * in all outer loops, but this is safer than duplicating the logic of
 * blockToCode.
 *
 * @param {string} branch Generated code of the loop body
 * @return {string} Generated label or '' if unnecessary
 * @private
 */
Blockly.Lua.addContinueLabel_ = function(branch) {
  if (branch.indexOf(Blockly.Lua.CONTINUE_STATEMENT) != -1) {
    // False positives are possible (e.g. a string literal), but are harmless.
    return branch + Blockly.Lua.INDENT + '::continue::\n';
  } else {
    return branch;
  }
};

Blockly.Lua['controls_repeat_ext'] = function(block) {
  // Repeat n times.
  if (block.getField('TIMES')) {
    // Internal number.
    var repeats = String(Number(block.getFieldValue('TIMES')));
  } else {
    // External number.
    var repeats = Blockly.Lua.valueToCode(block, 'TIMES',
        Blockly.Lua.ORDER_NONE) || '0';
  }
  if (Blockly.isNumber(repeats)) {
    repeats = parseInt(repeats, 10);
  } else {
    repeats = 'math.floor(' + repeats + ')';
  }
  var branch = Blockly.Lua.statementToCode(block, 'DO');
  branch = Blockly.Lua.addLoopTrap(branch, block);
  branch = Blockly.Lua.addContinueLabel_(branch);
  var loopVar = Blockly.Lua.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  var code = 'for ' + loopVar + ' = 1, ' + repeats + ' do\n' +
      branch + 'end\n';
  return code;
};

Blockly.Lua['controls_repeat'] = Blockly.Lua['controls_repeat_ext'];

Blockly.Lua['controls_whileUntil'] = function(block) {
  // Do while/until loop.
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Blockly.Lua.valueToCode(block, 'BOOL',
      until ? Blockly.Lua.ORDER_UNARY :
      Blockly.Lua.ORDER_NONE) || 'false';
  var branch = Blockly.Lua.statementToCode(block, 'DO');
  branch = Blockly.Lua.addLoopTrap(branch, block);
  branch = Blockly.Lua.addContinueLabel_(branch);
  if (until) {
    argument0 = 'not ' + argument0;
  }
  return 'while ' + argument0 + ' do\n' + branch + 'end\n';
};

Blockly.Lua['controls_for'] = function(block) {
  // For loop.
  var variable0 = Blockly.Lua.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var startVar = Blockly.Lua.valueToCode(block, 'FROM',
      Blockly.Lua.ORDER_NONE) || '0';
  var endVar = Blockly.Lua.valueToCode(block, 'TO',
      Blockly.Lua.ORDER_NONE) || '0';
  var increment = Blockly.Lua.valueToCode(block, 'BY',
      Blockly.Lua.ORDER_NONE) || '1';
  var branch = Blockly.Lua.statementToCode(block, 'DO');
  branch = Blockly.Lua.addLoopTrap(branch, block);
  branch = Blockly.Lua.addContinueLabel_(branch);
  var code = '';
  var incValue;
  if (Blockly.isNumber(startVar) && Blockly.isNumber(endVar) &&
      Blockly.isNumber(increment)) {
    // All arguments are simple numbers.
    var up = Number(startVar) <= Number(endVar);
    var step = Math.abs(Number(increment));
    incValue = (up ? '' : '-') + step;
  } else {
    code = '';
    // Determine loop direction at start, in case one of the bounds
    // changes during loop execution.
    incValue = Blockly.Lua.variableDB_.getDistinctName(
        variable0 + '_inc', Blockly.Variables.NAME_TYPE);
    code += incValue + ' = ';
    if (Blockly.isNumber(increment)) {
      code += Math.abs(increment) + '\n';
    } else {
      code += 'math.abs(' + increment + ')\n';
    }
    code += 'if (' + startVar + ') > (' + endVar + ') then\n';
    code += Blockly.Lua.INDENT + incValue + ' = -' + incValue + '\n';
    code += 'end\n';
  }
  code += 'for ' + variable0 + ' = ' + startVar + ', ' + endVar +
      ', ' + incValue;
  code += ' do\n' + branch + 'end\n';
  return code;
};

Blockly.Lua['controls_forEach'] = function(block) {
  // For each loop.
  var variable0 = Blockly.Lua.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Lua.valueToCode(block, 'LIST',
      Blockly.Lua.ORDER_NONE) || '{}';
  var branch = Blockly.Lua.statementToCode(block, 'DO');
  branch = Blockly.Lua.addLoopTrap(branch, block);
  branch = Blockly.Lua.addContinueLabel_(branch);
  var code = 'for _, ' + variable0 + ' in ipairs(' + argument0 + ') do \n' +
      branch + 'end\n';
  return code;
};

Blockly.Lua['controls_flow_statements'] = function(block) {
  // Flow statements: continue, break.
  var xfix = '';
  if (Blockly.Lua.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    xfix += Blockly.Lua.injectId(Blockly.Lua.STATEMENT_PREFIX, block);
  }
  if (Blockly.Lua.STATEMENT_SUFFIX) {
    // Inject any statement suffix here since the regular one at the end
    // will not get executed if the break/continue is triggered.
    xfix += Blockly.Lua.injectId(Blockly.Lua.STATEMENT_SUFFIX, block);
  }
  if (Blockly.Lua.STATEMENT_PREFIX) {
    var loop = Blockly.Constants.Loops
        .CONTROL_FLOW_IN_LOOP_CHECK_MIXIN.getSurroundLoop(block);
    if (loop && !loop.suppressPrefixSuffix) {
      // Inject loop's statement prefix here since the regular one at the end
      // of the loop will not get executed if 'continue' is triggered.
      // In the case of 'break', a prefix is needed due to the loop's suffix.
      xfix += Blockly.Lua.injectId(Blockly.Lua.STATEMENT_PREFIX, loop);
    }
  }
  switch (block.getFieldValue('FLOW')) {
    case 'BREAK':
      return xfix + 'break\n';
    case 'CONTINUE':
      return xfix + Blockly.Lua.CONTINUE_STATEMENT;
  }
  throw Error('Unknown flow statement.');
};
