// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.storage.CollectableStorageTest');
goog.setTestOnly('goog.storage.CollectableStorageTest');

goog.require('goog.storage.CollectableStorage');
goog.require('goog.storage.collectableStorageTester');
goog.require('goog.storage.storage_test');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.storage.FakeMechanism');

function testBasicOperations() {
  var mechanism = new goog.testing.storage.FakeMechanism();
  var storage = new goog.storage.CollectableStorage(mechanism);
  goog.storage.storage_test.runBasicTests(storage);
}

function testExpiredKeyCollection() {
  var mechanism = new goog.testing.storage.FakeMechanism();
  var clock = new goog.testing.MockClock(true);
  var storage = new goog.storage.CollectableStorage(mechanism);

  goog.storage.collectableStorageTester.runBasicTests(
      mechanism, clock, storage);
}
