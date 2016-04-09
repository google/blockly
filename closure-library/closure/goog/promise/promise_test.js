// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.PromiseTest');

goog.require('goog.Promise');
goog.require('goog.Thenable');
goog.require('goog.Timer');
goog.require('goog.functions');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');
goog.require('goog.userAgent');

goog.setTestOnly('goog.PromiseTest');


function setUpPage() {
  goog.testing.TestCase.getActiveTestCase().promiseTimeout = 10000;  // 10s
}


// TODO(brenneman):
// - Add tests for interoperability with native Promises where available.
// - Add tests for long stack traces.

var SUPPORTS_ACCESSORS = !!window.Object.defineProperty &&
    // IE8 and Safari<5.1 have an Object.defineProperty which does not work on
    // some objects.
    (!goog.userAgent.IE || goog.userAgent.isVersionOrHigher('9')) &&
    (!goog.userAgent.SAFARI || goog.userAgent.isVersionOrHigher('534.48.3'));


var mockClock = new goog.testing.MockClock();
var stubs = new goog.testing.PropertyReplacer();
var unhandledRejections;


// Simple shared objects used as test values.
var dummy = {toString: goog.functions.constant('[object dummy]')};
var sentinel = {toString: goog.functions.constant('[object sentinel]')};


function setUp() {
  unhandledRejections = goog.testing.recordFunction();
  goog.Promise.setUnhandledRejectionHandler(unhandledRejections);
}


function tearDown() {
  // The system should leave no pending unhandled rejections. Advance the mock
  // clock (if installed) to catch any rethrows waiting in the queue.
  mockClock.tick(Infinity);
  mockClock.uninstall();
  mockClock.reset();

  stubs.reset();
}


/**
 * Dummy onfulfilled or onrejected function that should not be called.
 *
 * @param {*} result The result passed into the callback.
 */
function shouldNotCall(result) {
  fail('This should not have been called (result: ' + String(result) + ')');
}


function fulfillSoon(value, delay) {
  return new goog.Promise(function(resolve, reject) {
    window.setTimeout(function() { resolve(value); }, delay);
  });
}


function fulfillThenableSoon(value, delay) {
  return createThenable(value, delay, true /* fulfilled */);
}


function fulfillBuiltInSoon(value, delay) {
  // If the environment does not provide a built-in Promise, then just use
  // goog.Promise instead to allow tests which use this to continue.
  if (!window.Promise) {
    return fulfillSoon(value, delay);
  }
  return new window.Promise(function(resolve, reject) {
    window.setTimeout(function() { resolve(value); }, delay);
  });
}


function rejectSoon(reason, delay) {
  return new goog.Promise(function(resolve, reject) {
    window.setTimeout(function() { reject(reason); }, delay);
  });
}


function rejectThenableSoon(value, delay) {
  return createThenable(value, delay, false /* fulfilled */);
}


function rejectBuiltInSoon(value, delay) {
  // If the environment does not provide a built-in Promise, then just use
  // goog.Promise instead to allow tests which use this to continue.
  if (!window.Promise) {
    return rejectSoon(value, delay);
  }
  return new window.Promise(function(resolve, reject) {
    window.setTimeout(function() { reject(value); }, delay);
  });
}


/**
 * Creates a thenable which isn't formally a promise for testing non-Promise
 * thenables.
 */
function createThenableResolver() {
  var resolver = goog.Promise.withResolver();
  var thenable = {};
  var then = function(onFulfilled, onRejected) {
    var next = createThenableResolver();
    next.resolve(resolver.promise.then(onFulfilled, onRejected));
    return next.thenable;
  };
  // Count accesses of the {@code then} property when possible. Otherwise, just
  // define the {@code then} method as a regular data property.
  if (SUPPORTS_ACCESSORS) {
    thenable.thenAccesses = 0;
    window.Object.defineProperty(thenable, 'then', {
      get: function() {
        thenable.thenAccesses++;
        return then;
      }
    });
  } else {
    thenable.then = then;
  }
  return {
    resolve: resolver.resolve,
    reject: resolver.reject,
    thenable: thenable
  };
}


/**
 * @param {*} value The value the thenable should be fulfilled/rejected with.
 * @param {number} delay The length of the delay until the thenable is resolved.
 * @param {boolean} fulfill Whether to fulfill or reject the thenable.
 * @return {!Thenable}
 */
function createThenable(value, delay, fulfill) {
  var resolver = createThenableResolver();
  window.setTimeout(function() {
    if (fulfill) {
      resolver.resolve(value);
    } else {
      resolver.reject(value);
    }
  }, delay);
  return resolver.thenable;
}


/**
 * Creates a malicious thenable that throws when the {@code then} method is
 * accessed to ensure that it is caught and converted to a rejected promise
 * instead of allowed to cause a synchronous exception.
 * @param {*} value The value to throw.
 * @return {!Thenable}
 */
function createThrowingThenable(value) {
  // If the environment does not provide Object.defineProperty, then just
  // use an immediately rejected promise to allow tests which use this to
  // continue.
  if (!SUPPORTS_ACCESSORS) {
    return rejectThenableSoon(value, 0);
  }

  var thenable = {};
  window.Object.defineProperty(
      thenable, 'then', {get: function() { throw value; }});
  return thenable;
}


function testThenIsFulfilled() {
  var timesCalled = 0;

  var p = new goog.Promise(function(resolve, reject) { resolve(sentinel); });
  p.then(function(value) {
    timesCalled++;
    assertEquals(sentinel, value);
  });

  assertEquals(
      'then() must return before callbacks are invoked.', 0, timesCalled);

  return p.then(function() {
    assertEquals('onFulfilled must be called exactly once.', 1, timesCalled);
  });
}

function testThenVoidIsFulfilled() {
  var timesCalled = 0;

  var p = goog.Promise.resolve(sentinel);
  p.thenVoid(function(value) {
    timesCalled++;
    assertEquals(sentinel, value);
  });

  assertEquals(
      'thenVoid() must return before callbacks are invoked.', 0, timesCalled);

  return p.then(function() {
    assertEquals('onFulfilled must be called exactly once.', 1, timesCalled);
  });
}

function testThenIsRejected() {
  var timesCalled = 0;

  var p = goog.Promise.reject(sentinel);
  p.then(shouldNotCall, function(value) {
    timesCalled++;
    assertEquals(sentinel, value);
  });

  assertEquals(
      'then() must return before callbacks are invoked.', 0, timesCalled);

  return p.then(shouldNotCall, function() {
    assertEquals('onRejected must be called exactly once.', 1, timesCalled);
  });
}

function testThenVoidIsRejected() {
  var timesCalled = 0;

  var p = goog.Promise.reject(sentinel);
  p.thenVoid(shouldNotCall, function(value) {
    timesCalled++;
    assertEquals(sentinel, value);
    assertEquals('onRejected must be called exactly once.', 1, timesCalled);
  });

  assertEquals(
      'thenVoid() must return before callbacks are invoked.', 0, timesCalled);

  return p.then(shouldNotCall, function() {
    assertEquals('onRejected must be called exactly once.', 1, timesCalled);
  });
}

function testThenAsserts() {
  var p = goog.Promise.resolve();

  var m = assertThrows(function() { p.then({}); });
  assertContains('opt_onFulfilled should be a function.', m.message);

  m = assertThrows(function() { p.then(function() {}, {}); });
  assertContains('opt_onRejected should be a function.', m.message);
}

function testThenVoidAsserts() {
  var p = goog.Promise.resolve();

  var m = assertThrows(function() { p.thenVoid({}); });
  assertContains('opt_onFulfilled should be a function.', m.message);

  m = assertThrows(function() { p.thenVoid(function() {}, {}); });
  assertContains('opt_onRejected should be a function.', m.message);
}

function testOptionalOnFulfilled() {
  return goog.Promise.resolve(sentinel)
      .then(null, null)
      .then(null, shouldNotCall)
      .then(function(value) { assertEquals(sentinel, value); });
}


function testOptionalOnRejected() {
  return goog.Promise.reject(sentinel)
      .then(null, null)
      .then(shouldNotCall)
      .then(null, function(reason) { assertEquals(sentinel, reason); });
}


function testMultipleResolves() {
  var timesCalled = 0;
  var resolvePromise;

  var p = new goog.Promise(function(resolve, reject) {
    resolvePromise = resolve;
    resolve('foo');
    resolve('bar');
  });

  p.then(function(value) {
    timesCalled++;
    assertEquals('onFulfilled must be called exactly once.', 1, timesCalled);
  });

  // Add one more test for fulfilling after a delay.
  return goog.Timer.promise(10).then(function() {
    resolvePromise('baz');
    assertEquals(1, timesCalled);
  });
}


function testMultipleRejects() {
  var timesCalled = 0;
  var rejectPromise;

  var p = new goog.Promise(function(resolve, reject) {
    rejectPromise = reject;
    reject('foo');
    reject('bar');
  });

  p.then(shouldNotCall, function(value) {
    timesCalled++;
    assertEquals('onRejected must be called exactly once.', 1, timesCalled);
  });

  // Add one more test for rejecting after a delay.
  return goog.Timer.promise(10).then(function() {
    rejectPromise('baz');
    assertEquals(1, timesCalled);
  });
}


function testAsynchronousThenCalls() {
  var timesCalled = [0, 0, 0, 0];
  var p = new goog.Promise(function(resolve, reject) {
    window.setTimeout(function() { resolve(); }, 30);
  });

  p.then(function() {
    timesCalled[0]++;
    assertArrayEquals([1, 0, 0, 0], timesCalled);
  });

  window.setTimeout(function() {
    p.then(function() {
      timesCalled[1]++;
      assertArrayEquals([1, 1, 0, 0], timesCalled);
    });
  }, 10);

  window.setTimeout(function() {
    p.then(function() {
      timesCalled[2]++;
      assertArrayEquals([1, 1, 1, 0], timesCalled);
    });
  }, 20);

  return goog.Timer.promise(40).then(function() {
    return p.then(function() {
      timesCalled[3]++;
      assertArrayEquals([1, 1, 1, 1], timesCalled);
    });
  });
}


function testResolveWithPromise() {
  var resolveBlocker;
  var hasFulfilled = false;
  var blocker =
      new goog.Promise(function(resolve, reject) { resolveBlocker = resolve; });

  var p = goog.Promise.resolve(blocker);
  p.then(function(value) {
    hasFulfilled = true;
    assertEquals(sentinel, value);
  }, shouldNotCall);

  assertFalse(hasFulfilled);
  resolveBlocker(sentinel);

  return p.then(function() { assertTrue(hasFulfilled); });
}


function testResolveWithRejectedPromise() {
  var rejectBlocker;
  var hasRejected = false;
  var blocker =
      new goog.Promise(function(resolve, reject) { rejectBlocker = reject; });

  var p = goog.Promise.resolve(blocker);
  var child = p.then(shouldNotCall, function(reason) {
    hasRejected = true;
    assertEquals(sentinel, reason);
  });

  assertFalse(hasRejected);
  rejectBlocker(sentinel);

  return child.thenCatch(function() { assertTrue(hasRejected); });
}


function testRejectWithPromise() {
  var resolveBlocker;
  var hasFulfilled = false;
  var blocker =
      new goog.Promise(function(resolve, reject) { resolveBlocker = resolve; });

  var p = goog.Promise.reject(blocker);
  var child = p.then(function(value) {
    hasFulfilled = true;
    assertEquals(sentinel, value);
  }, shouldNotCall);

  assertFalse(hasFulfilled);
  resolveBlocker(sentinel);

  return child.thenCatch(function() { assertTrue(hasRejected); });
}


function testRejectWithRejectedPromise() {
  var rejectBlocker;
  var hasRejected = false;
  var blocker =
      new goog.Promise(function(resolve, reject) { rejectBlocker = reject; });

  var p = goog.Promise.reject(blocker);
  var child = p.then(shouldNotCall, function(reason) {
    hasRejected = true;
    assertEquals(sentinel, reason);
  });

  assertFalse(hasRejected);
  rejectBlocker(sentinel);

  return child.thenCatch(function() { assertTrue(hasRejected); });
}


function testResolveAndReject() {
  var onFulfilledCalled = false;
  var onRejectedCalled = false;
  var p = new goog.Promise(function(resolve, reject) {
    resolve();
    reject();
  });

  p.then(
      function() { onFulfilledCalled = true; },
      function() { onRejectedCalled = true; });

  return p.then(function() {
    assertTrue(onFulfilledCalled);
    assertFalse(onRejectedCalled);
  });
}


function testRejectAndResolve() {
  return new goog
      .Promise(function(resolve, reject) {
        reject();
        resolve();
      })
      .then(shouldNotCall, function() { return true; });
}


function testThenReturnsBeforeCallbackWithFulfill() {
  var thenHasReturned = false;
  var p = goog.Promise.resolve();

  var child = p.then(function() {
    assertTrue(
        'Callback must be called only after then() has returned.',
        thenHasReturned);
  });
  thenHasReturned = true;

  return child;
}


function testThenReturnsBeforeCallbackWithReject() {
  var thenHasReturned = false;
  var p = goog.Promise.reject();

  var child = p.then(shouldNotCall, function() {
    assertTrue(
        'Callback must be called only after then() has returned.',
        thenHasReturned);
  });
  thenHasReturned = true;

  return child;
}


function testResolutionOrder() {
  var callbacks = [];
  return goog.Promise.resolve()
      .then(function() { callbacks.push(1); }, shouldNotCall)
      .then(function() { callbacks.push(2); }, shouldNotCall)
      .then(function() { callbacks.push(3); }, shouldNotCall)
      .then(function() {
        assertArrayEquals([1, 2, 3], callbacks);
      });
}


function testResolutionOrderWithThrow() {
  var callbacks = [];
  var p = goog.Promise.resolve();

  p.then(function() { callbacks.push(1); }, shouldNotCall);
  var child = p.then(function() {
    callbacks.push(2);
    throw Error();
  }, shouldNotCall);

  child.then(shouldNotCall, function() {
    // The parent callbacks should be evaluated before the child.
    callbacks.push(4);
  });

  p.then(function() { callbacks.push(3); }, shouldNotCall);

  return child.then(shouldNotCall, function() {
    callbacks.push(5);
    assertArrayEquals([1, 2, 3, 4, 5], callbacks);
  });
}


function testResolutionOrderWithNestedThen() {
  var resolver = goog.Promise.withResolver();

  var callbacks = [];
  var p = goog.Promise.resolve();

  p.then(function() {
    callbacks.push(1);
    p.then(function() {
      callbacks.push(3);
      resolver.resolve();
    });
  });
  p.then(function() { callbacks.push(2); });

  return resolver.promise.then(function() {
    assertArrayEquals([1, 2, 3], callbacks);
  });
}


function testRejectionOrder() {
  var callbacks = [];
  var p = goog.Promise.reject();

  p.then(shouldNotCall, function() { callbacks.push(1); });
  p.then(shouldNotCall, function() { callbacks.push(2); });
  p.then(shouldNotCall, function() { callbacks.push(3); });

  return p.then(shouldNotCall, function() {
    assertArrayEquals([1, 2, 3], callbacks);
  });
}


function testRejectionOrderWithThrow() {
  var callbacks = [];
  var p = goog.Promise.reject();

  p.then(shouldNotCall, function() { callbacks.push(1); });
  p.then(shouldNotCall, function() {
    callbacks.push(2);
    throw Error();
  });
  p.then(shouldNotCall, function() { callbacks.push(3); });

  return p.then(shouldNotCall, function() {
    assertArrayEquals([1, 2, 3], callbacks);
  });
}


function testRejectionOrderWithNestedThen() {
  var resolver = goog.Promise.withResolver();

  var callbacks = [];
  var p = goog.Promise.reject();

  p.then(shouldNotCall, function() {
    callbacks.push(1);
    p.then(shouldNotCall, function() {
      callbacks.push(3);
      resolver.resolve();
    });
  });
  p.then(shouldNotCall, function() { callbacks.push(2); });

  return resolver.promise.then(function() {
    assertArrayEquals([1, 2, 3], callbacks);
  });
}


function testBranching() {
  var p = goog.Promise.resolve(2);

  var branch1 =
      p.then(function(value) {
         assertEquals('then functions should see the same value', 2, value);
         return value / 2;
       }).then(function(value) {
        assertEquals('branch should receive the returned value', 1, value);
      });

  var branch2 =
      p.then(function(value) {
         assertEquals('then functions should see the same value', 2, value);
         throw value + 1;
       }).then(shouldNotCall, function(reason) {
        assertEquals('branch should receive the thrown value', 3, reason);
      });

  var branch3 =
      p.then(function(value) {
         assertEquals('then functions should see the same value', 2, value);
         return value * 2;
       }).then(function(value) {
        assertEquals('branch should receive the returned value', 4, value);
      });

  return goog.Promise.all([branch1, branch2, branch3]);
}


function testThenReturnsPromise() {
  var parent = goog.Promise.resolve();
  var child = parent.then();

  assertTrue(child instanceof goog.Promise);
  assertNotEquals(
      'The returned Promise must be different from the input.', parent, child);
}


function testThenVoidReturnsUndefined() {
  var parent = goog.Promise.resolve();
  var child = parent.thenVoid();

  assertUndefined(child);
}


function testBlockingPromise() {
  var p = goog.Promise.resolve();
  var wasFulfilled = false;
  var wasRejected = false;

  var p2 = p.then(function() {
    return new goog.Promise(function(resolve, reject) {});
  });

  p2.then(
      function() { wasFulfilled = true; }, function() { wasRejected = true; });

  return goog.Timer.promise(10).then(function() {
    assertFalse('p2 should be blocked on the returned Promise', wasFulfilled);
    assertFalse('p2 should be blocked on the returned Promise', wasRejected);
  });
}


function testBlockingPromiseFulfilled() {
  var blockingPromise = new goog.Promise(function(resolve, reject) {
    window.setTimeout(function() { resolve(sentinel); }, 0);
  });

  var p = goog.Promise.resolve(dummy);
  var p2 = p.then(function(value) { return blockingPromise; });

  return p2.then(function(value) { assertEquals(sentinel, value); });
}


function testBlockingPromiseRejected() {
  var blockingPromise = new goog.Promise(function(resolve, reject) {
    window.setTimeout(function() { reject(sentinel); }, 0);
  });

  var p = goog.Promise.resolve(blockingPromise);

  return p.then(
      shouldNotCall, function(reason) { assertEquals(sentinel, reason); });
}


function testBlockingThenableFulfilled() {
  var thenable = {then: function(onFulfill, onReject) { onFulfill(sentinel); }};

  return goog.Promise.resolve(thenable).then(function(reason) {
    assertEquals(sentinel, reason);
  });
}


function testBlockingThenableRejected() {
  var thenable = {then: function(onFulfill, onReject) { onReject(sentinel); }};

  return goog.Promise.resolve(thenable).then(
      shouldNotCall, function(reason) { assertEquals(sentinel, reason); });
}


function testBlockingThenableThrows() {
  var thenable = {then: function(onFulfill, onReject) { throw sentinel; }};

  return goog.Promise.resolve(thenable).then(
      shouldNotCall, function(reason) { assertEquals(sentinel, reason); });
}


function testBlockingThenableMisbehaves() {
  var thenable = {
    then: function(onFulfill, onReject) {
      onFulfill(sentinel);
      onFulfill(dummy);
      onReject(dummy);
      throw dummy;
    }
  };

  return goog.Promise.resolve(thenable).then(function(value) {
    assertEquals(
        'Only the first resolution of the Thenable should have a result.',
        sentinel, value);
  });
}


function testNestingThenables() {
  var thenableA = {
    then: function(onFulfill, onReject) { onFulfill(sentinel); }
  };
  var thenableB = {
    then: function(onFulfill, onReject) { onFulfill(thenableA); }
  };
  var thenableC = {
    then: function(onFulfill, onReject) { onFulfill(thenableB); }
  };

  return goog.Promise.resolve(thenableC).then(function(value) {
    assertEquals(
        'Should resolve to the fulfillment value of thenableA', sentinel,
        value);
  });
}


function testNestingThenablesRejected() {
  var thenableA = {then: function(onFulfill, onReject) { onReject(sentinel); }};
  var thenableB = {
    then: function(onFulfill, onReject) { onReject(thenableA); }
  };
  var thenableC = {
    then: function(onFulfill, onReject) { onReject(thenableB); }
  };

  return goog.Promise.reject(thenableC).then(shouldNotCall, function(reason) {
    assertEquals(
        'Should resolve to rejection reason of thenableA', sentinel, reason);
  });
}


function testThenCatch() {
  var catchCalled = false;
  return goog.Promise.reject()
      .thenCatch(function(reason) {
        catchCalled = true;
        return sentinel;
      })
      .then(function(value) {
        assertTrue(catchCalled);
        assertEquals(sentinel, value);
      });
}


function testRaceWithEmptyList() {
  return goog.Promise.race([]).then(function(value) {
    assertUndefined(value);
  });
}


function testRaceWithFulfill() {
  var a = fulfillSoon('a', 40);
  var b = fulfillSoon('b', 30);
  var c = fulfillSoon('c', 10);
  var d = fulfillSoon('d', 20);

  return goog.Promise.race([a, b, c, d])
      .then(function(value) {
        assertEquals('c', value);
        // Return the slowest input promise to wait for it to complete.
        return a;
      })
      .then(function(value) {
        assertEquals(
            'The slowest promise should resolve eventually.', 'a', value);
      });
}


function testRaceWithThenables() {
  var a = fulfillThenableSoon('a', 40);
  var b = fulfillThenableSoon('b', 30);
  var c = fulfillThenableSoon('c', 10);
  var d = fulfillThenableSoon('d', 20);

  return goog.Promise.race([a, b, c, d])
      .then(function(value) {
        assertEquals('c', value);
        // Ensure that the {@code then} property was only accessed once by
        // {@code goog.Promise.race}.
        if (SUPPORTS_ACCESSORS) {
          assertEquals(1, c.thenAccesses);
        }
        // Return the slowest input thenable to wait for it to complete.
        return a;
      })
      .then(function(value) {
        assertEquals(
            'The slowest thenable should resolve eventually.', 'a', value);
      });
}


function testRaceWithBuiltIns() {
  var a = fulfillBuiltInSoon('a', 40);
  var b = fulfillBuiltInSoon('b', 30);
  var c = fulfillBuiltInSoon('c', 10);
  var d = fulfillBuiltInSoon('d', 20);

  return goog.Promise.race([a, b, c, d])
      .then(function(value) {
        assertEquals('c', value);
        // Return the slowest input promise to wait for it to complete.
        return a;
      })
      .then(function(value) {
        assertEquals(
            'The slowest promise should resolve eventually.', 'a', value);
      });
}


function testRaceWithNonThenable() {
  var a = fulfillSoon('a', 40);
  var b = 'b';
  var c = fulfillSoon('c', 10);
  var d = fulfillSoon('d', 20);

  return goog.Promise.race([a, b, c, d])
      .then(function(value) {
        assertEquals('b', value);
        // Return the slowest input promise to wait for it to complete.
        return a;
      })
      .then(function(value) {
        assertEquals(
            'The slowest promise should resolve eventually.', 'a', value);
      });
}


function testRaceWithFalseyNonThenable() {
  var a = fulfillSoon('a', 40);
  var b = 0;
  var c = fulfillSoon('c', 10);
  var d = fulfillSoon('d', 20);

  return goog.Promise.race([a, b, c, d])
      .then(function(value) {
        assertEquals(0, value);
        // Return the slowest input promise to wait for it to complete.
        return a;
      })
      .then(function(value) {
        assertEquals(
            'The slowest promise should resolve eventually.', 'a', value);
      });
}


function testRaceWithFulfilledBeforeNonThenable() {
  var a = fulfillSoon('a', 40);
  var b = goog.Promise.resolve('b');
  var c = 'c';
  var d = fulfillSoon('d', 20);

  return goog.Promise.race([a, b, c, d])
      .then(function(value) {
        assertEquals('b', value);
        // Return the slowest input promise to wait for it to complete.
        return a;
      })
      .then(function(value) {
        assertEquals(
            'The slowest promise should resolve eventually.', 'a', value);
      });
}


function testRaceWithReject() {
  var a = rejectSoon('rejected-a', 40);
  var b = rejectSoon('rejected-b', 30);
  var c = rejectSoon('rejected-c', 10);
  var d = rejectSoon('rejected-d', 20);

  return goog.Promise.race([a, b, c, d])
      .then(
          shouldNotCall,
          function(value) {
            assertEquals('rejected-c', value);
            return a;
          })
      .then(shouldNotCall, function(reason) {
        assertEquals(
            'The slowest promise should resolve eventually.', 'rejected-a',
            reason);
      });
}

function testRaceWithRejectThenable() {
  var a = rejectThenableSoon('rejected-a', 40);
  var b = rejectThenableSoon('rejected-b', 30);
  var c = rejectThenableSoon('rejected-c', 10);
  var d = rejectThenableSoon('rejected-d', 20);

  return goog.Promise.race([a, b, c, d])
      .then(
          shouldNotCall,
          function(value) {
            assertEquals('rejected-c', value);
            return a;
          })
      .then(shouldNotCall, function(reason) {
        assertEquals(
            'The slowest promise should resolve eventually.', 'rejected-a',
            reason);
      });
}

function testRaceWithRejectBuiltIn() {
  var a = rejectBuiltInSoon('rejected-a', 40);
  var b = rejectBuiltInSoon('rejected-b', 30);
  var c = rejectBuiltInSoon('rejected-c', 10);
  var d = rejectBuiltInSoon('rejected-d', 20);

  return goog.Promise.race([a, b, c, d])
      .then(
          shouldNotCall,
          function(value) {
            assertEquals('rejected-c', value);
            return a;
          })
      .then(shouldNotCall, function(reason) {
        assertEquals(
            'The slowest promise should resolve eventually.', 'rejected-a',
            reason);
      });
}

function testRaceWithRejectAndThrowingThenable() {
  var a = rejectSoon('rejected-a', 40);
  var b = rejectThenableSoon('rejected-b', 30);
  var c = rejectBuiltInSoon('rejected-c', 10);
  var d = createThrowingThenable('rejected-d');

  return goog.Promise.race([a, b, c, d])
      .then(
          shouldNotCall,
          function(value) {
            assertEquals('rejected-d', value);
            return a;
          })
      .then(shouldNotCall, function(reason) {
        assertEquals(
            'The slowest promise should resolve eventually.', 'rejected-a',
            reason);
      });
}


function testAllWithEmptyList() {
  return goog.Promise.all([]).then(function(value) {
    assertArrayEquals([], value);
  });
}


function testAllWithFulfill() {
  var a = fulfillSoon('a', 40);
  var b = fulfillSoon('b', 30);
  var c = fulfillSoon('c', 10);
  var d = fulfillSoon('d', 20);
  // Test a falsey value.
  var z = fulfillSoon(0, 30);

  return goog.Promise.all([a, b, c, d, z]).then(function(value) {
    assertArrayEquals(['a', 'b', 'c', 'd', 0], value);
  });
}


function testAllWithThenable() {
  var a = fulfillSoon('a', 40);
  var b = fulfillThenableSoon('b', 30);
  var c = fulfillSoon('c', 10);
  var d = fulfillSoon('d', 20);

  return goog.Promise.all([a, b, c, d]).then(function(value) {
    assertArrayEquals(['a', 'b', 'c', 'd'], value);
    // Ensure that the {@code then} property was only accessed once by
    // {@code goog.Promise.all}.
    if (SUPPORTS_ACCESSORS) {
      assertEquals(1, b.thenAccesses);
    }
  });
}


function testAllWithBuiltIn() {
  var a = fulfillSoon('a', 40);
  var b = fulfillBuiltInSoon('b', 30);
  var c = fulfillSoon('c', 10);
  var d = fulfillSoon('d', 20);

  return goog.Promise.all([a, b, c, d]).then(function(value) {
    assertArrayEquals(['a', 'b', 'c', 'd'], value);
  });
}


function testAllWithNonThenable() {
  var a = fulfillSoon('a', 40);
  var b = 'b';
  var c = fulfillSoon('c', 10);
  var d = fulfillSoon('d', 20);
  // Test a falsey value.
  var z = 0;

  return goog.Promise.all([a, b, c, d, z]).then(function(value) {
    assertArrayEquals(['a', 'b', 'c', 'd', 0], value);
  });
}


function testAllWithReject() {
  var a = fulfillSoon('a', 40);
  var b = rejectSoon('rejected-b', 30);
  var c = fulfillSoon('c', 10);
  var d = fulfillSoon('d', 20);

  return goog.Promise.all([a, b, c, d])
      .then(
          shouldNotCall,
          function(reason) {
            assertEquals('rejected-b', reason);
            return a;
          })
      .then(function(value) {
        assertEquals(
            'Promise "a" should be fulfilled even though the all()' +
                'was rejected.',
            'a', value);
      });
}


function testAllSettledWithEmptyList() {
  return goog.Promise.allSettled([]).then(function(results) {
    assertArrayEquals([], results);
  });
}


function testAllSettledWithFulfillAndReject() {
  var a = fulfillSoon('a', 40);
  var b = rejectSoon('rejected-b', 30);
  var c = 'c';
  var d = rejectBuiltInSoon('rejected-d', 20);
  var e = fulfillThenableSoon('e', 40);
  var f = fulfillBuiltInSoon('f', 30);
  var g = rejectThenableSoon('rejected-g', 10);
  var h = createThrowingThenable('rejected-h');
  // Test a falsey value.
  var z = 0;

  return goog.Promise.allSettled([a, b, c, d, e, f, g, h, z])
      .then(function(results) {
        assertArrayEquals(
            [
              {fulfilled: true, value: 'a'},
              {fulfilled: false, reason: 'rejected-b'},
              {fulfilled: true, value: 'c'},
              {fulfilled: false, reason: 'rejected-d'},
              {fulfilled: true, value: 'e'}, {fulfilled: true, value: 'f'},
              {fulfilled: false, reason: 'rejected-g'},
              {fulfilled: false, reason: 'rejected-h'},
              {fulfilled: true, value: 0}
            ],
            results);
        // Ensure that the {@code then} property was only accessed once by
        // {@code goog.Promise.allSettled}.
        if (SUPPORTS_ACCESSORS) {
          assertEquals(1, e.thenAccesses);
          assertEquals(1, g.thenAccesses);
        }
      });
}


function testFirstFulfilledWithEmptyList() {
  return goog.Promise.firstFulfilled([]).then(function(value) {
    assertUndefined(value);
  });
}


function testFirstFulfilledWithFulfill() {
  var a = fulfillSoon('a', 40);
  var b = rejectSoon('rejected-b', 30);
  var c = rejectSoon('rejected-c', 10);
  var d = fulfillSoon('d', 20);

  return goog.Promise.firstFulfilled([a, b, c, d])
      .then(function(value) {
        assertEquals('d', value);
        return c;
      })
      .then(
          shouldNotCall,
          function(reason) {
            assertEquals(
                'Promise "c" should be rejected before firstFulfilled() resolves.',
                'rejected-c', reason);
            return a;
          })
      .then(function(value) {
        assertEquals(
            'Promise "a" should be fulfilled after firstFulfilled() resolves.',
            'a', value);
      });
}


function testFirstFulfilledWithThenables() {
  var a = fulfillThenableSoon('a', 40);
  var b = rejectThenableSoon('rejected-b', 30);
  var c = rejectThenableSoon('rejected-c', 10);
  var d = fulfillThenableSoon('d', 20);

  return goog.Promise.firstFulfilled([a, b, c, d])
      .then(function(value) {
        assertEquals('d', value);
        // Ensure that the {@code then} property was only accessed once by
        // {@code goog.Promise.firstFulfilled}.
        if (SUPPORTS_ACCESSORS) {
          assertEquals(1, d.thenAccesses);
        }
        return c;
      })
      .then(
          shouldNotCall,
          function(reason) {
            assertEquals(
                'Thenable "c" should be rejected before firstFulfilled() resolves.',
                'rejected-c', reason);
            return a;
          })
      .then(function(value) {
        assertEquals(
            'Thenable "a" should be fulfilled after firstFulfilled() resolves.',
            'a', value);
      });
}


function testFirstFulfilledWithBuiltIns() {
  var a = fulfillBuiltInSoon('a', 40);
  var b = rejectBuiltInSoon('rejected-b', 30);
  var c = rejectBuiltInSoon('rejected-c', 10);
  var d = fulfillBuiltInSoon('d', 20);

  return goog.Promise.firstFulfilled([a, b, c, d])
      .then(function(value) {
        assertEquals('d', value);
        return c;
      })
      .then(
          shouldNotCall,
          function(reason) {
            assertEquals(
                'Promise "c" should be rejected before firstFulfilled() resolves.',
                'rejected-c', reason);
            return a;
          })
      .then(function(value) {
        assertEquals(
            'Promise "a" should be fulfilled after firstFulfilled() resolves.',
            'a', value);
      });
}


function testFirstFulfilledWithNonThenable() {
  var a = fulfillSoon('a', 40);
  var b = rejectSoon('rejected-b', 30);
  var c = rejectSoon('rejected-c', 10);
  var d = 'd';

  return goog.Promise.firstFulfilled([a, b, c, d])
      .then(function(value) {
        assertEquals('d', value);
        // Return the slowest input promise to wait for it to complete.
        return a;
      })
      .then(function(value) {
        assertEquals(
            'The slowest promise should resolve eventually.', 'a', value);
      });
}


function testFirstFulfilledWithFalseyNonThenable() {
  var a = fulfillSoon('a', 40);
  var b = rejectSoon('rejected-b', 30);
  var c = rejectSoon('rejected-c', 10);
  var d = 0;

  return goog.Promise.firstFulfilled([a, b, c, d])
      .then(function(value) {
        assertEquals(0, value);
        // Return the slowest input promise to wait for it to complete.
        return a;
      })
      .then(function(value) {
        assertEquals(
            'The slowest promise should resolve eventually.', 'a', value);
      });
}


function testFirstFulfilledWithFulfilledBeforeNonThenable() {
  var a = fulfillSoon('a', 40);
  var b = goog.Promise.resolve('b');
  var c = rejectSoon('rejected-c', 10);
  var d = 'd';

  return goog.Promise.firstFulfilled([a, b, c, d])
      .then(function(value) {
        assertEquals('b', value);
        // Return the slowest input promise to wait for it to complete.
        return a;
      })
      .then(function(value) {
        assertEquals(
            'The slowest promise should resolve eventually.', 'a', value);
      });
}


function testFirstFulfilledWithReject() {
  var a = rejectSoon('rejected-a', 40);
  var b = rejectThenableSoon('rejected-b', 30);
  var c = rejectBuiltInSoon('rejected-c', 10);
  var d = createThrowingThenable('rejected-d');

  return goog.Promise.firstFulfilled([a, b, c, d])
      .then(shouldNotCall, function(reason) {
        assertArrayEquals(
            ['rejected-a', 'rejected-b', 'rejected-c', 'rejected-d'], reason);
        // Ensure that the {@code then} property was only accessed once by
        // {@code goog.Promise.firstFulfilled}.
        if (SUPPORTS_ACCESSORS) {
          assertEquals(1, b.thenAccesses);
        }
      });
}


function testThenAlwaysWithFulfill() {
  var thenAlwaysCalled = false;
  return goog.Promise.resolve(sentinel)
      .thenAlways(function() {
        assertEquals(
            'thenAlways should have no arguments', 0, arguments.length);
        thenAlwaysCalled = true;
      })
      .then(function(value) {
        assertEquals(sentinel, value);
        assertTrue(thenAlwaysCalled);
      });
}


function testThenAlwaysWithReject() {
  var thenAlwaysCalled = false;
  return goog.Promise.reject(sentinel)
      .thenAlways(function(arg) {
        assertEquals(
            'thenAlways should have no arguments', 0, arguments.length);
        thenAlwaysCalled = true;
      })
      .then(shouldNotCall, function(err) {
        assertEquals(sentinel, err);
        return null;
      });
}


function testThenAlwaysCalledMultipleTimes() {
  var calls = [];

  var p = goog.Promise.resolve(sentinel);
  p.then(function(value) {
    assertEquals(sentinel, value);
    calls.push(1);
    return value;
  });
  p.thenAlways(function() {
    assertEquals(0, arguments.length);
    calls.push(2);
    throw Error('thenAlways throw');
  });
  p.then(function(value) {
    assertEquals(
        'Promise result should not mutate after throw from thenAlways.',
        sentinel, value);
    calls.push(3);
  });
  p.thenAlways(function() { assertArrayEquals([1, 2, 3], calls); });
  p.thenAlways(function() {
    assertEquals(
        'Should be one unhandled exception from the "thenAlways throw".', 1,
        unhandledRejections.getCallCount());
    var rejectionCall = unhandledRejections.popLastCall();
    assertEquals(1, rejectionCall.getArguments().length);
    var err = rejectionCall.getArguments()[0];
    assertEquals('thenAlways throw', err.message);
    assertEquals(goog.global, rejectionCall.getThis());
  });

  return p.thenAlways(function() { assertEquals(3, calls.length); });
}


function testContextWithInit() {
  var initContext;
  var p = new goog.Promise(function(resolve, reject) {
    initContext = this;
  }, sentinel);
  assertEquals(sentinel, initContext);
}


function testContextWithInitDefault() {
  var initContext;
  var p = new goog.Promise(function(resolve, reject) { initContext = this; });
  assertEquals(
      'initFunc should default to being called in the global scope',
      goog.global, initContext);
}


function testContextWithFulfillment() {
  return goog.Promise.resolve()
      .then(function() {
        assertEquals(
            'Call should be made in the global scope if no context is specified.',
            goog.global, this);
      })
      .then(
          function() { assertEquals(sentinel, this); }, shouldNotCall, sentinel)
      .thenAlways(function() { assertEquals(sentinel, this); }, sentinel);
}


function testContextWithRejection() {
  return goog.Promise.reject()
      .then(
          shouldNotCall,
          function() {
            assertEquals(
                'Call should be in the default scope when no context is set.',
                goog.global, this);
            throw new Error('Intentional rejection');
          })
      .then(
          shouldNotCall, function() { assertEquals(sentinel, this); }, sentinel)
      .thenAlways(function() { assertEquals(sentinel, this); }, sentinel)
      .thenCatch(function() { assertEquals(sentinel, this); }, sentinel);
}


function testCancel() {
  var p = new goog.Promise(goog.nullFunction);
  var child = p.then(shouldNotCall, function(reason) {
    assertTrue(reason instanceof goog.Promise.CancellationError);
    assertEquals('cancellation message', reason.message);

    // Return a non-Error to resolve the cancellation rejection.
    return null;
  });
  p.cancel('cancellation message');
  return child;
}


function testThenVoidCancel() {
  var thenVoidCalled = false;
  var p = new goog.Promise(goog.nullFunction);

  p.thenVoid(shouldNotCall, function(reason) {
    assertTrue(reason instanceof goog.Promise.CancellationError);
    assertEquals('cancellation message', reason.message);
    thenVoidCalled = true;
  });

  p.cancel('cancellation message');
  assertFalse(thenVoidCalled);

  return p.thenCatch(function() {
    assertTrue(thenVoidCalled);

    // Return a non-Error to resolve the cancellation rejection.
    return null;
  });
}


function testCancelAfterResolve() {
  var p = goog.Promise.resolve();
  p.cancel();
  return p.then(null, shouldNotCall);
}


function testThenVoidCancelAfterResolve() {
  var p = goog.Promise.resolve();
  p.cancel();
  p.thenVoid(null, shouldNotCall);
  return p;
}


function testCancelAfterReject() {
  var p = goog.Promise.reject(sentinel);
  p.cancel();
  return p.then(
      shouldNotCall, function(reason) { assertEquals(sentinel, reason); });
}


function testThenVoidCancelAfterReject() {
  var thenVoidCalled = false;
  var p = goog.Promise.reject(sentinel);
  p.cancel();

  p.thenVoid(shouldNotCall, function(reason) {
    assertEquals(sentinel, reason);
    thenVoidCalled = true;
  });

  return p.thenCatch(function() { assertTrue(thenVoidCalled); });
}


function testCancelPropagation() {
  var cancelError;
  var p = new goog.Promise(goog.nullFunction);

  var p2 = p.then(shouldNotCall, function(reason) {
              cancelError = reason;
              assertTrue(reason instanceof goog.Promise.CancellationError);
              assertEquals('parent cancel message', reason.message);
              return sentinel;
            }).then(function(value) {
    assertEquals(
        'Child promises should receive the returned value of the parent.',
        sentinel, value);
  }, shouldNotCall);

  var p3 = p.then(shouldNotCall, function(reason) {
    assertEquals(
        'Every onRejected handler should receive the same cancel error.',
        cancelError, reason);
    assertEquals('parent cancel message', reason.message);

    // Return a non-Error to resolve the cancellation rejection.
    return null;
  });

  p.cancel('parent cancel message');
  return goog.Promise.all([p2, p3]);
}


function testThenVoidCancelPropagation() {
  var resolver = goog.Promise.withResolver();
  var toResolveCount = 2;

  var partialResolve = function() {
    if (--toResolveCount == 0) {
      resolver.resolve();
    }
  };

  var cancelError;
  var p = new goog.Promise(goog.nullFunction);

  var p2 = p.then(shouldNotCall, function(reason) {
    cancelError = reason;
    assertTrue(reason instanceof goog.Promise.CancellationError);
    assertEquals('parent cancel message', reason.message);
    return sentinel;
  });
  p2.thenVoid(function(value) {
    assertEquals(
        'Child promises should receive the returned value of the parent.',
        sentinel, value);
    partialResolve();
  }, shouldNotCall);

  p.thenVoid(shouldNotCall, function(reason) {
    assertEquals(
        'Every onRejected handler should receive the same cancel error.',
        cancelError, reason);
    assertEquals('parent cancel message', reason.message);
    partialResolve();
  });

  p.cancel('parent cancel message');
  return resolver.promise;
}


function testCancelPropagationUpward() {
  var cancelError;
  var cancelCalls = [];
  var parent = new goog.Promise(goog.nullFunction);

  var child = parent.then(shouldNotCall, function(reason) {
    assertTrue(reason instanceof goog.Promise.CancellationError);
    assertEquals('grandChild cancel message', reason.message);
    cancelError = reason;
    cancelCalls.push('parent');
  });

  var grandChild = child.then(shouldNotCall, function(reason) {
    assertEquals(
        'Child should receive the same cancel error.', cancelError, reason);
    cancelCalls.push('child');
  });

  var descendant = grandChild.then(shouldNotCall, function(reason) {
    assertEquals(
        'GrandChild should receive the same cancel error.', cancelError,
        reason);
    cancelCalls.push('grandChild');

    assertArrayEquals(
        'Each promise in the hierarchy has a single child, so canceling the ' +
            'grandChild should cancel each ancestor in order.',
        ['parent', 'child', 'grandChild'], cancelCalls);

    // Return a non-Error to resolve the cancellation rejection.
    return null;
  });

  grandChild.cancel('grandChild cancel message');
  return descendant;
}


function testThenVoidCancelPropagationUpward() {
  var cancelError;
  var cancelCalls = [];
  var parent = new goog.Promise(goog.nullFunction);

  var child = parent.then(shouldNotCall, function(reason) {
    assertTrue(reason instanceof goog.Promise.CancellationError);
    assertEquals('grandChild cancel message', reason.message);
    cancelError = reason;
    cancelCalls.push('parent');
  });

  var grandChild = child.then(shouldNotCall, function(reason) {
    assertEquals(
        'Child should receive the same cancel error.', cancelError, reason);
    cancelCalls.push('child');
  });

  grandChild.thenVoid(shouldNotCall, function(reason) {
    assertEquals(
        'GrandChild should receive the same cancel error.', cancelError,
        reason);
    cancelCalls.push('grandChild');
  });

  grandChild.cancel('grandChild cancel message');
  return grandChild.thenCatch(function(reason) {
    assertEquals(cancelError, reason);
    assertArrayEquals(
        'Each promise in the hierarchy has a single child, so canceling the ' +
            'grandChild should cancel each ancestor in order.',
        ['parent', 'child', 'grandChild'], cancelCalls);

    // Return a non-Error to resolve the cancellation rejection.
    return null;
  });
}


function testCancelPropagationUpwardWithMultipleChildren() {
  var cancelError;
  var cancelCalls = [];
  var parent = fulfillSoon(sentinel, 0);

  parent.then(function(value) {
    assertEquals(
        'Non-canceled callbacks should be called after a sibling is canceled.',
        sentinel, value);
  });

  var child = parent.then(shouldNotCall, function(reason) {
    assertTrue(reason instanceof goog.Promise.CancellationError);
    assertEquals('grandChild cancel message', reason.message);
    cancelError = reason;
    cancelCalls.push('child');
  });

  var grandChild = child.then(shouldNotCall, function(reason) {
    assertEquals(reason, cancelError);
    cancelCalls.push('grandChild');
  });
  grandChild.cancel('grandChild cancel message');

  return grandChild.then(shouldNotCall, function(reason) {
    assertEquals(reason, cancelError);
    assertArrayEquals(
        'The parent promise has multiple children, so only the child and ' +
            'grandChild should be canceled.',
        ['child', 'grandChild'], cancelCalls);

    // Return a non-Error to resolve the cancellation rejection.
    return null;
  });
}


function testThenVoidCancelPropagationUpwardWithMultipleChildren() {
  var cancelError;
  var cancelCalls = [];
  var parent = fulfillSoon(sentinel, 0);

  parent.thenVoid(function(value) {
    assertEquals(
        'Non-canceled callbacks should be called after a sibling is canceled.',
        sentinel, value);
  }, shouldNotCall);

  var child = parent.then(shouldNotCall, function(reason) {
    assertTrue(reason instanceof goog.Promise.CancellationError);
    assertEquals('grandChild cancel message', reason.message);
    cancelError = reason;
    cancelCalls.push('child');
  });

  var grandChild = child.then(shouldNotCall, function(reason) {
    assertEquals(reason, cancelError);
    cancelCalls.push('grandChild');
  });
  grandChild.cancel('grandChild cancel message');

  grandChild.thenVoid(shouldNotCall, function(reason) {
    assertEquals(reason, cancelError);
    cancelCalls.push('void grandChild');
  });

  return grandChild.then(shouldNotCall, function(reason) {
    assertEquals(reason, cancelError);
    assertArrayEquals(
        'The parent promise has multiple children, so only the child and ' +
            'grandChildren should be canceled.',
        ['child', 'grandChild', 'void grandChild'], cancelCalls);

    // Return a non-Error to resolve the cancellation rejection.
    return null;
  });
}


function testCancelRecovery() {
  var cancelError;
  var cancelCalls = [];

  var parent = fulfillSoon(sentinel, 100);

  var sibling1 = parent.then(function(value) {
    assertEquals(
        'Non-canceled callbacks should be called after a sibling is canceled.',
        sentinel, value);
  });

  var sibling2 = parent.then(shouldNotCall, function(reason) {
    assertTrue(reason instanceof goog.Promise.CancellationError);
    cancelError = reason;
    cancelCalls.push('sibling2');
    return sentinel;
  });

  var grandChild = sibling2.then(function(value) {
    cancelCalls.push('child');
    assertEquals(
        'Returning a non-cancel value should uncancel the grandChild.', value,
        sentinel);
    assertArrayEquals(['sibling2', 'child'], cancelCalls);
  }, shouldNotCall);

  grandChild.cancel();
  return goog.Promise.all([sibling1, grandChild]);
}


function testCancellationError() {
  var err = new goog.Promise.CancellationError('cancel message');
  assertTrue(err instanceof Error);
  assertTrue(err instanceof goog.Promise.CancellationError);
  assertEquals('cancel', err.name);
  assertEquals('cancel message', err.message);
}


function testMockClock() {
  mockClock.install();

  var resolveA;
  var resolveB;
  var calls = [];

  var p = new goog.Promise(function(resolve, reject) { resolveA = resolve; });

  p.then(function(value) {
    assertEquals(sentinel, value);
    calls.push('then');
  });

  var fulfilledChild = p.then(function(value) {
                          assertEquals(sentinel, value);
                          return goog.Promise.resolve(1);
                        }).then(function(value) {
    assertEquals(1, value);
    calls.push('fulfilledChild');

  });

  var rejectedChild = p.then(function(value) {
                         assertEquals(sentinel, value);
                         return goog.Promise.reject(2);
                       }).then(shouldNotCall, function(reason) {
    assertEquals(2, reason);
    calls.push('rejectedChild');
  });

  var unresolvedChild =
      p.then(function(value) {
         assertEquals(sentinel, value);
         return new goog.Promise(function(r) { resolveB = r; });
       }).then(function(value) {
        assertEquals(3, value);
        calls.push('unresolvedChild');
      });

  resolveA(sentinel);
  assertArrayEquals(
      'Calls must not be resolved until the clock ticks.', [], calls);

  mockClock.tick();
  assertArrayEquals(
      'All resolved Promises should execute in the same timestep.',
      ['then', 'fulfilledChild', 'rejectedChild'], calls);

  resolveB(3);
  assertArrayEquals(
      'New calls must not resolve until the clock ticks.',
      ['then', 'fulfilledChild', 'rejectedChild'], calls);

  mockClock.tick();
  assertArrayEquals(
      'All callbacks should have executed.',
      ['then', 'fulfilledChild', 'rejectedChild', 'unresolvedChild'], calls);
}


function testHandledRejection() {
  mockClock.install();
  goog.Promise.reject(sentinel).then(shouldNotCall, function(reason) {});

  mockClock.tick();
  assertEquals(0, unhandledRejections.getCallCount());
}


function testThenVoidHandledRejection() {
  mockClock.install();
  goog.Promise.reject(sentinel).thenVoid(shouldNotCall, function(reason) {});

  mockClock.tick();
  assertEquals(0, unhandledRejections.getCallCount());
}


function testUnhandledRejection1() {
  mockClock.install();
  goog.Promise.reject(sentinel);

  mockClock.tick();
  assertEquals(1, unhandledRejections.getCallCount());
  var rejectionCall = unhandledRejections.popLastCall();
  assertArrayEquals([sentinel], rejectionCall.getArguments());
  assertEquals(goog.global, rejectionCall.getThis());
}


function testUnhandledRejection2() {
  mockClock.install();
  goog.Promise.reject(sentinel).then(shouldNotCall);

  mockClock.tick();
  assertEquals(1, unhandledRejections.getCallCount());
  var rejectionCall = unhandledRejections.popLastCall();
  assertArrayEquals([sentinel], rejectionCall.getArguments());
  assertEquals(goog.global, rejectionCall.getThis());
}


function testThenVoidUnhandledRejection() {
  mockClock.install();
  goog.Promise.reject(sentinel).thenVoid(shouldNotCall);

  mockClock.tick();
  assertEquals(1, unhandledRejections.getCallCount());
  var rejectionCall = unhandledRejections.popLastCall();
  assertArrayEquals([sentinel], rejectionCall.getArguments());
  assertEquals(goog.global, rejectionCall.getThis());
}


function testUnhandledRejection() {
  var resolver = goog.Promise.withResolver();

  goog.Promise.setUnhandledRejectionHandler(function(err) {
    assertEquals(sentinel, err);
    resolver.resolve();
  });
  goog.Promise.reject(sentinel);

  return resolver.promise;
}


function testUnhandledThrow() {
  var resolver = goog.Promise.withResolver();

  goog.Promise.setUnhandledRejectionHandler(function(err) {
    assertEquals(sentinel, err);
    resolver.resolve();
  });
  goog.Promise.resolve().then(function() { throw sentinel; });

  return resolver.promise;
}


function testThenVoidUnhandledThrow() {
  var resolver = goog.Promise.withResolver();

  goog.Promise.setUnhandledRejectionHandler(function(error) {
    assertEquals(sentinel, error);
    resolver.resolve();
  });

  goog.Promise.resolve().thenVoid(function() { throw sentinel; });

  return resolver.promise;
}


function testUnhandledBlockingRejection() {
  mockClock.install();
  var blocker = goog.Promise.reject(sentinel);
  goog.Promise.resolve(blocker);

  mockClock.tick();
  assertEquals(1, unhandledRejections.getCallCount());
  var rejectionCall = unhandledRejections.popLastCall();
  assertArrayEquals([sentinel], rejectionCall.getArguments());
  assertEquals(goog.global, rejectionCall.getThis());
}


function testUnhandledRejectionAfterThenAlways() {
  mockClock.install();
  var resolver = goog.Promise.withResolver();
  resolver.promise.thenAlways(function() {});
  resolver.reject(sentinel);

  mockClock.tick();
  assertEquals(1, unhandledRejections.getCallCount());
  var rejectionCall = unhandledRejections.popLastCall();
  assertArrayEquals([sentinel], rejectionCall.getArguments());
  assertEquals(goog.global, rejectionCall.getThis());
}


function testHandledBlockingRejection() {
  mockClock.install();
  var blocker = goog.Promise.reject(sentinel);
  goog.Promise.resolve(blocker).then(shouldNotCall, function(reason) {});

  mockClock.tick();
  assertEquals(0, unhandledRejections.getCallCount());
}


function testThenVoidHandledBlockingRejection() {
  var shouldCall = goog.testing.recordFunction();

  mockClock.install();
  var blocker = goog.Promise.reject(sentinel);
  goog.Promise.resolve(blocker).thenVoid(shouldNotCall, shouldCall);

  mockClock.tick();
  assertEquals(0, unhandledRejections.getCallCount());
  assertEquals(1, shouldCall.getCallCount());
}


function testUnhandledRejectionWithTimeout() {
  mockClock.install();
  stubs.replace(goog.Promise, 'UNHANDLED_REJECTION_DELAY', 200);
  goog.Promise.reject(sentinel);

  mockClock.tick(199);
  assertEquals(0, unhandledRejections.getCallCount());

  mockClock.tick(1);
  assertEquals(1, unhandledRejections.getCallCount());
}


function testHandledRejectionWithTimeout() {
  mockClock.install();
  stubs.replace(goog.Promise, 'UNHANDLED_REJECTION_DELAY', 200);
  var p = goog.Promise.reject(sentinel);

  mockClock.tick(199);
  p.then(shouldNotCall, function(reason) {});

  mockClock.tick(1);
  assertEquals(0, unhandledRejections.getCallCount());
}


function testUnhandledRejectionDisabled() {
  mockClock.install();
  stubs.replace(goog.Promise, 'UNHANDLED_REJECTION_DELAY', -1);
  goog.Promise.reject(sentinel);

  mockClock.tick();
  assertEquals(0, unhandledRejections.getCallCount());
}


function testThenableInterface() {
  var promise = new goog.Promise(function(resolve, reject) {});
  assertTrue(goog.Thenable.isImplementedBy(promise));

  assertFalse(goog.Thenable.isImplementedBy({}));
  assertFalse(goog.Thenable.isImplementedBy('string'));
  assertFalse(goog.Thenable.isImplementedBy(1));
  assertFalse(goog.Thenable.isImplementedBy({then: function() {}}));

  function T() {}
  T.prototype.then = function(opt_a, opt_b, opt_c) {};
  goog.Thenable.addImplementation(T);
  assertTrue(goog.Thenable.isImplementedBy(new T));

  // Test COMPILED code path.
  try {
    COMPILED = true;
    function C() {}
    C.prototype.then = function(opt_a, opt_b, opt_c) {};
    goog.Thenable.addImplementation(C);
    assertTrue(goog.Thenable.isImplementedBy(new C));
  } finally {
    COMPILED = false;
  }
}


function testCreateWithResolver_Resolved() {
  mockClock.install();
  var timesCalled = 0;

  var resolver = goog.Promise.withResolver();

  resolver.promise.then(function(value) {
    timesCalled++;
    assertEquals(sentinel, value);
  }, fail);

  assertEquals(
      'then() must return before callbacks are invoked.', 0, timesCalled);

  mockClock.tick();

  assertEquals(
      'promise is not resolved until resolver is invoked.', 0, timesCalled);

  resolver.resolve(sentinel);

  assertEquals('resolution is delayed until the next tick', 0, timesCalled);

  mockClock.tick();

  assertEquals('onFulfilled must be called exactly once.', 1, timesCalled);
}


function testCreateWithResolver_Rejected() {
  mockClock.install();
  var timesCalled = 0;

  var resolver = goog.Promise.withResolver();

  resolver.promise.then(fail, function(reason) {
    timesCalled++;
    assertEquals(sentinel, reason);
  });

  assertEquals(
      'then() must return before callbacks are invoked.', 0, timesCalled);

  mockClock.tick();

  assertEquals(
      'promise is not resolved until resolver is invoked.', 0, timesCalled);

  resolver.reject(sentinel);

  assertEquals('resolution is delayed until the next tick', 0, timesCalled);

  mockClock.tick();

  assertEquals('onFulfilled must be called exactly once.', 1, timesCalled);
}


function testLinksBetweenParentsAndChildrenAreCutOnResolve() {
  mockClock.install();
  var parentResolver = goog.Promise.withResolver();
  var parent = parentResolver.promise;
  var child = parent.then(function() {});
  assertNotNull(child.parent_);
  assertEquals(null, parent.callbackEntries_.next);
  parentResolver.resolve();
  mockClock.tick();
  assertNull(child.parent_);
  assertEquals(null, parent.callbackEntries_);
}


function testLinksBetweenParentsAndChildrenAreCutWithUnresolvedChild() {
  mockClock.install();
  var parentResolver = goog.Promise.withResolver();
  var parent = parentResolver.promise;
  var child = parent.then(function() {
    // Will never resolve.
    return new goog.Promise(function() {});
  });
  assertNotNull(child.parent_);
  assertNull(parent.callbackEntries_.next);
  parentResolver.resolve();
  mockClock.tick();
  assertNull(child.parent_);
  assertEquals(null, parent.callbackEntries_);
}


function testLinksBetweenParentsAndChildrenAreCutOnCancel() {
  mockClock.install();
  var parent = new goog.Promise(function() {});
  var child = parent.then(function() {});
  var grandChild = child.then(function() {});
  assertEquals(null, child.callbackEntries_.next);
  assertNotNull(child.parent_);
  assertEquals(null, parent.callbackEntries_.next);
  parent.cancel();
  mockClock.tick();
  assertNull(child.parent_);
  assertNull(grandChild.parent_);
  assertEquals(null, parent.callbackEntries_);
  assertEquals(null, child.callbackEntries_);
}
