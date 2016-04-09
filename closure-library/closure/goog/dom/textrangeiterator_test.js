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

goog.provide('goog.dom.TextRangeIteratorTest');
goog.setTestOnly('goog.dom.TextRangeIteratorTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.TextRangeIterator');
goog.require('goog.iter.StopIteration');
goog.require('goog.testing.dom');
goog.require('goog.testing.jsunit');

var test;
var test2;

function setUpPage() {
  test = goog.dom.getElement('test');
  test2 = goog.dom.getElement('test2');
}

function testBasic() {
  goog.testing.dom.assertNodesMatch(
      new goog.dom.TextRangeIterator(test, 0, test, 2),
      ['#a1', 'T', '#b1', 'e', '#b1', 'xt', '#a1', '#span1', '#span1', '#p1']);
}

function testAdjustStart() {
  var iterator = new goog.dom.TextRangeIterator(test, 0, test, 2);
  iterator.setStartNode(goog.dom.getElement('span1'));

  goog.testing.dom.assertNodesMatch(iterator, ['#span1', '#span1', '#p1']);
}

function testAdjustEnd() {
  var iterator = new goog.dom.TextRangeIterator(test, 0, test, 2);
  iterator.setEndNode(goog.dom.getElement('span1'));

  goog.testing.dom.assertNodesMatch(
      iterator, ['#a1', 'T', '#b1', 'e', '#b1', 'xt', '#a1', '#span1']);
}

function testOffsets() {
  var iterator =
      new goog.dom.TextRangeIterator(test2.firstChild, 1, test2.lastChild, 2);

  // foo
  var node = iterator.next();
  assertEquals(
      'Should have start offset at iteration step 1', 1,
      iterator.getStartTextOffset());
  assertEquals(
      'Should not have end offset at iteration step 1', node.nodeValue.length,
      iterator.getEndTextOffset());

  // <br>
  node = iterator.next();
  assertEquals(
      'Should not have start offset at iteration step 2', -1,
      iterator.getStartTextOffset());
  assertEquals(
      'Should not have end offset at iteration step 2', -1,
      iterator.getEndTextOffset());

  // </br>
  node = iterator.next();
  assertEquals(
      'Should not have start offset at iteration step 3', -1,
      iterator.getStartTextOffset());
  assertEquals(
      'Should not have end offset at iteration step 3', -1,
      iterator.getEndTextOffset());

  // bar
  node = iterator.next();
  assertEquals(
      'Should not have start offset at iteration step 4', 0,
      iterator.getStartTextOffset());
  assertEquals(
      'Should have end offset at iteration step 4', 2,
      iterator.getEndTextOffset());
}

function testSingleNodeOffsets() {
  var iterator =
      new goog.dom.TextRangeIterator(test2.firstChild, 1, test2.firstChild, 2);

  iterator.next();
  assertEquals('Should have start offset', 1, iterator.getStartTextOffset());
  assertEquals('Should have end offset', 2, iterator.getEndTextOffset());
}

function testEndNodeOffsetAtEnd() {
  var iterator = new goog.dom.TextRangeIterator(
      goog.dom.getElement('b1').firstChild, 0, goog.dom.getElement('b1'), 1);
  goog.testing.dom.assertNodesMatch(iterator, ['e', '#b1']);
}

function testSkipTagDoesNotSkipEnd() {
  // Iterate over 'Tex'.
  var iterator = new goog.dom.TextRangeIterator(
      test.firstChild.firstChild, 0, test.firstChild.lastChild, 1);

  var node = iterator.next();
  assertEquals('T', node.nodeValue);

  node = iterator.next();
  assertEquals(goog.dom.TagName.B, node.tagName);

  iterator.skipTag();

  node = iterator.next();
  assertEquals('xt', node.nodeValue);
}

function testSkipTagSkipsEnd() {
  // Iterate over 'Te'.
  var iterator = new goog.dom.TextRangeIterator(
      test.firstChild.firstChild, 0,
      test.getElementsByTagName(goog.dom.TagName.B)[0].firstChild, 1);

  var node = iterator.next();
  assertEquals('T', node.nodeValue);

  node = iterator.next();
  assertEquals(goog.dom.TagName.B, node.tagName);

  var ex = assertThrows('Should stop iteration when skipping B', function() {
    iterator.skipTag();
  });
  assertEquals(goog.iter.StopIteration, ex);
}
