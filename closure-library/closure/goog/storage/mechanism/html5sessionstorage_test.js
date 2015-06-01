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

goog.provide('goog.storage.mechanism.HTML5SessionStorageTest');
goog.setTestOnly('goog.storage.mechanism.HTML5SessionStorageTest');

goog.require('goog.storage.mechanism.HTML5SessionStorage');
/** @suppress {extraRequire} */
goog.require('goog.storage.mechanism.mechanismSeparationTester');
/** @suppress {extraRequire} */
goog.require('goog.storage.mechanism.mechanismSharingTester');
/** @suppress {extraRequire} */
goog.require('goog.storage.mechanism.mechanismTestDefinition');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

function setUp() {
  var sessionStorage = new goog.storage.mechanism.HTML5SessionStorage();
  if (sessionStorage.isAvailable()) {
    mechanism = sessionStorage;
    // There should be at least 2 MiB.
    minimumQuota = 2 * 1024 * 1024;
    mechanism_shared = new goog.storage.mechanism.HTML5SessionStorage();
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
}

function testAvailability() {
  if (goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher('532.5') ||
      goog.userAgent.GECKO && goog.userAgent.isVersionOrHigher('1.9.1') &&
      window.location.protocol != 'file:' ||
      goog.userAgent.IE && goog.userAgent.isVersionOrHigher('8')) {
    assertNotNull(mechanism);
    assertTrue(mechanism.isAvailable());
    assertNotNull(mechanism_shared);
    assertTrue(mechanism_shared.isAvailable());
  }
}
