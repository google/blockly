/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Python for unit test blocks.
 */
'use strict';

import {Python} from '../../generators/python.js';

Python['unittest_main'] = function(block) {
  // Container for unit tests.
  var resultsVar = Python.nameDB_.getName('unittestResults',
      Blockly.Names.DEVELOPER_VARIABLE_TYPE);
  var functionName = Python.provideFunction_(
      'unittest_report',
      ['def ' + Python.FUNCTION_NAME_PLACEHOLDER_ + '():',
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
  code += Python.statementToCode(block, 'DO')
      .replace(/^  /, '').replace(/\n  /g, '\n');
  // Print the report.
  code += 'print(' + functionName + '())\n';
  // Destroy results.
  code += resultsVar + ' = None\n';
  return code;
};

Python['unittest_main'].defineAssert_ = function() {
  var resultsVar = Python.nameDB_.getName('unittestResults',
      Blockly.Names.DEVELOPER_VARIABLE_TYPE);
  var functionName = Python.provideFunction_(
      'assertEquals',
      ['def ' + Python.FUNCTION_NAME_PLACEHOLDER_ +
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

Python['unittest_assertequals'] = function(block) {
  // Asserts that a value equals another value.
  var message = Python.valueToCode(block, 'MESSAGE',
      Python.ORDER_NONE) || '';
  var actual = Python.valueToCode(block, 'ACTUAL',
      Python.ORDER_NONE) || 'None';
  var expected = Python.valueToCode(block, 'EXPECTED',
      Python.ORDER_NONE) || 'None';
  return Python['unittest_main'].defineAssert_() +
      '(' + actual + ', ' + expected + ', ' + message + ')\n';
};

Python['unittest_assertvalue'] = function(block) {
  // Asserts that a value is true, false, or null.
  var message = Python.valueToCode(block, 'MESSAGE',
      Python.ORDER_NONE) || '';
  var actual = Python.valueToCode(block, 'ACTUAL',
      Python.ORDER_NONE) || 'None';
  var expected = block.getFieldValue('EXPECTED');
  if (expected == 'TRUE') {
    expected = 'True';
  } else if (expected == 'FALSE') {
    expected = 'False';
  } else if (expected == 'NULL') {
    expected = 'None';
  }
  return Python['unittest_main'].defineAssert_() +
      '(' + actual + ', ' + expected + ', ' + message + ')\n';
};

Python['unittest_fail'] = function(block) {
  // Always assert an error.
  var resultsVar = Python.nameDB_.getName('unittestResults',
      Blockly.Names.DEVELOPER_VARIABLE_TYPE);
  var message = Python.quote_(block.getFieldValue('MESSAGE'));
  var functionName = Python.provideFunction_(
      'fail',
      ['def ' + Python.FUNCTION_NAME_PLACEHOLDER_ + '(message):',
       '  # Always assert an error.',
       '  if ' + resultsVar + ' == None:',
       '    raise Exception("Orphaned assert equals: " + message)',
       '  ' + resultsVar + '.append((False, "Fail.", message))']);
  return functionName + '(' + message + ')\n';
};

Python['unittest_adjustindex'] = function(block) {
  var index = Python.valueToCode(block, 'INDEX',
      Python.ORDER_ADDITIVE) || '0';
  // Adjust index if using one-based indexing.
  if (block.workspace.options.oneBasedIndex) {
    if (Blockly.isNumber(index)) {
      // If the index is a naked number, adjust it right now.
      return [Number(index) + 1, Python.ORDER_ATOMIC];
    } else {
      // If the index is dynamic, adjust it in code.
      index = index + ' + 1';
    }
  } else if (Blockly.isNumber(index)) {
    return [index, Python.ORDER_ATOMIC];
  }
  return [index, Python.ORDER_ADDITIVE];
};
