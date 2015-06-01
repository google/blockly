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

goog.provide('goog.dom.SavedCaretRangeTest');
goog.setTestOnly('goog.dom.SavedCaretRangeTest');

goog.require('goog.dom');
goog.require('goog.dom.Range');
goog.require('goog.dom.SavedCaretRange');
goog.require('goog.testing.dom');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

function setUp() {
  document.body.normalize();
}


/** @bug 1480638 */
function testSavedCaretRangeDoesntChangeSelection() {
  // NOTE(nicksantos): We cannot detect this bug programatically. The only
  // way to detect it is to run this test manually and look at the selection
  // when it ends.
  var div = goog.dom.getElement('bug1480638');
  var range = goog.dom.Range.createFromNodes(
      div.firstChild, 0, div.lastChild, 1);
  range.select();

  // Observe visible selection.  Then move to next line and see it change.
  // If the bug exists, it starts with "foo" selected and ends with
  // it not selected.
  //debugger;
  var saved = range.saveUsingCarets();
}

function testSavedCaretRange() {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(8)) {
    // testSavedCaretRange fails in IE7 unless the source files are loaded in a
    // certain order. Adding goog.require('goog.dom.classes') to dom.js or
    // goog.require('goog.array') to savedcaretrange_test.js after the
    // goog.require('goog.dom') line fixes the test, but it's better to not
    // rely on such hacks without understanding the reason of the failure.
    return;
  }

  var parent = goog.dom.getElement('caretRangeTest');
  var def = goog.dom.getElement('def');
  var jkl = goog.dom.getElement('jkl');

  var range = goog.dom.Range.createFromNodes(
      def.firstChild, 1, jkl.firstChild, 2);
  assertFalse(range.isReversed());
  range.select();

  var saved = range.saveUsingCarets();
  assertHTMLEquals(
      'd<span id="' + saved.startCaretId_ + '"></span>ef', def.innerHTML);
  assertHTMLEquals(
      'jk<span id="' + saved.endCaretId_ + '"></span>l', jkl.innerHTML);

  goog.testing.dom.assertRangeEquals(
      def.childNodes[1], 0, jkl.childNodes[1], 0,
      saved.toAbstractRange());

  def = goog.dom.getElement('def');
  jkl = goog.dom.getElement('jkl');

  var restoredRange = clearSelectionAndRestoreSaved(parent, saved);
  assertFalse(restoredRange.isReversed());
  goog.testing.dom.assertRangeEquals(def, 1, jkl, 1, restoredRange);

  var selection = goog.dom.Range.createFromWindow(window);
  assertHTMLEquals('def', def.innerHTML);
  assertHTMLEquals('jkl', jkl.innerHTML);

  // def and jkl now contain fragmented text nodes.
  if (goog.userAgent.WEBKIT ||
      (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9'))) {
    goog.testing.dom.assertRangeEquals(
        def.childNodes[1], 0, jkl.childNodes[0], 2, selection);
  } else if (goog.userAgent.OPERA) {
    goog.testing.dom.assertRangeEquals(
        def.childNodes[1], 0, jkl.childNodes[1], 0, selection);
  } else {
    goog.testing.dom.assertRangeEquals(
        def, 1, jkl, 1, selection);
  }
}

function testReversedSavedCaretRange() {
  var parent = goog.dom.getElement('caretRangeTest');
  var def = goog.dom.getElement('def-5');
  var jkl = goog.dom.getElement('jkl-5');

  var range = goog.dom.Range.createFromNodes(
      jkl.firstChild, 1, def.firstChild, 2);
  assertTrue(range.isReversed());
  range.select();

  var saved = range.saveUsingCarets();
  var restoredRange = clearSelectionAndRestoreSaved(parent, saved);
  assertTrue(restoredRange.isReversed());
  goog.testing.dom.assertRangeEquals(def, 1, jkl, 1, restoredRange);
}

/*
   TODO(user): Look into why removeCarets test doesn't pass.
   function testRemoveCarets() {
   var def = goog.dom.getElement('def');
   var jkl = goog.dom.getElement('jkl');

   var range = goog.dom.Range.createFromNodes(
   def.firstChild, 1, jkl.firstChild, 2);
   range.select();

   var saved = range.saveUsingCarets();
   assertHTMLEquals(
   "d<span id="" + saved.startCaretId_ + ""></span>ef", def.innerHTML);
   assertHTMLEquals(
   "jk<span id="" + saved.endCaretId_ + ""></span>l", jkl.innerHTML);

   saved.removeCarets();
   assertHTMLEquals("def", def.innerHTML);
   assertHTMLEquals("jkl", jkl.innerHTML);

   var selection = goog.dom.Range.createFromWindow(window);

   assertEquals('Wrong start node', def.firstChild, selection.getStartNode());
   assertEquals('Wrong end node', jkl.firstChild, selection.getEndNode());
   assertEquals('Wrong start offset', 1, selection.getStartOffset());
   assertEquals('Wrong end offset', 2, selection.getEndOffset());
   }
   */

function testRemoveContents()  {
  var def = goog.dom.getElement('def-4');
  var jkl = goog.dom.getElement('jkl-4');

  // Sanity check.
  var container = goog.dom.getElement('removeContentsTest');
  assertEquals(7, container.childNodes.length);
  assertEquals('def', def.innerHTML);
  assertEquals('jkl', jkl.innerHTML);

  var range = goog.dom.Range.createFromNodes(
      def.firstChild, 1, jkl.firstChild, 2);
  range.select();

  var saved = range.saveUsingCarets();
  var restored = saved.restore();
  restored.removeContents();

  assertEquals(6, container.childNodes.length);
  assertEquals('d', def.innerHTML);
  assertEquals('l', jkl.innerHTML);
}

function testHtmlEqual() {
  var parent = goog.dom.getElement('caretRangeTest-2');
  var def = goog.dom.getElement('def-2');
  var jkl = goog.dom.getElement('jkl-2');

  var range = goog.dom.Range.createFromNodes(
      def.firstChild, 1, jkl.firstChild, 2);
  range.select();
  var saved = range.saveUsingCarets();
  var html1 = parent.innerHTML;
  saved.removeCarets();

  var saved2 = range.saveUsingCarets();
  var html2 = parent.innerHTML;
  saved2.removeCarets();

  assertNotEquals('Same selection with different saved caret range carets ' +
      'must have different html.', html1, html2);

  assertTrue('Same selection with different saved caret range carets must ' +
      'be considered equal by htmlEqual',
      goog.dom.SavedCaretRange.htmlEqual(html1, html2));

  saved.dispose();
  saved2.dispose();
}

function testStartCaretIsAtEndOfParent() {
  var parent = goog.dom.getElement('caretRangeTest-3');
  var def = goog.dom.getElement('def-3');
  var jkl = goog.dom.getElement('jkl-3');

  var range = goog.dom.Range.createFromNodes(
      def, 1, jkl, 1);
  range.select();
  var saved = range.saveUsingCarets();
  clearSelectionAndRestoreSaved(parent, saved);
  range = goog.dom.Range.createFromWindow();
  assertEquals('ghijkl', range.getText().replace(/\s/g, ''));
}


/**
 * Clear the selection by re-parsing the DOM. Then restore the saved
 * selection.
 * @param {Node} parent The node containing the current selection.
 * @param {goog.dom.SavedRange} saved The saved range.
 * @return {goog.dom.AbstractRange} Restored range.
 */
function clearSelectionAndRestoreSaved(parent, saved) {
  goog.dom.Range.clearSelection();
  assertFalse(goog.dom.Range.hasSelection(window));
  var range = saved.restore();
  assertTrue(goog.dom.Range.hasSelection(window));
  return range;
}
