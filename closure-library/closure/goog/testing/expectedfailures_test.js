// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.testing.ExpectedFailuresTest');
goog.setTestOnly('goog.testing.ExpectedFailuresTest');

goog.require('goog.debug.Logger');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.JsUnitException');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.jsunit');

var count, expectedFailures, lastLevel, lastMessage;

// Stub out the logger.
goog.testing.ExpectedFailures.prototype.logger_.log = function(level, message) {
  lastLevel = level;
  lastMessage = message;
  count++;
};

function setUp() {
  // TODO(b/25875505): Fix unreported assertions (go/failonunreportedasserts).
  goog.testing.TestCase.getActiveTestCase().failOnUnreportedAsserts = false;

  expectedFailures = new goog.testing.ExpectedFailures();
  count = 0;
  lastLevel = lastMessage = '';
}

// Individual test methods.

function testNoExpectedFailure() {
  expectedFailures.handleTearDown();
}

function testPreventExpectedFailure() {
  expectedFailures.expectFailureFor(true);

  expectedFailures.handleException(new goog.testing.JsUnitException('', ''));
  assertEquals('Should have logged a message', 1, count);
  assertEquals(
      'Should have logged an info message', goog.debug.Logger.Level.INFO,
      lastLevel);
  assertContains(
      'Should log a suppression message', 'Suppressing test failure',
      lastMessage);

  expectedFailures.handleTearDown();
  assertEquals('Should not have logged another message', 1, count);
}

function testDoNotPreventException() {
  var ex = 'exception';
  expectedFailures.expectFailureFor(false);
  var e = assertThrows('Should have rethrown exception', function() {
    expectedFailures.handleException(ex);
  });
  assertEquals('Should rethrow same exception', ex, e);
}

function testExpectedFailureDidNotOccur() {
  expectedFailures.expectFailureFor(true);

  expectedFailures.handleTearDown();
  assertEquals('Should have logged a message', 1, count);
  assertEquals(
      'Should have logged a warning', goog.debug.Logger.Level.WARNING,
      lastLevel);
  assertContains(
      'Should log a suppression message', 'Expected a test failure',
      lastMessage);
}

function testRun() {
  expectedFailures.expectFailureFor(true);

  expectedFailures.run(function() { fail('Expected failure'); });

  assertEquals('Should have logged a message', 1, count);
  assertEquals(
      'Should have logged an info message', goog.debug.Logger.Level.INFO,
      lastLevel);
  assertContains(
      'Should log a suppression message', 'Suppressing test failure',
      lastMessage);

  expectedFailures.handleTearDown();
  assertEquals('Should not have logged another message', 1, count);
}

function testRunStrict() {
  expectedFailures.expectFailureFor(true);

  var ex = assertThrows(function() {
    expectedFailures.run(function() {
      // Doesn't fail!
    });
  });
  assertContains(
      "Expected a test failure in 'testRunStrict' but the test passed.",
      ex.message);
}

function testRunLenient() {
  expectedFailures.expectFailureFor(true);

  expectedFailures.run(function() {
    // Doesn't fail!
  }, true);
  expectedFailures.handleTearDown();
  assertEquals('Should have logged a message', 1, count);
  assertEquals(
      'Should have logged a warning', goog.debug.Logger.Level.WARNING,
      lastLevel);
  assertContains(
      'Should log a suppression message', 'Expected a test failure',
      lastMessage);
}
