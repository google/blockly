// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.net.iframeXhrTest');
goog.setTestOnly('goog.net.iframeXhrTest');

goog.require('goog.Timer');
goog.require('goog.debug.Console');
goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.net.IframeIo');
goog.require('goog.net.XhrIo');
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var c = new goog.debug.Console;
c.setCapturing(true);
goog.debug.LogManager.getRoot().setLevel(goog.debug.Logger.Level.ALL);

// Can't use exportSymbol if we want JsUnit support
top.GG_iframeFn = goog.net.IframeIo.handleIncrementalData;

// Make the dispose time short enough that it will cause the bug to appear
goog.net.IframeIo.IFRAME_DISPOSE_DELAY_MS = 0;


var fileName = 'iframe_xhr_test_response.html';
var iframeio;

// Create an async test case
var testCase = new goog.testing.AsyncTestCase(document.title);
testCase.stepTimeout = 4 * 1000;
testCase.resultCount = 0;
testCase.xhrCount = 0;
testCase.error = null;


/**
 * Set up the iframe io and request the test response page.
 * @this {goog.testing.AsyncTestCase}
 */
testCase.setUpPage = function() {
  testCase.waitForAsync('setUpPage');
  iframeio = new goog.net.IframeIo();
  goog.events.listen(
      iframeio, 'incrementaldata', this.onIframeData, false, this);
  goog.events.listen(
      iframeio, 'ready', this.onIframeReady, false, this);
  iframeio.send(fileName);
};


/** Disposes the iframe object. */
testCase.tearDownPage = function() {
  iframeio.dispose();
};


/**
 * Handles the packets received  from the Iframe incremental results.
 * @this {goog.testing.AsyncTestCase}
 */
testCase.onIframeData = function(e) {
  this.log('Data received  : ' + e.data);
  this.resultCount++;
  goog.net.XhrIo.send(fileName, goog.bind(this.onXhrData, this));
};


/**
 * Handles the iframe becoming ready.
 * @this {goog.testing.AsyncTestCase}
 */
testCase.onIframeReady = function(e) {
  this.log('Iframe ready');
  var me = this;
  goog.net.XhrIo.send(fileName, goog.bind(this.onXhrData, this));
};


/**
 * Handles the response from an Xhr request.
 * @this {goog.testing.AsyncTestCase}
 */
testCase.onXhrData = function(e) {
  this.xhrCount++;
  // We access status directly so that XhrLite doesn't mask the error that
  // would be thrown in FF if this worked correctly.
  try {
    this.log('Xhr Received: ' + e.target.xhr_.status);
  } catch (e) {
    this.log('ERROR: ' + e.message);
    this.error = e;
  }
  if (this.xhrCount == 4 && this.resultCount == 3) {
    // Wait for the async iframe disposal to fire.
    this.log('Test set up finished, waiting 500ms for iframe disposal');
    goog.Timer.callOnce(goog.bind(this.continueTesting, this), 0);
  }
};


/** The main test function that validates the results were as expected. */
testCase.addNewTest('testResults', function() {
  assertEquals('There should be 3 data packets', 3, this.resultCount);
  // 3 results + 1 ready
  assertEquals('There should be 4 XHR results', 4, this.xhrCount);
  if (this.error) {
    throw this.error;
  }

  assertEquals('There should be no iframes left', 0,
      document.getElementsByTagName(goog.dom.TagName.IFRAME).length);
});


/** This test only runs on GECKO browsers. */
if (goog.userAgent.GECKO) {
  /** Used by the JsUnit test runner. */
  var testXhrMonitorWorksForIframeIoRequests = function() {
    testCase.reset();
    testCase.cycleTests();
  };
}

// Standalone Closure Test Runner.
if (goog.userAgent.GECKO) {
  G_testRunner.initialize(testCase);
} else {
  G_testRunner.setStrict(false);
}
