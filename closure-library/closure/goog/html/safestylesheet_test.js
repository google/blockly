// Copyright 2014 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Unit tests for goog.html.SafeStyleSheet and its builders.
 */

goog.provide('goog.html.safeStyleSheetTest');

goog.require('goog.html.SafeStyleSheet');
goog.require('goog.object');
goog.require('goog.string.Const');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.html.safeStyleSheetTest');


function testSafeStyleSheet() {
  var styleSheet = 'P.special { color:red ; }';
  var safeStyleSheet =
      goog.html.SafeStyleSheet.fromConstant(goog.string.Const.from(styleSheet));
  var extracted = goog.html.SafeStyleSheet.unwrap(safeStyleSheet);
  assertEquals(styleSheet, extracted);
  assertEquals(styleSheet, safeStyleSheet.getTypedStringValue());
  assertEquals('SafeStyleSheet{' + styleSheet + '}', String(safeStyleSheet));

  // Interface marker is present.
  assertTrue(safeStyleSheet.implementsGoogStringTypedString);
}


/** @suppress {checkTypes} */
function testUnwrap() {
  var privateFieldName = 'privateDoNotAccessOrElseSafeStyleSheetWrappedValue_';
  var markerFieldName =
      'SAFE_STYLE_SHEET_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_';
  var propNames = goog.object.getKeys(
      goog.html.SafeStyleSheet.fromConstant(goog.string.Const.from('')));
  assertContains(privateFieldName, propNames);
  assertContains(markerFieldName, propNames);
  var evil = {};
  evil[privateFieldName] = 'P.special { color:expression(evil) ; }';
  evil[markerFieldName] = {};

  var exception =
      assertThrows(function() { goog.html.SafeStyleSheet.unwrap(evil); });
  assertContains('expected object of type SafeStyleSheet', exception.message);
}


function testFromConstant_allowsEmptyString() {
  assertEquals(
      goog.html.SafeStyleSheet.EMPTY,
      goog.html.SafeStyleSheet.fromConstant(goog.string.Const.from('')));
}


function testFromConstant_throwsOnLessThanCharacter() {
  assertThrows(function() {
    goog.html.SafeStyleSheet.fromConstant(goog.string.Const.from('x<x'));
  });
}


function testConcat() {
  var styleSheet1 = goog.html.SafeStyleSheet.fromConstant(
      goog.string.Const.from('P.special { color:red ; }'));
  var styleSheet2 = goog.html.SafeStyleSheet.fromConstant(
      goog.string.Const.from('P.regular { color:blue ; }'));
  var expected = 'P.special { color:red ; }P.special { color:red ; }' +
      'P.regular { color:blue ; }P.regular { color:blue ; }';

  var concatStyleSheet = goog.html.SafeStyleSheet.concat(
      styleSheet1, [styleSheet1, styleSheet2], styleSheet2);
  assertEquals(expected, goog.html.SafeStyleSheet.unwrap(concatStyleSheet));

  // Empty.
  concatStyleSheet = goog.html.SafeStyleSheet.concat();
  assertEquals('', goog.html.SafeStyleSheet.unwrap(concatStyleSheet));
  concatStyleSheet = goog.html.SafeStyleSheet.concat([]);
  assertEquals('', goog.html.SafeStyleSheet.unwrap(concatStyleSheet));
}


function testEmpty() {
  assertEquals(
      '', goog.html.SafeStyleSheet.unwrap(goog.html.SafeStyleSheet.EMPTY));
}
