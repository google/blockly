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

goog.provide('goog.events.KeyCodesTest');
goog.setTestOnly('goog.events.KeyCodesTest');

goog.require('goog.events.BrowserEvent');
goog.require('goog.events.KeyCodes');
goog.require('goog.object');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var KeyCodes;
var stubs;

function setUpPage() {
  KeyCodes = goog.events.KeyCodes;
  stubs = new goog.testing.PropertyReplacer();
}

function tearDown() {
  stubs.reset();
}

function testTextModifyingKeys() {
  var specialTextModifiers = goog.object.createSet(
      KeyCodes.BACKSPACE,
      KeyCodes.DELETE,
      KeyCodes.ENTER,
      KeyCodes.MAC_ENTER,
      KeyCodes.TAB,
      KeyCodes.WIN_IME);

  if (!goog.userAgent.GECKO) {
    specialTextModifiers[KeyCodes.WIN_KEY_FF_LINUX] = 1;
  }

  for (var keyId in KeyCodes) {
    var key = KeyCodes[keyId];
    if (goog.isFunction(key)) {
      // skip static methods
      continue;
    }

    var fakeEvent = createEventWithKeyCode(key);

    if (KeyCodes.isCharacterKey(key) || (key in specialTextModifiers)) {
      assertTrue('Expected key to modify text: ' + keyId,
          KeyCodes.isTextModifyingKeyEvent(fakeEvent));
    } else {
      assertFalse('Expected key to not modify text: ' + keyId,
          KeyCodes.isTextModifyingKeyEvent(fakeEvent));
    }
  }

  for (var i = KeyCodes.FIRST_MEDIA_KEY; i <= KeyCodes.LAST_MEDIA_KEY; i++) {
    var fakeEvent = createEventWithKeyCode(i);
    assertFalse('Expected key to not modify text: ' + i,
        KeyCodes.isTextModifyingKeyEvent(fakeEvent));
  }
}

function testKeyCodeZero() {
  var zeroEvent = createEventWithKeyCode(0);
  assertEquals(
      !goog.userAgent.GECKO,
      KeyCodes.isTextModifyingKeyEvent(zeroEvent));
  assertEquals(
      goog.userAgent.WEBKIT,
      KeyCodes.isCharacterKey(0));
}

function testPhantomKey() {
  // KeyCode 255 deserves its own test to make sure this does not regress,
  // because it's so weird. See the comments in the KeyCode enum.
  var fakeEvent = createEventWithKeyCode(goog.events.KeyCodes.PHANTOM);
  assertFalse('Expected phantom key to not modify text',
      KeyCodes.isTextModifyingKeyEvent(fakeEvent));
  assertFalse(KeyCodes.isCharacterKey(fakeEvent));
}

function testNonUsKeyboards() {
  var fakeEvent = createEventWithKeyCode(1092 /* Russian a */);
  assertTrue('Expected key to not modify text: 1092',
      KeyCodes.isTextModifyingKeyEvent(fakeEvent));
}

function createEventWithKeyCode(i) {
  var fakeEvent = new goog.events.BrowserEvent('keydown');
  fakeEvent.keyCode = i;
  return fakeEvent;
}

function testNormalizeGeckoKeyCode() {
  stubs.set(goog.userAgent, 'GECKO', true);

  // Test Gecko-specific key codes.
  assertEquals(
      goog.events.KeyCodes.normalizeGeckoKeyCode(KeyCodes.FF_EQUALS),
      KeyCodes.EQUALS);
  assertEquals(
      goog.events.KeyCodes.normalizeKeyCode(KeyCodes.FF_EQUALS),
      KeyCodes.EQUALS);

  assertEquals(
      goog.events.KeyCodes.normalizeGeckoKeyCode(KeyCodes.FF_SEMICOLON),
      KeyCodes.SEMICOLON);
  assertEquals(
      goog.events.KeyCodes.normalizeKeyCode(KeyCodes.FF_SEMICOLON),
      KeyCodes.SEMICOLON);

  assertEquals(
      goog.events.KeyCodes.normalizeGeckoKeyCode(KeyCodes.MAC_FF_META),
      KeyCodes.META);
  assertEquals(
      goog.events.KeyCodes.normalizeKeyCode(KeyCodes.MAC_FF_META),
      KeyCodes.META);

  assertEquals(
      goog.events.KeyCodes.normalizeGeckoKeyCode(KeyCodes.WIN_KEY_FF_LINUX),
      KeyCodes.WIN_KEY);
  assertEquals(
      goog.events.KeyCodes.normalizeKeyCode(KeyCodes.WIN_KEY_FF_LINUX),
      KeyCodes.WIN_KEY);

  // Test general key codes.
  assertEquals(
      goog.events.KeyCodes.normalizeGeckoKeyCode(KeyCodes.COMMA),
      KeyCodes.COMMA);
  assertEquals(
      goog.events.KeyCodes.normalizeKeyCode(KeyCodes.COMMA),
      KeyCodes.COMMA);
}

function testNormalizeMacWebKitKeyCode() {
  stubs.set(goog.userAgent, 'GECKO', false);
  stubs.set(goog.userAgent, 'MAC', true);
  stubs.set(goog.userAgent, 'WEBKIT', true);

  // Test Mac WebKit specific key codes.
  assertEquals(
      goog.events.KeyCodes.normalizeMacWebKitKeyCode(KeyCodes.MAC_WK_CMD_LEFT),
      KeyCodes.META);
  assertEquals(
      goog.events.KeyCodes.normalizeKeyCode(KeyCodes.MAC_WK_CMD_LEFT),
      KeyCodes.META);

  assertEquals(
      goog.events.KeyCodes.normalizeMacWebKitKeyCode(KeyCodes.MAC_WK_CMD_RIGHT),
      KeyCodes.META);
  assertEquals(
      goog.events.KeyCodes.normalizeKeyCode(KeyCodes.MAC_WK_CMD_RIGHT),
      KeyCodes.META);

  // Test general key codes.
  assertEquals(
      goog.events.KeyCodes.normalizeMacWebKitKeyCode(KeyCodes.COMMA),
      KeyCodes.COMMA);
  assertEquals(
      goog.events.KeyCodes.normalizeKeyCode(KeyCodes.COMMA),
      KeyCodes.COMMA);
}
