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

goog.provide('goog.style.webkitScrollbarsTest');
goog.setTestOnly('goog.style.webkitScrollbarsTest');

goog.require('goog.asserts');
goog.require('goog.style');
/** @suppress {extraRequire} */
goog.require('goog.styleScrollbarTester');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var expectedFailures;

function setUpPage() {
  expectedFailures = new goog.testing.ExpectedFailures();
}

function tearDown() {
  expectedFailures.handleTearDown();

  // Assert that the test loaded.
  goog.asserts.assert(testScrollbarWidth);
}

function testScrollBarWidth_webkitScrollbar() {
  expectedFailures.expectFailureFor(!goog.userAgent.WEBKIT);

  try {
    var width = goog.style.getScrollbarWidth();
    assertEquals('Scrollbar width should be 16', 16, width);
  } catch (e) {
    expectedFailures.handleException(e);
  }
}

function testScrollBarWidth_webkitScrollbarWithCustomClass() {
  expectedFailures.expectFailureFor(!goog.userAgent.WEBKIT);

  try {
    var customWidth = goog.style.getScrollbarWidth('otherScrollBar');
    assertEquals('Custom width should be 10', 10, customWidth);
  } catch (e) {
    expectedFailures.handleException(e);
  }
}
