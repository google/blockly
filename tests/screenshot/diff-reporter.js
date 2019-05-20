// diff-reporter.js

/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2019 Google Inc.
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
  var color = mocha.reporters.Base.color;

  function indent() {
    return Array(indents).join('  ');
  }

  // Indent/unindent correctly.
  runner.on('start', function() {
    console.log();
  });
  runner.on('suite', function(suite) {
    ++indents;
    console.log(color('suite', '%s%s'), indent(), suite.title);
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

    // Print test information the way the spec reporter would.
    var fmt;
    if (test.speed === 'fast') {
      fmt =
        indent() +
        color('checkmark', '  ' + Base.symbols.ok) +
        color('pass', ' %s');
      console.log(fmt, test.title);
    } else {
      fmt =
        indent() +
        color('checkmark', '  ' + Base.symbols.ok) +
        color('pass', ' %s') +
        color(test.speed, ' (%dms)');
      console.log(fmt, test.title, test.duration);
    }
  });

  runner.on('fail', function(test, err) {
    failures++;
    json_tests.push(test);
    // Print test information the way the spec reporter would.
    console.log(indent() + color('fail', '  %d) %s'), ++n, test.title);
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
