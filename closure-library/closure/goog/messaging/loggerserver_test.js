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

goog.provide('goog.messaging.LoggerServerTest');
goog.setTestOnly('goog.messaging.LoggerServerTest');

goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger');
goog.require('goog.log');
goog.require('goog.log.Level');
goog.require('goog.messaging.LoggerServer');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.messaging.MockMessageChannel');

var mockControl;
var channel;
var stubs;

function setUpPage() {
  stubs = new goog.testing.PropertyReplacer();
}

function setUp() {
  mockControl = new goog.testing.MockControl();
  channel = new goog.testing.messaging.MockMessageChannel(mockControl);
  stubs.set(
      goog.debug.LogManager, 'getLogger',
      mockControl.createFunctionMock('goog.log.getLogger'));
}

function tearDown() {
  channel.dispose();
  stubs.reset();
}

function testCommandWithoutChannelName() {
  var mockLogger = mockControl.createStrictMock(goog.debug.Logger);
  goog.log.getLogger('test.object.Name').$returns(mockLogger);
  goog.log.log(
      mockLogger, goog.log.Level.SEVERE, '[remote logger] foo bar', null);
  mockControl.$replayAll();

  var server = new goog.messaging.LoggerServer(channel, 'log');
  channel.receive('log', {
    name: 'test.object.Name',
    level: goog.log.Level.SEVERE.value,
    message: 'foo bar',
    exception: null
  });
  mockControl.$verifyAll();
  server.dispose();
}

function testCommandWithChannelName() {
  var mockLogger = mockControl.createStrictMock(goog.debug.Logger);
  goog.log.getLogger('test.object.Name').$returns(mockLogger);
  goog.log.log(
      mockLogger, goog.log.Level.SEVERE, '[some channel] foo bar', null);
  mockControl.$replayAll();

  var server = new goog.messaging.LoggerServer(channel, 'log', 'some channel');
  channel.receive('log', {
    name: 'test.object.Name',
    level: goog.log.Level.SEVERE.value,
    message: 'foo bar',
    exception: null
  });
  mockControl.$verifyAll();
  server.dispose();
}

function testCommandWithException() {
  var mockLogger = mockControl.createStrictMock(goog.debug.Logger);
  goog.log.getLogger('test.object.Name').$returns(mockLogger);
  goog.log.log(
      mockLogger, goog.log.Level.SEVERE, '[some channel] foo bar',
      {message: 'Bad things', stack: ['foo', 'bar']});
  mockControl.$replayAll();

  var server = new goog.messaging.LoggerServer(channel, 'log', 'some channel');
  channel.receive('log', {
    name: 'test.object.Name',
    level: goog.log.Level.SEVERE.value,
    message: 'foo bar',
    exception: {message: 'Bad things', stack: ['foo', 'bar']}
  });
  mockControl.$verifyAll();
  server.dispose();
}
