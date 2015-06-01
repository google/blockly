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

goog.provide('goog.structs.QueueTest');
goog.setTestOnly('goog.structs.QueueTest');

goog.require('goog.structs.Queue');
goog.require('goog.testing.jsunit');

function stringifyQueue(q) {
  var values = q.getValues();
  var s = '';
  for (var i = 0; i < values.length; i++) {
    s += values[i];
  }
  return s;
}

function createQueue() {
  var q = new goog.structs.Queue();
  q.enqueue('a');
  q.enqueue('b');
  q.enqueue('c');
  q.enqueue('a');
  q.dequeue();
  q.enqueue('b');
  q.enqueue('c');
  // q is now: bcabc
  return q;
}

function testConstructor() {
  var q = new goog.structs.Queue();
  assertTrue('testConstructor(), queue should be empty initially', q.isEmpty());
  assertEquals('testConstructor(), count should be 0', q.getCount(), 0);
  assertEquals('testConstructor(), head element should be undefined', q.peek(),
      undefined);
}

function testCount() {
  var q = createQueue();
  assertEquals('testCount(), count should be 5', q.getCount(), 5);
  q.enqueue('d');
  assertEquals('testCount(), count should be 6', q.getCount(), 6);
  q.dequeue();
  assertEquals('testCount(), count should be 5', q.getCount(), 5);
  q.clear();
  assertEquals('testCount(), count should be 0', q.getCount(), 0);
}

function testEnqueue() {
  var q = new goog.structs.Queue();
  q.enqueue('a');
  assertEquals('testEnqueue(), count should be 1', q.getCount(), 1);
  q.enqueue('b');
  assertEquals('testEnqueue(), count should be 2', q.getCount(), 2);
  assertEquals('testEnqueue(), head element should be a', q.peek(), 'a');
  q.dequeue();
  assertEquals('testEnqueue(), count should be 1', q.getCount(), 1);
  assertEquals('testEnqueue(), head element should be b', q.peek(), 'b');
}

function testDequeue() {
  var q = createQueue();
  assertEquals('testDequeue(), should return b', q.dequeue(), 'b');
  assertEquals('testDequeue(), should return b', q.dequeue(), 'c');
  assertEquals('testDequeue(), should return b', q.dequeue(), 'a');
  assertEquals('testDequeue(), should return b', q.dequeue(), 'b');
  assertEquals('testDequeue(), should return b', q.dequeue(), 'c');
  assertTrue('testDequeue(), queue should be empty', q.isEmpty());
  assertEquals('testDequeue(), should return undefined for empty queue',
      q.dequeue(), undefined);
}

function testPeek() {
  var q = createQueue();
  assertEquals('testPeek(), should return b', q.peek(), 'b');
  assertEquals('testPeek(), dequeue should return peek() result',
      q.dequeue(), 'b');
  assertEquals('testPeek(), should return b', q.peek(), 'c');
  q.clear();
  assertEquals('testPeek(), should return undefined for empty queue',
      q.peek(), undefined);
}

function testClear() {
  var q = createQueue();
  q.clear();
  assertTrue('testClear(), queue should be empty', q.isEmpty());
}

function testQueue() {
  var q = createQueue();
  assertEquals('testQueue(), contents must be bcabc',
      stringifyQueue(q), 'bcabc');
}

function testRemove() {
  var q = createQueue();
  assertEquals('testRemove(), contents must be bcabc',
      stringifyQueue(q), 'bcabc');

  q.dequeue();
  assertEquals('testRemove(), contents must be cabc',
      stringifyQueue(q), 'cabc');

  q.enqueue('a');
  assertEquals('testRemove(), contents must be cabca',
      stringifyQueue(q), 'cabca');

  assertTrue('testRemove(), remove should have returned true', q.remove('c'));
  assertEquals('testRemove(), contents must be abca',
      stringifyQueue(q), 'abca');

  assertTrue('testRemove(), remove should have returned true', q.remove('b'));
  assertEquals('testRemove(), contents must be aca', stringifyQueue(q), 'aca');

  assertFalse('testRemove(), remove should have returned false', q.remove('b'));
  assertEquals('testRemove(), contents must be aca', stringifyQueue(q), 'aca');

  assertTrue('testRemove(), remove should have returned true', q.remove('a'));
  assertEquals('testRemove(), contents must be ca', stringifyQueue(q), 'ca');

  assertTrue('testRemove(), remove should have returned true', q.remove('a'));
  assertEquals('testRemove(), contents must be c', stringifyQueue(q), 'c');

  assertTrue('testRemove(), remove should have returned true', q.remove('c'));
  assertEquals('testRemove(), contents must be empty', stringifyQueue(q), '');

  q.enqueue('a');
  q.enqueue('b');
  q.enqueue('c');
  q.enqueue('a');
  q.dequeue();
  q.enqueue('b');
  q.enqueue('c');
  assertEquals('testRemove(), contents must be bcabc',
      stringifyQueue(q), 'bcabc');
  assertTrue('testRemove(), remove should have returned true', q.remove('c'));
  assertEquals('testRemove(), contents must be babc',
      stringifyQueue(q), 'babc');
}

function testContains() {
  var q = createQueue();
  assertTrue('testContains(), contains should have returned true',
      q.contains('a'));
  assertFalse('testContains(), contains should have returned false',
      q.contains('foobar'));
}
