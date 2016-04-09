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

goog.provide('goog.testing.MockStorageTest');
goog.setTestOnly('goog.testing.MockStorageTest');

goog.require('goog.testing.MockStorage');
goog.require('goog.testing.jsunit');

var instance;

function setUp() {
  instance = new goog.testing.MockStorage();
}


/**
 * Tests the MockStorage interface.
 */
function testMockStorage() {
  assertEquals(0, instance.length);

  instance.setItem('foo', 'bar');
  assertEquals(1, instance.length);
  assertEquals('bar', instance.getItem('foo'));
  assertEquals('foo', instance.key(0));

  instance.setItem('foo', 'baz');
  assertEquals('baz', instance.getItem('foo'));

  instance.setItem('goo', 'gl');
  assertEquals(2, instance.length);
  assertEquals('gl', instance.getItem('goo'));
  assertEquals('goo', instance.key(1));

  assertNull(instance.getItem('poogle'));

  instance.removeItem('foo');
  assertEquals(1, instance.length);
  assertEquals('goo', instance.key(0));

  instance.setItem('a', 12);
  assertEquals('12', instance.getItem('a'));
  instance.setItem('b', false);
  assertEquals('false', instance.getItem('b'));
  instance.setItem('c', {a: 1, b: 12});
  assertEquals('[object Object]', instance.getItem('c'));

  instance.clear();
  assertEquals(0, instance.length);

  // Test some special cases.
  instance.setItem('emptyString', '');
  assertEquals('', instance.getItem('emptyString'));
  instance.setItem('isNull', null);
  assertEquals('null', instance.getItem('isNull'));
  instance.setItem('isUndefined', undefined);
  assertEquals('undefined', instance.getItem('isUndefined'));
  instance.setItem('', 'empty key');
  assertEquals('empty key', instance.getItem(''));
  assertEquals(4, instance.length);
}
