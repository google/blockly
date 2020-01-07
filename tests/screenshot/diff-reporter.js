// diff-reporter.js

/**
 * @license
 * Copyright 2019 Google LLC
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
 * @fileoverview Reporter that prints results to the console with the same
 * format as the spec reporter, but also saves a test_output.js file with a
 * variable that just wraps a json object, for use in diff_viewer.html.
 */
var mocha = require('mocha');
var fs = require("fs");
module.exports = DiffReporter;


function DiffReporter(runner) {
  mocha.reporters.Base.call(this, runner);
  var passes = 0;
  var failures = 0;

  // Values for the JSON output.
  var json_tests = [];

  // From the spec reporter.
  var self = this;
  var indents = 0;
  var n = 0;
  var colours = {
    pass: 32,
    fail: 31,
    'bright pass': 92,
    'bright fail': 91,
    'bright yellow': 93,
    pending: 36,
    suite: 0,
    'error title': 0,
    'error message': 31,
    'error stack': 90,
    checkmark: 32,
    fast: 90,
    medium: 33,
    slow: 31,
    green: 32,
    light: 90,
    'diff gutter': 90,
    'diff added': 32,
    'diff removed': 31
  };

  var symbols = {
    ok: '✓',
    err: '✖',
    dot: '․',
    comma: ',',
    bang: '!'
  };

  /**
   * colour `str` with the given `type`,
   * allowing colours to be disabled,
   * as well as user-defined colour
   * schemes.
   *
   * @private
   * @param {string} type
   * @param {string} str
   * @return {string}
   */
  var colour = function(type, str) {
    if (!colours) {
      return String(str);
    }
    return '\u001b[' + colours[type] + 'm' + str + '\u001b[0m';
  };

  function indent() {
    return Array(indents).join('  ');
  }

  // Indent/unindent correctly.
  runner.on('start', function() {
    console.log();
  });
  runner.on('suite', function(suite) {
    ++indents;
    console.log(colour('suite', '%s%s'), indent(), suite.title);
  });
  runner.on('suite end', function() {
    --indents;
    if (indents === 1) {
      console.log();
    }
  });
  runner.on('pass', function(test) {
    passes++;
    json_tests.push(test);
    var logStr =
      indent() +
      colour('checkmark', '  ' + symbols.ok) +
      colour('pass', ' ' + test.title);
      console.log(logStr);
  });

  runner.on('fail', function(test, err) {
    failures++;
    json_tests.push(test);
    // Print test information the way the spec reporter would.
    console.log(indent() + colour('fail', '  %d) %s'), ++n, test.title);
  });

  runner.on('end', function() {
    console.log('\n%d/%d tests passed\n', passes, passes + failures);
    var jsonObj = {
      passes: passes,
      failures: failures,
      total: passes + failures,
      tests: json_tests.map(clean)
    }
    runner.testResults = jsonObj;

    let json = JSON.stringify(jsonObj, null, 2)
    let jsonOutput = writeJSON(json, 'test_output')
  });


  function clean(test) {
    return {
      title: test.title,
      fullTitle: test.fullTitle(),
      state: test.state
    };
  }

  function writeJSON(data, filename){
    let output_dir = `${process.cwd()}/tests/screenshot/outputs`
    let output= `${output_dir}/${filename}`

    if (!fs.existsSync(output_dir)){
      fs.mkdirSync(output_dir);
    }
    fs.writeFileSync(output + '.json', data)

    fs.writeFileSync(output + '.js', 'var results = ' + data);
    return output
  }
}
mocha.utils.inherits(DiffReporter, mocha.reporters.Spec);
