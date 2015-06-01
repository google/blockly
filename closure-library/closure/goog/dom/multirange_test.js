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

goog.provide('goog.dom.MultiRangeTest');
goog.setTestOnly('goog.dom.MultiRangeTest');

goog.require('goog.dom');
goog.require('goog.dom.MultiRange');
goog.require('goog.dom.Range');
goog.require('goog.iter');
goog.require('goog.testing.jsunit');

var range;
function setUp() {
  range = new goog.dom.MultiRange.createFromTextRanges([
    goog.dom.Range.createFromNodeContents(goog.dom.getElement('test2')),
    goog.dom.Range.createFromNodeContents(goog.dom.getElement('test1'))
  ]);
}

function testStartAndEnd() {
  assertEquals(goog.dom.getElement('test1').firstChild, range.getStartNode());
  assertEquals(0, range.getStartOffset());
  assertEquals(goog.dom.getElement('test2').firstChild, range.getEndNode());
  assertEquals(6, range.getEndOffset());
}

function testStartAndEndIterator() {
  var it = goog.iter.toIterator(range);
  assertEquals(goog.dom.getElement('test1').firstChild, it.getStartNode());
  assertEquals(0, it.getStartTextOffset());
  assertEquals(goog.dom.getElement('test2').firstChild, it.getEndNode());
  assertEquals(3, it.getEndTextOffset());

  it.next();
  it.next();
  assertEquals(6, it.getEndTextOffset());
}

function testIteration() {
  var tags = goog.iter.toArray(range);
  assertEquals(2, tags.length);

  assertEquals(goog.dom.getElement('test1').firstChild, tags[0]);
  assertEquals(goog.dom.getElement('test2').firstChild, tags[1]);
}
