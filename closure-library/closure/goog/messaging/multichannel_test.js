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

goog.provide('goog.messaging.MultiChannelTest');
goog.setTestOnly('goog.messaging.MultiChannelTest');

goog.require('goog.messaging.MultiChannel');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.messaging.MockMessageChannel');
goog.require('goog.testing.mockmatchers.IgnoreArgument');

var mockControl;
var mockChannel;
var multiChannel;
var channel1;
var channel2;

function setUp() {
  mockControl = new goog.testing.MockControl();
  mockChannel = new goog.testing.messaging.MockMessageChannel(mockControl);
  multiChannel = new goog.messaging.MultiChannel(mockChannel);
  channel0 = multiChannel.createVirtualChannel('foo');
  channel1 = multiChannel.createVirtualChannel('bar');
}

function expectedFn(name, callback) {
  var ignored = new goog.testing.mockmatchers.IgnoreArgument();
  var fn = mockControl.createFunctionMock(name);
  fn(ignored).$does(function(args) {
    callback.apply(this, args);
  });
  return function() { fn(arguments); };
}

function notExpectedFn() {
  return mockControl.createFunctionMock('notExpectedFn');
}

function assertEqualsFn() {
  var expectedArgs = Array.prototype.slice.call(arguments);
  return expectedFn('assertEqualsFn', function() {
    assertObjectEquals(expectedArgs, Array.prototype.slice.call(arguments));
  });
}

function tearDown() {
  multiChannel.dispose();
  mockControl.$verifyAll();
  assertTrue(mockChannel.disposed);
}

function testSend0() {
  mockChannel.send('foo:fooBar', {foo: 'bar'});
  mockControl.$replayAll();
  channel0.send('fooBar', {foo: 'bar'});
}

function testSend1() {
  mockChannel.send('bar:fooBar', {foo: 'bar'});
  mockControl.$replayAll();
  channel1.send('fooBar', {foo: 'bar'});
}

function testReceive0() {
  channel0.registerService('fooBar', assertEqualsFn('Baz bang'));
  channel1.registerService('fooBar', notExpectedFn());
  mockControl.$replayAll();
  mockChannel.receive('foo:fooBar', 'Baz bang');
}

function testReceive1() {
  channel1.registerService('fooBar', assertEqualsFn('Baz bang'));
  channel0.registerService('fooBar', notExpectedFn());
  mockControl.$replayAll();
  mockChannel.receive('bar:fooBar', 'Baz bang');
}

function testDefaultReceive0() {
  channel0.registerDefaultService(assertEqualsFn('fooBar', 'Baz bang'));
  channel1.registerDefaultService(notExpectedFn());
  mockControl.$replayAll();
  mockChannel.receive('foo:fooBar', 'Baz bang');
}

function testDefaultReceive1() {
  channel1.registerDefaultService(assertEqualsFn('fooBar', 'Baz bang'));
  channel0.registerDefaultService(notExpectedFn());
  mockControl.$replayAll();
  mockChannel.receive('bar:fooBar', 'Baz bang');
}

function testReceiveAfterDisposed() {
  channel0.registerService('fooBar', notExpectedFn());
  mockControl.$replayAll();
  channel0.dispose();
  mockChannel.receive('foo:fooBar', 'Baz bang');
}

function testReceiveAfterParentDisposed() {
  channel0.registerService('fooBar', notExpectedFn());
  mockControl.$replayAll();
  multiChannel.dispose();
  mockChannel.receive('foo:fooBar', 'Baz bang');
}
