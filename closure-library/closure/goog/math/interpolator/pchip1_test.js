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

goog.provide('goog.math.interpolator.Pchip1Test');
goog.setTestOnly('goog.math.interpolator.Pchip1Test');

goog.require('goog.math.interpolator.Pchip1');
goog.require('goog.testing.jsunit');

function testSpline() {
  var x = [0, 1, 3, 6, 7];
  var y = [0, 0, 0, 0, 0];

  for (var i = 0; i < x.length; ++i) {
    y[i] = Math.sin(x[i]);
  }
  var interp = new goog.math.interpolator.Pchip1();
  interp.setData(x, y);

  var xi = [0, 0.5, 1, 2, 3, 4, 5, 6, 7];
  var expected = [0, 0.5756, 0.8415, 0.5428, 0.1411, -0.0595, -0.2162,
    -0.2794, 0.657];
  var result = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (var i = 0; i < xi.length; ++i) {
    result[i] = interp.interpolate(xi[i]);
  }
  assertElementsRoughlyEqual(expected, result, 1e-4);
}


function testOutOfBounds() {
  var x = [0, 1, 2, 4];
  var y = [2, 5, 4, 2];
  var interp = new goog.math.interpolator.Pchip1();
  interp.setData(x, y);
  assertRoughlyEquals(-3, interp.interpolate(-1), 1e-4);
  assertRoughlyEquals(1, interp.interpolate(5), 1e-4);
}


function testInverse() {
  var x = [0, 1, 3, 6, 7];
  var y = [0, 2, 7, 8, 10];

  var interp = new goog.math.interpolator.Pchip1();
  interp.setData(x, y);
  var invInterp = interp.getInverse();

  var xi = [0, 0.5, 1, 2, 3, 4, 5, 6, 7];
  var yi = [0, 0.9548, 2, 4.8938, 7, 7.3906, 7.5902, 8, 10];
  var expectedX = [0, 0.888, 1, 0.2852, 3, 4.1206, 4.7379, 6, 7];
  var resultX = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  var resultY = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (var i = 0; i < xi.length; ++i) {
    resultY[i] = interp.interpolate(xi[i]);
    resultX[i] = invInterp.interpolate(yi[i]);
  }
  assertElementsRoughlyEqual(expectedX, resultX, 1e-4);
  assertElementsRoughlyEqual(yi, resultY, 1e-4);
}
