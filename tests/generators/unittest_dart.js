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
 * @fileoverview Generating Dart for unit test blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Dart = Blockly.Generator.get('Dart');

Blockly.Dart.unittest_main = function() {
  // Container for unit tests.
  var resultsVar = Blockly.Dart.variableDB_.getName('unittestResults',
      Blockly.Variables.NAME_TYPE);
  if (!Blockly.Dart.definitions_['unittest_report']) {
    var functionName = Blockly.Dart.variableDB_.getDistinctName(
        'testReport', Blockly.Generator.NAME_TYPE);
    Blockly.Dart.unittest_main.report = functionName;
    var func = [];
    func.push('String ' + functionName + '() {');
    func.push('  // Create test report.');
    func.push('  List report = [];');
    func.push('  StringBuffer summary = new StringBuffer();');
    func.push('  int fails = 0;');
    func.push('  for (int x = 0; x < ' + resultsVar + '.length; x++) {');
    func.push('    if (' + resultsVar + '[x][0]) {');
    func.push('      summary.write(".");');
    func.push('    } else {');
    func.push('      summary.write("F");');
    func.push('      fails++;');
    func.push('      report.add("");');
    func.push('      report.add("FAIL: ${' + resultsVar + '[x][2]}");');
    func.push('      report.add(' + resultsVar + '[x][1]);');
    func.push('    }');
    func.push('  }');
    func.push('  report.insertRange(0, 1, summary.toString());');
    func.push('  report.add("");');
    func.push('  report.add("Ran ${' + resultsVar + '.length} tests.");');
    func.push('  report.add("");');
    func.push('  if (fails != 0) {');
    func.push('    report.add("FAILED (failures=$fails)");');
    func.push('  } else {');
    func.push('    report.add("OK");');
    func.push('  }');
    func.push('  return report.join("\\n");');
    func.push('}');
    func.push('');
    Blockly.Dart.definitions_['unittest_report'] = func.join('\n');
  }
  // Setup global to hold test results.
  var code = resultsVar + ' = [];\n';
  // Run tests (unindented).
  code += Blockly.Dart.statementToCode(this, 'DO')
      .replace(/^  /, '').replace(/\n  /g, '\n');
  var reportVar = Blockly.Dart.variableDB_.getDistinctName(
      'report', Blockly.Variables.NAME_TYPE);
  code += 'String ' + reportVar + ' = ' +
      Blockly.Dart.unittest_main.report + '();\n';
  // Destroy results.
  code += resultsVar + ' = null;\n';
  // Print the report to the console (that's where errors will go anyway).
  code += 'print(' + reportVar + ');\n';
  return code;
};

Blockly.Dart.unittest_main.defineAssert_ = function() {
  if (!Blockly.Dart.definitions_['unittest_assertequals']) {
  var resultsVar = Blockly.Dart.variableDB_.getName('unittestResults',
      Blockly.Variables.NAME_TYPE);
    var functionName = Blockly.Dart.variableDB_.getDistinctName(
        'assertEquals', Blockly.Generator.NAME_TYPE);
    Blockly.Dart.unittest_main.assert_ = functionName;
    var func = [];
    func.push('void ' + functionName +
        '(dynamic actual, dynamic expected, String message) {');
    func.push('  // Asserts that a value equals another value.');
    func.push('  if (' + resultsVar + ' == null) {');
    func.push('    throw "Orphaned assert: ${message}";');
    func.push('  }');
    func.push('  if (actual == expected) {');
    func.push('    ' + resultsVar + '.add([true, "OK", message]);');
    func.push('  } else {');
    func.push('    ' + resultsVar + '.add([false, ' +
        '"Expected: $expected\\nActual: $actual", message]);');
    func.push('  }');
    func.push('}');
    func.push('');
    Blockly.Dart.definitions_['unittest_assertequals'] = func.join('\n');
  }
  return Blockly.Dart.unittest_main.assert_;
};

Blockly.Dart.unittest_assertequals = function() {
  // Asserts that a value equals another value.
  var resultsVar = Blockly.Dart.variableDB_.getName('unittestResults',
      Blockly.Variables.NAME_TYPE);
  var message = Blockly.Dart.quote_(this.getTitleValue('MESSAGE'));
  var actual = Blockly.Dart.valueToCode(this, 'ACTUAL',
      Blockly.Dart.ORDER_NONE) || 'null';
  var expected = Blockly.Dart.valueToCode(this, 'EXPECTED',
      Blockly.Dart.ORDER_NONE) || 'null';
  return Blockly.Dart.unittest_main.defineAssert_() +
      '(' + actual + ', ' + expected + ', ' + message + ');\n';
};

Blockly.Dart.unittest_assertvalue = function() {
  // Asserts that a value is true, false, or null.
  var resultsVar = Blockly.Dart.variableDB_.getName('unittestResults',
      Blockly.Variables.NAME_TYPE);
  var message = Blockly.Dart.quote_(this.getTitleValue('MESSAGE'));
  var actual = Blockly.Dart.valueToCode(this, 'ACTUAL',
      Blockly.Dart.ORDER_NONE) || 'true';
  var expected = this.getTitleValue('EXPECTED');
  if (expected == 'TRUE') {
    expected = 'true';
  } else if (expected == 'FALSE') {
    expected = 'false';
  } else if (expected == 'NULL') {
    expected = 'null';
  }
  return Blockly.Dart.unittest_main.defineAssert_() +
      '(' + actual + ', ' + expected + ', ' + message + ');\n';
};

Blockly.Dart.unittest_fail = function() {
  // Always assert an error.
  var resultsVar = Blockly.Dart.variableDB_.getName('unittestResults',
      Blockly.Variables.NAME_TYPE);
  var message = Blockly.Dart.quote_(this.getTitleValue('MESSAGE'));
  if (!Blockly.Dart.definitions_['unittest_fail']) {
    var functionName = Blockly.Dart.variableDB_.getDistinctName(
        'fail', Blockly.Generator.NAME_TYPE);
    Blockly.Dart.unittest_fail.assert = functionName;
    var func = [];
    func.push('void ' + functionName + '(String message) {');
    func.push('  // Always assert an error.');
    func.push('  if (' + resultsVar + ' == null) {');
    func.push('    throw "Orphaned assert fail: ' + message + '";');
    func.push('  }');
    func.push('  ' + resultsVar + '.add([false, "Fail.", message]);');
    func.push('}');
    func.push('');
    Blockly.Dart.definitions_['unittest_fail'] = func.join('\n');
  }
  return Blockly.Dart.unittest_fail.assert + '(' + message + ');\n';
};
