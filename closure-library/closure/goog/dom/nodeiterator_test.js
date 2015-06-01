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

goog.provide('goog.dom.NodeIteratorTest');
goog.setTestOnly('goog.dom.NodeIteratorTest');

goog.require('goog.dom');
goog.require('goog.dom.NodeIterator');
goog.require('goog.testing.dom');
goog.require('goog.testing.jsunit');

function testBasic() {
  goog.testing.dom.assertNodesMatch(
      new goog.dom.NodeIterator(goog.dom.getElement('test')),
      ['#test', '#a1', 'T', '#b1', 'e', 'xt', '#span1', '#p1', 'Text']);
}

function testUnclosed() {
  goog.testing.dom.assertNodesMatch(
      new goog.dom.NodeIterator(goog.dom.getElement('test2')),
      ['#test2', '#li1', 'Not', '#li2', 'Closed']);
}

function testReverse() {
  goog.testing.dom.assertNodesMatch(
      new goog.dom.NodeIterator(goog.dom.getElement('test'), true),
      ['Text', '#p1', '#span1', 'xt', 'e', '#b1', 'T', '#a1', '#test']);
}
