// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.TimerTest');
goog.setTestOnly('goog.TimerTest');

goog.require('goog.Promise');
goog.require('goog.Timer');
goog.require('goog.events');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');

var intervalIds = {};
var intervalIdCounter = 0;
var mockClock;
var maxDuration = 60 * 1000; // 60s

function setUp() {
  mockClock = new goog.testing.MockClock(true /* install */);
}

function tearDown() {
  mockClock.dispose();
}

// Run a test for 60s and see how many counts we get
function runTest(string, ticks, number) {
  var t = new goog.Timer(ticks);
  var count = 0;
  goog.events.listen(t, 'tick', function(evt) {
    count++;
  });
  t.start();
  mockClock.tick(maxDuration);
  assertEquals(string, number, count);
  t.stop();
  goog.events.removeAll(t);
}


function test100msTicks() {
  // Desc, interval in ms, expected ticks in 60s
  runTest('10 ticks per second for 60 seconds', 100, 600);
}

function test500msTicks() {
  runTest('2 ticks per second for 60 seconds', 500, 120);
}

function test1sTicks() {
  runTest('1 tick per second for 60 seconds', 1000, 60);
}

function test2sTicks() {
  runTest('1 tick every 2 seconds for 60 seconds', 2000, 30);
}

function test5sTicks() {
  runTest('1 tick every 5 seconds for 60 seconds', 5000, 12);
}

function test10sTicks() {
  runTest('1 tick every 10 seconds for 60 seconds', 10000, 6);
}

function test30sTicks() {
  runTest('1 tick every 30 seconds for 60 seconds', 30000, 2);
}

function test60sTicks() {
  runTest('1 tick every 60 seconds', 60000, 1);
}

function testCallOnce() {
  var c = 0;
  var expectedTimeoutId = goog.testing.MockClock.nextId;
  var actualTimeoutId = goog.Timer.callOnce(
      function() {
        if (c > 0) {
          assertTrue('callOnce should only be called once', false);
        }
        c++;
      });
  assertEquals('callOnce should return the timeout ID',
      expectedTimeoutId, actualTimeoutId);

  var obj = {c: 0};
  goog.Timer.callOnce(function() {
    if (this.c > 0) {
      assertTrue('callOnce should only be called once', false);
    }
    assertEquals(obj, this);
    this.c++;
  }, 1, obj);
  mockClock.tick(maxDuration);
}

function testCallOnceIgnoresTimeoutsTooLarge() {
  var failCallback = goog.partial(fail, 'Timeout should never be called');
  assertEquals('Timeouts slightly too large should yield a timer ID of -1',
      -1, goog.Timer.callOnce(failCallback, 2147483648));
  assertEquals('Infinite timeouts should yield a timer ID of -1',
      -1, goog.Timer.callOnce(failCallback, Infinity));
}

function testPromise() {
  var c = 0;
  goog.Timer.promise(1, 'A').then(function(result) {
    c++;
    assertEquals('promise should return resolved value', 'A', result);
  });
  mockClock.tick(10);
  assertEquals('promise must be yielded once and only once', 1, c);
}

function testPromise_cancel() {
  var c = 0;
  goog.Timer.promise(1, 'A').then(function(result) {
    fail('promise must not be resolved');
  }, function(reason) {
    c++;
    assertTrue('promise must fail due to cancel signal',
        reason instanceof goog.Promise.CancellationError);
  }).cancel();
  mockClock.tick(10);
  assertEquals('promise must be canceled once and only once', 1, c);
}

function testPromise_timeoutTooLarge() {
  var c = 0;
  goog.Timer.promise(2147483648, 'A').then(function(result) {
    fail('promise must not be resolved');
  }, function(reason) {
    c++;
    assertTrue('promise must be rejected', reason instanceof Error);
  });
  mockClock.tick(10);
  assertEquals('promise must be rejected once and only once', 1, c);
}
