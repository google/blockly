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

goog.provide('goog.storage.mechanism.PrefixedMechanismTest');
goog.setTestOnly('goog.storage.mechanism.PrefixedMechanismTest');

goog.require('goog.storage.mechanism.HTML5LocalStorage');
goog.require('goog.storage.mechanism.PrefixedMechanism');
/** @suppress {extraRequire} */
goog.require('goog.storage.mechanism.mechanismSeparationTester');
/** @suppress {extraRequire} */
goog.require('goog.storage.mechanism.mechanismSharingTester');
goog.require('goog.testing.jsunit');

var submechanism = null;

function setUp() {
  submechanism = new goog.storage.mechanism.HTML5LocalStorage();
  if (submechanism.isAvailable()) {
    mechanism =
        new goog.storage.mechanism.PrefixedMechanism(submechanism, 'test');
    mechanism_shared =
        new goog.storage.mechanism.PrefixedMechanism(submechanism, 'test');
    mechanism_separate =
        new goog.storage.mechanism.PrefixedMechanism(submechanism, 'test2');
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
  if (submechanism.isAvailable()) {
    assertNotNull(mechanism);
    assertNotNull(mechanism_shared);
    assertNotNull(mechanism_separate);
  }
}
