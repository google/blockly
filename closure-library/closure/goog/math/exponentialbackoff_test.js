// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.math.ExponentialBackoffTest');
goog.setTestOnly('goog.math.ExponentialBackoffTest');

goog.require('goog.math.ExponentialBackoff');
goog.require('goog.testing.jsunit');

var INITIAL_VALUE = 1;

var MAX_VALUE = 10;

function assertValueAndCounts(value, backoffCount, decayCount, backoff) {
  assertEquals('Wrong value', value, backoff.getValue());
  assertEquals('Wrong backoff count', backoffCount, backoff.getBackoffCount());
  assertEquals('Wrong decay count', decayCount, backoff.getDecayCount());
}

function assertValueAndBackoffCount(value, count, backoff) {
  assertEquals('Wrong value', value, backoff.getValue());
  assertEquals('Wrong backoff count', count, backoff.getBackoffCount());
}

function assertValueAndDecayCount(value, count, backoff) {
  assertEquals('Wrong value', value, backoff.getValue());
  assertEquals('Wrong decay count', count, backoff.getDecayCount());
}

function assertValueRangeAndBackoffCount(
    minBackoffValue, maxBackoffValue, count, backoff) {
  assertTrue('Value too small', backoff.getValue() >= minBackoffValue);
  assertTrue('Value too large', backoff.getValue() <= maxBackoffValue);
  assertEquals('Wrong backoff count', count, backoff.getBackoffCount());
}

function assertValueRangeAndDecayCount(
    minBackoffValue, maxBackoffValue, count, backoff) {
  assertTrue('Value too small', backoff.getValue() >= minBackoffValue);
  assertTrue('Value too large', backoff.getValue() <= maxBackoffValue);
  assertEquals('Wrong decay count', count, backoff.getDecayCount());
}

function getMinBackoff(baseValue, randomFactor) {
  return Math.round(baseValue - baseValue * randomFactor);
}

function getMaxBackoff(baseValue, randomFactor) {
  return Math.round(baseValue + baseValue * randomFactor);
}

function createBackoff() {
  return new goog.math.ExponentialBackoff(INITIAL_VALUE, MAX_VALUE);
}


function testInitialState() {
  var backoff = createBackoff();
  assertValueAndCounts(INITIAL_VALUE, 0, 0, backoff);
}


function testBackoff() {
  var backoff = createBackoff();
  backoff.backoff();
  assertValueAndBackoffCount(2 /* value */, 1 /* count */, backoff);
  backoff.backoff();
  assertValueAndBackoffCount(4 /* value */, 2 /* count */, backoff);
  backoff.backoff();
  assertValueAndBackoffCount(8 /* value */, 3 /* count */, backoff);
  backoff.backoff();
  assertValueAndBackoffCount(MAX_VALUE, 4 /* count */, backoff);
  backoff.backoff();
  assertValueAndBackoffCount(MAX_VALUE, 5 /* count */, backoff);
}


function testReset() {
  var backoff = createBackoff();
  backoff.backoff();
  backoff.decay();
  backoff.reset();
  assertValueAndCounts(
      INITIAL_VALUE, 0 /* backoff count */, 0 /* decay count */, backoff);
  backoff.backoff();
  assertValueAndCounts(
      2 /* value */, 1 /* backoff count */, 0 /* decay count */, backoff);
  backoff.decay();
  assertValueAndCounts(
      INITIAL_VALUE, 1 /* backoff count */, 1 /* decay count */, backoff);
}

function testRandomFactorBackoff() {
  var initialValue = 1;
  var maxValue = 20;
  var randomFactor = 0.5;
  var backoff =
      new goog.math.ExponentialBackoff(initialValue, maxValue, randomFactor);

  assertValueAndBackoffCount(initialValue /* value */, 0 /* count */, backoff);
  backoff.backoff();
  assertValueRangeAndBackoffCount(
      getMinBackoff(2, randomFactor), getMaxBackoff(2, randomFactor),
      1 /* count */, backoff);
  backoff.backoff();
  assertValueRangeAndBackoffCount(
      getMinBackoff(4, randomFactor), getMaxBackoff(4, randomFactor),
      2 /* count */, backoff);
  backoff.backoff();
  assertValueRangeAndBackoffCount(
      getMinBackoff(8, randomFactor), getMaxBackoff(8, randomFactor),
      3 /* count */, backoff);
  backoff.backoff();
  assertValueRangeAndBackoffCount(
      getMinBackoff(16, randomFactor), maxValue /* max backoff value */,
      4 /* count */, backoff);
  backoff.backoff();
  assertValueRangeAndBackoffCount(
      getMinBackoff(maxValue, randomFactor), maxValue /* max backoff value */,
      5 /* count */, backoff);
}

function testRandomFactorDecay() {
  var initialValue = 1;
  var maxValue = 8;
  var randomFactor = 0.5;
  var backoff =
      new goog.math.ExponentialBackoff(initialValue, maxValue, randomFactor);

  backoff.backoff();
  backoff.backoff();
  backoff.backoff();
  backoff.backoff();
  backoff.backoff();
  assertValueRangeAndBackoffCount(
      getMinBackoff(maxValue, randomFactor), maxValue /* max backoff value */,
      5 /* count */, backoff);
  backoff.decay();
  assertValueRangeAndDecayCount(
      getMinBackoff(4, randomFactor), getMaxBackoff(4, randomFactor),
      1 /* count */, backoff);
  backoff.decay();
  assertValueRangeAndDecayCount(
      getMinBackoff(2, randomFactor), getMaxBackoff(2, randomFactor),
      2 /* count */, backoff);
  backoff.decay();
  assertValueRangeAndDecayCount(
      initialValue, getMaxBackoff(initialValue, randomFactor), 3 /* count */,
      backoff);
}


function testBackoffFactor() {
  var initialValue = 1;
  var maxValue = 30;
  var randomFactor = undefined;
  var backoffFactor = 3;
  var backoff = new goog.math.ExponentialBackoff(
      initialValue, maxValue, randomFactor, backoffFactor);

  backoff.backoff();
  assertValueAndBackoffCount(3 /* value */, 1 /* count */, backoff);
  backoff.backoff();
  assertValueAndBackoffCount(9 /* value */, 2 /* count */, backoff);
  backoff.backoff();
  assertValueAndBackoffCount(27 /* value */, 3 /* count */, backoff);
  backoff.backoff();
  assertValueAndBackoffCount(maxValue, 4 /* count */, backoff);
  backoff.backoff();
  assertValueAndBackoffCount(maxValue, 5 /* count */, backoff);
}


function testDecayFactor() {
  var initialValue = 1;
  var maxValue = 27;
  var randomFactor = undefined;
  var backoffFactor = undefined;
  var decayFactor = 3;
  var backoff = new goog.math.ExponentialBackoff(
      initialValue, maxValue, randomFactor, backoffFactor, decayFactor);

  backoff.backoff();
  backoff.backoff();
  backoff.backoff();
  backoff.backoff();
  backoff.backoff();
  assertValueAndCounts(
      maxValue, 5 /* backoff count */, 0 /* decay count */, backoff);
  backoff.decay();
  assertValueAndDecayCount(9, 1 /* count */, backoff);
  backoff.decay();
  assertValueAndDecayCount(3, 2 /* count */, backoff);
  backoff.decay();
  assertValueAndDecayCount(initialValue, 3 /* count */, backoff);
  backoff.decay();
  assertValueAndDecayCount(initialValue, 4 /* count */, backoff);
}
