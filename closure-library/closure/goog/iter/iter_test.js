// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.iterTest');
goog.setTestOnly('goog.iterTest');

goog.require('goog.iter');
goog.require('goog.iter.Iterator');
goog.require('goog.iter.StopIteration');
goog.require('goog.testing.jsunit');

function ArrayIterator(array) {
  this.array_ = array;
  this.current_ = 0;
}
goog.inherits(ArrayIterator, goog.iter.Iterator);

ArrayIterator.prototype.next = function() {
  if (this.current_ >= this.array_.length) {
    throw goog.iter.StopIteration;
  }
  return this.array_[this.current_++];
};

function testForEach() {
  var s = '';
  var iter = new ArrayIterator(['a', 'b', 'c', 'd']);
  goog.iter.forEach(iter, function(val, index, iter2) {
    assertEquals(iter, iter2);
    assertEquals('index should be undefined', 'undefined', typeof index);
    s += val;
  });
  assertEquals('abcd', s);
}

function testJoin() {
  var iter = new ArrayIterator(['a', 'b', 'c', 'd']);
  assertEquals('abcd', goog.iter.join(iter, ''));

  iter = new ArrayIterator(['a', 'b', 'c', 'd']);
  assertEquals('a,b,c,d', goog.iter.join(iter, ','));

  // make sure everything is treated as strings
  iter = new ArrayIterator([0, 1, 2, 3]);
  assertEquals('0123', goog.iter.join(iter, ''));

  iter = new ArrayIterator([0, 1, 2, 3]);
  assertEquals('0919293', goog.iter.join(iter, 9));

  // Joining an empty iterator should result in an empty string
  iter = new ArrayIterator([]);
  assertEquals('', goog.iter.join(iter, ','));
}

function testRange() {
  var iter = goog.iter.range(0, 5, 1);
  assertEquals('01234', goog.iter.join(iter, ''));

  iter = goog.iter.range(0, 5, 2);
  assertEquals('024', goog.iter.join(iter, ''));

  iter = goog.iter.range(0, 5, 5);
  assertEquals('0', goog.iter.join(iter, ''));

  iter = goog.iter.range(0, 5, 10);
  assertEquals('0', goog.iter.join(iter, ''));

  // negative step
  var iter = goog.iter.range(5, 0, -1);
  assertEquals('54321', goog.iter.join(iter, ''));


  iter = goog.iter.range(5, 0, -2);
  assertEquals('531', goog.iter.join(iter, ''));

  iter = goog.iter.range(5, 0, -5);
  assertEquals('5', goog.iter.join(iter, ''));

  iter = goog.iter.range(5, 0, -10);
  assertEquals('5', goog.iter.join(iter, ''));

  // wrong direction should result in empty iterator
  iter = goog.iter.range(0, 5, -1);
  assertEquals('', goog.iter.join(iter, ''));

  iter = goog.iter.range(5, 0, 1);
  assertEquals('', goog.iter.join(iter, ''));

  // a step of 0 is not allowed
  goog.iter.range(0, 5, 0);

  // test the opt args
  iter = goog.iter.range(0, 5);
  assertEquals('01234', goog.iter.join(iter, ''));

  iter = goog.iter.range(5);
  assertEquals('01234', goog.iter.join(iter, ''));
}

function testFilter() {
  var iter = goog.iter.range(5);
  var iter2 = goog.iter.filter(iter, function(val, index, iter3) {
    assertEquals(iter, iter3);
    assertEquals('index should be undefined', 'undefined', typeof index);
    return val > 1;
  });

  assertEquals('234', goog.iter.join(iter2, ''));

  // Chaining filters
  iter = goog.iter.range(10);
  var sb = [];
  var evens = goog.iter.filter(iter, function(v) {
    sb.push('a' + v);
    return v % 2 == 0;
  });
  var evens2 = goog.iter.filter(evens, function(v) {
    sb.push('b' + v);
    return v >= 5;
  });

  assertEquals('68', goog.iter.join(evens2, ''));
  // Note the order here. The next calls are done lazily.
  assertEquals('a0b0a1a2b2a3a4b4a5a6b6a7a8b8a9', sb.join(''));
}

function testFilterFalse() {
  var iter = goog.iter.range(5);
  var iter2 = goog.iter.filterFalse(iter, function(val, index, iter3) {
    assertEquals(iter, iter3);
    assertEquals('index should be undefined', 'undefined', typeof index);
    return val < 2;
  });

  assertEquals('234', goog.iter.join(iter2, ''));

  // Chaining filters
  iter = goog.iter.range(10);
  var sb = [];
  var odds = goog.iter.filterFalse(iter, function(v) {
    sb.push('a' + v);
    return v % 2 == 0;
  });
  var odds2 = goog.iter.filterFalse(odds, function(v) {
    sb.push('b' + v);
    return v <= 5;
  });

  assertEquals('79', goog.iter.join(odds2, ''));
  // Note the order here. The next calls are done lazily.
  assertEquals('a0a1b1a2a3b3a4a5b5a6a7b7a8a9b9', sb.join(''));
}

function testMap() {
  var iter = goog.iter.range(4);
  var iter2 = goog.iter.map(iter, function(val, index, iter3) {
    assertEquals(iter, iter3);
    assertEquals('index should be undefined', 'undefined', typeof index);
    return val * val;
  });
  assertEquals('0149', goog.iter.join(iter2, ''));
}

function testReduce() {
  var iter = goog.iter.range(1, 5);
  assertEquals(
      10,  // 1 + 2 + 3 + 4
      goog.iter.reduce(iter, function(val, el) { return val + el; }, 0));
}

function testReduce2() {
  var iter = goog.iter.range(1, 5);
  assertEquals(
      24,  // 4!
      goog.iter.reduce(iter, function(val, el) { return val * el; }, 1));
}

function testSome() {
  var iter = goog.iter.range(5);
  var b = goog.iter.some(iter, function(val, index, iter3) {
    assertEquals(iter, iter3);
    assertEquals('index should be undefined', 'undefined', typeof index);
    return val > 1;
  });
  assertTrue(b);
  iter = goog.iter.range(5);
  b = goog.iter.some(iter, function(val, index, iter3) {
    assertEquals(iter, iter3);
    assertEquals('index should be undefined', 'undefined', typeof index);
    return val > 100;
  });
  assertFalse(b);
}


function testEvery() {
  var iter = goog.iter.range(5);
  var b = goog.iter.every(iter, function(val, index, iter3) {
    assertEquals(iter, iter3);
    assertEquals('index should be undefined', 'undefined', typeof index);
    return val >= 0;
  });
  assertTrue(b);
  iter = goog.iter.range(5);
  b = goog.iter.every(iter, function(val, index, iter3) {
    assertEquals(iter, iter3);
    assertEquals('index should be undefined', 'undefined', typeof index);
    return val > 1;
  });
  assertFalse(b);
}

function testChain() {
  var iter = goog.iter.range(0, 2);
  var iter2 = goog.iter.range(2, 4);
  var iter3 = goog.iter.range(4, 6);
  var iter4 = goog.iter.chain(iter, iter2, iter3);

  assertEquals('012345', goog.iter.join(iter4, ''));

  // empty iter
  iter = new goog.iter.Iterator;
  iter2 = goog.iter.chain(iter);
  assertEquals('', goog.iter.join(iter2, ''));

  // no args
  iter2 = goog.iter.chain();
  assertEquals('', goog.iter.join(iter2, ''));

  // arrays
  var arr = [0, 1];
  var arr2 = [2, 3];
  var arr3 = [4, 5];
  iter = goog.iter.chain(arr, arr2, arr3);
  assertEquals('012345', goog.iter.join(iter, ''));
}

function testChainFromIterable() {
  var arg = [0, 1];
  var arg2 = [2, 3];
  var arg3 = goog.iter.range(4, 6);
  var iter = goog.iter.chainFromIterable([arg, arg2, arg3]);
  assertEquals('012345', goog.iter.join(iter, ''));
}

function testChainFromIterable2() {
  var arg = goog.iter.zip([0, 3], [1, 4], [2, 5]);
  var iter = goog.iter.chainFromIterable(arg);
  assertEquals('012345', goog.iter.join(iter, ''));
}

function testDropWhile() {
  var iter = goog.iter.range(10);
  var iter2 = goog.iter.dropWhile(iter, function(val, index, iter3) {
    assertEquals(iter, iter3);
    assertEquals('index should be undefined', 'undefined', typeof index);
    return val < 5;
  });

  assertEquals('56789', goog.iter.join(iter2, ''));
}

function testDropWhile2() {
  var iter = goog.iter.range(10);
  var iter2 = goog.iter.dropWhile(iter, function(val, index, iter3) {
    assertEquals(iter, iter3);
    assertEquals('index should be undefined', 'undefined', typeof index);
    return val != 5;
  });

  assertEquals('56789', goog.iter.join(iter2, ''));
}


function testTakeWhile() {
  var iter = goog.iter.range(10);
  var iter2 = goog.iter.takeWhile(iter, function(val, index, iter3) {
    assertEquals(iter, iter3);
    assertEquals('index should be undefined', 'undefined', typeof index);
    return val < 5;
  });

  assertEquals('01234', goog.iter.join(iter2, ''));

  // next() should not have been called on iter after the first failure and
  // therefore it should contain some elements.  5 failed so we should have
  // the rest
  assertEquals('6789', goog.iter.join(iter, ''));
}

function testTakeWhile2() {
  var iter = goog.iter.range(10);
  var iter2 = goog.iter.takeWhile(iter, function(val, index, iter3) {
    assertEquals(iter, iter3);
    assertEquals('index should be undefined', 'undefined', typeof index);
    return val != 5;
  });

  assertEquals('01234', goog.iter.join(iter2, ''));

  // next() should not have been called on iter after the first failure and
  // therefore it should contain some elements.  5 failed so we should have
  // the rest
  assertEquals('6789', goog.iter.join(iter, ''));
}

function testToArray() {
  var iter = goog.iter.range(5);
  var array = goog.iter.toArray(iter);
  assertEquals('01234', array.join(''));

  // Empty
  iter = new goog.iter.Iterator;
  array = goog.iter.toArray(iter);
  assertEquals('Empty iterator to array', '', array.join(''));
}

function testToArray2() {
  var iterable = [0, 1, 2, 3, 4];
  var array = goog.iter.toArray(iterable);
  assertEquals('01234', array.join(''));

  // Empty
  iterable = [];
  array = goog.iter.toArray(iterable);
  assertEquals('Empty iterator to array', '', array.join(''));
}

function testEquals() {
  var iter = goog.iter.range(5);
  var iter2 = goog.iter.range(5);
  assertTrue('Equal iterators', goog.iter.equals(iter, iter2));

  iter = goog.iter.range(4);
  iter2 = goog.iter.range(5);
  assertFalse('Second one is longer', goog.iter.equals(iter, iter2));

  iter = goog.iter.range(5);
  iter2 = goog.iter.range(4);
  assertFalse('First one is longer', goog.iter.equals(iter, iter2));

  // 2 empty iterators
  iter = new goog.iter.Iterator;
  iter2 = new goog.iter.Iterator;
  assertTrue('Two empty iterators are equal', goog.iter.equals(iter, iter2));

  iter = goog.iter.range(4);
  assertFalse('Same iterator', goog.iter.equals(iter, iter));

  // equality function
  iter = goog.iter.toIterator(['A', 'B', 'C']);
  iter2 = goog.iter.toIterator(['a', 'b', 'c']);
  var equalsFn = function(a, b) { return a.toLowerCase() == b.toLowerCase(); };
  assertTrue('Case-insensitive equal', goog.iter.equals(iter, iter2, equalsFn));
}


function testToIterator() {
  var iter = new goog.iter.range(5);
  var iter2 = goog.iter.toIterator(iter);
  assertEquals(
      'toIterator on an iterator should return the same obejct', iter, iter2);

  var iterLikeObject = {next: function() { throw goog.iter.StopIteration; }};
  var obj = {
    __iterator__: function(opt_keys) {
      assertFalse(
          '__iterator__ should always be called with false in toIterator',
          opt_keys);
      return iterLikeObject;
    }
  };

  assertEquals(
      'Should return the return value of __iterator_(false)', iterLikeObject,
      goog.iter.toIterator(obj));

  // Array
  var array = [0, 1, 2, 3, 4];
  iter = goog.iter.toIterator(array);
  assertEquals('01234', goog.iter.join(iter, ''));

  // Array like
  var arrayLike = {'0': 0, '1': 1, '2': 2, length: 3};
  iter = goog.iter.toIterator(arrayLike);
  assertEquals('012', goog.iter.join(iter, ''));

  // DOM
  var dom = document.getElementById('t1').childNodes;
  iter = goog.iter.toIterator(dom);
  iter2 = goog.iter.map(iter, function(el) { return el.innerHTML; });
  assertEquals('012', goog.iter.join(iter2, ''));
}


function testNextOrValue() {
  var iter = goog.iter.toIterator([1]);

  assertEquals(
      'Should return value when iterator is non-empty', 1,
      goog.iter.nextOrValue(iter, null));
  assertNull(
      'Should return given default when iterator is empty',
      goog.iter.nextOrValue(iter, null));
  assertEquals(
      'Should return given default when iterator is (still) empty', -1,
      goog.iter.nextOrValue(iter, -1));
}

// Return the product of several arrays as an array
function productAsArray(var_args) {
  var iter = goog.iter.product.apply(null, arguments);
  return goog.iter.toArray(iter);
}

function testProduct() {
  assertArrayEquals(
      [[1, 3], [1, 4], [2, 3], [2, 4]], productAsArray([1, 2], [3, 4]));

  assertArrayEquals(
      [
        [1, 3, 5], [1, 3, 6], [1, 4, 5], [1, 4, 6], [2, 3, 5], [2, 3, 6],
        [2, 4, 5], [2, 4, 6]
      ],
      productAsArray([1, 2], [3, 4], [5, 6]));

  assertArrayEquals([[1]], productAsArray([1]));
  assertArrayEquals([], productAsArray([1], []));
  assertArrayEquals([], productAsArray());

  var expectedResult = [];
  var a = [1, 2, 3];
  var b = [4, 5, 6];
  var c = [7, 8, 9];
  for (var i = 0; i < a.length; i++) {
    for (var j = 0; j < b.length; j++) {
      for (var k = 0; k < c.length; k++) {
        expectedResult.push([a[i], b[j], c[k]]);
      }
    }
  }

  assertArrayEquals(expectedResult, productAsArray(a, b, c));
}

function testProductIteration() {
  var iter = goog.iter.product([1, 2], [3, 4]);

  assertArrayEquals([1, 3], iter.next());
  assertArrayEquals([1, 4], iter.next());
  assertArrayEquals([2, 3], iter.next());
  assertArrayEquals([2, 4], iter.next());

  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);

  // Ensure the iterator forever throws StopIteration.
  for (var i = 0; i < 5; i++) {
    var ex = assertThrows(function() { iter.next() });
    assertEquals(goog.iter.StopIteration, ex);
  }

  iter = goog.iter.product();
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);

  iter = goog.iter.product([]);
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);
}

function testCycle() {
  var regularArray = [1, 2, 3];
  var iter = goog.iter.cycle(regularArray);

  // Test 3 cycles to ensure proper cache behavior
  var values = [];
  for (var i = 0; i < 9; i++) {
    values.push(iter.next());
  }

  assertArrayEquals([1, 2, 3, 1, 2, 3, 1, 2, 3], values);
}

function testCycleSingleItemIterable() {
  var singleItemArray = [1];

  var iter = goog.iter.cycle(singleItemArray);
  var values = [];

  for (var i = 0; i < 5; i++) {
    values.push(iter.next());
  }

  assertArrayEquals([1, 1, 1, 1, 1], values);
}

function testCycleEmptyIterable() {
  var emptyArray = [];

  var iter = goog.iter.cycle(emptyArray);
  var ex = assertThrows(function() { iter.next(); });
  assertEquals(goog.iter.StopIteration, ex);
}

function testCountNoArgs() {
  var iter = goog.iter.count();
  var values = goog.iter.limit(iter, 5);
  assertArrayEquals([0, 1, 2, 3, 4], goog.iter.toArray(values));
}

function testCountStart() {
  var iter = goog.iter.count(10);
  var values = goog.iter.limit(iter, 5);
  assertArrayEquals([10, 11, 12, 13, 14], goog.iter.toArray(values));
}

function testCountStep() {
  var iter = goog.iter.count(10, 2);
  var values = goog.iter.limit(iter, 5);
  assertArrayEquals([10, 12, 14, 16, 18], goog.iter.toArray(values));
}

function testCountNegativeStep() {
  var iter = goog.iter.count(10, -2);
  var values = goog.iter.limit(iter, 5);
  assertArrayEquals([10, 8, 6, 4, 2], goog.iter.toArray(values));
}

function testCountZeroStep() {
  var iter = goog.iter.count(42, 0);
  assertEquals(42, iter.next());
  assertEquals(42, iter.next());
  assertEquals(42, iter.next());
}

function testCountFloat() {
  var iter = goog.iter.count(1.5, 0.5);
  var values = goog.iter.limit(iter, 5);
  assertArrayEquals([1.5, 2.0, 2.5, 3.0, 3.5], goog.iter.toArray(values));
}

function testRepeat() {
  var obj = {foo: 'bar'};
  var iter = goog.iter.repeat(obj);
  assertEquals(obj, iter.next());
  assertEquals(obj, iter.next());
  assertEquals(obj, iter.next());
}

function testAccumulateArray() {
  var iter = goog.iter.accumulate([1, 2, 3, 4, 5]);
  assertArrayEquals([1, 3, 6, 10, 15], goog.iter.toArray(iter));
}

function testAccumulateIterator() {
  var iter = goog.iter.accumulate(goog.iter.range(1, 6));
  assertArrayEquals([1, 3, 6, 10, 15], goog.iter.toArray(iter));
}

function testAccumulateFloat() {
  var iter = goog.iter.accumulate([1.0, 2.5, 0.5, 1.5, 0.5]);
  assertArrayEquals([1.0, 3.5, 4.0, 5.5, 6.0], goog.iter.toArray(iter));
}

function testZipArrays() {
  var iter = goog.iter.zip([1, 2, 3], [4, 5, 6], [7, 8, 9]);
  assertArrayEquals([1, 4, 7], iter.next());
  assertArrayEquals([2, 5, 8], iter.next());
  assertArrayEquals([3, 6, 9], iter.next());
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);
}

function testZipSingleArg() {
  var iter = goog.iter.zip([1, 2, 3]);
  assertArrayEquals([1], iter.next());
  assertArrayEquals([2], iter.next());
  assertArrayEquals([3], iter.next());
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);
}

function testZipUnevenArgs() {
  var iter = goog.iter.zip([1, 2, 3], [4, 5], [7]);
  assertArrayEquals([1, 4, 7], iter.next());
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);
}

function testZipNoArgs() {
  var iter = goog.iter.zip();
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);
}

function testZipIterators() {
  var iter = goog.iter.zip(goog.iter.count(), goog.iter.repeat('foo'));
  assertArrayEquals([0, 'foo'], iter.next());
  assertArrayEquals([1, 'foo'], iter.next());
  assertArrayEquals([2, 'foo'], iter.next());
  assertArrayEquals([3, 'foo'], iter.next());
}

function testZipLongestArrays() {
  var iter = goog.iter.zipLongest('-', 'ABCD'.split(''), 'xy'.split(''));
  assertArrayEquals(['A', 'x'], iter.next());
  assertArrayEquals(['B', 'y'], iter.next());
  assertArrayEquals(['C', '-'], iter.next());
  assertArrayEquals(['D', '-'], iter.next());
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);
}

function testZipLongestSingleArg() {
  var iter = goog.iter.zipLongest('-', 'ABCD'.split(''));
  assertArrayEquals(['A'], iter.next());
  assertArrayEquals(['B'], iter.next());
  assertArrayEquals(['C'], iter.next());
  assertArrayEquals(['D'], iter.next());
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);
}

function testZipLongestNoArgs() {
  var iter = goog.iter.zipLongest();
  assertArrayEquals([], goog.iter.toArray(iter));
  var iter = goog.iter.zipLongest('fill');
  assertArrayEquals([], goog.iter.toArray(iter));
}

function testZipLongestIterators() {
  var iter = goog.iter.zipLongest(null, goog.iter.range(3), goog.iter.range(5));
  assertArrayEquals([0, 0], iter.next());
  assertArrayEquals([1, 1], iter.next());
  assertArrayEquals([2, 2], iter.next());
  assertArrayEquals([null, 3], iter.next());
  assertArrayEquals([null, 4], iter.next());
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);
}

function testCompressArray() {
  var iter = goog.iter.compress('ABCDEF'.split(''), [1, 0, 1, 0, 1, 1]);
  assertEquals('ACEF', goog.iter.join(iter, ''));
}

function testCompressUnevenArgs() {
  var iter = goog.iter.compress('ABCDEF'.split(''), [false, true, true]);
  assertEquals('BC', goog.iter.join(iter, ''));
}

function testCompressIterators() {
  var iter = goog.iter.compress(goog.iter.range(10), goog.iter.cycle([0, 1]));
  assertArrayEquals([1, 3, 5, 7, 9], goog.iter.toArray(iter));
}

function testGroupByNoKeyFunc() {
  var iter = goog.iter.groupBy('AAABBBBCDD'.split(''));
  assertArrayEquals(['A', ['A', 'A', 'A']], iter.next());
  assertArrayEquals(['B', ['B', 'B', 'B', 'B']], iter.next());
  assertArrayEquals(['C', ['C']], iter.next());
  assertArrayEquals(['D', ['D', 'D']], iter.next());
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);
}

function testGroupByKeyFunc() {
  var keyFunc = function(x) { return x.toLowerCase(); };
  var iter = goog.iter.groupBy('AaAABBbbBCccddDD'.split(''), keyFunc);
  assertArrayEquals(['a', ['A', 'a', 'A', 'A']], iter.next());
  assertArrayEquals(['b', ['B', 'B', 'b', 'b', 'B']], iter.next());
  assertArrayEquals(['c', ['C', 'c', 'c']], iter.next());
  assertArrayEquals(['d', ['d', 'd', 'D', 'D']], iter.next());
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);
}

function testStarMap() {
  var iter = goog.iter.starMap([[2, 5], [3, 2], [10, 3]], Math.pow);
  assertEquals(32, iter.next());
  assertEquals(9, iter.next());
  assertEquals(1000, iter.next());
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);
}

function testStarMapExtraArgs() {
  var func = function(string, radix, undef, iterator) {
    assertEquals('undef should be undefined', 'undefined', typeof undef);
    assertTrue(iterator instanceof goog.iter.Iterator);
    return parseInt(string, radix);
  };
  var iter = goog.iter.starMap([['42', 10], ['0xFF', 16], ['101', 2]], func);
  assertEquals(42, iter.next());
  assertEquals(255, iter.next());
  assertEquals(5, iter.next());
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);
}

function testTeeArray() {
  var iters = goog.iter.tee('ABC'.split(''));
  assertEquals(2, iters.length);
  var it0 = iters[0], it1 = iters[1];
  assertEquals('A', it0.next());
  assertEquals('A', it1.next());
  assertEquals('B', it0.next());
  assertEquals('B', it1.next());
  assertEquals('C', it0.next());
  assertEquals('C', it1.next());
  var ex = assertThrows(function() { it0.next() });
  assertEquals(goog.iter.StopIteration, ex);
  ex = assertThrows(function() { it1.next() });
  assertEquals(goog.iter.StopIteration, ex);
}

function testTeeIterator() {
  var iters = goog.iter.tee(goog.iter.count(), 3);
  assertEquals(3, iters.length);
  var it0 = iters[0], it1 = iters[1], it2 = iters[2];
  assertEquals(0, it0.next());
  assertEquals(1, it0.next());
  assertEquals(0, it1.next());
  assertEquals(1, it1.next());
  assertEquals(2, it1.next());
  assertEquals(2, it0.next());
  assertEquals(0, it2.next());
  assertEquals(1, it2.next());
  assertEquals(2, it2.next());
  assertEquals(3, it0.next());
  assertEquals(3, it1.next());
  assertEquals(3, it2.next());
}

function testEnumerateNoStart() {
  var iter = goog.iter.enumerate('ABC'.split(''));
  assertArrayEquals([0, 'A'], iter.next());
  assertArrayEquals([1, 'B'], iter.next());
  assertArrayEquals([2, 'C'], iter.next());
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);
}

function testEnumerateStart() {
  var iter = goog.iter.enumerate('DEF'.split(''), 3);
  assertArrayEquals([3, 'D'], iter.next());
  assertArrayEquals([4, 'E'], iter.next());
  assertArrayEquals([5, 'F'], iter.next());
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);
}

function testLimitLess() {
  var iter = goog.iter.limit('ABCDEFG'.split(''), 3);
  assertEquals('ABC', goog.iter.join(iter, ''));
}

function testLimitGreater() {
  var iter = goog.iter.limit('ABCDEFG'.split(''), 10);
  assertEquals('ABCDEFG', goog.iter.join(iter, ''));
}

function testConsumeLess() {
  var iter = goog.iter.consume('ABCDEFG'.split(''), 3);
  assertEquals('DEFG', goog.iter.join(iter, ''));
}

function testConsumeGreater() {
  var iter = goog.iter.consume('ABCDEFG'.split(''), 10);
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);
}

function testSliceStart() {
  var iter = goog.iter.slice('ABCDEFG'.split(''), 2);
  assertEquals('CDEFG', goog.iter.join(iter, ''));
}

function testSliceStop() {
  var iter = goog.iter.slice('ABCDEFG'.split(''), 2, 4);
  assertEquals('CD', goog.iter.join(iter, ''));
}

function testSliceStartStopEqual() {
  var iter = goog.iter.slice('ABCDEFG'.split(''), 1, 1);
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);
}

function testSliceIterator() {
  var iter = goog.iter.slice(goog.iter.count(20), 0, 5);
  assertArrayEquals([20, 21, 22, 23, 24], goog.iter.toArray(iter));
}

function testSliceStartGreater() {
  var iter = goog.iter.slice('ABCDEFG'.split(''), 10);
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);
}

function testPermutationsNoLength() {
  var iter = goog.iter.permutations(goog.iter.range(3));
  assertArrayEquals([0, 1, 2], iter.next());
  assertArrayEquals([0, 2, 1], iter.next());
  assertArrayEquals([1, 0, 2], iter.next());
  assertArrayEquals([1, 2, 0], iter.next());
  assertArrayEquals([2, 0, 1], iter.next());
  assertArrayEquals([2, 1, 0], iter.next());
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);
}

function testPermutationsLength() {
  var iter = goog.iter.permutations('ABC'.split(''), 2);
  assertArrayEquals(['A', 'B'], iter.next());
  assertArrayEquals(['A', 'C'], iter.next());
  assertArrayEquals(['B', 'A'], iter.next());
  assertArrayEquals(['B', 'C'], iter.next());
  assertArrayEquals(['C', 'A'], iter.next());
  assertArrayEquals(['C', 'B'], iter.next());
}

function testCombinations() {
  var iter = goog.iter.combinations(goog.iter.range(4), 3);
  assertArrayEquals([0, 1, 2], iter.next());
  assertArrayEquals([0, 1, 3], iter.next());
  assertArrayEquals([0, 2, 3], iter.next());
  assertArrayEquals([1, 2, 3], iter.next());
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);
}

function testCombinationsWithReplacement() {
  var iter = goog.iter.combinationsWithReplacement('ABC'.split(''), 2);
  assertArrayEquals(['A', 'A'], iter.next());
  assertArrayEquals(['A', 'B'], iter.next());
  assertArrayEquals(['A', 'C'], iter.next());
  assertArrayEquals(['B', 'B'], iter.next());
  assertArrayEquals(['B', 'C'], iter.next());
  assertArrayEquals(['C', 'C'], iter.next());
  var ex = assertThrows(function() { iter.next() });
  assertEquals(goog.iter.StopIteration, ex);
}
