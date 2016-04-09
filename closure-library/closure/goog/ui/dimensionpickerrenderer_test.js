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

goog.provide('goog.ui.DimensionPickerRendererTest');
goog.setTestOnly('goog.ui.DimensionPickerRendererTest');

goog.require('goog.a11y.aria.LivePriority');
goog.require('goog.array');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');
goog.require('goog.ui.DimensionPicker');
goog.require('goog.ui.DimensionPickerRenderer');


var renderer;
var picker;

function setUp() {
  renderer = new goog.ui.DimensionPickerRenderer();
  picker = new goog.ui.DimensionPicker(renderer);
}

function tearDown() {
  picker.dispose();
}


/**
 * Tests that the right aria label is added when the highlighted
 * size changes.
 */
function testSetHighlightedSizeUpdatesLiveRegion() {
  picker.render();

  var sayFunction = goog.testing.recordFunction();
  renderer.announcer_.say = sayFunction;
  renderer.setHighlightedSize(picker, 3, 7);

  assertEquals(1, sayFunction.getCallCount());

  assertTrue(
      goog.array.equals(
          ['3 by 7', goog.a11y.aria.LivePriority.ASSERTIVE],
          sayFunction.getLastCall().getArguments()));
}
