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

goog.provide('goog.messaging.PortOperatorTest');
goog.setTestOnly('goog.messaging.PortOperatorTest');

goog.require('goog.messaging.PortNetwork');
goog.require('goog.messaging.PortOperator');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.messaging.MockMessageChannel');
goog.require('goog.testing.messaging.MockMessagePort');

var stubs;

var mockControl;
var mockChannel1;
var mockChannel2;
var operator;

function setUpPage() {
  stubs = new goog.testing.PropertyReplacer();
}

function setUp() {
  mockControl = new goog.testing.MockControl();
  var index = 0;
  stubs.set(goog.global, 'MessageChannel', function() {
    this.port1 = makeMockPort(index, 1);
    this.port2 = makeMockPort(index, 2);
    index += 1;
  });

  mockChannel1 = new goog.testing.messaging.MockMessageChannel(mockControl);
  mockChannel2 = new goog.testing.messaging.MockMessageChannel(mockControl);
  operator = new goog.messaging.PortOperator('operator');
  operator.addPort('1', mockChannel1);
  operator.addPort('2', mockChannel2);
}

function tearDown() {
  goog.dispose(operator);
  mockControl.$verifyAll();
  stubs.reset();
}

function makeMockPort(index, port) {
  return new goog.testing.messaging.MockMessagePort(
      {index: index, port: port}, mockControl);
}

function testConnectSelfToPortViaRequestConnection() {
  mockChannel1.send(goog.messaging.PortNetwork.GRANT_CONNECTION_SERVICE, {
    success: true, name: 'operator', port: makeMockPort(0, 1)
  });
  mockControl.$replayAll();
  mockChannel1.receive(
      goog.messaging.PortNetwork.REQUEST_CONNECTION_SERVICE, 'operator');
  var port = operator.dial('1').port_;
  assertObjectEquals({index: 0, port: 2}, port.id);
  assertEquals(true, port.started);
}

function testConnectSelfToPortViaGetPort() {
  mockChannel1.send(goog.messaging.PortNetwork.GRANT_CONNECTION_SERVICE, {
    success: true, name: 'operator', port: makeMockPort(0, 1)
  });
  mockControl.$replayAll();
  var port = operator.dial('1').port_;
  assertObjectEquals({index: 0, port: 2}, port.id);
  assertEquals(true, port.started);
}

function testConnectTwoCallers() {
  mockChannel1.send(goog.messaging.PortNetwork.GRANT_CONNECTION_SERVICE, {
    success: true, name: '2', port: makeMockPort(0, 1)
  });
  mockChannel2.send(goog.messaging.PortNetwork.GRANT_CONNECTION_SERVICE, {
    success: true, name: '1', port: makeMockPort(0, 2)
  });
  mockControl.$replayAll();
  mockChannel1.receive(
      goog.messaging.PortNetwork.REQUEST_CONNECTION_SERVICE, '2');
}

function testConnectCallerToNonexistentCaller() {
  mockChannel1.send(goog.messaging.PortNetwork.GRANT_CONNECTION_SERVICE, {
    success: false,
    message: 'Port "1" requested a connection to port "no", which doesn\'t ' +
        'exist'
  });
  mockControl.$replayAll();
  mockChannel1.receive(
      goog.messaging.PortNetwork.REQUEST_CONNECTION_SERVICE, 'no');
}
