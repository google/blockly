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

function assertValueAndCount(value, count, backoff) {
  assertEquals('Wrong value', value, backoff.getValue());
  assertEquals('Wrong backoff count', count, backoff.getBackoffCount());
}


function createBackoff() {
  return new goog.math.ExponentialBackoff(INITIAL_VALUE, MAX_VALUE);
}


function testInitialState() {
  var backoff = createBackoff();
  assertValueAndCount(INITIAL_VALUE, 0, backoff);
}


function testBackoff() {
  var backoff = createBackoff();
  backoff.backoff();
  assertValueAndCount(2 /* value */, 1 /* count */, backoff);
  backoff.backoff();
  assertValueAndCount(4 /* value */, 2 /* count */, backoff);
  backoff.backoff();
  assertValueAndCount(8 /* value */, 3 /* count */, backoff);
  backoff.backoff();
  assertValueAndCount(MAX_VALUE, 4 /* count */, backoff);
  backoff.backoff();
  assertValueAndCount(MAX_VALUE, 5 /* count */, backoff);
}


function testReset() {
  var backoff = createBackoff();
  backoff.backoff();
  backoff.reset();
  assertValueAndCount(INITIAL_VALUE, 0 /* count */, backoff);

}
