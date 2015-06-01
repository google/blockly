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

goog.provide('goog.labs.objectTest');
goog.setTestOnly('goog.labs.objectTest');

goog.require('goog.labs.object');
goog.require('goog.testing.jsunit');

function testIs() {
  var object = {};
  assertTrue(goog.labs.object.is(object, object));
  assertFalse(goog.labs.object.is(object, {}));

  assertTrue(goog.labs.object.is(NaN, NaN));
  assertTrue(goog.labs.object.is(0, 0));
  assertTrue(goog.labs.object.is(1, 1));
  assertTrue(goog.labs.object.is(-1, -1));
  assertTrue(goog.labs.object.is(123, 123));
  assertFalse(goog.labs.object.is(0, -0));
  assertFalse(goog.labs.object.is(-0, 0));
  assertFalse(goog.labs.object.is(0, 1));

  assertTrue(goog.labs.object.is(true, true));
  assertTrue(goog.labs.object.is(false, false));
  assertFalse(goog.labs.object.is(true, false));
  assertFalse(goog.labs.object.is(false, true));

  assertTrue(goog.labs.object.is('', ''));
  assertTrue(goog.labs.object.is('a', 'a'));
  assertFalse(goog.labs.object.is('', 'a'));
  assertFalse(goog.labs.object.is('a', ''));
  assertFalse(goog.labs.object.is('a', 'b'));

  assertFalse(goog.labs.object.is(true, 'true'));
  assertFalse(goog.labs.object.is('true', true));
  assertFalse(goog.labs.object.is(false, 'false'));
  assertFalse(goog.labs.object.is('false', false));
  assertFalse(goog.labs.object.is(0, '0'));
  assertFalse(goog.labs.object.is('0', 0));
}
