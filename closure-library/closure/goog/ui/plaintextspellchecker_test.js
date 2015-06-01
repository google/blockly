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

goog.provide('goog.ui.PlainTextSpellCheckerTest');
goog.setTestOnly('goog.ui.PlainTextSpellCheckerTest');

goog.require('goog.Timer');
goog.require('goog.dom');
goog.require('goog.events.KeyCodes');
goog.require('goog.spell.SpellCheck');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.PlainTextSpellChecker');

var missspelling = 'missspelling';
var iggnore = 'iggnore';
var vocabulary = ['test', 'words', 'a', 'few', missspelling, iggnore];

// We don't use Math.random() to make test predictable. Math.random is not
// repeatable, so a success on the dev machine != success in the lab (or on
// other dev machines). This is the same pseudorandom logic that CRT rand()
// uses.
var rseed = 1;
function random(range) {
  rseed = (rseed * 1103515245 + 12345) & 0xffffffff;
  return ((rseed >> 16) & 0x7fff) % range;
}

function localSpellCheckingFunction(words, spellChecker, callback) {
  var len = words.length;
  var results = [];
  for (var i = 0; i < len; i++) {
    var word = words[i];
    var found = false;
    // Last two words are considered misspellings
    for (var j = 0; j < vocabulary.length - 2; ++j) {
      if (vocabulary[j] == word) {
        found = true;
        break;
      }
    }
    if (found) {
      results.push([word, goog.spell.SpellCheck.WordStatus.VALID]);
    } else {
      results.push([word, goog.spell.SpellCheck.WordStatus.INVALID,
        ['foo', 'bar']]);
    }
  }
  callback.call(spellChecker, results);
}

function generateRandomSpace() {
  var string = '';
  var nSpace = 1 + random(4);
  for (var i = 0; i < nSpace; ++i) {
    string += ' ';
  }
  return string;
}

function generateRandomString(maxWords, doQuotes) {
  var x = random(10);
  var string = '';
  if (doQuotes) {
    if (x == 0) {
      string = 'On xxxxx yyyy wrote:\n> ';
    } else if (x < 3) {
      string = '> ';
    }
  }

  var nWords = 1 + random(maxWords);
  for (var i = 0; i < nWords; ++i) {
    string += vocabulary[random(vocabulary.length)];
    string += generateRandomSpace();
  }
  return string;
}

var timerQueue = [];
function processTimerQueue() {
  while (timerQueue.length > 0) {
    var fn = timerQueue.shift();
    fn();
  }
}

function localTimer(fn, delay, obj) {
  if (obj) {
    fn = goog.bind(fn, obj);
  }
  timerQueue.push(fn);
  return timerQueue.length;
}

function testPlainTextSpellCheckerNoQuotes() {
  var handler = new goog.spell.SpellCheck(localSpellCheckingFunction);
  var s = new goog.ui.PlainTextSpellChecker(handler);
  s.asyncWordsPerBatch_ = 100;
  var el = document.getElementById('test1');
  s.decorate(el);
  var text = '';
  for (var i = 0; i < 10; ++i) {
    text += generateRandomString(10, false) + '\n';
  }
  el.value = text;
  // Yes this looks bizzare. This is for '\n' processing.
  // They get converted to CRLF as part of the above statement.
  text = el.value;

  var timerSav = goog.Timer.callOnce;
  goog.Timer.callOnce = localTimer;

  s.check();
  processTimerQueue();
  s.ignoreWord(iggnore);
  processTimerQueue();
  s.check();
  processTimerQueue();
  s.resume();
  processTimerQueue();

  goog.Timer.callOnce = timerSav;

  assertEquals('Spell checker run should not change the underlying element.',
               text, el.value);
  s.dispose();
}

function testPlainTextSpellCheckerWithQuotes() {
  var handler = new goog.spell.SpellCheck(localSpellCheckingFunction);
  var s = new goog.ui.PlainTextSpellChecker(handler);
  s.asyncWordsPerBatch_ = 100;
  var el = document.getElementById('test2');
  s.decorate(el);
  var text = '';
  for (var i = 0; i < 10; ++i) {
    text += generateRandomString(10, true) + '\n';
  }
  el.value = text;
  // Yes this looks bizzare. This is for '\n' processing.
  // They get converted to CRLF as part of the above statement.
  text = el.value;

  var timerSav = goog.Timer.callOnce;
  goog.Timer.callOnce = localTimer;

  s.setExcludeMarker(new RegExp('\nOn .* wrote:\n(> .*\n)+|\n(> .*\n)', 'g'));
  s.check();
  processTimerQueue();
  s.ignoreWord(iggnore);
  processTimerQueue();
  s.check();
  processTimerQueue();
  s.resume();
  processTimerQueue();

  goog.Timer.callOnce = timerSav;

  assertEquals('Spell checker run should not change the underlying element.',
               text, el.value);
  s.dispose();
}

function testPlainTextSpellCheckerWordReplacement() {
  var handler = new goog.spell.SpellCheck(localSpellCheckingFunction);
  var s = new goog.ui.PlainTextSpellChecker(handler);
  s.asyncWordsPerBatch_ = 100;
  var el = document.getElementById('test3');
  s.decorate(el);
  var text = '';
  for (var i = 0; i < 10; ++i) {
    text += generateRandomString(10, false) + '\n';
  }
  el.value = text;

  var timerSav = goog.Timer.callOnce;
  goog.Timer.callOnce = localTimer;

  s.check();
  processTimerQueue();

  var container = s.overlay_;
  var wordEl = container.firstChild;
  while (wordEl) {
    if (goog.dom.getTextContent(wordEl) == missspelling) {
      break;
    }
    wordEl = wordEl.nextSibling;
  }

  if (!wordEl) {
    assertTrue('Cannot find the world that should have been here.' +
               'Please revise the test', false);
    return;
  }

  s.activeWord_ = missspelling;
  s.activeElement_ = wordEl;
  var suggestions = s.getSuggestions_();
  s.replaceWord(wordEl, missspelling, 'foo');
  assertEquals('Should have set the original word attribute!',
      wordEl.getAttribute(goog.ui.AbstractSpellChecker.ORIGINAL_),
      missspelling);

  s.activeWord_ = goog.dom.getTextContent(wordEl);
  s.activeElement_ = wordEl;
  var newSuggestions = s.getSuggestions_();
  assertEquals('Suggestion list should still be present even if the word ' +
      'is now correct!', suggestions, newSuggestions);

  s.resume();
  processTimerQueue();

  goog.Timer.callOnce = timerSav;
  s.dispose();
}


function testPlainTextSpellCheckerKeyboardNavigateNext() {
  var handler = new goog.spell.SpellCheck(localSpellCheckingFunction);
  var s = new goog.ui.PlainTextSpellChecker(handler);
  var el = document.getElementById('test4');
  s.decorate(el);
  var text = 'a unit test for keyboard test';
  el.value = text;
  var keyEventProperties = {};
  keyEventProperties.ctrlKey = true;
  keyEventProperties.shiftKey = false;

  var timerSav = goog.Timer.callOnce;
  goog.Timer.callOnce = localTimer;

  s.check();
  processTimerQueue();

  var container = s.overlay_;

  // First call just moves focus to first misspelled word.
  goog.testing.events.fireKeySequence(container, goog.events.KeyCodes.RIGHT,
      keyEventProperties);

  // Test moving from first to second mispelled word.
  var defaultExecuted = goog.testing.events.fireKeySequence(container,
      goog.events.KeyCodes.RIGHT, keyEventProperties);

  assertFalse('The default action should be prevented for the key event',
      defaultExecuted);
  assertEquals('The second misspelled word should have focus.',
      document.activeElement, container.children[1]);

  s.resume();
  processTimerQueue();

  goog.Timer.callOnce = timerSav;
  s.dispose();
}


function testPlainTextSpellCheckerKeyboardNavigateNextOnLastWord() {
  var handler = new goog.spell.SpellCheck(localSpellCheckingFunction);
  var s = new goog.ui.PlainTextSpellChecker(handler);
  var el = document.getElementById('test5');
  s.decorate(el);
  var text = 'a unit test for keyboard test';
  el.value = text;
  var keyEventProperties = {};
  keyEventProperties.ctrlKey = true;
  keyEventProperties.shiftKey = false;

  var timerSav = goog.Timer.callOnce;
  goog.Timer.callOnce = localTimer;

  s.check();
  processTimerQueue();

  var container = s.overlay_;

  // First call just moves focus to first misspelled word.
  goog.testing.events.fireKeySequence(container, goog.events.KeyCodes.RIGHT,
      keyEventProperties);
  goog.testing.events.fireKeySequence(container, goog.events.KeyCodes.RIGHT,
      keyEventProperties);
  goog.testing.events.fireKeySequence(container, goog.events.KeyCodes.RIGHT,
      keyEventProperties);

  // Test moving to the next invalid word.
  var defaultExecuted = goog.testing.events.fireKeySequence(container,
      goog.events.KeyCodes.RIGHT, keyEventProperties);

  assertFalse('The default action should be prevented for the key event',
      defaultExecuted);
  assertEquals('The third/last misspelled word should have focus.',
      document.activeElement, container.children[2]);

  s.resume();
  processTimerQueue();

  goog.Timer.callOnce = timerSav;
  s.dispose();
}


function testPlainTextSpellCheckerKeyboardNavigateOpenSuggestions() {
  var handler = new goog.spell.SpellCheck(localSpellCheckingFunction);
  var s = new goog.ui.PlainTextSpellChecker(handler);
  var el = document.getElementById('test6');
  s.decorate(el);
  var text = 'unit';
  el.value = text;
  var keyEventProperties = {};
  keyEventProperties.ctrlKey = true;
  keyEventProperties.shiftKey = false;

  var timerSav = goog.Timer.callOnce;
  goog.Timer.callOnce = localTimer;

  s.check();
  processTimerQueue();

  var container = s.overlay_;
  var suggestionMenu = s.getMenu();

  goog.testing.events.fireKeySequence(container, goog.events.KeyCodes.RIGHT,
      keyEventProperties);

  assertFalse('The suggestion menu should not be visible yet.',
      suggestionMenu.isVisible());

  keyEventProperties.ctrlKey = false;
  var defaultExecuted = goog.testing.events.fireKeySequence(container,
      goog.events.KeyCodes.DOWN, keyEventProperties);

  assertFalse('The default action should be prevented for the key event',
      defaultExecuted);
  assertTrue('The suggestion menu should be visible after the key event.',
      suggestionMenu.isVisible());

  s.resume();
  processTimerQueue();

  goog.Timer.callOnce = timerSav;
  s.dispose();
}


function testPlainTextSpellCheckerKeyboardNavigatePrevious() {
  var handler = new goog.spell.SpellCheck(localSpellCheckingFunction);
  var s = new goog.ui.PlainTextSpellChecker(handler);
  var el = document.getElementById('test7');
  s.decorate(el);
  var text = 'a unit test for keyboard test';
  el.value = text;
  var keyEventProperties = {};
  keyEventProperties.ctrlKey = true;
  keyEventProperties.shiftKey = false;

  var timerSav = goog.Timer.callOnce;
  goog.Timer.callOnce = localTimer;

  s.check();
  processTimerQueue();

  var container = s.overlay_;

  // Move to the third element, so we can test the move back to the second.
  goog.testing.events.fireKeySequence(container, goog.events.KeyCodes.RIGHT,
      keyEventProperties);
  goog.testing.events.fireKeySequence(container, goog.events.KeyCodes.RIGHT,
      keyEventProperties);
  goog.testing.events.fireKeySequence(container, goog.events.KeyCodes.RIGHT,
      keyEventProperties);

  // Test moving from third to second mispelled word.
  var defaultExecuted = goog.testing.events.fireKeySequence(container,
      goog.events.KeyCodes.LEFT, keyEventProperties);

  assertFalse('The default action should be prevented for the key event',
      defaultExecuted);
  assertEquals('The second misspelled word should have focus.',
      document.activeElement, container.children[1]);

  s.resume();
  processTimerQueue();

  goog.Timer.callOnce = timerSav;
  s.dispose();
}


function testPlainTextSpellCheckerKeyboardNavigatePreviousOnFirstWord() {
  var handler = new goog.spell.SpellCheck(localSpellCheckingFunction);
  var s = new goog.ui.PlainTextSpellChecker(handler);
  var el = document.getElementById('test8');
  s.decorate(el);
  var text = 'a unit test for keyboard test';
  el.value = text;
  var keyEventProperties = {};
  keyEventProperties.ctrlKey = true;
  keyEventProperties.shiftKey = false;

  var timerSav = goog.Timer.callOnce;
  goog.Timer.callOnce = localTimer;

  s.check();
  processTimerQueue();

  var container = s.overlay_;

  // Move to the first invalid word.
  goog.testing.events.fireKeySequence(container, goog.events.KeyCodes.RIGHT,
      keyEventProperties);

  // Test moving to the previous invalid word.
  var defaultExecuted = goog.testing.events.fireKeySequence(container,
      goog.events.KeyCodes.LEFT, keyEventProperties);

  assertFalse('The default action should be prevented for the key event',
      defaultExecuted);
  assertEquals('The first misspelled word should have focus.',
      document.activeElement, container.children[0]);

  s.resume();
  processTimerQueue();

  goog.Timer.callOnce = timerSav;
  s.dispose();
}
