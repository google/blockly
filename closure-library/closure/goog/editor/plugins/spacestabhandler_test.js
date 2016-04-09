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

goog.provide('goog.editor.plugins.SpacesTabHandlerTest');
goog.setTestOnly('goog.editor.plugins.SpacesTabHandlerTest');

goog.require('goog.dom');
goog.require('goog.dom.Range');
goog.require('goog.editor.plugins.SpacesTabHandler');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.KeyCodes');
goog.require('goog.functions');
goog.require('goog.testing.StrictMock');
goog.require('goog.testing.editor.FieldMock');
goog.require('goog.testing.editor.TestHelper');
goog.require('goog.testing.jsunit');

var field;
var editableField;
var tabHandler;
var testHelper;

function setUp() {
  field = goog.dom.getElement('field');
  editableField = new goog.testing.editor.FieldMock();
  // Modal mode behavior tested in AbstractTabHandler.
  editableField.inModalMode = goog.functions.FALSE;
  testHelper = new goog.testing.editor.TestHelper(field);
  testHelper.setUpEditableElement();

  tabHandler = new goog.editor.plugins.SpacesTabHandler();
  tabHandler.registerFieldObject(editableField);
}

function tearDown() {
  editableField = null;
  testHelper.tearDownEditableElement();
  tabHandler.dispose();
}

function testSelectedTextIndent() {
  goog.dom.setTextContent(field, 'Test');

  var testText = field.firstChild;
  testHelper.select(testText, 0, testText, 4);

  var event = new goog.testing.StrictMock(goog.events.BrowserEvent);
  event.keyCode = goog.events.KeyCodes.TAB;
  event.shiftKey = false;

  editableField.stopChangeEvents(true, true);
  editableField.dispatchChange();
  editableField.dispatchSelectionChangeEvent();
  event.preventDefault();

  editableField.$replay();
  event.$replay();

  assertTrue(
      'Event marked as handled',
      tabHandler.handleKeyboardShortcut(event, '', false));
  var contents = field.textContent || field.innerText;
  // Chrome doesn't treat \u00a0 as a space.
  assertTrue(
      'Text should be replaced with 4 spaces but was: "' + contents + '"',
      /^(\s|\u00a0){4}$/.test(contents));

  editableField.$verify();
  event.$verify();
}

function testCursorIndent() {
  goog.dom.setTextContent(field, 'Test');

  var testText = field.firstChild;
  testHelper.select(testText, 2, testText, 2);

  var event = new goog.testing.StrictMock(goog.events.BrowserEvent);
  event.keyCode = goog.events.KeyCodes.TAB;
  event.shiftKey = false;

  editableField.stopChangeEvents(true, true);
  editableField.dispatchChange();
  editableField.dispatchSelectionChangeEvent();
  event.preventDefault();

  editableField.$replay();
  event.$replay();

  assertTrue(
      'Event marked as handled',
      tabHandler.handleKeyboardShortcut(event, '', false));
  var contents = field.textContent || field.innerText;
  assertTrue(
      'Expected contents "Te    st" but was: "' + contents + '"',
      /Te[\s|\u00a0]{4}st/.test(contents));

  editableField.$verify();
  event.$verify();
}

function testShiftTabNoOp() {
  goog.dom.setTextContent(field, 'Test');

  range = goog.dom.Range.createFromNodeContents(field);
  range.collapse();
  range.select();

  var event = new goog.testing.StrictMock(goog.events.BrowserEvent);
  event.keyCode = goog.events.KeyCodes.TAB;
  event.shiftKey = true;

  event.preventDefault();
  editableField.$replay();
  event.$replay();

  assertTrue(
      'Event marked as handled',
      tabHandler.handleKeyboardShortcut(event, '', false));
  var contents = field.textContent || field.innerText;
  assertEquals('Shift+tab should not change contents', 'Test', contents);

  editableField.$verify();
  event.$verify();
}

function testInListNoOp() {
  field.innerHTML = '<ul><li>Test</li></ul>';

  var testText = field.firstChild.firstChild.firstChild;  // div ul li Test
  testHelper.select(testText, 2, testText, 2);

  var event = new goog.testing.StrictMock(goog.events.BrowserEvent);
  event.keyCode = goog.events.KeyCodes.TAB;
  event.shiftKey = false;

  editableField.$replay();
  event.$replay();

  assertFalse(
      'Event must not be handled when selection inside list.',
      tabHandler.handleKeyboardShortcut(event, '', false));
  testHelper.assertHtmlMatches('<ul><li>Test</li></ul>');

  editableField.$verify();
  event.$verify();
}

function testContainsListNoOp() {
  field.innerHTML = '<ul><li>Test</li></ul>';

  var testText = field.firstChild.firstChild.firstChild;  // div ul li Test
  testHelper.select(field.firstChild, 0, testText, 2);

  var event = new goog.testing.StrictMock(goog.events.BrowserEvent);
  event.keyCode = goog.events.KeyCodes.TAB;
  event.shiftKey = false;

  editableField.$replay();
  event.$replay();

  assertFalse(
      'Event must not be handled when selection inside list.',
      tabHandler.handleKeyboardShortcut(event, '', false));
  testHelper.assertHtmlMatches('<ul><li>Test</li></ul>');

  editableField.$verify();
  event.$verify();
}
