// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.i18n.GraphemeBreakTest');
goog.setTestOnly('goog.i18n.GraphemeBreakTest');

goog.require('goog.i18n.GraphemeBreak');
goog.require('goog.testing.jsunit');

function testBreakNormalAscii() {
  assertTrue(
      goog.i18n.GraphemeBreak.hasGraphemeBreak(
          'a'.charCodeAt(0), 'b'.charCodeAt(0), true));
}

function testBreakAsciiWithExtendedChar() {
  assertFalse(
      goog.i18n.GraphemeBreak.hasGraphemeBreak(
          'a'.charCodeAt(0), 0x0300, true));
}

function testBreakSurrogates() {
  assertFalse(goog.i18n.GraphemeBreak.hasGraphemeBreak(0xDA00, 0xDC00, true));
  assertFalse(goog.i18n.GraphemeBreak.hasGraphemeBreak(0xDBFF, 0xDFFF, true));
}

function testBreakHangLxL() {
  assertFalse(goog.i18n.GraphemeBreak.hasGraphemeBreak(0x1100, 0x1100, true));
}

function testBreakHangL_T() {
  assertTrue(goog.i18n.GraphemeBreak.hasGraphemeBreak(0x1100, 0x11A8));
}

function testBreakHangLVxV() {
  assertFalse(goog.i18n.GraphemeBreak.hasGraphemeBreak(0xAC00, 0x1160, true));
}

function testBreakHangLV_L() {
  assertTrue(goog.i18n.GraphemeBreak.hasGraphemeBreak(0xAC00, 0x1100, true));
}

function testBreakHangLVTxT() {
  assertFalse(goog.i18n.GraphemeBreak.hasGraphemeBreak(0xAC01, 0x11A8, true));
}

function testBreakThaiPrependLegacy() {
  assertTrue(goog.i18n.GraphemeBreak.hasGraphemeBreak(0x0E40, 0x0E01));
}

function testBreakThaiPrependExtended() {
  assertTrue(goog.i18n.GraphemeBreak.hasGraphemeBreak(0x0E40, 0x0E01, true));
}

function testBreakDevaSpacingMarkLegacy() {
  assertTrue(goog.i18n.GraphemeBreak.hasGraphemeBreak(0x0915, 0x093E));
}

function testBreakDevaSpacingMarkExtended() {
  assertFalse(goog.i18n.GraphemeBreak.hasGraphemeBreak(0x0915, 0x093E, true));
}

function testBreakDevaViramaSpace() {
  assertTrue(goog.i18n.GraphemeBreak.hasGraphemeBreak(0x094D, 0x0020));
}

function testBreakDevaViramaConsonant() {
  assertFalse(goog.i18n.GraphemeBreak.hasGraphemeBreak(0x094D, 0x0915));
}
