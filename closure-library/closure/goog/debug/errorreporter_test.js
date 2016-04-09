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

goog.provide('goog.debug.ErrorReporterTest');
goog.setTestOnly('goog.debug.ErrorReporterTest');

goog.require('goog.debug.Error');
goog.require('goog.debug.ErrorReporter');
goog.require('goog.events');
goog.require('goog.functions');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');

MockXhrIo = function() {};

MockXhrIo.prototype.onReadyStateChangeEntryPoint_ = function() {};

MockXhrIo.protectEntryPoints = function() {};

MockXhrIo.lastUrl = null;

MockXhrIo.send = function(
    url, opt_callback, opt_method, opt_content, opt_headers, opt_timeInterval) {
  MockXhrIo.lastUrl = url;
  MockXhrIo.lastContent = opt_content;
  MockXhrIo.lastHeaders = opt_headers;
};

var errorReporter;
var originalSetTimeout = window.setTimeout;
var stubs = new goog.testing.PropertyReplacer();
var url = 'http://www.your.tst/more/bogus.js';
var encodedUrl = 'http%3A%2F%2Fwww.your.tst%2Fmore%2Fbogus.js';

function setUp() {
  // TODO(b/25875505): Fix unreported assertions (go/failonunreportedasserts).
  goog.testing.TestCase.getActiveTestCase().failOnUnreportedAsserts = false;

  stubs.set(goog.net, 'XhrIo', MockXhrIo);
  goog.debug.ErrorReporter.ALLOW_AUTO_PROTECT = true;
}

function tearDown() {
  goog.dispose(errorReporter);
  stubs.reset();
  MockXhrIo.lastUrl = null;
}

function throwAnErrorWith(script, line, message, opt_stack) {
  var error = {message: message, fileName: script, lineNumber: line};
  if (opt_stack) {
    error['stack'] = opt_stack;
  }

  throw error;
}

function testsendErrorReport() {
  errorReporter = new goog.debug.ErrorReporter('/log');
  errorReporter.sendErrorReport('message', 'filename.js', 123, 'trace');

  assertEquals(
      '/log?script=filename.js&error=message&line=123', MockXhrIo.lastUrl);
  assertEquals('trace=trace', MockXhrIo.lastContent);
}

function testsendErrorReportWithCustomSender() {
  var uri = null;
  var method = null;
  var content = null;
  var headers = null;
  function mockXhrSender(uriIn, methodIn, contentIn, headersIn) {
    uri = uriIn;
    method = methodIn;
    content = contentIn;
    headers = headersIn;
  }

  errorReporter = new goog.debug.ErrorReporter('/log');
  errorReporter.setXhrSender(mockXhrSender);
  errorReporter.sendErrorReport('message', 'filename.js', 123, 'trace');

  assertEquals('/log?script=filename.js&error=message&line=123', uri);
  assertEquals('POST', method);
  assertEquals('trace=trace', content);
  assertUndefined(headers);
}

function testsendErrorReport_noTrace() {
  errorReporter = new goog.debug.ErrorReporter('/log');
  errorReporter.sendErrorReport('message', 'filename.js', 123);

  assertEquals(
      '/log?script=filename.js&error=message&line=123', MockXhrIo.lastUrl);
  assertEquals('', MockXhrIo.lastContent);
}

function test_nonInternetExplorerSendErrorReport() {
  if (goog.userAgent.product.SAFARI) {
    // TODO(b/20733468): Disabled so we can get the rest of the Closure test
    // suite running in a continuous build. Will investigate later.
    return;
  }

  stubs.set(goog.userAgent, 'IE', false);
  stubs.set(goog.global, 'setTimeout', function(fcn, time) { fcn.call(); });

  errorReporter = goog.debug.ErrorReporter.install('/errorreporter');

  var errorFunction = goog.partial(throwAnErrorWith, url, 5, 'Hello :)');

  try {
    goog.global.setTimeout(errorFunction, 0);
  } catch (e) {
    // Expected. The error is rethrown after sending.
  }

  assertEquals(
      '/errorreporter?script=' + encodedUrl + '&error=Hello%20%3A)&line=5',
      MockXhrIo.lastUrl);
  assertEquals('trace=Not%20available', MockXhrIo.lastContent);
}

function test_internetExplorerSendErrorReport() {
  stubs.set(goog.userAgent, 'IE', true);
  stubs.set(goog.userAgent, 'isVersionOrHigher', goog.functions.FALSE);

  // Remove test runner's onerror handler so the test doesn't fail.
  stubs.set(goog.global, 'onerror', null);

  errorReporter = goog.debug.ErrorReporter.install('/errorreporter');
  goog.global.onerror('Goodbye :(', url, 22);
  assertEquals(
      '/errorreporter?script=' + encodedUrl + '&error=Goodbye%20%3A(&line=22',
      MockXhrIo.lastUrl);
  assertEquals('trace=Not%20available', MockXhrIo.lastContent);
}

function test_setLoggingHeaders() {
  stubs.set(goog.userAgent, 'IE', true);
  stubs.set(goog.userAgent, 'isVersionOrHigher', goog.functions.FALSE);
  // Remove test runner's onerror handler so the test doesn't fail.
  stubs.set(goog.global, 'onerror', null);

  errorReporter = goog.debug.ErrorReporter.install('/errorreporter');
  errorReporter.setLoggingHeaders('header!');
  goog.global.onerror('Goodbye :(', 'http://www.your.tst/more/bogus.js', 22);
  assertEquals('header!', MockXhrIo.lastHeaders);
}

function test_nonInternetExplorerSendErrorReportWithTrace() {
  stubs.set(goog.userAgent, 'IE', false);
  stubs.set(goog.global, 'setTimeout', function(fcn, time) { fcn.call(); });

  errorReporter = goog.debug.ErrorReporter.install('/errorreporter');

  var trace = 'Error(\"Something Wrong\")@:0\n' +
      '$MF$E$Nx$([object Object])@http://a.b.c:83/a/f.js:901\n' +
      '([object Object])@http://a.b.c:813/a/f.js:37';


  var errorFunction = goog.partial(throwAnErrorWith, url, 5, 'Hello :)', trace);

  try {
    goog.global.setTimeout(errorFunction, 0);
  } catch (e) {
    // Expected. The error is rethrown after sending.
  }

  assertEquals(
      '/errorreporter?script=' + encodedUrl + '&error=Hello%20%3A)&line=5',
      MockXhrIo.lastUrl);
  assertEquals(
      'trace=' +
          'Error(%22Something%20Wrong%22)%40%3A0%0A' +
          '%24MF%24E%24Nx%24(%5Bobject%20Object%5D)%40' +
          'http%3A%2F%2Fa.b.c%3A83%2Fa%2Ff.js%3A901%0A' +
          '(%5Bobject%20Object%5D)%40http%3A%2F%2Fa.b.c%3A813%2Fa%2Ff.js%3A37',
      MockXhrIo.lastContent);
}

function testProtectAdditionalEntryPoint_nonIE() {
  stubs.set(goog.userAgent, 'IE', false);

  errorReporter = goog.debug.ErrorReporter.install('/errorreporter');
  var fn = function() {};
  var protectedFn = errorReporter.protectAdditionalEntryPoint(fn);
  assertNotNull(protectedFn);
  assertNotEquals(fn, protectedFn);
}

function testProtectAdditionalEntryPoint_IE() {
  stubs.set(goog.userAgent, 'IE', true);
  stubs.set(goog.userAgent, 'isVersionOrHigher', goog.functions.FALSE);

  errorReporter = goog.debug.ErrorReporter.install('/errorreporter');
  var fn = function() {};
  var protectedFn = errorReporter.protectAdditionalEntryPoint(fn);
  assertNull(protectedFn);
}

function testHandleException_dispatchesEvent() {
  errorReporter = goog.debug.ErrorReporter.install('/errorreporter');
  var loggedErrors = 0;
  goog.events.listen(
      errorReporter, goog.debug.ErrorReporter.ExceptionEvent.TYPE,
      function(event) {
        assertNotNullNorUndefined(event.error);
        loggedErrors++;
      });
  errorReporter.handleException(new Error());
  errorReporter.handleException(new Error());
  assertEquals(
      'Expected 2 errors. ' +
          '(Ensure an exception was not swallowed.)',
      2, loggedErrors);
}

function testHandleException_includesContext() {
  errorReporter = goog.debug.ErrorReporter.install('/errorreporter');
  var loggedErrors = 0;
  var testError = new Error('test error');
  var testContext = {'contextParam': 'contextValue'};
  goog.events.listen(
      errorReporter, goog.debug.ErrorReporter.ExceptionEvent.TYPE,
      function(event) {
        assertNotNullNorUndefined(event.error);
        assertObjectEquals({contextParam: 'contextValue'}, event.context);
        loggedErrors++;
      });
  errorReporter.handleException(testError, testContext);
  assertEquals(
      'Expected 1 error. ' +
          '(Ensure an exception was not swallowed.)',
      1, loggedErrors);
}

function testContextProvider() {
  errorReporter = goog.debug.ErrorReporter.install(
      '/errorreporter',
      function(error, context) { context.providedContext = 'value'; });
  var loggedErrors = 0;
  var testError = new Error('test error');
  goog.events.listen(
      errorReporter, goog.debug.ErrorReporter.ExceptionEvent.TYPE,
      function(event) {
        assertNotNullNorUndefined(event.error);
        assertObjectEquals({providedContext: 'value'}, event.context);
        loggedErrors++;
      });
  errorReporter.handleException(testError);
  assertEquals(
      'Expected 1 error. ' +
          '(Ensure an exception was not swallowed.)',
      1, loggedErrors);
}

function testContextProvider_withOtherContext() {
  errorReporter = goog.debug.ErrorReporter.install(
      '/errorreporter',
      function(error, context) { context.providedContext = 'value'; });
  var loggedErrors = 0;
  var testError = new Error('test error');
  goog.events.listen(
      errorReporter, goog.debug.ErrorReporter.ExceptionEvent.TYPE,
      function(event) {
        assertNotNullNorUndefined(event.error);
        assertObjectEquals(
            {providedContext: 'value', otherContext: 'value'}, event.context);
        loggedErrors++;
      });
  errorReporter.handleException(testError, {'otherContext': 'value'});
  assertEquals(
      'Expected 1 error. ' +
          '(Ensure an exception was not swallowed.)',
      1, loggedErrors);
}

function testHandleException_ignoresExceptionsDuringEventDispatch() {
  errorReporter = goog.debug.ErrorReporter.install('/errorreporter');
  goog.events.listen(
      errorReporter, goog.debug.ErrorReporter.ExceptionEvent.TYPE,
      function(event) { fail('This exception should be swallowed.'); });
  errorReporter.handleException(new Error());
}

function testHandleException_doNotReportErrorToServer() {
  var error = new goog.debug.Error();
  error.reportErrorToServer = false;
  errorReporter.handleException(error);
  assertNull(MockXhrIo.lastUrl);
}

function testDisposal() {
  errorReporter = goog.debug.ErrorReporter.install('/errorreporter');
  if (!goog.userAgent.IE) {
    assertNotEquals(originalSetTimeout, window.setTimeout);
  }
  goog.dispose(errorReporter);
  assertEquals(originalSetTimeout, window.setTimeout);
}

function testSetContextPrefix() {
  errorReporter = new goog.debug.ErrorReporter('/log');
  errorReporter.setContextPrefix('baz.');
  errorReporter.sendErrorReport(
      'message', 'filename.js', 123, 'trace', {'foo': 'bar'});
  assertEquals('trace=trace&baz.foo=bar', MockXhrIo.lastContent);
}

function testTruncationLimit() {
  errorReporter = new goog.debug.ErrorReporter('/log');
  errorReporter.setTruncationLimit(6);
  errorReporter.sendErrorReport(
      'message', 'filename.js', 123, 'trace', {'foo': 'bar'});
  assertEquals('trace=', MockXhrIo.lastContent);
}

function testZeroTruncationLimit() {
  errorReporter = new goog.debug.ErrorReporter('/log');
  errorReporter.setTruncationLimit(0);
  errorReporter.sendErrorReport(
      'message', 'filename.js', 123, 'trace', {'foo': 'bar'});
  assertEquals('', MockXhrIo.lastContent);
}

function testTruncationLimitLargerThanBody() {
  errorReporter = new goog.debug.ErrorReporter('/log');
  errorReporter.setTruncationLimit(9999);
  errorReporter.sendErrorReport(
      'message', 'filename.js', 123, 'trace', {'foo': 'bar'});
  assertEquals('trace=trace&context.foo=bar', MockXhrIo.lastContent);
}

function testSetNegativeTruncationLimit() {
  errorReporter = new goog.debug.ErrorReporter('/log');
  assertThrows(function() { errorReporter.setTruncationLimit(-10); });
}

function testSetTruncationLimitNull() {
  errorReporter = new goog.debug.ErrorReporter('/log');
  errorReporter.setTruncationLimit(null);
  errorReporter.sendErrorReport(
      'message', 'filename.js', 123, 'trace', {'foo': 'bar'});
  assertEquals('trace=trace&context.foo=bar', MockXhrIo.lastContent);
}

function testAttemptAutoProtectWithAllowAutoProtectOff() {
  goog.debug.ErrorReporter.ALLOW_AUTO_PROTECT = false;
  assertThrows(function() {
    errorReporter =
        new goog.debug.ErrorReporter('/log', function(e, context) {}, false);
  });
}

function testSetAdditionalArgumentsArgsEmptyObject() {
  errorReporter = new goog.debug.ErrorReporter('/log');
  errorReporter.setAdditionalArguments({});
  errorReporter.sendErrorReport(
      'message', 'filename.js', 123, 'trace', {'foo': 'bar'});
  assertEquals(
      '/log?script=filename.js&error=message&line=123', MockXhrIo.lastUrl);
}

function testSetAdditionalArgumentsSingleArgument() {
  errorReporter = new goog.debug.ErrorReporter('/log');
  errorReporter.setAdditionalArguments({'extra': 'arg'});
  errorReporter.sendErrorReport(
      'message', 'filename.js', 123, 'trace', {'foo': 'bar'});
  assertEquals(
      '/log?script=filename.js&error=message&line=123&extra=arg',
      MockXhrIo.lastUrl);
}

function testSetAdditionalArgumentsMultipleArguments() {
  errorReporter = new goog.debug.ErrorReporter('/log');
  errorReporter.setAdditionalArguments({'extra': 'arg', 'cat': 'dog'});
  errorReporter.sendErrorReport(
      'message', 'filename.js', 123, 'trace', {'foo': 'bar'});
  assertEquals(
      '/log?script=filename.js&error=message&line=123&extra=arg&cat=dog',
      MockXhrIo.lastUrl);
}
