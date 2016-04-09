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

goog.provide('goog.editor.plugins.ListTabHandlerTest');
goog.setTestOnly('goog.editor.plugins.ListTabHandlerTest');

goog.require('goog.dom');
goog.require('goog.editor.Command');
goog.require('goog.editor.plugins.ListTabHandler');
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

function setUpPage() {
  field = goog.dom.getElement('field');
}

function setUp() {
  editableField = new goog.testing.editor.FieldMock();
  // Modal mode behavior tested as part of AbstractTabHandler tests.
  editableField.inModalMode = goog.functions.FALSE;

  tabHandler = new goog.editor.plugins.ListTabHandler();
  tabHandler.registerFieldObject(editableField);

  testHelper = new goog.testing.editor.TestHelper(field);
  testHelper.setUpEditableElement();
}

function tearDown() {
  editableField = null;
  testHelper.tearDownEditableElement();
  tabHandler.dispose();
}

function testListIndentInLi() {
  field.innerHTML = '<ul><li>Text</li></ul>';

  var testText = field.firstChild.firstChild.firstChild;  // div ul li Test
  testHelper.select(testText, 0, testText, 4);

  var event = new goog.testing.StrictMock(goog.events.BrowserEvent);
  event.keyCode = goog.events.KeyCodes.TAB;
  event.shiftKey = false;

  editableField.execCommand(goog.editor.Command.INDENT);
  event.preventDefault();

  editableField.$replay();
  event.$replay();

  assertTrue(
      'Event must be handled',
      tabHandler.handleKeyboardShortcut(event, '', false));

  editableField.$verify();
  event.$verify();
}

function testListIndentContainLi() {
  field.innerHTML = '<ul><li>Text</li></ul>';

  var testText = field.firstChild.firstChild.firstChild;  // div ul li Test
  testHelper.select(field.firstChild, 0, testText, 4);

  var event = new goog.testing.StrictMock(goog.events.BrowserEvent);
  event.keyCode = goog.events.KeyCodes.TAB;
  event.shiftKey = false;

  editableField.execCommand(goog.editor.Command.INDENT);
  event.preventDefault();

  editableField.$replay();
  event.$replay();

  assertTrue(
      'Event must be handled',
      tabHandler.handleKeyboardShortcut(event, '', false));

  editableField.$verify();
  event.$verify();
}

function testListOutdentInLi() {
  field.innerHTML = '<ul><li>Text</li></ul>';

  var testText = field.firstChild.firstChild.firstChild;  // div ul li Test
  testHelper.select(testText, 0, testText, 4);

  var event = new goog.testing.StrictMock(goog.events.BrowserEvent);
  event.keyCode = goog.events.KeyCodes.TAB;
  event.shiftKey = true;

  editableField.execCommand(goog.editor.Command.OUTDENT);
  event.preventDefault();

  editableField.$replay();
  event.$replay();

  assertTrue(
      'Event must be handled',
      tabHandler.handleKeyboardShortcut(event, '', false));

  editableField.$verify();
  event.$verify();
}

function testListOutdentContainLi() {
  field.innerHTML = '<ul><li>Text</li></ul>';

  var testText = field.firstChild.firstChild.firstChild;  // div ul li Test
  testHelper.select(field.firstChild, 0, testText, 4);

  var event = new goog.testing.StrictMock(goog.events.BrowserEvent);
  event.keyCode = goog.events.KeyCodes.TAB;
  event.shiftKey = true;

  editableField.execCommand(goog.editor.Command.OUTDENT);
  event.preventDefault();

  editableField.$replay();
  event.$replay();

  assertTrue(
      'Event must be handled',
      tabHandler.handleKeyboardShortcut(event, '', false));

  editableField.$verify();
  event.$verify();
}


function testNoOp() {
  goog.dom.setTextContent(field, 'Text');

  var testText = field.firstChild;
  testHelper.select(testText, 0, testText, 4);

  var event = new goog.testing.StrictMock(goog.events.BrowserEvent);
  event.keyCode = goog.events.KeyCodes.TAB;
  event.shiftKey = true;

  editableField.$replay();
  event.$replay();

  assertFalse(
      'Event must not be handled',
      tabHandler.handleKeyboardShortcut(event, '', false));

  editableField.$verify();
  event.$verify();
}
