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

goog.module('goog.net.IframeLoadMonitorTest');
goog.setTestOnly('goog.net.IframeLoadMonitorTest');

var Promise = goog.require('goog.Promise');
var Timer = goog.require('goog.Timer');
var dom = goog.require('goog.dom');
var TagName = goog.require('goog.dom.TagName');
var events = goog.require('goog.events');
var IframeLoadMonitor = goog.require('goog.net.IframeLoadMonitor');
var jsunit = goog.require('goog.testing.jsunit');
var testSuite = goog.require('goog.testing.testSuite');


var TEST_FRAME_SRC = 'iframeloadmonitor_test_frame.html';
var frameParent;


testSuite({
  setUpPage: function() { frameParent = dom.getElement('frame_parent'); },

  tearDown: function() { dom.removeChildren(frameParent); },

  testIframeLoadMonitor: function() {
    var frame = dom.createDom(TagName.IFRAME);
    var monitor = new IframeLoadMonitor(frame);
    var monitorPromise = new Promise(function(resolve, reject) {
      events.listen(monitor, IframeLoadMonitor.LOAD_EVENT, resolve);
    });

    assertFalse(monitor.isLoaded());
    frameParent.appendChild(frame);

    return monitorPromise.then(function(e) {
      assertEquals(IframeLoadMonitor.LOAD_EVENT, e.type);
      assertTrue(monitor.isLoaded());
    });
  },

  testIframeLoadMonitor_withContentCheck: function() {
    var frame = dom.createDom(TagName.IFRAME);
    var monitor = new IframeLoadMonitor(frame, true);
    var monitorPromise = new Promise(function(resolve, reject) {
      events.listen(monitor, IframeLoadMonitor.LOAD_EVENT, resolve);
    });

    assertFalse(monitor.isLoaded());
    frameParent.appendChild(frame);

    return Timer.promise(10)
        .then(function() {
          assertFalse(
              'Monitor should not fire before content has loaded.',
              monitor.isLoaded());
          frame.src = TEST_FRAME_SRC;

          return monitorPromise;
        })
        .then(function(e) {
          assertEquals(IframeLoadMonitor.LOAD_EVENT, e.type);
          assertTrue(monitor.isLoaded());
        });
  }
});
