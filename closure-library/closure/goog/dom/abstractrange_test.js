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

goog.provide('goog.dom.AbstractRangeTest');
goog.setTestOnly('goog.dom.AbstractRangeTest');

goog.require('goog.dom');
goog.require('goog.dom.AbstractRange');
goog.require('goog.dom.Range');
goog.require('goog.dom.TagName');
goog.require('goog.testing.jsunit');

function testCorrectDocument() {
  var a = goog.dom.getElement('a').contentWindow;
  var b = goog.dom.getElement('b').contentWindow;

  a.document.body.focus();
  var selection = goog.dom.AbstractRange.getBrowserSelectionForWindow(a);
  assertNotNull('Selection must not be null', selection);
  var range = goog.dom.Range.createFromBrowserSelection(selection);
  assertEquals('getBrowserSelectionForWindow must return selection in the ' +
      'correct document', a.document, range.getDocument());

  // This is intended to trip up Internet Explorer --
  // see http://b/2048934
  b.document.body.focus();
  selection = goog.dom.AbstractRange.getBrowserSelectionForWindow(a);
  // Some (non-IE) browsers keep a separate selection state for each document
  // in the same browser window. That's fine, as long as the selection object
  // requested from the window object is correctly associated with that
  // window's document.
  if (selection != null && selection.rangeCount != 0) {
    range = goog.dom.Range.createFromBrowserSelection(selection);
    assertEquals('getBrowserSelectionForWindow must return selection in ' +
        'the correct document', a.document, range.getDocument());
  } else {
    assertTrue(selection == null || selection.rangeCount == 0);
  }
}

function testSelectionIsControlRange() {
  var c = goog.dom.getElement('c').contentWindow;
  // Only IE supports control ranges
  if (c.document.body.createControlRange) {
    var controlRange = c.document.body.createControlRange();
    controlRange.add(c.document.getElementsByTagName(goog.dom.TagName.IMG)[0]);
    controlRange.select();
    var selection = goog.dom.AbstractRange.getBrowserSelectionForWindow(c);
    assertNotNull('Selection must not be null', selection);
  }
}
