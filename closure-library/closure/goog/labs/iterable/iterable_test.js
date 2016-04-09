// Copyright 2014 The Closure Library Authors. All Rights Reserved.
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

/**
 * @fileoverview Tests for goog.labs.iterable
 */

goog.module('goog.labs.iterableTest');
goog.setTestOnly('goog.labs.iterableTest');

goog.require('goog.testing.jsunit');

var iterable = goog.require('goog.labs.iterable');
var recordFunction = goog.require('goog.testing.recordFunction');
var testSuite = goog.require('goog.testing.testSuite');


/**
 * Create an iterator starting at "start" and increments up to
 * (but not including) "stop".
 */
function createRangeIterator(start, stop) {
  var value = start;
  var next = function() {
    if (value < stop) {
      return {value: value++, done: false};
    }

    return {value: undefined, done: true};
  };

  return {next: next};
}

function createRangeIterable(start, stop) {
  var obj = {};

  // Refer to goog.global['Symbol'] because otherwise this
  // is a parse error in earlier IEs.
  obj[goog.global['Symbol'].iterator] = function() {
    return createRangeIterator(start, stop);
  };
  return obj;
}

function isSymbolDefined() {
  return !!goog.global['Symbol'];
}

testSuite({
  testCreateRangeIterable: function() {
    // Do not run if Symbol does not exist in this browser.
    if (!isSymbolDefined()) {
      return;
    }

    var rangeIterator = createRangeIterator(0, 3);

    for (var i = 0; i < 3; i++) {
      assertObjectEquals({value: i, done: false}, rangeIterator.next());
    }

    for (var i = 0; i < 3; i++) {
      assertObjectEquals({value: undefined, done: true}, rangeIterator.next());
    }
  },

  testForEach: function() {
    // Do not run if Symbol does not exist in this browser.
    if (!isSymbolDefined()) {
      return;
    }

    var range = createRangeIterable(0, 3);

    var callback = recordFunction();
    iterable.forEach(callback, range, self);

    callback.assertCallCount(3);

    var calls = callback.getCalls();
    for (var i = 0; i < calls.length; i++) {
      var call = calls[i];
      assertArrayEquals([i], call.getArguments());
    }
  },

  testMap: function() {
    // Do not run if Symbol does not exist in this browser.
    if (!isSymbolDefined()) {
      return;
    }

    var range = createRangeIterable(0, 3);

    function addTwo(i) { return i + 2; }

    var newIterable = iterable.map(addTwo, range);
    var newIterator = iterable.getIterator(newIterable);

    var nextObj = newIterator.next();
    assertEquals(2, nextObj.value);
    assertFalse(nextObj.done);

    nextObj = newIterator.next();
    assertEquals(3, nextObj.value);
    assertFalse(nextObj.done);

    nextObj = newIterator.next();
    assertEquals(4, nextObj.value);
    assertFalse(nextObj.done);

    // Check that the iterator repeatedly signals done.
    for (var i = 0; i < 3; i++) {
      nextObj = newIterator.next();
      assertUndefined(nextObj.value);
      assertTrue(nextObj.done);
    }
  }
});
