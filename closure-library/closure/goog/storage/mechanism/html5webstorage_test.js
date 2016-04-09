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

goog.setTestOnly('goog.storage.mechanism.HTML5WebStorageTest');
goog.provide('goog.storage.mechanism.HTML5MockStorage');
goog.provide('goog.storage.mechanism.HTML5WebStorageTest');
goog.provide('goog.storage.mechanism.MockThrowableStorage');

goog.require('goog.storage.mechanism.ErrorCode');
goog.require('goog.storage.mechanism.HTML5WebStorage');
goog.require('goog.testing.jsunit');



/**
 * A minimal WebStorage implementation that throws exceptions for disabled
 * storage. Since we cannot have unit tests running in Safari private mode to
 * test this, we need to mock an exception throwing when trying to set a value.
 *
 * @param {boolean=} opt_isStorageDisabled If true, throws exceptions emulating
 *     Private browsing mode.  If false, storage quota will be marked as
 *     exceeded.
 * @constructor
 */
goog.storage.mechanism.MockThrowableStorage = function(opt_isStorageDisabled) {
  this.isStorageDisabled_ = !!opt_isStorageDisabled;
  this.length = opt_isStorageDisabled ? 0 : 1;
};


/** @override */
goog.storage.mechanism.MockThrowableStorage.prototype.setItem = function(
    key, value) {
  if (this.isStorageDisabled_) {
    throw goog.storage.mechanism.ErrorCode.STORAGE_DISABLED;
  } else {
    throw goog.storage.mechanism.ErrorCode.QUOTA_EXCEEDED;
  }
};


/** @override */
goog.storage.mechanism.MockThrowableStorage.prototype.removeItem = function(
    key) {};


/**
 * A very simple, dummy implementation of key(), merely to verify that calls to
 * HTML5WebStorage#key are proxied through.
 * @param {number} index A key index.
 * @return {string} The key associated with that index.
 */
goog.storage.mechanism.MockThrowableStorage.prototype.key = function(index) {
  return 'dummyKey';
};



/**
 * Provides an HTML5WebStorage wrapper for MockThrowableStorage.
 *
 * @constructor
 * @extends {goog.storage.mechanism.HTML5WebStorage}
 */
goog.storage.mechanism.HTML5MockStorage = function(opt_isStorageDisabled) {
  goog.storage.mechanism.HTML5MockStorage.base(
      this, 'constructor',
      new goog.storage.mechanism.MockThrowableStorage(opt_isStorageDisabled));
};
goog.inherits(
    goog.storage.mechanism.HTML5MockStorage,
    goog.storage.mechanism.HTML5WebStorage);


function testIsNotAvailableWhenQuotaExceeded() {
  var storage = new goog.storage.mechanism.HTML5MockStorage(false);
  assertFalse(storage.isAvailable());
}

function testIsNotAvailableWhenStorageDisabled() {
  var storage = new goog.storage.mechanism.HTML5MockStorage(true);
  assertFalse(storage.isAvailable());
}

function testSetThrowsExceptionWhenQuotaExceeded() {
  var storage = new goog.storage.mechanism.HTML5MockStorage(false);
  var isQuotaExceeded = false;
  try {
    storage.set('foobar', '1');
  } catch (e) {
    isQuotaExceeded = e == goog.storage.mechanism.ErrorCode.QUOTA_EXCEEDED;
  }
  assertTrue(isQuotaExceeded);
}

function testSetThrowsExceptionWhenStorageDisabled() {
  var storage = new goog.storage.mechanism.HTML5MockStorage(true);
  var isStorageDisabled = false;
  try {
    storage.set('foobar', '1');
  } catch (e) {
    isStorageDisabled = e == goog.storage.mechanism.ErrorCode.STORAGE_DISABLED;
  }
  assertTrue(isStorageDisabled);
}

function testKeyIterationWithKeyMethod() {
  var storage = new goog.storage.mechanism.HTML5MockStorage(true);
  assertEquals('dummyKey', storage.key(1));
}
