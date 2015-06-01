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

goog.provide('goog.debug.ErrorHandlerTest');
goog.setTestOnly('goog.debug.ErrorHandlerTest');

goog.require('goog.debug.ErrorHandler');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.jsunit');

var oldGetObjectByName;

// provide our own window that implements our instrumented and
// immediate-call versions of setTimeout and setInterval
var fakeWin = {};

var errorHandler;
var mockControl;

function badTimer() {
  arguments.callee.called = true;
  throw 'die die die';
}

function setUp() {
  mockControl = new goog.testing.MockControl();
  // On IE, globalEval happens async. So make it synchronous.
  goog.globalEval = function(str) {
    eval(str);
  };

  oldGetObjectByName = goog.getObjectByName;
  goog.getObjectByName = function(name) {
    if (name == 'window') {
      return fakeWin;
    } else {
      return oldGetObjectByName(name);
    }
  };

  fakeWin.setTimeout = function(fn, time) {
    fakeWin.setTimeout.called = true;
    fakeWin.setTimeout.that = this;
    if (goog.isString(fn)) {
      eval(fn);
    } else {
      fn();
    }
  };

  fakeWin.setInterval = function(fn, time) {
    fakeWin.setInterval.called = true;
    fakeWin.setInterval.that = this;
    if (goog.isString(fn)) {
      eval(fn);
    } else {
      fn();
    }
  };

  fakeWin.requestAnimationFrame = function(fn) {
    fakeWin.requestAnimationFrame.called = true;
    fakeWin.requestAnimationFrame.that = this;
    fn();
  };

  // just record the exception in the error handler when it happens
  errorHandler = new goog.debug.ErrorHandler(
      function(ex) { this.ex = ex; });
}

function tearDown() {
  mockControl.$tearDown();
  goog.dispose(errorHandler);
  errorHandler = null;

  goog.getObjectByName = oldGetObjectByName;

  delete badTimer['__protected__'];
}

function testWrapSetTimeout() {
  errorHandler.protectWindowSetTimeout();

  var caught;

  try {
    fakeWin.setTimeout(badTimer, 3);
  } catch (ex) {
    caught = ex;
  }
  assertSetTimeoutError(caught);
}

function testWrapSetTimeoutWithString() {
  errorHandler.protectWindowSetTimeout();

  var caught;

  try {
    fakeWin.setTimeout('badTimer()', 3);
  } catch (ex) {
    caught = ex;
  }
  assertSetTimeoutError(caught);
}

function testWrapSetInterval() {
  errorHandler.protectWindowSetInterval();

  var caught;

  try {
    fakeWin.setInterval(badTimer, 3);
  } catch (ex) {
    caught = ex;
  }
  assertSetIntervalError(caught);
}

function testWrapSetIntervalWithString() {
  errorHandler.protectWindowSetInterval();

  var caught;

  try {
    fakeWin.setInterval('badTimer()', 3);
  } catch (ex) {
    caught = ex;
  }
  assertSetIntervalError(caught);
}

function testWrapRequestAnimationFrame() {
  errorHandler.protectWindowRequestAnimationFrame();

  var caught;
  try {
    fakeWin.requestAnimationFrame(badTimer);
  } catch (ex) {
    caught = ex;
  }
  assertRequestAnimationFrameError(caught);
}

function testDisposal() {
  fakeWin = goog.getObjectByName('window');
  var originalSetTimeout = fakeWin.setTimeout;
  var originalSetInterval = fakeWin.setInterval;

  errorHandler.protectWindowSetTimeout();
  errorHandler.protectWindowSetInterval();

  assertNotEquals(originalSetTimeout, fakeWin.setTimeout);
  assertNotEquals(originalSetInterval, fakeWin.setInterval);

  errorHandler.dispose();

  assertEquals(originalSetTimeout, fakeWin.setTimeout);
  assertEquals(originalSetInterval, fakeWin.setInterval);
}

function testUnwrap() {
  var fn = function() {};
  var wrappedFn = errorHandler.wrap(fn);
  assertNotEquals(wrappedFn, fn);

  assertEquals(fn, errorHandler.unwrap(fn));
  assertEquals(fn, errorHandler.unwrap(wrappedFn));
}

function testStackPreserved() {
  var e;
  var hasStacks;
  function specialFunctionName() {
    var e = Error();
    hasStacks = !!e.stack;
    throw e;
  };
  var wrappedFn = errorHandler.wrap(specialFunctionName);
  try {
    wrappedFn();
  } catch (exception) {
    e = exception;
  }
  assertTrue(!!e);
  if (hasStacks) {
    assertContains('specialFunctionName', e.stack);
  }
}

function testGetProtectedFunction() {
  var fn = function() {
    throw new Error('Foo');
  };
  var protectedFn = errorHandler.getProtectedFunction(fn);
  var e = assertThrows(protectedFn);
  assertTrue(e instanceof goog.debug.ErrorHandler.ProtectedFunctionError);
  assertEquals('Foo', e.cause.message);
}

function testGetProtectedFunction_withoutWrappedErrors() {
  var shouldCallErrorLog = !!Error.captureStackTrace;
  if (shouldCallErrorLog) {
    mockControl.createMethodMock(goog.global.console,
        'error');
  }
  errorHandler.setWrapErrors(false);
  var fn = function() {
    var e = new Error('Foo');
    e.stack = 'STACK';
    throw e;
  };
  var protectedFn = errorHandler.getProtectedFunction(fn);
  if (shouldCallErrorLog) {
    goog.global.console.error('Foo', 'STACK');
  }
  mockControl.$replayAll();
  var e = assertThrows(protectedFn);
  mockControl.$verifyAll();
  assertTrue(e instanceof Error);
  assertEquals('Foo', e.message);
  assertEquals(e.stack, 'STACK');
}

function testGetProtectedFunction_withoutWrappedErrorsWithMessagePrefix() {
  errorHandler.setWrapErrors(false);
  errorHandler.setPrefixErrorMessages(true);
  var fn = function() {
    throw new Error('Foo');
  };
  var protectedFn = errorHandler.getProtectedFunction(fn);
  var e = assertThrows(protectedFn);
  assertTrue(e instanceof Error);
  assertEquals(
      goog.debug.ErrorHandler.ProtectedFunctionError.MESSAGE_PREFIX +
          'Foo', e.message);

  var stringError = function() {
    throw 'String';
  };
  protectedFn = errorHandler.getProtectedFunction(stringError);
  e = assertThrows(protectedFn);
  assertEquals('string', typeof e);
  assertEquals(
      goog.debug.ErrorHandler.ProtectedFunctionError.MESSAGE_PREFIX +
          'String', e);
}

function assertSetTimeoutError(caught) {
  assertMethodCalledHelper('setTimeout', caught);
}

function assertSetIntervalError(caught) {
  assertMethodCalledHelper('setInterval', caught);
}

function assertRequestAnimationFrameError(caught) {
  assertMethodCalledHelper('requestAnimationFrame', caught);
}

function assertMethodCalledHelper(method, caught) {
  assertTrue('exception not thrown', !!caught);
  assertEquals('exception not caught by error handler',
      caught.cause, errorHandler.ex);
  assertTrue('fake ' + method + ' not called',
      !!fakeWin[method].called);
  assertTrue('"this" not passed to original ' + method,
      fakeWin[method].that === fakeWin);
}
