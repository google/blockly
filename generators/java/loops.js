/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
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
 * @fileoverview Generating Java for loop blocks.
 * @author toebes@extremenetworks.com (John Toebes)
 * Based on Python version by q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Java.loops');

goog.require('Blockly.Java');

Blockly.Java['controls_repeat'] = function(block) {
  // Repeat n times (internal number).
  var repeats = parseInt(block.getFieldValue('TIMES'), 10);
  var branch = Blockly.Java.statementToCode(block, 'DO');
  branch = Blockly.Java.addLoopTrap(branch, block.id) ||
      Blockly.Java.PASS;
  var loopVar = Blockly.Java.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  var code = 'for (int ' + loopVar + '=0; '+
                  loopVar+' < ' + repeats + ';'+
                  loopVar+'++) {\n' +
               branch +
             '} // end for\n';
  return code;
};

Blockly.Java['controls_repeat_ext'] = function(block) {
  // Repeat n times (external number).
  var repeats = Blockly.Java.valueToCode(block, 'TIMES',
      Blockly.Java.ORDER_NONE) || '0';
  if (Blockly.isNumber(repeats)) {
    repeats = parseInt(repeats, 10);
  } else {
    repeats = 'int(' + repeats + ')';
  }
  var branch = Blockly.Java.statementToCode(block, 'DO');
  branch = Blockly.Java.addLoopTrap(branch, block.id) ||
      Blockly.Java.PASS;
  var loopVar = Blockly.Java.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  var code = 'for (int ' + loopVar + '=0; '+
                           loopVar +' < ' + repeats + ';'+
                           loopVar + '++) {\n' +
                branch +
             '} // end for\n';
  return code;
};

Blockly.Java['controls_whileUntil'] = function(block) {
  // Do while/until loop.
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Blockly.Java.valueToCode(block, 'BOOL',
      until ? Blockly.Java.ORDER_LOGICAL_NOT :
      Blockly.Java.ORDER_NONE) || 'false';
  var branch = Blockly.Java.statementToCode(block, 'DO');
  branch = Blockly.Java.addLoopTrap(branch, block.id) ||
      Blockly.Java.PASS;
  if (until) {
    argument0 = '!' + argument0;
  }
  return 'while (' + argument0 + ') {\n' +
           branch +
         '} // end while\n';
};

Blockly.Java['controls_for'] = function(block) {
  // For loop.
  var variable0 = Blockly.Java.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var vartype0 = Blockly.Java.GetVariableType(block.getFieldValue('VAR'));
  var argument0 = Blockly.Java.valueToCode(block, 'FROM',
      Blockly.Java.ORDER_NONE) || '0';
  var argument1 = Blockly.Java.valueToCode(block, 'TO',
      Blockly.Java.ORDER_NONE) || '0';
  var increment = Blockly.Java.valueToCode(block, 'BY',
      Blockly.Java.ORDER_NONE) || '1';
  var branch = Blockly.Java.statementToCode(block, 'DO');
  branch = Blockly.Java.addLoopTrap(branch, block.id) ||
      Blockly.Java.PASS;

  var code = '';
  var range;

  if (Blockly.isNumber(argument0) &&
      Blockly.isNumber(argument1) &&
      Blockly.isNumber(increment)) {
    // All parameters are simple numbers.
    argument0 = parseFloat(argument0);
    argument1 = parseFloat(argument1);
    increment = Math.abs(parseFloat(increment));
    var direction = '<=';
    var doincrement = '++';
    // All parameters are integers.
    if (argument0 > argument1) {
      // Count down.
      direction = '>=';
      increment = -increment;
    }
    if (increment < 0) {
      doincrement = ' -= ' + Math.abs(increment);
    } else if (increment != 1) {
      doincrement = ' += ' + increment;
    }
    code += 'for (' + variable0 + ' = ' + argument0 + '; ' +
                      variable0 + direction + argument1 + '; ' +
                      variable0 + doincrement + ')';
  } else {
    code += 'for (' + variable0 + ' = ' + argument0 + '; ' +
                      variable0 + '<=' + argument1 + '; ' +
                      variable0 + ' += ' + increment + ')';

  }
  code += ' {\n' +
              branch +
           '} // end for\n';
  return code;
};

Blockly.Java['controls_forEach'] = function(block) {
  // For each loop.
  var variable0 = Blockly.Java.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var vartype0 = Blockly.Java.GetVariableType(block.getFieldValue('VAR'));
  var argument0 = Blockly.Java.valueToCode(block, 'LIST',
      Blockly.Java.ORDER_RELATIONAL) || '[]';
  var branch = Blockly.Java.statementToCode(block, 'DO');
  branch = Blockly.Java.addLoopTrap(branch, block.id) ||
      Blockly.Java.PASS;
  var code = 'for (' +vartype0 + ' ' + variable0 + ' :' + argument0 + ') {\n'
              + branch + '} // end for\n';
  return code;
};


Blockly.Java['controls_flow_statements'] = function(block) {
  // Flow statements: continue, break.
  switch (block.getFieldValue('FLOW')) {
    case 'BREAK':
      return 'break;\n';
    case 'CONTINUE':
      return 'continue;\n';
  }
  throw 'Unknown flow statement.';
};
