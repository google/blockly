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
 * @fileoverview Tests for goog.labs.style.PixelDensityMonitor.
 *
 */

goog.provide('goog.labs.style.PixelDensityMonitorTest');
goog.setTestOnly('goog.labs.style.PixelDensityMonitorTest');

goog.require('goog.array');
goog.require('goog.dom.DomHelper');
goog.require('goog.events');
goog.require('goog.labs.style.PixelDensityMonitor');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');

var fakeWindow;
var recordFunction;
var monitor;
var mockControl;
var mediaQueryLists;

function setUp() {
  recordFunction = goog.testing.recordFunction();
  mediaQueryLists = [];
  mockControl = new goog.testing.MockControl();
}

function tearDown() {
  mockControl.$verifyAll();
  goog.dispose(monitor);
  goog.dispose(recordFunction);
}

function setUpMonitor(initialRatio, hasMatchMedia) {
  fakeWindow = {devicePixelRatio: initialRatio};

  if (hasMatchMedia) {
    // Every call to matchMedia should return a new media query list with its
    // own set of listeners.
    fakeWindow.matchMedia = function(query) {
      var listeners = [];
      var newList = {
        addListener: function(listener) { listeners.push(listener); },
        removeListener: function(listener) {
          goog.array.remove(listeners, listener);
        },
        callListeners: function() {
          for (var i = 0; i < listeners.length; i++) {
            listeners[i]();
          }
        },
        getListenerCount: function() { return listeners.length; }
      };
      mediaQueryLists.push(newList);
      return newList;
    };
  }

  var domHelper = mockControl.createStrictMock(goog.dom.DomHelper);
  domHelper.getWindow().$returns(fakeWindow);
  mockControl.$replayAll();

  monitor = new goog.labs.style.PixelDensityMonitor(domHelper);
  goog.events.listen(
      monitor, goog.labs.style.PixelDensityMonitor.EventType.CHANGE,
      recordFunction);
}

function setNewRatio(newRatio) {
  fakeWindow.devicePixelRatio = newRatio;
  for (var i = 0; i < mediaQueryLists.length; i++) {
    mediaQueryLists[i].callListeners();
  }
}

function testNormalDensity() {
  setUpMonitor(1, false);
  assertEquals(
      goog.labs.style.PixelDensityMonitor.Density.NORMAL, monitor.getDensity());
}

function testHighDensity() {
  setUpMonitor(1.5, false);
  assertEquals(
      goog.labs.style.PixelDensityMonitor.Density.HIGH, monitor.getDensity());
}

function testNormalDensityIfUndefined() {
  setUpMonitor(undefined, false);
  assertEquals(
      goog.labs.style.PixelDensityMonitor.Density.NORMAL, monitor.getDensity());
}

function testChangeEvent() {
  setUpMonitor(1, true);
  assertEquals(
      goog.labs.style.PixelDensityMonitor.Density.NORMAL, monitor.getDensity());
  monitor.start();

  setNewRatio(2);
  var call = recordFunction.popLastCall();
  assertEquals(
      goog.labs.style.PixelDensityMonitor.Density.HIGH,
      call.getArgument(0).target.getDensity());
  assertEquals(
      goog.labs.style.PixelDensityMonitor.Density.HIGH, monitor.getDensity());

  setNewRatio(1);
  call = recordFunction.popLastCall();
  assertEquals(
      goog.labs.style.PixelDensityMonitor.Density.NORMAL,
      call.getArgument(0).target.getDensity());
  assertEquals(
      goog.labs.style.PixelDensityMonitor.Density.NORMAL, monitor.getDensity());
}

function testListenerIsDisposed() {
  setUpMonitor(1, true);
  monitor.start();

  assertEquals(1, mediaQueryLists.length);
  assertEquals(1, mediaQueryLists[0].getListenerCount());

  goog.dispose(monitor);

  assertEquals(1, mediaQueryLists.length);
  assertEquals(0, mediaQueryLists[0].getListenerCount());
}
