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

goog.provide('goog.net.IframeLoadMonitorTest');
goog.setTestOnly('goog.net.IframeLoadMonitorTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.net.IframeLoadMonitor');
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.jsunit');

var TEST_FRAME_SRCS = ['iframeloadmonitor_test_frame.html',
  'iframeloadmonitor_test_frame2.html',
  'iframeloadmonitor_test_frame3.html'];

// Create a new test case.
var iframeLoaderTestCase = new goog.testing.AsyncTestCase(document.title);
iframeLoaderTestCase.stepTimeout = 4 * 1000;

// Array holding all iframe load monitors.
iframeLoaderTestCase.iframeLoadMonitors_ = [];

// How many single frames finished loading
iframeLoaderTestCase.singleComplete_ = 0;


/**
 * Sets up the test environment, adds tests and sets up the worker pools.
 * @this {goog.testing.AsyncTestCase}
 */
iframeLoaderTestCase.setUpPage = function() {
  this.log('Setting tests up');
  iframeLoaderTestCase.waitForAsync('loading iframes');

  var dom = goog.dom.getDomHelper();

  // Load single frame
  var frame = dom.createDom(goog.dom.TagName.IFRAME);
  this.iframeLoadMonitors_.push(new goog.net.IframeLoadMonitor(frame));
  goog.events.listen(this.iframeLoadMonitors_[0],
      goog.net.IframeLoadMonitor.LOAD_EVENT, this);
  var frameParent = dom.getElement('frame_parent');
  dom.appendChild(frameParent, frame);
  this.log('Loading frame at: ' + TEST_FRAME_SRCS[0]);
  frame.src = TEST_FRAME_SRCS[0];

  // Load single frame with content check
  var frame1 = dom.createDom(goog.dom.TagName.IFRAME);
  this.iframeLoadMonitors_.push(new goog.net.IframeLoadMonitor(frame1, true));
  goog.events.listen(this.iframeLoadMonitors_[1],
      goog.net.IframeLoadMonitor.LOAD_EVENT, this);
  var frameParent = dom.getElement('frame_parent');
  dom.appendChild(frameParent, frame1);
  this.log('Loading frame with content check at: ' + TEST_FRAME_SRCS[0]);
  frame1.src = TEST_FRAME_SRCS[0];
};


/**
 * Handles any events fired
 * @this {goog.testing.AsyncTestCase}
 */
iframeLoaderTestCase.handleEvent = function(e) {
  this.log('handleEvent, type: ' + e.type);
  if (e.type == goog.net.IframeLoadMonitor.LOAD_EVENT) {
    this.singleComplete_++;
    this.callbacksComplete();
  }
};


/**
 * Checks if all the load callbacks are done
 * @this {goog.testing.AsyncTestCase}
 */
iframeLoaderTestCase.callbacksComplete = function() {
  if (this.singleComplete_ == 2) {
    iframeLoaderTestCase.continueTesting();
  }
};


/** Tests the results. */
iframeLoaderTestCase.addNewTest('testResults', function() {
  this.log('getting test results');
  for (var i = 0; i < this.iframeLoadMonitors_.length; i++) {
    assertTrue(this.iframeLoadMonitors_[i].isLoaded());
  }
});


/** Standalone Closure Test Runner. */
G_testRunner.initialize(iframeLoaderTestCase);
