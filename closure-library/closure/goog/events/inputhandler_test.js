// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.events.InputHandlerTest');
goog.setTestOnly('goog.events.InputHandlerTest');

goog.require('goog.dom');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.events.InputHandler');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');
goog.require('goog.testing.events.Event');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');
goog.require('goog.userAgent');

var inputHandler;
var eventHandler;

function setUp() {
  eventHandler = new goog.events.EventHandler();
}

function tearDown() {
  goog.dispose(inputHandler);
  goog.dispose(eventHandler);
}

function testInputWithPlaceholder() {
  var input = goog.dom.getElement('input-w-placeholder');
  inputHandler = new goog.events.InputHandler(input);
  var callback = listenToInput(inputHandler);
  fireFakeInputEvent(input);
  assertEquals(0, callback.getCallCount());
}

function testInputWithPlaceholder_withValue() {
  var input = goog.dom.getElement('input-w-placeholder');
  inputHandler = new goog.events.InputHandler(input);
  var callback = listenToInput(inputHandler);
  input.value = 'foo';
  fireFakeInputEvent(input);
  assertEquals(0, callback.getCallCount());
}

function testInputWithPlaceholder_someKeys() {
  var input = goog.dom.getElement('input-w-placeholder');
  inputHandler = new goog.events.InputHandler(input);
  var callback = listenToInput(inputHandler);
  input.focus();
  input.value = 'foo';

  fireInputEvent(input, goog.events.KeyCodes.M);
  assertEquals(1, callback.getCallCount());
}

function listenToInput(inputHandler) {
  var callback = goog.testing.recordFunction();
  eventHandler.listen(
      inputHandler, goog.events.InputHandler.EventType.INPUT, callback);
  return callback;
}

function fireFakeInputEvent(input) {
  // Simulate the input event that IE fires on focus when a placeholder
  // is present.
  input.focus();
  if (goog.userAgent.IE && goog.userAgent.isVersionOrHigher(10)) {
    // IE fires an input event with keycode 0
    fireInputEvent(input, 0);
  }
}

function fireInputEvent(input, keyCode) {
  var inputEvent =
      new goog.testing.events.Event(goog.events.EventType.INPUT, input);
  inputEvent.keyCode = keyCode;
  inputEvent.charCode = keyCode;
  goog.testing.events.fireBrowserEvent(inputEvent);
}
