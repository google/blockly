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


goog.provide('goog.i18n.collationTest');
goog.setTestOnly('goog.i18n.collationTest');

goog.require('goog.i18n.collation');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var expectedFailures;

function setUpPage() {
  expectedFailures = new goog.testing.ExpectedFailures();
}

function tearDown() {
  expectedFailures.handleTearDown();
}

function testGetEnComparator() {
  goog.LOCALE = 'en';
  var compare = goog.i18n.collation.createComparator();
  // The côte/coté comparison fails in FF/Linux (v19.0) because
  // calling 'côte'.localeCompare('coté')  gives a negative number (wrong)
  // when the test is run but a positive number (correct) when calling
  // it later in the web console. FF/OSX doesn't have this problem.
  // Mozilla bug: https://bugzilla.mozilla.org/show_bug.cgi?id=856115
  expectedFailures.expectFailureFor(
      goog.userAgent.GECKO && goog.userAgent.LINUX);
  try {
    assertTrue(compare('côte', 'coté') > 0);
  } catch (e) {
    expectedFailures.handleException(e);
  }
}

function testGetFrComparator() {
  goog.LOCALE = 'fr-CA';
  var compare = goog.i18n.collation.createComparator();
  if (!goog.i18n.collation.hasNativeComparator()) return;
  assertTrue(compare('côte', 'coté') < 0);
}

function testGetComparatorForSpecificLocale() {
  goog.LOCALE = 'en';
  var compare = goog.i18n.collation.createComparator('fr-CA');
  if (!goog.i18n.collation.hasNativeComparator('fr-CA')) return;
  // 'côte' and 'coté' sort differently for en and fr-CA.
  assertTrue(compare('côte', 'coté') < 0);
}
