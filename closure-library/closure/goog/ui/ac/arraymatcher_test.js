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

goog.provide('goog.ui.ac.ArrayMatcherTest');
goog.setTestOnly('goog.ui.ac.ArrayMatcherTest');

goog.require('goog.testing.jsunit');
goog.require('goog.ui.ac.ArrayMatcher');

var ArrayMatcher = goog.ui.ac.ArrayMatcher;

function testRequestingRows() {
  var items = ['a', 'Ab', 'abc', 'ba', 'ca'];
  var am = new ArrayMatcher(items, true);

  var res;
  function matcher(token, matches) {
    assertEquals('a', token);
    res = matches;
    assertEquals('Should have three matches', 3, matches.length);
    assertEquals('a', matches[0]);
    assertEquals('Ab', matches[1]);
    assertEquals('abc', matches[2]);
  }

  am.requestMatchingRows('a', 10, matcher);
  var res2 = goog.ui.ac.ArrayMatcher.getMatchesForRows('a', 10, items);
  assertArrayEquals(res, res2);
}

function testRequestingRowsMaxMatches() {
  var items = ['a', 'Ab', 'abc', 'ba', 'ca'];
  var am = new ArrayMatcher(items, true);

  function matcher(token, matches) {
    assertEquals('a', token);
    assertEquals('Should have two matches', 2, matches.length);
    assertEquals('a', matches[0]);
    assertEquals('Ab', matches[1]);
  }

  am.requestMatchingRows('a', 2, matcher);
}

function testRequestingRowsSimilarMatches() {
  // No prefix matches so use similar
  var items = ['b', 'c', 'ba', 'ca'];
  var am = new ArrayMatcher(items, false);

  function matcher(token, matches) {
    assertEquals('a', token);
    assertEquals('Should have two matches', 2, matches.length);
    assertEquals('ba', matches[0]);
    assertEquals('ca', matches[1]);
  }

  am.requestMatchingRows('a', 10, matcher);
}

function testRequestingRowsSimilarMatchesMaxMatches() {
  // No prefix matches so use similar
  var items = ['b', 'c', 'ba', 'ca'];
  var am = new ArrayMatcher(items, false);

  function matcher(token, matches) {
    assertEquals('a', token);
    assertEquals('Should have one match', 1, matches.length);
    assertEquals('ba', matches[0]);
  }

  am.requestMatchingRows('a', 1, matcher);
}

function testGetPrefixMatches() {
  var items = ['a', 'b', 'c'];
  var am = new ArrayMatcher(items, true);

  var res = am.getPrefixMatches('a', 10);
  assertEquals('Should have one match', 1, res.length);
  assertEquals('Should return \'a\'', 'a', res[0]);
  var res2 = goog.ui.ac.ArrayMatcher.getPrefixMatchesForRows('a', 10, items);
  assertArrayEquals(res, res2);
}

function testGetPrefixMatchesMaxMatches() {
  var items = ['a', 'Ab', 'abc', 'ba', 'ca'];
  var am = new ArrayMatcher(items, true);

  var res = am.getPrefixMatches('a', 2);
  assertEquals('Should have two matches', 2, res.length);
  assertEquals('a', res[0]);
}

function testGetPrefixMatchesEmptyToken() {
  var items = ['a', 'b', 'c'];
  var am = new ArrayMatcher(items, true);

  var res = am.getPrefixMatches('', 10);
  assertEquals('Should have no matches', 0, res.length);
}

function testGetSimilarRowsSimple() {
  var items = ['xa', 'xb', 'xc'];
  var am = new ArrayMatcher(items, true);

  var res = am.getSimilarRows('a', 10);
  assertEquals('Should have one match', 1, res.length);
  assertEquals('xa', res[0]);
  var res2 = goog.ui.ac.ArrayMatcher.getSimilarMatchesForRows('a', 10, items);
  assertArrayEquals(res, res2);
}

function testGetSimilarRowsMaxMatches() {
  var items = ['xa', 'xAa', 'xaAa'];
  var am = new ArrayMatcher(items, true);

  var res = am.getSimilarRows('a', 2);
  assertEquals('Should have two matches', 2, res.length);
  assertEquals('xa', res[0]);
  assertEquals('xAa', res[1]);
}

function testGetSimilarRowsTermDistance() {
  var items = ['surgeon', 'pleasantly', 'closely', 'ba'];
  var am = new ArrayMatcher(items, true);

  var res = am.getSimilarRows('urgently', 4);
  assertEquals('Should have one match', 1, res.length);
  assertEquals('surgeon', res[0]);

  var res2 = ArrayMatcher.getSimilarMatchesForRows('urgently', 4, items);
  assertArrayEquals(res, res2);
}

function testGetSimilarRowsContainedTerms() {
  var items = ['application', 'apple', 'happy'];
  var am = new ArrayMatcher(items, true);
  var res = am.getSimilarRows('app', 4);
  assertEquals('Should have three matches', 3, res.length);
  assertEquals('application', res[0]);
  assertEquals('apple', res[1]);
  assertEquals('happy', res[2]);

  var res2 = ArrayMatcher.getSimilarMatchesForRows('app', 4, items);
  assertArrayEquals(res, res2);
}
