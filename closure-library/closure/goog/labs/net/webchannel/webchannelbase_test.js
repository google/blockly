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
 * @fileoverview Unit tests for goog.labs.net.webChannel.WebChannelBase.
 * @suppress {accessControls} Private methods are accessed for test purposes.
 *
 */


goog.provide('goog.labs.net.webChannel.webChannelBaseTest');

goog.require('goog.Timer');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.functions');
goog.require('goog.json');
goog.require('goog.labs.net.webChannel.ChannelRequest');
goog.require('goog.labs.net.webChannel.ForwardChannelRequestPool');
goog.require('goog.labs.net.webChannel.WebChannelBase');
goog.require('goog.labs.net.webChannel.WebChannelBaseTransport');
goog.require('goog.labs.net.webChannel.WebChannelDebug');
goog.require('goog.labs.net.webChannel.Wire');
goog.require('goog.labs.net.webChannel.netUtils');
goog.require('goog.labs.net.webChannel.requestStats');
goog.require('goog.labs.net.webChannel.requestStats.Stat');
goog.require('goog.structs.Map');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.asserts');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.labs.net.webChannel.webChannelBaseTest');


/**
 * Delay between a network failure and the next network request.
 */
var RETRY_TIME = 1000;


/**
 * A really long time - used to make sure no more timeouts will fire.
 */
var ALL_DAY_MS = 1000 * 60 * 60 * 24;

var stubs = new goog.testing.PropertyReplacer();

var channel;
var deliveredMaps;
var handler;
var mockClock;
var gotError;
var numStatEvents;
var lastStatEvent;
var numTimingEvents;
var lastPostSize;
var lastPostRtt;
var lastPostRetryCount;

// Set to true to see the channel debug output in the browser window.
var debug = false;
// Debug message to print out when debug is true.
var debugMessage = '';

function debugToWindow(message) {
  if (debug) {
    debugMessage += message + '<br>';
    goog.dom.getElement('debug').innerHTML = debugMessage;
  }
}


/**
 * Stubs goog.labs.net.webChannel.netUtils to always time out. It maintains the
 * contract given by goog.labs.net.webChannel.netUtils.testNetwork, but always
 * times out (calling callback(false)).
 *
 * stubNetUtils should be called in tests that require it before
 * a call to testNetwork happens. It is reset at tearDown.
 */
function stubNetUtils() {
  stubs.set(goog.labs.net.webChannel.netUtils, 'testLoadImage',
      function(url, timeout, callback) {
        goog.Timer.callOnce(goog.partial(callback, false), timeout);
      });
}


/**
 * Stubs goog.labs.net.webChannel.ForwardChannelRequestPool.isSpdyEnabled_
 * to manage the max pool size for the forward channel.
 *
 * @param {boolean} spdyEnabled Whether SPDY is enabled for the test.
 */
function stubSpdyCheck(spdyEnabled) {
  stubs.set(goog.labs.net.webChannel.ForwardChannelRequestPool,
      'isSpdyEnabled_',
      function() {
        return spdyEnabled;
      });
}



/**
 * Mock ChannelRequest.
 * @constructor
 * @struct
 * @final
 */
var MockChannelRequest = function(channel, channelDebug, opt_sessionId,
    opt_requestId, opt_retryId) {
  this.channel_ = channel;
  this.channelDebug_ = channelDebug;
  this.sessionId_ = opt_sessionId;
  this.requestId_ = opt_requestId;
  this.successful_ = true;
  this.lastError_ = null;
  this.lastStatusCode_ = 200;

  // For debugging, keep track of whether this is a back or forward channel.
  this.isBack = !!(opt_requestId == 'rpc');
  this.isForward = !this.isBack;
};

MockChannelRequest.prototype.postData_ = null;

MockChannelRequest.prototype.requestStartTime_ = null;

MockChannelRequest.prototype.setExtraHeaders = function(extraHeaders) {};

MockChannelRequest.prototype.setTimeout = function(timeout) {};

MockChannelRequest.prototype.setReadyStateChangeThrottle =
    function(throttle) {};

MockChannelRequest.prototype.xmlHttpPost = function(uri, postData,
    decodeChunks) {
  this.channelDebug_.debug('---> POST: ' + uri + ', ' + postData + ', ' +
      decodeChunks);
  this.postData_ = postData;
  this.requestStartTime_ = goog.now();
};

MockChannelRequest.prototype.xmlHttpGet = function(uri, decodeChunks,
    opt_noClose) {
  this.channelDebug_.debug('<--- GET: ' + uri + ', ' + decodeChunks + ', ' +
      opt_noClose);
  this.requestStartTime_ = goog.now();
};

MockChannelRequest.prototype.sendCloseRequest = function(uri) {
  this.requestStartTime_ = goog.now();
};

MockChannelRequest.prototype.cancel = function() {
  this.successful_ = false;
};

MockChannelRequest.prototype.getSuccess = function() {
  return this.successful_;
};

MockChannelRequest.prototype.getLastError = function() {
  return this.lastError_;
};

MockChannelRequest.prototype.getLastStatusCode = function() {
  return this.lastStatusCode_;
};

MockChannelRequest.prototype.getSessionId = function() {
  return this.sessionId_;
};

MockChannelRequest.prototype.getRequestId = function() {
  return this.requestId_;
};

MockChannelRequest.prototype.getPostData = function() {
  return this.postData_;
};

MockChannelRequest.prototype.getRequestStartTime = function() {
  return this.requestStartTime_;
};

MockChannelRequest.prototype.getXhr = function() {
  return null;
};


function shouldRunTests() {
  return goog.labs.net.webChannel.ChannelRequest.supportsXhrStreaming();
}


/**
 * @suppress {invalidCasts} The cast from MockChannelRequest to
 * ChannelRequest is invalid and will not compile.
 */
function setUpPage() {
  // Use our MockChannelRequests instead of the real ones.
  goog.labs.net.webChannel.ChannelRequest.createChannelRequest = function(
      channel, channelDebug, opt_sessionId, opt_requestId, opt_retryId) {
    return /** @type {!goog.labs.net.webChannel.ChannelRequest} */ (
        new MockChannelRequest(channel, channelDebug, opt_sessionId,
            opt_requestId, opt_retryId));
  };

  // Mock out the stat notification code.
  goog.labs.net.webChannel.requestStats.notifyStatEvent = function(
      stat) {
    numStatEvents++;
    lastStatEvent = stat;
  };

  goog.labs.net.webChannel.requestStats.notifyTimingEvent = function(
      size, rtt, retries) {
    numTimingEvents++;
    lastPostSize = size;
    lastPostRtt = rtt;
    lastPostRetryCount = retries;
  };
}

function setUp() {
  numTimingEvents = 0;
  lastPostSize = null;
  lastPostRtt = null;
  lastPostRetryCount = null;

  mockClock = new goog.testing.MockClock(true);
  channel = new goog.labs.net.webChannel.WebChannelBase('1');
  gotError = false;

  handler = new goog.labs.net.webChannel.WebChannelBase.Handler();
  handler.channelOpened = function() {};
  handler.channelError = function(channel, error) {
    gotError = true;
  };
  handler.channelSuccess = function(channel, maps) {
    deliveredMaps = goog.array.clone(maps);
  };

  /**
   * @suppress {checkTypes} The callback function type declaration is skipped.
   */
  handler.channelClosed = function(
      channel, opt_pendingMaps, opt_undeliveredMaps) {
    // Mock out the handler, and let it set a formatted user readable string
    // of the undelivered maps which we can use when verifying our assertions.
    if (opt_pendingMaps) {
      handler.pendingMapsString = formatArrayOfMaps(opt_pendingMaps);
    }
    if (opt_undeliveredMaps) {
      handler.undeliveredMapsString = formatArrayOfMaps(opt_undeliveredMaps);
    }
  };
  handler.channelHandleMultipleArrays = function() {};
  handler.channelHandleArray = function() {};

  channel.setHandler(handler);

  // Provide a predictable retry time for testing.
  channel.getRetryTime_ = function(retryCount) {
    return RETRY_TIME;
  };

  var channelDebug = new goog.labs.net.webChannel.WebChannelDebug();
  channelDebug.debug = function(message) {
    debugToWindow(message);
  };
  channel.setChannelDebug(channelDebug);

  numStatEvents = 0;
  lastStatEvent = null;
}


function tearDown() {
  mockClock.dispose();
  stubs.reset();
  debugToWindow('<hr>');
}


function getSingleForwardRequest() {
  var pool = channel.forwardChannelRequestPool_;
  if (!pool.hasPendingRequest()) {
    return null;
  }
  return pool.request_ || pool.requestPool_.getValues()[0];
}


/**
 * Helper function to return a formatted string representing an array of maps.
 */
function formatArrayOfMaps(arrayOfMaps) {
  var result = [];
  for (var i = 0; i < arrayOfMaps.length; i++) {
    var map = arrayOfMaps[i];
    var keys = map.map.getKeys();
    for (var j = 0; j < keys.length; j++) {
      var tmp = keys[j] + ':' + map.map.get(keys[j]) + (map.context ?
          ':' + map.context : '');
      result.push(tmp);
    }
  }
  return result.join(', ');
}


function testFormatArrayOfMaps() {
  // This function is used in a non-trivial test, so let's verify that it works.
  var map1 = new goog.structs.Map();
  map1.set('k1', 'v1');
  map1.set('k2', 'v2');
  var map2 = new goog.structs.Map();
  map2.set('k3', 'v3');
  var map3 = new goog.structs.Map();
  map3.set('k4', 'v4');
  map3.set('k5', 'v5');
  map3.set('k6', 'v6');

  // One map.
  var a = [];
  a.push(new goog.labs.net.webChannel.Wire.QueuedMap(0, map1));
  assertEquals('k1:v1, k2:v2',
      formatArrayOfMaps(a));

  // Many maps.
  var b = [];
  b.push(new goog.labs.net.webChannel.Wire.QueuedMap(0, map1));
  b.push(new goog.labs.net.webChannel.Wire.QueuedMap(0, map2));
  b.push(new goog.labs.net.webChannel.Wire.QueuedMap(0, map3));
  assertEquals('k1:v1, k2:v2, k3:v3, k4:v4, k5:v5, k6:v6',
      formatArrayOfMaps(b));

  // One map with a context.
  var c = [];
  c.push(new goog.labs.net.webChannel.Wire.QueuedMap(
      0, map1, new String('c1')));
  assertEquals('k1:v1:c1, k2:v2:c1',
      formatArrayOfMaps(c));
}


/**
 * @param {number=} opt_serverVersion
 * @param {string=} opt_hostPrefix
 * @param {string=} opt_uriPrefix
 * @param {boolean=} opt_spdyEnabled
 */
function connectForwardChannel(
    opt_serverVersion, opt_hostPrefix, opt_uriPrefix, opt_spdyEnabled) {
  stubSpdyCheck(!!opt_spdyEnabled);
  var uriPrefix = opt_uriPrefix || '';
  channel.connect(uriPrefix + '/test', uriPrefix + '/bind', null);
  mockClock.tick(0);
  completeTestConnection();
  completeForwardChannel(opt_serverVersion, opt_hostPrefix);
}


/**
 * @param {number=} opt_serverVersion
 * @param {string=} opt_hostPrefix
 * @param {string=} opt_uriPrefix
 * @param {boolean=} opt_spdyEnabled
 */
function connect(opt_serverVersion, opt_hostPrefix, opt_uriPrefix,
    opt_spdyEnabled) {
  connectForwardChannel(opt_serverVersion, opt_hostPrefix, opt_uriPrefix,
      opt_spdyEnabled);
  completeBackChannel();
}


function disconnect() {
  channel.disconnect();
  mockClock.tick(0);
}


function completeTestConnection() {
  completeForwardTestConnection();
  completeBackTestConnection();
  assertEquals(goog.labs.net.webChannel.WebChannelBase.State.OPENING,
      channel.getState());
}


function completeForwardTestConnection() {
  channel.connectionTest_.onRequestData(
      channel.connectionTest_.request_,
      '["b"]');
  channel.connectionTest_.onRequestComplete(
      channel.connectionTest_.request_);
  mockClock.tick(0);
}


function completeBackTestConnection() {
  channel.connectionTest_.onRequestData(
      channel.connectionTest_.request_,
      '11111');
  mockClock.tick(0);
}


/**
 * @param {number=} opt_serverVersion
 * @param {string=} opt_hostPrefix
 */
function completeForwardChannel(opt_serverVersion, opt_hostPrefix) {
  var responseData = '[[0,["c","1234567890ABCDEF",' +
      (opt_hostPrefix ? '"' + opt_hostPrefix + '"' : 'null') +
      (opt_serverVersion ? ',' + opt_serverVersion : '') +
      ']]]';
  channel.onRequestData(
      getSingleForwardRequest(),
      responseData);
  channel.onRequestComplete(
      getSingleForwardRequest());
  mockClock.tick(0);
}


function completeBackChannel() {
  channel.onRequestData(
      channel.backChannelRequest_,
      '[[1,["foo"]]]');
  channel.onRequestComplete(
      channel.backChannelRequest_);
  mockClock.tick(0);
}


function responseDone() {
  channel.onRequestData(
      getSingleForwardRequest(),
      '[1,0,0]');  // mock data
  channel.onRequestComplete(
      getSingleForwardRequest());
  mockClock.tick(0);
}


/**
 *
 * @param {number=} opt_lastArrayIdSentFromServer
 * @param {number=} opt_outstandingDataSize
 */
function responseNoBackchannel(
    opt_lastArrayIdSentFromServer, opt_outstandingDataSize) {
  var responseData = goog.json.serialize(
      [0, opt_lastArrayIdSentFromServer, opt_outstandingDataSize]);
  channel.onRequestData(
      getSingleForwardRequest(),
      responseData);
  channel.onRequestComplete(
      getSingleForwardRequest());
  mockClock.tick(0);
}

function response(lastArrayIdSentFromServer, outstandingDataSize) {
  var responseData = goog.json.serialize(
      [1, lastArrayIdSentFromServer, outstandingDataSize]);
  channel.onRequestData(
      getSingleForwardRequest(),
      responseData
  );
  channel.onRequestComplete(
      getSingleForwardRequest());
  mockClock.tick(0);
}


function receive(data) {
  channel.onRequestData(
      channel.backChannelRequest_,
      '[[1,' + data + ']]');
  channel.onRequestComplete(
      channel.backChannelRequest_);
  mockClock.tick(0);
}


function responseTimeout() {
  getSingleForwardRequest().lastError_ =
      goog.labs.net.webChannel.ChannelRequest.Error.TIMEOUT;
  getSingleForwardRequest().successful_ = false;
  channel.onRequestComplete(
      getSingleForwardRequest());
  mockClock.tick(0);
}


/**
 * @param {number=} opt_statusCode
 */
function responseRequestFailed(opt_statusCode) {
  getSingleForwardRequest().lastError_ =
      goog.labs.net.webChannel.ChannelRequest.Error.STATUS;
  getSingleForwardRequest().lastStatusCode_ =
      opt_statusCode || 503;
  getSingleForwardRequest().successful_ = false;
  channel.onRequestComplete(
      getSingleForwardRequest());
  mockClock.tick(0);
}


function responseUnknownSessionId() {
  getSingleForwardRequest().lastError_ =
      goog.labs.net.webChannel.ChannelRequest.Error.UNKNOWN_SESSION_ID;
  getSingleForwardRequest().successful_ = false;
  channel.onRequestComplete(
      getSingleForwardRequest());
  mockClock.tick(0);
}


/**
 * @param {string} key
 * @param {string} value
 * @param {string=} opt_context
 */
function sendMap(key, value, opt_context) {
  var map = new goog.structs.Map();
  map.set(key, value);
  channel.sendMap(map, opt_context);
  mockClock.tick(0);
}


function hasForwardChannel() {
  return !!getSingleForwardRequest();
}


function hasBackChannel() {
  return !!channel.backChannelRequest_;
}


function hasDeadBackChannelTimer() {
  return goog.isDefAndNotNull(channel.deadBackChannelTimerId_);
}


function assertHasForwardChannel() {
  assertTrue('Forward channel missing.', hasForwardChannel());
}


function assertHasBackChannel() {
  assertTrue('Back channel missing.', hasBackChannel());
}


function testConnect() {
  connect();
  assertEquals(goog.labs.net.webChannel.WebChannelBase.State.OPENED,
      channel.getState());
  // If the server specifies no version, the client assumes the latest version
  assertEquals(goog.labs.net.webChannel.Wire.LATEST_CHANNEL_VERSION,
               channel.channelVersion_);
  assertFalse(channel.isBuffered());
}

function testConnect_backChannelEstablished() {
  connect();
  assertHasBackChannel();
}

function testConnect_withServerHostPrefix() {
  connect(undefined, 'serverHostPrefix');
  assertEquals('serverHostPrefix', channel.hostPrefix_);
}

function testConnect_withClientHostPrefix() {
  handler.correctHostPrefix = function(hostPrefix) {
    return 'clientHostPrefix';
  };
  connect();
  assertEquals('clientHostPrefix', channel.hostPrefix_);
}

function testConnect_overrideServerHostPrefix() {
  handler.correctHostPrefix = function(hostPrefix) {
    return 'clientHostPrefix';
  };
  connect(undefined, 'serverHostPrefix');
  assertEquals('clientHostPrefix', channel.hostPrefix_);
}

function testConnect_withServerVersion() {
  connect(8);
  assertEquals(8, channel.channelVersion_);
}

function testConnect_notOkToMakeRequestForTest() {
  handler.okToMakeRequest = goog.functions.constant(
      goog.labs.net.webChannel.WebChannelBase.Error.NETWORK);
  channel.connect('/test', '/bind', null);
  mockClock.tick(0);
  assertEquals(goog.labs.net.webChannel.WebChannelBase.State.CLOSED,
               channel.getState());
}

function testConnect_notOkToMakeRequestForBind() {
  channel.connect('/test', '/bind', null);
  mockClock.tick(0);
  completeTestConnection();
  handler.okToMakeRequest = goog.functions.constant(
      goog.labs.net.webChannel.WebChannelBase.Error.NETWORK);
  completeForwardChannel();
  assertEquals(goog.labs.net.webChannel.WebChannelBase.State.CLOSED,
               channel.getState());
}


function testSendMap() {
  connect();
  sendMapOnce();
}


function testSendMapWithSpdyEnabled() {
  connect(undefined, undefined, undefined, true);
  sendMapOnce();
}


function sendMapOnce() {
  assertEquals(1, numTimingEvents);
  sendMap('foo', 'bar');
  responseDone();
  assertEquals(2, numTimingEvents);
  assertEquals('foo:bar', formatArrayOfMaps(deliveredMaps));
}


function testSendMap_twice() {
  connect();
  sendMapTwice();
}


function testSendMap_twiceWithSpdyEnabled() {
  connect(undefined, undefined, undefined, true);
  sendMapTwice();
}


function sendMapTwice() {
  sendMap('foo1', 'bar1');
  responseDone();
  assertEquals('foo1:bar1', formatArrayOfMaps(deliveredMaps));
  sendMap('foo2', 'bar2');
  responseDone();
  assertEquals('foo2:bar2', formatArrayOfMaps(deliveredMaps));
}


function testSendMap_andReceive() {
  connect();
  sendMap('foo', 'bar');
  responseDone();
  receive('["the server reply"]');
}


function testReceive() {
  connect();
  receive('["message from server"]');
  assertHasBackChannel();
}


function testReceive_twice() {
  connect();
  receive('["message one from server"]');
  receive('["message two from server"]');
  assertHasBackChannel();
}


function testReceive_andSendMap() {
  connect();
  receive('["the server reply"]');
  sendMap('foo', 'bar');
  responseDone();
  assertHasBackChannel();
}


function testBackChannelRemainsEstablished_afterSingleSendMap() {
  connect();

  sendMap('foo', 'bar');
  responseDone();
  receive('["ack"]');

  assertHasBackChannel();
}


function testBackChannelRemainsEstablished_afterDoubleSendMap() {
  connect();

  sendMap('foo1', 'bar1');
  sendMap('foo2', 'bar2');
  responseDone();
  receive('["ack"]');

  // This assertion would fail prior to CL 13302660.
  assertHasBackChannel();
}


function testTimingEvent() {
  connect();
  assertEquals(1, numTimingEvents);
  sendMap('', '');
  assertEquals(1, numTimingEvents);
  mockClock.tick(20);
  var expSize = getSingleForwardRequest().getPostData().length;
  responseDone();

  assertEquals(2, numTimingEvents);
  assertEquals(expSize, lastPostSize);
  assertEquals(20, lastPostRtt);
  assertEquals(0, lastPostRetryCount);

  sendMap('abcdefg', '123456');
  expSize = getSingleForwardRequest().getPostData().length;
  responseTimeout();
  assertEquals(2, numTimingEvents);
  mockClock.tick(RETRY_TIME + 1);
  responseDone();
  assertEquals(3, numTimingEvents);
  assertEquals(expSize, lastPostSize);
  assertEquals(1, lastPostRetryCount);
  assertEquals(1, lastPostRtt);

}


/**
 * Make sure that dropping the forward channel retry limit below the retry count
 * reports an error, and prevents another request from firing.
 */
function testSetFailFastWhileWaitingForRetry() {
  stubNetUtils();

  connect();
  setFailFastWhileWaitingForRetry();
}


function testSetFailFastWhileWaitingForRetryWithSpdyEnabled() {
  stubNetUtils();

  connect(undefined, undefined, undefined, true);
  setFailFastWhileWaitingForRetry();
}


function setFailFastWhileWaitingForRetry() {
  assertEquals(1, numTimingEvents);

  sendMap('foo', 'bar');
  assertNull(channel.forwardChannelTimerId_);
  assertNotNull(getSingleForwardRequest());
  assertEquals(0, channel.forwardChannelRetryCount_);

  // Watchdog timeout.
  responseTimeout();
  assertNotNull(channel.forwardChannelTimerId_);
  assertNull(getSingleForwardRequest());
  assertEquals(1, channel.forwardChannelRetryCount_);

  // Almost finish the between-retry timeout.
  mockClock.tick(RETRY_TIME - 1);
  assertNotNull(channel.forwardChannelTimerId_);
  assertNull(getSingleForwardRequest());
  assertEquals(1, channel.forwardChannelRetryCount_);

  // Setting max retries to 0 should cancel the timer and raise an error.
  channel.setFailFast(true);
  assertNull(channel.forwardChannelTimerId_);
  assertNull(getSingleForwardRequest());
  assertEquals(1, channel.forwardChannelRetryCount_);

  assertTrue(gotError);
  assertEquals(0, deliveredMaps.length);
  // We get the error immediately before starting to ping google.com.
  // Simulate that timing out. We should get a network error in addition to the
  // initial failure.
  gotError = false;
  mockClock.tick(goog.labs.net.webChannel.netUtils.NETWORK_TIMEOUT);
  assertTrue('No error after network ping timed out.', gotError);

  // Make sure no more retry timers are firing.
  mockClock.tick(ALL_DAY_MS);
  assertNull(channel.forwardChannelTimerId_);
  assertNull(getSingleForwardRequest());
  assertEquals(1, channel.forwardChannelRetryCount_);
  assertEquals(1, numTimingEvents);
}


/**
 * Make sure that dropping the forward channel retry limit below the retry count
 * reports an error, and prevents another request from firing.
 */
function testSetFailFastWhileRetryXhrIsInFlight() {
  stubNetUtils();

  connect();
  setFailFastWhileRetryXhrIsInFlight();
}


function testSetFailFastWhileRetryXhrIsInFlightWithSpdyEnabled() {
  stubNetUtils();

  connect(undefined, undefined, undefined, true);
  setFailFastWhileRetryXhrIsInFlight();
}


function setFailFastWhileRetryXhrIsInFlight() {
  assertEquals(1, numTimingEvents);

  sendMap('foo', 'bar');
  assertNull(channel.forwardChannelTimerId_);
  assertNotNull(getSingleForwardRequest());
  assertEquals(0, channel.forwardChannelRetryCount_);

  // Watchdog timeout.
  responseTimeout();
  assertNotNull(channel.forwardChannelTimerId_);
  assertNull(getSingleForwardRequest());
  assertEquals(1, channel.forwardChannelRetryCount_);

  // Wait for the between-retry timeout.
  mockClock.tick(RETRY_TIME);
  assertNull(channel.forwardChannelTimerId_);
  assertNotNull(getSingleForwardRequest());
  assertEquals(1, channel.forwardChannelRetryCount_);

  // Simulate a second watchdog timeout.
  responseTimeout();
  assertNotNull(channel.forwardChannelTimerId_);
  assertNull(getSingleForwardRequest());
  assertEquals(2, channel.forwardChannelRetryCount_);

  // Wait for another between-retry timeout.
  mockClock.tick(RETRY_TIME);
  // Now the third req is in flight.
  assertNull(channel.forwardChannelTimerId_);
  assertNotNull(getSingleForwardRequest());
  assertEquals(2, channel.forwardChannelRetryCount_);

  // Set fail fast, killing the request
  channel.setFailFast(true);
  assertNull(channel.forwardChannelTimerId_);
  assertNull(getSingleForwardRequest());
  assertEquals(2, channel.forwardChannelRetryCount_);

  assertTrue(gotError);
  // We get the error immediately before starting to ping google.com.
  // Simulate that timing out. We should get a network error in addition to the
  gotError = false;
  mockClock.tick(goog.labs.net.webChannel.netUtils.NETWORK_TIMEOUT);
  assertTrue('No error after network ping timed out.', gotError);

  // Make sure no more retry timers are firing.
  mockClock.tick(ALL_DAY_MS);
  assertNull(channel.forwardChannelTimerId_);
  assertNull(getSingleForwardRequest());
  assertEquals(2, channel.forwardChannelRetryCount_);
  assertEquals(1, numTimingEvents);
}


/**
 * Makes sure that setting fail fast while not retrying doesn't cause a failure.
 */
function testSetFailFastAtRetryCount() {
  stubNetUtils();

  connect();
  assertEquals(1, numTimingEvents);

  sendMap('foo', 'bar');
  assertNull(channel.forwardChannelTimerId_);
  assertNotNull(getSingleForwardRequest());
  assertEquals(0, channel.forwardChannelRetryCount_);

  // Set fail fast.
  channel.setFailFast(true);
  // Request should still be alive.
  assertNull(channel.forwardChannelTimerId_);
  assertNotNull(getSingleForwardRequest());
  assertEquals(0, channel.forwardChannelRetryCount_);

  // Watchdog timeout. Now we should get an error.
  responseTimeout();
  assertNull(channel.forwardChannelTimerId_);
  assertNull(getSingleForwardRequest());
  assertEquals(0, channel.forwardChannelRetryCount_);

  assertTrue(gotError);
  // We get the error immediately before starting to ping google.com.
  // Simulate that timing out. We should get a network error in addition to the
  // initial failure.
  gotError = false;
  mockClock.tick(goog.labs.net.webChannel.netUtils.NETWORK_TIMEOUT);
  assertTrue('No error after network ping timed out.', gotError);

  // Make sure no more retry timers are firing.
  mockClock.tick(ALL_DAY_MS);
  assertNull(channel.forwardChannelTimerId_);
  assertNull(getSingleForwardRequest());
  assertEquals(0, channel.forwardChannelRetryCount_);
  assertEquals(1, numTimingEvents);
}


function testRequestFailedClosesChannel() {
  stubNetUtils();

  connect();
  requestFailedClosesChannel();
}


function testRequestFailedClosesChannelWithSpdyEnabled() {
  stubNetUtils();

  connect(undefined, undefined, undefined, true);
  requestFailedClosesChannel();
}


function requestFailedClosesChannel() {
  assertEquals(1, numTimingEvents);

  sendMap('foo', 'bar');
  responseRequestFailed();

  assertEquals('Should be closed immediately after request failed.',
      goog.labs.net.webChannel.WebChannelBase.State.CLOSED, channel.getState());

  mockClock.tick(goog.labs.net.webChannel.netUtils.NETWORK_TIMEOUT);

  assertEquals('Should remain closed after the ping timeout.',
      goog.labs.net.webChannel.WebChannelBase.State.CLOSED, channel.getState());
  assertEquals(1, numTimingEvents);
}


function testStatEventReportedOnlyOnce() {
  stubNetUtils();

  connect();
  sendMap('foo', 'bar');
  numStatEvents = 0;
  lastStatEvent = null;
  responseUnknownSessionId();

  assertEquals(1, numStatEvents);
  assertEquals(goog.labs.net.webChannel.requestStats.Stat.ERROR_OTHER,
      lastStatEvent);

  numStatEvents = 0;
  mockClock.tick(goog.labs.net.webChannel.netUtils.NETWORK_TIMEOUT);
  assertEquals('No new stat events should be reported.', 0, numStatEvents);
}


function testStatEventReportedOnlyOnce_onNetworkUp() {
  stubNetUtils();

  connect();
  sendMap('foo', 'bar');
  numStatEvents = 0;
  lastStatEvent = null;
  responseRequestFailed();

  assertEquals('No stat event should be reported before we know the reason.',
      0, numStatEvents);

  // Let the ping time out.
  mockClock.tick(goog.labs.net.webChannel.netUtils.NETWORK_TIMEOUT);

  // Assert we report the correct stat event.
  assertEquals(1, numStatEvents);
  assertEquals(
      goog.labs.net.webChannel.requestStats.Stat.ERROR_NETWORK,
      lastStatEvent);
}


function testStatEventReportedOnlyOnce_onNetworkDown() {
  stubNetUtils();

  connect();
  sendMap('foo', 'bar');
  numStatEvents = 0;
  lastStatEvent = null;
  responseRequestFailed();

  assertEquals('No stat event should be reported before we know the reason.',
      0, numStatEvents);

  // Wait half the ping timeout period, and then fake the network being up.
  mockClock.tick(goog.labs.net.webChannel.netUtils.NETWORK_TIMEOUT / 2);
  channel.testNetworkCallback_(true);

  // Assert we report the correct stat event.
  assertEquals(1, numStatEvents);
  assertEquals(goog.labs.net.webChannel.requestStats.Stat.ERROR_OTHER,
      lastStatEvent);
}


function testOutgoingMapsAwaitsResponse() {
  connect();
  outgoingMapsAwaitsResponse();
}


function testOutgoingMapsAwaitsResponseWithSpdyEnabled() {
  connect(undefined, undefined, undefined, true);
  outgoingMapsAwaitsResponse();
}


function outgoingMapsAwaitsResponse() {
  assertEquals(0, channel.outgoingMaps_.length);

  sendMap('foo1', 'bar');
  assertEquals(0, channel.outgoingMaps_.length);
  sendMap('foo2', 'bar');
  assertEquals(1, channel.outgoingMaps_.length);
  sendMap('foo3', 'bar');
  assertEquals(2, channel.outgoingMaps_.length);
  sendMap('foo4', 'bar');
  assertEquals(3, channel.outgoingMaps_.length);

  responseDone();
  // Now the forward channel request is completed and a new started, so all maps
  // are dequeued from the array of outgoing maps into this new forward request.
  assertEquals(0, channel.outgoingMaps_.length);
}


function testUndeliveredMaps_doesNotNotifyWhenSuccessful() {
  /**
   * @suppress {checkTypes} The callback function type declaration is skipped.
   */
  handler.channelClosed = function(
      channel, opt_pendingMaps, opt_undeliveredMaps) {
    if (opt_pendingMaps || opt_undeliveredMaps) {
      fail('No pending or undelivered maps should be reported.');
    }
  };

  connect();
  sendMap('foo1', 'bar1');
  responseDone();
  sendMap('foo2', 'bar2');
  responseDone();
  disconnect();
}


function testUndeliveredMaps_doesNotNotifyIfNothingWasSent() {
  /**
   * @suppress {checkTypes} The callback function type declaration is skipped.
   */
  handler.channelClosed = function(
      channel, opt_pendingMaps, opt_undeliveredMaps) {
    if (opt_pendingMaps || opt_undeliveredMaps) {
      fail('No pending or undelivered maps should be reported.');
    }
  };

  connect();
  mockClock.tick(ALL_DAY_MS);
  disconnect();
}


function testUndeliveredMaps_clearsPendingMapsAfterNotifying() {
  connect();
  sendMap('foo1', 'bar1');
  sendMap('foo2', 'bar2');
  sendMap('foo3', 'bar3');

  assertEquals(1, channel.pendingMaps_.length);
  assertEquals(2, channel.outgoingMaps_.length);

  disconnect();

  assertEquals(0, channel.pendingMaps_.length);
  assertEquals(0, channel.outgoingMaps_.length);
}


function testUndeliveredMaps_notifiesWithContext() {
  connect();

  // First send two messages that succeed.
  sendMap('foo1', 'bar1', 'context1');
  responseDone();
  sendMap('foo2', 'bar2', 'context2');
  responseDone();

  // Pretend the server hangs and no longer responds.
  sendMap('foo3', 'bar3', 'context3');
  sendMap('foo4', 'bar4', 'context4');
  sendMap('foo5', 'bar5', 'context5');

  // Give up.
  disconnect();

  // Assert that we are informed of any undelivered messages; both about
  // #3 that was sent but which we don't know if the server received, and
  // #4 and #5 which remain in the outgoing maps and have not yet been sent.
  assertEquals('foo3:bar3:context3', handler.pendingMapsString);
  assertEquals('foo4:bar4:context4, foo5:bar5:context5',
      handler.undeliveredMapsString);
}


function testUndeliveredMaps_serviceUnavailable() {
  // Send a few maps, and let one fail.
  connect();
  sendMap('foo1', 'bar1');
  responseDone();
  sendMap('foo2', 'bar2');
  responseRequestFailed();

  // After a failure, the channel should be closed.
  disconnect();

  assertEquals('foo2:bar2', handler.pendingMapsString);
  assertEquals('', handler.undeliveredMapsString);
}


function testUndeliveredMaps_onPingTimeout() {
  stubNetUtils();

  connect();

  // Send a message.
  sendMap('foo1', 'bar1');

  // Fake REQUEST_FAILED, triggering a ping to check the network.
  responseRequestFailed();

  // Let the ping time out, unsuccessfully.
  mockClock.tick(goog.labs.net.webChannel.netUtils.NETWORK_TIMEOUT);

  // Assert channel is closed.
  assertEquals(goog.labs.net.webChannel.WebChannelBase.State.CLOSED,
      channel.getState());

  // Assert that the handler is notified about the undelivered messages.
  assertEquals('foo1:bar1', handler.pendingMapsString);
  assertEquals('', handler.undeliveredMapsString);
}


function testResponseNoBackchannelPostNotBeforeBackchannel() {
  connect(8);
  sendMap('foo1', 'bar1');

  mockClock.tick(10);
  assertFalse(channel.backChannelRequest_.getRequestStartTime() <
      getSingleForwardRequest().getRequestStartTime());
  responseNoBackchannel();
  assertNotEquals(
      goog.labs.net.webChannel.requestStats.Stat.BACKCHANNEL_MISSING,
      lastStatEvent);
}


function testResponseNoBackchannel() {
  connect(8);
  sendMap('foo1', 'bar1');
  response(-1, 0);
  mockClock.tick(goog.labs.net.webChannel.WebChannelBase.RTT_ESTIMATE + 1);
  sendMap('foo2', 'bar2');
  assertTrue(channel.backChannelRequest_.getRequestStartTime() +
      goog.labs.net.webChannel.WebChannelBase.RTT_ESTIMATE <
      getSingleForwardRequest().getRequestStartTime());
  responseNoBackchannel();
  assertEquals(
      goog.labs.net.webChannel.requestStats.Stat.BACKCHANNEL_MISSING,
      lastStatEvent);
}


function testResponseNoBackchannelWithNoBackchannel() {
  connect(8);
  sendMap('foo1', 'bar1');
  assertNull(channel.backChannelTimerId_);
  channel.backChannelRequest_.cancel();
  channel.backChannelRequest_ = null;
  responseNoBackchannel();
  assertEquals(
      goog.labs.net.webChannel.requestStats.Stat.BACKCHANNEL_MISSING,
      lastStatEvent);
}


function testResponseNoBackchannelWithStartTimer() {
  connect(8);
  sendMap('foo1', 'bar1');

  channel.backChannelRequest_.cancel();
  channel.backChannelRequest_ = null;
  channel.backChannelTimerId_ = 123;
  responseNoBackchannel();
  assertNotEquals(
      goog.labs.net.webChannel.requestStats.Stat.BACKCHANNEL_MISSING,
      lastStatEvent);
}


function testResponseWithNoArraySent() {
  connect(8);
  sendMap('foo1', 'bar1');

  // Send a response as if the server hasn't sent down an array.
  response(-1, 0);

  // POST response with an array ID lower than our last received is OK.
  assertEquals(1, channel.lastArrayId_);
  assertEquals(-1, channel.lastPostResponseArrayId_);
}


function testResponseWithArraysMissing() {
  connect(8);
  sendMap('foo1', 'bar1');
  assertEquals(-1, channel.lastPostResponseArrayId_);

  // Send a response as if the server has sent down seven arrays.
  response(7, 111);

  assertEquals(1, channel.lastArrayId_);
  assertEquals(7, channel.lastPostResponseArrayId_);
  mockClock.tick(goog.labs.net.webChannel.WebChannelBase.RTT_ESTIMATE * 2);
  assertEquals(
      goog.labs.net.webChannel.requestStats.Stat.BACKCHANNEL_DEAD,
      lastStatEvent);
}


function testMultipleResponsesWithArraysMissing() {
  connect(8);
  sendMap('foo1', 'bar1');
  assertEquals(-1, channel.lastPostResponseArrayId_);

  // Send a response as if the server has sent down seven arrays.
  response(7, 111);

  assertEquals(1, channel.lastArrayId_);
  assertEquals(7, channel.lastPostResponseArrayId_);
  sendMap('foo2', 'bar2');
  mockClock.tick(goog.labs.net.webChannel.WebChannelBase.RTT_ESTIMATE);
  response(8, 119);
  mockClock.tick(goog.labs.net.webChannel.WebChannelBase.RTT_ESTIMATE);
  // The original timer should still fire.
  assertEquals(
      goog.labs.net.webChannel.requestStats.Stat.BACKCHANNEL_DEAD,
      lastStatEvent);
}


function testOnlyRetryOnceBasedOnResponse() {
  connect(8);
  sendMap('foo1', 'bar1');
  assertEquals(-1, channel.lastPostResponseArrayId_);

  // Send a response as if the server has sent down seven arrays.
  response(7, 111);

  assertEquals(1, channel.lastArrayId_);
  assertEquals(7, channel.lastPostResponseArrayId_);
  assertTrue(hasDeadBackChannelTimer());
  mockClock.tick(goog.labs.net.webChannel.WebChannelBase.RTT_ESTIMATE * 2);
  assertEquals(
      goog.labs.net.webChannel.requestStats.Stat.BACKCHANNEL_DEAD,
      lastStatEvent);
  assertEquals(1, channel.backChannelRetryCount_);
  mockClock.tick(goog.labs.net.webChannel.WebChannelBase.RTT_ESTIMATE);
  sendMap('foo2', 'bar2');
  assertFalse(hasDeadBackChannelTimer());
  response(8, 119);
  assertFalse(hasDeadBackChannelTimer());
}


function testResponseWithArraysMissingAndLiveChannel() {
  connect(8);
  sendMap('foo1', 'bar1');
  assertEquals(-1, channel.lastPostResponseArrayId_);

  // Send a response as if the server has sent down seven arrays.
  response(7, 111);

  assertEquals(1, channel.lastArrayId_);
  assertEquals(7, channel.lastPostResponseArrayId_);
  mockClock.tick(goog.labs.net.webChannel.WebChannelBase.RTT_ESTIMATE);
  assertTrue(hasDeadBackChannelTimer());
  receive('["ack"]');
  assertFalse(hasDeadBackChannelTimer());
  mockClock.tick(goog.labs.net.webChannel.WebChannelBase.RTT_ESTIMATE);
  assertNotEquals(
      goog.labs.net.webChannel.requestStats.Stat.BACKCHANNEL_DEAD,
      lastStatEvent);
}


function testResponseWithBigOutstandingData() {
  connect(8);
  sendMap('foo1', 'bar1');
  assertEquals(-1, channel.lastPostResponseArrayId_);

  // Send a response as if the server has sent down seven arrays and 50kbytes.
  response(7, 50000);

  assertEquals(1, channel.lastArrayId_);
  assertEquals(7, channel.lastPostResponseArrayId_);
  assertFalse(hasDeadBackChannelTimer());
  mockClock.tick(goog.labs.net.webChannel.WebChannelBase.RTT_ESTIMATE * 2);
  assertNotEquals(
      goog.labs.net.webChannel.requestStats.Stat.BACKCHANNEL_DEAD,
      lastStatEvent);
}


function testResponseInBufferedMode() {
  connect(8);
  channel.useChunked_ = false;
  sendMap('foo1', 'bar1');
  assertEquals(-1, channel.lastPostResponseArrayId_);
  response(7, 111);

  assertEquals(1, channel.lastArrayId_);
  assertEquals(7, channel.lastPostResponseArrayId_);
  assertFalse(hasDeadBackChannelTimer());
  mockClock.tick(goog.labs.net.webChannel.WebChannelBase.RTT_ESTIMATE * 2);
  assertNotEquals(
      goog.labs.net.webChannel.requestStats.Stat.BACKCHANNEL_DEAD,
      lastStatEvent);
}


function testResponseWithGarbage() {
  connect(8);
  sendMap('foo1', 'bar1');
  channel.onRequestData(
      getSingleForwardRequest(),
      'garbage'
  );
  assertEquals(goog.labs.net.webChannel.WebChannelBase.State.CLOSED,
      channel.getState());
}


function testResponseWithGarbageInArray() {
  connect(8);
  sendMap('foo1', 'bar1');
  channel.onRequestData(
      getSingleForwardRequest(),
      '["garbage"]'
  );
  assertEquals(goog.labs.net.webChannel.WebChannelBase.State.CLOSED,
      channel.getState());
}


function testResponseWithEvilData() {
  connect(8);
  sendMap('foo1', 'bar1');
  channel.onRequestData(
      getSingleForwardRequest(),
      'foo=<script>evil()\<\/script>&' + 'bar=<script>moreEvil()\<\/script>');
  assertEquals(goog.labs.net.webChannel.WebChannelBase.State.CLOSED,
      channel.getState());
}


function testPathAbsolute() {
  connect(8, undefined, '/talkgadget');
  assertEquals(channel.backChannelUri_.getDomain(),
      window.location.hostname);
  assertEquals(channel.forwardChannelUri_.getDomain(),
      window.location.hostname);
}


function testPathRelative() {
  connect(8, undefined, 'talkgadget');
  assertEquals(channel.backChannelUri_.getDomain(),
      window.location.hostname);
  assertEquals(channel.forwardChannelUri_.getDomain(),
      window.location.hostname);
}


function testPathWithHost() {
  connect(8, undefined, 'https://example.com');
  assertEquals(channel.backChannelUri_.getScheme(), 'https');
  assertEquals(channel.backChannelUri_.getDomain(), 'example.com');
  assertEquals(channel.forwardChannelUri_.getScheme(), 'https');
  assertEquals(channel.forwardChannelUri_.getDomain(), 'example.com');
}

function testCreateXhrIo() {
  var xhr = channel.createXhrIo(null);
  assertFalse(xhr.getWithCredentials());

  assertThrows(
      'Error connection to different host without CORS',
      goog.bind(channel.createXhrIo, channel, 'some_host'));

  channel.setSupportsCrossDomainXhrs(true);

  xhr = channel.createXhrIo(null);
  assertTrue(xhr.getWithCredentials());

  xhr = channel.createXhrIo('some_host');
  assertTrue(xhr.getWithCredentials());
}

function testSpdyLimitOption() {
  var webChannelTransport =
      new goog.labs.net.webChannel.WebChannelBaseTransport();
  stubSpdyCheck(true);
  var webChannelDefault = webChannelTransport.createWebChannel('/foo');
  assertEquals(10,
      webChannelDefault.getRuntimeProperties().getConcurrentRequestLimit());
  assertTrue(webChannelDefault.getRuntimeProperties().isSpdyEnabled());

  var options = {'concurrentRequestLimit': 100};

  stubSpdyCheck(false);
  var webChannelDisabled = webChannelTransport.createWebChannel(
      '/foo', options);
  assertEquals(1,
      webChannelDisabled.getRuntimeProperties().getConcurrentRequestLimit());
  assertFalse(webChannelDisabled.getRuntimeProperties().isSpdyEnabled());

  stubSpdyCheck(true);
  var webChannelEnabled = webChannelTransport.createWebChannel('/foo', options);
  assertEquals(100,
      webChannelEnabled.getRuntimeProperties().getConcurrentRequestLimit());
  assertTrue(webChannelEnabled.getRuntimeProperties().isSpdyEnabled());
}
