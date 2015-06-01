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

goog.provide('goog.events.BrowserEventTest');
goog.setTestOnly('goog.events.BrowserEventTest');

goog.require('goog.events.BrowserEvent');
goog.require('goog.events.BrowserFeature');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var stubs = new goog.testing.PropertyReplacer();
var Button = goog.events.BrowserEvent.MouseButton;

function setUp() {
  stubs.reset();
}


/**
 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=497780
 */
function testInvalidNodeBug() {
  if (!goog.userAgent.GECKO) return;

  var event = {};
  event.relatedTarget = {};
  event.relatedTarget.__defineGetter__(
      'nodeName',
      function() {
        throw Error('https://bugzilla.mozilla.org/show_bug.cgi?id=497780');
      });
  assertThrows(function() { return event.relatedTarget.nodeName; });

  var bEvent = new goog.events.BrowserEvent(event);
  assertEquals(event, bEvent.event_);
  assertNull(bEvent.relatedTarget);
}

function testPreventDefault() {
  var event = {};
  event.defaultPrevented = false;
  var bEvent = new goog.events.BrowserEvent(event);
  assertFalse(bEvent.defaultPrevented);
  bEvent.preventDefault();
  assertTrue(bEvent.defaultPrevented);
}

function testDefaultPrevented() {
  var event = {};
  event.defaultPrevented = true;
  var bEvent = new goog.events.BrowserEvent(event);
  assertTrue(bEvent.defaultPrevented);
}

function testIsButtonIe() {
  stubs.set(goog.events.BrowserFeature, 'HAS_W3C_BUTTON', false);
  assertIsButton(
      createBrowserEvent('mousedown', 1),
      Button.LEFT,
      true);
  assertIsButton(
      createBrowserEvent('click', 0),
      Button.LEFT,
      true);
  assertIsButton(
      createBrowserEvent('mousedown', 2),
      Button.RIGHT,
      false);
  assertIsButton(
      createBrowserEvent('mousedown', 4),
      Button.MIDDLE,
      false);
}

function testIsButtonWebkitMac() {
  stubs.set(goog.events.BrowserFeature, 'HAS_W3C_BUTTON', true);
  stubs.set(goog.userAgent, 'WEBKIT', true);
  stubs.set(goog.userAgent, 'MAC', true);
  assertIsButton(
      createBrowserEvent('mousedown', 0),
      Button.LEFT,
      true);
  assertIsButton(
      createBrowserEvent('mousedown', 0, true),
      Button.LEFT,
      false);
  assertIsButton(
      createBrowserEvent('mousedown', 2),
      Button.RIGHT,
      false);
  assertIsButton(
      createBrowserEvent('mousedown', 2, true),
      Button.RIGHT,
      false);
  assertIsButton(
      createBrowserEvent('mousedown', 1),
      Button.MIDDLE,
      false);
  assertIsButton(
      createBrowserEvent('mousedown', 1, true),
      Button.MIDDLE,
      false);
}

function testIsButtonGecko() {
  stubs.set(goog.events.BrowserFeature, 'HAS_W3C_BUTTON', true);
  stubs.set(goog.userAgent, 'GECKO', true);
  stubs.set(goog.userAgent, 'MAC', true);
  assertIsButton(
      createBrowserEvent('mousedown', 0),
      Button.LEFT,
      true);
  assertIsButton(
      createBrowserEvent('mousedown', 2, true),
      Button.RIGHT,
      false);
}

function createBrowserEvent(type, button, opt_ctrlKey) {
  return new goog.events.BrowserEvent({
    type: type,
    button: button,
    ctrlKey: !!opt_ctrlKey
  });
}

function assertIsButton(event, button, isActionButton) {
  for (var key in Button) {
    assertEquals(
        'Testing isButton(' + key + ') against ' +
        button + ' and type ' + event.type,
        Button[key] == button, event.isButton(Button[key]));
  }

  assertEquals(isActionButton, event.isMouseActionButton());
}
