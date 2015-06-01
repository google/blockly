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

goog.provide('goog.events.EventTest');
goog.setTestOnly('goog.events.EventTest');

goog.require('goog.events.Event');
goog.require('goog.events.EventId');
goog.require('goog.events.EventTarget');
goog.require('goog.testing.jsunit');

var e, target;

function setUp() {
  target = new goog.events.EventTarget();
  e = new goog.events.Event('eventType', target);
}

function tearDown() {
  target.dispose();
}

function testConstructor() {
  assertNotNull('Event must not be null', e);
  assertEquals('Event type must be as expected', 'eventType', e.type);
  assertEquals('Event target must be as expected', target, e.target);
  assertEquals('Current target must be as expected', target,
      e.currentTarget);
}

function testStopPropagation() {
  // This test breaks encapsulation because there is no public getter for
  // propagationStopped_.
  assertFalse('Propagation must not have been stopped',
      e.propagationStopped_);
  e.stopPropagation();
  assertTrue('Propagation must have been stopped', e.propagationStopped_);
}

function testPreventDefault() {
  // This test breaks encapsulation because there is no public getter for
  // returnValue_.
  assertTrue('Return value must be true', e.returnValue_);
  e.preventDefault();
  assertFalse('Return value must be false', e.returnValue_);
}

function testDefaultPrevented() {
  assertFalse('Default action must not be prevented', e.defaultPrevented);
  e.preventDefault();
  assertTrue('Default action must be prevented', e.defaultPrevented);
}

function testEventId() {
  e = new goog.events.Event(new goog.events.EventId('eventType'));
  assertEquals('Event type must be as expected', 'eventType', e.type);
}
