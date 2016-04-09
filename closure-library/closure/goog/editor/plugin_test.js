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

goog.provide('goog.editor.PluginTest');
goog.setTestOnly('goog.editor.PluginTest');

goog.require('goog.editor.Field');
goog.require('goog.editor.Plugin');
goog.require('goog.functions');
goog.require('goog.testing.StrictMock');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var plugin;
var fieldObject;


function setUp() {
  plugin = new goog.editor.Plugin();
  fieldObject = {};
}


function tearDown() {
  plugin.dispose();
}


function testRegisterFieldObject() {
  plugin.registerFieldObject(fieldObject);
  assertEquals(
      'Register field object must be stored in protected field.', fieldObject,
      plugin.fieldObject);

  assertFalse(
      'Newly registered plugin must not be enabled.',
      plugin.isEnabled(fieldObject));
}


function testUnregisterFieldObject() {
  plugin.registerFieldObject(fieldObject);
  plugin.enable(fieldObject);
  plugin.unregisterFieldObject(fieldObject);

  assertNull(
      'fieldObject property must be undefined after ' +
          'unregistering a field object.',
      plugin.fieldObject);
  assertFalse(
      'Unregistered field object must not be enabled',
      plugin.isEnabled(fieldObject));
}


function testEnable() {
  plugin.registerFieldObject(fieldObject);
  plugin.enable(fieldObject);

  assertTrue(
      'Enabled field object must be enabled according to isEnabled().',
      plugin.isEnabled(fieldObject));
}


function testDisable() {
  plugin.registerFieldObject(fieldObject);
  plugin.enable(fieldObject);
  plugin.disable(fieldObject);

  assertFalse(
      'Disabled field object must be disabled according to ' +
          'isEnabled().',
      plugin.isEnabled(fieldObject));
}


function testIsEnabled() {
  // Other base cases covered while testing enable() and disable().

  assertFalse(
      'Unregistered field object must be disabled according ' +
          'to isEnabled().',
      plugin.isEnabled(fieldObject));
}


function testIsSupportedCommand() {
  assertFalse(
      'Base plugin class must not support any commands.',
      plugin.isSupportedCommand('+indent'));
}

function testExecCommand() {
  var mockField = new goog.testing.StrictMock(goog.editor.Field);
  plugin.registerFieldObject(mockField);

  if (goog.userAgent.GECKO) {
    mockField.stopChangeEvents(true, true);
  }
  mockField.dispatchBeforeChange();
  // Note(user): dispatch change turns back on (delayed) change events.
  mockField.dispatchChange();
  mockField.dispatchSelectionChangeEvent();
  mockField.$replay();

  var passedCommand, passedArg;
  plugin.execCommandInternal = function(command, arg) {
    passedCommand = command;
    passedArg = arg;
  };
  plugin.execCommand('+indent', true);

  // Verify that execCommand dispatched the expected events.
  mockField.$verify();
  mockField.$reset();
  // Verify that execCommandInternal was called with the correct arguments.
  assertEquals('+indent', passedCommand);
  assertTrue(passedArg);

  plugin.isSilentCommand = goog.functions.constant(true);
  mockField.$replay();
  plugin.execCommand('+outdent', false);
  // Verify that execCommand on a silent plugin dispatched no events.
  mockField.$verify();
  // Verify that execCommandInternal was called with the correct arguments.
  assertEquals('+outdent', passedCommand);
  assertFalse(passedArg);
}


/**
 * Regression test for http://b/issue?id=1471355 .
 */
function testExecCommandException() {
  var mockField = new goog.testing.StrictMock(goog.editor.Field);
  plugin.registerFieldObject(mockField);
  plugin.execCommandInternal = function() { throw 1; };

  if (goog.userAgent.GECKO) {
    mockField.stopChangeEvents(true, true);
  }
  mockField.dispatchBeforeChange();
  // Note(user): dispatch change turns back on (delayed) change events.
  mockField.dispatchChange();
  mockField.dispatchSelectionChangeEvent();
  mockField.$replay();

  assertThrows('Exception should not be swallowed', function() {
    plugin.execCommand();
  });

  // Verifies that cleanup is done despite the exception.
  mockField.$verify();
}

function testDisposed() {
  plugin.registerFieldObject(fieldObject);
  plugin.dispose();
  assert(plugin.getDisposed());
  assertNull(
      'Disposed plugin must not have a field object.', plugin.fieldObject);
  assertFalse(
      'Disposed plugin must not have an enabled field object.',
      plugin.isEnabled(fieldObject));
}

function testIsAndSetAutoDispose() {
  assertTrue('Plugin must start auto-disposable', plugin.isAutoDispose());

  plugin.setAutoDispose(false);
  assertFalse(plugin.isAutoDispose());

  plugin.setAutoDispose(true);
  assertTrue(plugin.isAutoDispose());
}
