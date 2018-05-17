/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2018 Google Inc.
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
 * @fileoverview Node.js script to run all tests.
 */
if (require.main !== module) {
  throw __filename + ' must be called directly.';
}

function travisFold(startOrEnd, i) {
  if (process.env['TRAVIS'] === 'true') {
    console.log('travis_fold:' + startOrEnd + ':npm_test_' + i);
  }
}

var testFns = [
      require('./jsunit/run_jsunit_tests_in_browser')
    ];

var hadTestFailure = false;
testFns.forEach((testFn, i) => {
  travisFold('start', i);
  try {
    // TODO: Run each test function in a child process to
    // prevent state leaks between test functions.
    // Wait for process to complete before starting next test.
    // Check process exit code as success/failure result.
    // (OR... Do all of this from shell scripts?)
    testFn();
    travisFold('end', i);
  } catch (errorStr) {
    hadTestFailure = true;
    travisFold('end', i);
    console.error(errorStr + '\n\n');
  }
});

if (hadTestFailure) {
  process.exit(1);
}
