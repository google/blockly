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

goog.provide('goog.messaging.LoggerClientTest');
goog.setTestOnly('goog.messaging.LoggerClientTest');

goog.require('goog.debug');
goog.require('goog.debug.Logger');
goog.require('goog.messaging.LoggerClient');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.messaging.MockMessageChannel');

var mockControl;
var channel;
var client;
var logger;

function setUp() {
  goog.debug.FORCE_SLOPPY_STACKS = false;
  mockControl = new goog.testing.MockControl();
  channel = new goog.testing.messaging.MockMessageChannel(mockControl);
  client = new goog.messaging.LoggerClient(channel, 'log');
  logger = goog.debug.Logger.getLogger('test.logging.Object');
}

function tearDown() {
  channel.dispose();
  client.dispose();
}

function testCommand() {
  channel.send('log', {
    name: 'test.logging.Object',
    level: goog.debug.Logger.Level.WARNING.value,
    message: 'foo bar',
    exception: undefined
  });
  mockControl.$replayAll();
  logger.warning('foo bar');
  mockControl.$verifyAll();
}

function testCommandWithException() {
  var ex = Error('oh no');
  ex.stack = ['one', 'two'];
  ex.message0 = 'message 0';
  ex.message1 = 'message 1';
  ex.ignoredProperty = 'ignored';

  channel.send('log', {
    name: 'test.logging.Object',
    level: goog.debug.Logger.Level.WARNING.value,
    message: 'foo bar',
    exception: {
      name: 'Error',
      message: ex.message,
      stack: ex.stack,
      lineNumber: ex.lineNumber || ex.line || 'Not available',
      fileName: ex.fileName || ex.sourceURL || window.location.href,
      message0: ex.message0,
      message1: ex.message1
    }
  });
  mockControl.$replayAll();
  logger.warning('foo bar', ex);
  mockControl.$verifyAll();
}

function testCommandWithStringException() {
  // NOTE: the stack traces won't match with the strict mode compatible
  // stack traces as they are recorded in different locations.
  goog.debug.FORCE_SLOPPY_STACKS = true;

  channel.send('log', {
    name: 'test.logging.Object',
    level: goog.debug.Logger.Level.WARNING.value,
    message: 'foo bar',
    exception: {
      name: 'Unknown error',
      message: 'oh no',
      stack: '[Anonymous](object, foo bar, oh no)\n' +
          '[Anonymous](foo bar, oh no)\n' + goog.debug.getStacktrace(),
      lineNumber: 'Not available',
      fileName: window.location.href
    }
  });
  mockControl.$replayAll();
  logger.warning('foo bar', 'oh no');
  mockControl.$verifyAll();
}
