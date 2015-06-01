// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.debug.ErrorTest');
goog.setTestOnly('goog.debug.ErrorTest');

goog.require('goog.debug.Error');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');

var expectedFailures;

function setUpPage() {
  expectedFailures = new goog.testing.ExpectedFailures();
}

function tearDown() {
  expectedFailures.handleTearDown();
}

function testError() {
  function xxxxx() {
    yyyyy();
  }
  function yyyyy() {
    zzzzz();
  }
  function zzzzz() {
    throw new goog.debug.Error('testing');
  }

  var stack = null, message = null;
  try {
    xxxxx();
  } catch (e) {
    message = e.message;
    if (e.stack) {
      stack = e.stack.split('\n');
    }
  }

  assertEquals('Message property should be set', 'testing', message);

  expectedFailures.expectFailureFor(
      (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('10')) ||
      goog.userAgent.product.SAFARI || (
          goog.userAgent.product.CHROME &&
          !goog.userAgent.isVersionOrHigher(532)),
      'error.stack is not widely supported');

  try {
    assertNotNull(stack);

    if (goog.userAgent.product.FIREFOX &&
        goog.userAgent.isVersionOrHigher('2.0')) {
      // Firefox 4 and greater does not have the first line that says
      // 'Error'. So we insert a dummy line to simplify the test.
      stack.splice(0, 0, 'Error');
    }

    // If the stack trace came from a synthetic Error object created
    // inside the goog.debug.Error constructor, it will have an extra frame
    // at stack[1]. If it came from captureStackTrace or was attached
    // by IE when the error was caught, it will not.
    if (!Error.captureStackTrace && !goog.userAgent.IE) {
      stack.splice(1, 1);  // Remove stack[1].
    }

    assertContains(
        '1st line of stack should have "Error"', 'Error', stack[0]);
    assertContains(
        '2nd line of stack should have "zzzzz"', 'zzzzz', stack[1]);
    assertContains(
        '3rd line of stack should have "yyyyy"', 'yyyyy', stack[2]);
    assertContains(
        '4th line of stack should have "xxxxx"', 'xxxxx', stack[3]);
  } catch (e) {
    expectedFailures.handleException(e);
  }
}

function testInheriting() {
  function MyError() {
    goog.debug.Error.call(this);
  }
  goog.inherits(MyError, goog.debug.Error);
  MyError.prototype.message = 'My custom error';

  var message = null;
  try {
    throw new MyError();
  } catch (e) {
    message = e.message;
  }
  assertEquals('My custom error', message);
}
