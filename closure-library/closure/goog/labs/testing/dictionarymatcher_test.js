// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.labs.testing.dictionaryMatcherTest');
goog.setTestOnly('goog.labs.testing.dictionaryMatcherTest');

/** @suppress {extraRequire} */
goog.require('goog.labs.testing.HasEntryMatcher');
goog.require('goog.labs.testing.MatcherError');
goog.require('goog.labs.testing.assertThat');
goog.require('goog.testing.jsunit');

function testHasEntries() {
  var obj1 = {x: 1, y: 2, z: 3};
  goog.labs.testing.assertThat(
      obj1, hasEntries({x: 1, y: 2}), 'obj1 has entries: {x:1, y:2}');

  assertMatcherError(function() {
    goog.labs.testing.assertThat(obj1, hasEntries({z: 5, a: 4}));
  }, 'hasEntries should throw exception when it fails');
}

function testHasEntry() {
  var obj1 = {x: 1, y: 2, z: 3};
  goog.labs.testing.assertThat(obj1, hasEntry('x', 1), 'obj1 has entry: {x:1}');

  assertMatcherError(function() {
    goog.labs.testing.assertThat(obj1, hasEntry('z', 5));
  }, 'hasEntry should throw exception when it fails');
}

function testHasKey() {
  var obj1 = {x: 1};
  goog.labs.testing.assertThat(obj1, hasKey('x'), 'obj1 has key x');

  assertMatcherError(function() {
    goog.labs.testing.assertThat(obj1, hasKey('z'));
  }, 'hasKey should throw exception when it fails');
}

function testHasValue() {
  var obj1 = {x: 1};
  goog.labs.testing.assertThat(obj1, hasValue(1), 'obj1 has value 1');

  assertMatcherError(function() {
    goog.labs.testing.assertThat(obj1, hasValue(2));
  }, 'hasValue should throw exception when it fails');
}

function assertMatcherError(callable, errorString) {
  var e = assertThrows(errorString || 'callable throws exception', callable);
  assertTrue(e instanceof goog.labs.testing.MatcherError);
}
