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

goog.provide('goog.ui.ActivityMonitorTest');
goog.setTestOnly('goog.ui.ActivityMonitorTest');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');
goog.require('goog.ui.ActivityMonitor');

var mockClock;
var stubs = new goog.testing.PropertyReplacer();
var mydiv;

function setUp() {
  mydiv = document.getElementById('mydiv');
  mockClock = new goog.testing.MockClock(true);
  // ActivityMonitor initializes a private to 0 which it compares to now(),
  // so tests fail unless we start the mock clock with something besides 0.
  mockClock.tick(1);
}

function tearDown() {
  mockClock.dispose();
  stubs.reset();
}

function testIdle() {
  var activityMonitor = new goog.ui.ActivityMonitor();
  assertEquals('Upon creation, last event time should be creation time',
      mockClock.getCurrentTime(), activityMonitor.getLastEventTime());

  mockClock.tick(1000);
  activityMonitor.resetTimer();
  var resetTime = mockClock.getCurrentTime();
  assertEquals('Upon reset, last event time should be reset time',
      resetTime, activityMonitor.getLastEventTime());
  assertEquals('Upon reset, idle time should be zero',
      0, activityMonitor.getIdleTime());

  mockClock.tick(1000);
  assertEquals('1s after reset, last event time should be reset time',
      resetTime, activityMonitor.getLastEventTime());
  assertEquals('1s after reset, idle time should be 1s',
      1000, activityMonitor.getIdleTime());
}

function testEventFired() {
  var activityMonitor = new goog.ui.ActivityMonitor();
  var listener = goog.testing.recordFunction();
  goog.events.listen(activityMonitor, goog.ui.ActivityMonitor.Event.ACTIVITY,
                     listener);

  mockClock.tick(1000);
  goog.testing.events.fireClickEvent(mydiv);
  assertEquals('Activity event should fire when click happens after creation',
               1, listener.getCallCount());

  mockClock.tick(3000);
  goog.testing.events.fireClickEvent(mydiv);
  assertEquals('Activity event should not fire when click happens 3s or ' +
               'less since the last activity', 1, listener.getCallCount());

  mockClock.tick(1);
  goog.testing.events.fireClickEvent(mydiv);
  assertEquals('Activity event should fire when click happens more than ' +
               '3s since the last activity', 2, listener.getCallCount());
}

function testEventFiredWhenPropagationStopped() {
  var activityMonitor = new goog.ui.ActivityMonitor();
  var listener = goog.testing.recordFunction();
  goog.events.listen(activityMonitor, goog.ui.ActivityMonitor.Event.ACTIVITY,
                     listener);

  goog.events.listenOnce(mydiv, goog.events.EventType.CLICK,
                         goog.events.Event.stopPropagation);
  goog.testing.events.fireClickEvent(mydiv);
  assertEquals('Activity event should fire despite click propagation ' +
      'stopped because listening on capture', 1, listener.getCallCount());
}

function testEventNotFiredWhenPropagationStopped() {
  var activityMonitor = new goog.ui.ActivityMonitor(undefined, true);
  var listener = goog.testing.recordFunction();
  goog.events.listen(activityMonitor, goog.ui.ActivityMonitor.Event.ACTIVITY,
                     listener);

  goog.events.listenOnce(mydiv, goog.events.EventType.CLICK,
                         goog.events.Event.stopPropagation);
  goog.testing.events.fireClickEvent(mydiv);
  assertEquals('Activity event should not fire since click propagation ' +
      'stopped and listening on bubble', 0, listener.getCallCount());
}

function testTouchSequenceFired() {
  var activityMonitor = new goog.ui.ActivityMonitor();
  var listener = goog.testing.recordFunction();
  goog.events.listen(activityMonitor, goog.ui.ActivityMonitor.Event.ACTIVITY,
                     listener);

  mockClock.tick(1000);
  goog.testing.events.fireTouchSequence(mydiv);
  assertEquals('Activity event should fire when touch happens after creation',
               1, listener.getCallCount());

  mockClock.tick(3000);
  goog.testing.events.fireTouchSequence(mydiv);
  assertEquals('Activity event should not fire when touch happens 3s or ' +
               'less since the last activity', 1, listener.getCallCount());

  mockClock.tick(1);
  goog.testing.events.fireTouchSequence(mydiv);
  assertEquals('Activity event should fire when touch happens more than ' +
               '3s since the last activity', 2, listener.getCallCount());
}

function testAddDocument_duplicate() {
  var defaultDoc = goog.dom.getDomHelper().getDocument();
  var activityMonitor = new goog.ui.ActivityMonitor();
  assertEquals(1, activityMonitor.documents_.length);
  assertEquals(defaultDoc, activityMonitor.documents_[0]);
  var listenerCount = activityMonitor.eventHandler_.getListenerCount();

  activityMonitor.addDocument(defaultDoc);
  assertEquals(1, activityMonitor.documents_.length);
  assertEquals(defaultDoc, activityMonitor.documents_[0]);
  assertEquals(listenerCount, activityMonitor.eventHandler_.getListenerCount());
}
