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

goog.provide('goog.structs.PriorityPoolTest');
goog.setTestOnly('goog.structs.PriorityPoolTest');

goog.require('goog.structs.PriorityPool');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');

// Implementation of the Pool class with isObjectDead() always returning TRUE,
// so that the the Pool will not reuse any objects.
function NoObjectReusePriorityPool(opt_min, opt_max) {
  goog.structs.PriorityPool.call(this, opt_min, opt_max);
}
goog.inherits(NoObjectReusePriorityPool, goog.structs.PriorityPool);

NoObjectReusePriorityPool.prototype.objectCanBeReused = function(obj) {
  return false;
};


function testExceedMax1() {
  var p = new goog.structs.PriorityPool(0, 3);

  var getCount1 = 0;
  var callback1 = function(obj) {
    assertNotNull(obj);
    getCount1++;
  };

  var getCount2 = 0;
  var callback2 = function(obj) { getCount2++; };

  p.getObject(callback1);
  p.getObject(callback1);
  p.getObject(callback1);
  p.getObject(callback2);
  p.getObject(callback2);
  p.getObject(callback2);

  assertEquals('getCount for allocated, Should be 3', getCount1, 3);
  assertEquals('getCount for unallocated, Should be 0', getCount2, 0);
}


function testExceedMax2() {
  var p = new goog.structs.PriorityPool(0, 1);

  var getCount1 = 0;
  var callback1 = function(obj) {
    assertNotNull(obj);
    getCount1++;
  };

  var getCount2 = 0;
  var callback2 = function(obj) { getCount2++; };

  p.getObject(callback1);
  p.getObject(callback2);
  p.getObject(callback2);
  p.getObject(callback2);
  p.getObject(callback2);
  p.getObject(callback2);

  assertEquals('getCount for allocated, Should be 1', getCount1, 1);
  assertEquals('getCount for unallocated, Should be 0', getCount2, 0);
}

function testExceedMax3() {
  var p = new goog.structs.PriorityPool(0, 2);

  var obj1 = null;
  var callback1 = function(obj) { obj1 = obj; };

  var obj2 = null;
  var callback2 = function(obj) { obj2 = obj; };

  var obj3 = null;
  var callback3 = function(obj) { obj3 = obj; };

  p.getObject(callback1);
  p.getObject(callback2);
  p.getObject(callback3);

  assertNotNull(obj1);
  assertNotNull(obj2);
  assertNull(obj3);
}

function testExceedMax4() {
  var p = new goog.structs.PriorityPool();  // default: 10
  var objs = [];

  var getCount1 = 0;
  var callback1 = function(obj) {
    assertNotNull(obj);
    getCount1++;
  };

  var getCount2 = 0;
  var callback2 = function(obj) { getCount2++; };

  for (var i = 0; i < 12; i++) {
    p.getObject(i < 10 ? callback1 : callback2);
  }

  assertEquals('getCount for allocated, Should be 10', getCount1, 10);
  assertEquals('getCount for unallocated, Should be 0', getCount2, 0);
}


function testReleaseAndGet1() {
  var p = new goog.structs.PriorityPool(0, 10);

  var o = null;
  var callback = function(obj) { o = obj; };

  p.getObject(callback);
  assertEquals(1, p.getCount());
  assertEquals(1, p.getInUseCount());
  assertEquals(0, p.getFreeCount());
  assertTrue('Result should be true', p.releaseObject(o));
  assertEquals(1, p.getCount());
  assertEquals(0, p.getInUseCount());
  assertEquals(1, p.getFreeCount());
}


function testReleaseAndGet2() {
  var p = new NoObjectReusePriorityPool(0, 10);

  var o = null;
  var callback = function(obj) { o = obj; };

  p.getObject(callback);
  assertEquals(1, p.getCount());
  assertEquals(1, p.getInUseCount());
  assertEquals(0, p.getFreeCount());
  assertTrue('Result should be true', p.releaseObject(o));
  assertEquals(0, p.getCount());
  assertEquals(0, p.getInUseCount());
  assertEquals(0, p.getFreeCount());
}


function testReleaseAndGet3() {
  var p = new goog.structs.PriorityPool(0, 10);
  var o1 = null;
  var callback1 = function(obj) { o1 = obj; };

  var o2 = null;
  var callback2 = function(obj) { o2 = obj; };

  var o3 = null;
  var callback3 = function(obj) { o3 = obj; };

  var o4 = {};

  p.getObject(callback1);
  p.getObject(callback2);
  p.getObject(callback3);

  assertEquals(3, p.getCount());
  assertEquals(3, p.getInUseCount());
  assertEquals(0, p.getFreeCount());
  assertTrue('Result should be true', p.releaseObject(o1));
  assertTrue('Result should be true', p.releaseObject(o2));
  assertFalse('Result should be false', p.releaseObject(o4));
  assertEquals(3, p.getCount());
  assertEquals(1, p.getInUseCount());
  assertEquals(2, p.getFreeCount());
}


function testReleaseAndGet4() {
  var p = new NoObjectReusePriorityPool(0, 10);

  var o1 = null;
  var callback1 = function(obj) { o1 = obj; };

  var o2 = null;
  var callback2 = function(obj) { o2 = obj; };

  var o3 = null;
  var callback3 = function(obj) { o3 = obj; };

  var o4 = {};

  p.getObject(callback1);
  p.getObject(callback2);
  p.getObject(callback3);
  assertEquals(3, p.getCount());
  assertEquals(3, p.getInUseCount());
  assertEquals(0, p.getFreeCount());
  assertTrue('Result should be true', p.releaseObject(o1));
  assertTrue('Result should be true', p.releaseObject(o2));
  assertFalse('Result should be false', p.releaseObject(o4));
  assertEquals(1, p.getCount());
  assertEquals(1, p.getInUseCount());
  assertEquals(0, p.getFreeCount());
}


function testIsInPool1() {
  var p = new goog.structs.PriorityPool();
  var o1 = null;
  var callback1 = function(obj) { o1 = obj; };

  var o2 = null;
  var callback2 = function(obj) { o2 = obj; };

  var o3 = null;
  var callback3 = function(obj) { o3 = obj; };

  var o4 = {};
  var o5 = {};

  p.getObject(callback1);
  p.getObject(callback2);
  p.getObject(callback3);
  var o6 = o1;

  assertTrue(p.contains(o1));
  assertTrue(p.contains(o2));
  assertTrue(p.contains(o3));
  assertFalse(p.contains(o4));
  assertFalse(p.contains(o5));
  assertTrue(p.contains(o6));
}


function testSetMin1() {
  var p = new goog.structs.PriorityPool(0, 10);

  assertEquals(0, p.getCount());
  assertEquals(0, p.getInUseCount());
  assertEquals(0, p.getFreeCount());

  p.setMinimumCount(10);

  assertEquals(10, p.getCount());
  assertEquals(0, p.getInUseCount());
  assertEquals(10, p.getFreeCount());
}


function testSetMin2() {
  var p = new goog.structs.PriorityPool(0, 10);

  assertEquals(0, p.getCount());
  assertEquals(0, p.getInUseCount());
  assertEquals(0, p.getFreeCount());

  var o1 = null;
  var callback1 = function(obj) { o1 = obj; };
  p.getObject(callback1);

  assertEquals(1, p.getCount());
  assertEquals(1, p.getInUseCount());
  assertEquals(0, p.getFreeCount());

  p.setMinimumCount(10);

  assertEquals(10, p.getCount());
  assertEquals(1, p.getInUseCount());
  assertEquals(9, p.getFreeCount());
}


function testSetMax1() {
  var p = new goog.structs.PriorityPool(0, 10);

  assertEquals(0, p.getCount());
  assertEquals(0, p.getInUseCount());
  assertEquals(0, p.getFreeCount());

  var o1 = null;
  var callback1 = function(obj) { o1 = obj; };

  var o2 = null;
  var callback2 = function(obj) { o2 = obj; };

  var o3 = null;
  var callback3 = function(obj) { o3 = obj; };

  var o4 = null;
  var callback4 = function(obj) { o4 = obj; };

  var o5 = null;
  var callback5 = function(obj) { o5 = obj; };

  p.getObject(callback1);
  p.getObject(callback2);
  p.getObject(callback3);
  p.getObject(callback4);
  p.getObject(callback5);

  assertEquals(5, p.getCount());
  assertEquals(5, p.getInUseCount());
  assertEquals(0, p.getFreeCount());

  assertTrue('Result should be true', p.releaseObject(o5));

  assertEquals(5, p.getCount());
  assertEquals(4, p.getInUseCount());
  assertEquals(1, p.getFreeCount());

  p.setMaximumCount(4);

  assertEquals(4, p.getCount());
  assertEquals(4, p.getInUseCount());
  assertEquals(0, p.getFreeCount());
}


function testInvalidMinMax1() {
  var p = new goog.structs.PriorityPool(0, 10);

  assertEquals(0, p.getCount());
  assertEquals(0, p.getInUseCount());
  assertEquals(0, p.getFreeCount());

  assertThrows(function() { p.setMinimumCount(11); });
}


function testInvalidMinMax2() {
  var p = new goog.structs.PriorityPool(5, 10);

  assertEquals(5, p.getCount());
  assertEquals(0, p.getInUseCount());
  assertEquals(5, p.getFreeCount());

  assertThrows(function() { p.setMaximumCount(4); });
}


function testInvalidMinMax3() {
  assertThrows(function() { new goog.structs.PriorityPool(10, 1); });
}

function testQueue1() {
  var p = new goog.structs.PriorityPool(0, 2);

  var o1 = null;
  var callback1 = function(obj) { o1 = obj; };

  var o2 = null;
  var callback2 = function(obj) { o2 = obj; };

  var o3 = null;
  var callback3 = function(obj) { o3 = obj; };

  p.getObject(callback1);
  p.getObject(callback2);
  p.getObject(callback3);

  assertNotNull(o1);
  assertNotNull(o2);
  assertNull(o3);

  p.releaseObject(o1);
  assertNotNull(o3);
}


function testPriority1() {
  var p = new goog.structs.PriorityPool(0, 2);

  var o1 = null;
  var callback1 = function(obj) { o1 = obj; };

  var o2 = null;
  var callback2 = function(obj) { o2 = obj; };

  var o3 = null;
  var callback3 = function(obj) { o3 = obj; };

  var o4 = null;
  var callback4 = function(obj) { o4 = obj; };

  var o5 = null;
  var callback5 = function(obj) { o5 = obj; };

  var o6 = null;
  var callback6 = function(obj) { o6 = obj; };

  p.getObject(callback1);  // Initially seeded requests.
  p.getObject(callback2);

  p.getObject(callback3, 101);  // Lowest priority.
  p.getObject(callback4);       // Second lowest priority (default is 100).
  p.getObject(callback5, 99);   // Second highest priority.
  p.getObject(callback6, 0);    // Highest priority.

  assertNotNull(o1);
  assertNotNull(o2);
  assertNull(o3);
  assertNull(o4);
  assertNull(o5);
  assertNull(o6);

  p.releaseObject(o1);  // Release the first initially seeded request (o1).
  assertNotNull(o6);    // Make sure the highest priority request (o6) started.
  assertNull(o3);
  assertNull(o4);
  assertNull(o5);

  p.releaseObject(o2);  // Release the second, initially seeded request (o2).
  assertNotNull(o5);    // The second highest priority request starts (o5).
  assertNull(o3);
  assertNull(o4);

  p.releaseObject(o6);
  assertNotNull(o4);
  assertNull(o3);
}


function testRateLimiting() {
  var clock = new goog.testing.MockClock();
  clock.install();

  var p = new goog.structs.PriorityPool(0, 4);
  p.setDelay(100);

  var getCount = 0;
  var callback = function(obj) {
    assertNotNull(obj);
    getCount++;
  };

  p.getObject(callback);
  assertEquals(1, getCount);

  p.getObject(callback);
  assertEquals(1, getCount);

  clock.tick(100);
  assertEquals(2, getCount);

  p.getObject(callback);
  p.getObject(callback);
  assertEquals(2, getCount);

  clock.tick(100);
  assertEquals(3, getCount);

  clock.tick(100);
  assertEquals(4, getCount);

  p.getObject(callback);
  assertEquals(4, getCount);

  clock.tick(100);
  assertEquals(4, getCount);

  goog.dispose(clock);
}


function testRateLimitingWithChangingDelay() {
  var clock = new goog.testing.MockClock();
  clock.install();

  var p = new goog.structs.PriorityPool(0, 3);
  p.setDelay(100);

  var getCount = 0;
  var callback = function(obj) {
    assertNotNull(obj);
    getCount++;
  };

  p.getObject(callback);
  assertEquals(1, getCount);

  p.getObject(callback);
  assertEquals(1, getCount);

  clock.tick(50);
  assertEquals(1, getCount);

  p.setDelay(50);
  assertEquals(2, getCount);

  p.getObject(callback);
  assertEquals(2, getCount);

  clock.tick(20);
  assertEquals(2, getCount);

  p.setDelay(40);
  assertEquals(2, getCount);

  clock.tick(20);
  assertEquals(3, getCount);

  goog.dispose(clock);
}
