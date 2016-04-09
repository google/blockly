// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.dom.annotateTest');
goog.setTestOnly('goog.dom.annotateTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.annotate');
goog.require('goog.html.SafeHtml');
goog.require('goog.testing.jsunit');

var $ = goog.dom.getElement;

var TEXT = 'This little piggy cried "Wee! Wee! Wee!" all the way home.';

function doAnnotation(termIndex, termHtml) {
  return goog.html.SafeHtml.create(
      'span', {'class': 'c' + termIndex}, termHtml);
}

// goog.dom.annotate.annotateText tests

function testAnnotateText() {
  var terms = [['pig', true]];
  var html = goog.dom.annotate.annotateText(TEXT, terms, doAnnotation);
  assertEquals(null, html);

  terms = [['pig', false]];
  html = goog.dom.annotate.annotateText(TEXT, terms, doAnnotation);
  html = goog.html.SafeHtml.unwrap(html);
  assertEquals(
      'This little <span class="c0">pig</span>gy cried ' +
          '&quot;Wee! Wee! Wee!&quot; all the way home.',
      html);

  terms = [[' piggy ', true]];
  html = goog.dom.annotate.annotateText(TEXT, terms, doAnnotation);
  assertEquals(null, html);

  terms = [[' piggy ', false]];
  html = goog.dom.annotate.annotateText(TEXT, terms, doAnnotation);
  html = goog.html.SafeHtml.unwrap(html);
  assertEquals(
      'This little<span class="c0"> piggy </span>cried ' +
          '&quot;Wee! Wee! Wee!&quot; all the way home.',
      html);

  terms = [['goose', true], ['piggy', true]];
  html = goog.dom.annotate.annotateText(TEXT, terms, doAnnotation);
  html = goog.html.SafeHtml.unwrap(html);
  assertEquals(
      'This little <span class="c1">piggy</span> cried ' +
          '&quot;Wee! Wee! Wee!&quot; all the way home.',
      html);
}

function testAnnotateTextHtmlEscaping() {
  var terms = [['a', false]];
  var html = goog.dom.annotate.annotateText('&a', terms, doAnnotation);
  html = goog.html.SafeHtml.unwrap(html);
  assertEquals('&amp;<span class="c0">a</span>', html);

  terms = [['a', false]];
  html = goog.dom.annotate.annotateText('a&', terms, doAnnotation);
  html = goog.html.SafeHtml.unwrap(html);
  assertEquals('<span class="c0">a</span>&amp;', html);

  terms = [['&', false]];
  html = goog.dom.annotate.annotateText('&', terms, doAnnotation);
  html = goog.html.SafeHtml.unwrap(html);
  assertEquals('<span class="c0">&amp;</span>', html);
}

function testAnnotateTextIgnoreCase() {
  var terms = [['wEe', true]];
  var html = goog.dom.annotate.annotateText(TEXT, terms, doAnnotation, true);
  html = goog.html.SafeHtml.unwrap(html);
  assertEquals(
      'This little piggy cried &quot;<span class="c0">Wee</span>! ' +
          '<span class="c0">Wee</span>! <span class="c0">Wee</span>!' +
          '&quot; all the way home.',
      html);

  terms = [['WEE!', true], ['HE', false]];
  html = goog.dom.annotate.annotateText(TEXT, terms, doAnnotation, true);
  html = goog.html.SafeHtml.unwrap(html);
  assertEquals(
      'This little piggy cried &quot;<span class="c0">Wee!</span> ' +
          '<span class="c0">Wee!</span> <span class="c0">Wee!</span>' +
          '&quot; all t<span class="c1">he</span> way home.',
      html);
}

function testAnnotateTextOverlappingTerms() {
  var terms = [['tt', false], ['little', false]];
  var html = goog.dom.annotate.annotateText(TEXT, terms, doAnnotation);
  html = goog.html.SafeHtml.unwrap(html);
  assertEquals(
      'This <span class="c1">little</span> piggy cried &quot;Wee! ' +
          'Wee! Wee!&quot; all the way home.',
      html);
}

// goog.dom.annotate.annotateTerms tests

function testAnnotateTerms() {
  var terms = [['pig', true]];
  assertFalse(goog.dom.annotate.annotateTerms($('p'), terms, doAnnotation));
  assertEquals('Tom &amp; Jerry', $('p').innerHTML);

  terms = [['Tom', true]];
  assertTrue(goog.dom.annotate.annotateTerms($('p'), terms, doAnnotation));
  var spans = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.SPAN, 'c0', $('p'));
  assertEquals(1, spans.length);
  assertEquals('Tom', spans[0].innerHTML);
  assertEquals(' & Jerry', spans[0].nextSibling.nodeValue);
}

function testAnnotateTermsInTable() {
  var terms = [['pig', false]];
  assertTrue(goog.dom.annotate.annotateTerms($('q'), terms, doAnnotation));
  var spans = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.SPAN, 'c0', $('q'));
  assertEquals(2, spans.length);
  assertEquals('pig', spans[0].innerHTML);
  assertEquals('gy', spans[0].nextSibling.nodeValue);
  assertEquals('pig', spans[1].innerHTML);
  assertEquals(goog.dom.TagName.I, spans[1].parentNode.tagName);
}

function testAnnotateTermsWithClassExclusions() {
  var terms = [['pig', false]];
  var classesToIgnore = ['s'];
  assertTrue(
      goog.dom.annotate.annotateTerms(
          $('r'), terms, doAnnotation, false, classesToIgnore));
  var spans = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.SPAN, 'c0', $('r'));
  assertEquals(1, spans.length);
  assertEquals('pig', spans[0].innerHTML);
  assertEquals('gy', spans[0].nextSibling.nodeValue);
}

function testAnnotateTermsIgnoreCase() {
  var terms1 = [['pig', false]];
  assertTrue(
      goog.dom.annotate.annotateTerms($('t'), terms1, doAnnotation, true));
  var spans = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.SPAN, 'c0', $('t'));
  assertEquals(2, spans.length);
  assertEquals('pig', spans[0].innerHTML);
  assertEquals('gy', spans[0].nextSibling.nodeValue);
  assertEquals('Pig', spans[1].innerHTML);

  var terms2 = [['Pig', false]];
  assertTrue(
      goog.dom.annotate.annotateTerms($('u'), terms2, doAnnotation, true));
  var spans = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.SPAN, 'c0', $('u'));
  assertEquals(2, spans.length);
  assertEquals('pig', spans[0].innerHTML);
  assertEquals('gy', spans[0].nextSibling.nodeValue);
  assertEquals('Pig', spans[1].innerHTML);
}

function testAnnotateTermsInObject() {
  var terms = [['object', true]];
  assertTrue(goog.dom.annotate.annotateTerms($('o'), terms, doAnnotation));
  var spans = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.SPAN, 'c0', $('o'));
  assertEquals(1, spans.length);
  assertEquals('object', spans[0].innerHTML);
}

function testAnnotateTermsInScript() {
  var terms = [['variable', true]];
  assertFalse(
      goog.dom.annotate.annotateTerms($('script'), terms, doAnnotation));
}

function testAnnotateTermsInStyle() {
  var terms = [['color', true]];
  assertFalse(goog.dom.annotate.annotateTerms($('style'), terms, doAnnotation));
}

function testAnnotateTermsInHtmlComment() {
  var terms = [['note', true]];
  assertFalse(
      goog.dom.annotate.annotateTerms($('comment'), terms, doAnnotation));
}
