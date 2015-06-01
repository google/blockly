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

goog.provide('goog.labs.storage.BoundedCollectableStorageTest');
goog.setTestOnly('goog.labs.storage.BoundedCollectableStorageTest');

goog.require('goog.labs.storage.BoundedCollectableStorage');
goog.require('goog.storage.collectableStorageTester');
goog.require('goog.storage.storage_test');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.storage.FakeMechanism');

function testBasicOperations() {
  var mechanism = new goog.testing.storage.FakeMechanism();
  var storage = new goog.labs.storage.BoundedCollectableStorage(mechanism, 5);
  goog.storage.storage_test.runBasicTests(storage);
}

function testExpiredKeyCollection() {
  var mechanism = new goog.testing.storage.FakeMechanism();
  var clock = new goog.testing.MockClock(true);
  var storage = new goog.labs.storage.BoundedCollectableStorage(mechanism, 15);

  goog.storage.collectableStorageTester.runBasicTests(mechanism, clock,
      storage);
}

function testLimitingNumberOfItems() {
  var mechanism = new goog.testing.storage.FakeMechanism();
  var clock = new goog.testing.MockClock(true);
  var storage = new goog.labs.storage.BoundedCollectableStorage(mechanism, 2);

  // First item should fit.
  storage.set('item-1', 'one', 10000);
  clock.tick(100);
  assertEquals('one', storage.get('item-1'));

  // Second item should fit.
  storage.set('item-2', 'two', 10000);
  assertEquals('one', storage.get('item-1'));
  assertEquals('two', storage.get('item-2'));

  // Third item is too much, 'item-1' should be removed.
  storage.set('item-3', 'three', 5000);
  clock.tick(100);
  assertUndefined(storage.get('item-1'));
  assertEquals('two', storage.get('item-2'));
  assertEquals('three', storage.get('item-3'));

  clock.tick(5000);
  // 'item-3' item has expired, should be removed instead an older 'item-2'.
  storage.set('item-4', 'four', 10000);
  assertUndefined(storage.get('item-1'));
  assertUndefined(storage.get('item-3'));
  assertEquals('two', storage.get('item-2'));
  assertEquals('four', storage.get('item-4'));

  storage.remove('item-2');
  storage.remove('item-4');

  clock.uninstall();
}
