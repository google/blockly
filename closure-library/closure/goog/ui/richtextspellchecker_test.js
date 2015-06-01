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

goog.provide('goog.ui.RichTextSpellCheckerTest');
goog.setTestOnly('goog.ui.RichTextSpellCheckerTest');

goog.require('goog.dom.Range');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events.KeyCodes');
goog.require('goog.object');
goog.require('goog.spell.SpellCheck');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.RichTextSpellChecker');

var VOCABULARY = ['test', 'words', 'a', 'few'];
var SUGGESTIONS = ['foo', 'bar'];
var EXCLUDED_DATA = ['DIV.goog-quote', 'goog-comment', 'SPAN.goog-note'];


/**
 * Delay in ms needed for the spell check word lookup to finish. Finishing the
 * lookup also finishes the spell checking.
 * @see goog.spell.SpellCheck.LOOKUP_DELAY_
 */
var SPELL_CHECK_LOOKUP_DELAY = 100;

var TEST_TEXT1 = 'this test is longer than a few words now';
var TEST_TEXT2 = 'test another simple text with misspelled words';
var TEST_TEXT3 = 'test another simple text with misspelled words' +
    '<b class="goog-quote">test another simple text with misspelled words<u> ' +
    'test another simple text with misspelled words<del class="goog-quote"> ' +
    'test another simple text with misspelled words<i>this test is longer ' +
    'than a few words now</i>test another simple text with misspelled words ' +
    '<i>this test is longer than a few words now</i></del>test another ' +
    'simple text with misspelled words<del class="goog-quote">test another ' +
    'simple text with misspelled words<i>this test is longer than a few ' +
    'words now</i>test another simple text with misspelled words<i>this test ' +
    'is longer than a few words now</i></del></u>test another simple text ' +
    'with misspelled words<u>test another simple text with misspelled words' +
    '<del class="goog-quote">test another simple text with misspelled words' +
    '<i> thistest is longer than a few words now</i>test another simple text ' +
    'with misspelled words<i>this test is longer than a few words ' +
    'now</i></del>test another simple text with misspelled words' +
    '<del class="goog-quote">test another simple text with misspelled words' +
    '<i>this test is longer than a few words now</i>test another simple text ' +
    'with misspelled words<i>this test is longer than a few words ' +
    'now</i></del></u></b>';

var spellChecker;
var handler;
var mockClock;

function setUp() {
  mockClock = new goog.testing.MockClock(true /* install */);
  handler = new goog.spell.SpellCheck(localSpellCheckingFunction);
  spellChecker = new goog.ui.RichTextSpellChecker(handler);
}

function tearDown() {
  spellChecker.dispose();
  handler.dispose();
  mockClock.dispose();
}

function waitForSpellCheckToFinish() {
  mockClock.tick(SPELL_CHECK_LOOKUP_DELAY);
}


/**
 * Function to use for word lookup by the spell check handler. This function is
 * supplied as a constructor parameter for the spell check handler.
 * @param {!Array<string>} words Unknown words that need to be looked up.
 * @param {!goog.spell.SpellCheck} spellChecker The spell check handler.
 * @param {function(!Array.)} callback The lookup callback
 *     function.
 */
function localSpellCheckingFunction(words, spellChecker, callback) {
  var len = words.length;
  var results = [];
  for (var i = 0; i < len; i++) {
    var word = words[i];
    var found = false;
    for (var j = 0; j < VOCABULARY.length; ++j) {
      if (VOCABULARY[j] == word) {
        found = true;
        break;
      }
    }
    if (found) {
      results.push([word, goog.spell.SpellCheck.WordStatus.VALID]);
    } else {
      results.push([word, goog.spell.SpellCheck.WordStatus.INVALID,
        SUGGESTIONS]);
    }
  }
  callback.call(spellChecker, results);
}

function testDocumentIntegrity() {
  var el = document.getElementById('test1');
  spellChecker.decorate(el);
  el.appendChild(document.createTextNode(TEST_TEXT3));
  var el2 = el.cloneNode(true);

  spellChecker.setExcludeMarker('goog-quote');
  spellChecker.check();
  waitForSpellCheckToFinish();
  spellChecker.ignoreWord('iggnore');
  waitForSpellCheckToFinish();
  spellChecker.check();
  waitForSpellCheckToFinish();
  spellChecker.resume();
  waitForSpellCheckToFinish();

  assertEquals('Spell checker run should not change the underlying element.',
               el2.innerHTML, el.innerHTML);
}

function testExcludeMarkers() {
  var el = document.getElementById('test1');
  spellChecker.decorate(el);
  spellChecker.setExcludeMarker(
      ['DIV.goog-quote', 'goog-comment', 'SPAN.goog-note']);
  assertArrayEquals(['goog-quote', 'goog-comment', 'goog-note'],
      spellChecker.excludeMarker);
  assertArrayEquals([goog.dom.TagName.DIV, undefined, goog.dom.TagName.SPAN],
      spellChecker.excludeTags);
  el.innerHTML = '<div class="goog-quote">misspelling</div>' +
      '<div class="goog-yes">misspelling</div>' +
      '<div class="goog-note">misspelling</div>' +
      '<div class="goog-comment">misspelling</div>' +
      '<span>misspelling<span>';

  spellChecker.check();
  waitForSpellCheckToFinish();
  assertEquals(3, spellChecker.getLastIndex());
}

function testBiggerDocument() {
  var el = document.getElementById('test2');
  spellChecker.decorate(el);
  el.appendChild(document.createTextNode(TEST_TEXT3));
  var el2 = el.cloneNode(true);

  spellChecker.check();
  waitForSpellCheckToFinish();
  spellChecker.resume();
  waitForSpellCheckToFinish();

  assertEquals('Spell checker run should not change the underlying element.',
               el2.innerHTML, el.innerHTML);
}

function testElementOverflow() {
  var el = document.getElementById('test3');
  spellChecker.decorate(el);
  el.appendChild(document.createTextNode(TEST_TEXT3));

  var el2 = el.cloneNode(true);

  spellChecker.check();
  waitForSpellCheckToFinish();
  spellChecker.check();
  waitForSpellCheckToFinish();
  spellChecker.resume();
  waitForSpellCheckToFinish();

  assertEquals('Spell checker run should not change the underlying element.',
               el2.innerHTML, el.innerHTML);
}

function testKeyboardNavigateNext() {
  var el = document.getElementById('test4');
  spellChecker.decorate(el);
  var text = 'a unit test for keyboard test';
  el.appendChild(document.createTextNode(text));
  var keyEventProperties =
      goog.object.create('ctrlKey', true, 'shiftKey', false);

  spellChecker.check();
  waitForSpellCheckToFinish();

  // First call just moves focus to first misspelled word.
  goog.testing.events.fireKeySequence(el, goog.events.KeyCodes.RIGHT,
      keyEventProperties);

  // Test moving from first to second mispelled word.
  var defaultExecuted = goog.testing.events.fireKeySequence(el,
      goog.events.KeyCodes.RIGHT, keyEventProperties);

  assertFalse('The default action should be prevented for the key event',
      defaultExecuted);
  assertCursorAtElement(spellChecker.makeElementId(2));

  spellChecker.resume();
}

function testKeyboardNavigateNextOnLastWord() {
  var el = document.getElementById('test5');
  spellChecker.decorate(el);
  var text = 'a unit test for keyboard test';
  el.appendChild(document.createTextNode(text));
  var keyEventProperties =
      goog.object.create('ctrlKey', true, 'shiftKey', false);

  spellChecker.check();
  waitForSpellCheckToFinish();

  // Move to the last invalid word.
  goog.testing.events.fireKeySequence(el, goog.events.KeyCodes.RIGHT,
      keyEventProperties);
  goog.testing.events.fireKeySequence(el, goog.events.KeyCodes.RIGHT,
      keyEventProperties);
  goog.testing.events.fireKeySequence(el, goog.events.KeyCodes.RIGHT,
      keyEventProperties);

  // Test moving to the next invalid word. Should have no effect.
  var defaultExecuted = goog.testing.events.fireKeySequence(el,
      goog.events.KeyCodes.RIGHT, keyEventProperties);

  assertFalse('The default action should be prevented for the key event',
      defaultExecuted);
  assertCursorAtElement(spellChecker.makeElementId(3));

  spellChecker.resume();
}

function testKeyboardNavigateOpenSuggestions() {
  var el = document.getElementById('test6');
  spellChecker.decorate(el);
  var text = 'unit';
  el.appendChild(document.createTextNode(text));
  var keyEventProperties =
      goog.object.create('ctrlKey', true, 'shiftKey', false);

  spellChecker.check();
  waitForSpellCheckToFinish();

  var suggestionMenu = spellChecker.getMenu();

  goog.testing.events.fireKeySequence(el, goog.events.KeyCodes.RIGHT,
      keyEventProperties);

  assertFalse('The suggestion menu should not be visible yet.',
      suggestionMenu.isVisible());

  keyEventProperties.ctrlKey = false;
  var defaultExecuted = goog.testing.events.fireKeySequence(el,
      goog.events.KeyCodes.DOWN, keyEventProperties);

  assertFalse('The default action should be prevented for the key event',
      defaultExecuted);
  assertTrue('The suggestion menu should be visible after the key event.',
      suggestionMenu.isVisible());

  spellChecker.resume();
}

function testKeyboardNavigatePrevious() {
  var el = document.getElementById('test7');
  spellChecker.decorate(el);
  var text = 'a unit test for keyboard test';
  el.appendChild(document.createTextNode(text));
  var keyEventProperties =
      goog.object.create('ctrlKey', true, 'shiftKey', false);

  spellChecker.check();
  waitForSpellCheckToFinish();

  // Move to the third element, so we can test the move back to the second.
  goog.testing.events.fireKeySequence(el, goog.events.KeyCodes.RIGHT,
      keyEventProperties);
  goog.testing.events.fireKeySequence(el, goog.events.KeyCodes.RIGHT,
      keyEventProperties);
  goog.testing.events.fireKeySequence(el, goog.events.KeyCodes.RIGHT,
      keyEventProperties);

  var defaultExecuted = goog.testing.events.fireKeySequence(el,
      goog.events.KeyCodes.LEFT, keyEventProperties);

  assertFalse('The default action should be prevented for the key event',
      defaultExecuted);
  assertCursorAtElement(spellChecker.makeElementId(2));

  spellChecker.resume();
}

function testKeyboardNavigatePreviousOnLastWord() {
  var el = document.getElementById('test8');
  spellChecker.decorate(el);
  var text = 'a unit test for keyboard test';
  el.appendChild(document.createTextNode(text));
  var keyEventProperties =
      goog.object.create('ctrlKey', true, 'shiftKey', false);

  spellChecker.check();
  waitForSpellCheckToFinish();

  // Move to the first invalid word.
  goog.testing.events.fireKeySequence(el, goog.events.KeyCodes.RIGHT,
      keyEventProperties);

  // Test moving to the previous invalid word. Should have no effect.
  var defaultExecuted = goog.testing.events.fireKeySequence(el,
      goog.events.KeyCodes.LEFT, keyEventProperties);

  assertFalse('The default action should be prevented for the key event',
      defaultExecuted);
  assertCursorAtElement(spellChecker.makeElementId(1));

  spellChecker.resume();
}

function assertCursorAtElement(expectedId) {
  var range = goog.dom.Range.createFromWindow();

  if (isCaret(range)) {
    if (isMisspelledWordElement(range.getStartNode())) {
      var focusedElementId = range.getStartNode().id;
    }

    // In Chrome a cursor at the start of a misspelled word will appear to be at
    // the end of the text node preceding it.
    if (isCursorAtEndOfStartNode(range) &&
        range.getStartNode().nextSibling != null &&
        isMisspelledWordElement(range.getStartNode().nextSibling)) {
      var focusedElementId = range.getStartNode().nextSibling.id;
    }
  }

  assertEquals('The cursor is not at the expected misspelled word.',
      expectedId, focusedElementId);
}

function isCaret(range) {
  return range.getStartNode() == range.getEndNode();
}

function isMisspelledWordElement(element) {
  return goog.dom.classlist.contains(
      element, 'goog-spellcheck-word');
}

function isCursorAtEndOfStartNode(range) {
  return range.getStartNode().length == range.getStartOffset();
}
