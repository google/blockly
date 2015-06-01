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

goog.provide('goog.dom.selectionTest');
goog.setTestOnly('goog.dom.selectionTest');

goog.require('goog.dom');
goog.require('goog.dom.InputType');
goog.require('goog.dom.TagName');
goog.require('goog.dom.selection');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var input;
var hiddenInput;
var textarea;
var hiddenTextarea;

function setUp() {
  input = goog.dom.createDom(goog.dom.TagName.INPUT,
                             {type: goog.dom.InputType.TEXT});
  textarea = goog.dom.createDom(goog.dom.TagName.TEXTAREA);
  hiddenInput = goog.dom.createDom(
      goog.dom.TagName.INPUT,
      {type: goog.dom.InputType.TEXT, style: 'display: none'});
  hiddenTextarea = goog.dom.createDom(
      goog.dom.TagName.TEXTAREA, {style: 'display: none'});

  document.body.appendChild(input);
  document.body.appendChild(textarea);
  document.body.appendChild(hiddenInput);
  document.body.appendChild(hiddenTextarea);
}

function tearDown() {
  goog.dom.removeNode(input);
  goog.dom.removeNode(textarea);
  goog.dom.removeNode(hiddenInput);
  goog.dom.removeNode(hiddenTextarea);
}


/**
 * Tests getStart routine in both input and textarea.
 */
function testGetStartInput() {
  getStartHelper(input, hiddenInput);
}

function testGetStartTextarea() {
  getStartHelper(textarea, hiddenTextarea);
}

function getStartHelper(field, hiddenField) {
  assertEquals(0, goog.dom.selection.getStart(field));
  assertEquals(0, goog.dom.selection.getStart(hiddenField));

  field.focus();
  assertEquals(0, goog.dom.selection.getStart(field));
}


/**
 * Tests the setText routine for both input and textarea
 * with a single line of text.
 */
function testSetTextInput() {
  setTextHelper(input);
}

function testSetTextTextarea() {
  setTextHelper(textarea);
}

function setTextHelper(field) {
  // Test one line string only
  select(field);
  assertEquals('', goog.dom.selection.getText(field));

  goog.dom.selection.setText(field, 'Get Behind Me Satan');
  assertEquals('Get Behind Me Satan', goog.dom.selection.getText(field));
}


/**
 * Tests the setText routine for textarea with multiple lines of text.
 */
function testSetTextMultipleLines() {
  select(textarea);
  assertEquals('', goog.dom.selection.getText(textarea));
  var isLegacyIE = goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9');
  var message = isLegacyIE ?
                'Get Behind Me\r\nSatan' :
                'Get Behind Me\nSatan';
  goog.dom.selection.setText(textarea, message);
  assertEquals(message, goog.dom.selection.getText(textarea));

  // Select the text upto the point just after the \r\n combination
  // or \n in GECKO.
  var endOfNewline = isLegacyIE ? 15 : 14;
  var selectedMessage = message.substring(0, endOfNewline);
  goog.dom.selection.setStart(textarea, 0);
  goog.dom.selection.setEnd(textarea, endOfNewline);
  assertEquals(selectedMessage, goog.dom.selection.getText(textarea));

  selectedMessage = isLegacyIE ? '\r\n' : '\n';
  goog.dom.selection.setStart(textarea, 13);
  goog.dom.selection.setEnd(textarea, endOfNewline);
  assertEquals(selectedMessage, goog.dom.selection.getText(textarea));
}


/**
 * Tests the setCursor routine for both input and textarea.
 */
function testSetCursorInput() {
  setCursorHelper(input);
}

function testSetCursorTextarea() {
  setCursorHelper(textarea);
}

function setCursorHelper(field) {
  select(field);
  // try to set the cursor beyond the length of the content
  goog.dom.selection.setStart(field, 5);
  goog.dom.selection.setEnd(field, 15);
  assertEquals(0, goog.dom.selection.getStart(field));
  assertEquals(0, goog.dom.selection.getEnd(field));

  select(field);
  var message = 'Get Behind Me Satan';
  goog.dom.selection.setText(field, message);
  goog.dom.selection.setStart(field, 5);
  goog.dom.selection.setEnd(field, message.length);
  assertEquals(5, goog.dom.selection.getStart(field));
  assertEquals(message.length, goog.dom.selection.getEnd(field));

  // Set the end before the start, and see if getEnd returns the start
  // position itself.
  goog.dom.selection.setStart(field, 5);
  goog.dom.selection.setEnd(field, 3);
  assertEquals(3, goog.dom.selection.getEnd(field));
}


/**
 * Tests the getText and setText routines acting on selected text in
 * both input and textarea.
 */
function testGetAndSetSelectedTextInput() {
  getAndSetSelectedTextHelper(input);
}

function testGetAndSetSelectedTextTextarea() {
  getAndSetSelectedTextHelper(textarea);
}

function getAndSetSelectedTextHelper(field) {
  select(field);
  goog.dom.selection.setText(field, 'Get Behind Me Satan');

  // select 'Behind'
  goog.dom.selection.setStart(field, 4);
  goog.dom.selection.setEnd(field, 10);
  assertEquals('Behind', goog.dom.selection.getText(field));

  goog.dom.selection.setText(field, 'In Front Of');
  goog.dom.selection.setStart(field, 0);
  goog.dom.selection.setEnd(field, 100);
  assertEquals('Get In Front Of Me Satan', goog.dom.selection.getText(field));
}


/**
 * Test setStart on hidden input and hidden textarea.
 */
function testSetCursorOnHiddenInput() {
  setCursorOnHiddenInputHelper(hiddenInput);
}

function testSetCursorOnHiddenTextarea() {
  setCursorOnHiddenInputHelper(hiddenTextarea);
}

function setCursorOnHiddenInputHelper(hiddenField) {
  goog.dom.selection.setStart(hiddenField, 0);
  assertEquals(0, goog.dom.selection.getStart(hiddenField));
}


/**
 * Test setStart, setEnd, getStart and getEnd in textarea with text
 * containing line breaks.
 */
function testSetAndGetCursorWithLineBreaks() {
  select(textarea);
  var isLegacyIE = goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9');
  var newline = isLegacyIE ? '\r\n' : '\n';
  var message = 'Hello' + newline + 'World';
  goog.dom.selection.setText(textarea, message);

  // Test setEnd and getEnd, by setting the cursor somewhere after the
  // \r\n combination.
  goog.dom.selection.setEnd(textarea, 9);
  assertEquals(9, goog.dom.selection.getEnd(textarea));

  // Test basic setStart and getStart
  goog.dom.selection.setStart(textarea, 10);
  assertEquals(10, goog.dom.selection.getStart(textarea));

  // Test setEnd and getEnd, by setting the cursor exactly after the
  // \r\n combination in IE or after \n in GECKO.
  var endOfNewline = isLegacyIE ? 7 : 6;
  checkSetAndGetTextarea(endOfNewline, endOfNewline);

  // Select a \r\n combination in IE or \n in GECKO and see if
  // getStart and getEnd work correctly.
  clearField(textarea);
  message = 'Hello' + newline + newline + 'World';
  goog.dom.selection.setText(textarea, message);
  var startOfNewline = isLegacyIE ? 7 : 6;
  endOfNewline = isLegacyIE ? 9 : 7;
  checkSetAndGetTextarea(startOfNewline, endOfNewline);

  // Select 2 \r\n combinations in IE or 2 \ns in GECKO and see if getStart
  // and getEnd work correctly.
  checkSetAndGetTextarea(5, endOfNewline);

  // Position cursor b/w 2 \r\n combinations in IE or 2 \ns in GECKO and see
  // if getStart and getEnd work correctly.
  clearField(textarea);
  message = 'Hello' + newline + newline + newline + newline + 'World';
  goog.dom.selection.setText(textarea, message);
  var middleOfNewlines = isLegacyIE ? 9 : 7;
  checkSetAndGetTextarea(middleOfNewlines, middleOfNewlines);

  // Position cursor at end of a textarea which ends with \r\n in IE or \n in
  // GECKO.
  if (!goog.userAgent.IE || !goog.userAgent.isVersionOrHigher('11')) {
    // TODO(johnlenz): investigate why this fails in IE 11.
    clearField(textarea);
    message = 'Hello' + newline + newline;
    goog.dom.selection.setText(textarea, message);
    var endOfTextarea = message.length;
    checkSetAndGetTextarea(endOfTextarea, endOfTextarea);
  }

  // Position cursor at the end of the 2 starting \r\ns in IE or \ns in GECKO
  // within a textarea.
  clearField(textarea);
  message = newline + newline + 'World';
  goog.dom.selection.setText(textarea, message);
  var endOfTwoNewlines = isLegacyIE ? 4 : 2;
  checkSetAndGetTextarea(endOfTwoNewlines, endOfTwoNewlines);

  // Position cursor at the end of the first \r\n in IE or \n in
  // GECKO within a textarea.
  endOfOneNewline = isLegacyIE ? 2 : 1;
  checkSetAndGetTextarea(endOfOneNewline, endOfOneNewline);
}


/**
 * Test to make sure there's no error when getting the range of an unselected
 * textarea. See bug 1274027.
 */
function testGetStartOnUnfocusedTextarea() {
  input.value = 'White Blood Cells';
  input.focus();
  goog.dom.selection.setCursorPosition(input, 5);

  assertEquals('getStart on input should return where we put the cursor',
      5, goog.dom.selection.getStart(input));

  assertEquals('getStart on unfocused textarea should succeed without error',
      0, goog.dom.selection.getStart(textarea));
}


/**
 * Test to make sure there's no error setting cursor position within a
 * textarea after a newline. This is problematic on IE because of the
 * '\r\n' vs '\n' issue.
 */
function testSetCursorPositionTextareaWithNewlines() {
  textarea.value = 'Hello\nWorld';
  textarea.focus();

  // Set the selection point between 'W' and 'o'. Position is computed this
  // way instead of being hard-coded because it's different in IE due to \r\n
  // vs \n.
  goog.dom.selection.setCursorPosition(textarea, textarea.value.length - 4);

  var isLegacyIE = goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9');
  var linebreak = isLegacyIE ? '\r\n' : '\n';
  var expectedLeftString = 'Hello' + linebreak + 'W';

  assertEquals('getStart on input should return after the newline',
      expectedLeftString.length, goog.dom.selection.getStart(textarea));
  assertEquals('getEnd on input should return after the newline',
      expectedLeftString.length, goog.dom.selection.getEnd(textarea));

  goog.dom.selection.setEnd(textarea, textarea.value.length);
  assertEquals('orld', goog.dom.selection.getText(textarea));
}


/**
 * Helper function to clear the textfield contents.
 */
function clearField(field) {
  field.value = '';
}


/**
 * Helper function to set the start and end and assert the getter values.
 */
function checkSetAndGetTextarea(start, end) {
  goog.dom.selection.setStart(textarea, start);
  goog.dom.selection.setEnd(textarea, end);
  assertEquals(start, goog.dom.selection.getStart(textarea));
  assertEquals(end, goog.dom.selection.getEnd(textarea));
}


/**
 * Helper function to focus and select a field. In IE8, selected
 * fields need focus.
 */
function select(field) {
  field.focus();
  field.select();
}
