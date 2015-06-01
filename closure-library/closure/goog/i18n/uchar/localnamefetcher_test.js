// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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


goog.provide('goog.i18n.uChar.LocalNameFetcherTest');
goog.setTestOnly('goog.i18n.uChar.LocalNameFetcherTest');

goog.require('goog.i18n.uChar.LocalNameFetcher');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');

var nameFetcher = null;

function setUp() {
  nameFetcher = new goog.i18n.uChar.LocalNameFetcher();
}

function testGetName_exists() {
  var callback = goog.testing.recordFunction(function(name) {
    assertEquals('Space', name);
  });
  nameFetcher.getName(' ', callback);
  assertEquals(1, callback.getCallCount());
}

function testGetName_variationSelector() {
  var callback = goog.testing.recordFunction(function(name) {
    assertEquals('Variation Selector - 1', name);
  });
  nameFetcher.getName('\ufe00', callback);
  assertEquals(1, callback.getCallCount());
}

function testGetName_missing() {
  var callback = goog.testing.recordFunction(function(name) {
    assertNull(name);
  });
  nameFetcher.getName('P', callback);
  assertEquals(1, callback.getCallCount());
}

function testIsNameAvailable_withAvailableName() {
  assertTrue(nameFetcher.isNameAvailable(' '));
}

function testIsNameAvailable_withoutAvailableName() {
  assertFalse(nameFetcher.isNameAvailable('a'));
}
