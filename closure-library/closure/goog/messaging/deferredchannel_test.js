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

goog.provide('goog.messaging.DeferredChannelTest');
goog.setTestOnly('goog.messaging.DeferredChannelTest');

goog.require('goog.async.Deferred');
goog.require('goog.messaging.DeferredChannel');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.async.MockControl');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.messaging.MockMessageChannel');

var mockControl, asyncMockControl;
var mockChannel, deferredChannel;
var cancelled;
var deferred;

function setUp() {
  mockControl = new goog.testing.MockControl();
  asyncMockControl = new goog.testing.async.MockControl(mockControl);
  mockChannel = new goog.testing.messaging.MockMessageChannel(mockControl);
  cancelled = false;
  deferred = new goog.async.Deferred(function() { cancelled = true; });
  deferredChannel = new goog.messaging.DeferredChannel(deferred);
}

function tearDown() {
  mockControl.$verifyAll();
}

function testDeferredResolvedBeforeSend() {
  mockChannel.send('test', 'val');
  mockControl.$replayAll();
  deferred.callback(mockChannel);
  deferredChannel.send('test', 'val');
}

function testDeferredResolvedBeforeRegister() {
  deferred.callback(mockChannel);
  deferredChannel.registerService(
      'test', asyncMockControl.asyncAssertEquals('passes on register', 'val'));
  mockChannel.receive('test', 'val');
}

function testDeferredResolvedBeforeRegisterObject() {
  deferred.callback(mockChannel);
  deferredChannel.registerService(
      'test',
      asyncMockControl.asyncAssertEquals('passes on register', {'key': 'val'}),
      true);
  mockChannel.receive('test', {'key': 'val'});
}

function testDeferredResolvedBeforeRegisterDefault() {
  deferred.callback(mockChannel);
  deferredChannel.registerDefaultService(
      asyncMockControl.asyncAssertEquals('passes on register', 'test', 'val'));
  mockChannel.receive('test', 'val');
}

function testDeferredResolvedAfterSend() {
  mockChannel.send('test', 'val');
  mockControl.$replayAll();
  deferredChannel.send('test', 'val');
  deferred.callback(mockChannel);
}

function testDeferredResolvedAfterRegister() {
  deferredChannel.registerService(
      'test', asyncMockControl.asyncAssertEquals('passes on register', 'val'));
  deferred.callback(mockChannel);
  mockChannel.receive('test', 'val');
}

function testDeferredResolvedAfterRegisterObject() {
  deferredChannel.registerService(
      'test',
      asyncMockControl.asyncAssertEquals('passes on register', {'key': 'val'}),
      true);
  deferred.callback(mockChannel);
  mockChannel.receive('test', {'key': 'val'});
}

function testDeferredResolvedAfterRegisterDefault() {
  deferredChannel.registerDefaultService(
      asyncMockControl.asyncAssertEquals('passes on register', 'test', 'val'));
  deferred.callback(mockChannel);
  mockChannel.receive('test', 'val');
}

function testCancel() {
  deferredChannel.cancel();
  assertTrue(cancelled);
}
