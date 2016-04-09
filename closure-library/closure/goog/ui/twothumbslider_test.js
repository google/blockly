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

goog.provide('goog.ui.TwoThumbSliderTest');
goog.setTestOnly('goog.ui.TwoThumbSliderTest');

goog.require('goog.testing.jsunit');
goog.require('goog.ui.SliderBase');
goog.require('goog.ui.TwoThumbSlider');

var slider;

function tearDown() {
  goog.dispose(slider);
}

function testGetCssClass() {
  slider = new goog.ui.TwoThumbSlider();
  assertEquals(
      'goog-twothumbslider-horizontal',
      slider.getCssClass(goog.ui.SliderBase.Orientation.HORIZONTAL));
  assertEquals(
      'goog-twothumbslider-vertical',
      slider.getCssClass(goog.ui.SliderBase.Orientation.VERTICAL));
}
