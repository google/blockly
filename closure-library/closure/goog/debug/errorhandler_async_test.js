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

goog.provide('goog.debug.ErrorHandlerAsyncTest');
goog.setTestOnly('goog.debug.ErrorHandlerAsyncTest');

goog.require('goog.Promise');
goog.require('goog.debug.ErrorHandler');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');


/** @type {!goog.promise.Resolver} */
var resolver;
var testCase = new goog.testing.TestCase(document.title);

testCase.setUpPage = function() {
  resolver = goog.Promise.withResolver();

  this.oldTimeout = window.setTimeout;
  this.oldInterval = window.setInterval;
  this.oldRequestAnimationFrame = window.requestAnimationFrame;

  // Whether requestAnimationFrame is available for testing.
  this.testingReqAnimFrame = !!window.requestAnimationFrame;

  this.handler = new goog.debug.ErrorHandler(
      goog.bind(this.onException, this));
  this.handler.protectWindowSetTimeout();
  this.handler.protectWindowSetInterval();
  this.handler.protectWindowRequestAnimationFrame();
  this.exceptions = [];
  this.errors = 0;

  // Override the error event handler, since we are purposely throwing
  // exceptions from global functions, and expect them
  this.oldWindowOnError = window.onerror;
  window.onerror = goog.bind(this.onError, this);

  window.setTimeout(goog.bind(this.timeOut, this), 10);
  this.intervalId = window.setInterval(goog.bind(this.interval, this), 20);

  if (this.testingReqAnimFrame) {
    window.requestAnimationFrame(goog.bind(this.animFrame, this));
  }
};

testCase.tearDownPage = function() {
  window.setTimeout = this.oldTimeout;
  window.setInterval = this.oldInterval;
  window.requestAnimationFrame = this.oldRequestAnimationFrame;
};

testCase.onException = function(e) {
  this.exceptions.push(e);
  if (this.timeoutHit && this.intervalHit &&
      (!this.testingReqAnimFrame || this.animFrameHit)) {
    resolver.resolve();
  }
};

testCase.onError = function(msg, url, line) {
  this.errors++;
  return true;
};

testCase.timeOut = function() {
  this.timeoutHit = true;
  throw arguments.callee;
};

testCase.interval = function() {
  this.intervalHit = true;
  window.clearTimeout(this.intervalId);
  throw arguments.callee;
};

testCase.animFrame = function() {
  this.animFrameHit = true;
  throw arguments.callee;
};

testCase.addNewTest('testResults', function() {
  return resolver.promise.then(function() {
    var timeoutHit, intervalHit, animFrameHit;

    for (var i = 0; i < this.exceptions.length; ++i) {
      switch (this.exceptions[i]) {
        case this.timeOut: timeoutHit = true; break;
        case this.interval: intervalHit = true; break;
        case this.animFrame: animFrameHit = true; break;
      }
    }

    assertTrue('timeout exception not received', timeoutHit);
    assertTrue('timeout not called', this.timeoutHit);
    assertTrue('interval exception not received', intervalHit);
    assertTrue('interval not called', this.intervalHit);
    if (this.testingReqAnimFrame) {
      assertTrue('anim frame exception not received', animFrameHit);
      assertTrue('animFrame not called', this.animFrameHit);
    }

    if (!goog.userAgent.WEBKIT) {
      var expectedRethrownCount = this.testingReqAnimFrame ? 3 : 2;
      assertEquals(
          expectedRethrownCount + ' exceptions should have been rethrown',
          expectedRethrownCount, this.errors);
    }
  }, null, this);
});

// Standalone Closure Test Runner.
G_testRunner.initialize(testCase);
