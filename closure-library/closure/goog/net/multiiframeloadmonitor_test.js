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

goog.module('goog.net.MultiIframeLoadMonitorTest');
goog.setTestOnly('goog.net.MultiIframeLoadMonitorTest');

var Promise = goog.require('goog.Promise');
var Timer = goog.require('goog.Timer');
var dom = goog.require('goog.dom');
var TagName = goog.require('goog.dom.TagName');
var IframeLoadMonitor = goog.require('goog.net.IframeLoadMonitor');
var MultiIframeLoadMonitor = goog.require('goog.net.MultiIframeLoadMonitor');
var PropertyReplacer = goog.require('goog.testing.PropertyReplacer');
var jsunit = goog.require('goog.testing.jsunit');
var testSuite = goog.require('goog.testing.testSuite');


var stubs = new PropertyReplacer();
var TEST_FRAME_SRCS =
    ['iframeloadmonitor_test_frame.html', 'iframeloadmonitor_test_frame2.html'];
var frameParent;

testSuite({
  setUpPage: function() { frameParent = dom.getElement('frame_parent'); },

  tearDown: function() {
    dom.removeChildren(frameParent);
    stubs.reset();
  },

  testMultiIframeLoadMonitor: function() {
    var frames = [dom.createDom(TagName.IFRAME), dom.createDom(TagName.IFRAME)];
    var loaded = false;

    var monitorPromise = new Promise(function(resolve, reject) {
      new MultiIframeLoadMonitor(frames, function() {
        loaded = true;
        resolve();
      });
    });

    assertFalse(loaded);
    frameParent.appendChild(frames[0]);
    frameParent.appendChild(frames[1]);

    return monitorPromise.then(function() { assertTrue(loaded); });
  },

  testMultiIframeLoadMonitor_withContentCheck: function() {
    var frames = [dom.createDom(TagName.IFRAME), dom.createDom(TagName.IFRAME)];
    var loaded = false;

    var monitorPromise = new Promise(function(resolve, reject) {
      new MultiIframeLoadMonitor(frames, function() {
        loaded = true;
        resolve();
      }, true);
    });

    frameParent.appendChild(frames[0]);
    frameParent.appendChild(frames[1]);

    return Timer.promise(10)
        .then(function() {
          assertFalse(
              'Monitor should not fire until all iframes have content.',
              loaded);

          frames[0].src = TEST_FRAME_SRCS[0];
          return Timer.promise(10);
        })
        .then(function() {
          assertFalse(
              'Monitor should not fire until all iframes have content.',
              loaded);

          frames[1].src = TEST_FRAME_SRCS[1];
          return monitorPromise;
        })
        .then(function() { assertTrue(loaded); });
  },

  testStopMonitoring: function() {
    var iframeLoadMonitorsCreated = 0;
    var disposeCalls = 0;

    // Replace the IframeLoadMonitor implementation with a fake.
    stubs.replace(goog.net, 'IframeLoadMonitor', function() {
      iframeLoadMonitorsCreated++;
      return {
        attachEvent: function() {},
        dispose: function() { disposeCalls++; },
        isLoaded: function() { return false; }
      };
    });
    goog.net.IframeLoadMonitor.LOAD_EVENT = 'ifload';

    var frames = [dom.createDom(TagName.IFRAME), dom.createDom(TagName.IFRAME)];
    var monitor = new MultiIframeLoadMonitor(frames, function() {
      fail('should not invoke callback for unloaded frames');
    }, true);

    assertEquals(frames.length, iframeLoadMonitorsCreated);
    assertEquals(0, disposeCalls);

    monitor.stopMonitoring();
    assertEquals(frames.length, disposeCalls);
  }
});
