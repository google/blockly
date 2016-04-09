// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.testing.PerformanceTimerTest');
goog.setTestOnly('goog.testing.PerformanceTimerTest');

goog.require('goog.async.Deferred');
goog.require('goog.dom');
goog.require('goog.math');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.PerformanceTimer');
goog.require('goog.testing.jsunit');

var mockClock;
var sandbox;
var timer;
function setUpPage() {
  sandbox = document.getElementById('sandbox');
}

function setUp() {
  mockClock = new goog.testing.MockClock(true);
  timer = new goog.testing.PerformanceTimer();
}

function tearDown() {
  mockClock.dispose();
  timer = null;
  goog.dom.removeChildren(sandbox);
}

function testConstructor() {
  assertTrue(
      'Timer must be an instance of goog.testing.PerformanceTimer',
      timer instanceof goog.testing.PerformanceTimer);
  assertEquals(
      'Timer must collect the default number of samples', 10,
      timer.getNumSamples());
  assertEquals(
      'Timer must have the default timeout interval', 5000,
      timer.getTimeoutInterval());
}

function testRun_noSetUpOrTearDown() {
  runAndAssert(false, false, false);
}

function testRun_withSetup() {
  runAndAssert(true, false, false);
}

function testRun_withTearDown() {
  runAndAssert(false, true, false);
}

function testRun_withSetUpAndTearDown() {
  runAndAssert(true, true, false);
}

function testRunAsync_noSetUpOrTearDown() {
  runAndAssert(false, false, true);
}

function testRunAsync_withSetup() {
  runAndAssert(true, false, true);
}

function testRunAsync_withTearDown() {
  runAndAssert(false, true, true);
}

function testRunAsync_withSetUpAndTearDown() {
  runAndAssert(true, true, true);
}

function runAndAssert(useSetUp, useTearDown, runAsync) {
  var fakeExecutionTime = [100, 95, 98, 104, 130, 101, 96, 98, 90, 103];
  var count = 0;
  var testFunction = function() {
    mockClock.tick(fakeExecutionTime[count++]);
    if (runAsync) {
      var deferred = new goog.async.Deferred();
      deferred.callback();
      return deferred;
    }
  };

  var setUpCount = 0;
  var setUpFunction = function() {
    // Should have no effect on total time.
    mockClock.tick(7);
    setUpCount++;
    if (runAsync) {
      var deferred = new goog.async.Deferred();
      deferred.callback();
      return deferred;
    }
  };

  var tearDownCount = 0;
  var tearDownFunction = function() {
    // Should have no effect on total time.
    mockClock.tick(11);
    tearDownCount++;
    if (runAsync) {
      var deferred = new goog.async.Deferred();
      deferred.callback();
      return deferred;
    }
  };

  // Fast test function should complete successfully in under 5 seconds...
  var task = new goog.testing.PerformanceTimer.Task(testFunction);
  if (useSetUp) {
    task.withSetUp(setUpFunction);
  }
  if (useTearDown) {
    task.withTearDown(tearDownFunction);
  }
  if (runAsync) {
    var assertsRan = false;
    var deferred = timer.runAsyncTask(task);
    deferred.addCallback(function(results) {
      assertsRan = assertResults(
          results, useSetUp, useTearDown, setUpCount, tearDownCount,
          fakeExecutionTime);
    });
    assertTrue(assertsRan);
  } else {
    var results = timer.runTask(task);
    assertResults(
        results, useSetUp, useTearDown, setUpCount, tearDownCount,
        fakeExecutionTime);
  }
}

function assertResults(
    results, useSetUp, useTearDown, setUpCount, tearDownCount,
    fakeExecutionTime) {
  assertNotNull('Results must be available.', results);

  assertEquals(
      'Average is wrong.', goog.math.average.apply(null, fakeExecutionTime),
      results['average']);
  assertEquals(
      'Standard deviation is wrong.',
      goog.math.standardDeviation.apply(null, fakeExecutionTime),
      results['standardDeviation']);

  assertEquals('Count must be as expected.', 10, results['count']);
  assertEquals('Maximum is wrong.', 130, results['maximum']);
  assertEquals('Mimimum is wrong.', 90, results['minimum']);
  assertEquals(
      'Total must be a nonnegative number.',
      goog.math.sum.apply(null, fakeExecutionTime), results['total']);

  assertEquals(
      'Set up count must be as expected.', useSetUp ? 10 : 0, setUpCount);
  assertEquals(
      'Tear down count must be as expected.', useTearDown ? 10 : 0,
      tearDownCount);

  return true;
}

function testTimeout() {
  var count = 0;
  var testFunction = function() {
    mockClock.tick(100);
    ++count;
  };

  timer.setNumSamples(200);
  timer.setTimeoutInterval(2500);
  var results = timer.run(testFunction);

  assertNotNull('Results must be available', results);
  assertEquals('Count is wrong', count, results['count']);
  assertTrue(
      'Count must less than expected',
      results['count'] < timer.getNumSamples());
}

function testCreateResults() {
  var samples = [53, 0, 103];
  var expectedResults = {
    'average': 52,
    'count': 3,
    'maximum': 103,
    'minimum': 0,
    'standardDeviation': goog.math.standardDeviation.apply(null, samples),
    'total': 156
  };
  assertObjectEquals(
      expectedResults, goog.testing.PerformanceTimer.createResults(samples));
}
