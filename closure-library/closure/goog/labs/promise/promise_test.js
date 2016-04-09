// Copyright 2015 The Closure Library Authors. All Rights Reserved.
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

goog.module('goog.labs.promiseTest');
goog.setTestOnly('goog.labs.promiseTest');

goog.require('goog.testing.jsunit');

var Promise = goog.require('goog.Promise');
var Timer = goog.require('goog.Timer');
var promise = goog.require('goog.labs.promise');
var MockClock = goog.require('goog.testing.MockClock');
var testSuite = goog.require('goog.testing.testSuite');

// Workaround roughly equivalent to the following ES6 code:
//
//   function*() {
//     while (cond()) {
//       yield body();
//     }
//   }
function whileLoopIterator(cond, body) {
  return function() {
    var done = false;
    return {
      next: function(opt_arg) {
        done = done || !cond();
        if (done) {
          return {done: true};
        } else {
          return {done: false, value: body()};
        }
      }
    };
  };
}


/**
 * Dummy onfulfilled or onrejected function that should not be called.
 *
 * @param {*} result The result passed into the callback.
 */
function shouldNotCall(result) {
  fail('This should not have been called (result: ' + String(result) + ')');
}

var mockClock;
var sentinel = {};

testSuite({
  setUp: function() { mockClock = new MockClock(); },

  tearDown: function() { mockClock.uninstall(); },

  testWhileLoopIterator: function() {
    var counter = 3;
    var it = whileLoopIterator(
        function() { return counter > 0; }, function() { --counter; })();
    assertEquals(3, counter);
    assertFalse(it.next().done);
    assertEquals(2, counter);
    assertFalse(it.next().done);
    assertEquals(1, counter);
    assertFalse(it.next().done);
    assertEquals(0, counter);
    assertTrue(it.next().done);
    assertEquals(0, counter);
  },

  testRun: function() {
    var counter = 5;
    var resolved = 0;
    return promise
        .run(
            whileLoopIterator(
                function() { return counter > 0; },
                function() {
                  --counter;
                  return Promise.resolve().then(function() { ++resolved; });
                }))
        .then(function(result) {
          assertFalse(goog.isDef(result));
          assertEquals(0, counter);
          assertEquals(5, resolved);
        });
  },

  testRunWithNonPromise: function() {
    var counter = 5;
    return promise
        .run(
            whileLoopIterator(
                function() { return counter > 0; }, function() { --counter; }))
        .then(function(result) {
          assertFalse(goog.isDef(result));
          assertEquals(0, counter);
        });
  },

  testRunWithMockClock: function() {
    mockClock.install();

    var counter = 3;
    var innerResolved = 0;
    var outerResolved = false;
    promise
        .run(
            whileLoopIterator(
                function() { return counter > 0; },
                function() {
                  --counter;
                  return Timer.promise(10).then(function() {
                    ++innerResolved;
                  });
                }))
        .then(function() { outerResolved = true; });

    assertEquals(3, counter);
    assertEquals(0, innerResolved);
    assertFalse(outerResolved);

    mockClock.tick();

    assertEquals(2, counter);
    assertEquals(0, innerResolved);
    assertFalse(outerResolved);

    mockClock.tick(10);

    assertEquals(1, counter);
    assertEquals(1, innerResolved);
    assertFalse(outerResolved);

    mockClock.tick(10);

    assertEquals(0, counter);
    assertEquals(2, innerResolved);
    assertFalse(outerResolved);

    mockClock.tick(10);

    assertEquals(0, counter);
    assertEquals(3, innerResolved);
    assertTrue(outerResolved);
  },

  testRunWithRejection: function() {
    var counter = 5;
    return promise
        .run(
            whileLoopIterator(
                function() { return counter > 0; },
                function() {
                  --counter;
                  if (counter == 2) {
                    return Promise.reject(sentinel);
                  }
                  return Promise.resolve();
                }))
        .then(shouldNotCall, function(error) {
          assertEquals(2, counter);
          assertEquals(sentinel, error);
        });
  },

  testRunWithException: function() {
    var counter = 5;
    return promise
        .run(
            whileLoopIterator(
                function() { return counter > 0; },
                function() {
                  --counter;
                  if (counter == 2) {
                    throw sentinel;
                  }
                  return Promise.resolve();
                }))
        .then(shouldNotCall, function(error) {
          assertEquals(2, counter);
          assertEquals(sentinel, error);
        });
  },

  testRunWithImmediateException: function() {
    return promise
        .run(whileLoopIterator(function() { throw sentinel; }, function() {}))
        .then(
            shouldNotCall, function(error) { assertEquals(sentinel, error); });
  },

  testRunWithImmediateRejection: function() {
    return promise
        .run(
            whileLoopIterator(
                function() { return true; },
                function() { return Promise.reject(sentinel); }))
        .then(
            shouldNotCall, function(error) { assertEquals(sentinel, error); });
  },

  testRunWithoutYield: function() {
    return promise
        .run(whileLoopIterator(function() { return false; }, goog.nullFunction))
        .then(function(result) { assertFalse(goog.isDef(result)); });
  },

  testRunYieldWithValue: function() {
    // ES6 version:
    //   return promise.run(function*() {
    //     var x = yield Promise.resolve(1);
    //     var y = yield Promise.resolve(2);
    //     return x + y;
    //   }).then(result => assertEquals(3, result));

    return promise
        .run(function() {
          var step = 0;
          var x, y;
          return {
            next: function(nextArg) {
              switch (++step) {
                case 1:
                  return {done: false, value: Promise.resolve(1)};
                case 2:
                  x = nextArg;
                  return {done: false, value: Promise.resolve(2)};
                case 3:
                  y = nextArg;
                  return {done: true, value: x + y};
                default:
                  return {done: true};
              }
            }
          };
        })
        .then(function(result) { assertEquals(3, result); });
  }
});
