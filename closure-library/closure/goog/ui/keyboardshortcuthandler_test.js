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

goog.provide('goog.ui.KeyboardShortcutHandlerTest');
goog.setTestOnly('goog.ui.KeyboardShortcutHandlerTest');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.StrictMock');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.KeyboardShortcutHandler');
goog.require('goog.userAgent');

var Modifiers = goog.ui.KeyboardShortcutHandler.Modifiers;
var KeyCodes = goog.events.KeyCodes;

var handler;
var targetDiv;
var listener;
var mockClock;
var stubs = new goog.testing.PropertyReplacer();


/**
 * Fires a keypress on the target div.
 * @return {boolean} The returnValue of the sequence: false if
 *     preventDefault() was called on any of the events, true otherwise.
 */
function fire(keycode, opt_extraProperties, opt_element) {
  return goog.testing.events.fireKeySequence(
      opt_element || targetDiv, keycode, opt_extraProperties);
}

function fireAltGraphKey(keycode, keyPressKeyCode, opt_extraProperties,
                         opt_element) {
  return goog.testing.events.fireNonAsciiKeySequence(
      opt_element || targetDiv, keycode, keyPressKeyCode,
      opt_extraProperties);
}

function setUp() {
  targetDiv = goog.dom.getElement('targetDiv');
  handler = new goog.ui.KeyboardShortcutHandler(
      goog.dom.getElement('rootDiv'));

  // Create a mock event listener in order to set expectations on what
  // events are fired.  We create a fake class whose only method is
  // shortcutFired(shortcut identifier).
  listener = new goog.testing.StrictMock(
      {shortcutFired: goog.nullFunction});
  goog.events.listen(
      handler,
      goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_TRIGGERED,
      function(event) { listener.shortcutFired(event.identifier); });

  // Set up a fake clock, because keyboard shortcuts *are* time
  // sensitive.
  mockClock = new goog.testing.MockClock(true);
}

function tearDown() {
  mockClock.uninstall();
  handler.dispose();
  stubs.reset();
}

function testAllowsSingleLetterKeyBindingsSpecifiedAsString() {
  listener.shortcutFired('lettergee');
  listener.$replay();

  handler.registerShortcut('lettergee', 'g');
  fire(KeyCodes.G);

  listener.$verify();
}

function testAllowsSingleLetterKeyBindingsSpecifiedAsKeyCode() {
  listener.shortcutFired('lettergee');
  listener.$replay();

  handler.registerShortcut('lettergee', KeyCodes.G);
  fire(KeyCodes.G);

  listener.$verify();
}

function testDoesntFireWhenWrongKeyIsPressed() {
  listener.$replay(); // no events expected

  handler.registerShortcut('letterjay', 'j');
  fire(KeyCodes.G);

  listener.$verify();
}

function testAllowsControlAndLetterSpecifiedAsAString() {
  listener.shortcutFired('lettergee');
  listener.$replay();

  handler.registerShortcut('lettergee', 'ctrl+g');
  fire(KeyCodes.G, {ctrlKey: true});

  listener.$verify();
}

function testAllowsControlAndLetterSpecifiedAsArgSequence() {
  listener.shortcutFired('lettergeectrl');
  listener.$replay();

  handler.registerShortcut('lettergeectrl',
      KeyCodes.G, Modifiers.CTRL);
  fire(KeyCodes.G, {ctrlKey: true});

  listener.$verify();
}

function testAllowsControlAndLetterSpecifiedAsArray() {
  listener.shortcutFired('lettergeectrl');
  listener.$replay();

  handler.registerShortcut('lettergeectrl',
      [KeyCodes.G, Modifiers.CTRL]);
  fire(KeyCodes.G, {ctrlKey: true});

  listener.$verify();
}

function testAllowsShift() {
  listener.shortcutFired('lettergeeshift');
  listener.$replay();

  handler.registerShortcut('lettergeeshift',
      [KeyCodes.G, Modifiers.SHIFT]);
  fire(KeyCodes.G, {shiftKey: true});

  listener.$verify();
}

function testAllowsAlt() {
  listener.shortcutFired('lettergeealt');
  listener.$replay();

  handler.registerShortcut('lettergeealt',
      [KeyCodes.G, Modifiers.ALT]);
  fire(KeyCodes.G, {altKey: true});

  listener.$verify();
}

function testAllowsMeta() {
  listener.shortcutFired('lettergeemeta');
  listener.$replay();

  handler.registerShortcut('lettergeemeta',
      [KeyCodes.G, Modifiers.META]);
  fire(KeyCodes.G, {metaKey: true});

  listener.$verify();
}

function testAllowsMultipleModifiers() {
  listener.shortcutFired('lettergeectrlaltshift');
  listener.$replay();

  handler.registerShortcut('lettergeectrlaltshift',
      KeyCodes.G, Modifiers.CTRL | Modifiers.ALT | Modifiers.SHIFT);
  fire(KeyCodes.G, {ctrlKey: true, altKey: true, shiftKey: true});

  listener.$verify();
}

function testAllowsMultipleModifiersSpecifiedAsString() {
  listener.shortcutFired('lettergeectrlaltshiftmeta');
  listener.$replay();

  handler.registerShortcut('lettergeectrlaltshiftmeta',
      'ctrl+shift+alt+meta+g');
  fire(KeyCodes.G,
      {ctrlKey: true, altKey: true, shiftKey: true, metaKey: true});

  listener.$verify();
}

function testPreventsDefaultOnReturnFalse() {
  listener.shortcutFired('x');
  listener.$replay();

  handler.registerShortcut('x', 'x');
  var key = goog.events.listen(handler,
      goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_TRIGGERED,
      function(event) { return false });

  assertFalse('return false in listener must prevent default',
              fire(KeyCodes.X));

  listener.$verify();

  goog.events.unlistenByKey(key);
}

function testPreventsDefaultWhenExceptionThrown() {
  handler.registerShortcut('x', 'x');
  handler.setAlwaysPreventDefault(true);
  goog.events.listenOnce(handler,
      goog.ui.KeyboardShortcutHandler.EventType.SHORTCUT_TRIGGERED,
      function(event) { throw new Error('x'); });

  // We can't use the standard infrastructure to detect that
  // the event was preventDefaulted, because of the exception.
  var callCount = 0;
  stubs.set(goog.events.BrowserEvent.prototype, 'preventDefault',
      function() {
        callCount++;
      });

  var e = assertThrows(goog.partial(fire, KeyCodes.X));
  assertEquals('x', e.message);

  assertEquals(1, callCount);
}

function testDoesntFireWhenUserForgetsRequiredModifier() {
  listener.$replay(); // no events expected

  handler.registerShortcut('lettergeectrl',
      KeyCodes.G, Modifiers.CTRL);
  fire(KeyCodes.G);

  listener.$verify();
}

function testDoesntFireIfTooManyModifiersPressed() {
  listener.$replay(); // no events expected

  handler.registerShortcut('lettergeectrl',
      KeyCodes.G, Modifiers.CTRL);
  fire(KeyCodes.G, {ctrlKey: true, metaKey: true});

  listener.$verify();
}

function testDoesntFireIfAnyRequiredModifierForgotten() {
  listener.$replay(); // no events expected

  handler.registerShortcut('lettergeectrlaltshift',
      KeyCodes.G, Modifiers.CTRL | Modifiers.ALT | Modifiers.SHIFT);
  fire(KeyCodes.G, {altKey: true, shiftKey: true});

  listener.$verify();
}

function testAllowsMultiKeySequenceSpecifiedAsArray() {
  listener.shortcutFired('quitemacs');
  listener.$replay();

  handler.registerShortcut('quitemacs',
      [KeyCodes.X, Modifiers.CTRL,
       KeyCodes.C]);
  assertFalse(fire(KeyCodes.X, {ctrlKey: true}));
  fire(KeyCodes.C);

  listener.$verify();
}

function testAllowsMultiKeySequenceSpecifiedAsArguments() {
  listener.shortcutFired('quitvi');
  listener.$replay();

  handler.registerShortcut('quitvi',
      KeyCodes.SEMICOLON, Modifiers.SHIFT,
      KeyCodes.Q, Modifiers.NONE,
      KeyCodes.NUM_ONE, Modifiers.SHIFT);
  var shiftProperties = { shiftKey: true };
  assertFalse(fire(KeyCodes.SEMICOLON, shiftProperties));
  assertFalse(fire(KeyCodes.Q));
  fire(KeyCodes.NUM_ONE, shiftProperties);

  listener.$verify();
}

function testMultiKeyEventIsNotFiredIfUserIsTooSlow() {
  listener.$replay(); // no events expected

  handler.registerShortcut('quitemacs',
      [KeyCodes.X, Modifiers.CTRL,
       KeyCodes.C]);

  fire(KeyCodes.X, {ctrlKey: true});

  // Wait 3 seconds before hitting C.  Although the actual limit is 1500
  // at time of writing, it's best not to over-specify functionality.
  mockClock.tick(3000);

  fire(KeyCodes.C);

  listener.$verify();
}

function testAllowsMultipleAHandlers() {
  listener.shortcutFired('quitvi');
  listener.shortcutFired('letterex');
  listener.shortcutFired('quitemacs');
  listener.$replay();

  // register 3 handlers in 3 diferent ways
  handler.registerShortcut('quitvi',
      KeyCodes.SEMICOLON, Modifiers.SHIFT,
      KeyCodes.Q, Modifiers.NONE,
      KeyCodes.NUM_ONE, Modifiers.SHIFT);
  handler.registerShortcut('quitemacs',
      [KeyCodes.X, Modifiers.CTRL,
       KeyCodes.C]);
  handler.registerShortcut('letterex', 'x');


  // quit vi
  var shiftProperties = { shiftKey: true };
  fire(KeyCodes.SEMICOLON, shiftProperties);
  fire(KeyCodes.Q);
  fire(KeyCodes.NUM_ONE, shiftProperties);

  // then press the letter x
  fire(KeyCodes.X);

  // then quit emacs
  fire(KeyCodes.X, {ctrlKey: true});
  fire(KeyCodes.C);

  listener.$verify();
}

function testCanRemoveOneHandler() {
  listener.shortcutFired('letterex');
  listener.$replay();

  // register 2 handlers, then remove quitvi
  handler.registerShortcut('quitvi',
      KeyCodes.COLON, Modifiers.NONE,
      KeyCodes.Q, Modifiers.NONE,
      KeyCodes.EXCLAMATION, Modifiers.NONE);
  handler.registerShortcut('letterex', 'x');
  handler.unregisterShortcut(
      KeyCodes.COLON, Modifiers.NONE,
      KeyCodes.Q, Modifiers.NONE,
      KeyCodes.EXCLAMATION, Modifiers.NONE);

  // call the "quit VI" keycodes, even though it is removed
  fire(KeyCodes.COLON);
  fire(KeyCodes.Q);
  fire(KeyCodes.EXCLAMATION);

  // press the letter x
  fire(KeyCodes.X);

  listener.$verify();
}

function testCanRemoveTwoHandlers() {
  listener.$replay(); // no events expected

  handler.registerShortcut('quitemacs',
      [KeyCodes.X, Modifiers.CTRL,
       KeyCodes.C]);
  handler.registerShortcut('letterex', 'x');
  handler.unregisterShortcut(
      [KeyCodes.X, Modifiers.CTRL,
       KeyCodes.C]);
  handler.unregisterShortcut('x');

  fire(KeyCodes.X, {ctrlKey: true});
  fire(KeyCodes.C);
  fire(KeyCodes.X);

  listener.$verify();
}

function testIsShortcutRegistered_single() {
  assertFalse(handler.isShortcutRegistered('x'));
  handler.registerShortcut('letterex', 'x');
  assertTrue(handler.isShortcutRegistered('x'));
  handler.unregisterShortcut('x');
  assertFalse(handler.isShortcutRegistered('x'));
}

function testIsShortcutRegistered_multi() {
  assertFalse(handler.isShortcutRegistered('a'));
  assertFalse(handler.isShortcutRegistered('a b'));
  assertFalse(handler.isShortcutRegistered('a b c'));

  handler.registerShortcut('ab', 'a b');

  assertFalse(handler.isShortcutRegistered('a'));
  assertTrue(handler.isShortcutRegistered('a b'));
  assertFalse(handler.isShortcutRegistered('a b c'));

  handler.unregisterShortcut('a b');

  assertFalse(handler.isShortcutRegistered('a'));
  assertFalse(handler.isShortcutRegistered('a b'));
  assertFalse(handler.isShortcutRegistered('a b c'));
}

function testUnregister_subsequence() {
  // Unregistering a partial sequence should not orphan shortcuts further in the
  // sequence.
  handler.registerShortcut('abc', 'a b c');
  handler.unregisterShortcut('a b');
  assertTrue(handler.isShortcutRegistered('a b c'));
}

function testUnregister_supersequence() {
  // Unregistering a sequence that extends beyond a registered sequence should
  // do nothing.
  handler.registerShortcut('ab', 'a b');
  handler.unregisterShortcut('a b c');
  assertTrue(handler.isShortcutRegistered('a b'));
}

function testUnregister_partialMatchSequence() {
  // Unregistering a sequence that partially matches a registered sequence
  // should do nothing.
  handler.registerShortcut('abc', 'a b c');
  handler.unregisterShortcut('a b x');
  assertTrue(handler.isShortcutRegistered('a b c'));
}

function testUnregister_deadBranch() {
  // Unregistering a sequence should prune any dead branches in the tree.
  handler.registerShortcut('abc', 'a b c');
  handler.unregisterShortcut('a b c');
  // Default is not should not be prevented in the A key stroke because the A
  // branch has been removed from the tree.
  assertTrue(fire(KeyCodes.A));
}


/**
 * Registers a slew of keyboard shortcuts to test each primary category
 * of shortcuts.
 */
function registerEnterSpaceXF1AltY() {
  // Enter and space are specially handled keys.
  handler.registerShortcut('enter', KeyCodes.ENTER);
  handler.registerShortcut('space', KeyCodes.SPACE);
  // 'x' should be treated as text in many contexts
  handler.registerShortcut('x', 'x');
  // F1 is a global shortcut.
  handler.registerShortcut('global', KeyCodes.F1);
  // Alt-Y has modifiers, which pass through most form elements.
  handler.registerShortcut('withAlt', 'alt+y');
}


/**
 * Fires enter, space, X, F1, and Alt-Y keys on a widget.
 * @param {Element} target The element on which to fire the events.
 */
function fireEnterSpaceXF1AltY(target) {
  fire(KeyCodes.ENTER, undefined, target);
  fire(KeyCodes.SPACE, undefined, target);
  fire(KeyCodes.X, undefined, target);
  fire(KeyCodes.F1, undefined, target);
  fire(KeyCodes.Y, {altKey: true}, target);
}

function testIgnoreNonGlobalShortcutsInSelect() {
  var targetSelect = goog.dom.getElement('targetSelect');

  listener.shortcutFired('global');
  listener.shortcutFired('withAlt');
  listener.$replay();

  registerEnterSpaceXF1AltY();
  fireEnterSpaceXF1AltY(goog.dom.getElement('targetSelect'));

  listener.$verify();
}

function testIgnoreNonGlobalShortcutsInTextArea() {
  listener.shortcutFired('global');
  listener.shortcutFired('withAlt');
  listener.$replay();

  registerEnterSpaceXF1AltY();
  fireEnterSpaceXF1AltY(goog.dom.getElement('targetTextArea'));

  listener.$verify();
}


/**
 * Checks that the shortcuts are fired on each target.
 * @param {Array<string>} shortcuts A list of shortcut identifiers.
 * @param {Array<string>} targets A list of element IDs.
 * @param {function(Element)} fireEvents Function that fires events.
 */
function expectShortcutsOnTargets(shortcuts, targets, fireEvents) {
  for (var i = 0, ii = targets.length; i < ii; i++) {
    for (var j = 0, jj = shortcuts.length; j < jj; j++) {
      listener.shortcutFired(shortcuts[j]);
    }
    listener.$replay();
    fireEvents(goog.dom.getElement(targets[i]));
    listener.$verify();
    listener.$reset();
  }
}

function testIgnoreShortcutsExceptEnterInTextInputFields() {
  var targets = [
    'targetColor',
    'targetDate',
    'targetDateTime',
    'targetDateTimeLocal',
    'targetEmail',
    'targetMonth',
    'targetNumber',
    'targetPassword',
    'targetSearch',
    'targetTel',
    'targetText',
    'targetTime',
    'targetUrl',
    'targetWeek'
  ];
  registerEnterSpaceXF1AltY();
  expectShortcutsOnTargets(
      ['enter', 'global', 'withAlt'], targets, fireEnterSpaceXF1AltY);
}

function testIgnoreSpaceInCheckBoxAndButton() {
  registerEnterSpaceXF1AltY();
  expectShortcutsOnTargets(
      ['enter', 'x', 'global', 'withAlt'],
      ['targetCheckBox', 'targetButton'],
      fireEnterSpaceXF1AltY);
}

function testIgnoreNonGlobalShortcutsInContentEditable() {
  // Don't set design mode in later IE as javascripts don't run when in
  // that mode.
  var setDesignMode = !goog.userAgent.IE ||
      !goog.userAgent.isVersionOrHigher('9');
  try {
    if (setDesignMode) {
      document.designMode = 'on';
    }
    targetDiv.contentEditable = 'true';

    // Expect only global shortcuts.
    listener.shortcutFired('global');
    listener.$replay();

    registerEnterSpaceXF1AltY();
    fireEnterSpaceXF1AltY(targetDiv);

    listener.$verify();
  } finally {
    if (setDesignMode) {
      document.designMode = 'off';
    }
    targetDiv.contentEditable = 'false';
  }
}

function testSetAllShortcutsAreGlobal() {
  handler.setAllShortcutsAreGlobal(true);
  registerEnterSpaceXF1AltY();

  expectShortcutsOnTargets(
      ['enter', 'space', 'x', 'global', 'withAlt'], ['targetTextArea'],
      fireEnterSpaceXF1AltY);
}

function testSetModifierShortcutsAreGlobalFalse() {
  handler.setModifierShortcutsAreGlobal(false);
  registerEnterSpaceXF1AltY();

  expectShortcutsOnTargets(
      ['global'], ['targetTextArea'], fireEnterSpaceXF1AltY);
}

function testAltGraphKeyOnUSLayout() {
  // Windows does not assign printable characters to any ctrl+alt keys of
  // the US layout. This test verifies we fire shortcut events when typing
  // ctrl+alt keys on the US layout.
  listener.shortcutFired('letterOne');
  listener.shortcutFired('letterTwo');
  listener.shortcutFired('letterThree');
  listener.shortcutFired('letterFour');
  listener.shortcutFired('letterFive');
  if (goog.userAgent.WINDOWS && !goog.userAgent.GECKO) {
    listener.$replay();

    handler.registerShortcut('letterOne', 'ctrl+alt+1');
    handler.registerShortcut('letterTwo', 'ctrl+alt+2');
    handler.registerShortcut('letterThree', 'ctrl+alt+3');
    handler.registerShortcut('letterFour', 'ctrl+alt+4');
    handler.registerShortcut('letterFive', 'ctrl+alt+5');

    // Send key events on the English (United States) layout.
    fireAltGraphKey(KeyCodes.ONE, 0, {ctrlKey: true, altKey: true});
    fireAltGraphKey(KeyCodes.TWO, 0, {ctrlKey: true, altKey: true});
    fireAltGraphKey(KeyCodes.THREE, 0, {ctrlKey: true, altKey: true});
    fireAltGraphKey(KeyCodes.FOUR, 0, {ctrlKey: true, altKey: true});
    fireAltGraphKey(KeyCodes.FIVE, 0, {ctrlKey: true, altKey: true});

    listener.$verify();
  }
}

function testAltGraphKeyOnFrenchLayout() {
  // Windows assigns printable characters to ctrl+alt+[2-5] keys of the
  // French layout. This test verifies we fire shortcut events only when
  // we type ctrl+alt+1 keys on the French layout.
  listener.shortcutFired('letterOne');
  if (goog.userAgent.WINDOWS && !goog.userAgent.GECKO) {
    listener.$replay();

    handler.registerShortcut('letterOne', 'ctrl+alt+1');
    handler.registerShortcut('letterTwo', 'ctrl+alt+2');
    handler.registerShortcut('letterThree', 'ctrl+alt+3');
    handler.registerShortcut('letterFour', 'ctrl+alt+4');
    handler.registerShortcut('letterFive', 'ctrl+alt+5');

    // Send key events on the French (France) layout.
    fireAltGraphKey(KeyCodes.ONE, 0, {ctrlKey: true, altKey: true});
    fireAltGraphKey(KeyCodes.TWO, 0x0303, {ctrlKey: true, altKey: true});
    fireAltGraphKey(KeyCodes.THREE, 0x0023, {ctrlKey: true, altKey: true});
    fireAltGraphKey(KeyCodes.FOUR, 0x007b, {ctrlKey: true, altKey: true});
    fireAltGraphKey(KeyCodes.FIVE, 0x205b, {ctrlKey: true, altKey: true});

    listener.$verify();
  }
}

function testAltGraphKeyOnSpanishLayout() {
  // Windows assigns printable characters to ctrl+alt+[1-5] keys of the
  // Spanish layout. This test verifies we do not fire shortcut events at
  // all when typing ctrl+alt+[1-5] keys on the Spanish layout.
  if (goog.userAgent.WINDOWS && !goog.userAgent.GECKO) {
    listener.$replay();

    handler.registerShortcut('letterOne', 'ctrl+alt+1');
    handler.registerShortcut('letterTwo', 'ctrl+alt+2');
    handler.registerShortcut('letterThree', 'ctrl+alt+3');
    handler.registerShortcut('letterFour', 'ctrl+alt+4');
    handler.registerShortcut('letterFive', 'ctrl+alt+5');

    // Send key events on the Spanish (Spain) layout.
    fireAltGraphKey(KeyCodes.ONE, 0x007c, {ctrlKey: true, altKey: true});
    fireAltGraphKey(KeyCodes.TWO, 0x0040, {ctrlKey: true, altKey: true});
    fireAltGraphKey(KeyCodes.THREE, 0x0023, {ctrlKey: true, altKey: true});
    fireAltGraphKey(KeyCodes.FOUR, 0x0303, {ctrlKey: true, altKey: true});
    fireAltGraphKey(KeyCodes.FIVE, 0x20ac, {ctrlKey: true, altKey: true});

    listener.$verify();
  }
}

function testNumpadKeyShortcuts() {
  var testCases = [
    ['letterNumpad0', 'num-0', KeyCodes.NUM_ZERO],
    ['letterNumpad1', 'num-1', KeyCodes.NUM_ONE],
    ['letterNumpad2', 'num-2', KeyCodes.NUM_TWO],
    ['letterNumpad3', 'num-3', KeyCodes.NUM_THREE],
    ['letterNumpad4', 'num-4', KeyCodes.NUM_FOUR],
    ['letterNumpad5', 'num-5', KeyCodes.NUM_FIVE],
    ['letterNumpad6', 'num-6', KeyCodes.NUM_SIX],
    ['letterNumpad7', 'num-7', KeyCodes.NUM_SEVEN],
    ['letterNumpad8', 'num-8', KeyCodes.NUM_EIGHT],
    ['letterNumpad9', 'num-9', KeyCodes.NUM_NINE],
    ['letterNumpadMultiply', 'num-multiply', KeyCodes.NUM_MULTIPLY],
    ['letterNumpadPlus', 'num-plus', KeyCodes.NUM_PLUS],
    ['letterNumpadMinus', 'num-minus', KeyCodes.NUM_MINUS],
    ['letterNumpadPERIOD', 'num-period', KeyCodes.NUM_PERIOD],
    ['letterNumpadDIVISION', 'num-division', KeyCodes.NUM_DIVISION]
  ];
  for (var i = 0; i < testCases.length; ++i) {
    listener.shortcutFired(testCases[i][0]);
  }
  listener.$replay();

  // Register shortcuts for numpad keys and send numpad-key events.
  for (var i = 0; i < testCases.length; ++i) {
    handler.registerShortcut(testCases[i][0], testCases[i][1]);
    fire(testCases[i][2]);
  }
  listener.$verify();
}

function testGeckoShortcuts() {
  listener.shortcutFired('1');
  listener.$replay();

  handler.registerShortcut('1', 'semicolon');

  if (goog.userAgent.GECKO) {
    fire(goog.events.KeyCodes.FF_SEMICOLON);
  } else {
    fire(goog.events.KeyCodes.SEMICOLON);
  }

  listener.$verify();
}

function testRegisterShortcut_modifierOnly() {
  assertThrows('Registering a shortcut with just modifiers should fail.',
      goog.bind(handler.registerShortcut, handler, 'name', 'Shift'));
}

function testParseStringShortcut_unknownKey() {
  assertThrows('Unknown keys should fail.', goog.bind(
      goog.ui.KeyboardShortcutHandler.parseStringShortcut, null, 'NotAKey'));
}

// Regression test for failure to reset keyCode between strokes.
function testParseStringShortcut_resetKeyCode() {
  var strokes = goog.ui.KeyboardShortcutHandler.parseStringShortcut('A Shift');
  assertNull('The second stroke only has a modifier key.', strokes[1].keyCode);
}
