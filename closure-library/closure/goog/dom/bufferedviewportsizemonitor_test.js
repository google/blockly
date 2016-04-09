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

/**
 * @fileoverview Tests for goog.dom.BufferedViewportSizeMonitor.
 *
 */


/** @suppress {extraProvide} */
goog.provide('goog.dom.BufferedViewportSizeMonitorTest');

goog.require('goog.dom.BufferedViewportSizeMonitor');
goog.require('goog.dom.ViewportSizeMonitor');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.math.Size');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.events');
goog.require('goog.testing.events.Event');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.dom.BufferedViewportSizeMonitorTest');

var RESIZE_DELAY = goog.dom.BufferedViewportSizeMonitor.RESIZE_EVENT_DELAY_MS_;
var INITIAL_SIZE = new goog.math.Size(111, 111);

var mockControl;
var viewportSizeMonitor;
var bufferedVsm;
var timer = new goog.testing.MockClock();
var resizeEventCount = 0;
var size;

var resizeCallback = function() {
  resizeEventCount++;
};

function setUp() {
  timer.install();

  size = INITIAL_SIZE;
  viewportSizeMonitor = new goog.dom.ViewportSizeMonitor();
  viewportSizeMonitor.getSize = function() { return size; };
  bufferedVsm = new goog.dom.BufferedViewportSizeMonitor(viewportSizeMonitor);

  goog.events.listen(bufferedVsm, goog.events.EventType.RESIZE, resizeCallback);
}

function tearDown() {
  goog.events.unlisten(
      bufferedVsm, goog.events.EventType.RESIZE, resizeCallback);
  resizeEventCount = 0;
  timer.uninstall();
}

function testInitialSizes() {
  assertTrue(goog.math.Size.equals(INITIAL_SIZE, bufferedVsm.getSize()));
}

function testWindowResize() {
  assertEquals(0, resizeEventCount);
  resize(100, 100);
  timer.tick(RESIZE_DELAY - 1);
  assertEquals(
      'No resize expected before the delay is fired', 0, resizeEventCount);
  timer.tick(1);
  assertEquals('Expected resize after delay', 1, resizeEventCount);
  assertTrue(
      goog.math.Size.equals(
          new goog.math.Size(100, 100), bufferedVsm.getSize()));
}

function testWindowResize_eventBatching() {
  assertEquals(
      'No resize calls expected before resize events', 0, resizeEventCount);
  resize(100, 100);
  timer.tick(RESIZE_DELAY - 1);
  resize(200, 200);
  assertEquals(
      'No resize expected before the delay is fired', 0, resizeEventCount);
  timer.tick(1);
  assertEquals(
      'No resize expected when delay is restarted', 0, resizeEventCount);
  timer.tick(RESIZE_DELAY);
  assertEquals('Expected resize after delay', 1, resizeEventCount);
}

function testWindowResize_noChange() {
  resize(100, 100);
  timer.tick(RESIZE_DELAY);
  assertEquals(1, resizeEventCount);
  resize(100, 100);
  timer.tick(RESIZE_DELAY);
  assertEquals(
      'No resize expected when size doesn\'t change', 1, resizeEventCount);
  assertTrue(
      goog.math.Size.equals(
          new goog.math.Size(100, 100), bufferedVsm.getSize()));
}

function testWindowResize_previousSize() {
  resize(100, 100);
  timer.tick(RESIZE_DELAY);
  assertEquals(1, resizeEventCount);
  assertTrue(
      goog.math.Size.equals(
          new goog.math.Size(100, 100), bufferedVsm.getSize()));

  resize(200, 200);
  timer.tick(RESIZE_DELAY);
  assertEquals(2, resizeEventCount);
  assertTrue(
      goog.math.Size.equals(
          new goog.math.Size(200, 200), bufferedVsm.getSize()));
}

function resize(width, height) {
  size = new goog.math.Size(width, height);
  goog.testing.events.fireBrowserEvent(
      new goog.testing.events.Event(
          goog.events.EventType.RESIZE, viewportSizeMonitor));
}
