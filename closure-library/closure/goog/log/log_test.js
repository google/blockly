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
 * @fileoverview Unit tests for goog.log.
 */

/** @suppress {extraProvide} */
goog.provide('goog.logTest');

goog.require('goog.debug.LogManager');
goog.require('goog.log');
goog.require('goog.log.Level');
goog.require('goog.testing.jsunit');



goog.setTestOnly('goog.logTest');



/**
 * A simple log handler that remembers the last record published.
 * @constructor
 * @private
 */
function TestHandler_() {
  this.logRecord = null;
}

TestHandler_.prototype.onPublish = function(logRecord) {
  this.logRecord = logRecord;
};


TestHandler_.prototype.reset = function() {
  this.logRecord = null;
};


function testParents() {
  var logger2sibling1 = goog.log.getLogger('goog.test');
  var logger2sibling2 = goog.log.getLogger('goog.bar');
  var logger3sibling1 = goog.log.getLogger('goog.bar.foo');
  var logger3siblint2 = goog.log.getLogger('goog.bar.baaz');
  var rootLogger = goog.debug.LogManager.getRoot();
  var googLogger = goog.log.getLogger('goog');
  assertEquals(rootLogger, googLogger.getParent());
  assertEquals(googLogger, logger2sibling1.getParent());
  assertEquals(googLogger, logger2sibling2.getParent());
  assertEquals(logger2sibling2, logger3sibling1.getParent());
  assertEquals(logger2sibling2, logger3siblint2.getParent());
}

function testLogging1() {
  var root = goog.debug.LogManager.getRoot();
  var handler = new TestHandler_();
  var f = goog.bind(handler.onPublish, handler);
  goog.log.addHandler(root, f);
  var logger = goog.log.getLogger('goog.bar.baaz');
  goog.log.log(logger, goog.log.Level.WARNING, 'foo');
  assertNotNull(handler.logRecord);
  assertEquals(goog.log.Level.WARNING, handler.logRecord.getLevel());
  assertEquals('foo', handler.logRecord.getMessage());
  handler.logRecord = null;

  goog.log.removeHandler(root, f);
  goog.log.log(logger, goog.log.Level.WARNING, 'foo');
  assertNull(handler.logRecord);
}

function testLogging2() {
  var root = goog.debug.LogManager.getRoot();
  var handler = new TestHandler_();
  var f = goog.bind(handler.onPublish, handler);
  goog.log.addHandler(root, f);
  var logger = goog.log.getLogger('goog.bar.baaz');
  goog.log.warning(logger, 'foo');
  assertNotNull(handler.logRecord);
  assertEquals(goog.log.Level.WARNING, handler.logRecord.getLevel());
  assertEquals('foo', handler.logRecord.getMessage());
  handler.logRecord = null;

  goog.log.removeHandler(root, f);
  goog.log.log(logger, goog.log.Level.WARNING, 'foo');
  assertNull(handler.logRecord);
}


function testFiltering() {
  var root = goog.debug.LogManager.getRoot();
  var handler = new TestHandler_();
  var f = goog.bind(handler.onPublish, handler);
  root.addHandler(f);
  var logger1 = goog.log.getLogger('goog.bar.foo', goog.log.Level.WARNING);
  var logger2 = goog.log.getLogger('goog.bar.baaz', goog.log.Level.INFO);
  goog.log.warning(logger2, 'foo');
  assertNotNull(handler.logRecord);
  assertEquals(goog.log.Level.WARNING, handler.logRecord.getLevel());
  assertEquals('foo', handler.logRecord.getMessage());
  handler.reset();
  goog.log.info(logger1, 'bar');
  assertNull(handler.logRecord);
  goog.log.warning(logger1, 'baaz');
  assertNotNull(handler.logRecord);
  handler.reset();
  goog.log.error(logger1, 'baaz');
  assertNotNull(handler.logRecord);
}


function testException() {
  var root = goog.debug.LogManager.getRoot();
  var handler = new TestHandler_();
  var f = goog.bind(handler.onPublish, handler);
  root.addHandler(f);
  var logger = goog.log.getLogger('goog.debug.logger_test');
  var ex = Error('boo!');
  goog.log.error(logger, 'hello', ex);
  assertNotNull(handler.logRecord);
  assertEquals(goog.log.Level.SEVERE, handler.logRecord.getLevel());
  assertEquals('hello', handler.logRecord.getMessage());
  assertEquals(ex, handler.logRecord.getException());
}


function testMessageCallbacks() {
  var root = goog.debug.LogManager.getRoot();
  var handler = new TestHandler_();
  var f = goog.bind(handler.onPublish, handler);
  root.addHandler(f);
  var logger = goog.log.getLogger('goog.bar.foo');
  logger.setLevel(goog.log.Level.WARNING);

  logger.log(goog.log.Level.INFO, function() {
    throw "Message callback shouldn't be called when below logger's level!";
  });
  assertNull(handler.logRecord);

  logger.log(goog.log.Level.WARNING, function() { return 'heya' });
  assertNotNull(handler.logRecord);
  assertEquals(goog.log.Level.WARNING, handler.logRecord.getLevel());
  assertEquals('heya', handler.logRecord.getMessage());
}


function testGetLogRecord() {
  var name = 'test.get.log.record';
  var level = goog.log.Level.FINE;
  var msg = 'msg';

  var logger = goog.log.getLogger(name);
  var logRecord = logger.getLogRecord(level, msg);

  assertEquals(name, logRecord.getLoggerName());
  assertEquals(level, logRecord.getLevel());
  assertEquals(msg, logRecord.getMessage());

  assertNull(logRecord.getException());
}

function testGetLogRecordWithException() {
  var name = 'test.get.log.record';
  var level = goog.log.Level.FINE;
  var msg = 'msg';
  var ex = Error('Hi');

  var logger = goog.log.getLogger(name);
  var logRecord = logger.getLogRecord(level, msg, ex);

  assertEquals(name, logRecord.getLoggerName());
  assertEquals(level, logRecord.getLevel());
  assertEquals(msg, logRecord.getMessage());
  assertEquals(ex, logRecord.getException());
}
