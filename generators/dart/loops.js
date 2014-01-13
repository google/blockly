/**
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * http://blockly.googlecode.com/
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
 * @fileoverview Generating Dart for control blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Dart.control');

goog.require('Blockly.Dart');

Blockly.Dart.controls_if = function() {
  // If/elseif/else condition.
  var n = 0;
  var argument = Blockly.Dart.valueToCode(this, 'IF' + n,
      Blockly.Dart.ORDER_NONE) || 'false';
  var branch = Blockly.Dart.statementToCode(this, 'DO' + n);
  var code = 'if (' + argument + ') {\n' + branch + '}';
  for (n = 1; n <= this.elseifCount_; n++) {
    argument = Blockly.Dart.valueToCode(this, 'IF' + n,
      Blockly.Dart.ORDER_NONE) || 'false';
    branch = Blockly.Dart.statementToCode(this, 'DO' + n);
    code += ' else if (' + argument + ') {\n' + branch + '}';
  }
  if (this.elseCount_) {
    branch = Blockly.Dart.statementToCode(this, 'ELSE');
    code += ' else {\n' + branch + '}';
  }
  return code + '\n';
};

Blockly.Dart.controls_repeat = function() {
  // Repeat n times.
  var repeats = Number(this.getTitleValue('TIMES'));
  var branch = Blockly.Dart.statementToCode(this, 'DO');
  if (Blockly.Dart.INFINITE_LOOP_TRAP) {
    branch = Blockly.Dart.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + this.id + '\'') + branch;
  }
  var loopVar = Blockly.Dart.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  var code = 'for (int ' + loopVar + ' = 0; ' +
      loopVar + ' < ' + repeats + '; ' +
      loopVar + '++) {\n' +
      branch + '}\n';
  return code;
};

Blockly.Dart.controls_whileUntil = function() {
  // Do while/until loop.
  var argument0 = Blockly.Dart.valueToCode(this, 'BOOL',
      Blockly.Dart.ORDER_NONE) || 'false';
  var branch = Blockly.Dart.statementToCode(this, 'DO');
  if (Blockly.Dart.INFINITE_LOOP_TRAP) {
    branch = Blockly.Dart.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + this.id + '\'') + branch;
  }
  if (this.getTitleValue('MODE') == 'UNTIL') {
    if (!argument0.match(/^\w+$/)) {
      argument0 = '(' + argument0 + ')';
    }
    argument0 = '!' + argument0;
  }
  return 'while (' + argument0 + ') {\n' + branch + '}\n';
};

Blockly.Dart.controls_for = function() {
  // For loop.
  var variable0 = Blockly.Dart.variableDB_.getName(
      this.getTitleValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Dart.valueToCode(this, 'FROM',
      Blockly.Dart.ORDER_ASSIGNMENT) || '0';
  var argument1 = Blockly.Dart.valueToCode(this, 'TO',
      Blockly.Dart.ORDER_ASSIGNMENT) || '0';
  var branch = Blockly.Dart.statementToCode(this, 'DO');
  if (Blockly.Dart.INFINITE_LOOP_TRAP) {
    branch = Blockly.Dart.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + this.id + '\'') + branch;
  }
  var code;
  if (argument0.match(/^-?\d+(\.\d+)?$/) &&
      argument1.match(/^-?\d+(\.\d+)?$/)) {
    // Both arguments are simple numbers.
    var up = parseFloat(argument0) <= parseFloat(argument1);
    code = 'for (num ' + variable0 + ' = ' + argument0 + '; ' +
        variable0 + (up ? ' <= ' : ' >= ') + argument1 + '; ' +
        variable0 + (up ? '++' : '--') + ') {\n' +
        branch + '}\n';
  } else {
    code = '';
    // Cache non-trivial values to variables to prevent repeated look-ups.
    var startVar = argument0;
    if (!argument0.match(/^\w+$/) && !argument0.match(/^-?\d+(\.\d+)?$/)) {
      var startVar = Blockly.Dart.variableDB_.getDistinctName(
          variable0 + '_start', Blockly.Variables.NAME_TYPE);
      code += 'var ' + startVar + ' = ' + argument0 + ';\n';
    }
    var endVar = argument1;
    if (!argument1.match(/^\w+$/) && !argument1.match(/^-?\d+(\.\d+)?$/)) {
      var endVar = Blockly.Dart.variableDB_.getDistinctName(
          variable0 + '_end', Blockly.Variables.NAME_TYPE);
      code += 'var ' + endVar + ' = ' + argument1 + ';\n';
    }
    code += 'for (' + variable0 + ' = ' + startVar + ';\n' +
        '    (' + startVar + ' <= ' + endVar + ') ? ' +
        variable0 + ' <= ' + endVar + ' : ' +
        variable0 + ' >= ' + endVar + ';\n' +
        '    ' + variable0 + ' += (' + startVar + ' <= ' + endVar +
            ') ? 1 : -1) {\n' +
        branch + '}\n';
  }
  return code;
};

Blockly.Dart.controls_forEach = function() {
  // For each loop.
  var variable0 = Blockly.Dart.variableDB_.getName(
      this.getTitleValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Dart.valueToCode(this, 'LIST',
      Blockly.Dart.ORDER_ASSIGNMENT) || '[]';
  var branch = Blockly.Dart.statementToCode(this, 'DO');
  if (Blockly.Dart.INFINITE_LOOP_TRAP) {
    branch = Blockly.Dart.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + this.id + '\'') + branch;
  }
  var code = 'for (var ' + variable0 + ' in  ' + argument0 + ') {\n' +
      branch + '}\n';
  return code;
};

Blockly.Dart.controls_flow_statements = function() {
  // Flow statements: continue, break.
  switch (this.getTitleValue('FLOW')) {
    case 'BREAK':
      return 'break;\n';
    case 'CONTINUE':
      return 'continue;\n';
  }
  throw 'Unknown flow statement.';
};
