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
 * @fileoverview Generating JavaScript for unit test blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.JavaScript['unittest_main'] = function(block) {
  // Container for unit tests.
  var resultsVar = Blockly.JavaScript.variableDB_.getName('unittestResults',
      Blockly.Variables.NAME_TYPE);
  if (!Blockly.JavaScript.definitions_['unittest_report']) {
    var functionName = Blockly.JavaScript.variableDB_.getDistinctName(
        'testReport', Blockly.Generator.NAME_TYPE);
    Blockly.JavaScript['unittest_main'].report = functionName;
    var func = [];
    func.push('function ' + functionName + '() {');
    func.push('  // Create test report.');
    func.push('  var report = [];');
    func.push('  var summary = [];');
    func.push('  var fails = 0;');
    func.push('  for (var x = 0; x < ' + resultsVar + '.length; x++) {');
    func.push('    if (' + resultsVar + '[x][0]) {');
    func.push('      summary.push(".");');
    func.push('    } else {');
    func.push('      summary.push("F");');
    func.push('      fails++;');
    func.push('      report.push("");');
    func.push('      report.push("FAIL: " + ' + resultsVar + '[x][2]);');
    func.push('      report.push(' + resultsVar + '[x][1]);');
    func.push('    }');
    func.push('  }');
    func.push('  report.unshift(summary.join(""));');
    func.push('  report.push("");');
    func.push('  report.push("Number of tests run: " + ' + resultsVar +
              '.length);');
    func.push('  report.push("");');
    func.push('  if (fails) {');
    func.push('    report.push("FAILED (failures=" + fails + ")");');
    func.push('  } else {');
    func.push('    report.push("OK");');
    func.push('  }');
    func.push('  return report.join("\\n");');
    func.push('}');
    func.push('');
    Blockly.JavaScript.definitions_['unittest_report'] = func.join('\n');
  }
  // Setup global to hold test results.
  var code = resultsVar + ' = [];\n';
  // Run tests (unindented).
  code += Blockly.JavaScript.statementToCode(block, 'DO')
      .replace(/^  /, '').replace(/\n  /g, '\n');
  var reportVar = Blockly.JavaScript.variableDB_.getDistinctName(
      'report', Blockly.Variables.NAME_TYPE);
  code += 'var ' + reportVar + ' = ' +
      Blockly.JavaScript['unittest_main'].report + '();\n';
  // Destroy results.
  code += resultsVar + ' = null;\n';
  // Send the report to the console (that's where errors will go anyway).
  code += 'console.log(' + reportVar + ');\n';
  return code;
};

// Code by Tomáš Zato on Stack Overflow [overflow.com/questions/7837456]
// with minor changes for style.
Array.prototype.equals = function(array) {
  // Is it an array?
  if (!array || !(array instanceof Array)) {
    return false;
  }

  // Are they the same length?
  if (this.length != array.length) {
    return false;
  }

  for (var i = 0; i < this.length; i++) {
    // Check for nested arrays.
    if (this[i] instanceof Array && array[i] instanceof Array) {
      // Recurse into the nested arrays.
      if (!this[i].equals(array[i])) {
        return false;
      }
    }
    else if (this[i] !== array[i]) {
      return false;
    }
  }
  return true;
};

Blockly.JavaScript['unittest_main'].defineAssert_ = function(block) {
  if (!Blockly.JavaScript.definitions_['unittest_assertequals']) {
    var resultsVar = Blockly.JavaScript.variableDB_.getName('unittestResults',
        Blockly.Variables.NAME_TYPE);
    var functionName = Blockly.JavaScript.variableDB_.getDistinctName(
        'assertEquals', Blockly.Generator.NAME_TYPE);
    Blockly.JavaScript['unittest_main'].assert_ = functionName;
    var func = [];
    func.push('function ' + functionName + '(actual, expected, message) {');
    func.push('  // Asserts that a value equals another value.');
    func.push('  if (!' + resultsVar + ') {');
    func.push('    throw "Orphaned assert: " + message;');
    func.push('  }');
    func.push('  if ((expected instanceof Array &&');
    func.push('       expected.equals(actual)) ||');
    func.push('      actual === expected) {');
    func.push('    ' + resultsVar + '.push([true, "OK", message]);');
    func.push('  } else {');
    func.push('    ' + resultsVar + '.push([false, ' +
        '"Expected: " + expected + "\\nActual: " + actual, message]);');
    func.push('  }');
    func.push('}');
    func.push('');
    Blockly.JavaScript.definitions_['unittest_assertequals'] = func.join('\n');
  }
  return Blockly.JavaScript['unittest_main'].assert_;
};

Blockly.JavaScript['unittest_assertequals'] = function(block) {
  // Asserts that a value equals another value.
  var resultsVar = Blockly.JavaScript.variableDB_.getName('unittestResults',
      Blockly.Variables.NAME_TYPE);
  var message = Blockly.JavaScript.quote_(block.getFieldValue('MESSAGE'));
  var actual = Blockly.JavaScript.valueToCode(block, 'ACTUAL',
      Blockly.JavaScript.ORDER_COMMA) || 'null';
  var expected = Blockly.JavaScript.valueToCode(block, 'EXPECTED',
      Blockly.JavaScript.ORDER_COMMA) || 'null';
  return Blockly.JavaScript['unittest_main'].defineAssert_() +
      '(' + actual + ', ' + expected + ', ' + message + ');\n';
};

Blockly.JavaScript['unittest_assertvalue'] = function(block) {
  // Asserts that a value is true, false, or null.
  var resultsVar = Blockly.JavaScript.variableDB_.getName('unittestResults',
      Blockly.Variables.NAME_TYPE);
  var message = Blockly.JavaScript.quote_(block.getFieldValue('MESSAGE'));
  var actual = Blockly.JavaScript.valueToCode(block, 'ACTUAL',
      Blockly.JavaScript.ORDER_COMMA) || 'null';
  var expected = block.getFieldValue('EXPECTED');
  if (expected == 'TRUE') {
    expected = 'true';
  } else if (expected == 'FALSE') {
    expected = 'false';
  } else if (expected == 'NULL') {
    expected = 'null';
  }
  return Blockly.JavaScript['unittest_main'].defineAssert_() +
      '(' + actual + ', ' + expected + ', ' + message + ');\n';
};

Blockly.JavaScript['unittest_fail'] = function(block) {
  // Always assert an error.
  var resultsVar = Blockly.JavaScript.variableDB_.getName('unittestResults',
      Blockly.Variables.NAME_TYPE);
  var message = Blockly.JavaScript.quote_(block.getFieldValue('MESSAGE'));
  if (!Blockly.JavaScript.definitions_['unittest_fail']) {
    var functionName = Blockly.JavaScript.variableDB_.getDistinctName(
        'fail', Blockly.Generator.NAME_TYPE);
    Blockly.JavaScript['unittest_fail'].assert = functionName;
    var func = [];
    func.push('function ' + functionName + '(message) {');
    func.push('  // Always assert an error.');
    func.push('  if (!' + resultsVar + ') {');
    func.push('    throw "Orphaned assert fail: ' + message + '";');
    func.push('  }');
    func.push('  ' + resultsVar + '.push([false, "Fail.", message]);');
    func.push('}');
    func.push('');
    Blockly.JavaScript.definitions_['unittest_fail'] = func.join('\n');
  }
  return Blockly.JavaScript['unittest_fail'].assert + '(' + message + ');\n';
};
