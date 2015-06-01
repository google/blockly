// Copyright 2014 The Closure Library Authors. All Rights Reserved.
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

/**
 * @fileoverview Tests for {@code goog.structs.weak}. set, has, and remove are
 * exercised in {@code goog.structs.weak.MapTest} and
 * {@code goog.structs.weak.SetTest}.
 *
 */


goog.provide('goog.structs.weakTest');
goog.setTestOnly('goog.structs.weakTest');

goog.require('goog.array');
goog.require('goog.structs.weak');
goog.require('goog.testing.jsunit');


function shouldRunTests() {
  return goog.structs.weak.SUPPORTED_BROWSER;
}


function testGenerateId() {
  assertNotEquals(goog.structs.weak.generateId(),
                  goog.structs.weak.generateId());
}


function testCheckKeyTypeValidObject() {
  var validKeys = [{}, [], document.body, /RegExp/, goog.nullFunction];
  goog.array.forEach(validKeys, function(key) {
    // no error
    goog.structs.weak.checkKeyType(key);
  });
}


function testCheckKeyTypePrimitive() {
  var primitiveKeys = ['test', 1, true, null, undefined];
  goog.array.forEach(primitiveKeys, function(key) {
    assertThrows(function() {
      goog.structs.weak.checkKeyType(key);
    });
  });
}


function testCheckKeyTypeNonExtensibleObject() {
  var sealedObj = {}, frozenObj = {}, preventExtensionsObj = {};
  Object.seal(sealedObj);
  Object.freeze(frozenObj);
  Object.preventExtensions(preventExtensionsObj);
  assertThrows(function() {
    goog.structs.weak.checkKeyType(sealedObj);
  });
  assertThrows(function() {
    goog.structs.weak.checkKeyType(frozenObj);
  });
  assertThrows(function() {
    goog.structs.weak.checkKeyType(preventExtensionsObj);
  });
}
