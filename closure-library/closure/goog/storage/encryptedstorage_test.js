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

goog.provide('goog.storage.EncryptedStorageTest');
goog.setTestOnly('goog.storage.EncryptedStorageTest');

goog.require('goog.json');
goog.require('goog.storage.EncryptedStorage');
goog.require('goog.storage.ErrorCode');
goog.require('goog.storage.RichStorage');
goog.require('goog.storage.collectableStorageTester');
goog.require('goog.storage.storage_test');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.PseudoRandom');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.storage.FakeMechanism');

function getEncryptedWrapper(storage, key) {
  return goog.json.parse(
      storage.mechanism.get(storage.hashKeyWithSecret_(key)));
}

function getEncryptedData(storage, key) {
  return getEncryptedWrapper(storage, key)[goog.storage.RichStorage.DATA_KEY];
}

function decryptWrapper(storage, key, wrapper) {
  return goog.json.parse(
      storage.decryptValue_(
          wrapper[goog.storage.EncryptedStorage.SALT_KEY], key,
          wrapper[goog.storage.RichStorage.DATA_KEY]));
}

function hammingDistance(a, b) {
  if (a.length != b.length) {
    throw Error('Lengths must be the same for Hamming distance');
  }
  var distance = 0;
  for (var i = 0; i < a.length; ++i) {
    if (a.charAt(i) != b.charAt(i)) {
      ++distance;
    }
  }
  return distance;
}


function testBasicOperations() {
  var mechanism = new goog.testing.storage.FakeMechanism();
  var storage = new goog.storage.EncryptedStorage(mechanism, 'secret');
  goog.storage.storage_test.runBasicTests(storage);
}


function testExpiredKeyCollection() {
  var mechanism = new goog.testing.storage.FakeMechanism();
  var clock = new goog.testing.MockClock(true);
  var storage = new goog.storage.EncryptedStorage(mechanism, 'secret');

  goog.storage.collectableStorageTester.runBasicTests(
      mechanism, clock, storage);
}


function testEncryption() {
  var mechanism = new goog.testing.storage.FakeMechanism();
  var clock = new goog.testing.MockClock(true);
  var storage = new goog.storage.EncryptedStorage(mechanism, 'secret');
  var mallory = new goog.storage.EncryptedStorage(mechanism, 'guess');

  // Simple Objects.
  storage.set('first', 'Hello world!');
  storage.set('second', ['one', 'two', 'three'], 1000);
  storage.set('third', {'a': 97, 'b': 98});

  // Wrong secret can't find keys.
  assertNull(mechanism.get('first'));
  assertNull(mechanism.get('second'));
  assertNull(mechanism.get('third'));
  assertUndefined(mallory.get('first'));
  assertUndefined(mallory.get('second'));
  assertUndefined(mallory.get('third'));

  // Wrong secret can't overwrite keys.
  mallory.set('first', 'Ho ho ho!');
  assertObjectEquals('Ho ho ho!', mallory.get('first'));
  assertObjectEquals('Hello world!', storage.get('first'));
  mallory.remove('first');

  // Correct key decrypts properly.
  assertObjectEquals('Hello world!', storage.get('first'));
  assertObjectEquals(['one', 'two', 'three'], storage.get('second'));
  assertObjectEquals({'a': 97, 'b': 98}, storage.get('third'));

  // Wrong secret can't decode values even if the key is revealed.
  var encryptedWrapper = getEncryptedWrapper(storage, 'first');
  assertObjectEquals(
      'Hello world!', decryptWrapper(storage, 'first', encryptedWrapper));
  assertThrows(function() {
    decryptWrapper(mallory, 'first', encryptedWrapper);
  });

  // If the value is overwritten, it can't be decrypted.
  encryptedWrapper[goog.storage.RichStorage.DATA_KEY] = 'kaboom';
  mechanism.set(
      storage.hashKeyWithSecret_('first'),
      goog.json.serialize(encryptedWrapper));
  assertEquals(
      goog.storage.ErrorCode.DECRYPTION_ERROR,
      assertThrows(function() { storage.get('first') }));

  // Test garbage collection.
  storage.collect();
  assertNotNull(getEncryptedWrapper(storage, 'first'));
  assertObjectEquals(['one', 'two', 'three'], storage.get('second'));
  assertObjectEquals({'a': 97, 'b': 98}, storage.get('third'));
  clock.tick(2000);
  storage.collect();
  assertNotNull(getEncryptedWrapper(storage, 'first'));
  assertUndefined(storage.get('second'));
  assertObjectEquals({'a': 97, 'b': 98}, storage.get('third'));
  mechanism.set(storage.hashKeyWithSecret_('first'), '"kaboom"');
  storage.collect();
  assertNotNull(getEncryptedWrapper(storage, 'first'));
  assertObjectEquals({'a': 97, 'b': 98}, storage.get('third'));
  storage.collect(true);
  assertUndefined(storage.get('first'));
  assertObjectEquals({'a': 97, 'b': 98}, storage.get('third'));

  // Clean up.
  storage.remove('third');
  assertUndefined(storage.get('third'));
  clock.uninstall();
}

function testSalting() {
  var mechanism = new goog.testing.storage.FakeMechanism();
  var randomMock = new goog.testing.PseudoRandom(0, true);
  var storage = new goog.storage.EncryptedStorage(mechanism, 'secret');

  // Same value under two different keys should appear very different,
  // even with the same salt.
  storage.set('one', 'Hello world!');
  randomMock.seed(0);  // Reset the generator so we get the same salt.
  storage.set('two', 'Hello world!');
  var golden = getEncryptedData(storage, 'one');
  assertRoughlyEquals(
      'Ciphertext did not change with keys', golden.length,
      hammingDistance(golden, getEncryptedData(storage, 'two')), 2);

  // Same key-value pair written second time should appear very different.
  storage.set('one', 'Hello world!');
  assertRoughlyEquals(
      'Salting seems to have failed', golden.length,
      hammingDistance(golden, getEncryptedData(storage, 'one')), 2);

  // Clean up.
  storage.remove('1');
  storage.remove('2');
  randomMock.uninstall();
}
