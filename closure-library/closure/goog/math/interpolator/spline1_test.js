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

goog.provide('goog.math.interpolator.Spline1Test');
goog.setTestOnly('goog.math.interpolator.Spline1Test');

goog.require('goog.math.interpolator.Spline1');
goog.require('goog.testing.jsunit');

function testSpline() {
  // Test special case with no data to interpolate.
  var x = [];
  var y = [];
  var interp = new goog.math.interpolator.Spline1();
  interp.setData(x, y);
  assertTrue(isNaN(interp.interpolate(1)));

  // Test special case with 1 data point.
  x = [0];
  y = [2];
  interp = new goog.math.interpolator.Spline1();
  interp.setData(x, y);
  assertRoughlyEquals(2, interp.interpolate(1), 1e-4);

  // Test special case with 2 data points.
  x = [0, 1];
  y = [2, 5];
  interp = new goog.math.interpolator.Spline1();
  interp.setData(x, y);
  assertRoughlyEquals(3.5, interp.interpolate(.5), 1e-4);

  // Test special case with 3 data points.
  x = [0, 1, 2];
  y = [2, 5, 4];
  interp = new goog.math.interpolator.Spline1();
  interp.setData(x, y);
  assertRoughlyEquals(4, interp.interpolate(.5), 1e-4);
  assertRoughlyEquals(-1, interp.interpolate(3), 1e-4);

  // Test general case.
  x = [0, 1, 3, 6, 7];
  y = [0, 0, 0, 0, 0];
  for (var i = 0; i < x.length; ++i) {
    y[i] = Math.sin(x[i]);
  }
  interp = new goog.math.interpolator.Spline1();
  interp.setData(x, y);

  var xi = [0, 0.5, 1, 2, 3, 4, 5, 6, 7];
  var expected =
      [0, 0.5775, 0.8415, 0.7047, 0.1411, -0.3601, -0.55940, -0.2794, 0.6570];
  var result = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (var i = 0; i < xi.length; ++i) {
    result[i] = interp.interpolate(xi[i]);
  }
  assertElementsRoughlyEqual(expected, result, 1e-4);
}


function testOutOfBounds() {
  var x = [0, 1, 2, 4];
  var y = [2, 5, 4, 1];
  var interp = new goog.math.interpolator.Spline1();
  interp.setData(x, y);
  assertRoughlyEquals(-7.75, interp.interpolate(-1), 1e-4);
  assertRoughlyEquals(4.5, interp.interpolate(5), 1e-4);
}


function testInverse() {
  var x = [0, 1, 3, 6, 7];
  var y = [0, 2, 7, 8, 10];

  var interp = new goog.math.interpolator.Spline1();
  interp.setData(x, y);
  var invInterp = interp.getInverse();

  var xi = [0, 0.5, 1, 2, 3, 4, 5, 6, 7];
  var yi = [0, 0.8159, 2, 4.7892, 7, 7.6912, 7.6275, 8, 10];
  var expectedX = [0, 0.8142, 1, 0.2638, 3, 5.0534, 4.8544, 6, 7];
  var resultX = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  var resultY = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (var i = 0; i < xi.length; ++i) {
    resultY[i] = interp.interpolate(xi[i]);
    resultX[i] = invInterp.interpolate(yi[i]);
  }
  assertElementsRoughlyEqual(expectedX, resultX, 1e-4);
  assertElementsRoughlyEqual(yi, resultY, 1e-4);
}
