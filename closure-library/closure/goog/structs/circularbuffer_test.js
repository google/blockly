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

goog.provide('goog.structs.CircularBufferTest');
goog.setTestOnly('goog.structs.CircularBufferTest');

goog.require('goog.structs.CircularBuffer');
goog.require('goog.testing.jsunit');

function testCircularBuffer() {
  var buff = new goog.structs.CircularBuffer(2);
  assertUndefined(buff.add('first'));
  assertEquals(1, buff.getCount());
  assertEquals('first', buff.get(0));
  assertEquals('first', buff.getLast());
  assertUndefined(buff.add('second'));
  assertEquals(2, buff.getCount());
  assertEquals('first', buff.get(0));
  assertEquals('second', buff.get(1));
  assertEquals('second', buff.getLast());
  assertEquals('first', buff.add('third'));
  assertEquals(2, buff.getCount());
  assertEquals('second', buff.get(0));
  assertEquals('third', buff.get(1));
  assertEquals('third', buff.getLast());
}

function testIsEmpty() {
  var buff = new goog.structs.CircularBuffer(2);
  assertTrue('initially empty', buff.isEmpty());
  assertUndefined(buff.add('first'));
  assertFalse('not empty after add empty', buff.isEmpty());
}

function testClear() {
  var buff = new goog.structs.CircularBuffer(2);
  assertUndefined(buff.add('first'));
  buff.clear();
  assertTrue('should be empty after clear', buff.isEmpty());
}

function testGetValues() {
  var buff = new goog.structs.CircularBuffer(2);
  assertUndefined(buff.add('first'));
  assertUndefined(buff.add('second'));
  assertArrayEquals(['first', 'second'], buff.getValues());
}

function testGetNewestValues() {
  var buff = new goog.structs.CircularBuffer(5);
  assertUndefined(buff.add('first'));
  assertUndefined(buff.add('second'));
  assertUndefined(buff.add('third'));
  assertUndefined(buff.add('fourth'));
  assertUndefined(buff.add('fifth'));
  assertArrayEquals(['fourth', 'fifth'], buff.getNewestValues(2));
}


function testGetKeys() {
  var buff = new goog.structs.CircularBuffer(2);
  assertUndefined(buff.add('first'));
  assertUndefined(buff.add('second'));
  assertArrayEquals([0, 1], buff.getKeys());
}

function testContainsValue() {
  var buff = new goog.structs.CircularBuffer(2);
  assertUndefined(buff.add('first'));
  assertUndefined(buff.add('second'));
  assertTrue(buff.containsValue('first'));
  assertTrue(buff.containsValue('second'));
  assertFalse(buff.containsValue('third'));
}

function testContainsKey() {
  var buff = new goog.structs.CircularBuffer(3);
  assertUndefined(buff.add('first'));
  assertUndefined(buff.add('second'));
  assertUndefined(buff.add('third'));
  assertTrue(buff.containsKey(0));
  assertTrue(buff.containsKey('0'));
  assertTrue(buff.containsKey(1));
  assertTrue(buff.containsKey('1'));
  assertTrue(buff.containsKey(2));
  assertTrue(buff.containsKey('2'));
  assertFalse(buff.containsKey(3));
  assertFalse(buff.containsKey('3'));
}
