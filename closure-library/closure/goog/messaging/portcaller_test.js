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

goog.provide('goog.messaging.PortCallerTest');
goog.setTestOnly('goog.messaging.PortCallerTest');

goog.require('goog.events.EventTarget');
goog.require('goog.messaging.PortCaller');
goog.require('goog.messaging.PortNetwork');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.messaging.MockMessageChannel');

var mockControl;
var mockChannel;
var caller;

function setUp() {
  mockControl = new goog.testing.MockControl();
  mockChannel = new goog.testing.messaging.MockMessageChannel(mockControl);
  caller = new goog.messaging.PortCaller(mockChannel);
}

function tearDown() {
  goog.dispose(caller);
  mockControl.$verifyAll();
}

function MockMessagePort(index, port) {
  MockMessagePort.base(this, 'constructor');
  this.index = index;
  this.port = port;
  this.started = false;
}
goog.inherits(MockMessagePort, goog.events.EventTarget);


MockMessagePort.prototype.start = function() {
  this.started = true;
};

function testGetPort() {
  mockChannel.send(
      goog.messaging.PortNetwork.REQUEST_CONNECTION_SERVICE, 'foo');
  mockControl.$replayAll();
  caller.dial('foo');
}
