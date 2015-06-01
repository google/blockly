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

goog.provide('goog.debug.ConsoleTest');
goog.setTestOnly('goog.debug.ConsoleTest');

goog.require('goog.debug.Console');
goog.require('goog.debug.LogRecord');
goog.require('goog.debug.Logger');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');

var debugConsole;
var mockConsole;
var loggerName1;
var logRecord1;
var loggerName2;
var logRecord2;
var loggerName3;
var logRecord3;

function setUp() {
  debugConsole = new goog.debug.Console();

  // Set up a recorder for mockConsole.log
  mockConsole = { log: goog.testing.recordFunction() };
  goog.debug.Console.console_ = mockConsole;

  // Test logger 1.
  loggerName1 = 'this.is.a.logger';
  logRecord1 = new goog.debug.LogRecord(goog.debug.Logger.Level.INFO,
      'this is a statement', loggerName1);

  // Test logger 2.
  loggerName2 = 'name.of.logger';
  logRecord2 = new goog.debug.LogRecord(goog.debug.Logger.Level.WARNING,
      'hey, this is a warning', loggerName2);

  // Test logger 3.
  loggerName3 = 'third.logger';
  logRecord3 = new goog.debug.LogRecord(goog.debug.Logger.Level.SEVERE,
      'seriously, this statement is serious', loggerName3);
}

function testLoggingWithSimpleConsole() {
  // Make sure all messages use the log function.
  logAtAllLevels('test message');
  assertEquals(9, mockConsole.log.getCallCount());
}

function testLoggingWithInfoSupported() {
  // Make sure the log function is the default when only 'info' is available.
  mockConsole['info'] = goog.testing.recordFunction();
  logAtAllLevels('test message');
  assertEquals(1, mockConsole.info.getCallCount());
  assertEquals(8, mockConsole.log.getCallCount());
}

function testLoggingWithErrorSupported() {
  // Make sure the log function is the default when only 'error' is available.
  mockConsole['error'] = goog.testing.recordFunction();
  logAtAllLevels('test message');
  assertEquals(1, mockConsole.error.getCallCount());
  assertEquals(8, mockConsole.log.getCallCount());
}

function testLoggingWithWarningSupported() {
  // Make sure the log function is the default when only 'warn' is available.
  mockConsole['warn'] = goog.testing.recordFunction();
  logAtAllLevels('test message');
  assertEquals(1, mockConsole.warn.getCallCount());
  assertEquals(8, mockConsole.log.getCallCount());
}

function testLoggingWithDebugSupported() {
  // Make sure the log function is the default when only 'debug' is available.
  mockConsole['debug'] = goog.testing.recordFunction();
  logAtAllLevels('test message');
  assertEquals(6, mockConsole.debug.getCallCount());
  assertEquals(3, mockConsole.log.getCallCount());
}

function testLoggingWithEverythingSupported() {
  mockConsole['info'] = goog.testing.recordFunction();
  mockConsole['error'] = goog.testing.recordFunction();
  mockConsole['warn'] = goog.testing.recordFunction();
  mockConsole['debug'] = goog.testing.recordFunction();
  logAtAllLevels('test message');
  assertEquals(1, mockConsole.info.getCallCount());
  assertEquals(1, mockConsole.error.getCallCount());
  assertEquals(1, mockConsole.warn.getCallCount());
  assertEquals(6, mockConsole.debug.getCallCount());
}

function testAddLogRecordWithoutFilters() {
  // Make sure none are filtered.
  debugConsole.addLogRecord(logRecord1);
  assertEquals(1, mockConsole.log.getCallCount());
  debugConsole.addLogRecord(logRecord2);
  assertEquals(2, mockConsole.log.getCallCount());
  debugConsole.addLogRecord(logRecord3);
  assertEquals(3, mockConsole.log.getCallCount());
}

function testAddLogRecordWithOneFilter() {
  // Filter #2 and make sure the filtering is correct for all records.
  debugConsole.addFilter(loggerName2);
  debugConsole.addLogRecord(logRecord1);
  assertEquals(1, mockConsole.log.getCallCount());
  debugConsole.addLogRecord(logRecord2);
  assertEquals(1, mockConsole.log.getCallCount());
  debugConsole.addLogRecord(logRecord3);
  assertEquals(2, mockConsole.log.getCallCount());
}

function testAddLogRecordWithMoreThanOneFilter() {
  // Filter #1 and #3 and check.
  debugConsole.addFilter(loggerName1);
  debugConsole.addFilter(loggerName3);
  debugConsole.addLogRecord(logRecord1);
  assertEquals(0, mockConsole.log.getCallCount());
  debugConsole.addLogRecord(logRecord2);
  assertEquals(1, mockConsole.log.getCallCount());
  debugConsole.addLogRecord(logRecord3);
  assertEquals(1, mockConsole.log.getCallCount());
}

function testAddLogRecordWithAddAndRemoveFilter() {
  debugConsole.addFilter(loggerName1);
  debugConsole.addFilter(loggerName2);
  debugConsole.removeFilter(loggerName1);
  debugConsole.removeFilter(loggerName2);
  debugConsole.addLogRecord(logRecord1);
  assertEquals(1, mockConsole.log.getCallCount());
  debugConsole.addLogRecord(logRecord2);
  assertEquals(2, mockConsole.log.getCallCount());
  debugConsole.addLogRecord(logRecord3);
  assertEquals(3, mockConsole.log.getCallCount());
}

function testSetConsole() {
  var fakeConsole = {log: goog.testing.recordFunction()};

  logAtLevel(goog.debug.Logger.Level.INFO, 'test message 1');
  logAtAllLevels('test message 1');
  assertEquals(0, fakeConsole.log.getCallCount());

  goog.debug.Console.setConsole(fakeConsole);

  logAtLevel(goog.debug.Logger.Level.INFO, 'test message 2');
  assertEquals(1, fakeConsole.log.getCallCount());
}


/**
 * Logs the message at all log levels.
 * @param {string} message The message to log.
 */
function logAtAllLevels(message) {
  logAtLevel(goog.debug.Logger.Level.SHOUT, message);
  logAtLevel(goog.debug.Logger.Level.SEVERE, message);
  logAtLevel(goog.debug.Logger.Level.WARNING, message);
  logAtLevel(goog.debug.Logger.Level.INFO, message);
  logAtLevel(goog.debug.Logger.Level.CONFIG, message);
  logAtLevel(goog.debug.Logger.Level.FINE, message);
  logAtLevel(goog.debug.Logger.Level.FINER, message);
  logAtLevel(goog.debug.Logger.Level.FINEST, message);
  logAtLevel(goog.debug.Logger.Level.ALL, message);
}


/**
 * Adds a log record to the debug console.
 * @param {!goog.debug.Logger.Level} level The level at which to log.
 * @param {string} message The message to log.
 */
function logAtLevel(level, message) {
  debugConsole.addLogRecord(
      new goog.debug.LogRecord(level, message, loggerName1));
}
