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

goog.provide('goog.storage.mechanism.IEUserDataTest');
goog.setTestOnly('goog.storage.mechanism.IEUserDataTest');

goog.require('goog.storage.mechanism.IEUserData');
/** @suppress {extraRequire} */
goog.require('goog.storage.mechanism.mechanismSeparationTester');
/** @suppress {extraRequire} */
goog.require('goog.storage.mechanism.mechanismSharingTester');
/** @suppress {extraRequire} */
goog.require('goog.storage.mechanism.mechanismTestDefinition');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

function setUp() {
  var ieUserData = new goog.storage.mechanism.IEUserData('test');
  if (ieUserData.isAvailable()) {
    mechanism = ieUserData;
    // There should be at least 32 KiB.
    minimumQuota = 32 * 1024;
    mechanism_shared = new goog.storage.mechanism.IEUserData('test');
    mechanism_separate = new goog.storage.mechanism.IEUserData('test2');
  }
}

function tearDown() {
  if (!!mechanism) {
    mechanism.clear();
    mechanism = null;
  }
  if (!!mechanism_shared) {
    mechanism_shared.clear();
    mechanism_shared = null;
  }
  if (!!mechanism_separate) {
    mechanism_separate.clear();
    mechanism_separate = null;
  }
}

function testAvailability() {
  if (goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9)) {
    assertNotNull(mechanism);
    assertTrue(mechanism.isAvailable());
    assertNotNull(mechanism_shared);
    assertTrue(mechanism_shared.isAvailable());
    assertNotNull(mechanism_separate);
    assertTrue(mechanism_separate.isAvailable());
  }
}

function testEncoding() {
  function assertEncodingPair(cleartext, encoded) {
    assertEquals(
        encoded, goog.storage.mechanism.IEUserData.encodeKey_(cleartext));
    assertEquals(
        cleartext, goog.storage.mechanism.IEUserData.decodeKey_(encoded));
  }
  assertEncodingPair('simple', '_simple');
  assertEncodingPair(
      'aa.bb%cc!\0$\u4e00.', '_aa.2Ebb.25cc.21.00.24.E4.B8.80.2E');
}
