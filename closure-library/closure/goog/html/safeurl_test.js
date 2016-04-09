// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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

/**
 * @fileoverview Unit tests for goog.html.SafeUrl and its builders.
 */

goog.provide('goog.html.safeUrlTest');

goog.require('goog.html.SafeUrl');
goog.require('goog.i18n.bidi.Dir');
goog.require('goog.object');
goog.require('goog.string.Const');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

goog.setTestOnly('goog.html.safeUrlTest');


function testSafeUrl() {
  var safeUrl = goog.html.SafeUrl.fromConstant(
      goog.string.Const.from('javascript:trusted();'));
  var extracted = goog.html.SafeUrl.unwrap(safeUrl);
  assertEquals('javascript:trusted();', extracted);
  assertEquals('javascript:trusted();', goog.html.SafeUrl.unwrap(safeUrl));
  assertEquals('SafeUrl{javascript:trusted();}', String(safeUrl));

  // URLs are always LTR.
  assertEquals(goog.i18n.bidi.Dir.LTR, safeUrl.getDirection());

  // Interface markers are present.
  assertTrue(safeUrl.implementsGoogStringTypedString);
  assertTrue(safeUrl.implementsGoogI18nBidiDirectionalString);
}


function testSafeUrlFromBlob_withSafeType() {
  if (isIE9OrLower()) {
    return;
  }
  assertBlobTypeIsSafe('image/png', true);
  assertBlobTypeIsSafe('iMage/pNg', true);
  assertBlobTypeIsSafe('video/mpeg', true);
  assertBlobTypeIsSafe('video/ogg', true);
  assertBlobTypeIsSafe('video/mp4', true);
  assertBlobTypeIsSafe('video/ogg', true);
  assertBlobTypeIsSafe('video/webm', true);
}


function testSafeUrlFromBlob_withUnsafeType() {
  if (isIE9OrLower()) {
    return;
  }
  assertBlobTypeIsSafe('', false);
  assertBlobTypeIsSafe('ximage/png', false);
  assertBlobTypeIsSafe('image/pngx', false);
  assertBlobTypeIsSafe('video/whatever', false);
  assertBlobTypeIsSafe('video/', false);
}


/** @return {boolean} True if running on IE9 or lower. */
function isIE9OrLower() {
  return goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('10');
}


/**
 * Tests creating a SafeUrl from a blob with the given MIME type, asserting
 * whether or not the SafeUrl returned is innocuous or not depending on the
 * given boolean.
 * @param {string} type MIME type to test
 * @param {boolean} isSafe Whether the given MIME type should be considered safe
 *     by {@link SafeUrl.fromBlob}.
 */
function assertBlobTypeIsSafe(type, isSafe) {
  var safeUrl = goog.html.SafeUrl.fromBlob(new Blob(['test'], {type: type}));
  var extracted = goog.html.SafeUrl.unwrap(safeUrl);
  if (isSafe) {
    assertEquals('blob:', extracted.substring(0, 5));
  } else {
    assertEquals(goog.html.SafeUrl.INNOCUOUS_STRING, extracted);
  }
}


function testSafeUrlFromDataUrl_withSafeType() {
  if (isIE9OrLower()) {
    return;
  }
  assertDataUrlIsSafe(
      'data:image/png;base64,' +
          'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=',
      true);
  assertDataUrlIsSafe('dATa:iMage/pNg;bASe64,abc===', true);
  assertDataUrlIsSafe('data:image/webp;base64,abc===', true);
  assertDataUrlIsSafe('data:video/mpeg;base64,abc', true);
  assertDataUrlIsSafe('data:video/ogg;base64,z=', true);
  assertDataUrlIsSafe('data:video/mp4;base64,z=', true);
  assertDataUrlIsSafe('data:video/ogg;base64,z=', true);
  assertDataUrlIsSafe('data:video/webm;base64,z=', true);
}


function testSafeUrlFromDataUrl_withUnsafeType() {
  if (isIE9OrLower()) {
    return;
  }
  assertDataUrlIsSafe('', false);
  assertDataUrlIsSafe(':', false);
  assertDataUrlIsSafe('data:', false);
  assertDataUrlIsSafe('not-data:image/png;base64,z=', false);
  assertDataUrlIsSafe(' data:image/png;base64,z=', false);
  assertDataUrlIsSafe('data:image/png;base64,z= ', false);
  assertDataUrlIsSafe('data:ximage/png', false);
  assertDataUrlIsSafe('data:ximage/png;base64,z=', false);
  assertDataUrlIsSafe('data:image/pngx;base64,z=', false);
  assertDataUrlIsSafe('data:video/whatever;base64,z=', false);
  assertDataUrlIsSafe('data:video/;base64,z=', false);
  assertDataUrlIsSafe('data:image/png;base64,', false);
  assertDataUrlIsSafe('data:image/png;base64,abc=!', false);
  assertDataUrlIsSafe('data:image/png;base64,$$', false);
  assertDataUrlIsSafe('data:image/png;base64,\0', false);
  assertDataUrlIsSafe('data:video/mp4;baze64,z=', false);
  assertDataUrlIsSafe('data:video/mp4;,z=', false);
  assertDataUrlIsSafe('data:text/html,sdfsdfsdfsfsdfs;base64,anything', false);
}


/**
 * Tests creating a SafeUrl from a data URL, asserting whether or not the
 * SafeUrl returned is innocuous or not depending on the given boolean.
 * @param {string} url URL to test.
 * @param {boolean} isSafe Whether the given URL type should be considered safe
 *     by {@link SafeUrl.fromDataUrl}.
 */
function assertDataUrlIsSafe(url, isSafe) {
  var safeUrl = goog.html.SafeUrl.fromDataUrl(url);
  assertEquals(
      isSafe ? url : goog.html.SafeUrl.INNOCUOUS_STRING,
      goog.html.SafeUrl.unwrap(safeUrl));
}


/** @suppress {checkTypes} */
function testUnwrap() {
  var privateFieldName = 'privateDoNotAccessOrElseSafeHtmlWrappedValue_';
  var markerFieldName = 'SAFE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_';
  var propNames = goog.object.getKeys(goog.html.SafeUrl.sanitize(''));
  assertContains(privateFieldName, propNames);
  assertContains(markerFieldName, propNames);
  var evil = {};
  evil[privateFieldName] = 'javascript:evil()';
  evil[markerFieldName] = {};

  var exception = assertThrows(function() { goog.html.SafeUrl.unwrap(evil); });
  assertContains('expected object of type SafeUrl', exception.message);
}


/**
 * Assert that url passes through sanitization unchanged.
 * @param {string|!goog.string.TypedString} url The URL to sanitize.
 */
function assertGoodUrl(url) {
  var expected = url;
  if (url.implementsGoogStringTypedString) {
    expected = url.getTypedStringValue();
  }
  var safeUrl = goog.html.SafeUrl.sanitize(url);
  var extracted = goog.html.SafeUrl.unwrap(safeUrl);
  assertEquals(expected, extracted);
}


/**
 * Assert that url fails sanitization.
 * @param {string|!goog.string.TypedString} url The URL to sanitize.
 */
function assertBadUrl(url) {
  assertEquals(
      goog.html.SafeUrl.INNOCUOUS_STRING,
      goog.html.SafeUrl.unwrap(goog.html.SafeUrl.sanitize(url)));
}


function testSafeUrlSanitize_validatesUrl() {
  // Whitelisted schemes.
  assertGoodUrl('http://example.com/');
  assertGoodUrl('https://example.com');
  assertGoodUrl('mailto:foo@example.com');
  assertGoodUrl('ftp://example.com');
  assertGoodUrl('ftp://username@example.com');
  assertGoodUrl('ftp://username:password@example.com');
  // Scheme is case-insensitive
  assertGoodUrl('HTtp://example.com/');
  // Different URL components go through.
  assertGoodUrl('https://example.com/path?foo=bar#baz');
  // Scheme-less URL with authority.
  assertGoodUrl('//example.com/path');
  // Absolute path with no authority.
  assertGoodUrl('/path');
  assertGoodUrl('/path?foo=bar#baz');
  // Relative path.
  assertGoodUrl('path');
  assertGoodUrl('path?foo=bar#baz');
  assertGoodUrl('p//ath');
  assertGoodUrl('p//ath?foo=bar#baz');
  assertGoodUrl('#baz');
  // Restricted characters ('&', ':', \') after [/?#].
  assertGoodUrl('/&');
  assertGoodUrl('?:');

  // .sanitize() works on program constants.
  assertGoodUrl(goog.string.Const.from('http://example.com/'));

  // Non-whitelisted schemes.
  assertBadUrl('javascript:evil();');
  assertBadUrl('javascript:evil();//\nhttp://good.com/');
  assertBadUrl('data:blah');
  // Restricted characters before [/?#].
  assertBadUrl('&');
  assertBadUrl(':');
  // '\' is not treated like '/': no restricted characters allowed after it.
  assertBadUrl('\\:');
  // Regex anchored to the left: doesn't match on '/:'.
  assertBadUrl(':/:');
  // Regex multiline not enabled: first line would match but second one
  // wouldn't.
  assertBadUrl('path\n:');

  // .sanitize() does not exempt values known to be program constants.
  assertBadUrl(goog.string.Const.from('data:blah'));
}


function testSafeUrlSanitize_idempotentForSafeUrlArgument() {
  // This matches the safe prefix.
  var safeUrl = goog.html.SafeUrl.sanitize('https://www.google.com/');
  var safeUrl2 = goog.html.SafeUrl.sanitize(safeUrl);
  assertEquals(
      goog.html.SafeUrl.unwrap(safeUrl), goog.html.SafeUrl.unwrap(safeUrl2));

  // This doesn't match the safe prefix, getting converted into an innocuous
  // string.
  safeUrl = goog.html.SafeUrl.sanitize('disallowed:foo');
  safeUrl2 = goog.html.SafeUrl.sanitize(safeUrl);
  assertEquals(
      goog.html.SafeUrl.unwrap(safeUrl), goog.html.SafeUrl.unwrap(safeUrl2));
}
