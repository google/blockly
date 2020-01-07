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
 * @fileoverview A mocha test runner that mimics the behaviour of
 *    goog.testing.junit
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';


/**
 * Setup mocha
 */
mocha.setup({
  ui: 'tdd'
});
// Add mocha div
var mochaDiv = document.createElement('div');
mochaDiv.id = 'mocha';
document.body.appendChild(mochaDiv);
var mochaCss = document.createElement('link');
mochaCss.setAttribute('href', 'https://unpkg.com/mocha@5.2.0/mocha.css');
mochaCss.setAttribute('rel', 'stylesheet');
document.head.appendChild(mochaCss);


/**
 * Begin by discovering all of the test methods, test methods are any
 * function on the window object that begins with the prefix `test`
 */
var allMethods = Object.getOwnPropertyNames(window);
var allTests = [];
for (var i = 0, method; i < allMethods.length, method = allMethods[i]; i++) {
  if (method.indexOf('test') === 0 && method !== 'test' &&
    typeof window[method] === 'function') {
    allTests.push(method);
  }
}


/**
 * Split test methods into various suites by grouping them based on the
 * test name. Tests the begin with the same prefix are grouped together
 * into a suite.
 */
var suites = {};
for (var i = 0, method; i < allTests.length, method = allTests[i]; i++) {
  var testName = method.substr(5);
  var underscore = testName.indexOf('_');
  var suiteName = underscore > -1 ? testName.substr(0, underscore) : 'test';
  if (!suites.hasOwnProperty(suiteName)) {
    suites[suiteName] = [];
  }
  suites[suiteName].push(method);
}


/**
 * Setup chai fail method
 */
function fail() {
  chai.fail();
}


/**
 * Wrap all unit tests into mocha test cases. Slot them into the different
 * suite groups that we found.
 */
suite('jsunit tests', function() {
  for (var i = 0, suiteKeys = Object.keys(suites), suiteName;
    i < suiteKeys.length, suiteName = suiteKeys[i]; i++) {
    suite(suiteName, function() {
      for (var j = 0, tests = suites[suiteName], method;
        j < tests.length, method = tests[j]; j++) {
        test(method, function() {
          window[this.test.title]();
        });
      }
    });
  }
});


/**
 * Create a div for failure results, and run the mocha tests.
 */
var failureDiv = document.createElement('div');
failureDiv.id = 'failureCount';
failureDiv.style = 'display:none';
failureDiv.setAttribute('tests_failed', 'unset');
document.body.appendChild(failureDiv);
mocha.run(function(failures) {
  failureDiv.setAttribute('tests_failed', failures);
});
