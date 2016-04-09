// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.net.NetworkTesterTest');
goog.setTestOnly('goog.net.NetworkTesterTest');

goog.require('goog.Uri');
goog.require('goog.net.NetworkTester');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');

var clock;

function setUp() {
  clock = new goog.testing.MockClock(true);
}

function tearDown() {
  clock.dispose();
}

function testSuccess() {
  // set up the tster
  var handler = new Handler();
  var tester = new goog.net.NetworkTester(handler.callback, handler);
  assertFalse(tester.isRunning());
  tester.start();
  assertTrue(handler.isEmpty());
  assertTrue(tester.isRunning());

  // simulate the image load and verify
  var image = tester.image_;
  assertEquals(String(tester.getUri()), image.src);
  assertTrue(handler.isEmpty());
  image.onload.call(null);
  assertTrue(handler.dequeue());
  assertFalse(tester.isRunning());
}

function testFailure() {
  // set up the tester
  var handler = new Handler();
  var tester = new goog.net.NetworkTester(handler.callback, handler);
  assertFalse(tester.isRunning());
  tester.start();
  assertTrue(handler.isEmpty());
  assertTrue(tester.isRunning());

  // simulate the image failure and verify
  var image = tester.image_;
  assertEquals(String(tester.getUri()), image.src);
  assertTrue(handler.isEmpty());
  image.onerror.call(null);
  assertFalse(handler.dequeue());
  assertFalse(tester.isRunning());
}

function testAbort() {
  // set up the tester
  var handler = new Handler();
  var tester = new goog.net.NetworkTester(handler.callback, handler);
  assertFalse(tester.isRunning());
  tester.start();
  assertTrue(handler.isEmpty());
  assertTrue(tester.isRunning());

  // simulate the image abort and verify
  var image = tester.image_;
  assertEquals(String(tester.getUri()), image.src);
  assertTrue(handler.isEmpty());
  image.onabort.call(null);
  assertFalse(handler.dequeue());
  assertFalse(tester.isRunning());
}

function testTimeout() {
  // set up the tester
  var handler = new Handler();
  var tester = new goog.net.NetworkTester(handler.callback, handler);
  assertFalse(tester.isRunning());
  tester.start();
  assertTrue(handler.isEmpty());
  assertTrue(tester.isRunning());

  // simulate the image timeout and verify
  var image = tester.image_;
  assertEquals(String(tester.getUri()), image.src);
  assertTrue(handler.isEmpty());
  clock.tick(10000);
  assertFalse(handler.dequeue());
  assertFalse(tester.isRunning());
}

function testRetries() {
  // set up the tester
  var handler = new Handler();
  var tester = new goog.net.NetworkTester(handler.callback, handler);
  tester.setNumRetries(1);
  assertEquals(tester.getAttemptCount(), 0);
  assertFalse(tester.isRunning());
  tester.start();
  assertTrue(handler.isEmpty());
  assertTrue(tester.isRunning());
  assertEquals(tester.getAttemptCount(), 1);

  // try number 1 fails
  var image = tester.image_;
  assertEquals(String(tester.getUri()), image.src);
  assertTrue(handler.isEmpty());
  image.onerror.call(null);
  assertTrue(handler.isEmpty());
  assertTrue(tester.isRunning());
  assertEquals(tester.getAttemptCount(), 2);

  // try number 2 succeeds
  image = tester.image_;
  assertEquals(String(tester.getUri()), image.src);
  assertTrue(handler.isEmpty());
  image.onload.call(null);
  assertTrue(handler.dequeue());
  assertFalse(tester.isRunning());
  assertEquals(tester.getAttemptCount(), 2);
}

function testPauseBetweenRetries() {
  // set up the tester
  var handler = new Handler();
  var tester = new goog.net.NetworkTester(handler.callback, handler);
  tester.setNumRetries(1);
  tester.setPauseBetweenRetries(1000);
  assertFalse(tester.isRunning());
  tester.start();
  assertTrue(handler.isEmpty());
  assertTrue(tester.isRunning());

  // try number 1 fails
  var image = tester.image_;
  assertEquals(String(tester.getUri()), image.src);
  assertTrue(handler.isEmpty());
  image.onerror.call(null);
  assertTrue(handler.isEmpty());
  assertTrue(tester.isRunning());

  // need to pause 1000 ms for the second attempt
  assertNull(tester.image_);
  clock.tick(1000);

  // try number 2 succeeds
  image = tester.image_;
  assertEquals(String(tester.getUri()), image.src);
  assertTrue(handler.isEmpty());
  image.onload.call(null);
  assertTrue(handler.dequeue());
  assertFalse(tester.isRunning());
}

function testNonDefaultUri() {
  var handler = new Handler();
  var newUri = new goog.Uri('//www.google.com/images/cleardot2.gif');
  var tester = new goog.net.NetworkTester(handler.callback, handler, newUri);
  var testerUri = tester.getUri();
  assertTrue(testerUri.toString().indexOf('cleardot2') > -1);
}

function testOffline() {
  // set up the tester
  var handler = new Handler();
  var tester = new goog.net.NetworkTester(handler.callback, handler);
  var orgGetNavigatorOffline = goog.net.NetworkTester.getNavigatorOffline_;
  goog.net.NetworkTester.getNavigatorOffline_ = function() { return true; };
  try {
    assertFalse(tester.isRunning());
    tester.start();
    assertTrue(handler.isEmpty());
    assertTrue(tester.isRunning());

    // the call is done async
    clock.tick(1);

    assertFalse(handler.dequeue());
    assertFalse(tester.isRunning());
  } finally {
    // Clean up!
    goog.net.NetworkTester.getNavigatorOffline_ = orgGetNavigatorOffline;
  }
}

// Handler object for verifying callback
function Handler() {
  this.events_ = [];
}

function testGetAttemptCount() {
  // set up the tester
  var handler = new Handler();
  var tester = new goog.net.NetworkTester(handler.callback, handler);
  assertEquals(tester.getAttemptCount(), 0);
  assertTrue(tester.attempt_ === tester.getAttemptCount());
  assertFalse(tester.isRunning());
  tester.start();
  assertTrue(tester.isRunning());
  assertTrue(tester.attempt_ === tester.getAttemptCount());
}

Handler.prototype.callback = function(result) {
  this.events_.push(result);
};

Handler.prototype.isEmpty = function() {
  return this.events_.length == 0;
};

Handler.prototype.dequeue = function() {
  if (this.isEmpty()) {
    throw Error('Handler is empty');
  }
  return this.events_.shift();
};

// override image constructor for test - can't use a real image due to
// async load of images - have to simulate it
function Image() {}
