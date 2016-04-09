// Copyright 2014 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('goog.testing.TestCaseTest');
goog.setTestOnly('goog.testing.TestCaseTest');

goog.require('goog.Promise');
goog.require('goog.functions');
goog.require('goog.string');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.JsUnitException');
goog.require('goog.testing.MethodMock');
goog.require('goog.testing.MockRandom');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.mockmatchers.ObjectEquals');


// Dual of fail().
var ok = function() {
  assertTrue(true);
};

// Native Promise-based equivalent of ok().
var okPromise = function() {
  return Promise.resolve(null);
};

// Native Promise-based equivalent of fail().
var failPromise = function() {
  return Promise.reject(null);
};

// Native Promise-based test that returns promise which never resolves.
var neverResolvedPromise = function() {
  return new Promise(function() {});
};

// goog.Promise-based equivalent of ok().
var okGoogPromise = function() {
  return goog.Promise.resolve(null);
};

// goog.Promise-based equivalent of fail().
var failGoogPromise = function() {
  return goog.Promise.reject(null);
};

// Native Promise-based test that returns promise which never resolves.
var neverResolvedGoogPromise = function() {
  return new goog.Promise(function() {});
};

function setUp() {
  // TODO(b/25875505): Fix unreported assertions (go/failonunreportedasserts).
  goog.testing.TestCase.getActiveTestCase().failOnUnreportedAsserts = false;
}

function testEmptyTestCase() {
  var testCase = new goog.testing.TestCase();
  testCase.runTests();
  assertTrue(testCase.isSuccess());
  var result = testCase.getResult();
  assertTrue(result.complete);
  assertEquals(0, result.totalCount);
  assertEquals(0, result.runCount);
  assertEquals(0, result.successCount);
  assertEquals(0, result.errors.length);
}

function testEmptyTestCaseReturningPromise() {
  return new goog.testing.TestCase().runTestsReturningPromise().then(
      function(result) {
        assertTrue(result.complete);
        assertEquals(0, result.totalCount);
        assertEquals(0, result.runCount);
        assertEquals(0, result.successCount);
        assertEquals(0, result.errors.length);
      });
}

function testTestCase_SyncSuccess() {
  var testCase = new goog.testing.TestCase();
  testCase.addNewTest('foo', ok);
  testCase.runTests();
  assertTrue(testCase.isSuccess());
  var result = testCase.getResult();
  assertTrue(result.complete);
  assertEquals(1, result.totalCount);
  assertEquals(1, result.runCount);
  assertEquals(1, result.successCount);
  assertEquals(0, result.errors.length);
}

function testTestCaseReturningPromise_SyncSuccess() {
  var testCase = new goog.testing.TestCase();
  testCase.addNewTest('foo', ok);
  return testCase.runTestsReturningPromise().then(function(result) {
    assertTrue(result.complete);
    assertEquals(1, result.totalCount);
    assertEquals(1, result.runCount);
    assertEquals(1, result.successCount);
    assertEquals(0, result.errors.length);
  });
}

function testTestCaseReturningPromise_GoogPromiseResolve() {
  var testCase = new goog.testing.TestCase();
  testCase.addNewTest('foo', okGoogPromise);
  return testCase.runTestsReturningPromise().then(function(result) {
    assertTrue(result.complete);
    assertEquals(1, result.totalCount);
    assertEquals(1, result.runCount);
    assertEquals(1, result.successCount);
    assertEquals(0, result.errors.length);
  });
}

function testTestCaseReturningPromise_PromiseResolve() {
  if (!('Promise' in goog.global)) {
    return;
  }
  var testCase = new goog.testing.TestCase();
  testCase.addNewTest('foo', okPromise);
  return testCase.runTestsReturningPromise().then(function(result) {
    assertTrue(result.complete);
    assertEquals(1, result.totalCount);
    assertEquals(1, result.runCount);
    assertEquals(1, result.successCount);
    assertEquals(0, result.errors.length);
  });
}

function testTestCase_SyncFailure() {
  var testCase = new goog.testing.TestCase();
  testCase.addNewTest('foo', fail);
  testCase.runTests();
  assertFalse(testCase.isSuccess());
  var result = testCase.getResult();
  assertTrue(result.complete);
  assertEquals(1, result.totalCount);
  assertEquals(1, result.runCount);
  assertEquals(0, result.successCount);
  assertEquals(1, result.errors.length);
  assertEquals('foo', result.errors[0].source);
}

function testTestCaseReturningPromise_SyncFailure() {
  var testCase = new goog.testing.TestCase();
  testCase.addNewTest('foo', fail);
  return testCase.runTestsReturningPromise().then(function(result) {
    assertFalse(testCase.isSuccess());
    assertTrue(result.complete);
    assertEquals(1, result.totalCount);
    assertEquals(1, result.runCount);
    assertEquals(0, result.successCount);
    assertEquals(1, result.errors.length);
    assertEquals('foo', result.errors[0].source);
  });
}

function testTestCaseReturningPromise_GoogPromiseReject() {
  var testCase = new goog.testing.TestCase();
  testCase.addNewTest('foo', failGoogPromise);
  return testCase.runTestsReturningPromise().then(function(result) {
    assertFalse(testCase.isSuccess());
    assertTrue(result.complete);
    assertEquals(1, result.totalCount);
    assertEquals(1, result.runCount);
    assertEquals(0, result.successCount);
    assertEquals(1, result.errors.length);
    assertEquals('foo', result.errors[0].source);
  });
}

function testTestCaseReturningPromise_GoogPromiseTimeout() {
  var testCase = new goog.testing.TestCase();
  testCase.addNewTest('foo', neverResolvedGoogPromise);
  var startTimestamp = new Date().getTime();
  // We have to decrease timeout for the artificial 'foo' test otherwise current
  // test will timeout.
  testCase.promiseTimeout = 500;
  startTimestamp = new Date().getTime();
  return testCase.runTestsReturningPromise().then(function(result) {
    var elapsedTime = new Date().getTime() - startTimestamp;
    assertFalse(testCase.isSuccess());
    assertTrue(result.complete);
    assertEquals(1, result.totalCount);
    assertEquals(1, result.runCount);
    assertEquals(0, result.successCount);
    assertEquals(1, result.errors.length);
    // Check that error message mentions test name.
    assertTrue(goog.string.contains(result.errors[0].message, 'foo'));
    // Check that error message mentions how to change timeout.
    assertTrue(
        goog.string.contains(
            result.errors[0].message,
            'goog.testing.TestCase.getActiveTestCase().promiseTimeout'));
    assertTrue(
        elapsedTime >= testCase.promiseTimeout - 100 &&
        elapsedTime <= testCase.promiseTimeout + 100);
  });
}

function testTestCaseReturningPromise_PromiseReject() {
  if (!('Promise' in goog.global)) {
    return;
  }
  var testCase = new goog.testing.TestCase();
  testCase.addNewTest('foo', failPromise);
  return testCase.runTestsReturningPromise().then(function(result) {
    assertFalse(testCase.isSuccess());
    assertTrue(result.complete);
    assertEquals(1, result.totalCount);
    assertEquals(1, result.runCount);
    assertEquals(0, result.successCount);
    assertEquals(1, result.errors.length);
    assertEquals('foo', result.errors[0].source);
  });
}

function testTestCaseReturningPromise_PromiseTimeout() {
  if (!('Promise' in goog.global)) {
    return;
  }
  var testCase = new goog.testing.TestCase();
  testCase.addNewTest('foo', neverResolvedPromise);
  // We have to decrease timeout for the artificial 'foo' test otherwise current
  // test will timeout.
  testCase.promiseTimeout = 500;
  var startTimestamp = new Date().getTime();
  return testCase.runTestsReturningPromise().then(function(result) {
    var elapsedTime = new Date().getTime() - startTimestamp;
    assertFalse(testCase.isSuccess());
    assertTrue(result.complete);
    assertEquals(1, result.totalCount);
    assertEquals(1, result.runCount);
    assertEquals(0, result.successCount);
    assertEquals(1, result.errors.length);
    // Check that error message mentions test name.
    assertTrue(goog.string.contains(result.errors[0].message, 'foo'));
    // Check that error message mentions how to change timeout.
    assertTrue(
        goog.string.contains(
            result.errors[0].message,
            'goog.testing.TestCase.getActiveTestCase().promiseTimeout'));
    assertTrue(
        elapsedTime >= testCase.promiseTimeout - 100 &&
        elapsedTime <= testCase.promiseTimeout + 100);
  });
}

function testTestCase_SyncSuccess_SyncFailure() {
  var testCase = new goog.testing.TestCase();
  testCase.addNewTest('foo', ok);
  testCase.addNewTest('bar', fail);
  testCase.runTests();
  assertFalse(testCase.isSuccess());
  var result = testCase.getResult();
  assertTrue(result.complete);
  assertEquals(2, result.totalCount);
  assertEquals(2, result.runCount);
  assertEquals(1, result.successCount);
  assertEquals(1, result.errors.length);
  assertEquals('bar', result.errors[0].source);
}

function testTestCaseReturningPromise_SyncSuccess_SyncFailure() {
  var testCase = new goog.testing.TestCase();
  testCase.addNewTest('foo', ok);
  testCase.addNewTest('bar', fail);
  return testCase.runTestsReturningPromise().then(function(result) {
    assertTrue(result.complete);
    assertEquals(2, result.totalCount);
    assertEquals(2, result.runCount);
    assertEquals(1, result.successCount);
    assertEquals(1, result.errors.length);
    assertEquals('bar', result.errors[0].source);
  });
}

function testTestCaseReturningPromise_GoogPromiseResolve_GoogPromiseReject() {
  var testCase = new goog.testing.TestCase();
  testCase.addNewTest('foo', okGoogPromise);
  testCase.addNewTest('bar', failGoogPromise);
  return testCase.runTestsReturningPromise().then(function(result) {
    assertTrue(result.complete);
    assertEquals(2, result.totalCount);
    assertEquals(2, result.runCount);
    assertEquals(1, result.successCount);
    assertEquals(1, result.errors.length);
    assertEquals('bar', result.errors[0].source);
  });
}

function testTestCaseReturningPromise_PromiseResolve_PromiseReject() {
  if (!('Promise' in goog.global)) {
    return;
  }
  var testCase = new goog.testing.TestCase();
  testCase.addNewTest('foo', okPromise);
  testCase.addNewTest('bar', failPromise);
  return testCase.runTestsReturningPromise().then(function(result) {
    assertTrue(result.complete);
    assertEquals(2, result.totalCount);
    assertEquals(2, result.runCount);
    assertEquals(1, result.successCount);
    assertEquals(1, result.errors.length);
    assertEquals('bar', result.errors[0].source);
  });
}

function testTestCaseReturningPromise_PromiseResolve_GoogPromiseReject() {
  if (!('Promise' in goog.global)) {
    return;
  }
  var testCase = new goog.testing.TestCase();
  testCase.addNewTest('foo', okPromise);
  testCase.addNewTest('bar', failGoogPromise);
  return testCase.runTestsReturningPromise().then(function(result) {
    assertTrue(result.complete);
    assertEquals(2, result.totalCount);
    assertEquals(2, result.runCount);
    assertEquals(1, result.successCount);
    assertEquals(1, result.errors.length);
    assertEquals('bar', result.errors[0].source);
  });
}

function testTestCaseReturningPromise_GoogPromiseResolve_PromiseReject() {
  if (!('Promise' in goog.global)) {
    return;
  }
  var testCase = new goog.testing.TestCase();
  testCase.addNewTest('foo', okGoogPromise);
  testCase.addNewTest('bar', failPromise);
  return testCase.runTestsReturningPromise().then(function(result) {
    assertTrue(result.complete);
    assertEquals(2, result.totalCount);
    assertEquals(2, result.runCount);
    assertEquals(1, result.successCount);
    assertEquals(1, result.errors.length);
    assertEquals('bar', result.errors[0].source);
  });
}

function testTestCaseNeverRun() {
  var testCase = new goog.testing.TestCase();
  testCase.addNewTest('foo', fail);
  // Missing testCase.runTests()
  var result = testCase.getResult();
  assertFalse(result.complete);
  assertEquals(0, result.totalCount);
  assertEquals(0, result.runCount);
  assertEquals(0, result.successCount);
  assertEquals(0, result.errors.length);
}

function testParseOrder() {
  assertNull(goog.testing.TestCase.parseOrder_(''));
  assertNull(goog.testing.TestCase.parseOrder_('?order=invalid'));
  assertEquals('natural', goog.testing.TestCase.parseOrder_('?order=natural'));
  assertEquals('sorted', goog.testing.TestCase.parseOrder_('?a&order=sorted'));
  assertEquals('random', goog.testing.TestCase.parseOrder_('?b&order=random'));
  assertEquals('random', goog.testing.TestCase.parseOrder_('?ORDER=RANDOM'));
}

function testParseRunTests() {
  assertNull(goog.testing.TestCase.parseRunTests_(''));
  assertNull(goog.testing.TestCase.parseRunTests_('?runTests='));
  assertObjectEquals(
      {'testOne': true},
      goog.testing.TestCase.parseRunTests_('?runTests=testOne'));
  assertObjectEquals(
      {'testOne': true, 'testTwo': true},
      goog.testing.TestCase.parseRunTests_(
          '?foo=bar&runTests=testOne,testTwo'));
  assertObjectEquals(
      {
        '1': true,
        '2': true,
        '3': true,
        'testShouting': true,
        'TESTSHOUTING': true
      },
      goog.testing.TestCase.parseRunTests_(
          '?RUNTESTS=testShouting,TESTSHOUTING,1,2,3'));
}

function testSortOrder_natural() {
  var testCase = new goog.testing.TestCase();
  testCase.setOrder('natural');

  var testIndex = 0;
  testCase.addNewTest('test_c', function() { assertEquals(0, testIndex++); });
  testCase.addNewTest('test_a', function() { assertEquals(1, testIndex++); });
  testCase.addNewTest('test_b', function() { assertEquals(2, testIndex++); });
  testCase.orderTests_();
  testCase.runTests();

  assertTrue(testCase.isSuccess());
  var result = testCase.getResult();
  assertEquals(3, result.totalCount);
  assertEquals(3, result.runCount);
  assertEquals(3, result.successCount);
  assertEquals(0, result.errors.length);
}

function testSortOrder_random() {
  var testCase = new goog.testing.TestCase();
  testCase.setOrder('random');

  var testIndex = 0;
  testCase.addNewTest('test_c', function() { assertEquals(0, testIndex++); });
  testCase.addNewTest('test_a', function() { assertEquals(2, testIndex++); });
  testCase.addNewTest('test_b', function() { assertEquals(1, testIndex++); });

  var mockRandom = new goog.testing.MockRandom([0.5, 0.5]);
  mockRandom.install();
  try {
    testCase.orderTests_();
  } finally {
    // Avoid using a global tearDown() for cleanup, since all TestCase instances
    // auto-detect and share the global life cycle functions.
    mockRandom.uninstall();
  }

  testCase.runTests();

  assertTrue(testCase.isSuccess());
  var result = testCase.getResult();
  assertEquals(3, result.totalCount);
  assertEquals(3, result.runCount);
  assertEquals(3, result.successCount);
  assertEquals(0, result.errors.length);
}

function testSortOrder_sorted() {
  var testCase = new goog.testing.TestCase();
  testCase.setOrder('sorted');

  var testIndex = 0;
  testCase.addNewTest('test_c', function() { assertEquals(2, testIndex++); });
  testCase.addNewTest('test_a', function() { assertEquals(0, testIndex++); });
  testCase.addNewTest('test_b', function() { assertEquals(1, testIndex++); });
  testCase.orderTests_();
  testCase.runTests();

  assertTrue(testCase.isSuccess());
  var result = testCase.getResult();
  assertEquals(3, result.totalCount);
  assertEquals(3, result.runCount);
  assertEquals(3, result.successCount);
  assertEquals(0, result.errors.length);
}

function testRunTests() {
  var testCase = new goog.testing.TestCase();
  testCase.setTestsToRun({'test_a': true, 'test_c': true});

  var testIndex = 0;
  testCase.addNewTest('test_c', function() { assertEquals(0, testIndex++); });
  testCase.addNewTest('test_a', function() { assertEquals(1, testIndex++); });
  testCase.addNewTest('test_b', fail);
  testCase.runTests();

  assertTrue(testCase.isSuccess());
  var result = testCase.getResult();
  assertEquals(3, result.totalCount);
  assertEquals(2, result.runCount);
  assertEquals(2, result.successCount);
  assertEquals(0, result.errors.length);
}

function testRunTests_byIndex() {
  var testCase = new goog.testing.TestCase();
  testCase.setTestsToRun({'0': true, '2': true});

  var testIndex = 0;
  testCase.addNewTest('test_c', function() { assertEquals(0, testIndex++); });
  testCase.addNewTest('test_a', fail);
  testCase.addNewTest('test_b', function() { assertEquals(1, testIndex++); });
  testCase.runTests();

  assertTrue(testCase.isSuccess());
  var result = testCase.getResult();
  assertEquals(3, result.totalCount);
  assertEquals(2, result.runCount);
  assertEquals(2, result.successCount);
  assertEquals(0, result.errors.length);
}

function testMaybeFailTestEarly() {
  var message = 'Error in setUpPage().';
  var testCase = new goog.testing.TestCase();
  testCase.setUpPage = function() { throw Error(message); };
  testCase.addNewTest('test', ok);
  testCase.runTests();
  assertFalse(testCase.isSuccess());
  var errors = testCase.getResult().errors;
  assertEquals(1, errors.length);
  assertEquals(message, errors[0].message);
}

function testSetUpReturnsPromiseThatTimesOut() {
  var testCase = new goog.testing.TestCase();
  testCase.promiseTimeout = 500;
  testCase.setUp = neverResolvedGoogPromise;
  testCase.addNewTest('test', ok);
  return testCase.runTestsReturningPromise().then(function(result) {
    assertFalse(testCase.isSuccess());
    assertTrue(result.complete);
    assertEquals(1, result.errors.length);
    assertTrue(goog.string.contains(result.errors[0].message, 'setUp'));
  });
}

function testTearDownReturnsPromiseThatTimesOut() {
  var testCase = new goog.testing.TestCase();
  testCase.promiseTimeout = 500;
  testCase.tearDown = neverResolvedGoogPromise;
  testCase.addNewTest('test', ok);
  return testCase.runTestsReturningPromise().then(function(result) {
    assertFalse(testCase.isSuccess());
    assertTrue(result.complete);
    assertEquals(1, result.errors.length);
    assertTrue(goog.string.contains(result.errors[0].message, 'tearDown'));
  });
}

function testFailOnUnreportedAsserts_EnabledByDefault() {
  assertTrue(new goog.testing.TestCase().failOnUnreportedAsserts);
}


/**
 * Verifies that:
 * <ol>
 * <li>when the {@code failOnUnreportedAsserts} flag is disabled, the test
 *     function passes;
 * <li>when the {@code failOnUnreportedAsserts} flag is enabled, the test
 *     function passes if {@code shouldPassWithFlagEnabled} is true and fails if
 *     it is false; and that
 * <li>when the {@code failOnUnreportedAsserts} flag is enabled, and in addition
 *     {@code invalidateAssertionException} is stubbed out to do nothing, the
 *     test function fails.
 * </ol>
 * @param {boolean} shouldPassWithFlagEnabled
 * @param {!function(): !goog.Promise} testFunction
 * @return {!goog.Promise}
 */
function verifyTestOutcomeForFailOnUnreportedAssertsFlag(
    shouldPassWithFlagEnabled, testFunction) {
  return verifyWithFlagEnabledAndNoInvalidation(testFunction)
      .then(function() {
        return verifyWithFlagEnabled(testFunction, shouldPassWithFlagEnabled);
      })
      .then(function() { return verifyWithFlagDisabled(testFunction); });
}

function verifyWithFlagDisabled(testFunction) {
  // With the flag disabled, the test is expected to pass, as any caught
  // exception would not be reported.
  var testCase = new goog.testing.TestCase();
  var getTestCase = goog.functions.constant(testCase);
  testCase.addNewTest('test', testFunction);
  testCase.failOnUnreportedAsserts = false;

  var stubs = new goog.testing.PropertyReplacer();
  stubs.replace(window, '_getCurrentTestCase', getTestCase);
  stubs.replace(goog.testing.TestCase, 'getActiveTestCase', getTestCase);

  var promise = new goog
                    .Promise(function(resolve, reject) {
                      testCase.setCompletedCallback(resolve);
                    })
                    .then(function() {
                      assertTrue(testCase.isSuccess());
                      var result = testCase.getResult();
                      assertTrue(result.complete);
                      assertEquals(0, result.errors.length);
                    })
                    .thenAlways(function() { stubs.reset(); });

  testCase.runTests();
  return promise;
}

function verifyWithFlagEnabled(testFunction, shouldPassWithFlagEnabled) {
  // With the flag enabled, the test is expected to pass if shouldPassWithFlag
  // is true, and fail if shouldPassWithFlag is false.
  var testCase = new goog.testing.TestCase();
  var getTestCase = goog.functions.constant(testCase);
  testCase.addNewTest('test', testFunction);
  testCase.failOnUnreportedAsserts = true;

  var stubs = new goog.testing.PropertyReplacer();
  stubs.replace(window, '_getCurrentTestCase', getTestCase);
  stubs.replace(goog.testing.TestCase, 'getActiveTestCase', getTestCase);

  var promise =
      new goog
          .Promise(function(resolve, reject) {
            testCase.setCompletedCallback(resolve);
          })
          .then(function() {
            assertEquals(shouldPassWithFlagEnabled, testCase.isSuccess());
            var result = testCase.getResult();
            assertTrue(result.complete);
            // Expect both the caught assertion and the failOnUnreportedAsserts
            // error.
            assertEquals(
                shouldPassWithFlagEnabled ? 0 : 2, result.errors.length);
          })
          .thenAlways(function() { stubs.reset(); });

  testCase.runTests();
  return promise;
}

function verifyWithFlagEnabledAndNoInvalidation(testFunction) {
  // With the flag enabled, the test is expected to pass if shouldPassWithFlag
  // is true, and fail if shouldPassWithFlag is false.
  var testCase = new goog.testing.TestCase();
  var getTestCase = goog.functions.constant(testCase);
  testCase.addNewTest('test', testFunction);
  testCase.failOnUnreportedAsserts = true;

  var stubs = new goog.testing.PropertyReplacer();
  stubs.replace(window, '_getCurrentTestCase', getTestCase);
  stubs.replace(goog.testing.TestCase, 'getActiveTestCase', getTestCase);
  stubs.replace(
      goog.testing.TestCase.prototype, 'invalidateAssertionException',
      goog.nullFunction);

  var promise = new goog
                    .Promise(function(resolve, reject) {
                      testCase.setCompletedCallback(resolve);
                    })
                    .then(function() {
                      assertFalse(testCase.isSuccess());
                      var result = testCase.getResult();
                      assertTrue(result.complete);
                      // Expect both the caught assertion and the
                      // failOnUnreportedAsserts error.
                      assertEquals(2, result.errors.length);
                    })
                    .thenAlways(function() { stubs.reset(); });

  testCase.runTests();
  return promise;
}

function testFailOnUnreportedAsserts_SwallowedException() {
  return verifyTestOutcomeForFailOnUnreportedAssertsFlag(false, function() {
    try {
      assertTrue(false);
    } catch (e) {
      // Swallow the exception generated by the assertion.
    }
  });
}

function testFailOnUnreportedAsserts_SwallowedFail() {
  return verifyTestOutcomeForFailOnUnreportedAssertsFlag(false, function() {
    try {
      fail();
    } catch (e) {
      // Swallow the exception generated by fail.
    }
  });
}

function testFailOnUnreportedAsserts_SwallowedAssertThrowsException() {
  return verifyTestOutcomeForFailOnUnreportedAssertsFlag(false, function() {
    try {
      assertThrows(goog.nullFunction);
    } catch (e) {
      // Swallow the exception generated by assertThrows.
    }
  });
}

function testFailOnUnreportedAsserts_SwallowedAssertNotThrowsException() {
  return verifyTestOutcomeForFailOnUnreportedAssertsFlag(false, function() {
    try {
      assertNotThrows(goog.functions.error());
    } catch (e) {
      // Swallow the exception generated by assertNotThrows.
    }
  });
}

function testFailOnUnreportedAsserts_SwallowedExceptionViaPromise() {
  return verifyTestOutcomeForFailOnUnreportedAssertsFlag(false, function() {
    return goog.Promise.resolve()
        .then(function() { assertTrue(false); })
        .thenCatch(function(e) {
          // Swallow the exception generated by the assertion.
        });
  });
}

function testFailOnUnreportedAsserts_NotForAssertThrowsJsUnitException() {
  return verifyTestOutcomeForFailOnUnreportedAssertsFlag(true, function() {
    assertThrowsJsUnitException(function() { assertTrue(false); });
  });
}

function testFailOnUnreportedAsserts_NotForMockMatchersObjectEquals() {
  return verifyTestOutcomeForFailOnUnreportedAssertsFlag(true, function() {
    new goog.testing.mockmatchers.ObjectEquals(true).matches(false);
  });
}

function testFailOnUnreportedAsserts_NotForExpectedFailures() {
  return verifyTestOutcomeForFailOnUnreportedAssertsFlag(true, function() {
    var expectedFailures = new goog.testing.ExpectedFailures();
    expectedFailures.expectFailureFor(true);
    try {
      assertTrue(false);
    } catch (e) {
      expectedFailures.handleException(e);
    }
  });
}

function testFailOnUnreportedAsserts_ReportUnpropagatedAssertionExceptions() {
  var testCase = new goog.testing.TestCase();

  var e1 = new goog.testing.JsUnitException('foo123');
  var e2 = new goog.testing.JsUnitException('bar456');

  var mockRecordError = goog.testing.MethodMock(testCase, 'recordError_');
  mockRecordError('test', e1);
  mockRecordError('test', e2);
  mockRecordError.$replay();

  testCase.thrownAssertionExceptions_.push(e1);
  testCase.thrownAssertionExceptions_.push(e2);

  var exception = testCase.reportUnpropagatedAssertionExceptions_('test');
  assertContains('One or more assertions were', exception.toString());

  mockRecordError.$verify();
  mockRecordError.$tearDown();
}
