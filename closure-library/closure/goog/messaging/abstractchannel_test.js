// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.messaging.AbstractChannelTest');
goog.setTestOnly('goog.messaging.AbstractChannelTest');

goog.require('goog.messaging.AbstractChannel');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.async.MockControl');
goog.require('goog.testing.jsunit');

var mockControl;
var mockWorker;
var asyncMockControl;
var channel;

function setUp() {
  mockControl = new goog.testing.MockControl();
  asyncMockControl = new goog.testing.async.MockControl(mockControl);
  channel = new goog.messaging.AbstractChannel();
}

function tearDown() {
  channel.dispose();
  mockControl.$verifyAll();
}

function testConnect() {
  channel.connect(
      asyncMockControl.createCallbackMock('connectCallback', function() {}));
}

function testIsConnected() {
  assertTrue('Channel should be connected by default', channel.isConnected());
}

function testDeliverString() {
  channel.registerService(
      'foo',
      asyncMockControl.asyncAssertEquals(
          'should pass string to service', 'bar'),
      false /* opt_json */);
  channel.deliver('foo', 'bar');
}

function testDeliverDeserializedString() {
  channel.registerService(
      'foo',
      asyncMockControl.asyncAssertEquals(
          'should pass string to service', '{"bar":"baz"}'),
      false /* opt_json */);
  channel.deliver('foo', {bar: 'baz'});
}

function testDeliverObject() {
  channel.registerService(
      'foo',
      asyncMockControl.asyncAssertEquals(
          'should pass string to service', {bar: 'baz'}),
      true /* opt_json */);
  channel.deliver('foo', {bar: 'baz'});
}

function testDeliverSerializedObject() {
  channel.registerService(
      'foo',
      asyncMockControl.asyncAssertEquals(
          'should pass string to service', {bar: 'baz'}),
      true /* opt_json */);
  channel.deliver('foo', '{"bar":"baz"}');
}
