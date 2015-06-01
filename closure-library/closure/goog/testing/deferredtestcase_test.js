// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.testing.DeferredTestCaseTest');
goog.setTestOnly('goog.testing.DeferredTestCaseTest');

goog.require('goog.async.Deferred');
goog.require('goog.testing.DeferredTestCase');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.TestRunner');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');

var deferredTestCase =
    goog.testing.DeferredTestCase.createAndInstall(document.title);
var testTestCase;
var runner;

// Optionally, set a longer-than-usual step timeout.
deferredTestCase.stepTimeout = 15 * 1000; // 15 seconds

// This is the sample code in deferredtestcase.js
function testDeferredCallbacks() {
  var callbackTime = goog.now();
  var callbacks = new goog.async.Deferred();
  deferredTestCase.addWaitForAsync('Waiting for 1st callback', callbacks);
  callbacks.addCallback(
      function() {
        assertTrue(
            'We\'re going back in time!', goog.now() >= callbackTime);
        callbackTime = goog.now();
      });
  deferredTestCase.addWaitForAsync('Waiting for 2nd callback', callbacks);
  callbacks.addCallback(
      function() {
        assertTrue(
            'We\'re going back in time!', goog.now() >= callbackTime);
        callbackTime = goog.now();
      });
  deferredTestCase.addWaitForAsync('Waiting for last callback', callbacks);
  callbacks.addCallback(
      function() {
        assertTrue(
            'We\'re going back in time!', goog.now() >= callbackTime);
        callbackTime = goog.now();
      });

  deferredTestCase.waitForDeferred(callbacks);
}

function createDeferredTestCase(d) {
  testTestCase = new goog.testing.DeferredTestCase('Foobar TestCase');
  testTestCase.add(new goog.testing.TestCase.Test(
      'Foobar Test',
      function() {
        this.waitForDeferred(d);
      },
      testTestCase));

  var testCompleteCallback = new goog.async.Deferred();
  testTestCase.setCompletedCallback(
      function() {
        testCompleteCallback.callback(true);
      });

  // We're not going to use the runner to run the test, but we attach one
  // here anyway because without a runner TestCase throws an exception in
  // finalize().
  var runner = new goog.testing.TestRunner();
  runner.initialize(testTestCase);

  return testCompleteCallback;
}

function testDeferredWait() {
  var d = new goog.async.Deferred();
  deferredTestCase.addWaitForAsync('Foobar', d);
  d.addCallback(function() {
    return goog.async.Deferred.succeed(true);
  });
  deferredTestCase.waitForDeferred(d);
}

function testNonAsync() {
  assertTrue(true);
}

function testPassWithTestRunner() {
  var d = new goog.async.Deferred();
  d.addCallback(function() {
    return goog.async.Deferred.succeed(true);
  });

  var testCompleteDeferred = createDeferredTestCase(d);
  testTestCase.execute();

  var deferredCallbackOnPass = new goog.async.Deferred();
  deferredCallbackOnPass.addCallback(function() {
    return testCompleteDeferred;
  });
  deferredCallbackOnPass.addCallback(function() {
    assertTrue('Test case should have succeded.', testTestCase.isSuccess());
  });

  deferredTestCase.waitForDeferred(deferredCallbackOnPass);
}

function testFailWithTestRunner() {
  var d = new goog.async.Deferred();
  d.addCallback(function() {
    return goog.async.Deferred.fail(true);
  });

  var testCompleteDeferred = createDeferredTestCase(d);

  // Mock doAsyncError to instead let the test completes successfully,
  // but record the failure. The test works as is because the failing
  // deferred is not actually asynchronous.
  var mockDoAsyncError = goog.testing.recordFunction(function() {
    testTestCase.continueTesting();
  });
  testTestCase.doAsyncError = mockDoAsyncError;

  testTestCase.execute();
  assertEquals(1, mockDoAsyncError.getCallCount());
}
