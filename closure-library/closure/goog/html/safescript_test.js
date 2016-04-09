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
 * @fileoverview Unit tests for goog.html.SafeScript and its builders.
 */

goog.provide('goog.html.safeScriptTest');

goog.require('goog.html.SafeScript');
goog.require('goog.object');
goog.require('goog.string.Const');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.html.safeScriptTest');


function testSafeScript() {
  var script = 'var string = \'hello\';';
  var safeScript =
      goog.html.SafeScript.fromConstant(goog.string.Const.from(script));
  var extracted = goog.html.SafeScript.unwrap(safeScript);
  assertEquals(script, extracted);
  assertEquals(script, safeScript.getTypedStringValue());
  assertEquals('SafeScript{' + script + '}', String(safeScript));

  // Interface marker is present.
  assertTrue(safeScript.implementsGoogStringTypedString);
}


/** @suppress {checkTypes} */
function testUnwrap() {
  var privateFieldName = 'privateDoNotAccessOrElseSafeScriptWrappedValue_';
  var markerFieldName = 'SAFE_SCRIPT_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_';
  var propNames = goog.object.getKeys(
      goog.html.SafeScript.fromConstant(goog.string.Const.from('')));
  assertContains(privateFieldName, propNames);
  assertContains(markerFieldName, propNames);
  var evil = {};
  evil[privateFieldName] = 'var string = \'evil\';';
  evil[markerFieldName] = {};

  var exception =
      assertThrows(function() { goog.html.SafeScript.unwrap(evil); });
  assertContains('expected object of type SafeScript', exception.message);
}


function testFromConstant_allowsEmptyString() {
  assertEquals(
      goog.html.SafeScript.EMPTY,
      goog.html.SafeScript.fromConstant(goog.string.Const.from('')));
}


function testEmpty() {
  assertEquals('', goog.html.SafeScript.unwrap(goog.html.SafeScript.EMPTY));
}
