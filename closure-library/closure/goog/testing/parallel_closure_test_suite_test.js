// Copyright 2015 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS-IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.module('goog.testing.parallelClosureTestSuiteTest');
goog.setTestOnly('goog.testing.parallelClosureTestSuiteTest');

var ArgumentMatcher = goog.require('goog.testing.mockmatchers.ArgumentMatcher');
var MockControl = goog.require('goog.testing.MockControl');
var MultiTestRunner = goog.require('goog.testing.MultiTestRunner');
var PropertyReplacer = goog.require('goog.testing.PropertyReplacer');
var TestCase = goog.require('goog.testing.TestCase');
var jsunit = goog.require('goog.testing.jsunit');
var mockmatchers = goog.require('goog.testing.mockmatchers');
var parallelClosureTestSuite = goog.require('goog.testing.parallelClosureTestSuite');
var testSuite = goog.require('goog.testing.testSuite');

var mocks = new MockControl();
var stubs = new PropertyReplacer();

function setTestRunnerGlobals(
    testTimeout, allTests, parallelFrames, parallelTimeout) {
  var tr = goog.global['G_parallelTestRunner'] = {};
  tr['testTimeout'] = testTimeout;
  tr['allTests'] = allTests;
  tr['parallelFrames'] = parallelFrames;
  tr['parallelTimeout'] = parallelTimeout;
}

testSuite({
  tearDown: function() {
    goog.global['G_parallelTestRunner'] = undefined;
    mocks.$tearDown();
    stubs.reset();
  },

  testProcessAllTestResultsEmptyResults: function() {
    var testResults = [];
    var allResults =
        parallelClosureTestSuite.processAllTestResults(testResults);
    assertEquals(0, allResults.totalTests);
    assertEquals(0, allResults.totalFailures);
    assertEquals('', allResults.failureReports);
    assertObjectEquals({}, allResults.allResults);
  },

  testProcessAllTestResultsNoFailures: function() {
    var testResults = [{'testA': []}, {'testB': []}];
    var allResults =
        parallelClosureTestSuite.processAllTestResults(testResults);
    assertEquals(2, allResults.totalTests);
    assertEquals(0, allResults.totalFailures);
    assertEquals('', allResults.failureReports);
    assertObjectEquals({'testA': [], 'testB': []}, allResults.allResults);
  },

  testProcessAllTestResultsWithFailures: function() {
    var testResults = [{'testA': []}, {'testB': ['testB Failed!']}];
    var allResults =
        parallelClosureTestSuite.processAllTestResults(testResults);
    assertEquals(2, allResults.totalTests);
    assertEquals(1, allResults.totalFailures);
    assertEquals('testB Failed!\n', allResults.failureReports);
    assertObjectEquals(
        {'testA': [], 'testB': ['testB Failed!']}, allResults.allResults);

    var testResults =
        [{'testA': ['testA Failed!']}, {'testB': ['testB Failed!']}];
    var allResults =
        parallelClosureTestSuite.processAllTestResults(testResults);
    assertEquals(2, allResults.totalTests);
    assertEquals(2, allResults.totalFailures);
    assertContains('testB Failed!\n', allResults.failureReports);
    assertContains('testA Failed!\n', allResults.failureReports);
    assertObjectEquals(
        {'testA': ['testA Failed!'], 'testB': ['testB Failed!']},
        allResults.allResults);
  },

  testSetUpPageTestRunnerInitializedProperly: function() {
    setTestRunnerGlobals(100, ['foo.html'], 8, 360);
    var mockRender =
        mocks.createMethodMock(MultiTestRunner.prototype, 'render');
    var elementMatcher = new ArgumentMatcher(function(container) {
      return goog.dom.isElement(container);
    });
    var testCaseObj = {promiseTimeout: -1};
    stubs.set(
        TestCase, 'getActiveTestCase', function() { return testCaseObj; });

    mockRender(elementMatcher);

    mocks.$replayAll();

    var testRunner = parallelClosureTestSuite.setUpPage();
    assertArrayEquals(['foo.html'], testRunner.getAllTests());
    assertEquals(8, testRunner.getPoolSize());
    assertEquals(100000, testRunner.getTimeout());
    assertEquals(360000, testCaseObj.promiseTimeout);
    mocks.$verifyAll();
    testRunner.dispose();
  },

  testRunAllTestsFailures: function() {
    setTestRunnerGlobals(100, ['foo.html', 'bar.html'], 8, 360);
    var mockStart = mocks.createMethodMock(MultiTestRunner.prototype, 'start');
    var mockFail = mocks.createMethodMock(goog.global, 'fail');
    var failureMatcher = new ArgumentMatcher(function(failMsg) {
      return /testA Failed!/.test(failMsg) &&
          /1 of 2 test\(s\) failed/.test(failMsg);
    });
    // Don't want this test case's timeout overwritten, so set a stub for
    // getActiveTestCase.
    stubs.set(
        TestCase, 'getActiveTestCase', function() { return {timeout: 100}; });

    mockStart();
    fail(failureMatcher);

    mocks.$replayAll();

    var testRunner = parallelClosureTestSuite.setUpPage();
    var testPromise = parallelClosureTestSuite.testRunAllTests();
    testRunner.dispatchEvent({
      'type': goog.testing.MultiTestRunner.TESTS_FINISHED,
      'allTestResults': [{'testA': ['testA Failed!']}, {'testB': []}]
    });

    return testPromise.then(function() {
      mocks.$verifyAll();
      testRunner.dispose();
    });
  },

  testRunAllTestsSuccess: function() {
    setTestRunnerGlobals(100, ['foo.html', 'bar.html'], 8, 360);
    var mockStart = mocks.createMethodMock(MultiTestRunner.prototype, 'start');
    var mockFail = mocks.createMethodMock(goog.global, 'fail');
    var failureMatcher = new ArgumentMatcher(function(failMsg) {
      return /testA Failed!/.test(failMsg) &&
          /1 of 2 test\(s\) failed/.test(failMsg);
    });
    // Don't want this test case's timeout overwritten, so set a stub for
    // getActiveTestCase.
    stubs.set(
        TestCase, 'getActiveTestCase', function() { return {timeout: 100}; });

    mockStart();
    fail(mockmatchers.ignoreArgument).$times(0);

    mocks.$replayAll();

    var testRunner = parallelClosureTestSuite.setUpPage();
    var testPromise = parallelClosureTestSuite.testRunAllTests();
    testRunner.dispatchEvent({
      'type': goog.testing.MultiTestRunner.TESTS_FINISHED,
      'allTestResults': [{'testA': []}, {'testB': []}]
    });

    return testPromise.then(function() {
      mocks.$verifyAll();
      testRunner.dispose();
    });
  }
});
