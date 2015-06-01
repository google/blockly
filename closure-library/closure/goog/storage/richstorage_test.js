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

goog.provide('goog.storage.RichStorageTest');
goog.setTestOnly('goog.storage.RichStorageTest');

goog.require('goog.storage.ErrorCode');
goog.require('goog.storage.RichStorage');
goog.require('goog.storage.storage_test');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.storage.FakeMechanism');

function testBasicOperations() {
  var mechanism = new goog.testing.storage.FakeMechanism();
  var storage = new goog.storage.RichStorage(mechanism);
  goog.storage.storage_test.runBasicTests(storage);
}

function testWrapping() {
  var mechanism = new goog.testing.storage.FakeMechanism();
  var storage = new goog.storage.RichStorage(mechanism);

  // Some metadata.
  var object = {'a': 97, 'b': 98};
  var wrapper = new goog.storage.RichStorage.Wrapper(object);
  wrapper['meta'] = 'info';
  storage.set('first', wrapper);
  assertObjectEquals(object, storage.get('first'));
  assertObjectEquals(wrapper, storage.getWrapper('first'));
  assertEquals('info', storage.getWrapper('first')['meta']);

  // Multiple wrappings.
  var wrapper1 = goog.storage.RichStorage.Wrapper.wrapIfNecessary(object);
  wrapper1['some'] = 'meta';
  var wrapper2 = goog.storage.RichStorage.Wrapper.wrapIfNecessary(wrapper1);
  wrapper2['more'] = 'stuff';
  storage.set('second', wrapper2);
  assertObjectEquals(object, storage.get('second'));
  assertObjectEquals(wrapper2, storage.getWrapper('second'));
  assertEquals('meta', storage.getWrapper('second')['some']);
  assertEquals('stuff', storage.getWrapper('second')['more']);

  // Invalid wrappings.
  mechanism.set('third', 'null');
  assertEquals(goog.storage.ErrorCode.INVALID_VALUE,
               assertThrows(function() {storage.get('third')}));
  mechanism.set('third', '{"meta": "data"}');
  assertEquals(goog.storage.ErrorCode.INVALID_VALUE,
               assertThrows(function() {storage.get('third')}));

  // Weird values.
  var wrapperA = new goog.storage.RichStorage.Wrapper.wrapIfNecessary(null);
  wrapperA['one'] = 1;
  storage.set('first', wrapperA);
  assertObjectEquals(wrapperA, storage.getWrapper('first'));
  var wrapperB = new goog.storage.RichStorage.Wrapper.wrapIfNecessary('');
  wrapperA['two'] = [];
  storage.set('second', wrapperB);
  assertObjectEquals(wrapperB, storage.getWrapper('second'));

  // Clean up.
  storage.remove('first');
  storage.remove('second');
  storage.remove('third');
  assertUndefined(storage.get('first'));
  assertUndefined(storage.get('second'));
  assertUndefined(storage.get('third'));
  assertNull(mechanism.get('first'));
  assertNull(mechanism.get('second'));
  assertNull(mechanism.get('third'));
}
