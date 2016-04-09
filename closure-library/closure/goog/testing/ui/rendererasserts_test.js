// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.testing.ui.rendererassertsTest');
goog.setTestOnly('goog.testing.ui.rendererassertsTest');

goog.require('goog.testing.TestCase');
goog.require('goog.testing.asserts');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.ui.rendererasserts');
goog.require('goog.ui.ControlRenderer');

function setUp() {
  // TODO(b/25875505): Fix unreported assertions (go/failonunreportedasserts).
  goog.testing.TestCase.getActiveTestCase().failOnUnreportedAsserts = false;
}

function testSuccess() {
  function GoodRenderer() {}

  goog.testing.ui.rendererasserts.assertNoGetCssClassCallsInConstructor(
      GoodRenderer);
}

function testFailure() {
  function BadRenderer() {
    goog.ui.ControlRenderer.call(this);
    this.myClass = this.getCssClass();
  }
  goog.inherits(BadRenderer, goog.ui.ControlRenderer);

  var ex = assertThrows(
      'Expected assertNoGetCssClassCallsInConstructor to fail.', function() {
        goog.testing.ui.rendererasserts.assertNoGetCssClassCallsInConstructor(
            BadRenderer);
      });
  assertTrue(
      'Expected assertNoGetCssClassCallsInConstructor to throw a' +
          ' jsunit exception',
      ex.isJsUnitException);
  assertContains('getCssClass', ex.message);
}
