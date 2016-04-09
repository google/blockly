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

goog.provide('goog.labs.testing.stringMatcherTest');
goog.setTestOnly('goog.labs.testing.stringMatcherTest');

goog.require('goog.labs.testing.MatcherError');
/** @suppress {extraRequire} */
goog.require('goog.labs.testing.StringContainsInOrderMatcher');
goog.require('goog.labs.testing.assertThat');
goog.require('goog.testing.jsunit');

function testContainsString() {
  goog.labs.testing.assertThat(
      'hello', containsString('ell'), 'hello contains ell');

  assertMatcherError(function() {
    goog.labs.testing.assertThat('hello', containsString('world!'));
  }, 'containsString should throw exception when it fails');
}

function testEndsWith() {
  goog.labs.testing.assertThat('hello', endsWith('llo'), 'hello ends with llo');

  assertMatcherError(function() {
    goog.labs.testing.assertThat('minutes', endsWith('midnight'));
  }, 'endsWith should throw exception when it fails');
}

function testEqualToIgnoringWhitespace() {
  goog.labs.testing.assertThat(
      '    h\n   EL L\tO', equalToIgnoringWhitespace('h el l o'),
      '"   h   EL L\tO   " is equal to "h el l o"');

  assertMatcherError(function() {
    goog.labs.testing.assertThat('hybrid', equalToIgnoringWhitespace('theory'));
  }, 'equalToIgnoringWhitespace should throw exception when it fails');
}

function testEquals() {
  goog.labs.testing.assertThat('hello', equals('hello'), 'hello equals hello');

  assertMatcherError(function() {
    goog.labs.testing.assertThat('thousand', equals('suns'));
  }, 'equals should throw exception when it fails');
}

function testStartsWith() {
  goog.labs.testing.assertThat(
      'hello', startsWith('hel'), 'hello starts with hel');

  assertMatcherError(function() {
    goog.labs.testing.assertThat('linkin', startsWith('park'));
  }, 'startsWith should throw exception when it fails');
}

function testStringContainsInOrder() {
  goog.labs.testing.assertThat(
      'hello', stringContainsInOrder(['h', 'el', 'el', 'l', 'o']),
      'hello contains in order: [h, el, l, o]');

  assertMatcherError(function() {
    goog.labs.testing.assertThat(
        'hybrid', stringContainsInOrder(['hy', 'brid', 'theory']));
  }, 'stringContainsInOrder should throw exception when it fails');
}

function testMatchesRegex() {
  goog.labs.testing.assertThat('foobar', matchesRegex(/foobar/));
  goog.labs.testing.assertThat('foobar', matchesRegex(/oobar/));

  assertMatcherError(function() {
    goog.labs.testing.assertThat('foo', matchesRegex(/^foobar$/));
  }, 'matchesRegex should throw exception when it fails');
}

function assertMatcherError(callable, errorString) {
  var e = assertThrows(errorString || 'callable throws exception', callable);
  assertTrue(e instanceof goog.labs.testing.MatcherError);
}
