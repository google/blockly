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

goog.provide('goog.debug.LoggerTest');
goog.setTestOnly('goog.debug.LoggerTest');

goog.require('goog.debug.LogManager');
goog.require('goog.debug.Logger');
goog.require('goog.testing.jsunit');

function getDebug(sb, logger, level) {
  var spacer = '';
  if (level) {
    spacer = (new Array(level + 1)).join(' ');
  }
  sb[sb.length] = spacer;
  var name = logger.getName();
  if (name) {
    sb[sb.length] = name;
  } else {
    sb[sb.length] = 'ROOT';
  }
  sb[sb.length] = '\n';
  var children = logger.getChildren();
  for (var key in children) {
    getDebug(sb, children[key], level + 1);
  }
}


function testParents() {
  var l1 = goog.debug.Logger.getLogger('goog.test');
  var l2 = goog.debug.Logger.getLogger('goog.bar');
  var l3 = goog.debug.Logger.getLogger('goog.bar.foo');
  var l4 = goog.debug.Logger.getLogger('goog.bar.baaz');
  var rootLogger = goog.debug.LogManager.getRoot();
  var googLogger = goog.debug.Logger.getLogger('goog');
  assertEquals(rootLogger, googLogger.getParent());
  assertEquals(googLogger, l1.getParent());
  assertEquals(googLogger, l2.getParent());
  assertEquals(l2, l3.getParent());
  assertEquals(l2, l4.getParent());
}

function testLogging() {
  var root = goog.debug.LogManager.getRoot();
  var handler = new TestHandler();
  var f = goog.bind(handler.onPublish, handler);
  root.addHandler(f);
  var l4 = goog.debug.Logger.getLogger('goog.bar.baaz');
  l4.log(goog.debug.Logger.Level.WARNING, 'foo');
  assertNotNull(handler.logRecord);
  assertEquals(goog.debug.Logger.Level.WARNING, handler.logRecord.getLevel());
  assertEquals('foo', handler.logRecord.getMessage());
  handler.logRecord = null;
  root.removeHandler(f);
  l4.log(goog.debug.Logger.Level.WARNING, 'foo');
  assertNull(handler.logRecord);
}

function testFiltering() {
  var root = goog.debug.LogManager.getRoot();
  var handler = new TestHandler();
  var f = goog.bind(handler.onPublish, handler);
  root.addHandler(f);
  var l3 = goog.debug.Logger.getLogger('goog.bar.foo');
  l3.setLevel(goog.debug.Logger.Level.WARNING);
  var l4 = goog.debug.Logger.getLogger('goog.bar.baaz');
  l4.setLevel(goog.debug.Logger.Level.INFO);
  l4.log(goog.debug.Logger.Level.WARNING, 'foo');
  assertNotNull(handler.logRecord);
  assertEquals(goog.debug.Logger.Level.WARNING, handler.logRecord.getLevel());
  assertEquals('foo', handler.logRecord.getMessage());
  handler.reset();
  l3.log(goog.debug.Logger.Level.INFO, 'bar');
  assertNull(handler.logRecord);
  l3.log(goog.debug.Logger.Level.WARNING, 'baaz');
  assertNotNull(handler.logRecord);
  handler.reset();
  l3.log(goog.debug.Logger.Level.SEVERE, 'baaz');
  assertNotNull(handler.logRecord);
}

function testException() {
  var root = goog.debug.LogManager.getRoot();
  var handler = new TestHandler();
  var f = goog.bind(handler.onPublish, handler);
  root.addHandler(f);
  var logger = goog.debug.Logger.getLogger('goog.debug.logger_test');
  var ex = Error('boo!');
  logger.severe('hello', ex);
  assertNotNull(handler.logRecord);
  assertEquals(goog.debug.Logger.Level.SEVERE, handler.logRecord.getLevel());
  assertEquals('hello', handler.logRecord.getMessage());
  assertEquals(ex, handler.logRecord.getException());
  assertEquals('boo!', handler.logRecord.getException().message);
}

function testMessageCallbacks() {
  var root = goog.debug.LogManager.getRoot();
  var handler = new TestHandler();
  var f = goog.bind(handler.onPublish, handler);
  root.addHandler(f);
  var l3 = goog.debug.Logger.getLogger('goog.bar.foo');
  l3.setLevel(goog.debug.Logger.Level.WARNING);

  l3.log(goog.debug.Logger.Level.INFO, function() {
    throw "Message callback shouldn't be called when below logger's level!";
  });
  assertNull(handler.logRecord);

  l3.log(goog.debug.Logger.Level.WARNING, function() {return 'heya'});
  assertNotNull(handler.logRecord);
  assertEquals(goog.debug.Logger.Level.WARNING, handler.logRecord.getLevel());
  assertEquals('heya', handler.logRecord.getMessage());
}

function testGetPredefinedLevel() {
  assertEquals(goog.debug.Logger.Level.OFF,
      goog.debug.Logger.Level.getPredefinedLevel('OFF'));
  assertEquals(goog.debug.Logger.Level.SHOUT,
      goog.debug.Logger.Level.getPredefinedLevel('SHOUT'));
  assertEquals(goog.debug.Logger.Level.SEVERE,
      goog.debug.Logger.Level.getPredefinedLevel('SEVERE'));
  assertEquals(goog.debug.Logger.Level.WARNING,
      goog.debug.Logger.Level.getPredefinedLevel('WARNING'));
  assertEquals(goog.debug.Logger.Level.INFO,
      goog.debug.Logger.Level.getPredefinedLevel('INFO'));
  assertEquals(goog.debug.Logger.Level.CONFIG,
      goog.debug.Logger.Level.getPredefinedLevel('CONFIG'));
  assertEquals(goog.debug.Logger.Level.FINE,
      goog.debug.Logger.Level.getPredefinedLevel('FINE'));
  assertEquals(goog.debug.Logger.Level.FINER,
      goog.debug.Logger.Level.getPredefinedLevel('FINER'));
  assertEquals(goog.debug.Logger.Level.FINEST,
      goog.debug.Logger.Level.getPredefinedLevel('FINEST'));
  assertEquals(goog.debug.Logger.Level.ALL,
      goog.debug.Logger.Level.getPredefinedLevel('ALL'));
}

function testGetPredefinedLevelByValue() {
  assertEquals(goog.debug.Logger.Level.OFF,
      goog.debug.Logger.Level.getPredefinedLevelByValue(Infinity));
  assertEquals(goog.debug.Logger.Level.SHOUT,
      goog.debug.Logger.Level.getPredefinedLevelByValue(1300));
  assertEquals(goog.debug.Logger.Level.SHOUT,
      goog.debug.Logger.Level.getPredefinedLevelByValue(1200));
  assertEquals(goog.debug.Logger.Level.SEVERE,
      goog.debug.Logger.Level.getPredefinedLevelByValue(1150));
  assertEquals(goog.debug.Logger.Level.SEVERE,
      goog.debug.Logger.Level.getPredefinedLevelByValue(1000));
  assertEquals(goog.debug.Logger.Level.WARNING,
      goog.debug.Logger.Level.getPredefinedLevelByValue(900));
  assertEquals(goog.debug.Logger.Level.INFO,
      goog.debug.Logger.Level.getPredefinedLevelByValue(800));
  assertEquals(goog.debug.Logger.Level.CONFIG,
      goog.debug.Logger.Level.getPredefinedLevelByValue(701));
  assertEquals(goog.debug.Logger.Level.CONFIG,
      goog.debug.Logger.Level.getPredefinedLevelByValue(700));
  assertEquals(goog.debug.Logger.Level.FINE,
      goog.debug.Logger.Level.getPredefinedLevelByValue(500));
  assertEquals(goog.debug.Logger.Level.FINER,
      goog.debug.Logger.Level.getPredefinedLevelByValue(400));
  assertEquals(goog.debug.Logger.Level.FINEST,
      goog.debug.Logger.Level.getPredefinedLevelByValue(300));
  assertEquals(goog.debug.Logger.Level.ALL,
      goog.debug.Logger.Level.getPredefinedLevelByValue(0));
  assertNull(goog.debug.Logger.Level.getPredefinedLevelByValue(-1));
}

function TestHandler() {
  this.logRecord = null;
}

TestHandler.prototype.onPublish = function(logRecord) {
  this.logRecord = logRecord;
};


TestHandler.prototype.reset = function() {
  this.logRecord = null;
};

function testGetLogRecord() {
  var name = 'test.get.log.record';
  var level = 1;
  var msg = 'msg';

  var logger = goog.debug.Logger.getLogger(name);
  var logRecord = logger.getLogRecord(level, msg);

  assertEquals(name, logRecord.getLoggerName());
  assertEquals(level, logRecord.getLevel());
  assertEquals(msg, logRecord.getMessage());

  assertNull(logRecord.getException());
}

function testGetLogRecordWithException() {
  var name = 'test.get.log.record';
  var level = 1;
  var msg = 'msg';
  var ex = Error('Hi');

  var logger = goog.debug.Logger.getLogger(name);
  var logRecord = logger.getLogRecord(level, msg, ex);

  assertEquals(name, logRecord.getLoggerName());
  assertEquals(level, logRecord.getLevel());
  assertEquals(msg, logRecord.getMessage());
  assertEquals(ex, logRecord.getException());
}
