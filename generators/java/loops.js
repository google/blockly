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

Blockly.Java['controls_repeat_ext'] = function(block) {
  // Repeat n times.
  if (block.getField('TIMES')) {
    // Internal number.
    var repeats = String(Number(block.getFieldValue('TIMES')));
  } else {
    // External number.
    var repeats = Blockly.Java.valueToCode(block, 'TIMES',
        Blockly.Java.ORDER_ASSIGNMENT) || '0';
  }
  var branch = Blockly.Java.statementToCode(block, 'DO');
  branch = Blockly.Java.addLoopTrap(branch, block.id);
  var code = '';
  var loopVar = Blockly.Java.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  var endVar = repeats;
  if (!repeats.match(/^\w+$/) && !Blockly.isNumber(repeats)) {
    var endVar = Blockly.Java.variableDB_.getDistinctName(
        'repeat_end', Blockly.Variables.NAME_TYPE);
    code += 'int ' + endVar + ' = int(' + repeats + ');\n';
  }
  code += 'for (int ' + loopVar + ' = 0; '+
                        loopVar +' < ' + repeats + ';'+
                        loopVar + '++) {\n' +
          Blockly.Java.INDENT + branch +
          '} // end for\n';
  return code;
};

Blockly.Java['controls_repeat'] =
    Blockly.Java['controls_repeat_ext'];

Blockly.Java['controls_whileUntil'] = function(block) {
  // Do while/until loop.
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Blockly.Java.valueToCode(block, 'BOOL',
      until ? Blockly.Java.ORDER_LOGICAL_NOT :
      Blockly.Java.ORDER_NONE) || 'false';
  var branch = Blockly.Java.statementToCode(block, 'DO');
  branch = Blockly.Java.addLoopTrap(branch, block.id) ||
      Blockly.Java.PASS;

  if ((until && (argument0 === 'true')) || (!until && (argument0 === 'false'))){
    var argvar = Blockly.Java.variableDB_.getDistinctName(
      argument0, Blockly.Variables.NAME_TYPE);
    Blockly.Java.stashStatement('boolean ' + argvar + ' = ' + argument0 + ';\n');
    argument0 = argvar;
  }
      
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

  var variable0Type = Blockly.Java.GetVariableType(block.getFieldValue('VAR'));

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
    if (variable0Type === 'Var') {
      code = 'for (' + variable0 + '.setObject(' + argument0 + '); ' +
                       variable0 + '.getObjectAsDouble() ' +
                                               direction + argument1 + '; ' +
                       variable0 + '.incrementObject(' + increment + ')) ';
    } else {
      if (increment < 0) {
        doincrement = ' -= ' + Math.abs(increment);
      } else if (increment != 1) {
        doincrement = ' += ' + increment;
      }
      code += 'for (' + variable0 + ' = ' + argument0 + '; ' +
                        variable0 + direction + argument1 + '; ' +
                        variable0 + doincrement + ')';
    }
  } else {
    // Cache non-trivial values to variables to prevent repeated look-ups.
    var startVar = argument0;
    if (!argument0.match(/^\w+$/) && !Blockly.isNumber(argument0)) {
      startVar = Blockly.Java.variableDB_.getDistinctName(
          variable0 + '_start', Blockly.Variables.NAME_TYPE);
      code += 'double ' + startVar + ' = ' + argument0 + ';\n';
    }
    var endVar = argument1;
    if (!argument1.match(/^\w+$/) && !Blockly.isNumber(argument1)) {
      var endVar = Blockly.Java.variableDB_.getDistinctName(
          variable0 + '_end', Blockly.Variables.NAME_TYPE);
      code += 'double ' + endVar + ' = ' + argument1 + ';\n';
    }
    // Determine loop direction at start, in case one of the bounds
    // changes during loop execution.
    var incVar = Blockly.Java.variableDB_.getDistinctName(
        variable0 + '_inc', Blockly.Variables.NAME_TYPE);
    code += 'double ' + incVar + ' = ';
    if (Blockly.isNumber(increment)) {
      code += Math.abs(increment) + ';\n';
    } else {
      code += 'Math.abs(' + increment + ');\n';
    }
    code += 'if (' + startVar + ' > ' + endVar + ') {\n';
    code += Blockly.Java.INDENT + incVar + ' = -' + incVar + ';\n';
    code += '}\n';
    if (variable0Type === 'Var') {
      code += 'for (' + variable0 + '.setObject(' + startVar + ');\n' +
          Blockly.Java.INDENT + incVar + ' >= 0 ? ' +
          variable0 + '.getObjectAsDouble() <= ' + endVar + ' : ' +
          variable0 + '.getObjectAsDouble()  >= ' + endVar + ';\n' +
                        variable0 + '.incrementObject(' + incVar + ')) ';
    } else {
      code += 'for (' + variable0 + ' = ' + startVar + ';\n' +
          Blockly.Java.INDENT + incVar + ' >= 0 ? ' +
          variable0 + ' <= ' + endVar + ' : ' +
          variable0 + ' >= ' + endVar + ';\n' +
          Blockly.Java.INDENT + variable0 + ' += ' + incVar + ')';
    }
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
  var setvar0;
  branch = Blockly.Java.addLoopTrap(branch, block.id) ||
      Blockly.Java.PASS;
  var code = '';

  if (vartype0 === 'Var') {
    var loopVar = Blockly.Java.variableDB_.getDistinctName(
      'it', Blockly.Variables.NAME_TYPE);
    setvar0 = variable0 + '.setObject(' + loopVar + '.next())';

    Blockly.Java.addImport('java.util.Iterator');
    code = 'for (Iterator ' + loopVar + ' = ' +
                  argument0 + '.iterator(); ' + loopVar + '.hasNext();) {\n'+
             Blockly.Java.INDENT + setvar0 + ';\n';
  } else {
    code = 'for (' +vartype0 + ' ' + variable0 + ' :' + argument0 + ') {\n'
  }
  code += branch + '} // end for\n';

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
