// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.events.EventTargetGoogEventsTest');
goog.setTestOnly('goog.events.EventTargetGoogEventsTest');

goog.require('goog.events');
goog.require('goog.events.EventTarget');
goog.require('goog.events.eventTargetTester');
goog.require('goog.events.eventTargetTester.KeyType');
goog.require('goog.events.eventTargetTester.UnlistenReturnType');
goog.require('goog.testing');
goog.require('goog.testing.jsunit');

function setUp() {
  var newListenableFn = function() {
    return new goog.events.EventTarget();
  };
  var unlistenByKeyFn = function(src, key) {
    return goog.events.unlistenByKey(key);
  };
  goog.events.eventTargetTester.setUp(
      newListenableFn, goog.events.listen, goog.events.unlisten,
      unlistenByKeyFn, goog.events.listenOnce, goog.events.dispatchEvent,
      goog.events.removeAll, goog.events.getListeners,
      goog.events.getListener, goog.events.hasListener,
      goog.events.eventTargetTester.KeyType.NUMBER,
      goog.events.eventTargetTester.UnlistenReturnType.BOOLEAN, true);
}

function tearDown() {
  goog.events.eventTargetTester.tearDown();
}

function testUnlistenProperCleanup() {
  goog.events.listen(eventTargets[0], EventType.A, listeners[0]);
  goog.events.unlisten(eventTargets[0], EventType.A, listeners[0]);

  goog.events.listen(eventTargets[0], EventType.A, listeners[0]);
  eventTargets[0].unlisten(EventType.A, listeners[0]);
}

function testUnlistenByKeyProperCleanup() {
  var keyNum = goog.events.listen(eventTargets[0], EventType.A, listeners[0]);
  goog.events.unlistenByKey(keyNum);
}

function testListenOnceProperCleanup() {
  goog.events.listenOnce(eventTargets[0], EventType.A, listeners[0]);
  eventTargets[0].dispatchEvent(EventType.A);
}

function testListenWithObject() {
  var obj = {};
  obj.handleEvent = goog.testing.recordFunction();
  goog.events.listen(eventTargets[0], EventType.A, obj);
  eventTargets[0].dispatchEvent(EventType.A);
  assertEquals(1, obj.handleEvent.getCallCount());
}

function testListenWithObjectHandleEventReturningFalse() {
  var obj = {};
  obj.handleEvent = function() { return false; };
  goog.events.listen(eventTargets[0], EventType.A, obj);
  assertFalse(eventTargets[0].dispatchEvent(EventType.A));
}
