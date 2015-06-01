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

goog.provide('goog.dom.ViewportSizeMonitorTest');
goog.setTestOnly('goog.dom.ViewportSizeMonitorTest');

goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.math.Size');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');

var propertyReplacer, fakeWindow, viewportSizeMonitor, mockClock;


function FakeWindow() {
  FakeWindow.base(this, 'constructor');
}
goog.inherits(FakeWindow, goog.events.EventTarget);


FakeWindow.prototype.fireResize = function() {
  return this.dispatchEvent(new FakeResizeEvent());
};


function FakeResizeEvent(obj) {
  this.type = goog.events.EventType.RESIZE;
}
goog.inherits(FakeResizeEvent, goog.events.Event);


function getViewportSize() {
  return viewportSize;
}


function setViewportSize(w, h, fireEvent) {
  this.viewportSize = new goog.math.Size(w, h);
  if (fireEvent) {
    fakeWindow.fireResize();
  }
}


var eventWasFired = {};
function getListenerFn(id) {
  return function() {
    propertyReplacer.set(eventWasFired, id, true);
  };
}


function listenerWasCalled(id) {
  return !!eventWasFired[id];
}


function setUp() {
  propertyReplacer = new goog.testing.PropertyReplacer();
  propertyReplacer.set(goog.dom, 'getViewportSize', getViewportSize);
  mockClock = new goog.testing.MockClock();
  mockClock.install();
  fakeWindow = new FakeWindow();
  setViewportSize(300, 300);
  viewportSizeMonitor = new goog.dom.ViewportSizeMonitor(fakeWindow);
}


function tearDown() {
  propertyReplacer.reset();
  mockClock.uninstall();
}


function testResizeEvent() {
  goog.events.listen(viewportSizeMonitor, goog.events.EventType.RESIZE,
      getListenerFn(1));
  assertFalse('Listener should not be called if window was not resized',
      listenerWasCalled(1));
  setViewportSize(300, 300, true);
  assertFalse('Listener should not be called for bogus resize event',
      listenerWasCalled(1));
  setViewportSize(301, 301, true);
  assertTrue('Listener should be called for valid resize event',
      listenerWasCalled(1));
}


function testInstanceGetter() {
  var fakeWindow1 = new FakeWindow();
  var monitor1 = goog.dom.ViewportSizeMonitor.getInstanceForWindow(
      fakeWindow1);
  var monitor2 = goog.dom.ViewportSizeMonitor.getInstanceForWindow(
      fakeWindow1);
  assertEquals('The same window should give us the same instance monitor',
      monitor1, monitor2);

  var fakeWindow2 = new FakeWindow();
  var monitor3 = goog.dom.ViewportSizeMonitor.getInstanceForWindow(
      fakeWindow2);
  assertNotEquals('Different windows should give different instances',
      monitor1, monitor3);

  assertEquals('Monitors should match if opt_window is not provided',
      goog.dom.ViewportSizeMonitor.getInstanceForWindow(),
      goog.dom.ViewportSizeMonitor.getInstanceForWindow());
}


function testRemoveInstanceForWindow() {
  var fakeWindow1 = new FakeWindow();
  var monitor1 = goog.dom.ViewportSizeMonitor.getInstanceForWindow(
      fakeWindow1);

  goog.dom.ViewportSizeMonitor.removeInstanceForWindow(fakeWindow1);
  assertTrue(monitor1.isDisposed());

  var monitor2 = goog.dom.ViewportSizeMonitor.getInstanceForWindow(
      fakeWindow1);
  assertNotEquals(monitor1, monitor2);
}
