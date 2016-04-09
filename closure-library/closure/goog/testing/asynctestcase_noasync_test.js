// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.testing.AsyncTestCaseSyncTest');
goog.setTestOnly('goog.testing.AsyncTestCaseSyncTest');

goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.jsunit');

// Has the setUp() function been called.
var setUpCalled = false;
// Has the current test function completed. This helps us to ensure that the
// next test is not started before the previous completed.
var curTestIsDone = true;
// For restoring it later.
var oldTimeout = window.setTimeout;
// Use an asynchronous test runner for our tests.
var asyncTestCase = goog.testing.AsyncTestCase.createAndInstall(document.title);


/**
 * Uses window.setTimeout() to perform asynchronous behaviour and uses
 * asyncTestCase.waitForAsync() and asyncTestCase.continueTesting() to mark
 * the beginning and end of it.
 * @param {number} numAsyncCalls The number of asynchronous calls to make.
 * @param {string} name The name of the current step.
 */
function doAsyncStuff(numAsyncCalls, name) {
  if (numAsyncCalls > 0) {
    curTestIsDone = false;
    asyncTestCase.waitForAsync(
        'doAsyncStuff-' + name + '(' + numAsyncCalls + ')');
    window.setTimeout(function() { doAsyncStuff(numAsyncCalls - 1, name); }, 0);
  } else {
    curTestIsDone = true;
    asyncTestCase.continueTesting();
  }
}

function setUpPage() {
  debug('setUpPage was called.');
  // Don't do anything asynchronously.
  window.setTimeout = function(callback, time) { callback(); };
  doAsyncStuff(3, 'setUpPage');
}
function setUp() {
  assertTrue(curTestIsDone);
  doAsyncStuff(3, 'setUp');
}
function tearDown() {
  assertTrue(curTestIsDone);
}
function test1() {
  assertTrue(curTestIsDone);
  doAsyncStuff(1, 'test1');
}
function test2() {
  assertTrue(curTestIsDone);
  doAsyncStuff(2, 'test2');
}
function test3() {
  assertTrue(curTestIsDone);
  doAsyncStuff(5, 'test3');
}
var callback = function() {
  curTestIsDone = true;
  asyncTestCase.signal();
};
var doAsyncSignals = function() {
  curTestIsDone = false;
  window.setTimeout(callback, 0);
};
function testSignalsReturn() {
  doAsyncSignals();
  doAsyncSignals();
  doAsyncSignals();
  asyncTestCase.waitForSignals(3);
}
function testSignalsCallContinueTestingBeforeFinishing() {
  doAsyncSignals();
  asyncTestCase.waitForSignals(2);

  window.setTimeout(function() {
    var thrown = assertThrows(function() { asyncTestCase.continueTesting(); });
    assertEquals('Still waiting for 1 signals.', thrown.message);
  }, 0);
  doAsyncSignals();  // To not timeout.
}
function tearDownPage() {
  debug('tearDownPage was called.');
  assertTrue(curTestIsDone);
  window.setTimeout = oldTimeout;
}
