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

goog.provide('goog.labs.net.xhrTest');
goog.setTestOnly('goog.labs.net.xhrTest');

goog.require('goog.Promise');
goog.require('goog.labs.net.xhr');
goog.require('goog.net.WrapperXmlHttpFactory');
goog.require('goog.net.XmlHttp');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

function stubXhrToReturn(status, opt_responseText, opt_latency) {

  if (goog.isDefAndNotNull(opt_latency)) {
    mockClock = new goog.testing.MockClock(true);
  }

  var stubXhr = {
    sent: false,
    aborted: false,
    status: 0,
    headers: {},
    open: function(method, url, async) {
      this.method = method;
      this.url = url;
      this.async = async;
    },
    setRequestHeader: function(key, value) {
      this.headers[key] = value;
    },
    overrideMimeType: function(mimeType) {
      this.mimeType = mimeType;
    },
    abort: function() {
      this.aborted = true;
      this.load(0);
    },
    send: function(data) {
      if (mockClock) {
        mockClock.tick(opt_latency);
      }
      this.data = data;
      this.sent = true;
      this.load(status);
    },
    load: function(status) {
      this.status = status;
      if (goog.isDefAndNotNull(opt_responseText)) {
        this.responseText = opt_responseText;
      }
      this.readyState = 4;
      if (this.onreadystatechange) this.onreadystatechange();
    }
  };

  stubXmlHttpWith(stubXhr);
}

function stubXhrToThrow(err) {
  stubXmlHttpWith(buildThrowingStubXhr(err));
}

function buildThrowingStubXhr(err) {
  return {
    sent: false,
    aborted: false,
    status: 0,
    headers: {},
    open: function(method, url, async) {
      this.method = method;
      this.url = url;
      this.async = async;
    },
    setRequestHeader: function(key, value) {
      this.headers[key] = value;
    },
    overrideMimeType: function(mimeType) {
      this.mimeType = mimeType;
    },
    send: function(data) {
      throw err;
    }
  };
}

function stubXmlHttpWith(stubXhr) {
  goog.net.XmlHttp = function() {
    return stubXhr;
  };
  for (var x in originalXmlHttp) {
    goog.net.XmlHttp[x] = originalXmlHttp[x];
  }
}

var xhr = goog.labs.net.xhr;
var originalXmlHttp = goog.net.XmlHttp;
var mockClock;

function tearDown() {
  if (mockClock) {
    mockClock.dispose();
    mockClock = null;
  }
  goog.net.XmlHttp = originalXmlHttp;
}


/**
 * Tests whether the test was loaded from a file: protocol. Tests that use a
 * real network request cannot be run from the local file system due to
 * cross-origin restrictions, but will run if the tests are hosted on a server.
 * A log message is added to the test case to warn users that the a test was
 * skipped.
 *
 * @return {boolean} Whether the test is running on a local file system.
 */
function isRunningLocally() {
  if (window.location.protocol == 'file:') {
    var testCase = goog.global['G_testRunner'].testCase;
    testCase.saveMessage('Test skipped while running on local file system.');
    return true;
  }
  return false;
}

function testSimpleRequest() {
  if (isRunningLocally()) return;

  return xhr.send('GET', 'testdata/xhr_test_text.data').then(function(xhr) {
    assertEquals('Just some data.', xhr.responseText);
    assertEquals(200, xhr.status);
  });
}

function testGetText() {
  if (isRunningLocally()) return;

  return xhr.get('testdata/xhr_test_text.data').then(function(responseText) {
    assertEquals('Just some data.', responseText);
  });
}

function testGetTextWithJson() {
  if (isRunningLocally()) return;

  return xhr.get('testdata/xhr_test_json.data').then(function(responseText) {
    assertEquals('while(1);\n{"stat":"ok","count":12345}\n', responseText);
  });
}

function testPostText() {
  if (isRunningLocally()) return;

  return xhr.post('testdata/xhr_test_text.data', 'post-data').then(
      function(responseText) {
        // No good way to test post-data gets transported.
        assertEquals('Just some data.', responseText);
      });
}

function testGetJson() {
  if (isRunningLocally()) return;

  return xhr.getJson(
      'testdata/xhr_test_json.data', {xssiPrefix: 'while(1);\n'}).then(
      function(responseObj) {
        assertEquals('ok', responseObj['stat']);
        assertEquals(12345, responseObj['count']);
      });
}

function testGetBytes() {
  if (isRunningLocally()) return;

  // IE8 requires a VBScript fallback to read the bytes from the response.
  if (goog.userAgent.IE && !goog.userAgent.isDocumentMode(9)) {
    return;
  }

  return xhr.getBytes('testdata/cleardot.gif').then(function(bytes) {
    assertElementsEquals([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0xFF,
      0x00, 0xC0, 0xC0, 0xC0, 0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00,
      0x00, 0x00, 0x00, 0x2C, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
      0x00, 0x02, 0x02, 0x44, 0x01, 0x00, 0x3B
    ], bytes);
  });
}

function testSerialRequests() {
  if (isRunningLocally()) return;

  return xhr.get('testdata/xhr_test_text.data').
      then(function(response) {
        return xhr.getJson(
            'testdata/xhr_test_json.data', {xssiPrefix: 'while(1);\n'});
      }).then(function(responseObj) {
        // Data that comes through to callbacks should be from the 2nd request.
        assertEquals('ok', responseObj['stat']);
        assertEquals(12345, responseObj['count']);
      });
}

function testBadUrlDetectedAsError() {
  if (isRunningLocally()) return;

  return xhr.getJson('unknown-file.dat').then(
      fail /* opt_onFulfilled */,
      function(err) {
        assertTrue(
            'Error should be an HTTP error', err instanceof xhr.HttpError);
        assertEquals(404, err.status);
        assertNotNull(err.xhr);
      });
}

function testBadOriginTriggersOnErrorHandler() {
  return xhr.get('http://www.google.com').then(
      fail /* opt_onFulfilled */,
      function(err) {
        // In IE this will be a goog.labs.net.xhr.Error since it is thrown
        //  when calling xhr.open(), other browsers will raise an HttpError.
        assertTrue('Error should be an xhr error', err instanceof xhr.Error);
        assertNotNull(err.xhr);
      });
}

//============================================================================
// The following tests use a stubbed out XMLHttpRequest.
//============================================================================

function testAbortRequest() {
  stubXhrToReturn(200);
  var promise = xhr.send('GET', 'test-url', null).thenCatch(
      function(error) {
        assertTrue(error instanceof goog.Promise.CancellationError);
      });
  promise.cancel();
  return promise;
}

function testSendNoOptions() {
  var called = false;
  stubXhrToReturn(200);
  assertFalse('Callback should not yet have been called', called);
  return xhr.send('GET', 'test-url', null).then(function(stubXhr) {
    called = true;
    assertEquals('GET', stubXhr.method);
    assertEquals('test-url', stubXhr.url);
  });
}

function testSendPostSetsDefaultHeader() {
  stubXhrToReturn(200);
  return xhr.send('POST', 'test-url', null).then(function(stubXhr) {
    assertEquals('POST', stubXhr.method);
    assertEquals('test-url', stubXhr.url);
    assertEquals('application/x-www-form-urlencoded;charset=utf-8',
        stubXhr.headers['Content-Type']);
  });
}

function testSendPostDoesntSetHeaderWithFormData() {
  if (!goog.global['FormData']) { return; }
  var formData = new goog.global['FormData']();
  formData.append('name', 'value');

  stubXhrToReturn(200);
  return xhr.send('POST', 'test-url', formData).then(function(stubXhr) {
    assertEquals('POST', stubXhr.method);
    assertEquals('test-url', stubXhr.url);
    assertEquals(undefined, stubXhr.headers['Content-Type']);
  });
}

function testSendPostHeaders() {
  stubXhrToReturn(200);
  return xhr.send('POST', 'test-url', null,
      { headers: {'Content-Type': 'text/plain', 'X-Made-Up': 'FooBar'} }).
      then(function(stubXhr) {
        assertEquals('POST', stubXhr.method);
        assertEquals('test-url', stubXhr.url);
        assertEquals('text/plain', stubXhr.headers['Content-Type']);
        assertEquals('FooBar', stubXhr.headers['X-Made-Up']);
      });
}

function testSendPostHeadersWithFormData() {
  if (!goog.global['FormData']) { return; }
  var formData = new goog.global['FormData']();
  formData.append('name', 'value');

  stubXhrToReturn(200);
  return xhr.send('POST', 'test-url', formData,
      { headers: {'Content-Type': 'text/plain', 'X-Made-Up': 'FooBar'} }).
      then(function(stubXhr) {
        assertEquals('POST', stubXhr.method);
        assertEquals('test-url', stubXhr.url);
        assertEquals('text/plain', stubXhr.headers['Content-Type']);
        assertEquals('FooBar', stubXhr.headers['X-Made-Up']);
      });
}

function testSendNullPostHeaders() {
  stubXhrToReturn(200);
  return xhr.send('POST', 'test-url', null, {
    headers: {
      'Content-Type': null,
      'X-Made-Up': 'FooBar',
      'Y-Made-Up': null
    }
  }).then(function(stubXhr) {
    assertEquals('POST', stubXhr.method);
    assertEquals('test-url', stubXhr.url);
    assertEquals(undefined, stubXhr.headers['Content-Type']);
    assertEquals('FooBar', stubXhr.headers['X-Made-Up']);
    assertEquals(undefined, stubXhr.headers['Y-Made-Up']);
  });
}

function testSendNullPostHeadersWithFormData() {
  if (!goog.global['FormData']) { return; }
  var formData = new goog.global['FormData']();
  formData.append('name', 'value');

  stubXhrToReturn(200);
  return xhr.send('POST', 'test-url', formData, {
    headers: {
      'Content-Type': null,
      'X-Made-Up': 'FooBar',
      'Y-Made-Up': null
    }
  }).then(function(stubXhr) {
    assertEquals('POST', stubXhr.method);
    assertEquals('test-url', stubXhr.url);
    assertEquals(undefined, stubXhr.headers['Content-Type']);
    assertEquals('FooBar', stubXhr.headers['X-Made-Up']);
    assertEquals(undefined, stubXhr.headers['Y-Made-Up']);
  });
}

function testSendWithCredentials() {
  stubXhrToReturn(200);
  return xhr.send('POST', 'test-url', null, {withCredentials: true}).
      then(function(stubXhr) {
        assertTrue('XHR should have been sent', stubXhr.sent);
        assertTrue(stubXhr.withCredentials);
      });
}

function testSendWithMimeType() {
  stubXhrToReturn(200);
  return xhr.send('POST', 'test-url', null, {mimeType: 'text/plain'}).
      then(function(stubXhr) {
        assertTrue('XHR should have been sent', stubXhr.sent);
        assertEquals('text/plain', stubXhr.mimeType);
      });
}

function testSendWithHttpError() {
  stubXhrToReturn(500);
  return xhr.send('POST', 'test-url', null).then(
      fail /* opt_onResolved */,
      function(err) {
        assertTrue(err instanceof xhr.HttpError);
        assertTrue(err.xhr.sent);
        assertEquals(500, err.status);
      });
}

function testSendWithTimeoutNotHit() {
  stubXhrToReturn(200, null /* opt_responseText */, 1400 /* opt_latency */);
  return xhr.send('POST', 'test-url', null, {timeoutMs: 1500}).
      then(function(stubXhr) {
        assertTrue(mockClock.getTimeoutsMade() > 0);
        assertTrue('XHR should have been sent', stubXhr.sent);
        assertFalse('XHR should not have been aborted', stubXhr.aborted);
      });
}

function testSendWithTimeoutHit() {
  stubXhrToReturn(200, null /* opt_responseText */, 50 /* opt_latency */);
  return xhr.send('POST', 'test-url', null, {timeoutMs: 50}).then(
      fail /* opt_onResolved */,
      function(err) {
        assertTrue('XHR should have been sent', err.xhr.sent);
        assertTrue('XHR should have been aborted', err.xhr.aborted);
        assertTrue(err instanceof xhr.TimeoutError);
      });
}

function testCancelRequest() {
  stubXhrToReturn(200, null /* opt_responseText */, 25);
  var promise = xhr.send('GET', 'test-url', null, {timeoutMs: 50});
  promise.then(
      fail /* opt_onResolved */,
      function(error) {
        assertTrue('XHR should have been sent', error.xhr.sent);
        if (error instanceof goog.Promise.CancellationError) {
          error.xhr.abort();
        }
        assertTrue('XHR should have been aborted', error.xhr.aborted);
        assertTrue(error instanceof goog.Promise.CancellationError);
      });
  promise.cancel();
  return promise;
}

function testGetJson() {
  var stubXhr = stubXhrToReturn(200, '{"a": 1, "b": 2}');
  xhr.getJson('test-url').then(function(responseObj) {
    assertObjectEquals({a: 1, b: 2}, responseObj);
  });
}

function testGetJsonWithXssiPrefix() {
  stubXhrToReturn(200, 'while(1);\n{"a": 1, "b": 2}');
  return xhr.getJson('test-url', {xssiPrefix: 'while(1);\n'}).then(
      function(responseObj) {
        assertObjectEquals({a: 1, b: 2}, responseObj);
      });
}

function testSendWithClientException() {
  stubXhrToThrow(new Error('CORS XHR with file:// schemas not allowed.'));
  return xhr.send('POST', 'file://test-url', null).then(
      fail /* opt_onResolved */,
      function(err) {
        assertFalse('XHR should not have been sent', err.xhr.sent);
        assertTrue(err instanceof Error);
        assertTrue(
            /CORS XHR with file:\/\/ schemas not allowed./.test(err.message));
      });
}

function testSendWithFactory() {
  stubXhrToReturn(200);
  var options = {
    xmlHttpFactory: new goog.net.WrapperXmlHttpFactory(
        goog.partial(buildThrowingStubXhr, new Error('Bad factory')),
        goog.net.XmlHttp.getOptions)
  };
  return xhr.send('POST', 'file://test-url', null, options).then(
      fail /* opt_onResolved */,
      function(err) {
        assertTrue(err instanceof Error);
      });
}
