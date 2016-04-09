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

goog.provide('goog.i18n.BidiFormatterTest');
goog.setTestOnly('goog.i18n.BidiFormatterTest');

goog.require('goog.html.SafeHtml');
goog.require('goog.i18n.BidiFormatter');
goog.require('goog.i18n.bidi.Dir');
goog.require('goog.i18n.bidi.Format');
goog.require('goog.testing.jsunit');

var LRM = goog.i18n.bidi.Format.LRM;
var RLM = goog.i18n.bidi.Format.RLM;
var LRE = goog.i18n.bidi.Format.LRE;
var RLE = goog.i18n.bidi.Format.RLE;
var PDF = goog.i18n.bidi.Format.PDF;
var LTR = goog.i18n.bidi.Dir.LTR;
var RTL = goog.i18n.bidi.Dir.RTL;
var NEUTRAL = goog.i18n.bidi.Dir.NEUTRAL;
var he = '\u05e0\u05e1';
var en = 'abba';
var html = '&lt;';
var longEn = 'abba sabba gabba ';
var longHe = '\u05e0 \u05e1 \u05e0 ';
var ltrFmt = new goog.i18n.BidiFormatter(LTR, false);   // LTR context
var rtlFmt = new goog.i18n.BidiFormatter(RTL, false);   // RTL context
var unkFmt = new goog.i18n.BidiFormatter(null, false);  // unknown context

function testGetContextDir() {
  assertEquals(null, unkFmt.getContextDir());
  assertEquals(null, new goog.i18n.BidiFormatter(NEUTRAL).getContextDir());
  assertEquals(LTR, ltrFmt.getContextDir());
  assertEquals(RTL, rtlFmt.getContextDir());
}

function testEstimateDirection() {
  assertEquals(NEUTRAL, ltrFmt.estimateDirection(''));
  assertEquals(NEUTRAL, rtlFmt.estimateDirection(''));
  assertEquals(NEUTRAL, unkFmt.estimateDirection(''));
  assertEquals(LTR, ltrFmt.estimateDirection(en));
  assertEquals(LTR, rtlFmt.estimateDirection(en));
  assertEquals(LTR, unkFmt.estimateDirection(en));
  assertEquals(RTL, ltrFmt.estimateDirection(he));
  assertEquals(RTL, rtlFmt.estimateDirection(he));
  assertEquals(RTL, unkFmt.estimateDirection(he));

  // Text contains HTML or HTML-escaping.
  assertEquals(
      LTR,
      ltrFmt.estimateDirection('<some sort of tag/>' + he + ' &amp;', false));
  assertEquals(
      RTL,
      ltrFmt.estimateDirection('<some sort of tag/>' + he + ' &amp;', true));
}

function testDirAttrValue() {
  assertEquals(
      'overall dir is RTL, context dir is LTR', 'rtl',
      ltrFmt.dirAttrValue(he, true));
  assertEquals(
      'overall dir and context dir are RTL', 'rtl',
      rtlFmt.dirAttrValue(he, true));
  assertEquals(
      'overall dir is LTR, context dir is RTL', 'ltr',
      rtlFmt.dirAttrValue(en, true));
  assertEquals(
      'overall dir and context dir are LTR', 'ltr',
      ltrFmt.dirAttrValue(en, true));

  // Input's directionality is neutral.
  assertEquals('ltr', ltrFmt.dirAttrValue('', true));
  assertEquals('rtl', rtlFmt.dirAttrValue('', true));
  assertEquals('ltr', unkFmt.dirAttrValue('', true));

  // Text contains HTML or HTML-escaping:
  assertEquals(
      'rtl', ltrFmt.dirAttrValue(he + '<some sort of an HTML tag>', true));
  assertEquals(
      'ltr', ltrFmt.dirAttrValue(he + '<some sort of an HTML tag>', false));
}

function testKnownDirAttrValue() {
  assertEquals('rtl', ltrFmt.knownDirAttrValue(RTL));
  assertEquals('rtl', rtlFmt.knownDirAttrValue(RTL));
  assertEquals('rtl', unkFmt.knownDirAttrValue(RTL));
  assertEquals('ltr', rtlFmt.knownDirAttrValue(LTR));
  assertEquals('ltr', ltrFmt.knownDirAttrValue(LTR));
  assertEquals('ltr', unkFmt.knownDirAttrValue(LTR));

  // Input directionality is neutral.
  assertEquals('ltr', ltrFmt.knownDirAttrValue(NEUTRAL));
  assertEquals('rtl', rtlFmt.knownDirAttrValue(NEUTRAL));
  assertEquals('ltr', unkFmt.knownDirAttrValue(NEUTRAL));
}

function testDirAttr() {
  assertEquals(
      'overall dir (RTL) doesnt match context dir (LTR)', 'dir="rtl"',
      ltrFmt.dirAttr(he, true));
  assertEquals(
      'overall dir (RTL) doesnt match context dir (unknown)', 'dir="rtl"',
      unkFmt.dirAttr(he, true));
  assertEquals(
      'overall dir matches context dir (RTL)', '', rtlFmt.dirAttr(he, true));

  assertEquals(
      'overall dir (LTR) doesnt match context dir (RTL)', 'dir="ltr"',
      rtlFmt.dirAttr(en, true));
  assertEquals(
      'overall dir (LTR) doesnt match context dir (unknown)', 'dir="ltr"',
      unkFmt.dirAttr(en, true));
  assertEquals(
      'overall dir matches context dir (LTR)', '', ltrFmt.dirAttr(en, true));

  assertEquals('neutral in RTL context', '', rtlFmt.dirAttr('.', true));
  assertEquals('neutral in LTR context', '', ltrFmt.dirAttr('.', true));
  assertEquals('neutral in unknown context', '', unkFmt.dirAttr('.', true));

  // Text contains HTML or HTML-escaping:
  assertEquals(
      'dir="rtl"', ltrFmt.dirAttr(he + '<some sort of an HTML tag>', true));
  assertEquals('', ltrFmt.dirAttr(he + '<some sort of an HTML tag>', false));
}

function testKnownDirAttr() {
  assertEquals(
      'overall dir (RTL) doesnt match context dir (LTR)', 'dir="rtl"',
      ltrFmt.knownDirAttr(RTL));
  assertEquals(
      'overall dir matches context dir (RTL)', '', rtlFmt.knownDirAttr(RTL));
  assertEquals(
      'overall dir (LTR) doesnt match context dir (RTL)', 'dir="ltr"',
      rtlFmt.knownDirAttr(LTR));
  assertEquals(
      'overall dir matches context dir (LTR)', '', ltrFmt.knownDirAttr(LTR));
}

function testSpanWrap() {
  // alwaysSpan is false and opt_isHtml is true, unless specified otherwise.
  assertEquals(
      'overall dir matches context dir (LTR), no dirReset', en,
      ltrFmt.spanWrap(en, true, false));
  assertEquals(
      'overall dir matches context dir (LTR), dirReset', en,
      ltrFmt.spanWrap(en, true, true));
  assertEquals(
      'overall dir matches context dir (RTL), no dirReset', he,
      rtlFmt.spanWrap(he, true, false));
  assertEquals(
      'overall dir matches context dir (RTL), dirReset', he,
      rtlFmt.spanWrap(he, true, true));

  assertEquals(
      'overall dir (RTL) doesnt match context dir (LTR), ' +
          'no dirReset',
      '<span dir="rtl">' + he + '<\/span>', ltrFmt.spanWrap(he, true, false));
  assertEquals(
      'overall dir (RTL) doesnt match context dir (LTR), dirReset',
      '<span dir="rtl">' + he + '<\/span>' + LRM,
      ltrFmt.spanWrap(he, true, true));
  assertEquals(
      'overall dir (LTR) doesnt match context dir (RTL), ' +
          'no dirReset',
      '<span dir="ltr">' + en + '<\/span>', rtlFmt.spanWrap(en, true, false));
  assertEquals(
      'overall dir (LTR) doesnt match context dir (RTL), dirReset',
      '<span dir="ltr">' + en + '<\/span>' + RLM,
      rtlFmt.spanWrap(en, true, true));
  assertEquals(
      'overall dir (LTR) doesnt match context dir (unknown), ' +
          'no dirReset',
      '<span dir="ltr">' + en + '<\/span>', unkFmt.spanWrap(en, true, false));
  assertEquals(
      'overall dir (RTL) doesnt match context dir (unknown), ' +
          'dirReset',
      '<span dir="rtl">' + he + '<\/span>', unkFmt.spanWrap(he, true, true));
  assertEquals(
      'overall dir (neutral) doesnt match context dir (LTR), ' +
          'dirReset',
      '', ltrFmt.spanWrap('', true, true));

  assertEquals(
      'exit dir (but not overall dir) is opposite to context dir, ' +
          'dirReset',
      longEn + he + html + LRM,
      ltrFmt.spanWrap(longEn + he + html, true, true));
  assertEquals(
      'overall dir (but not exit dir) is opposite to context dir, ' +
          'dirReset',
      '<span dir="ltr">' + longEn + he + '<\/span>' + RLM,
      rtlFmt.spanWrap(longEn + he, true, true));

  assertEquals(
      'input is plain text (not escaped)', '&lt;br&gt;' + en,
      ltrFmt.spanWrap('<br>' + en, false, false));

  var ltrAlwaysSpanFmt = new goog.i18n.BidiFormatter(LTR, true);
  var rtlAlwaysSpanFmt = new goog.i18n.BidiFormatter(RTL, true);
  var unkAlwaysSpanFmt = new goog.i18n.BidiFormatter(null, true);

  assertEquals(
      'alwaysSpan, overall dir matches context dir (LTR), ' +
          'no dirReset',
      '<span>' + en + '<\/span>', ltrAlwaysSpanFmt.spanWrap(en, true, false));
  assertEquals(
      'alwaysSpan, overall dir matches context dir (LTR), dirReset',
      '<span>' + en + '<\/span>', ltrAlwaysSpanFmt.spanWrap(en, true, true));
  assertEquals(
      'alwaysSpan, overall dir matches context dir (RTL), ' +
          'no dirReset',
      '<span>' + he + '<\/span>', rtlAlwaysSpanFmt.spanWrap(he, true, false));
  assertEquals(
      'alwaysSpan, overall dir matches context dir (RTL), dirReset',
      '<span>' + he + '<\/span>', rtlAlwaysSpanFmt.spanWrap(he, true, true));

  assertEquals(
      'alwaysSpan, overall dir (RTL) doesnt match ' +
          'context dir (LTR), no dirReset',
      '<span dir="rtl">' + he + '<\/span>',
      ltrAlwaysSpanFmt.spanWrap(he, true, false));
  assertEquals(
      'alwaysSpan, overall dir (RTL) doesnt match ' +
          'context dir (LTR), dirReset',
      '<span dir="rtl">' + he + '<\/span>' + LRM,
      ltrAlwaysSpanFmt.spanWrap(he, true, true));
  assertEquals(
      'alwaysSpan, overall dir (neutral) doesnt match ' +
          'context dir (LTR), dirReset',
      '<span></span>', ltrAlwaysSpanFmt.spanWrap('', true, true));
}

function testSpanWrapSafeHtml() {
  var html = goog.html.SafeHtml.htmlEscape('a');
  var wrapped = rtlFmt.spanWrapSafeHtml(html, false);
  assertHtmlEquals('<span dir="ltr">a</span>', wrapped);
  assertEquals(NEUTRAL, wrapped.getDirection());
}

function testSpanWrapWithKnownDir() {
  assertEquals(
      'known LTR in LTR context', en, ltrFmt.spanWrapWithKnownDir(LTR, en));
  assertEquals(
      'unknown LTR in LTR context', en, ltrFmt.spanWrapWithKnownDir(null, en));
  assertEquals(
      'overall LTR but exit RTL in LTR context', he + LRM,
      ltrFmt.spanWrapWithKnownDir(LTR, he));
  assertEquals(
      'known RTL in LTR context', '<span dir="rtl">' + he + '<\/span>' + LRM,
      ltrFmt.spanWrapWithKnownDir(RTL, he));
  assertEquals(
      'unknown RTL in LTR context', '<span dir="rtl">' + he + '<\/span>' + LRM,
      ltrFmt.spanWrapWithKnownDir(null, he));
  assertEquals(
      'overall RTL but exit LTR in LTR context',
      '<span dir="rtl">' + en + '<\/span>' + LRM,
      ltrFmt.spanWrapWithKnownDir(RTL, en));
  assertEquals(
      'known neutral in LTR context', '.',
      ltrFmt.spanWrapWithKnownDir(NEUTRAL, '.'));
  assertEquals(
      'unknown neutral in LTR context', '.',
      ltrFmt.spanWrapWithKnownDir(null, '.'));
  assertEquals(
      'overall neutral but exit LTR in LTR context', en,
      ltrFmt.spanWrapWithKnownDir(NEUTRAL, en));
  assertEquals(
      'overall neutral but exit RTL in LTR context', he + LRM,
      ltrFmt.spanWrapWithKnownDir(NEUTRAL, he));

  assertEquals(
      'known RTL in RTL context', he, rtlFmt.spanWrapWithKnownDir(RTL, he));
  assertEquals(
      'unknown RTL in RTL context', he, rtlFmt.spanWrapWithKnownDir(null, he));
  assertEquals(
      'overall RTL but exit LTR in RTL context', en + RLM,
      rtlFmt.spanWrapWithKnownDir(RTL, en));
  assertEquals(
      'known LTR in RTL context', '<span dir="ltr">' + en + '<\/span>' + RLM,
      rtlFmt.spanWrapWithKnownDir(LTR, en));
  assertEquals(
      'unknown LTR in RTL context', '<span dir="ltr">' + en + '<\/span>' + RLM,
      rtlFmt.spanWrapWithKnownDir(null, en));
  assertEquals(
      'LTR but exit RTL in RTL context',
      '<span dir="ltr">' + he + '<\/span>' + RLM,
      rtlFmt.spanWrapWithKnownDir(LTR, he));
  assertEquals(
      'known neutral in RTL context', '.',
      rtlFmt.spanWrapWithKnownDir(NEUTRAL, '.'));
  assertEquals(
      'unknown neutral in RTL context', '.',
      rtlFmt.spanWrapWithKnownDir(null, '.'));
  assertEquals(
      'overall neutral but exit LTR in LTR context', he,
      rtlFmt.spanWrapWithKnownDir(NEUTRAL, he));
  assertEquals(
      'overall neutral but exit RTL in LTR context', en + RLM,
      rtlFmt.spanWrapWithKnownDir(NEUTRAL, en));

  assertEquals(
      'known RTL in unknown context', '<span dir="rtl">' + he + '<\/span>',
      unkFmt.spanWrapWithKnownDir(RTL, he));
  assertEquals(
      'unknown RTL in unknown context', '<span dir="rtl">' + he + '<\/span>',
      unkFmt.spanWrapWithKnownDir(null, he));
  assertEquals(
      'overall RTL but exit LTR in unknown context',
      '<span dir="rtl">' + en + '<\/span>',
      unkFmt.spanWrapWithKnownDir(RTL, en));
  assertEquals(
      'known LTR in unknown context', '<span dir="ltr">' + en + '<\/span>',
      unkFmt.spanWrapWithKnownDir(LTR, en));
  assertEquals(
      'unknown LTR in unknown context', '<span dir="ltr">' + en + '<\/span>',
      unkFmt.spanWrapWithKnownDir(null, en));
  assertEquals(
      'LTR but exit RTL in unknown context',
      '<span dir="ltr">' + he + '<\/span>',
      unkFmt.spanWrapWithKnownDir(LTR, he));
  assertEquals(
      'known neutral in unknown context', '.',
      unkFmt.spanWrapWithKnownDir(NEUTRAL, '.'));
  assertEquals(
      'unknown neutral in unknown context', '.',
      unkFmt.spanWrapWithKnownDir(null, '.'));
  assertEquals(
      'overall neutral but exit LTR in unknown context', he,
      unkFmt.spanWrapWithKnownDir(NEUTRAL, he));
  assertEquals(
      'overall neutral but exit RTL in unknown context', en,
      unkFmt.spanWrapWithKnownDir(NEUTRAL, en));
}

function testSpanWrapSafeHtmlWithKnownDir() {
  var html = goog.html.SafeHtml.htmlEscape('a');
  assertHtmlEquals(
      '<span dir="ltr">a</span>',
      rtlFmt.spanWrapSafeHtmlWithKnownDir(LTR, html, false));
}

function testUnicodeWrap() {
  // opt_isHtml is true, unless specified otherwise.
  assertEquals(
      'overall dir matches context dir (LTR), no dirReset', en,
      ltrFmt.unicodeWrap(en, true, false));
  assertEquals(
      'overall dir matches context dir (LTR), dirReset', en,
      ltrFmt.unicodeWrap(en, true, true));
  assertEquals(
      'overall dir matches context dir (RTL), no dirReset', he,
      rtlFmt.unicodeWrap(he, true, false));
  assertEquals(
      'overall dir matches context dir (RTL), dirReset', he,
      rtlFmt.unicodeWrap(he, true, true));

  assertEquals(
      'overall dir (RTL) doesnt match context dir (LTR), ' +
          'no dirReset',
      RLE + he + PDF, ltrFmt.unicodeWrap(he, true, false));
  assertEquals(
      'overall dir (RTL) doesnt match context dir (LTR), dirReset',
      RLE + he + PDF + LRM, ltrFmt.unicodeWrap(he, true, true));
  assertEquals(
      'overall dir (LTR) doesnt match context dir (RTL), ' +
          'no dirReset',
      LRE + en + PDF, rtlFmt.unicodeWrap(en, true, false));
  assertEquals(
      'overall dir (LTR) doesnt match context dir (RTL), dirReset',
      LRE + en + PDF + RLM, rtlFmt.unicodeWrap(en, true, true));
  assertEquals(
      'overall dir (LTR) doesnt match context dir (unknown), ' +
          'no dirReset',
      LRE + en + PDF, unkFmt.unicodeWrap(en, true, false));
  assertEquals(
      'overall dir (RTL) doesnt match context dir (unknown), ' +
          'dirReset',
      RLE + he + PDF, unkFmt.unicodeWrap(he, true, true));
  assertEquals(
      'overall dir (neutral) doesnt match context dir (LTR), ' +
          'dirReset',
      '', ltrFmt.unicodeWrap('', true, true));

  assertEquals(
      'exit dir (but not overall dir) is opposite to context dir, ' +
          'dirReset',
      longEn + he + html + LRM,
      ltrFmt.unicodeWrap(longEn + he + html, true, true));
  assertEquals(
      'overall dir (but not exit dir) is opposite to context dir, ' +
          'dirReset',
      LRE + longEn + he + PDF + RLM,
      rtlFmt.unicodeWrap(longEn + he, true, true));
}

function testUnicodeWrapWithKnownDir() {
  assertEquals(
      'known LTR in LTR context', en, ltrFmt.unicodeWrapWithKnownDir(LTR, en));
  assertEquals(
      'unknown LTR in LTR context', en,
      ltrFmt.unicodeWrapWithKnownDir(null, en));
  assertEquals(
      'overall LTR but exit RTL in LTR context', he + LRM,
      ltrFmt.unicodeWrapWithKnownDir(LTR, he));
  assertEquals(
      'known RTL in LTR context', RLE + he + PDF + LRM,
      ltrFmt.unicodeWrapWithKnownDir(RTL, he));
  assertEquals(
      'unknown RTL in LTR context', RLE + he + PDF + LRM,
      ltrFmt.unicodeWrapWithKnownDir(null, he));
  assertEquals(
      'overall RTL but exit LTR in LTR context', RLE + en + PDF + LRM,
      ltrFmt.unicodeWrapWithKnownDir(RTL, en));
  assertEquals(
      'known neutral in LTR context', '.',
      ltrFmt.unicodeWrapWithKnownDir(NEUTRAL, '.'));
  assertEquals(
      'unknown neutral in LTR context', '.',
      ltrFmt.unicodeWrapWithKnownDir(null, '.'));
  assertEquals(
      'overall neutral but exit LTR in LTR context', en,
      ltrFmt.unicodeWrapWithKnownDir(NEUTRAL, en));
  assertEquals(
      'overall neutral but exit RTL in LTR context', he + LRM,
      ltrFmt.unicodeWrapWithKnownDir(NEUTRAL, he));

  assertEquals(
      'known RTL in RTL context', he, rtlFmt.unicodeWrapWithKnownDir(RTL, he));
  assertEquals(
      'unknown RTL in RTL context', he,
      rtlFmt.unicodeWrapWithKnownDir(null, he));
  assertEquals(
      'overall RTL but exit LTR in RTL context', en + RLM,
      rtlFmt.unicodeWrapWithKnownDir(RTL, en));
  assertEquals(
      'known LTR in RTL context', LRE + en + PDF + RLM,
      rtlFmt.unicodeWrapWithKnownDir(LTR, en));
  assertEquals(
      'unknown LTR in RTL context', LRE + en + PDF + RLM,
      rtlFmt.unicodeWrapWithKnownDir(null, en));
  assertEquals(
      'LTR but exit RTL in RTL context', LRE + he + PDF + RLM,
      rtlFmt.unicodeWrapWithKnownDir(LTR, he));
  assertEquals(
      'known neutral in RTL context', '.',
      rtlFmt.unicodeWrapWithKnownDir(NEUTRAL, '.'));
  assertEquals(
      'unknown neutral in RTL context', '.',
      rtlFmt.unicodeWrapWithKnownDir(null, '.'));
  assertEquals(
      'overall neutral but exit LTR in LTR context', he,
      rtlFmt.unicodeWrapWithKnownDir(NEUTRAL, he));
  assertEquals(
      'overall neutral but exit RTL in LTR context', en + RLM,
      rtlFmt.unicodeWrapWithKnownDir(NEUTRAL, en));

  assertEquals(
      'known RTL in unknown context', RLE + he + PDF,
      unkFmt.unicodeWrapWithKnownDir(RTL, he));
  assertEquals(
      'unknown RTL in unknown context', RLE + he + PDF,
      unkFmt.unicodeWrapWithKnownDir(null, he));
  assertEquals(
      'overall RTL but exit LTR in unknown context', RLE + en + PDF,
      unkFmt.unicodeWrapWithKnownDir(RTL, en));
  assertEquals(
      'known LTR in unknown context', LRE + en + PDF,
      unkFmt.unicodeWrapWithKnownDir(LTR, en));
  assertEquals(
      'unknown LTR in unknown context', LRE + en + PDF,
      unkFmt.unicodeWrapWithKnownDir(null, en));
  assertEquals(
      'LTR but exit RTL in unknown context', LRE + he + PDF,
      unkFmt.unicodeWrapWithKnownDir(LTR, he));
  assertEquals(
      'known neutral in unknown context', '.',
      unkFmt.unicodeWrapWithKnownDir(NEUTRAL, '.'));
  assertEquals(
      'unknown neutral in unknown context', '.',
      unkFmt.unicodeWrapWithKnownDir(null, '.'));
  assertEquals(
      'overall neutral but exit LTR in unknown context', he,
      unkFmt.unicodeWrapWithKnownDir(NEUTRAL, he));
  assertEquals(
      'overall neutral but exit RTL in unknown context', en,
      unkFmt.unicodeWrapWithKnownDir(NEUTRAL, en));
}

function testMarkAfter() {
  assertEquals(
      'exit dir (RTL) is opposite to context dir (LTR)', LRM,
      ltrFmt.markAfter(longEn + he + html, true));
  assertEquals(
      'exit dir (LTR) is opposite to context dir (RTL)', RLM,
      rtlFmt.markAfter(longHe + en, true));
  assertEquals(
      'exit dir (LTR) doesnt match context dir (unknown)', '',
      unkFmt.markAfter(longEn + en, true));
  assertEquals(
      'overall dir (RTL) is opposite to context dir (LTR)', LRM,
      ltrFmt.markAfter(longHe + en, true));
  assertEquals(
      'overall dir (LTR) is opposite to context dir (RTL)', RLM,
      rtlFmt.markAfter(longEn + he, true));
  assertEquals(
      'exit dir and overall dir match context dir (LTR)', '',
      ltrFmt.markAfter(longEn + he + html, false));
  assertEquals(
      'exit dir and overall dir matches context dir (RTL)', '',
      rtlFmt.markAfter(longHe + he, true));
}

function testMarkAfterKnownDir() {
  assertEquals(
      'known LTR in LTR context', '', ltrFmt.markAfterKnownDir(LTR, en));
  assertEquals(
      'unknown LTR in LTR context', '', ltrFmt.markAfterKnownDir(null, en));
  assertEquals(
      'overall LTR but exit RTL in LTR context', LRM,
      ltrFmt.markAfterKnownDir(LTR, he));
  assertEquals(
      'known RTL in LTR context', LRM, ltrFmt.markAfterKnownDir(RTL, he));
  assertEquals(
      'unknown RTL in LTR context', LRM, ltrFmt.markAfterKnownDir(null, he));
  assertEquals(
      'overall RTL but exit LTR in LTR context', LRM,
      ltrFmt.markAfterKnownDir(RTL, en));
  assertEquals(
      'known neutral in LTR context', '',
      ltrFmt.markAfterKnownDir(NEUTRAL, '.'));
  assertEquals(
      'unknown neutral in LTR context', '',
      ltrFmt.markAfterKnownDir(null, '.'));
  assertEquals(
      'overall neutral but exit LTR in LTR context', '',
      ltrFmt.markAfterKnownDir(NEUTRAL, en));
  assertEquals(
      'overall neutral but exit RTL in LTR context', LRM,
      ltrFmt.markAfterKnownDir(NEUTRAL, he));

  assertEquals(
      'known RTL in RTL context', '', rtlFmt.markAfterKnownDir(RTL, he));
  assertEquals(
      'unknown RTL in RTL context', '', rtlFmt.markAfterKnownDir(null, he));
  assertEquals(
      'overall RTL but exit LTR in RTL context', RLM,
      rtlFmt.markAfterKnownDir(RTL, en));
  assertEquals(
      'known LTR in RTL context', RLM, rtlFmt.markAfterKnownDir(LTR, en));
  assertEquals(
      'unknown LTR in RTL context', RLM, rtlFmt.markAfterKnownDir(null, en));
  assertEquals(
      'LTR but exit RTL in RTL context', RLM,
      rtlFmt.markAfterKnownDir(LTR, he));
  assertEquals(
      'known neutral in RTL context', '',
      rtlFmt.markAfterKnownDir(NEUTRAL, '.'));
  assertEquals(
      'unknown neutral in RTL context', '',
      rtlFmt.markAfterKnownDir(null, '.'));
  assertEquals(
      'overall neutral but exit LTR in LTR context', '',
      rtlFmt.markAfterKnownDir(NEUTRAL, he));
  assertEquals(
      'overall neutral but exit RTL in LTR context', RLM,
      rtlFmt.markAfterKnownDir(NEUTRAL, en));

  assertEquals(
      'known RTL in unknown context', '', unkFmt.markAfterKnownDir(RTL, he));
  assertEquals(
      'unknown RTL in unknown context', '', unkFmt.markAfterKnownDir(null, he));
  assertEquals(
      'overall RTL but exit LTR in unknown context', '',
      unkFmt.markAfterKnownDir(RTL, en));
  assertEquals(
      'known LTR in unknown context', '', unkFmt.markAfterKnownDir(LTR, en));
  assertEquals(
      'unknown LTR in unknown context', '', unkFmt.markAfterKnownDir(null, en));
  assertEquals(
      'LTR but exit RTL in unknown context', '',
      unkFmt.markAfterKnownDir(LTR, he));
  assertEquals(
      'known neutral in unknown context', '',
      unkFmt.markAfterKnownDir(NEUTRAL, '.'));
  assertEquals(
      'unknown neutral in unknown context', '',
      unkFmt.markAfterKnownDir(null, '.'));
  assertEquals(
      'overall neutral but exit LTR in unknown context', '',
      unkFmt.markAfterKnownDir(NEUTRAL, he));
  assertEquals(
      'overall neutral but exit RTL in unknown context', '',
      unkFmt.markAfterKnownDir(NEUTRAL, en));
}

function testMark() {
  // Implicitly, also tests the constructor.
  assertEquals(LRM, (new goog.i18n.BidiFormatter(LTR)).mark());
  assertEquals('', (new goog.i18n.BidiFormatter(null)).mark());
  assertEquals('', (new goog.i18n.BidiFormatter(NEUTRAL)).mark());
  assertEquals(RLM, (new goog.i18n.BidiFormatter(RTL)).mark());
  assertEquals(RLM, (new goog.i18n.BidiFormatter(true)).mark());
  assertEquals(LRM, (new goog.i18n.BidiFormatter(false)).mark());
}

function testStartEdge() {
  assertEquals('left', ltrFmt.startEdge());
  assertEquals('left', unkFmt.startEdge());
  assertEquals('right', rtlFmt.startEdge());
}

function testEndEdge() {
  assertEquals('right', ltrFmt.endEdge());
  assertEquals('right', unkFmt.endEdge());
  assertEquals('left', rtlFmt.endEdge());
}

function assertHtmlEquals(expected, html) {
  assertEquals(expected, goog.html.SafeHtml.unwrap(html));
}
