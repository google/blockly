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

goog.provide('goog.windowTest');
goog.setTestOnly('goog.windowTest');

goog.require('goog.Promise');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.functions');
goog.require('goog.labs.userAgent.browser');
goog.require('goog.labs.userAgent.engine');
goog.require('goog.labs.userAgent.platform');
goog.require('goog.string');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.jsunit');
goog.require('goog.window');

var newWin;
var REDIRECT_URL_PREFIX = 'window_test.html?runTests=';
var WIN_LOAD_TRY_TIMEOUT = 100;
var MAX_WIN_LOAD_TRIES = 50;  // 50x100ms = 5s waiting for window to load.

var stubs = new goog.testing.PropertyReplacer();


function shouldRunTests() {
  // MS Edge has a bunch of flaky test failures around window.open.
  // TODO(joeltine): Remove this when http://b/25455129 is fixed.
  return !goog.labs.userAgent.browser.isEdge();
}


function setUpPage() {
  var anchors = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, 'goog-like-link');
  for (var i = 0; i < anchors.length; i++) {
    goog.events.listen(anchors[i], 'click', function(e) {
      goog.window.open(goog.dom.getTextContent(e.target), {'noreferrer': true});
    });
  }
  goog.testing.TestCase.getActiveTestCase().promiseTimeout = 60000;  // 60s
}


// To test goog.window.open we open a new window with this file again. Once
// the new window parses this file it sets this variable to true, indicating
// that the parent test may check window properties like referrer and location.
var newWinLoaded = true;


function setUp() {
  newWin = undefined;
}


function tearDown() {
  if (newWin) {
    newWin.close();
  }
  stubs.reset();
}


/**
 * Uses setTimeout to poll a new window for the "newWinLoaded" variable, which
 * is set once the JavaScript is evaluated in that window.
 *
 * @param {Window} win
 * @return {!goog.Promise<!Window>} Promise for a window that resolves once the
 *     window has loaded.
 */
function waitForTestWindow(win) {
  return new goog.Promise(function(resolve, reject) {
    var checkWindow = function(numTries) {
      if (!win) {
        fail('Could not open new window. Check if popup blocker is enabled.');
      }
      if (numTries > MAX_WIN_LOAD_TRIES) {
        fail('Window did not load after maximum number of checks.');
      }

      if (win.newWinLoaded) {
        resolve(win);
      } else {
        window.setTimeout(checkWindow, WIN_LOAD_TRY_TIMEOUT);
      }
    };
    checkWindow(0);
  });
}


/**
 * Opens a window and then verifies that the new window has the expected
 * properties.
 *
 * @param {boolean} noreferrer Whether to test the noreferrer option.
 * @param {string} urlParam Url param to append to the url being opened.
 * @param {boolean} encodeUrlParam_opt Whether to percent-encode urlParam. This
 *     is needed because IE will not encode it automatically like other browsers
 *     browser and the Closure test server will 400 on certain characters in
 *     the URL (like '<' and '"').
 * @return {!goog.Promise} Promise that resolves once the test is complete.
 */
function doTestOpenWindow(noreferrer, urlParam, encodeUrlParam_opt) {
  if (encodeUrlParam_opt) {
    urlParam = encodeURIComponent(urlParam);
  }
  // TODO(user): target is set because goog.window.open() will currently
  // allow it to be undefined, which in IE seems to result in the same window
  // being reused, instead of a new one being created. If goog.window.open()
  // is fixed to use "_blank" by default then target can be removed here.
  newWin = goog.window.open(
      REDIRECT_URL_PREFIX + urlParam,
      {'noreferrer': noreferrer, 'target': '_blank'});

  return waitForTestWindow(newWin).then(function(win) {
    verifyWindow(win, noreferrer, urlParam);
  });
}


/**
 * Asserts that a newly created window has the correct parameters.
 *
 * @param {Window} win
 * @param {boolean} noreferrer Whether the noreferrer option is being tested.
 * @param {string} urlParam Url param appended to the url being opened.
 */
function verifyWindow(win, noreferrer, urlParam) {
  if (noreferrer) {
    assertEquals(
        'Referrer should have been stripped', '', win.document.referrer);
  }

  var winUrl = decodeURI(win.location);
  var expectedUrlSuffix = decodeURI(urlParam);
  assertTrue(
      'New window href should have ended with <' + expectedUrlSuffix +
          '> but was <' + winUrl + '>',
      goog.string.endsWith(winUrl, expectedUrlSuffix));
}


function testOpenNotEncoded() {
  return doTestOpenWindow(false, 'bogus~');
}


function testOpenEncoded() {
  return doTestOpenWindow(false, 'bogus%7E');
}


function testOpenEncodedPercent() {
  // Intent of url is to pass %7E to the server, so it was encoded to %257E .
  return doTestOpenWindow(false, 'bogus%257E');
}


function testOpenNotEncodedHidingReferrer() {
  return doTestOpenWindow(true, 'bogus~');
}


function testOpenEncodedHidingReferrer() {
  return doTestOpenWindow(true, 'bogus%7E');
}


function testOpenEncodedPercentHidingReferrer() {
  // Intent of url is to pass %7E to the server, so it was encoded to %257E .
  return doTestOpenWindow(true, 'bogus%257E');
}


function testOpenSemicolon() {
  return doTestOpenWindow(true, 'beforesemi;aftersemi');
}


function testTwoSemicolons() {
  return doTestOpenWindow(true, 'a;b;c');
}


function testOpenAmpersand() {
  return doTestOpenWindow(true, 'this&that');
}


function testOpenSingleQuote() {
  return doTestOpenWindow(true, "'");
}


function testOpenDoubleQuote() {
  return doTestOpenWindow(true, '"', goog.labs.userAgent.browser.isIE());
}


function testOpenTag() {
  return doTestOpenWindow(true, '<', goog.labs.userAgent.browser.isIE());
}


function testOpenBlank() {
  newWin = goog.window.openBlank('Loading...');
  var urlParam = 'bogus~';
  newWin.location.href = REDIRECT_URL_PREFIX + urlParam;
  return waitForTestWindow(newWin).then(function() {
    verifyWindow(newWin, false, urlParam);
  });
}


function testOpenBlankReturnsNullPopupBlocker() {
  var mockWin = {
    // emulate popup-blocker by returning a null window on open().
    open: function() { return null; }
  };
  var win = goog.window.openBlank('', {noreferrer: true}, mockWin);
  assertNull(win);
}


function testOpenBlankEscapesSafely() {
  // Opening a window with javascript: and then reading from its document.body
  // is problematic because in some browsers the document.body won't have been
  // updated yet, and in some IE versions the parent window does not have
  // access to document.body in new blank window.
  var navigatedUrl;
  var mockWin = {open: function(url) { navigatedUrl = url; }};

  // Test string determines that all necessary escaping transformations happen,
  // and that they happen in the right order (HTML->JS->URI).
  // - " which would be escaped by HTML escaping and JS string escaping. It
  //     should be HTML escaped.
  // - \ which would be escaped by JS string escaping and percent-encoded
  //     by encodeURI(). It gets JS string escaped first (to two '\') and then
  //     percent-encoded.
  var win = goog.window.openBlank('"\\', {}, mockWin);
  assertEquals('javascript:"&quot;%5C%5C"', navigatedUrl);
}


function testOpenIosBlank() {
  if (!goog.labs.userAgent.engine.isWebKit() || !window.navigator) {
    // Don't even try this on IE8!
    return;
  }
  var attrs = {};
  var dispatchedEvent = null;
  var element = {
    setAttribute: function(name, value) { attrs[name] = value; },
    dispatchEvent: function(event) { dispatchedEvent = event; }
  };
  stubs.replace(window.document, 'createElement', function(name) {
    if (name == goog.dom.TagName.A) {
      return element;
    }
    return null;
  });
  stubs.set(window.navigator, 'standalone', true);
  stubs.replace(goog.labs.userAgent.platform, 'isIos', goog.functions.TRUE);

  var newWin = goog.window.open('http://google.com', {target: '_blank'});

  // This mode cannot return a new window.
  assertNotNull(newWin);
  assertUndefined(newWin.document);

  // Attributes.
  assertEquals('http://google.com', attrs['href']);
  assertEquals('_blank', attrs['target']);
  assertEquals('', attrs['rel'] || '');

  // Click event.
  assertNotNull(dispatchedEvent);
  assertEquals('click', dispatchedEvent.type);
}


function testOpenIosBlankNoreferrer() {
  if (!goog.labs.userAgent.engine.isWebKit() || !window.navigator) {
    // Don't even try this on IE8!
    return;
  }
  var attrs = {};
  var dispatchedEvent = null;
  var element = {
    setAttribute: function(name, value) { attrs[name] = value; },
    dispatchEvent: function(event) { dispatchedEvent = event; }
  };
  stubs.replace(window.document, 'createElement', function(name) {
    if (name == goog.dom.TagName.A) {
      return element;
    }
    return null;
  });
  stubs.set(window.navigator, 'standalone', true);
  stubs.replace(goog.labs.userAgent.platform, 'isIos', goog.functions.TRUE);

  var newWin = goog.window.open(
      'http://google.com', {target: '_blank', noreferrer: true});

  // This mode cannot return a new window.
  assertNotNull(newWin);
  assertUndefined(newWin.document);

  // Attributes.
  assertEquals('http://google.com', attrs['href']);
  assertEquals('_blank', attrs['target']);
  assertEquals('noreferrer', attrs['rel']);

  // Click event.
  assertNotNull(dispatchedEvent);
  assertEquals('click', dispatchedEvent.type);
}


function testOpenNoReferrerEscapesUrl() {
  var documentWriteHtml;
  var mockNewWin = {};
  mockNewWin.document = {
    write: function(html) { documentWriteHtml = html; },
    close: function() {}
  };
  var mockWin = {open: function() { return mockNewWin; }};
  goog.window.open('https://hello&world', {noreferrer: true}, mockWin);
  assertRegExp(
      'Does not contain expected HTML-escaped string: ' + documentWriteHtml,
      /hello&amp;world/, documentWriteHtml);
}
