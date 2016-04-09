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

goog.provide('goog.editor.plugins.HeaderFormatterTest');
goog.setTestOnly('goog.editor.plugins.HeaderFormatterTest');

goog.require('goog.dom');
goog.require('goog.editor.Command');
goog.require('goog.editor.plugins.BasicTextFormatter');
goog.require('goog.editor.plugins.HeaderFormatter');
goog.require('goog.events.BrowserEvent');
goog.require('goog.testing.LooseMock');
goog.require('goog.testing.editor.FieldMock');
goog.require('goog.testing.editor.TestHelper');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var field;
var editableField;
var headerFormatter;
var btf;
var testHelper;

function setUpPage() {
  field = goog.dom.getElement('field');
  testHelper = new goog.testing.editor.TestHelper(field);
}

function setUp() {
  testHelper.setUpEditableElement();
  editableField = new goog.testing.editor.FieldMock();
  headerFormatter = new goog.editor.plugins.HeaderFormatter();
  headerFormatter.registerFieldObject(editableField);
  btf = new goog.editor.plugins.BasicTextFormatter();
  btf.registerFieldObject(editableField);
}

function tearDown() {
  editableField = null;
  headerFormatter.dispose();
  testHelper.tearDownEditableElement();
}


function testHeaderShortcuts() {
  goog.dom.setTextContent(field, 'myText');

  var textNode = field.firstChild;
  testHelper.select(textNode, 0, textNode, textNode.length);

  editableField.getElement();
  editableField.$anyTimes();
  editableField.$returns(field);

  editableField.getPluginByClassId('Bidi');
  editableField.$anyTimes();
  editableField.$returns(null);

  editableField.execCommand(
      goog.editor.Command.FORMAT_BLOCK,
      goog.editor.plugins.HeaderFormatter.HEADER_COMMAND.H1);
  // Bypass EditableField's execCommand and directly call
  // basicTextFormatter's.  Future version of headerformatter will include
  // that code in its own execCommand.
  editableField.$does(function() {
    btf.execCommandInternal(
        goog.editor.plugins.BasicTextFormatter.COMMAND.FORMAT_BLOCK,
        goog.editor.plugins.HeaderFormatter.HEADER_COMMAND.H1);
  });

  var event = new goog.testing.LooseMock(goog.events.BrowserEvent);
  if (goog.userAgent.GECKO) {
    event.stopPropagation();
  }

  editableField.$replay();
  event.$replay();

  assertTrue(
      'Event handled',
      headerFormatter.handleKeyboardShortcut(event, '1', true));
  assertEquals('Field contains a header', 'H1', field.firstChild.nodeName);

  editableField.$verify();
  event.$verify();
}
