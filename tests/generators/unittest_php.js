/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2015 Google Inc.
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
 * @fileoverview Generating PHP for unit test blocks.
 * @author daarond@gmail.com (Daaron Dwyer)
 */
'use strict';

Blockly.PHP['unittest_main'] = function(block) {
    // Container for unit tests.
    var resultsVar = Blockly.PHP.variableDB_.getName('unittestResults',
        Blockly.Variables.NAME_TYPE);
    var functionName = Blockly.PHP.provideFunction_(
        'unittest_report',
        [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ + '() {',
            'global ' + resultsVar + ';',
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
            '      array_push($report,"");',
            '      array_push($report, "FAIL: " . ' + resultsVar + '[$x][2]);',
            '      array_push($report, ' + resultsVar + '[$x][1]);',
            '    }',
            '  }',
            '  array_unshift($report, implode("",$summary));',
            '  array_push($report, "");',
            '  array_push($report, "Number of tests run: " . count(' + resultsVar + '));',
            '  array_push($report, "");',
            '  if ($fails) {',
            '    array_push($report, "FAILED (failures=" . $fails + ")");',
            '  } else {',
            '    array_push($report, "OK");',
            '  }',
            '  return implode("\\n", $report);',
            '}']);
    // Setup global to hold test results.
    var code = resultsVar + ' = array();\n';
    // Run tests (unindented).
    code += Blockly.PHP.statementToCode(block, 'DO')
        .replace(/^  /, '').replace(/\n  /g, '\n');
    var reportVar = Blockly.PHP.variableDB_.getDistinctName(
        'report', Blockly.Variables.NAME_TYPE);
    code += reportVar + ' = ' + functionName + '();\n';
    // Destroy results.
    code += resultsVar + ' = null;\n';
    // Send the report to the console (that's where errors will go anyway).
    code += 'print(' + reportVar + ');\n';
    return code;
};

Blockly.PHP['unittest_main'].defineAssert_ = function(block) {
    var resultsVar = Blockly.PHP.variableDB_.getName('unittestResults',
        Blockly.Variables.NAME_TYPE);
    var functionName = Blockly.PHP.provideFunction_(
        'assertEquals',
        [   '  function equals($a, $b) {',
            '    if ($a === $b) {',
            '      return true;',
            '    } else if ((is_numeric($a)) && (is_numeric($b)) &&',
            '        (round($a,15) == round($b,15))) {',
            '      return true;',
            '    } else if (is_array($a) && is_array($b)) {',
            '      if (count($a) != count($b)) {',
            '        return false;',
            '      }',
            '      for ($i = 0; $i < count($a); $i++) {',
            '        if (!equals($a[$i], $b[$i])) {',
            '          return false;',
            '        }',
            '      }',
            '      return true;',
            '    }',
            '    return false;',
            '  }',
            'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
            '($actual, $expected, $message) {',
            'global ' + resultsVar + ';',
            '  // Asserts that a value equals another value.',
            '  if (!is_array(' + resultsVar + ')) {',
            '    throw new Exception("Orphaned assert: " . $message);',
            '  }',
            '  if (equals($actual, $expected)) {',
            '    array_push(' + resultsVar + ', [true, "OK", $message]);',
            '  } else {',
            '    array_push(' + resultsVar + ', [false, ' +
            '"Expected: " . $expected . "\\nActual: " . $actual, $message]);',
            '  }',
            '}']);
    return functionName;
};

Blockly.PHP['unittest_assertequals'] = function(block) {
    // Asserts that a value equals another value.
    var message = Blockly.PHP.quote_(block.getFieldValue('MESSAGE'));
    var actual = Blockly.PHP.valueToCode(block, 'ACTUAL',
            Blockly.PHP.ORDER_COMMA) || 'null';
    var expected = Blockly.PHP.valueToCode(block, 'EXPECTED',
            Blockly.PHP.ORDER_COMMA) || 'null';
    return Blockly.PHP['unittest_main'].defineAssert_() +
        '(' + actual + ', ' + expected + ', ' + message + ');\n';
};

Blockly.PHP['unittest_assertvalue'] = function(block) {
    // Asserts that a value is true, false, or null.
    var message = Blockly.PHP.quote_(block.getFieldValue('MESSAGE'));
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
        Blockly.Variables.NAME_TYPE);
    var message = Blockly.PHP.quote_(block.getFieldValue('MESSAGE'));
    var functionName = Blockly.PHP.provideFunction_(
        'unittest_fail',
        [ 'function ' + Blockly.PHP.FUNCTION_NAME_PLACEHOLDER_ +
        '($message) {',
            'global ' + resultsVar + ';',
            '  // Always assert an error.',
            '  if (!' + resultsVar + ') {',
            '    throw new Exception("Orphaned assert fail: " . $message);',
            '  }',
            '  array_push(' + resultsVar + ', [false, "Fail.", $message]);',
            '}']);
    return functionName + '(' + message + ');\n';
};
