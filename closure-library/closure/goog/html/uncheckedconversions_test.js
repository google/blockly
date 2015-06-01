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
 * @fileoverview Unit tests for goog.html.uncheckedconversions.
 */

goog.provide('goog.html.uncheckedconversionsTest');

goog.require('goog.html.SafeHtml');
goog.require('goog.html.SafeScript');
goog.require('goog.html.SafeStyle');
goog.require('goog.html.SafeStyleSheet');
goog.require('goog.html.SafeUrl');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.html.uncheckedconversions');
goog.require('goog.i18n.bidi.Dir');
goog.require('goog.string.Const');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.html.uncheckedconversionsTest');


function testSafeHtmlFromStringKnownToSatisfyTypeContract_ok() {
  var html = '<div>irrelevant</div>';
  var safeHtml = goog.html.uncheckedconversions.
      safeHtmlFromStringKnownToSatisfyTypeContract(
          goog.string.Const.from('Test'),
          html,
          goog.i18n.bidi.Dir.LTR);
  assertEquals(html, goog.html.SafeHtml.unwrap(safeHtml));
  assertEquals(goog.i18n.bidi.Dir.LTR, safeHtml.getDirection());
}


function testSafeHtmlFromStringKnownToSatisfyTypeContract_error() {
  assertThrows(function() {
    goog.html.uncheckedconversions.
        safeHtmlFromStringKnownToSatisfyTypeContract(
            goog.string.Const.from(''),
            'irrelevant');
  });
}


function testSafeScriptFromStringKnownToSatisfyTypeContract_ok() {
  var script = 'functionCall(\'irrelevant\');';
  var safeScript = goog.html.uncheckedconversions.
      safeScriptFromStringKnownToSatisfyTypeContract(
          goog.string.Const.from(
              'Safe because value is constant. Security review: b/7685625.'),
          script);
  assertEquals(script, goog.html.SafeScript.unwrap(safeScript));
}


function testSafeScriptFromStringKnownToSatisfyTypeContract_error() {
  assertThrows(function() {
    goog.html.uncheckedconversions.
        safeScriptFromStringKnownToSatisfyTypeContract(
            goog.string.Const.from(''),
            'irrelevant');
  });
}


function testSafeStyleFromStringKnownToSatisfyTypeContract_ok() {
  var style = 'P.special { color:red ; }';
  var safeStyle = goog.html.uncheckedconversions.
      safeStyleFromStringKnownToSatisfyTypeContract(
          goog.string.Const.from(
              'Safe because value is constant. Security review: b/7685625.'),
          style);
  assertEquals(style, goog.html.SafeStyle.unwrap(safeStyle));
}


function testSafeStyleFromStringKnownToSatisfyTypeContract_error() {
  assertThrows(function() {
    goog.html.uncheckedconversions.
        safeStyleFromStringKnownToSatisfyTypeContract(
            goog.string.Const.from(''),
            'irrelevant');
  });
}


function testSafeStyleSheetFromStringKnownToSatisfyTypeContract_ok() {
  var styleSheet = 'P.special { color:red ; }';
  var safeStyleSheet = goog.html.uncheckedconversions.
      safeStyleSheetFromStringKnownToSatisfyTypeContract(
          goog.string.Const.from(
              'Safe because value is constant. Security review: b/7685625.'),
          styleSheet);
  assertEquals(styleSheet, goog.html.SafeStyleSheet.unwrap(safeStyleSheet));
}


function testSafeStyleSheetFromStringKnownToSatisfyTypeContract_error() {
  assertThrows(function() {
    goog.html.uncheckedconversions.
        safeStyleSheetFromStringKnownToSatisfyTypeContract(
            goog.string.Const.from(''),
            'irrelevant');
  });
}


function testSafeUrlFromStringKnownToSatisfyTypeContract_ok() {
  var url = 'http://www.irrelevant.com';
  var safeUrl = goog.html.uncheckedconversions.
      safeUrlFromStringKnownToSatisfyTypeContract(
          goog.string.Const.from(
              'Safe because value is constant. Security review: b/7685625.'),
              url);
  assertEquals(url, goog.html.SafeUrl.unwrap(safeUrl));
}


function testSafeUrlFromStringKnownToSatisfyTypeContract_error() {
  assertThrows(function() {
    goog.html.uncheckedconversions.
        safeUrlFromStringKnownToSatisfyTypeContract(
            goog.string.Const.from(''),
            'http://irrelevant.com');
  });
}


function testTrustedResourceUrlFromStringKnownToSatisfyTypeContract_ok() {
  var url = 'http://www.irrelevant.com';
  var trustedResourceUrl = goog.html.uncheckedconversions.
      trustedResourceUrlFromStringKnownToSatisfyTypeContract(
          goog.string.Const.from(
              'Safe because value is constant. Security review: b/7685625.'),
              url);
  assertEquals(url, goog.html.TrustedResourceUrl.unwrap(trustedResourceUrl));
}


function testTrustedResourceFromStringKnownToSatisfyTypeContract_error() {
  assertThrows(function() {
    goog.html.uncheckedconversions.
        trustedResourceUrlFromStringKnownToSatisfyTypeContract(
            goog.string.Const.from(''),
            'http://irrelevant.com');
  });
}
