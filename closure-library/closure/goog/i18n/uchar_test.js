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

goog.provide('goog.i18n.uCharTest');
goog.setTestOnly('goog.i18n.uCharTest');

goog.require('goog.i18n.uChar');
goog.require('goog.testing.jsunit');

function testToHexString() {
  var result = goog.i18n.uChar.toHexString('\uD869\uDED6');
  assertEquals('U+2A6D6', result);
}

function testPadString() {
  var result = goog.i18n.uChar.padString_('abc', 4, '0');
  assertEquals('0abc', result);
}

function testToCharCode() {
  var result = goog.i18n.uChar.toCharCode('\uD869\uDED6');
  assertEquals(0x2A6D6, result);
}

function testcodePointAt() {
  // Basic cases.
  assertEquals(0x006C, goog.i18n.uChar.getCodePointAround('Hello!', 2));
  assertEquals(0x2708 /* Airplane symbol (non-ASCII) */,
      goog.i18n.uChar.getCodePointAround('Hello\u2708', 5));

  // Supplementary characters.
  assertEquals(0x2A6D6, goog.i18n.uChar.getCodePointAround('\uD869\uDED6', 0));
  assertEquals(-0x2A6D6, goog.i18n.uChar.getCodePointAround('\uD869\uDED6', 1));
  assertEquals(0xD869, goog.i18n.uChar.getCodePointAround('\uD869' + 'w', 0));
  assertEquals(0xDED6, goog.i18n.uChar.getCodePointAround('\uD869' + 'w' +
      '\uDED6', 2));
}

function testBuildSupplementaryCodePoint() {
  var result = goog.i18n.uChar.buildSupplementaryCodePoint(0xD869, 0xDED6);
  assertEquals(0x2A6D6, result);
  assertNull(goog.i18n.uChar.buildSupplementaryCodePoint(0xDED6, 0xD869));
  assertNull(goog.i18n.uChar.buildSupplementaryCodePoint(0xD869, 0xAC00));
}

function testCharCount() {
  assertEquals(2, goog.i18n.uChar.charCount(0x2A6D6));
  assertEquals(1, goog.i18n.uChar.charCount(0xAC00));
}

function testIsSupplementaryCodePoint() {
  assertTrue(goog.i18n.uChar.isSupplementaryCodePoint(0x2A6D6));
  assertFalse(goog.i18n.uChar.isSupplementaryCodePoint(0xAC00));
}

function testIsLeadSurrogateCodepoint() {
  assertTrue(goog.i18n.uChar.isLeadSurrogateCodePoint(0xD869));
  assertFalse(goog.i18n.uChar.isLeadSurrogateCodePoint(0xDED6));
  assertFalse(goog.i18n.uChar.isLeadSurrogateCodePoint(0xAC00));
}

function testIsTrailSurrogateCodePoint() {
  assertTrue(goog.i18n.uChar.isTrailSurrogateCodePoint(0xDED6));
  assertFalse(goog.i18n.uChar.isTrailSurrogateCodePoint(0xD869));
  assertFalse(goog.i18n.uChar.isTrailSurrogateCodePoint(0xAC00));
}

function testFromCharCode() {
  var result = goog.i18n.uChar.fromCharCode(0x2A6D6);
  assertEquals('\uD869\uDED6', result);
}

function testFromCharCode_invalidValues() {
  var result = goog.i18n.uChar.fromCharCode(-1);
  assertEquals(null, result);

  result = goog.i18n.uChar.fromCharCode(
      goog.i18n.uChar.CODE_POINT_MAX_VALUE_ + 1);
  assertEquals(null, result);

  result = goog.i18n.uChar.fromCharCode(null);
  assertEquals(null, result);

  result = goog.i18n.uChar.fromCharCode(undefined);
  assertEquals(null, result);

  result = goog.i18n.uChar.fromCharCode(NaN);
  assertEquals(null, result);
}
