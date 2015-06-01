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

goog.provide('goog.editor.plugins.AbstractTabHandlerTest');
goog.setTestOnly('goog.editor.plugins.AbstractTabHandlerTest');

goog.require('goog.editor.Field');
goog.require('goog.editor.plugins.AbstractTabHandler');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.StrictMock');
goog.require('goog.testing.editor.FieldMock');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var tabHandler;
var editableField;
var handleTabKeyCalled = false;

function setUp() {
  editableField = new goog.testing.editor.FieldMock();
  editableField.inModalMode = goog.editor.Field.prototype.inModalMode;
  editableField.setModalMode = goog.editor.Field.prototype.setModalMode;

  tabHandler = new goog.editor.plugins.AbstractTabHandler();
  tabHandler.registerFieldObject(editableField);
  tabHandler.handleTabKey = function(e) {
    handleTabKeyCalled = true;
    return true;
  };
}

function tearDown() {
  tabHandler.dispose();
}

function testHandleKey() {
  var event = new goog.testing.StrictMock(goog.events.BrowserEvent);
  event.keyCode = goog.events.KeyCodes.TAB;
  event.ctrlKey = false;
  event.metaKey = false;

  assertTrue('Event must be handled when no modifier keys are pressed.',
      tabHandler.handleKeyboardShortcut(event, '', false));
  assertTrue(handleTabKeyCalled);
  handleTabKeyCalled = false;

  editableField.setModalMode(true);
  if (goog.userAgent.GECKO) {
    assertFalse('Event must not be handled when in modal mode',
        tabHandler.handleKeyboardShortcut(event, '', false));
    assertFalse(handleTabKeyCalled);
  } else {
    assertTrue('Event must be handled when in modal mode',
        tabHandler.handleKeyboardShortcut(event, '', false));
    assertTrue(handleTabKeyCalled);
    handleTabKeyCalled = false;
  }

  event.ctrlKey = true;
  assertFalse('Plugin must never handle tab key press when ctrlKey is pressed.',
      tabHandler.handleKeyboardShortcut(event, '', false));
  assertFalse(handleTabKeyCalled);

  event.ctrlKey = false;
  event.metaKey = true;
  assertFalse('Plugin must never handle tab key press when metaKey is pressed.',
      tabHandler.handleKeyboardShortcut(event, '', false));
  assertFalse(handleTabKeyCalled);
}
