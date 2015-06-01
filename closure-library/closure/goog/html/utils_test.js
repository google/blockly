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
 * @fileoverview Unit tests for goog.html.util.
 */

goog.provide('goog.html.UtilsTest');

goog.require('goog.array');
goog.require('goog.dom.TagName');
goog.require('goog.html.utils');
goog.require('goog.object');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.html.UtilsTest');


var FAILURE_MESSAGE = 'Failed to strip all HTML.';
var STRIP = 'Hello world!';
var result;


function tearDown() {
  result = null;
}


function testStripAllHtmlTagsSingle() {
  goog.object.forEach(goog.dom.TagName, function(tag) {
    result = goog.html.utils.stripHtmlTags(makeHtml_(tag, STRIP));
    assertEquals(FAILURE_MESSAGE, STRIP, result);
  });
}


function testStripAllHtmlTagsAttribute() {
  goog.object.forEach(goog.dom.TagName, function(tag) {
    result = goog.html.utils.stripHtmlTags(makeHtml_(tag, STRIP, 1, 0, 'a'));
    assertEquals(FAILURE_MESSAGE, STRIP, result);
  });
}


function testStripAllHtmlTagsDouble() {
  var tag1 = goog.dom.TagName.B;
  var tag2 = goog.dom.TagName.DIV;
  result = goog.html.utils.stripHtmlTags(makeHtml_(tag1, STRIP, 2));
  assertEquals(FAILURE_MESSAGE, STRIP + STRIP, result);
  result = goog.html.utils.stripHtmlTags(makeHtml_(tag2, STRIP, 2));
  assertEquals(FAILURE_MESSAGE, STRIP + ' ' + STRIP, result);
}


function testComplex() {
  var html = '<h1 id=\"life\">Life at Google</h1>' +
      '<p>Read and interact with the information below to learn about ' +
      'life at <u>Google</u>.</p>' +
      '<h2 id=\"food\">Food at Google</h2>' +
      '<p>Google has <em>the best food in the world</em>.</p>' +
      '<h2 id=\"transportation\">Transportation at Google</h2>' +
      '<p>Google provides <i>free transportation</i>.</p>' +
      // Some text with symbols to make sure that it does not get stripped
      '<3i><x>\n-10<x<10 3cat < 3dog &amp;&lt;&gt;&quot;';
  result = goog.html.utils.stripHtmlTags(html);
  var expected = 'Life at Google ' +
      'Read and interact with the information below to learn about ' +
      'life at Google. ' +
      'Food at Google ' +
      'Google has the best food in the world. ' +
      'Transportation at Google ' +
      'Google provides free transportation. ' +
      '-10<x<10 3cat < 3dog &<>\"';
  assertEquals(FAILURE_MESSAGE, expected, result);
}


function testInteresting() {
  result = goog.html.utils.stripHtmlTags(
      '<img/src="bogus"onerror=alert(13) style="display:none">');
  assertEquals(FAILURE_MESSAGE, '', result);
  result = goog.html.utils.stripHtmlTags(
      '<img o\'reilly blob src=bogus onerror=alert(1337)>');
  assertEquals(FAILURE_MESSAGE, '', result);
}


/**
 * Constructs the HTML of an element from the given tag and content.
 * @param {goog.dom.TagName} tag The HTML tagName for the element.
 * @param {string} content The content.
 * @param {number=} opt_copies Optional number of copies to make.
 * @param {number=} opt_tabIndex Optional tabIndex to give the element.
 * @param {string=} opt_id Optional id to give the element.
 * @return {string} The HTML of an element from the given tag and content.
 */
function makeHtml_(tag, content, opt_copies, opt_tabIndex, opt_id) {
  var html = ['<' + tag, '>' + content + '</' + tag + '>'];
  if (goog.isNumber(opt_tabIndex)) {
    goog.array.insertAt(html, ' tabIndex=\"' + opt_tabIndex + '\"', 1);
  }
  if (goog.isString(opt_id)) {
    goog.array.insertAt(html, ' id=\"' + opt_id + '\"', 1);
  }
  html = html.join('');
  var array = [];
  for (var i = 0, length = opt_copies || 1; i < length; i++) {
    array[i] = html;
  }
  return array.join('');
}
