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

goog.module('goog.testing.MultiTestRunnerTest');
goog.setTestOnly('goog.testing.MultiTestRunnerTest');

var Promise = goog.require('goog.Promise');
var events = goog.require('goog.events');
var MockControl = goog.require('goog.testing.MockControl');
var MultiTestRunner = goog.require('goog.testing.MultiTestRunner');
var PropertyReplacer = goog.require('goog.testing.PropertyReplacer');
var TestCase = goog.require('goog.testing.TestCase');
var jsunit = goog.require('goog.testing.jsunit');
var testSuite = goog.require('goog.testing.testSuite');

var ALL_TESTS = [
  'testdata/fake_passing_test.html', 'testdata/fake_failing_test.html',
  'testdata/fake_failing_test2.html'
];
var EMPTY_TEST = 'testdata/fake_failing_test3.html';
var SKIPPED_TEST = 'testdata/fake_failing_test4.html';

var testRunner;
var mocks = new MockControl();
var stubs = new PropertyReplacer();


/**
 * Asserts string matches exactly one item in the given array. Useful for
 * matching elements in an array without guaranteed ordering.
 * @param {string} string String to match in the array.
 * @param {!Array<string>} array Array of strings find match.
 */
function assertArrayContainsString(string, array) {
  var matcher = function(item) { return string == item; };
  assertArrayContainsMatcher(matcher, array);
}


/**
 * Asserts at least one item in array causes matcher to return true. Used by
 * more specific assertion methods and not meant to be used directly.
 * @param {function(string):boolean} matcher Function called for each item in
 *     array. Should return true when match is found.
 * @param {!Array<string>} array Array of strings find match.
 */
function assertArrayContainsMatcher(matcher, array) {
  var matching = 0;
  for (var i = 0; i < array.length; i++) {
    if (matcher(array[i])) {
      matching++;
    }
  }
  assertEquals(
      'Matched ' + matching + ' items in array, but should be 1', 1, matching);
}


/**
 * Returns promise that resolves when eventType is dispatched from target.
 * @param {!EventTarget|!goog.events.Listenable} target Target to listen for
 *     event on.
 * @param {string} eventType Type of event.
 * @return {!Promise} Promise that resolves with triggered event.
 */
function createEventPromise(target, eventType) {
  return new Promise(function(resolve, reject) {
    events.listen(target, eventType, resolve);
  });
}


/**
 * @typedef {{
 *   failureReports: !Array<string>,
 *   testNames: !Array<string>
 * }}
 */
var TestResults;


/**
 * Processes the test results returned from MultiTestRunner and creates a
 * consolidated test result object.
 * @param {!Array<!Object<string,!Array<string>>>} testResults The list of
 *     individual test results from MultiTestRunner.
 * @return {!TestResults} Consolidated test results for all individual tests.
 */
function processTestResults(testResults) {
  var failureReports = [];
  var testNames = [];

  for (var i = 0; i < testResults.length; i++) {
    for (var testName in testResults[i]) {
      testNames.push(testName);
      failureReports = failureReports.concat(testResults[i][testName]);
    }
  }

  return {failureReports: failureReports, testNames: testNames};
}

testSuite({
  setUpPage: function() {
    TestCase.getActiveTestCase().promiseTimeout = 20000;
  },

  setUp: function() {
    testRunner = new MultiTestRunner().setPoolSize(3).addTests(ALL_TESTS);
  },

  tearDown: function() {
    testRunner.dispose();
    mocks.$tearDown();
    stubs.reset();
  },

  testStartButtonStartsTests: function() {
    testRunner.createDom();
    testRunner.render(document.getElementById('runner'));
    var el = testRunner.getElement();
    var startButton = el.querySelectorAll('button')[0];
    assertEquals('Start', startButton.innerHTML);
    var mockStart = mocks.createMethodMock(MultiTestRunner.prototype, 'start');

    mockStart();

    mocks.$replayAll();
    goog.testing.events.fireClickSequence(startButton);
    mocks.$verifyAll();
  },

  testStopButtonStopsTests: function() {
    var promise = createEventPromise(testRunner, 'testsFinished');
    testRunner.createDom();
    testRunner.render(document.getElementById('runner'));
    var el = testRunner.getElement();
    var startButton = el.querySelectorAll('button')[0];
    var stopButton = el.querySelectorAll('button')[1];
    assertEquals('Stop', stopButton.innerHTML);
    stubs.replace(
        goog.testing.MultiTestRunner.TestFrame.prototype, 'runTest',
        function() { return; });

    goog.testing.events.fireClickSequence(startButton);
    goog.testing.events.fireClickSequence(stopButton);
    return promise.then(function(results) {
      // Tests should be halted and marked as "unfinished".
      assertContains(
          'These tests did not finish:\n' +
              'testdata/fake_passing_test.html\n' +
              'testdata/fake_failing_test.html\n' +
              'testdata/fake_failing_test2.html',
          el.innerHTML);
    });
  },

  testDisposeInternal: function() {
    testRunner.dispose();

    assertTrue(testRunner.tableSorter_.isDisposed());
    assertTrue(testRunner.eh_.isDisposed());
    assertNull(testRunner.startButtonEl_);
    assertNull(testRunner.stopButtonEl_);
    assertNull(testRunner.logEl_);
    assertNull(testRunner.reportEl_);
    assertNull(testRunner.progressEl_);
    assertNull(testRunner.logTabEl_);
    assertNull(testRunner.reportTabEl_);
    assertNull(testRunner.statsTabEl_);
    assertNull(testRunner.statsEl_);
  },

  testRunsTestsAndReportsResults: function() {
    var promise = createEventPromise(testRunner, 'testsFinished');

    testRunner.render(document.getElementById('runner'));
    testRunner.start();

    return promise.then(function(results) {
      var testResults = processTestResults(results['allTestResults']);
      var testNames = testResults.testNames;
      assertEquals(3, testNames.length);
      assertArrayContainsString(
          'testdata/fake_failing_test2:testFail', testNames);
      assertArrayContainsString(
          'testdata/fake_failing_test:testFail', testNames);
      assertArrayContainsString(
          'testdata/fake_passing_test:testPass', testNames);
      var failureReports = testResults.failureReports;
      var failedTests = testRunner.getTestsThatFailed();
      assertEquals(2, failureReports.length);
      assertEquals(2, failedTests.length);
      assertArrayContainsString('testdata/fake_failing_test.html', failedTests);
      assertArrayContainsString(
          'testdata/fake_failing_test2.html', failedTests);
    });
  },

  testMissingTestResultsIsAFailure: function() {
    var promise = createEventPromise(testRunner, 'testsFinished');

    testRunner.addTests(EMPTY_TEST);
    testRunner.render(document.getElementById('runner'));
    testRunner.start();

    return promise.then(function(results) {
      var testResults = processTestResults(results['allTestResults']);
      var testNames = testResults.testNames;
      assertEquals(4, testNames.length);
      assertArrayContainsString('testdata/fake_failing_test3', testNames);
      var failureReports = testResults.failureReports;
      var failedTests = testRunner.getTestsThatFailed();
      assertEquals(3, failureReports.length);
      assertEquals(3, failedTests.length);
      assertArrayContainsString(
          'testdata/fake_failing_test3.html', failedTests);
    });
  },

  testShouldRunTestsFalseIsSuccess: function() {
    var promise = createEventPromise(testRunner, 'testsFinished');

    testRunner.addTests(SKIPPED_TEST);
    testRunner.render(document.getElementById('runner'));
    testRunner.start();

    return promise.then(function(results) {
      var testResults = processTestResults(results['allTestResults']);
      var testNames = testResults.testNames;
      assertEquals(4, testNames.length);
      assertArrayContainsString('testdata/fake_failing_test4', testNames);
      var failureReports = testResults.failureReports;
      var failedTests = testRunner.getTestsThatFailed();
      // Test should pass even though its test method is a failure.
      assertNotContains('testdata/fake_failing_test4', failedTests);
    });
  },

  testRunTestsWithEmptyTestList: function() {
    var testRunner = new MultiTestRunner().setPoolSize(3).addTests([]);
    var promise = createEventPromise(testRunner, 'testsFinished');

    testRunner.render(document.getElementById('runner'));
    testRunner.start();

    return promise.then(function(results) {
      var allTestResults = results['allTestResults'];
      assertEquals(0, allTestResults.length);
      var failureReports = processTestResults(allTestResults).failureReports;
      assertEquals(0, failureReports.length);
      assertEquals(0, testRunner.getTestsThatFailed().length);
      testRunner.dispose();
    });
  },

  testFilterFunctionFiltersTest: function() {
    var promise = createEventPromise(testRunner, 'testsFinished');

    testRunner.render(document.getElementById('runner'));
    testRunner.setFilterFunction(function(test) {
      return test.indexOf('fake_failing_test2') != -1;
    });
    testRunner.start();

    return promise.then(function(results) {
      var allTestResults = results['allTestResults'];
      assertEquals(1, allTestResults.length);
      var failureReports = processTestResults(allTestResults).failureReports;
      var failedTests = testRunner.getTestsThatFailed();
      assertEquals(1, failureReports.length);
      assertEquals(1, failedTests.length);
      assertArrayContainsString(
          'testdata/fake_failing_test2.html', failedTests);
    });
  },

  testTimeoutFailsAfterTimeout: function() {
    var promise = createEventPromise(testRunner, 'testsFinished');

    testRunner.render(document.getElementById('runner'));
    testRunner.setTimeout(0);
    testRunner.start();

    return promise.then(function(results) {
      var testResults = processTestResults(results['allTestResults']);
      var testNames = testResults.testNames;
      assertEquals(3, testNames.length);
      // Only the filename should be the test name for timeouts.
      assertArrayContainsString('testdata/fake_failing_test2', testNames);
      assertArrayContainsString('testdata/fake_failing_test', testNames);
      assertArrayContainsString('testdata/fake_passing_test', testNames);
      var failureReports = testResults.failureReports;
      var failedTests = testRunner.getTestsThatFailed();
      assertEquals(3, failureReports.length);
      assertEquals(3, failedTests.length);
      assertContains('timed out', failureReports[0]);
      assertContains('timed out', failureReports[1]);
      assertContains('timed out', failureReports[2]);
      assertArrayContainsString('testdata/fake_passing_test.html', failedTests);
      assertArrayContainsString('testdata/fake_failing_test.html', failedTests);
      assertArrayContainsString(
          'testdata/fake_failing_test2.html', failedTests);
    });
  },

  testRunsAllTestsWhenPoolSizeSmallerThanTotalTests: function() {
    var promise = createEventPromise(testRunner, 'testsFinished');

    testRunner.render(document.getElementById('runner'));
    // There are 3 tests, it should load and run the 3 serially without failing.
    testRunner.setPoolSize(1);
    testRunner.start();

    return promise.then(function(results) {
      assertEquals(3, results['allTestResults'].length);
      var testResults = processTestResults(results['allTestResults']);
      var testNames = testResults.testNames;
      assertEquals(3, testNames.length);
      assertArrayContainsString(
          'testdata/fake_failing_test2:testFail', testNames);
      assertArrayContainsString(
          'testdata/fake_failing_test:testFail', testNames);
      assertArrayContainsString(
          'testdata/fake_passing_test:testPass', testNames);
      var failureReports = testResults.failureReports;
      var failedTests = testRunner.getTestsThatFailed();
      assertEquals(2, failureReports.length);
      assertEquals(2, failedTests.length);
      assertArrayContainsString('testdata/fake_failing_test.html', failedTests);
      assertArrayContainsString(
          'testdata/fake_failing_test2.html', failedTests);
    });
  },

  testFrameGetStats: function() {
    var frame = new MultiTestRunner.TestFrame('/', 2000, false);
    frame.testFile_ = 'foo';
    frame.isSuccess_ = true;
    frame.runTime_ = 42;
    frame.totalTime_ = 9000;
    frame.numFilesLoaded_ = 4;

    assertObjectEquals(
        {
          'testFile': 'foo',
          'success': true,
          'runTime': 42,
          'totalTime': 9000,
          'numFilesLoaded': 4
        },
        frame.getStats());
  },

  testFrameDisposeInternal: function() {
    var frame = new MultiTestRunner.TestFrame('', 2000, false);
    frame.createDom();
    frame.render();
    stubs.replace(frame, 'checkForCompletion_', function() { return; });
    frame.runTest(ALL_TESTS[0]);
    assertEquals(
        1, frame.getDomHelper().getElementsByTagNameAndClass('iframe').length);
    frame.dispose();
    assertTrue(frame.eh_.isDisposed());
    assertEquals(
        0, frame.getDomHelper().getElementsByTagNameAndClass('iframe').length);
    assertNull(frame.iframeEl_);
  }
});
