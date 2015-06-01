// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.events.ImeHandlerTest');
goog.setTestOnly('goog.events.ImeHandlerTest');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.ImeHandler');
goog.require('goog.events.KeyCodes');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.events');
goog.require('goog.testing.events.Event');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var sandbox;
var imeHandler;
var eventsFired;
var stubs = new goog.testing.PropertyReplacer();
var eventTypes = goog.events.ImeHandler.EventType;

function setUp() {
  sandbox = goog.dom.getElement('sandbox');
}

function initImeHandler() {
  goog.events.ImeHandler.USES_COMPOSITION_EVENTS =
      goog.userAgent.GECKO ||
      (goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher(532));
  imeHandler = new goog.events.ImeHandler(sandbox);
  eventsFired = [];
  goog.events.listen(
      imeHandler,
      goog.object.getValues(goog.events.ImeHandler.EventType),
      function(e) {
        eventsFired.push(e.type);
      });
}

function tearDown() {
  imeHandler.dispose();
  imeHandler = null;

  stubs.reset();
}

function tearDownPage() {
  // Set up a test bed.
  sandbox.innerHTML = '<div contentEditable="true">hello world</div>';
  initImeHandler();

  function unshiftEvent(e) {
    last10Events.unshift(e.type + ':' + e.keyCode + ':' +
        goog.string.htmlEscape(goog.dom.getTextContent(sandbox)));
    last10Events.length = Math.min(last10Events.length, 10);
    goog.dom.getElement('logger').innerHTML = last10Events.join('<br>');
  }

  var last10Events = [];
  goog.events.listen(
      imeHandler,
      goog.object.getValues(goog.events.ImeHandler.EventType),
      unshiftEvent);
  goog.events.listen(
      sandbox,
      ['keydown', 'textInput'],
      unshiftEvent);
}

function assertEventsFired(var_args) {
  assertArrayEquals(
      goog.array.clone(arguments), eventsFired);
}

function fireInputEvent(type) {
  return goog.testing.events.fireBrowserEvent(
      new goog.testing.events.Event(type, sandbox));
}

function fireImeKeySequence() {
  return fireKeySequence(goog.events.KeyCodes.WIN_IME);
}

function fireKeySequence(keyCode) {
  return (
      goog.testing.events.fireBrowserEvent(
          new goog.testing.events.Event('textInput', sandbox)) &
      goog.testing.events.fireKeySequence(
          sandbox, keyCode));
}

function testHandleKeyDown_GeckoCompositionEvents() {
  // This test verifies that our IME functions can dispatch IME events to
  // InputHandler in the expected order on Gecko.

  // Set the userAgent used for this test to Firefox.
  setUserAgent('GECKO');
  stubs.set(goog.userAgent, 'MAC', false);
  initImeHandler();

  fireInputEvent('compositionstart');
  assertImeMode();

  fireInputEvent('compositionupdate');
  fireInputEvent('compositionupdate');

  fireInputEvent('compositionend');

  assertEventsFired(
      eventTypes.START, eventTypes.UPDATE, eventTypes.UPDATE, eventTypes.END);
  assertNotImeMode();
}


/**
 * Verifies that our IME functions can dispatch IME events to the input handler
 * in the expected order on Chrome. jsUnitFarm does not have Linux Chrome or
 * Mac Chrome. So, we manually change the platform and run this test three
 * times.
 */
function testChromeCompositionEventsLinux() {
  runChromeCompositionEvents('LINUX');
}

function testChromeCompositionEventsMac() {
  runChromeCompositionEvents('MAC');
}

function testChromeCompositionEventsWindows() {
  runChromeCompositionEvents('WINDOWS');
}

function runChromeCompositionEvents(platform) {
  setUserAgent('WEBKIT');
  setVersion(532);
  stubs.set(goog.userAgent, platform, true);
  initImeHandler();

  fireImeKeySequence();

  fireInputEvent('compositionstart');
  assertImeMode();

  fireInputEvent('compositionupdate');
  fireInputEvent('compositionupdate');

  fireInputEvent('compositionend');
  assertEventsFired(
      eventTypes.START, eventTypes.UPDATE, eventTypes.UPDATE, eventTypes.END);
  assertNotImeMode();
}


/**
 * Ensures that the IME mode turn on/off correctly.
 */
function testHandlerKeyDownForIme_imeOnOff() {
  setUserAgent('IE');
  initImeHandler();

  // Send a WIN_IME keyDown event and see whether IME mode turns on.
  fireImeKeySequence();
  assertImeMode();

  // Send keyDown events which should not turn off IME mode and see whether
  // IME mode holds on.
  fireKeySequence(goog.events.KeyCodes.SHIFT);
  assertImeMode();

  fireKeySequence(goog.events.KeyCodes.CTRL);
  assertImeMode();

  // Send a keyDown event with keyCode = ENTER and see whether IME mode
  // turns off.
  fireKeySequence(goog.events.KeyCodes.ENTER);
  assertNotImeMode();

  assertEventsFired(
      eventTypes.START, eventTypes.END);
}


/**
 * Ensures that IME mode turns off when keyup events which are involved
 * in commiting IME text occurred in Safari.
 */
function testHandleKeyUpForSafari() {
  setUserAgent('WEBKIT');
  setVersion(531);
  initImeHandler();

  fireImeKeySequence();
  assertImeMode();

  fireKeySequence(goog.events.KeyCodes.ENTER);
  assertNotImeMode();
}


/**
 * SCIM on Linux will fire WIN_IME keycodes for random characters.
 * Fortunately, all Linux-based browsers use composition events.
 * This test just verifies that we ignore the WIN_IME keycodes.
 */
function testScimFiresWinImeKeycodesGeckoLinux() {
  setUserAgent('GECKO');
  assertScimInputIgnored();
}

function testScimFiresWinImeKeycodesChromeLinux() {
  setUserAgent('WEBKIT');
  setVersion(532);
  assertScimInputIgnored();
}

function assertScimInputIgnored() {
  initImeHandler();

  fireImeKeySequence();
  assertNotImeMode();

  fireInputEvent('compositionstart');
  assertImeMode();

  fireImeKeySequence();
  assertImeMode();

  fireInputEvent('compositionend');
  assertNotImeMode();
}

var userAgents = ['IE', 'GECKO', 'WEBKIT'];

function setUserAgent(userAgent) {
  for (var i = 0; i < userAgents.length; i++) {
    stubs.set(goog.userAgent, userAgents[i], userAgents[i] == userAgent);
  }
}

function setVersion(version) {
  goog.userAgent.VERSION = version;
  goog.userAgent.isVersionOrHigherCache_ = {};
}

function assertImeMode() {
  assertTrue('Should be in IME mode.', imeHandler.isImeMode());
}

function assertNotImeMode() {
  assertFalse('Should not be in IME mode.', imeHandler.isImeMode());
}
