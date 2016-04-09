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
 * @fileoverview Unit tests for goog.html.TrustedResourceUrl and its builders.
 */

goog.provide('goog.html.trustedResourceUrlTest');

goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.i18n.bidi.Dir');
goog.require('goog.object');
goog.require('goog.string.Const');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.html.trustedResourceUrlTest');


function testTrustedResourceUrl() {
  var url = 'javascript:trusted();';
  var trustedResourceUrl =
      goog.html.TrustedResourceUrl.fromConstant(goog.string.Const.from(url));
  var extracted = goog.html.TrustedResourceUrl.unwrap(trustedResourceUrl);
  assertEquals(url, extracted);
  assertEquals(url, trustedResourceUrl.getTypedStringValue());
  assertEquals(
      'TrustedResourceUrl{javascript:trusted();}', String(trustedResourceUrl));

  // URLs are always LTR.
  assertEquals(goog.i18n.bidi.Dir.LTR, trustedResourceUrl.getDirection());

  // Interface markers are present.
  assertTrue(trustedResourceUrl.implementsGoogStringTypedString);
  assertTrue(trustedResourceUrl.implementsGoogI18nBidiDirectionalString);
}


/** @suppress {checkTypes} */
function testUnwrap() {
  var privateFieldName =
      'privateDoNotAccessOrElseTrustedResourceUrlWrappedValue_';
  var markerFieldName =
      'TRUSTED_RESOURCE_URL_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_';
  var propNames = goog.object.getKeys(
      goog.html.TrustedResourceUrl.fromConstant(goog.string.Const.from('')));
  assertContains(privateFieldName, propNames);
  assertContains(markerFieldName, propNames);
  var evil = {};
  evil[privateFieldName] = 'http://example.com/evil.js';
  evil[markerFieldName] = {};

  var exception =
      assertThrows(function() { goog.html.TrustedResourceUrl.unwrap(evil); });
  assertContains(
      'expected object of type TrustedResourceUrl', exception.message);
}
