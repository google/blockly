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

goog.provide('goog.async.WorkQueueTest');
goog.setTestOnly('goog.async.WorkQueueTest');

goog.require('goog.async.WorkQueue');
goog.require('goog.testing.jsunit');


var id = 0;
var queue = null;


function setUp() {
  queue = new goog.async.WorkQueue();
}


function tearDown() {
  queue = null;
}


function testEntriesReturnedInOrder() {
  var fn1 = function one() {};
  var scope1 = {};
  var fn2 = function two() {};
  var scope2 = {};
  queue.add(fn1, scope1);
  queue.add(fn2, scope2);

  var item = queue.remove();
  assertEquals(fn1, item.fn);
  assertEquals(scope1, item.scope);
  assertNull(item.next);

  item = queue.remove();
  assertEquals(fn2, item.fn);
  assertEquals(scope2, item.scope);
  assertNull(item.next);

  item = queue.remove();
  assertNull(item);
}


function testReturnedItemReused() {
  var fn1 = function() {};
  var scope1 = {};

  var fn2 = function() {};
  var scope2 = {};

  assertEquals(0, goog.async.WorkQueue.freelist_.occupants());

  queue.add(fn1, scope1);
  var item1 = queue.remove();

  assertEquals(0, goog.async.WorkQueue.freelist_.occupants());

  queue.returnUnused(item1);

  assertEquals(1, goog.async.WorkQueue.freelist_.occupants());

  queue.add(fn2, scope2);

  assertEquals(0, goog.async.WorkQueue.freelist_.occupants());

  var item2 = queue.remove();

  assertEquals(item1, item2);
}


function testEmptyQueueReturnNull() {
  var item1 = queue.remove();
  assertNull(item1);
}
