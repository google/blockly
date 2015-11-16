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
 * @fileoverview Generating Java for unit test blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Java['unittest_main'] = function(block) {
  // Container for unit tests.
  Blockly.Java.setGlobalVar(block,'unittestResults', null);
  var resultsVar = Blockly.Java.variableDB_.getName('unittestResults',
      Blockly.Variables.NAME_TYPE);

  Blockly.Java.addImport('java.util.LinkedList');
  Blockly.Java.addImport('java.lang.StringBuilder');

  var x1 = Blockly.Java.variableDB_.getDistinctName(
              'unittestResult', Blockly.Variables.NAME_TYPE);
  var x2 = Blockly.Java.variableDB_.getDistinctName(
              'x', Blockly.Variables.NAME_TYPE);

  var functionName = Blockly.Java.provideFunction_(
      'unittest_report',
      [ 'public String ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ + '() {',
        '    // Create test report.',
        '    LinkedList<String> report = new LinkedList<>();',
        '    LinkedList<String> summary = new LinkedList<>();',
        '    StringBuilder result = new StringBuilder();',
        '    int fails = 0;',
        '    for (Object '+x1+' : '+resultsVar+') {',
        '        if ((boolean)(((LinkedList)' +x1+').get(0))) {',
        '            summary.add(".");',
        '        } else {',
        '            summary.add("F");',
        '            fails++;',
        '            report.add("");',
        '            report.add("FAIL: " + (String)((LinkedList) ' +x1+').get(2));',
        '            report.add((String)((LinkedList) ' +x1+').get(1));',
        '        }',
        '    }',
        '    for(String '+x2+': summary) {',
        '        result.append('+x2+');',
        '        result.append("\\n");',
        '    }',
        '    report.add("");',
        '    report.add("Number of tests run: " + ' + resultsVar +
              '.size());',
        '    report.add("");',
        '    if (fails > 0) {',
        '        report.add("FAILED (failures=" + fails + ")");',
        '    } else {',
        '        report.add("OK");',
        '    }',
        '    for(String '+x2+': report) {',
        '        result.append('+x2+');',
        '        result.append("\\n");',
        '    }',
        '    return result.toString();',
        '}']);
  // Setup global to hold test results.
  var code = resultsVar + ' = new LinkedList();\n';
  // Run tests (unindented).
  code += Blockly.Java.statementToCode(block, 'DO')
      .replace(/^  /, '').replace(/\n  /g, '\n');

  var reportVar = Blockly.Java.variableDB_.getDistinctName(
      'report', Blockly.Variables.NAME_TYPE);
  code += 'String ' + reportVar + ' = this.' + functionName + '();\n';
  // Send the report to the console (that's where errors will go anyway).
  code += 'System.out.print(' + reportVar + ');\n';

  code = 'public void myMain(String[] args) {\n' +
         Blockly.Java.prefixLines(/** @type {string} */ (code),
                                  Blockly.Java.INDENT) +
         '}\n'+
         'public static void main(String[] args) {\n'+
         '   // Create the class\n' +
         '    '+ Blockly.Java.getAppName() +
                      ' app = new '+ Blockly.Java.getAppName() + '();\n' +
         '    app.myMain(args);\n'+
         '}\n';
  return code;
};

Blockly.Java['unittest_main'].defineAssert_ = function(block) {
  Blockly.Java.setGlobalVar(block,'unittestResults', null);
  var resultsVar = Blockly.Java.variableDB_.getName('unittestResults',
      Blockly.Variables.NAME_TYPE);
  Blockly.Java.provideVarClass();
  var functionName = Blockly.Java.provideFunction_(
      'assertEquals',
      [ 'public void ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
          '(Object actual, Object expected, String message) {',
        '    LinkedList result = new LinkedList();',
        '    // Asserts that a value equals another value.',
        '    if (Var.valueOf(actual).equals(Var.valueOf(expected))) {',
        '          result.add(true);',
        '          result.add("OK");',
        '          result.add(message);',
        '    } else {',
        '          result.add(false);',
        '          result.add("Expected: " + expected + "\\nActual: " + actual);',
        '          result.add(message);',
        '    }',
        '    ' + resultsVar + '.add(result);',
        '}']);
  return 'this.' + functionName;
};

Blockly.Java['unittest_assertequals'] = function(block) {
  // Asserts that a value equals another value.
  var message = Blockly.Java.quote_(block.getFieldValue('MESSAGE'));
  var actual = Blockly.Java.valueToCode(block, 'ACTUAL',
      Blockly.Java.ORDER_NONE) || 'null';
  var expected = Blockly.Java.valueToCode(block, 'EXPECTED',
      Blockly.Java.ORDER_NONE) || 'null';
  return Blockly.Java['unittest_main'].defineAssert_(block) +
      '(' + actual + ', ' + expected + ', ' + message + ');\n';
};

Blockly.Java['unittest_assertvalue'] = function(block) {
  // Asserts that a value is true, false, or null.
  var message = Blockly.Java.quote_(block.getFieldValue('MESSAGE'));
  var actual = Blockly.Java.valueToCode(block, 'ACTUAL',
      Blockly.Java.ORDER_NONE) || 'null';
  var expected = block.getFieldValue('EXPECTED');
  if (expected == 'TRUE') {
    expected = 'true';
  } else if (expected == 'FALSE') {
    expected = 'false';
  } else if (expected == 'NULL') {
    expected = 'null';
  }
  return Blockly.Java['unittest_main'].defineAssert_(block) +
      '(' + actual + ', ' + expected + ', ' + message + ');\n';
};

Blockly.Java['unittest_fail'] = function(block) {
  Blockly.Java.setGlobalVar(block,'unittestResults', null);
  // Always assert an error.
  var resultsVar = Blockly.Java.variableDB_.getName('unittestResults',
      Blockly.Variables.NAME_TYPE);
  var message = Blockly.Java.quote_(block.getFieldValue('MESSAGE'));
  var functionName = Blockly.Java.provideFunction_(
      'unittest_fail',
      [ 'public void ' + Blockly.Java.FUNCTION_NAME_PLACEHOLDER_ +
          '(String message) {',
        '    // Always assert an error.',
        '    LinkedList result = new LinkedList();',
        '    result.add(false);',
        '    result.add("Fail.");',
        '    result.add(message);',
        '    ' + resultsVar + '.add(result);',
        '}']);
  return functionName + '(' + message + ');\n';
};
