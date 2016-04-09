// Copyright 2015 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.net.FetchXmlHttpFactoryTest');
goog.setTestOnly('goog.net.FetchXmlHttpFactoryTest');

goog.require('goog.net.FetchXmlHttp');
goog.require('goog.net.FetchXmlHttpFactory');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');
goog.require('goog.userAgent.product');
goog.require('goog.userAgent.product.isVersion');


/** @type {!goog.testing.MockControl} */
var mockControl;


/** @type {!goog.testing.FunctionMock} */
var fetchMock;


/** @type {!goog.net.FetchXmlHttpFactory} */
var factory;


/** @type {!WorkerGlobalScope} */
var worker;


/**
 * Whether the browser supports running this test.
 * @return {boolean}
 */
function shouldRunTests() {
  return goog.userAgent.product.CHROME && goog.userAgent.product.isVersion(43);
}

function setUp() {
  mockControl = new goog.testing.MockControl();
  worker = {};
  fetchMock = mockControl.createFunctionMock('fetch');
  worker.fetch = fetchMock;
  factory = new goog.net.FetchXmlHttpFactory(worker);
}


function tearDown() {
  mockControl.$tearDown();
}


/**
 * Verifies the open method.
 */
function testOpen() {
  mockControl.$replayAll();

  var xhr = factory.createInstance();
  assertEquals(0, xhr.status);
  assertEquals('', xhr.responseText);
  assertEquals(xhr.readyState, goog.net.FetchXmlHttp.RequestState.UNSENT);

  var onReadyStateChangeHandler = new goog.testing.recordFunction();
  xhr.onreadystatechange = onReadyStateChangeHandler;
  xhr.open('GET', 'https://www.google.com', true /* opt_async */);
  assertEquals(xhr.readyState, goog.net.FetchXmlHttp.RequestState.OPENED);
  onReadyStateChangeHandler.assertCallCount(1);

  mockControl.$verifyAll();
}


/**
 * Verifies the open method when the ready state is not unsent.
 */
function testOpen_notUnsent() {
  mockControl.$replayAll();

  var xhr = factory.createInstance();
  xhr.open('GET', 'https://www.google.com', true /* opt_async */);
  assertThrows(function() {
    xhr.open('GET', 'https://www.google.com', true /* opt_async */);
  });

  mockControl.$verifyAll();
}


/**
 * Verifies that synchronous fetches are not supported.
 */
function testOpen_notAsync() {
  mockControl.$replayAll();

  var xhr = factory.createInstance();

  assertThrows(function() {
    xhr.open('GET', 'https://www.google.com', false /* opt_async */);
  });

  mockControl.$verifyAll();
}


/**
 * Verifies the send method.
 */
function testSend() {
  fetchMock(new Request('https://www.google.com', {
    headers: new Headers(),
    method: 'GET'
  })).$returns(Promise.resolve(createSuccessResponse()));

  mockControl.$replayAll();
  verifySendSuccess('GET');
}


/**
 * Verifies the send method with POST mode.
 */
function testSendPost() {
  fetchMock(new Request('https://www.google.com', {
    headers: new Headers(),
    method: 'POST'
  })).$returns(Promise.resolve(createSuccessResponse()));

  mockControl.$replayAll();
  verifySendSuccess('POST');
}


/**
 * Verifies the send method including credentials.
 */
function testSend_includeCredentials() {
  factory = new goog.net.FetchXmlHttpFactory(worker);
  factory.setCredentialsMode(/** @type {RequestCredentials} */ ('include'));
  fetchMock(new Request('https://www.google.com', {
    headers: new Headers(),
    method: 'POST',
    credentials: 'include'
  })).$returns(Promise.resolve(createSuccessResponse()));

  mockControl.$replayAll();
  verifySendSuccess('POST');
}


/**
 * Verifies the send method setting cache mode.
 */
function testSend_setCacheMode() {
  factory = new goog.net.FetchXmlHttpFactory(worker);
  factory.setCacheMode(/** @type {RequestCache} */ ('no-cache'));
  fetchMock(new Request('https://www.google.com', {
    headers: new Headers(),
    method: 'POST',
    cache: 'no-cache'
  })).$returns(Promise.resolve(createSuccessResponse()));

  mockControl.$replayAll();
  verifySendSuccess('POST');
}


/**
 * Util function to verify send method is successful.
 */
function verifySendSuccess(sendMethod) {
  var xhr = factory.createInstance();
  xhr.open(sendMethod, 'https://www.google.com', true /* opt_async */);
  xhr.onreadystatechange = function() {
    assertEquals(
        xhr.readyState, goog.net.FetchXmlHttp.RequestState.HEADER_RECEIVED);
    assertEquals(0, xhr.status);
    assertEquals('', xhr.responseText);
    assertEquals(xhr.getResponseHeader('dummyHeader'), 'dummyHeaderValue');
    xhr.onreadystatechange = function() {
      assertEquals(xhr.readyState, goog.net.FetchXmlHttp.RequestState.LOADING);
      assertEquals(0, xhr.status);
      assertEquals('', xhr.responseText);
      xhr.onreadystatechange = function() {
        assertEquals(200, xhr.status);
        assertEquals('responseBody', xhr.responseText);
        assertEquals(xhr.readyState, goog.net.FetchXmlHttp.RequestState.DONE);
      };
    };
  };
  xhr.send();
  assertEquals(xhr.readyState, goog.net.FetchXmlHttp.RequestState.OPENED);

  mockControl.$verifyAll();
}


/**
 * Verifies the send method in case of error response.
 */
function testSend_error() {
  fetchMock(new Request('https://www.google.com', {
    headers: new Headers(),
    method: 'GET'
  })).$returns(Promise.resolve(createFailedResponse()));

  mockControl.$replayAll();

  var xhr = factory.createInstance();
  xhr.open('GET', 'https://www.google.com', true /* opt_async */);
  xhr.onreadystatechange = function() {
    assertEquals(
        xhr.readyState, goog.net.FetchXmlHttp.RequestState.HEADER_RECEIVED);
    assertEquals(0, xhr.status);
    assertEquals('', xhr.responseText);
    assertEquals(xhr.getResponseHeader('dummyHeader'), 'dummyHeaderValue');
    xhr.onreadystatechange = function() {
      assertEquals(xhr.readyState, goog.net.FetchXmlHttp.RequestState.LOADING);
      assertEquals(0, xhr.status);
      assertEquals('', xhr.responseText);
      xhr.onreadystatechange = function() {
        assertEquals(500, xhr.status);
        assertEquals('responseBody', xhr.responseText);
        assertEquals(xhr.readyState, goog.net.FetchXmlHttp.RequestState.DONE);
      };
    };
  };
  xhr.send();
  assertEquals(xhr.readyState, goog.net.FetchXmlHttp.RequestState.OPENED);
  mockControl.$verifyAll();
}


/**
 * Verifies the send method in case of failure to fetch the url.
 */
function testSend_failToFetch() {
  var failedPromise =
      new Promise(function() { throw Error('failed to fetch'); });
  fetchMock(new Request('https://www.google.com', {
    headers: new Headers(),
    method: 'GET'
  })).$returns(failedPromise);

  mockControl.$replayAll();

  var xhr = factory.createInstance();
  xhr.open('GET', 'https://www.google.com', true /* opt_async */);
  xhr.onreadystatechange = function() {
    assertEquals(xhr.readyState, goog.net.FetchXmlHttp.RequestState.DONE);
    assertEquals(0, xhr.status);
    assertEquals('', xhr.responseText);
  };
  xhr.send();
  assertEquals(xhr.readyState, goog.net.FetchXmlHttp.RequestState.OPENED);

  mockControl.$verifyAll();
}


/**
 * Creates a successful response.
 * @return {!Response}
 */
function createSuccessResponse() {
  var headers = new Headers();
  headers.set('dummyHeader', 'dummyHeaderValue');
  return new Response(
      'responseBody' /* opt_body */, {status: 200, headers: headers});
}


/**
 * Creates a successful response.
 * @return {!Response}
 */
function createFailedResponse() {
  var headers = new Headers();
  headers.set('dummyHeader', 'dummyHeaderValue');
  return new Response(
      'responseBody' /* opt_body */, {status: 500, headers: headers});
}
