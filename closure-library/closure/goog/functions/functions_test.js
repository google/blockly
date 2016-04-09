// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Unit tests for goog.functions.
 */

goog.provide('goog.functionsTest');
goog.setTestOnly('goog.functionsTest');

goog.require('goog.array');
goog.require('goog.functions');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');


var fTrue = makeCallOrderLogger('fTrue', true);
var gFalse = makeCallOrderLogger('gFalse', false);
var hTrue = makeCallOrderLogger('hTrue', true);

var stubs = new goog.testing.PropertyReplacer();

function setUp() {
  callOrder = [];
}

function tearDown() {
  stubs.reset();
}

var foo = 'global';
var obj = {foo: 'obj'};

function getFoo(arg1, arg2) {
  return {foo: this.foo, arg1: arg1, arg2: arg2};
}

function testTrue() {
  assertTrue(goog.functions.TRUE());
}

function testFalse() {
  assertFalse(goog.functions.FALSE());
}

function testLock() {
  function add(var_args) {
    var result = 0;
    for (var i = 0; i < arguments.length; i++) {
      result += arguments[i];
    }
    return result;
  }

  assertEquals(6, add(1, 2, 3));
  assertEquals(0, goog.functions.lock(add)(1, 2, 3));
  assertEquals(3, goog.functions.lock(add, 2)(1, 2, 3));
  assertEquals(6, goog.partial(add, 1, 2)(3));
  assertEquals(3, goog.functions.lock(goog.partial(add, 1, 2))(3));
}

function testNth() {
  assertEquals(1, goog.functions.nth(0)(1));
  assertEquals(2, goog.functions.nth(1)(1, 2));
  assertEquals('a', goog.functions.nth(0)('a', 'b'));
  assertEquals(undefined, goog.functions.nth(0)());
  assertEquals(undefined, goog.functions.nth(1)(true));
  assertEquals(undefined, goog.functions.nth(-1)());
}

function testPartialRight() {
  var f = function(x, y) { return x / y; };
  var g = goog.functions.partialRight(f, 2);
  assertEquals(2, g(4));

  var h = goog.functions.partialRight(f, 4, 2);
  assertEquals(2, h());

  var i = goog.functions.partialRight(f);
  assertEquals(2, i(4, 2));
}

function testPartialRightUsesGlobal() {
  var f = function(x, y) {
    assertEquals(goog.global, this);
    return x / y;
  };
  var g = goog.functions.partialRight(f, 2);
  var h = goog.functions.partialRight(g, 4);
  assertEquals(2, h());
}

function testPartialRightWithCall() {
  var obj = {};
  var f = function(x, y) {
    assertEquals(obj, this);
    return x / y;
  };
  var g = goog.functions.partialRight(f, 2);
  var h = goog.functions.partialRight(g, 4);
  assertEquals(2, h.call(obj));
}

function testPartialRightAndBind() {
  // This ensures that this "survives" through a partialRight.
  var p = goog.functions.partialRight(getFoo, 'dog');
  var b = goog.bind(p, obj, 'hot');

  var res = b();
  assertEquals(obj.foo, res.foo);
  assertEquals('hot', res.arg1);
  assertEquals('dog', res.arg2);
}

function testBindAndPartialRight() {
  // This ensures that this "survives" through a partialRight.
  var b = goog.bind(getFoo, obj, 'hot');
  var p = goog.functions.partialRight(b, 'dog');

  var res = p();
  assertEquals(obj.foo, res.foo);
  assertEquals('hot', res.arg1);
  assertEquals('dog', res.arg2);
}

function testPartialRightMultipleCalls() {
  var f = goog.testing.recordFunction();

  var a = goog.functions.partialRight(f, 'foo');
  var b = goog.functions.partialRight(a, 'bar');

  a();
  a();
  b();
  b();

  assertEquals(4, f.getCallCount());

  var calls = f.getCalls();
  assertArrayEquals(['foo'], calls[0].getArguments());
  assertArrayEquals(['foo'], calls[1].getArguments());
  assertArrayEquals(['bar', 'foo'], calls[2].getArguments());
  assertArrayEquals(['bar', 'foo'], calls[3].getArguments());
}

function testIdentity() {
  assertEquals(3, goog.functions.identity(3));
  assertEquals(3, goog.functions.identity(3, 4, 5, 6));
  assertEquals('Hi there', goog.functions.identity('Hi there'));
  assertEquals(null, goog.functions.identity(null));
  assertEquals(undefined, goog.functions.identity());

  var arr = [1, 'b', null];
  assertEquals(arr, goog.functions.identity(arr));
  var obj = {a: 'ay', b: 'bee', c: 'see'};
  assertEquals(obj, goog.functions.identity(obj));
}

function testConstant() {
  assertEquals(3, goog.functions.constant(3)());
  assertEquals(undefined, goog.functions.constant()());
}

function testError() {
  var f = goog.functions.error('x');
  var e = assertThrows(
      'A function created by goog.functions.error must throw an error', f);
  assertEquals('x', e.message);
}

function testFail() {
  var obj = {};
  var f = goog.functions.fail(obj);
  var e = assertThrows(
      'A function created by goog.functions.raise must throw its input', f);
  assertEquals(obj, e);
}

function testCompose() {
  var add2 = function(x) { return x + 2; };

  var doubleValue = function(x) { return x * 2; };

  assertEquals(6, goog.functions.compose(doubleValue, add2)(1));
  assertEquals(4, goog.functions.compose(add2, doubleValue)(1));
  assertEquals(6, goog.functions.compose(add2, add2, doubleValue)(1));
  assertEquals(
      12, goog.functions.compose(doubleValue, add2, add2, doubleValue)(1));
  assertUndefined(goog.functions.compose()(1));
  assertEquals(3, goog.functions.compose(add2)(1));

  var add2Numbers = function(x, y) { return x + y; };
  assertEquals(17, goog.functions.compose(add2Numbers)(10, 7));
  assertEquals(34, goog.functions.compose(doubleValue, add2Numbers)(10, 7));
}

function testAdd() {
  assertUndefined(goog.functions.sequence()());
  assertCallOrderAndReset([]);

  assert(goog.functions.sequence(fTrue)());
  assertCallOrderAndReset(['fTrue']);

  assertFalse(goog.functions.sequence(fTrue, gFalse)());
  assertCallOrderAndReset(['fTrue', 'gFalse']);

  assert(goog.functions.sequence(fTrue, gFalse, hTrue)());
  assertCallOrderAndReset(['fTrue', 'gFalse', 'hTrue']);

  assert(goog.functions.sequence(goog.functions.identity)(true));
  assertFalse(goog.functions.sequence(goog.functions.identity)(false));
}

function testAnd() {
  // the return value is unspecified for an empty and
  goog.functions.and()();
  assertCallOrderAndReset([]);

  assert(goog.functions.and(fTrue)());
  assertCallOrderAndReset(['fTrue']);

  assertFalse(goog.functions.and(fTrue, gFalse)());
  assertCallOrderAndReset(['fTrue', 'gFalse']);

  assertFalse(goog.functions.and(fTrue, gFalse, hTrue)());
  assertCallOrderAndReset(['fTrue', 'gFalse']);

  assert(goog.functions.and(goog.functions.identity)(true));
  assertFalse(goog.functions.and(goog.functions.identity)(false));
}

function testOr() {
  // the return value is unspecified for an empty or
  goog.functions.or()();
  assertCallOrderAndReset([]);

  assert(goog.functions.or(fTrue)());
  assertCallOrderAndReset(['fTrue']);

  assert(goog.functions.or(fTrue, gFalse)());
  assertCallOrderAndReset(['fTrue']);

  assert(goog.functions.or(fTrue, gFalse, hTrue)());
  assertCallOrderAndReset(['fTrue']);

  assert(goog.functions.or(goog.functions.identity)(true));
  assertFalse(goog.functions.or(goog.functions.identity)(false));
}

function testNot() {
  assertTrue(goog.functions.not(gFalse)());
  assertCallOrderAndReset(['gFalse']);

  assertTrue(goog.functions.not(goog.functions.identity)(false));
  assertFalse(goog.functions.not(goog.functions.identity)(true));

  var f = function(a, b) {
    assertEquals(1, a);
    assertEquals(2, b);
    return false;
  };

  assertTrue(goog.functions.not(f)(1, 2));
}

function testCreate(expectedArray) {
  var tempConstructor = function(a, b) {
    this.foo = a;
    this.bar = b;
  };

  var factory = goog.partial(goog.functions.create, tempConstructor, 'baz');
  var instance = factory('qux');

  assert(instance instanceof tempConstructor);
  assertEquals(instance.foo, 'baz');
  assertEquals(instance.bar, 'qux');
}

function testWithReturnValue() {
  var obj = {};
  var f = function(a, b) {
    assertEquals(obj, this);
    assertEquals(1, a);
    assertEquals(2, b);
  };
  assertTrue(goog.functions.withReturnValue(f, true).call(obj, 1, 2));
  assertFalse(goog.functions.withReturnValue(f, false).call(obj, 1, 2));
}

function testEqualTo() {
  assertTrue(goog.functions.equalTo(42)(42));
  assertFalse(goog.functions.equalTo(42)(13));
  assertFalse(goog.functions.equalTo(42)('a string'));

  assertFalse(goog.functions.equalTo(42)('42'));
  assertTrue(goog.functions.equalTo(42, true)('42'));

  assertTrue(goog.functions.equalTo(0)(0));
  assertFalse(goog.functions.equalTo(0)(''));
  assertFalse(goog.functions.equalTo(0)(1));

  assertTrue(goog.functions.equalTo(0, true)(0));
  assertTrue(goog.functions.equalTo(0, true)(''));
  assertFalse(goog.functions.equalTo(0, true)(1));
}

function makeCallOrderLogger(name, returnValue) {
  return function() {
    callOrder.push(name);
    return returnValue;
  };
}

function assertCallOrderAndReset(expectedArray) {
  assertArrayEquals(expectedArray, callOrder);
  callOrder = [];
}

function testCacheReturnValue() {
  var returnFive = function() { return 5; };

  var recordedReturnFive = goog.testing.recordFunction(returnFive);
  var cachedRecordedReturnFive =
      goog.functions.cacheReturnValue(recordedReturnFive);

  assertEquals(0, recordedReturnFive.getCallCount());
  assertEquals(5, cachedRecordedReturnFive());
  assertEquals(1, recordedReturnFive.getCallCount());
  assertEquals(5, cachedRecordedReturnFive());
  assertEquals(1, recordedReturnFive.getCallCount());
}


function testCacheReturnValueFlagEnabled() {
  var count = 0;
  var returnIncrementingInteger = function() {
    count++;
    return count;
  };

  var recordedFunction = goog.testing.recordFunction(returnIncrementingInteger);
  var cachedRecordedFunction =
      goog.functions.cacheReturnValue(recordedFunction);

  assertEquals(0, recordedFunction.getCallCount());
  assertEquals(1, cachedRecordedFunction());
  assertEquals(1, recordedFunction.getCallCount());
  assertEquals(1, cachedRecordedFunction());
  assertEquals(1, recordedFunction.getCallCount());
  assertEquals(1, cachedRecordedFunction());
}


function testCacheReturnValueFlagDisabled() {
  stubs.set(goog.functions, 'CACHE_RETURN_VALUE', false);

  var count = 0;
  var returnIncrementingInteger = function() {
    count++;
    return count;
  };

  var recordedFunction = goog.testing.recordFunction(returnIncrementingInteger);
  var cachedRecordedFunction =
      goog.functions.cacheReturnValue(recordedFunction);

  assertEquals(0, recordedFunction.getCallCount());
  assertEquals(1, cachedRecordedFunction());
  assertEquals(1, recordedFunction.getCallCount());
  assertEquals(2, cachedRecordedFunction());
  assertEquals(2, recordedFunction.getCallCount());
  assertEquals(3, cachedRecordedFunction());
}


function testOnce() {
  var recordedFunction = goog.testing.recordFunction();
  var f = goog.functions.once(recordedFunction);

  assertEquals(0, recordedFunction.getCallCount());
  f();
  assertEquals(1, recordedFunction.getCallCount());
  f();
  assertEquals(1, recordedFunction.getCallCount());
}


function testDebounce() {
  // Encoded sequences of commands to perform mapped to expected # of calls.
  //   f: fire
  //   w: wait (for the timer to elapse)
  assertAsyncDecoratorCommandSequenceCalls(goog.functions.debounce, {
    'f': 0,
    'ff': 0,
    'fff': 0,
    'fw': 1,
    'ffw': 1,
    'fffw': 1,
    'fwffwf': 2,
    'ffwwwffwwfwf': 3
  });
}


function testDebounceScopeBinding() {
  var interval = 500;
  var mockClock = new goog.testing.MockClock(true);

  var x = {'y': 0};
  goog.functions.debounce(function() { ++this['y']; }, interval, x)();
  assertEquals(0, x['y']);

  mockClock.tick(interval);
  assertEquals(1, x['y']);

  mockClock.uninstall();
}


function testDebounceArgumentBinding() {
  var interval = 500;
  var mockClock = new goog.testing.MockClock(true);

  var calls = 0;
  var debouncedFn = goog.functions.debounce(function(a, b, c) {
    ++calls;
    assertEquals(3, a);
    assertEquals('string', b);
    assertEquals(false, c);
  }, interval);

  debouncedFn(3, 'string', false);
  mockClock.tick(interval);
  assertEquals(1, calls);

  // goog.functions.debounce should always pass the last arguments passed to the
  // decorator into the decorated function, even if called multiple times.
  debouncedFn();
  mockClock.tick(interval / 2);
  debouncedFn(8, null, true);
  debouncedFn(3, 'string', false);
  mockClock.tick(interval);
  assertEquals(2, calls);

  mockClock.uninstall();
}


function testDebounceArgumentAndScopeBinding() {
  var interval = 500;
  var mockClock = new goog.testing.MockClock(true);

  var x = {'calls': 0};
  var debouncedFn = goog.functions.debounce(function(a, b, c) {
    ++this['calls'];
    assertEquals(3, a);
    assertEquals('string', b);
    assertEquals(false, c);
  }, interval, x);

  debouncedFn(3, 'string', false);
  mockClock.tick(interval);
  assertEquals(1, x['calls']);

  // goog.functions.debounce should always pass the last arguments passed to the
  // decorator into the decorated function, even if called multiple times.
  debouncedFn();
  mockClock.tick(interval / 2);
  debouncedFn(8, null, true);
  debouncedFn(3, 'string', false);
  mockClock.tick(interval);
  assertEquals(2, x['calls']);

  mockClock.uninstall();
}


function testThrottle() {
  // Encoded sequences of commands to perform mapped to expected # of calls.
  //   f: fire
  //   w: wait (for the timer to elapse)
  assertAsyncDecoratorCommandSequenceCalls(goog.functions.throttle, {
    'f': 1,
    'ff': 1,
    'fff': 1,
    'fw': 1,
    'ffw': 2,
    'fwf': 2,
    'fffw': 2,
    'fwfff': 2,
    'fwfffw': 3,
    'fwffwf': 3,
    'ffwf': 2,
    'ffwff': 2,
    'ffwfw': 3,
    'ffwffwf': 3,
    'ffwffwff': 3,
    'ffwffwffw': 4,
    'ffwwwffwwfw': 5,
    'ffwwwffwwfwf': 6
  });
}


function testThrottleScopeBinding() {
  var interval = 500;
  var mockClock = new goog.testing.MockClock(true);

  var x = {'y': 0};
  goog.functions.throttle(function() { ++this['y']; }, interval, x)();
  assertEquals(1, x['y']);

  mockClock.uninstall();
}


function testThrottleArgumentBinding() {
  var interval = 500;
  var mockClock = new goog.testing.MockClock(true);

  var calls = 0;
  var throttledFn = goog.functions.throttle(function(a, b, c) {
    ++calls;
    assertEquals(3, a);
    assertEquals('string', b);
    assertEquals(false, c);
  }, interval);

  throttledFn(3, 'string', false);
  assertEquals(1, calls);

  // goog.functions.throttle should always pass the last arguments passed to the
  // decorator into the decorated function, even if called multiple times.
  throttledFn();
  mockClock.tick(interval / 2);
  throttledFn(8, null, true);
  throttledFn(3, 'string', false);
  mockClock.tick(interval);
  assertEquals(2, calls);

  mockClock.uninstall();
}


function testThrottleArgumentAndScopeBinding() {
  var interval = 500;
  var mockClock = new goog.testing.MockClock(true);

  var x = {'calls': 0};
  var throttledFn = goog.functions.throttle(function(a, b, c) {
    ++this['calls'];
    assertEquals(3, a);
    assertEquals('string', b);
    assertEquals(false, c);
  }, interval, x);

  throttledFn(3, 'string', false);
  assertEquals(1, x['calls']);

  // goog.functions.throttle should always pass the last arguments passed to the
  // decorator into the decorated function, even if called multiple times.
  throttledFn();
  mockClock.tick(interval / 2);
  throttledFn(8, null, true);
  throttledFn(3, 'string', false);
  mockClock.tick(interval);
  assertEquals(2, x['calls']);

  mockClock.uninstall();
}


/**
 * Wraps a {@code goog.testing.recordFunction} with the specified decorator and
 * executes a list of command sequences, asserting that in each case the
 * decorated function is called the expected number of times.
 * @param {function():*} decorator The async decorator to test.
 * @param {!Object.<string, number>} expectedCommandSequenceCalls An object
 *     mapping string command sequences (where 'f' is 'fire' and 'w' is 'wait')
 *     to the number times we expect a decorated function to be called during
 *     the execution of those commands.
 */
function assertAsyncDecoratorCommandSequenceCalls(
    decorator, expectedCommandSequenceCalls) {
  var interval = 500;

  var mockClock = new goog.testing.MockClock(true);
  for (var commandSequence in expectedCommandSequenceCalls) {
    var recordedFunction = goog.testing.recordFunction();
    var f = decorator(recordedFunction, interval);

    for (var i = 0; i < commandSequence.length; ++i) {
      switch (commandSequence[i]) {
        case 'f':
          f();
          break;
        case 'w':
          mockClock.tick(interval);
          break;
      }
    }

    var expectedCalls = expectedCommandSequenceCalls[commandSequence];
    assertEquals(
        'Expected ' + expectedCalls + ' calls for command sequence "' +
            commandSequence + '" (' +
            goog.array
                .map(
                    commandSequence,
                    function(command) {
                      switch (command) {
                        case 'f':
                          return 'fire';
                        case 'w':
                          return 'wait';
                      }
                    })
                .join(' -> ') +
            ')',
        expectedCalls, recordedFunction.getCallCount());
  }
  mockClock.uninstall();
}
