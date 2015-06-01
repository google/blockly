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

goog.provide('goog.labs.testing.objectMatcherTest');
goog.setTestOnly('goog.labs.testing.objectMatcherTest');

goog.require('goog.labs.testing.MatcherError');
/** @suppress {extraRequire} */
goog.require('goog.labs.testing.ObjectEqualsMatcher');
goog.require('goog.labs.testing.assertThat');
goog.require('goog.testing.jsunit');

function testObjectEquals() {
  var obj1 = {x: 1};
  var obj2 = obj1;
  goog.labs.testing.assertThat(obj1, equalsObject(obj2), 'obj1 equals obj2');

  assertMatcherError(function() {
    goog.labs.testing.assertThat({x: 1}, equalsObject({}));
  }, 'equalsObject does not throw exception on failure');
}

function testInstanceOf() {
  function expected() {
    this.x = 1;
  }
  var input = new expected();
  goog.labs.testing.assertThat(input, instanceOfClass(expected),
      'input is an instance of expected');

  assertMatcherError(function() {
    goog.labs.testing.assertThat(5, instanceOfClass(function() {}));
  }, 'instanceOfClass does not throw exception on failure');
}

function testHasProperty() {
  goog.labs.testing.assertThat({x: 1}, hasProperty('x'),
      '{x:1} has property x}');

  assertMatcherError(function() {
    goog.labs.testing.assertThat({x: 1}, hasProperty('y'));
  }, 'hasProperty does not throw exception on failure');
}

function testIsNull() {
  goog.labs.testing.assertThat(null, isNull(), 'null is null');

  assertMatcherError(function() {
    goog.labs.testing.assertThat(5, isNull());
  }, 'isNull does not throw exception on failure');
}

function testIsNullOrUndefined() {
  var x;
  goog.labs.testing.assertThat(undefined, isNullOrUndefined(),
      'undefined is null or undefined');
  goog.labs.testing.assertThat(x, isNullOrUndefined(),
      'undefined is null or undefined');
  x = null;
  goog.labs.testing.assertThat(null, isNullOrUndefined(),
      'null is null or undefined');
  goog.labs.testing.assertThat(x, isNullOrUndefined(),
      'null is null or undefined');

  assertMatcherError(function() {
    goog.labs.testing.assertThat(5, isNullOrUndefined());
  }, 'isNullOrUndefined does not throw exception on failure');
}

function testIsUndefined() {
  var x;
  goog.labs.testing.assertThat(undefined, isUndefined(),
      'undefined is undefined');
  goog.labs.testing.assertThat(x, isUndefined(), 'undefined is undefined');

  assertMatcherError(function() {
    goog.labs.testing.assertThat(5, isUndefined());
  }, 'isUndefined does not throw exception on failure');
}

function assertMatcherError(callable, errorString) {
  var e = assertThrows(errorString || 'callable throws exception', callable);
  assertTrue(e instanceof goog.labs.testing.MatcherError);
}
