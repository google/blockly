// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.math.LineTest');
goog.setTestOnly('goog.math.LineTest');

goog.require('goog.math.Coordinate');
goog.require('goog.math.Line');
goog.require('goog.testing.jsunit');

function testEquals() {
  var input = new goog.math.Line(1, 2, 3, 4);

  assert(input.equals(input));
}

function testClone() {
  var input = new goog.math.Line(1, 2, 3, 4);

  assertNotEquals('Clone returns a new object', input, input.clone());
  assertTrue('Contents of clone match original', input.equals(input.clone()));
}

function testGetLength() {
  var input = new goog.math.Line(0, 0, Math.sqrt(2), Math.sqrt(2));
  assertRoughlyEquals(input.getSegmentLengthSquared(), 4, 1e-10);
  assertRoughlyEquals(input.getSegmentLength(), 2, 1e-10);
}

function testGetClosestPoint() {
  var input = new goog.math.Line(0, 1, 1, 2);

  var point = input.getClosestPoint(0, 3);
  assertRoughlyEquals(point.x, 1, 1e-10);
  assertRoughlyEquals(point.y, 2, 1e-10);
}

function testGetClosestSegmentPoint() {
  var input = new goog.math.Line(0, 1, 2, 3);

  var point = input.getClosestSegmentPoint(4, 4);
  assertRoughlyEquals(point.x, 2, 1e-10);
  assertRoughlyEquals(point.y, 3, 1e-10);

  point = input.getClosestSegmentPoint(new goog.math.Coordinate(-1, -10));
  assertRoughlyEquals(point.x, 0, 1e-10);
  assertRoughlyEquals(point.y, 1, 1e-10);
}
