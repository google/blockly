// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.messaging.PortNetworkTest');
goog.setTestOnly('goog.messaging.PortNetworkTest');

goog.require('goog.Promise');
goog.require('goog.Timer');
goog.require('goog.labs.userAgent.browser');
goog.require('goog.messaging.PortChannel');
goog.require('goog.messaging.PortOperator');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.jsunit');

var timer;

function shouldRunTests() {
  // Something about this test crashes Firefox 41, but not 42. (b/25813662)
  if (goog.labs.userAgent.browser.isFirefox() &&
      goog.labs.userAgent.browser.isVersionOrHigher(41) &&
      !goog.labs.userAgent.browser.isVersionOrHigher(42)) {
    return false;
  }
  return true;
}

function setUpPage() {
  // Use a relatively long timeout because workers can take a while to start up.
  goog.testing.TestCase.getActiveTestCase().promiseTimeout = 5 * 1000;
}

function setUp() {
  timer = new goog.Timer(50);
}

function tearDown() {
  goog.dispose(timer);
}

function testRouteMessageThroughWorkers() {
  if (!('MessageChannel' in goog.global)) {
    return;
  }

  var master = new goog.messaging.PortOperator('main');
  master.addPort(
      'worker1', new goog.messaging.PortChannel(
                     new Worker('testdata/portnetwork_worker1.js')));
  master.addPort(
      'worker2', new goog.messaging.PortChannel(
                     new Worker('testdata/portnetwork_worker2.js')));
  master.addPort(
      'frame', goog.messaging.PortChannel.forEmbeddedWindow(
                   window.frames['inner'], '*', timer));

  var promise = new goog.Promise(function(resolve, reject) {
    master.dial('worker1').registerService('result', resolve, true);
  });
  master.dial('worker2').send('sendToFrame', ['main']);

  return promise
      .then(function(msg) {
        assertArrayEquals(['main', 'worker2', 'frame', 'worker1'], msg);
      })
      .thenAlways(function() { master.dispose(); });
}
