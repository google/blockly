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

goog.provide('goog.net.ChannelRequestTest');
goog.setTestOnly('goog.net.ChannelRequestTest');

goog.require('goog.Uri');
goog.require('goog.functions');
goog.require('goog.net.BrowserChannel');
goog.require('goog.net.ChannelDebug');
goog.require('goog.net.ChannelRequest');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.net.XhrIo');
goog.require('goog.testing.recordFunction');

var channelRequest;
var mockBrowserChannel;
var mockClock;
var stubs;
var xhrIo;


/**
 * Time to wait for a network request to time out, before aborting.
 */
var WATCHDOG_TIME = 2000;


/**
 * Time to throttle readystatechange events.
 */
var THROTTLE_TIME = 500;


/**
 * A really long time - used to make sure no more timeouts will fire.
 */
var ALL_DAY_MS = 1000 * 60 * 60 * 24;


function setUp() {
  mockClock = new goog.testing.MockClock();
  mockClock.install();
  stubs = new goog.testing.PropertyReplacer();
}


function tearDown() {
  stubs.reset();
  mockClock.uninstall();
}



/**
 * Constructs a duck-type BrowserChannel that tracks the completed requests.
  * @constructor
 */
function MockBrowserChannel() {
  this.reachabilityEvents = {};
  this.isClosed = function() {
    return false;
  };
  this.isActive = function() {
    return true;
  };
  this.shouldUseSecondaryDomains = function() {
    return false;
  };
  this.completedRequests = [];
  this.notifyServerReachabilityEvent = function(reachabilityType) {
    if (!this.reachabilityEvents[reachabilityType]) {
      this.reachabilityEvents[reachabilityType] = 0;
    }
    this.reachabilityEvents[reachabilityType]++;
  };
  this.onRequestComplete = function(request) {
    this.completedRequests.push(request);
  };
  this.onRequestData = function(request, data) {};
}


/**
 * Creates a real ChannelRequest object, with some modifications for
 * testability:
 * <ul>
 * <li>The BrowserChannel is a MockBrowserChannel.
 * <li>The new watchdogTimeoutCallCount property tracks onWatchDogTimeout_()
 *     calls.
 * <li>The timeout is set to WATCHDOG_TIME.
 * </ul>
 */
function createChannelRequest() {
  xhrIo = new goog.testing.net.XhrIo();
  xhrIo.abort = xhrIo.abort || function() {
    this.active_ = false;
  };

  // Install mock browser channel and no-op debug logger.
  mockBrowserChannel = new MockBrowserChannel();
  channelRequest = new goog.net.ChannelRequest(
      mockBrowserChannel,
      new goog.net.ChannelDebug());

  // Install test XhrIo.
  mockBrowserChannel.createXhrIo = function() {
    return xhrIo;
  };

  // Install watchdogTimeoutCallCount.
  channelRequest.watchdogTimeoutCallCount = 0;
  channelRequest.originalOnWatchDogTimeout = channelRequest.onWatchDogTimeout_;
  channelRequest.onWatchDogTimeout_ = function() {
    this.watchdogTimeoutCallCount++;
    return this.originalOnWatchDogTimeout();
  };

  channelRequest.setTimeout(WATCHDOG_TIME);
}


/**
 * Run through the lifecycle of a long lived request, checking that the right
 * network events are reported.
 */
function testNetworkEvents() {
  createChannelRequest();

  channelRequest.xmlHttpPost(new goog.Uri('some_uri'), 'some_postdata', true);
  checkReachabilityEvents(1, 0, 0, 0);
  if (goog.net.ChannelRequest.supportsXhrStreaming()) {
    xhrIo.simulatePartialResponse('17\nI am a BC Message');
    checkReachabilityEvents(1, 0, 0, 1);
    xhrIo.simulatePartialResponse('23\nI am another BC Message');
    checkReachabilityEvents(1, 0, 0, 2);
    xhrIo.simulateResponse(200, '16\Final BC Message');
    checkReachabilityEvents(1, 1, 0, 2);
  } else {
    xhrIo.simulateResponse(200, '16\Final BC Message');
    checkReachabilityEvents(1, 1, 0, 0);
  }
}


/**
 * Test throttling of readystatechange events.
 */
function testNetworkEvents_throttleReadyStateChange() {
  createChannelRequest();
  channelRequest.setReadyStateChangeThrottle(THROTTLE_TIME);

  var recordedHandler =
      goog.testing.recordFunction(channelRequest.xmlHttpHandler_);
  stubs.set(channelRequest, 'xmlHttpHandler_', recordedHandler);

  channelRequest.xmlHttpPost(new goog.Uri('some_uri'), 'some_postdata', true);
  assertEquals(1, recordedHandler.getCallCount());

  checkReachabilityEvents(1, 0, 0, 0);
  if (goog.net.ChannelRequest.supportsXhrStreaming()) {
    xhrIo.simulatePartialResponse('17\nI am a BC Message');
    checkReachabilityEvents(1, 0, 0, 1);
    assertEquals(3, recordedHandler.getCallCount());

    // Second event should be throttled
    xhrIo.simulatePartialResponse('23\nI am another BC Message');
    assertEquals(3, recordedHandler.getCallCount());

    xhrIo.simulatePartialResponse('27\nI am yet another BC Message');
    assertEquals(3, recordedHandler.getCallCount());
    mockClock.tick(THROTTLE_TIME);

    checkReachabilityEvents(1, 0, 0, 3);
    // Only one more call because of throttling.
    assertEquals(4, recordedHandler.getCallCount());

    xhrIo.simulateResponse(200, '16\Final BC Message');
    checkReachabilityEvents(1, 1, 0, 3);
    assertEquals(5, recordedHandler.getCallCount());
  } else {
    xhrIo.simulateResponse(200, '16\Final BC Message');
    checkReachabilityEvents(1, 1, 0, 0);
  }
}


/**
 * Make sure that the request "completes" with an error when the timeout
 * expires.
 */
function testRequestTimeout() {
  createChannelRequest();

  channelRequest.xmlHttpPost(new goog.Uri('some_uri'), 'some_postdata', true);
  assertEquals(0, channelRequest.watchdogTimeoutCallCount);
  assertEquals(0, channelRequest.channel_.completedRequests.length);

  // Watchdog timeout.
  mockClock.tick(WATCHDOG_TIME);
  assertEquals(1, channelRequest.watchdogTimeoutCallCount);
  assertEquals(1, channelRequest.channel_.completedRequests.length);
  assertFalse(channelRequest.getSuccess());

  // Make sure no more timers are firing.
  mockClock.tick(ALL_DAY_MS);
  assertEquals(1, channelRequest.watchdogTimeoutCallCount);
  assertEquals(1, channelRequest.channel_.completedRequests.length);

  checkReachabilityEvents(1, 0, 1, 0);
}


function testRequestTimeoutWithUnexpectedException() {
  createChannelRequest();
  channelRequest.channel_.createXhrIo = goog.functions.error('Weird error');

  try {
    channelRequest.xmlHttpGet(new goog.Uri('some_uri'), true, null);
    fail('Expected error');
  } catch (e) {
    assertEquals('Weird error', e.message);
  }


  assertEquals(0, channelRequest.watchdogTimeoutCallCount);
  assertEquals(0, channelRequest.channel_.completedRequests.length);

  // Watchdog timeout.
  mockClock.tick(WATCHDOG_TIME);
  assertEquals(1, channelRequest.watchdogTimeoutCallCount);
  assertEquals(1, channelRequest.channel_.completedRequests.length);
  assertFalse(channelRequest.getSuccess());

  // Make sure no more timers are firing.
  mockClock.tick(ALL_DAY_MS);
  assertEquals(1, channelRequest.watchdogTimeoutCallCount);
  assertEquals(1, channelRequest.channel_.completedRequests.length);

  checkReachabilityEvents(0, 0, 1, 0);
}

function testActiveXBlocked() {
  createChannelRequest();
  stubs.set(goog.global, 'ActiveXObject',
      goog.functions.error('Active X blocked'));

  channelRequest.tridentGet(new goog.Uri('some_uri'), false);
  assertFalse(channelRequest.getSuccess());
  assertEquals(goog.net.ChannelRequest.Error.ACTIVE_X_BLOCKED,
      channelRequest.getLastError());

  checkReachabilityEvents(0, 0, 0, 0);
}


/**
 * This is a private method but we rely on it to avoid XSS, so it's important
 * to verify it works properly.
 */
function testEscapeForStringInScript() {
  var actual = goog.net.ChannelRequest.escapeForStringInScript_('"\'<>');
  assertEquals('\\"\\\'\\x3c\\x3e', actual);
}

function checkReachabilityEvents(reqMade, reqSucceeded, reqFail, backChannel) {
  var Reachability = goog.net.BrowserChannel.ServerReachability;
  assertEquals(reqMade,
      mockBrowserChannel.reachabilityEvents[Reachability.REQUEST_MADE] || 0);
  assertEquals(reqSucceeded,
      mockBrowserChannel.reachabilityEvents[Reachability.REQUEST_SUCCEEDED] ||
      0);
  assertEquals(reqFail,
      mockBrowserChannel.reachabilityEvents[Reachability.REQUEST_FAILED] || 0);
  assertEquals(backChannel,
      mockBrowserChannel.reachabilityEvents[
          Reachability.BACK_CHANNEL_ACTIVITY] ||
      0);
}
