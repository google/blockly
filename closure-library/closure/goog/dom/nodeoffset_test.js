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

goog.provide('goog.dom.NodeOffsetTest');
goog.setTestOnly('goog.dom.NodeOffsetTest');

goog.require('goog.dom');
goog.require('goog.dom.NodeOffset');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.testing.jsunit');

var test1;
var test2;
var i;
var empty;

function setUpPage() {
  test1 = goog.dom.getElement('test1');
  i = goog.dom.getElement('i');
  test2 = goog.dom.getElement('test2');
  test2.innerHTML = test1.innerHTML;
  empty = goog.dom.getElement('empty');
}

function testElementOffset() {
  var nodeOffset = new goog.dom.NodeOffset(i, test1);

  var recovered = nodeOffset.findTargetNode(test2);
  assertNotNull('Should recover a node.', recovered);
  assertEquals(
      'Should recover an I node.', goog.dom.TagName.I, recovered.tagName);
  assertTrue(
      'Should recover a child of test2', goog.dom.contains(test2, recovered));
  assertFalse(
      'Should not recover a child of test1',
      goog.dom.contains(test1, recovered));

  nodeOffset.dispose();
}

function testNodeOffset() {
  var nodeOffset = new goog.dom.NodeOffset(i.firstChild, test1);

  var recovered = nodeOffset.findTargetNode(test2);
  assertNotNull('Should recover a node.', recovered);
  assertEquals(
      'Should recover a text node.', goog.dom.NodeType.TEXT,
      recovered.nodeType);
  assertEquals('Should  have correct contents.', 'text.', recovered.nodeValue);
  assertTrue(
      'Should recover a child of test2', goog.dom.contains(test2, recovered));
  assertFalse(
      'Should not recover a child of test1',
      goog.dom.contains(test1, recovered));

  nodeOffset.dispose();
}

function testToString() {
  var nodeOffset = new goog.dom.NodeOffset(i.firstChild, test1);

  assertEquals(
      'Should have correct string representation', '3,B\n1,I\n0,#text',
      nodeOffset.toString());

  nodeOffset.dispose();
}

function testBadRecovery() {
  var nodeOffset = new goog.dom.NodeOffset(i.firstChild, test1);

  var recovered = nodeOffset.findTargetNode(empty);
  assertNull('Should recover nothing.', recovered);

  nodeOffset.dispose();
}
