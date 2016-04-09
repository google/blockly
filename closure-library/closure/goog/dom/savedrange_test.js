// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.dom.SavedRangeTest');
goog.setTestOnly('goog.dom.SavedRangeTest');

goog.require('goog.dom');
goog.require('goog.dom.Range');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

function testSaved() {
  var node = goog.dom.getElement('test1');
  var range = goog.dom.Range.createFromNodeContents(node);
  var savedRange = range.saveUsingDom();

  range = savedRange.restore(true);
  assertEquals('Restored range should select "Text"', 'Text', range.getText());
  assertFalse('Restored range should not be reversed.', range.isReversed());
  assertFalse(
      'Range should not have disposed itself.', savedRange.isDisposed());

  goog.dom.Range.clearSelection();
  assertFalse(goog.dom.Range.hasSelection(window));

  range = savedRange.restore();
  assertTrue('Range should have auto-disposed.', savedRange.isDisposed());
  assertEquals('Restored range should select "Text"', 'Text', range.getText());
  assertFalse('Restored range should not be reversed.', range.isReversed());
}

function testReversedSave() {
  var node = goog.dom.getElement('test1').firstChild;
  var range = goog.dom.Range.createFromNodes(node, 4, node, 0);
  var savedRange = range.saveUsingDom();

  range = savedRange.restore();
  assertEquals('Restored range should select "Text"', 'Text', range.getText());
  if (!goog.userAgent.IE) {
    assertTrue('Restored range should be reversed.', range.isReversed());
  }
}
