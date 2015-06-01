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

goog.require('goog.functions');
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
  var add2 = function(x) {
    return x + 2;
  };

  var doubleValue = function(x) {
    return x * 2;
  };

  assertEquals(6, goog.functions.compose(doubleValue, add2)(1));
  assertEquals(4, goog.functions.compose(add2, doubleValue)(1));
  assertEquals(6, goog.functions.compose(add2, add2, doubleValue)(1));
  assertEquals(12,
      goog.functions.compose(doubleValue, add2, add2, doubleValue)(1));
  assertUndefined(goog.functions.compose()(1));
  assertEquals(3, goog.functions.compose(add2)(1));

  var add2Numbers = function(x, y) {
    return x + y;
  };
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
  var returnFive = function() {
    return 5;
  };

  var recordedReturnFive = goog.testing.recordFunction(returnFive);
  var cachedRecordedReturnFive = goog.functions.cacheReturnValue(
      recordedReturnFive);

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

  var recordedFunction = goog.testing.recordFunction(
      returnIncrementingInteger);
  var cachedRecordedFunction = goog.functions.cacheReturnValue(
      recordedFunction);

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

  var recordedFunction = goog.testing.recordFunction(
      returnIncrementingInteger);
  var cachedRecordedFunction = goog.functions.cacheReturnValue(
      recordedFunction);

  assertEquals(0, recordedFunction.getCallCount());
  assertEquals(1, cachedRecordedFunction());
  assertEquals(1, recordedFunction.getCallCount());
  assertEquals(2, cachedRecordedFunction());
  assertEquals(2, recordedFunction.getCallCount());
  assertEquals(3, cachedRecordedFunction());
}
