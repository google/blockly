// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.structs.LinkedMapTest');
goog.setTestOnly('goog.structs.LinkedMapTest');

goog.require('goog.structs.LinkedMap');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');

function fillLinkedMap(m) {
  m.set('a', 0);
  m.set('b', 1);
  m.set('c', 2);
  m.set('d', 3);
}

var someObj = {};

function testLinkedMap() {
  var m = new goog.structs.LinkedMap();
  fillLinkedMap(m);

  assertArrayEquals(['a', 'b', 'c', 'd'], m.getKeys());
  assertArrayEquals([0, 1, 2, 3], m.getValues());
}

function testMaxSizeLinkedMap() {
  var m = new goog.structs.LinkedMap(3);
  fillLinkedMap(m);

  assertArrayEquals(['b', 'c', 'd'], m.getKeys());
  assertArrayEquals([1, 2, 3], m.getValues());
}

function testLruLinkedMap() {
  var m = new goog.structs.LinkedMap(undefined, true);
  fillLinkedMap(m);

  assertArrayEquals(['d', 'c', 'b', 'a'], m.getKeys());
  assertArrayEquals([3, 2, 1, 0], m.getValues());

  m.get('a');
  assertArrayEquals(['a', 'd', 'c', 'b'], m.getKeys());
  assertArrayEquals([0, 3, 2, 1], m.getValues());

  m.set('b', 4);
  assertArrayEquals(['b', 'a', 'd', 'c'], m.getKeys());
  assertArrayEquals([4, 0, 3, 2], m.getValues());
}

function testMaxSizeLruLinkedMap() {
  var m = new goog.structs.LinkedMap(3, true);
  fillLinkedMap(m);

  assertArrayEquals(['d', 'c', 'b'], m.getKeys());
  assertArrayEquals([3, 2, 1], m.getValues());

  m.get('c');
  assertArrayEquals(['c', 'd', 'b'], m.getKeys());
  assertArrayEquals([2, 3, 1], m.getValues());

  m.set('d', 4);
  assertArrayEquals(['d', 'c', 'b'], m.getKeys());
  assertArrayEquals([4, 2, 1], m.getValues());
}

function testMaxSizeLruLinkedMapWithEvictionCallback() {
  var cb = goog.testing.recordFunction();
  var m = new goog.structs.LinkedMap(4, true, cb);
  fillLinkedMap(m);
  assertEquals(0, cb.getCallCount());  // But cache is full.
  assertArrayEquals(['d', 'c', 'b', 'a'], m.getKeys());
  m.set('d', 'exists');
  assertEquals(0, cb.getCallCount());
  m.set('extra1', 'val1');
  assertEquals(1, cb.getCallCount());
  assertArrayEquals(['a', 0], cb.getLastCall().getArguments());
  m.set('extra2', 'val2');
  assertEquals(2, cb.getCallCount());
  assertArrayEquals(['b', 1], cb.getLastCall().getArguments());
  m.set('extra2', 'val2_2');
  assertEquals(2, cb.getCallCount());
}

function testGetCount() {
  var m = new goog.structs.LinkedMap();
  assertEquals(0, m.getCount());
  m.set('a', 0);
  assertEquals(1, m.getCount());
  m.set('a', 1);
  assertEquals(1, m.getCount());
  m.set('b', 2);
  assertEquals(2, m.getCount());
  m.remove('a');
  assertEquals(1, m.getCount());
}

function testIsEmpty() {
  var m = new goog.structs.LinkedMap();
  assertTrue(m.isEmpty());
  m.set('a', 0);
  assertFalse(m.isEmpty());
  m.remove('a');
  assertTrue(m.isEmpty());
}

function testSetMaxCount() {
  var m = new goog.structs.LinkedMap(3);
  fillLinkedMap(m);
  assertEquals(3, m.getCount());

  m.setMaxCount(5);
  m.set('e', 5);
  m.set('f', 6);
  m.set('g', 7);
  assertEquals(5, m.getCount());

  m.setMaxCount(4);
  assertEquals(4, m.getCount());

  m.setMaxCount(0);
  m.set('h', 8);
  m.set('i', 9);
  m.set('j', 10);
  assertEquals(7, m.getCount());
}

function testClear() {
  var m = new goog.structs.LinkedMap();
  fillLinkedMap(m);
  m.clear();
  assertTrue(m.isEmpty());
}

function testForEach() {
  var m = new goog.structs.LinkedMap();
  fillLinkedMap(m);

  m.forEach(function(val, key, linkedMap) {
    linkedMap.set(key, val * 2);
    assertEquals('forEach should run in provided context.', someObj, this);
  }, someObj);

  assertArrayEquals(['a', 'b', 'c', 'd'], m.getKeys());
  assertArrayEquals([0, 2, 4, 6], m.getValues());
}

function testMap() {
  var m = new goog.structs.LinkedMap();
  fillLinkedMap(m);

  var result = m.map(function(val, key, linkedMap) {
    assertEquals('The LinkedMap object should get passed in', m, linkedMap);
    assertEquals('map should run in provided context', someObj, this);
    return key + val;
  }, someObj);

  assertArrayEquals(['a0', 'b1', 'c2', 'd3'], result);
}

function testSome() {
  var m = new goog.structs.LinkedMap();
  fillLinkedMap(m);

  var result = m.some(function(val, key, linkedMap) {
    assertEquals('The LinkedMap object should get passed in', m, linkedMap);
    assertEquals('map should run in provided context', someObj, this);
    return val > 2;
  }, someObj);

  assertTrue(result);
  assertFalse(m.some(function(val) { return val > 3 }));

  assertTrue(m.some(function(val, key) { return key == 'c'; }));
  assertFalse(m.some(function(val, key) { return key == 'e'; }));
}

function testEvery() {
  var m = new goog.structs.LinkedMap();
  fillLinkedMap(m);

  var result = m.every(function(val, key, linkedMap) {
    assertEquals('The LinkedMap object should get passed in', m, linkedMap);
    assertEquals('map should run in provided context', someObj, this);
    return val < 5;
  }, someObj);

  assertTrue(result);
  assertFalse(m.every(function(val) { return val < 2 }));

  assertTrue(m.every(function(val, key) { return key.length == 1; }));
  assertFalse(m.every(function(val, key) { return key == 'b'; }));
}

function testPeek() {
  var m = new goog.structs.LinkedMap();
  assertEquals(undefined, m.peek());
  assertEquals(undefined, m.peekLast());

  fillLinkedMap(m);
  assertEquals(0, m.peek());

  m.remove('a');
  assertEquals(1, m.peek());

  assertEquals(3, m.peekLast());

  assertEquals(3, m.peekValue('d'));
  assertEquals(1, m.peek());

  m.remove('d');
  assertEquals(2, m.peekLast());
}

function testPop() {
  var m = new goog.structs.LinkedMap();
  assertEquals(undefined, m.shift());
  assertEquals(undefined, m.pop());

  fillLinkedMap(m);
  assertEquals(4, m.getCount());

  assertEquals(0, m.shift());
  assertEquals(1, m.peek());

  assertEquals(3, m.pop());
  assertEquals(2, m.peekLast());

  assertEquals(2, m.getCount());
}

function testContains() {
  var m = new goog.structs.LinkedMap();
  fillLinkedMap(m);

  assertTrue(m.contains(2));
  assertFalse(m.contains(4));
}

function testContainsKey() {
  var m = new goog.structs.LinkedMap();
  fillLinkedMap(m);

  assertTrue(m.containsKey('b'));
  assertFalse(m.containsKey('elephant'));
  assertFalse(m.containsKey('undefined'));
}

function testRemoveNodeCalls() {
  var m = new goog.structs.LinkedMap(1);
  m.removeNode = goog.testing.recordFunction(m.removeNode);

  m.set('1', 1);
  assertEquals(
      'removeNode not called after adding an element', 0,
      m.removeNode.getCallCount());
  m.set('1', 2);
  assertEquals(
      'removeNode not called after updating an element', 0,
      m.removeNode.getCallCount());
  m.set('2', 2);
  assertEquals(
      'removeNode called after adding an overflowing element', 1,
      m.removeNode.getCallCount());

  m.remove('3');
  assertEquals(
      'removeNode not called after removing a non-existing element', 1,
      m.removeNode.getCallCount());
  m.remove('2');
  assertEquals(
      'removeNode called after removing an existing element', 2,
      m.removeNode.getCallCount());

  m.set('1', 1);
  m.clear();
  assertEquals(
      'removeNode called after clearing the map', 3,
      m.removeNode.getCallCount());
  m.clear();
  assertEquals(
      'removeNode not called after clearing an empty map', 3,
      m.removeNode.getCallCount());

  m.set('1', 1);
  m.pop();
  assertEquals(
      'removeNode called after calling pop', 4, m.removeNode.getCallCount());
  m.pop();
  assertEquals(
      'removeNode not called after calling pop on an empty map', 4,
      m.removeNode.getCallCount());

  m.set('1', 1);
  m.shift();
  assertEquals(
      'removeNode called after calling shift', 5, m.removeNode.getCallCount());
  m.shift();
  assertEquals(
      'removeNode not called after calling shift on an empty map', 5,
      m.removeNode.getCallCount());

  m.setMaxCount(2);
  m.set('1', 1);
  m.set('2', 2);
  assertEquals(
      'removeNode not called after increasing the maximum map size', 5,
      m.removeNode.getCallCount());
  m.setMaxCount(1);
  assertEquals(
      'removeNode called after decreasing the maximum map size', 6,
      m.removeNode.getCallCount());
}
