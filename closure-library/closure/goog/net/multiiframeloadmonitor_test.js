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

goog.provide('goog.net.MultiIframeLoadMonitorTest');
goog.setTestOnly('goog.net.MultiIframeLoadMonitorTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.net.IframeLoadMonitor');
goog.require('goog.net.MultiIframeLoadMonitor');
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.jsunit');

var TEST_FRAME_SRCS = ['iframeloadmonitor_test_frame.html',
  'iframeloadmonitor_test_frame2.html',
  'iframeloadmonitor_test_frame3.html'];

// Create a new test case.
var iframeLoaderTestCase = new goog.testing.AsyncTestCase(document.title);
iframeLoaderTestCase.stepTimeout = 4 * 1000;

// How many multpile frames finished loading
iframeLoaderTestCase.multipleComplete_ = 0;

iframeLoaderTestCase.numMonitors = 0;
iframeLoaderTestCase.disposeCalled = 0;


/**
 * Sets up the test environment, adds tests and sets up the worker pools.
 * @this {goog.testing.AsyncTestCase}
 */
iframeLoaderTestCase.setUpPage = function() {
  this.log('Setting tests up');
  iframeLoaderTestCase.waitForAsync('loading iframes');

  var dom = goog.dom.getDomHelper();

  // Load multiple with callback
  var frame1 = dom.createDom(goog.dom.TagName.IFRAME);
  var frame2 = dom.createDom(goog.dom.TagName.IFRAME);
  var multiMonitor = new goog.net.MultiIframeLoadMonitor(
      [frame1, frame2], goog.bind(this.multipleCallback, this));
  this.log('Loading frames at: ' + TEST_FRAME_SRCS[0] + ' and ' +
      TEST_FRAME_SRCS[1]);
  // Make sure they don't look loaded yet.
  assertEquals(0, this.multipleComplete_);
  var frameParent = dom.getElement('frame_parent');
  dom.appendChild(frameParent, frame1);
  frame1.src = TEST_FRAME_SRCS[0];
  dom.appendChild(frameParent, frame2);
  frame2.src = TEST_FRAME_SRCS[1];

  // Load multiple with callback and content check
  var frame3 = dom.createDom(goog.dom.TagName.IFRAME);
  var frame4 = dom.createDom(goog.dom.TagName.IFRAME);
  var multiMonitor = new goog.net.MultiIframeLoadMonitor(
      [frame3, frame4], goog.bind(this.multipleContentCallback, this), true);
  this.log('Loading frames with content check at: ' + TEST_FRAME_SRCS[1] +
      ' and ' + TEST_FRAME_SRCS[2]);
  dom.appendChild(frameParent, frame3);
  frame3.src = TEST_FRAME_SRCS[1];
  dom.appendChild(frameParent, frame4);
  frame4.src = TEST_FRAME_SRCS[2];


};


/**
 * Callback for the multiple frame load test case
 * @this {goog.testing.AsyncTestCase}
 */
iframeLoaderTestCase.multipleCallback = function() {
  this.log('multiple frames finished loading');
  this.multipleComplete_++;
  this.multipleCompleteNoContent_ = true;
  this.callbacksComplete();
};


/**
 * Callback for the multiple frame with content load test case
 * @this {goog.testing.AsyncTestCase}
 */
iframeLoaderTestCase.multipleContentCallback = function() {
  this.log('multiple frames with content finished loading');
  this.multipleComplete_++;
  this.multipleCompleteContent_ = true;
  this.callbacksComplete();
};


/**
 * Checks if all the load callbacks are done
 * @this {goog.testing.AsyncTestCase}
 */
iframeLoaderTestCase.callbacksComplete = function() {
  if (this.multipleComplete_ == 2) {
    iframeLoaderTestCase.continueTesting();
  }
};


/** Tests the results. */
iframeLoaderTestCase.addNewTest('testResults', function() {
  this.log('getting test results');
  assertTrue(this.multipleCompleteNoContent_);
  assertTrue(this.multipleCompleteContent_);
});

iframeLoaderTestCase.fakeLoadMonitor = function() {
  // Replaces IframeLoadMonitor with a fake version that just tracks
  // instantiations/disposals
  this.loadMonitorConstructor = goog.net.IframeLoadMonitor;
  var that = this;
  goog.net.IframeLoadMonitor = function() {
    that.numMonitors++;
    return {
      isLoaded: function() { return false; },
      dispose: function() { that.disposeCalled++; },
      attachEvent: function() {}
    };
  };
  goog.net.IframeLoadMonitor.LOAD_EVENT = 'ifload';
};

iframeLoaderTestCase.unfakeLoadMonitor = function() {
  goog.net.IframeLoadMonitor = this.loadMonitorConstructor;
};

iframeLoaderTestCase.addNewTest('stopMonitoring', function() {
  // create two unloaded frames, make sure that load monitors are loaded
  // behind the scenes, then make sure they are disposed properly.
  this.fakeLoadMonitor();
  var dom = goog.dom.getDomHelper();
  var frames = [dom.createDom(goog.dom.TagName.IFRAME),
                dom.createDom(goog.dom.TagName.IFRAME)];
  var multiMonitor = new goog.net.MultiIframeLoadMonitor(
      frames,
      function() {
        fail('should not invoke callback for unloaded rames');
      });
  assertEquals(frames.length, this.numMonitors);
  assertEquals(0, this.disposeCalled);
  multiMonitor.stopMonitoring();
  assertEquals(frames.length, this.disposeCalled);
  this.unfakeLoadMonitor();
});


/** Standalone Closure Test Runner. */
G_testRunner.initialize(iframeLoaderTestCase);
