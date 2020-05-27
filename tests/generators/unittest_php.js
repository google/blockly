/**
 * @license
 * Copyright 2015 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating PHP for unit test blocks.
 * @author daarond@gmail.com (Daaron Dwyer)
 */
'use strict';

Blockly.PHP['unittest_main'] = function(block) {
  // Container for unit tests.
  var resultsVar = Blockly.PHP.variableDB_.getName('unittestResults',
      Blockly.Names.DEVELOPER_VARIABLE_TYPE);
  var functionName = Blockly.PHP.provideFunction_(
      'unittest_report',
      [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ + '() {',
          '  global ' + resultsVar + ';',
          '  // Create test report.',
          '  $report = array();',
          '  $summary = array();',
          '  $fails = 0;',
          '  for ($x = 0; $x < count(' + resultsVar + '); $x++) {',
          '    if (' + resultsVar + '[$x][0]) {',
          '      array_push($summary, ".");',
          '    } else {',
          '      array_push($summary, "F");',
          '      $fails++;',
          '      array_push($report, "");',
          '      array_push($report, "FAIL: " . ' + resultsVar + '[$x][2]);',
          '      array_push($report, ' + resultsVar + '[$x][1]);',
          '    }',
          '  }',
          '  array_unshift($report, implode("", $summary));',
          '  array_push($report, "");',
          '  array_push($report, "Number of tests run: " . count(' + resultsVar + '));',
          '  array_push($report, "");',
          '  if ($fails) {',
          '    array_push($report, "FAILED (failures=" . $fails . ")");',
          '  } else {',
          '    array_push($report, "OK");',
          '  }',
          '  return implode("\\n", $report);',
          '}']);
  // Setup global to hold test results.
  var code = resultsVar + ' = array();\n';
  // Say which test suite this is.
  code += 'print("\\n====================\\n\\n' +
      'Running suite: ' +
      block.getFieldValue('SUITE_NAME') +
       '\\n");\n';
  // Run tests (unindented).
  code += Blockly.PHP.statementToCode(block, 'DO')
      .replace(/^  /, '').replace(/\n  /g, '\n');
  // Send the report to the console (that's where errors will go anyway).
  code += 'print(' + functionName + '());\n';
  // Destroy results.
  code += resultsVar + ' = null;\n';
  return code;
};

Blockly.PHP['unittest_main'].defineAssert_ = function(block) {
  var resultsVar = Blockly.PHP.variableDB_.getName('unittestResults',
      Blockly.Names.DEVELOPER_VARIABLE_TYPE);
  var functionName = Blockly.PHP.provideFunction_(
      'assertEquals',
      ['function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
      '($actual, $expected, $message) {',
      '  global ' + resultsVar + ';',
      '  // Asserts that a value equals another value.',
      '  if (!is_array(' + resultsVar + ')) {',
      '    throw new Exception("Orphaned assert: " . $message);',
      '  }',
      '  if ($actual == $expected) {',
      '    array_push(' + resultsVar + ', [true, "OK", $message]);',
      '  } else {',
      '    $expected = is_array($expected) ? implode(" ", $expected) : ' +
          '$expected;',
      '    $actual = is_array($actual) ? implode(" ", $actual) : ' +
          '$actual;',
      '    array_push(' + resultsVar + ', [false, ' +
      '"Expected: " . $expected . "\\nActual: " . $actual, $message]);',
      '  }',
      '}']);
  return functionName;
};

Blockly.PHP['unittest_assertequals'] = function(block) {
  // Asserts that a value equals another value.
  var message = Blockly.PHP.valueToCode(block, 'MESSAGE',
    Blockly.PHP.ORDER_NONE) || '';
  var actual = Blockly.PHP.valueToCode(block, 'ACTUAL',
          Blockly.PHP.ORDER_COMMA) || 'null';
  var expected = Blockly.PHP.valueToCode(block, 'EXPECTED',
          Blockly.PHP.ORDER_COMMA) || 'null';
  return Blockly.PHP['unittest_main'].defineAssert_() +
      '(' + actual + ', ' + expected + ', ' + message + ');\n';
};

Blockly.PHP['unittest_assertvalue'] = function(block) {
  // Asserts that a value is true, false, or null.
  var message = Blockly.PHP.valueToCode(block, 'MESSAGE',
    Blockly.PHP.ORDER_NONE) || '';
  var actual = Blockly.PHP.valueToCode(block, 'ACTUAL',
          Blockly.PHP.ORDER_COMMA) || 'null';
  var expected = block.getFieldValue('EXPECTED');
  if (expected == 'TRUE') {
      expected = 'true';
  } else if (expected == 'FALSE') {
      expected = 'false';
  } else if (expected == 'NULL') {
      expected = 'null';
  }
  return Blockly.PHP['unittest_main'].defineAssert_() +
      '(' + actual + ', ' + expected + ', ' + message + ');\n';
};

Blockly.PHP['unittest_fail'] = function(block) {
  // Always assert an error.
  var resultsVar = Blockly.PHP.variableDB_.getName('unittestResults',
      Blockly.Names.DEVELOPER_VARIABLE_TYPE);
  var message = Blockly.PHP.quote_(block.getFieldValue('MESSAGE'));
  var functionName = Blockly.PHP.provideFunction_(
      'unittest_fail',
      [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
      '($message) {',
          '  global ' + resultsVar + ';',
          '  // Always assert an error.',
          '  if (!' + resultsVar + ') {',
          '    throw new Exception("Orphaned assert fail: " . $message);',
          '  }',
          '  array_push(' + resultsVar + ', [false, "Fail.", $message]);',
          '}']);
  return functionName + '(' + message + ');\n';
};

Blockly.PHP['unittest_adjustindex'] = function(block) {
  var index = Blockly.PHP.valueToCode(block, 'INDEX',
      Blockly.PHP.ORDER_ADDITION) || '0';
  // Adjust index if using one-based indexing.
  if (block.workspace.options.oneBasedIndex) {
    if (Blockly.isNumber(index)) {
      // If the index is a naked number, adjust it right now.
      return [Number(index) + 1, Blockly.PHP.ORDER_ATOMIC];
    } else {
      // If the index is dynamic, adjust it in code.
      index = index + ' + 1';
    }
  } else if (Blockly.isNumber(index)) {
    return [index, Blockly.PHP.ORDER_ATOMIC];
  }
  return [index, Blockly.PHP.ORDER_ADDITION];
};
