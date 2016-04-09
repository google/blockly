// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.math.CoordinateTest');
goog.setTestOnly('goog.math.CoordinateTest');

goog.require('goog.math.Coordinate');
goog.require('goog.testing.jsunit');

function testCoordinate1() {
  var dim1 = new goog.math.Coordinate();
  assertEquals(0, dim1.x);
  assertEquals(0, dim1.y);
  assertEquals('(0, 0)', dim1.toString());
}

function testCoordinate2() {
  var dim2 = new goog.math.Coordinate(10);
  assertEquals(10, dim2.x);
  assertEquals(0, dim2.y);
  assertEquals('(10, 0)', dim2.toString());
}

function testCoordinate3() {
  var dim3 = new goog.math.Coordinate(10, 20);
  assertEquals(10, dim3.x);
  assertEquals(20, dim3.y);
  assertEquals('(10, 20)', dim3.toString());
}

function testCoordinate4() {
  var dim4 = new goog.math.Coordinate(10.5, 20.897);
  assertEquals(10.5, dim4.x);
  assertEquals(20.897, dim4.y);
  assertEquals('(10.5, 20.897)', dim4.toString());
}

function testCoordinate5() {
  var dim5 = new goog.math.Coordinate(NaN, 1000);
  assertTrue(isNaN(dim5.x));
  assertEquals(1000, dim5.y);
  assertEquals('(NaN, 1000)', dim5.toString());
}

function testCoordinateSquaredDistance() {
  var a = new goog.math.Coordinate(7, 11);
  var b = new goog.math.Coordinate(3, -1);
  assertEquals(160, goog.math.Coordinate.squaredDistance(a, b));
}

function testCoordinateDistance() {
  var a = new goog.math.Coordinate(-2, -3);
  var b = new goog.math.Coordinate(2, 0);
  assertEquals(5, goog.math.Coordinate.distance(a, b));
}

function testCoordinateMagnitude() {
  var a = new goog.math.Coordinate(5, 5);
  assertEquals(Math.sqrt(50), goog.math.Coordinate.magnitude(a));
}

function testCoordinateAzimuth() {
  var a = new goog.math.Coordinate(5, 5);
  assertEquals(45, goog.math.Coordinate.azimuth(a));
}

function testCoordinateClone() {
  var c = new goog.math.Coordinate();
  assertEquals(c.toString(), c.clone().toString());
  c.x = -12;
  c.y = 13;
  assertEquals(c.toString(), c.clone().toString());
}

function testCoordinateDifference() {
  assertObjectEquals(
      new goog.math.Coordinate(3, -40),
      goog.math.Coordinate.difference(
          new goog.math.Coordinate(5, 10), new goog.math.Coordinate(2, 50)));
}

function testCoordinateSum() {
  assertObjectEquals(
      new goog.math.Coordinate(7, 60),
      goog.math.Coordinate.sum(
          new goog.math.Coordinate(5, 10), new goog.math.Coordinate(2, 50)));
}

function testCoordinateCeil() {
  var c = new goog.math.Coordinate(5.2, 7.6);
  assertObjectEquals(new goog.math.Coordinate(6, 8), c.ceil());
  c = new goog.math.Coordinate(-1.2, -3.9);
  assertObjectEquals(new goog.math.Coordinate(-1, -3), c.ceil());
}

function testCoordinateFloor() {
  var c = new goog.math.Coordinate(5.2, 7.6);
  assertObjectEquals(new goog.math.Coordinate(5, 7), c.floor());
  c = new goog.math.Coordinate(-1.2, -3.9);
  assertObjectEquals(new goog.math.Coordinate(-2, -4), c.floor());
}

function testCoordinateRound() {
  var c = new goog.math.Coordinate(5.2, 7.6);
  assertObjectEquals(new goog.math.Coordinate(5, 8), c.round());
  c = new goog.math.Coordinate(-1.2, -3.9);
  assertObjectEquals(new goog.math.Coordinate(-1, -4), c.round());
}

function testCoordinateTranslateCoordinate() {
  var c = new goog.math.Coordinate(10, 20);
  var t = new goog.math.Coordinate(5, 10);
  // The translate function modifies the coordinate instead of
  // returning a new one.
  assertEquals(c, c.translate(t));
  assertObjectEquals(new goog.math.Coordinate(15, 30), c);
}

function testCoordinateTranslateXY() {
  var c = new goog.math.Coordinate(10, 20);
  // The translate function modifies the coordinate instead of
  // returning a new one.
  assertEquals(c, c.translate(25, 5));
  assertObjectEquals(new goog.math.Coordinate(35, 25), c);
}

function testCoordinateTranslateX() {
  var c = new goog.math.Coordinate(10, 20);
  // The translate function modifies the coordinate instead of
  // returning a new one.
  assertEquals(c, c.translate(5));
  assertObjectEquals(new goog.math.Coordinate(15, 20), c);
}

function testCoordinateScaleXY() {
  var c = new goog.math.Coordinate(10, 15);
  // The scale function modifies the coordinate instead of returning a new one.
  assertEquals(c, c.scale(2, 3));
  assertObjectEquals(new goog.math.Coordinate(20, 45), c);
}

function testCoordinateScaleFactor() {
  var c = new goog.math.Coordinate(10, 15);
  // The scale function modifies the coordinate instead of returning a new one.
  assertEquals(c, c.scale(2));
  assertObjectEquals(new goog.math.Coordinate(20, 30), c);
}

function testCoordinateRotateRadians() {
  var c = new goog.math.Coordinate(15, 75);
  c.rotateRadians(Math.PI / 2, new goog.math.Coordinate(10, 70));
  assertObjectEquals(new goog.math.Coordinate(5, 75), c);
}

function testCoordinateRotateDegrees() {
  var c = new goog.math.Coordinate(15, 75);
  c.rotateDegrees(90, new goog.math.Coordinate(10, 70));
  assertObjectEquals(new goog.math.Coordinate(5, 75), c);
}
