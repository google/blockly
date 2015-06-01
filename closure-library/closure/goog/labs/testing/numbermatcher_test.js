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

goog.provide('goog.labs.testing.numberMatcherTest');
goog.setTestOnly('goog.labs.testing.numberMatcherTest');

/** @suppress {extraRequire} */
goog.require('goog.labs.testing.LessThanMatcher');
goog.require('goog.labs.testing.MatcherError');
goog.require('goog.labs.testing.assertThat');
goog.require('goog.testing.jsunit');

function testGreaterThan() {
  goog.labs.testing.assertThat(4, greaterThan(3), '4 > 3');
  assertMatcherError(function() {
    goog.labs.testing.assertThat(2, greaterThan(3));
  }, '2 > 3');
}

function testGreaterThanEqualTo() {
  goog.labs.testing.assertThat(5, greaterThanEqualTo(4), '5 >= 4');
  goog.labs.testing.assertThat(5, greaterThanEqualTo(5), '5 >= 5');
  assertMatcherError(function() {
    goog.labs.testing.assertThat(3, greaterThanEqualTo(5));
  }, '3 >= 5');
}

function testLessThan() {
  goog.labs.testing.assertThat(6, lessThan(7), '6 < 7');
  assertMatcherError(function() {
    goog.labs.testing.assertThat(7, lessThan(5));
  }, '7 < 5');
}

function testLessThanEqualTo() {
  goog.labs.testing.assertThat(8, lessThanEqualTo(8), '8 <= 8');
  goog.labs.testing.assertThat(8, lessThanEqualTo(9), '8 <= 9');
  assertMatcherError(function() {
    goog.labs.testing.assertThat(7, lessThanEqualTo(5));
  }, '7 <= 5');
}

function testEqualTo() {
  goog.labs.testing.assertThat(7, equalTo(7), '7 equals 7');
  assertMatcherError(function() {
    goog.labs.testing.assertThat(7, equalTo(5));
  }, '7 == 5');
}

function testCloseTo() {
  goog.labs.testing.assertThat(7, closeTo(10, 4), '7 within range(4) of 10');
  assertMatcherError(function() {
    goog.labs.testing.assertThat(5, closeTo(10, 3));
  }, '5 within range(3) of 10');
}

function assertMatcherError(callable, errorString) {
  var e = assertThrows(errorString || 'callable throws exception', callable);
  assertTrue(e instanceof goog.labs.testing.MatcherError);
}
