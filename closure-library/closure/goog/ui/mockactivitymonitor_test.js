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


/**
 * @fileoverview Tests for goog.ui.MockActivityMonitorTest.
 * @author nnaze@google.com (Nathan Naze)
 */

/** @suppress {extraProvide} */
goog.provide('goog.ui.MockActivityMonitorTest');

goog.require('goog.events');
goog.require('goog.functions');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');
goog.require('goog.ui.ActivityMonitor');
goog.require('goog.ui.MockActivityMonitor');

goog.setTestOnly('goog.ui.MockActivityMonitorTest');

var googNow = goog.now;
var monitor;
var recordedFunction;
var replacer;

function setUp() {
  monitor = new goog.ui.MockActivityMonitor();
  recordedFunction = goog.testing.recordFunction();

  goog.events.listen(
      monitor,
      goog.ui.ActivityMonitor.Event.ACTIVITY,
      recordedFunction);
}

function tearDown() {
  goog.dispose(monitor);
  goog.now = googNow;
}

function testEventFireSameTime() {
  goog.now = goog.functions.constant(1000);

  monitor.simulateEvent();
  assertEquals(1, recordedFunction.getCallCount());

  monitor.simulateEvent();
  assertEquals(2, recordedFunction.getCallCount());
}

function testEventFireDifferingTime() {
  goog.now = goog.functions.constant(1000);
  monitor.simulateEvent();
  assertEquals(1, recordedFunction.getCallCount());

  goog.now = goog.functions.constant(1001);
  monitor.simulateEvent();
  assertEquals(2, recordedFunction.getCallCount());
}

function testDispatchEventReturnValue() {
  assertTrue(monitor.dispatchEvent(goog.ui.ActivityMonitor.Event.ACTIVITY));
  assertEquals(1, recordedFunction.getCallCount());
}

function testDispatchEventPreventDefault() {
  // Undo the listen call in setUp.
  goog.events.unlisten(
      monitor,
      goog.ui.ActivityMonitor.Event.ACTIVITY,
      recordedFunction);

  // Listen with a function that cancels the event.
  goog.events.listen(
      monitor,
      goog.ui.ActivityMonitor.Event.ACTIVITY,
      function(e) {
        e.preventDefault();
      });

  assertFalse(monitor.dispatchEvent(goog.ui.ActivityMonitor.Event.ACTIVITY));
}
