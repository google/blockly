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

goog.provide('goog.spell.SpellCheckTest');
goog.setTestOnly('goog.spell.SpellCheckTest');

goog.require('goog.spell.SpellCheck');
goog.require('goog.testing.jsunit');

var TEST_DATA = {
  'Test': [goog.spell.SpellCheck.WordStatus.VALID, []],
  'strnig': [goog.spell.SpellCheck.WordStatus.INVALID, []],
  'wtih': [goog.spell.SpellCheck.WordStatus.INVALID, []],
  'a': [goog.spell.SpellCheck.WordStatus.VALID, []],
  'few': [goog.spell.SpellCheck.WordStatus.VALID, []],
  'misspeled': [goog.spell.SpellCheck.WordStatus.INVALID,
    ['misspelled', 'misapplied', 'misspell']],
  'words': [goog.spell.SpellCheck.WordStatus.VALID, []],
  'Testing': [goog.spell.SpellCheck.WordStatus.VALID, []],
  'set': [goog.spell.SpellCheck.WordStatus.VALID, []],
  'status': [goog.spell.SpellCheck.WordStatus.VALID, []],
  'vaild': [goog.spell.SpellCheck.WordStatus.INVALID, []],
  'invalid': [goog.spell.SpellCheck.WordStatus.VALID, []],
  'ignoerd': [goog.spell.SpellCheck.WordStatus.INVALID, []]
};

function mockSpellCheckingFunction(words, spellChecker, callback) {
  var len = words.length;
  var data = [];
  for (var i = 0; i < len; i++) {
    var word = words[i];
    var status = TEST_DATA[word][0];
    var suggestions = TEST_DATA[word][1];
    data.push([word, status, suggestions]);
  }
  callback.call(spellChecker, data);
}


function testWordMatching() {
  var spell = new goog.spell.SpellCheck(mockSpellCheckingFunction);

  var valid = goog.spell.SpellCheck.WordStatus.VALID;
  var invalid = goog.spell.SpellCheck.WordStatus.INVALID;

  spell.checkBlock('Test strnig wtih a few misspeled words.');
  assertEquals(valid, spell.checkWord('Test'));
  assertEquals(invalid, spell.checkWord('strnig'));
  assertEquals(invalid, spell.checkWord('wtih'));
  assertEquals(valid, spell.checkWord('a'));
  assertEquals(valid, spell.checkWord('few'));
  assertEquals(invalid, spell.checkWord('misspeled'));
  assertEquals(valid, spell.checkWord('words'));
}


function testSetWordStatusValid() {
  var spell = new goog.spell.SpellCheck(mockSpellCheckingFunction);

  var valid = goog.spell.SpellCheck.WordStatus.VALID;

  spell.checkBlock('Testing set status vaild.');
  spell.setWordStatus('vaild', valid);

  assertEquals(valid, spell.checkWord('vaild'));
}

function testSetWordStatusInvalid() {
  var spell = new goog.spell.SpellCheck(mockSpellCheckingFunction);

  var valid = goog.spell.SpellCheck.WordStatus.VALID;
  var invalid = goog.spell.SpellCheck.WordStatus.INVALID;

  spell.checkBlock('Testing set status invalid.');
  spell.setWordStatus('invalid', invalid);

  assertEquals(invalid, spell.checkWord('invalid'));
}


function testSetWordStatusIgnored() {
  var spell = new goog.spell.SpellCheck(mockSpellCheckingFunction);

  var ignored = goog.spell.SpellCheck.WordStatus.IGNORED;

  spell.checkBlock('Testing set status ignoerd.');
  spell.setWordStatus('ignoerd', ignored);

  assertEquals(ignored, spell.checkWord('ignoerd'));
}


function testGetSuggestions() {
  var spell = new goog.spell.SpellCheck(mockSpellCheckingFunction);

  spell.checkBlock('Test strnig wtih a few misspeled words.');
  var suggestions = spell.getSuggestions('misspeled');
  assertEquals(3, suggestions.length);
}
