// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Unit tests for goog.testing.i18n.asserts.
 */

goog.provide('goog.testing.i18n.assertsTest');
goog.setTestOnly('goog.testing.i18n.assertsTest');

goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.i18n.asserts');


// Add this mapping for testing only
goog.testing.i18n.asserts.EXPECTED_VALUE_MAP_['mappedValue'] = 'newValue';

var expectedFailures = new goog.testing.ExpectedFailures();

function tearDown() {
  expectedFailures.handleTearDown();
}

function testEdgeCases() {
  // Pass
  goog.testing.i18n.asserts.assertI18nEquals(null, null);
  goog.testing.i18n.asserts.assertI18nEquals('', '');

  // Fail
  expectedFailures.expectFailureFor(true);
  try {
    goog.testing.i18n.asserts.assertI18nEquals(null, '');
    goog.testing.i18n.asserts.assertI18nEquals(null, 'test');
    goog.testing.i18n.asserts.assertI18nEquals('', null);
    goog.testing.i18n.asserts.assertI18nEquals('', 'test');
    goog.testing.i18n.asserts.assertI18nEquals('test', null);
    goog.testing.i18n.asserts.assertI18nEquals('test', '');
  } catch (e) {
    expectedFailures.handleException(e);
  }
}

function testMappingWorks() {
  // Real equality
  goog.testing.i18n.asserts.assertI18nEquals('test', 'test');
  // i18n mapped equality
  goog.testing.i18n.asserts.assertI18nEquals('mappedValue', 'newValue');

  // Negative testing
  expectedFailures.expectFailureFor(true);
  try {
    goog.testing.i18n.asserts.assertI18nEquals('unmappedValue', 'newValue');
  } catch (e) {
    expectedFailures.handleException(e);
  }
}
