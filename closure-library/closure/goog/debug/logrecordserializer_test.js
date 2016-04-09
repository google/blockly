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

goog.provide('goog.debug.logRecordSerializerTest');
goog.setTestOnly('goog.debug.logRecordSerializerTest');

goog.require('goog.debug.LogRecord');
goog.require('goog.debug.Logger');
goog.require('goog.debug.logRecordSerializer');
goog.require('goog.testing.jsunit');

var NOW = 1311484654000;
var SEQ = 1231;

function testBasic() {
  var rec = new goog.debug.LogRecord(
      goog.debug.Logger.Level.FINE, 'An awesome message', 'logger.name', NOW,
      SEQ);
  var thawed = goog.debug.logRecordSerializer.parse(
      goog.debug.logRecordSerializer.serialize(rec));

  assertEquals(goog.debug.Logger.Level.FINE, thawed.getLevel());
  assertEquals('An awesome message', thawed.getMessage());
  assertEquals('logger.name', thawed.getLoggerName());
  assertEquals(NOW, thawed.getMillis());
  assertEquals(SEQ, thawed.getSequenceNumber());
  assertNull(thawed.getException());
}

function testUnsafeParse() {
  var rec = new goog.debug.LogRecord(
      goog.debug.Logger.Level.FINE, 'An awesome message', 'logger.name', NOW,
      SEQ);
  var thawed = goog.debug.logRecordSerializer.parse(
      goog.debug.logRecordSerializer.serialize(rec));

  assertEquals(goog.debug.Logger.Level.FINE, thawed.getLevel());
  assertEquals('An awesome message', thawed.getMessage());
  assertEquals('logger.name', thawed.getLoggerName());
  assertEquals(NOW, thawed.getMillis());
  assertEquals(SEQ, thawed.getSequenceNumber());
  assertNull(thawed.getException());
}

function testWithException() {
  var err = new Error('it broke!');
  var rec = new goog.debug.LogRecord(
      goog.debug.Logger.Level.FINE, 'An awesome message', 'logger.name', NOW,
      SEQ);
  rec.setException(err);
  var thawed = goog.debug.logRecordSerializer.unsafeParse(
      goog.debug.logRecordSerializer.serialize(rec));
  assertEquals(err.message, thawed.getException().message);
}

function testCustomLogLevel() {
  var rec = new goog.debug.LogRecord(
      new goog.debug.Logger.Level('CUSTOM', -1), 'An awesome message',
      'logger.name', NOW, SEQ);
  var thawed = goog.debug.logRecordSerializer.parse(
      goog.debug.logRecordSerializer.serialize(rec));

  assertEquals('CUSTOM', thawed.getLevel().name);
  assertEquals(-1, thawed.getLevel().value);
}

function testWeirdLogLevel() {
  var rec = new goog.debug.LogRecord(
      new goog.debug.Logger.Level('FINE', -1), 'An awesome message',
      'logger.name', NOW, SEQ);
  var thawed = goog.debug.logRecordSerializer.parse(
      goog.debug.logRecordSerializer.serialize(rec));

  assertEquals('FINE', thawed.getLevel().name);
  // Makes sure that the log leve is still -1 even though the name
  // FINE is predefind.
  assertEquals(-1, thawed.getLevel().value);
}
