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

goog.provide('goog.labs.dom.PageVisibilityMonitorTest');
goog.setTestOnly('goog.labs.dom.PageVisibilityMonitorTest');

goog.require('goog.events');
goog.require('goog.functions');
goog.require('goog.labs.dom.PageVisibilityMonitor');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.events');
goog.require('goog.testing.events.Event');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');

var stubs = new goog.testing.PropertyReplacer();
var vh;


function tearDown() {
  goog.dispose(vh);
  vh = null;
  stubs.reset();
}

function testConstructor() {
  vh = new goog.labs.dom.PageVisibilityMonitor();
}

function testNoVisibilitySupport() {
  stubs.set(goog.labs.dom.PageVisibilityMonitor.prototype,
      'getBrowserEventType_', goog.functions.NULL);

  var listener = goog.testing.recordFunction();
  vh = new goog.labs.dom.PageVisibilityMonitor();

  goog.events.listen(vh, 'visibilitychange', listener);

  var e = new goog.testing.events.Event('visibilitychange');
  e.target = window.document;
  goog.testing.events.fireBrowserEvent(e);
  assertEquals(0, listener.getCallCount());
}

function testListener() {
  stubs.set(goog.labs.dom.PageVisibilityMonitor.prototype,
      'getBrowserEventType_', goog.functions.constant('visibilitychange'));

  var listener = goog.testing.recordFunction();
  vh = new goog.labs.dom.PageVisibilityMonitor();

  goog.events.listen(vh, 'visibilitychange', listener);

  var e = new goog.testing.events.Event('visibilitychange');
  e.target = window.document;
  goog.testing.events.fireBrowserEvent(e);

  assertEquals(1, listener.getCallCount());
}

function testListenerForWebKit() {
  stubs.set(goog.labs.dom.PageVisibilityMonitor.prototype,
      'getBrowserEventType_',
      goog.functions.constant('webkitvisibilitychange'));

  var listener = goog.testing.recordFunction();
  vh = new goog.labs.dom.PageVisibilityMonitor();

  goog.events.listen(vh, 'visibilitychange', listener);

  var e = new goog.testing.events.Event('webkitvisibilitychange');
  e.target = window.document;
  goog.testing.events.fireBrowserEvent(e);

  assertEquals(1, listener.getCallCount());
}
