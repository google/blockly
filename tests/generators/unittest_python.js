/**
 * @license
 * Copyright 2012 Google LLC
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
 * @fileoverview Generating Python for unit test blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Python['unittest_main'] = function(block) {
  // Container for unit tests.
  var resultsVar = Blockly.Python.variableDB_.getName('unittestResults',
      Blockly.Names.DEVELOPER_VARIABLE_TYPE);
  var functionName = Blockly.Python.provideFunction_(
      'unittest_report',
      ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ + '():',
       '  # Create test report.',
       '  report = []',
       '  summary = []',
       '  fails = 0',
       '  for (success, log, message) in ' + resultsVar + ':',
       '    if success:',
       '      summary.append(".")',
       '    else:',
       '      summary.append("F")',
       '      fails += 1',
       '      report.append("")',
       '      report.append("FAIL: " + message)',
       '      report.append(log)',
       '  report.insert(0, "".join(summary))',
       '  report.append("")',
       '  report.append("Number of tests run: %d" % len(' + resultsVar + '))',
       '  report.append("")',
       '  if fails:',
       '    report.append("FAILED (failures=%d)" % fails)',
       '  else:',
       '    report.append("OK")',
       '  return "\\n".join(report)']);

  // Setup global to hold test results.
  var code = resultsVar + ' = []\n';
  // Say which test suite this is.
  code += 'print(\'\\n====================\\n\\n' +
      'Running suite: ' +
      block.getFieldValue('SUITE_NAME') +
       '\')\n';
  // Run tests (unindented).
  code += Blockly.Python.statementToCode(block, 'DO')
      .replace(/^  /, '').replace(/\n  /g, '\n');
  // Print the report.
  code += 'print(' + functionName + '())\n';
  // Destroy results.
  code += resultsVar + ' = None\n';
  return code;
};

Blockly.Python['unittest_main'].defineAssert_ = function() {
  var resultsVar = Blockly.Python.variableDB_.getName('unittestResults',
      Blockly.Names.DEVELOPER_VARIABLE_TYPE);
  var functionName = Blockly.Python.provideFunction_(
      'assertEquals',
      ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ +
          '(actual, expected, message):',
       '  # Asserts that a value equals another value.',
       '  if ' + resultsVar + ' == None:',
       '    raise Exception("Orphaned assert equals: " + message)',
       '  if actual == expected:',
       '    ' + resultsVar + '.append((True, "OK", message))',
       '  else:',
       '    ' + resultsVar + '.append((False, ' +
           '"Expected: %s\\nActual: %s" % (expected, actual), message))']);
  return functionName;
};

Blockly.Python['unittest_assertequals'] = function(block) {
  // Asserts that a value equals another value.
  var message = Blockly.Python.valueToCode(block, 'MESSAGE',
      Blockly.Python.ORDER_NONE) || '';
  var actual = Blockly.Python.valueToCode(block, 'ACTUAL',
      Blockly.Python.ORDER_NONE) || 'None';
  var expected = Blockly.Python.valueToCode(block, 'EXPECTED',
      Blockly.Python.ORDER_NONE) || 'None';
  return Blockly.Python['unittest_main'].defineAssert_() +
      '(' + actual + ', ' + expected + ', ' + message + ')\n';
};

Blockly.Python['unittest_assertvalue'] = function(block) {
  // Asserts that a value is true, false, or null.
  var message = Blockly.Python.valueToCode(block, 'MESSAGE',
      Blockly.Python.ORDER_NONE) || '';
  var actual = Blockly.Python.valueToCode(block, 'ACTUAL',
      Blockly.Python.ORDER_NONE) || 'None';
  var expected = block.getFieldValue('EXPECTED');
  if (expected == 'TRUE') {
    expected = 'True';
  } else if (expected == 'FALSE') {
    expected = 'False';
  } else if (expected == 'NULL') {
    expected = 'None';
  }
  return Blockly.Python['unittest_main'].defineAssert_() +
      '(' + actual + ', ' + expected + ', ' + message + ')\n';
};

Blockly.Python['unittest_fail'] = function(block) {
  // Always assert an error.
  var resultsVar = Blockly.Python.variableDB_.getName('unittestResults',
      Blockly.Names.DEVELOPER_VARIABLE_TYPE);
  var message = Blockly.Python.quote_(block.getFieldValue('MESSAGE'));
  var functionName = Blockly.Python.provideFunction_(
      'fail',
      ['def ' + Blockly.Python.FUNCTION_NAME_PLACEHOLDER_ + '(message):',
       '  # Always assert an error.',
       '  if ' + resultsVar + ' == None:',
       '    raise Exception("Orphaned assert equals: " + message)',
       '  ' + resultsVar + '.append((False, "Fail.", message))']);
  return functionName + '(' + message + ')\n';
};

Blockly.Python['unittest_adjustindex'] = function(block) {
  var index = Blockly.Python.valueToCode(block, 'INDEX',
      Blockly.Python.ORDER_ADDITIVE) || '0';
  // Adjust index if using one-based indexing.
  if (block.workspace.options.oneBasedIndex) {
    if (Blockly.isNumber(index)) {
      // If the index is a naked number, adjust it right now.
      return [Number(index) + 1, Blockly.Python.ORDER_ATOMIC];
    } else {
      // If the index is dynamic, adjust it in code.
      index = index + ' + 1';
    }
  } else if (Blockly.isNumber(index)) {
    return [index, Blockly.Python.ORDER_ATOMIC];
  }
  return [index, Blockly.Python.ORDER_ADDITIVE];
};
