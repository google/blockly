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

goog.provide('goog.dom.iterTest');
goog.setTestOnly('goog.dom.iterTest');

goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.iter.AncestorIterator');
goog.require('goog.dom.iter.ChildIterator');
goog.require('goog.dom.iter.SiblingIterator');
goog.require('goog.testing.dom');
goog.require('goog.testing.jsunit');

var test;
var br;

function setUpPage() {
  test = goog.dom.getElement('test');
  br = goog.dom.getElement('br');
}

function testNextSibling() {
  goog.testing.dom.assertNodesMatch(
      new goog.dom.iter.SiblingIterator(test.firstChild), ['#br', 'def']);
}

function testNextSiblingInclusive() {
  goog.testing.dom.assertNodesMatch(
      new goog.dom.iter.SiblingIterator(test.firstChild, true),
      ['abc', '#br', 'def']);
}

function testPreviousSibling() {
  goog.testing.dom.assertNodesMatch(
      new goog.dom.iter.SiblingIterator(test.lastChild, false, true),
      ['#br', 'abc']);
}

function testPreviousSiblingInclusive() {
  goog.testing.dom.assertNodesMatch(
      new goog.dom.iter.SiblingIterator(test.lastChild, true, true),
      ['def', '#br', 'abc']);
}

function testChildIterator() {
  goog.testing.dom.assertNodesMatch(
      new goog.dom.iter.ChildIterator(test), ['abc', '#br', 'def']);
}

function testChildIteratorIndex() {
  goog.testing.dom.assertNodesMatch(
      new goog.dom.iter.ChildIterator(test, false, 1), ['#br', 'def']);
}

function testChildIteratorReverse() {
  goog.testing.dom.assertNodesMatch(
      new goog.dom.iter.ChildIterator(test, true), ['def', '#br', 'abc']);
}

function testEmptyChildIteratorReverse() {
  goog.testing.dom.assertNodesMatch(
      new goog.dom.iter.ChildIterator(br, true), []);
}

function testChildIteratorIndexReverse() {
  goog.testing.dom.assertNodesMatch(
      new goog.dom.iter.ChildIterator(test, true, 1), ['#br', 'abc']);
}

function testAncestorIterator() {
  goog.testing.dom.assertNodesMatch(
      new goog.dom.iter.AncestorIterator(br),
      ['#test', '#body', '#html', goog.dom.NodeType.DOCUMENT]);
}

function testAncestorIteratorInclusive() {
  goog.testing.dom.assertNodesMatch(
      new goog.dom.iter.AncestorIterator(br, true),
      ['#br', '#test', '#body', '#html', goog.dom.NodeType.DOCUMENT]);
}
