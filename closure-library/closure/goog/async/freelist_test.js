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

goog.provide('goog.async.FreeListTest');
goog.setTestOnly('goog.async.FreeListTest');

goog.require('goog.async.FreeList');
goog.require('goog.testing.jsunit');


var id = 0;
var list = null;

function setUp() {
  var id = 0;
  var data = 1;
  list = new goog.async.FreeList(
      function() {
        data *= 2;
        return {id: id++, data: data, next: null};
      },
      function(item) {item.data = null;},
      2); // max occupancy
}


function tearDown() {
  list = null;
}

function testItemsCreatedAsNeeded() {
  assertEquals(0, list.occupants());
  var item1 = list.get();
  assertNotNullNorUndefined(item1);
  var item2 = list.get();
  assertNotNullNorUndefined(item2);
  assertNotEquals(item1, item2);
  assertEquals(0, list.occupants());
}

function testMaxOccupancy() {
  assertEquals(0, list.occupants());
  var item1 = list.get();
  var item2 = list.get();
  var item3 = list.get();

  list.put(item1);
  list.put(item2);
  list.put(item3);

  assertEquals(2, list.occupants());
}

function testRecycling() {
  assertEquals(0, list.occupants());
  var item1 = list.get();
  assertNotNull(item1.data);

  list.put(item1);

  var item2 = list.get();

  // Item recycled
  assertEquals(item1, item2);
  // reset method called
  assertNull(item2.data);
}


