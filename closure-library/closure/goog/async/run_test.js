// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.async.runTest');

goog.require('goog.async.run');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');

goog.setTestOnly('goog.async.runTest');


var mockClock;
var futureCallback1, futureCallback2;

function setUpPage() {
  mockClock = new goog.testing.MockClock();
  mockClock.install();
}

function setUp() {
  mockClock.reset();
  futureCallback1 = new goog.testing.recordFunction();
  futureCallback2 = new goog.testing.recordFunction();
}

function tearDown() {
  futureCallback1 = null;
  futureCallback2 = null;
}

function tearDownPage() {
  mockClock.uninstall();
  goog.dispose(mockClock);
}

function testCalledAsync() {
  goog.async.run(futureCallback1);
  goog.async.run(futureCallback2);

  assertEquals(0, futureCallback1.getCallCount());
  assertEquals(0, futureCallback2.getCallCount());

  // but the callbacks are scheduled...
  mockClock.tick();

  // and called.
  assertEquals(1, futureCallback1.getCallCount());
  assertEquals(1, futureCallback2.getCallCount());

  // and aren't called a second time.
  assertEquals(1, futureCallback1.getCallCount());
  assertEquals(1, futureCallback2.getCallCount());
}

function testSequenceCalledInOrder() {
  futureCallback1 = new goog.testing.recordFunction(
      function() {
        // called before futureCallback2
        assertEquals(0, futureCallback2.getCallCount());
      });
  futureCallback2 = new goog.testing.recordFunction(
      function() {
        // called after futureCallback1
        assertEquals(1, futureCallback1.getCallCount());
      });
  goog.async.run(futureCallback1);
  goog.async.run(futureCallback2);

  // goog.async.run doesn't call the top callback immediately.
  assertEquals(0, futureCallback1.getCallCount());

  // but the callbacks are scheduled...
  mockClock.tick();

  // and called during the same "tick".
  assertEquals(1, futureCallback1.getCallCount());
  assertEquals(1, futureCallback2.getCallCount());
}

function testSequenceScheduledTwice() {
  goog.async.run(futureCallback1);
  goog.async.run(futureCallback1);

  // goog.async.run doesn't call the top callback immediately.
  assertEquals(0, futureCallback1.getCallCount());

  // but the callbacks are scheduled...
  mockClock.tick();

  // and called twice during the same "tick".
  assertEquals(2, futureCallback1.getCallCount());
}

function testSequenceCalledSync() {
  futureCallback1 = new goog.testing.recordFunction(
      function() {
        goog.async.run(futureCallback2);
        // goog.async.run doesn't call the inner callback immediately.
        assertEquals(0, futureCallback2.getCallCount());
      });
  goog.async.run(futureCallback1);

  // goog.async.run doesn't call the top callback immediately.
  assertEquals(0, futureCallback1.getCallCount());

  // but the callbacks are scheduled...
  mockClock.tick();

  // and called during the same "tick".
  assertEquals(1, futureCallback1.getCallCount());
  assertEquals(1, futureCallback2.getCallCount());
}

function testScope() {
  var aScope = {};
  goog.async.run(futureCallback1);
  goog.async.run(futureCallback2, aScope);

  // the callbacks are scheduled...
  mockClock.tick();

  // and called.
  assertEquals(1, futureCallback1.getCallCount());
  assertEquals(1, futureCallback2.getCallCount());

  // and get the correct scope.
  var last1 = futureCallback1.popLastCall();
  assertEquals(0, last1.getArguments().length);
  assertEquals(goog.global, last1.getThis());

  var last2 = futureCallback2.popLastCall();
  assertEquals(0, last2.getArguments().length);
  assertEquals(aScope, last2.getThis());
}
