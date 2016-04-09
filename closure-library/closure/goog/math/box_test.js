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

goog.provide('goog.math.BoxTest');
goog.setTestOnly('goog.math.BoxTest');

goog.require('goog.math.Box');
goog.require('goog.math.Coordinate');
goog.require('goog.testing.jsunit');

function testBoxEquals() {
  var a = new goog.math.Box(1, 2, 3, 4);
  var b = new goog.math.Box(1, 2, 3, 4);
  assertTrue(goog.math.Box.equals(a, a));
  assertTrue(goog.math.Box.equals(a, b));
  assertTrue(goog.math.Box.equals(b, a));

  assertFalse('Box should not equal null.', goog.math.Box.equals(a, null));
  assertFalse('Box should not equal null.', goog.math.Box.equals(null, a));

  assertFalse(goog.math.Box.equals(a, new goog.math.Box(4, 2, 3, 4)));
  assertFalse(goog.math.Box.equals(a, new goog.math.Box(1, 4, 3, 4)));
  assertFalse(goog.math.Box.equals(a, new goog.math.Box(1, 2, 4, 4)));
  assertFalse(goog.math.Box.equals(a, new goog.math.Box(1, 2, 3, 1)));

  assertTrue('Null boxes should be equal.', goog.math.Box.equals(null, null));
}

function testBoxClone() {
  var b = new goog.math.Box(0, 0, 0, 0);
  assertTrue(goog.math.Box.equals(b, b.clone()));

  b.left = 0;
  b.top = 1;
  b.right = 2;
  b.bottom = 3;
  assertTrue(goog.math.Box.equals(b, b.clone()));
}

function testBoxRelativePositionX() {
  var box = new goog.math.Box(50, 100, 100, 50);

  assertEquals(
      0, goog.math.Box.relativePositionX(box, new goog.math.Coordinate(75, 0)));
  assertEquals(
      0,
      goog.math.Box.relativePositionX(box, new goog.math.Coordinate(75, 75)));
  assertEquals(
      0,
      goog.math.Box.relativePositionX(box, new goog.math.Coordinate(75, 105)));
  assertEquals(
      -5,
      goog.math.Box.relativePositionX(box, new goog.math.Coordinate(45, 75)));
  assertEquals(
      5,
      goog.math.Box.relativePositionX(box, new goog.math.Coordinate(105, 75)));
}

function testBoxRelativePositionY() {
  var box = new goog.math.Box(50, 100, 100, 50);

  assertEquals(
      0, goog.math.Box.relativePositionY(box, new goog.math.Coordinate(0, 75)));
  assertEquals(
      0,
      goog.math.Box.relativePositionY(box, new goog.math.Coordinate(75, 75)));
  assertEquals(
      0,
      goog.math.Box.relativePositionY(box, new goog.math.Coordinate(105, 75)));
  assertEquals(
      -5,
      goog.math.Box.relativePositionY(box, new goog.math.Coordinate(75, 45)));
  assertEquals(
      5,
      goog.math.Box.relativePositionY(box, new goog.math.Coordinate(75, 105)));
}

function testBoxDistance() {
  var box = new goog.math.Box(50, 100, 100, 50);

  assertEquals(
      0, goog.math.Box.distance(box, new goog.math.Coordinate(75, 75)));
  assertEquals(
      25, goog.math.Box.distance(box, new goog.math.Coordinate(75, 25)));
  assertEquals(
      10, goog.math.Box.distance(box, new goog.math.Coordinate(40, 80)));
  assertEquals(
      5, goog.math.Box.distance(box, new goog.math.Coordinate(46, 47)));
  assertEquals(
      10, goog.math.Box.distance(box, new goog.math.Coordinate(106, 108)));
}

function testBoxContains() {
  var box = new goog.math.Box(50, 100, 100, 50);

  assertTrue(goog.math.Box.contains(box, new goog.math.Coordinate(75, 75)));
  assertTrue(goog.math.Box.contains(box, new goog.math.Coordinate(50, 100)));
  assertTrue(goog.math.Box.contains(box, new goog.math.Coordinate(100, 99)));
  assertFalse(goog.math.Box.contains(box, new goog.math.Coordinate(100, 101)));
  assertFalse(goog.math.Box.contains(box, new goog.math.Coordinate(49, 50)));
  assertFalse(goog.math.Box.contains(box, new goog.math.Coordinate(25, 25)));
}

function testBoxContainsBox() {
  var box = new goog.math.Box(50, 100, 100, 50);

  function assertContains(boxB) {
    assertTrue(
        box + ' expected to contain ' + boxB,
        goog.math.Box.contains(box, boxB));
  }

  function assertNotContains(boxB) {
    assertFalse(
        box + ' expected to not contain ' + boxB,
        goog.math.Box.contains(box, boxB));
  }

  assertContains(new goog.math.Box(60, 90, 90, 60));
  assertNotContains(new goog.math.Box(1, 3, 4, 2));
  assertNotContains(new goog.math.Box(30, 90, 60, 60));
  assertNotContains(new goog.math.Box(60, 110, 60, 60));
  assertNotContains(new goog.math.Box(60, 90, 110, 60));
  assertNotContains(new goog.math.Box(60, 90, 60, 40));
}

function testBoxesIntersect() {
  var box = new goog.math.Box(50, 100, 100, 50);

  function assertIntersects(boxB) {
    assertTrue(
        box + ' expected to intersect ' + boxB,
        goog.math.Box.intersects(box, boxB));
  }
  function assertNotIntersects(boxB) {
    assertFalse(
        box + ' expected to not intersect ' + boxB,
        goog.math.Box.intersects(box, boxB));
  }

  assertIntersects(box);
  assertIntersects(new goog.math.Box(20, 80, 80, 20));
  assertIntersects(new goog.math.Box(50, 80, 100, 20));
  assertIntersects(new goog.math.Box(80, 80, 120, 20));
  assertIntersects(new goog.math.Box(20, 100, 80, 50));
  assertIntersects(new goog.math.Box(80, 100, 120, 50));
  assertIntersects(new goog.math.Box(20, 120, 80, 80));
  assertIntersects(new goog.math.Box(50, 120, 100, 80));
  assertIntersects(new goog.math.Box(80, 120, 120, 80));
  assertIntersects(new goog.math.Box(20, 120, 120, 20));
  assertIntersects(new goog.math.Box(70, 80, 80, 70));
  assertNotIntersects(new goog.math.Box(10, 30, 30, 10));
  assertNotIntersects(new goog.math.Box(10, 70, 30, 30));
  assertNotIntersects(new goog.math.Box(10, 100, 30, 50));
  assertNotIntersects(new goog.math.Box(10, 120, 30, 80));
  assertNotIntersects(new goog.math.Box(10, 140, 30, 120));
  assertNotIntersects(new goog.math.Box(30, 30, 70, 10));
  assertNotIntersects(new goog.math.Box(30, 140, 70, 120));
  assertNotIntersects(new goog.math.Box(50, 30, 100, 10));
  assertNotIntersects(new goog.math.Box(50, 140, 100, 120));
  assertNotIntersects(new goog.math.Box(80, 30, 120, 10));
  assertNotIntersects(new goog.math.Box(80, 140, 120, 120));
  assertNotIntersects(new goog.math.Box(120, 30, 140, 10));
  assertNotIntersects(new goog.math.Box(120, 70, 140, 30));
  assertNotIntersects(new goog.math.Box(120, 100, 140, 50));
  assertNotIntersects(new goog.math.Box(120, 120, 140, 80));
  assertNotIntersects(new goog.math.Box(120, 140, 140, 120));
}

function testBoxesIntersectWithPadding() {
  var box = new goog.math.Box(50, 100, 100, 50);

  function assertIntersects(boxB, padding) {
    assertTrue(
        box + ' expected to intersect ' + boxB + ' with padding ' + padding,
        goog.math.Box.intersectsWithPadding(box, boxB, padding));
  }
  function assertNotIntersects(boxB, padding) {
    assertFalse(
        box + ' expected to not intersect ' + boxB + ' with padding ' + padding,
        goog.math.Box.intersectsWithPadding(box, boxB, padding));
  }

  assertIntersects(box, 10);
  assertIntersects(new goog.math.Box(20, 80, 80, 20), 10);
  assertIntersects(new goog.math.Box(50, 80, 100, 20), 10);
  assertIntersects(new goog.math.Box(80, 80, 120, 20), 10);
  assertIntersects(new goog.math.Box(20, 100, 80, 50), 10);
  assertIntersects(new goog.math.Box(80, 100, 120, 50), 10);
  assertIntersects(new goog.math.Box(20, 120, 80, 80), 10);
  assertIntersects(new goog.math.Box(50, 120, 100, 80), 10);
  assertIntersects(new goog.math.Box(80, 120, 120, 80), 10);
  assertIntersects(new goog.math.Box(20, 120, 120, 20), 10);
  assertIntersects(new goog.math.Box(70, 80, 80, 70), 10);
  assertIntersects(new goog.math.Box(10, 30, 30, 10), 20);
  assertIntersects(new goog.math.Box(10, 70, 30, 30), 20);
  assertIntersects(new goog.math.Box(10, 100, 30, 50), 20);
  assertIntersects(new goog.math.Box(10, 120, 30, 80), 20);
  assertIntersects(new goog.math.Box(10, 140, 30, 120), 20);
  assertIntersects(new goog.math.Box(30, 30, 70, 10), 20);
  assertIntersects(new goog.math.Box(30, 140, 70, 120), 20);
  assertIntersects(new goog.math.Box(50, 30, 100, 10), 20);
  assertIntersects(new goog.math.Box(50, 140, 100, 120), 20);
  assertIntersects(new goog.math.Box(80, 30, 120, 10), 20);
  assertIntersects(new goog.math.Box(80, 140, 120, 120), 20);
  assertIntersects(new goog.math.Box(120, 30, 140, 10), 20);
  assertIntersects(new goog.math.Box(120, 70, 140, 30), 20);
  assertIntersects(new goog.math.Box(120, 100, 140, 50), 20);
  assertIntersects(new goog.math.Box(120, 120, 140, 80), 20);
  assertIntersects(new goog.math.Box(120, 140, 140, 120), 20);
  assertNotIntersects(new goog.math.Box(10, 30, 30, 10), 10);
  assertNotIntersects(new goog.math.Box(10, 70, 30, 30), 10);
  assertNotIntersects(new goog.math.Box(10, 100, 30, 50), 10);
  assertNotIntersects(new goog.math.Box(10, 120, 30, 80), 10);
  assertNotIntersects(new goog.math.Box(10, 140, 30, 120), 10);
  assertNotIntersects(new goog.math.Box(30, 30, 70, 10), 10);
  assertNotIntersects(new goog.math.Box(30, 140, 70, 120), 10);
  assertNotIntersects(new goog.math.Box(50, 30, 100, 10), 10);
  assertNotIntersects(new goog.math.Box(50, 140, 100, 120), 10);
  assertNotIntersects(new goog.math.Box(80, 30, 120, 10), 10);
  assertNotIntersects(new goog.math.Box(80, 140, 120, 120), 10);
  assertNotIntersects(new goog.math.Box(120, 30, 140, 10), 10);
  assertNotIntersects(new goog.math.Box(120, 70, 140, 30), 10);
  assertNotIntersects(new goog.math.Box(120, 100, 140, 50), 10);
  assertNotIntersects(new goog.math.Box(120, 120, 140, 80), 10);
  assertNotIntersects(new goog.math.Box(120, 140, 140, 120), 10);
}

function testExpandToInclude() {
  var box = new goog.math.Box(10, 50, 50, 10);
  box.expandToInclude(new goog.math.Box(60, 70, 70, 60));
  assertEquals(10, box.left);
  assertEquals(10, box.top);
  assertEquals(70, box.right);
  assertEquals(70, box.bottom);
  box.expandToInclude(new goog.math.Box(30, 40, 40, 30));
  assertEquals(10, box.left);
  assertEquals(10, box.top);
  assertEquals(70, box.right);
  assertEquals(70, box.bottom);
  box.expandToInclude(new goog.math.Box(0, 100, 100, 0));
  assertEquals(0, box.left);
  assertEquals(0, box.top);
  assertEquals(100, box.right);
  assertEquals(100, box.bottom);
}

function testExpandToIncludeCoordinate() {
  var box = new goog.math.Box(10, 50, 50, 10);
  box.expandToIncludeCoordinate(new goog.math.Coordinate(0, 0));
  assertEquals(0, box.left);
  assertEquals(0, box.top);
  assertEquals(50, box.right);
  assertEquals(50, box.bottom);
  box.expandToIncludeCoordinate(new goog.math.Coordinate(100, 0));
  assertEquals(0, box.left);
  assertEquals(0, box.top);
  assertEquals(100, box.right);
  assertEquals(50, box.bottom);
  box.expandToIncludeCoordinate(new goog.math.Coordinate(0, 100));
  assertEquals(0, box.left);
  assertEquals(0, box.top);
  assertEquals(100, box.right);
  assertEquals(100, box.bottom);
}

function testGetWidth() {
  var box = new goog.math.Box(10, 50, 30, 25);
  assertEquals(25, box.getWidth());
}

function testGetHeight() {
  var box = new goog.math.Box(10, 50, 30, 25);
  assertEquals(20, box.getHeight());
}

function testBoundingBox() {
  assertObjectEquals(
      new goog.math.Box(1, 10, 11, 0),
      goog.math.Box.boundingBox(
          new goog.math.Coordinate(5, 5), new goog.math.Coordinate(5, 11),
          new goog.math.Coordinate(0, 5), new goog.math.Coordinate(5, 1),
          new goog.math.Coordinate(10, 5)));
}

function testBoxCeil() {
  var box = new goog.math.Box(11.4, 26.6, 17.8, 9.2);
  assertEquals(
      'The function should return the target instance', box, box.ceil());
  assertObjectEquals(new goog.math.Box(12, 27, 18, 10), box);
}

function testBoxFloor() {
  var box = new goog.math.Box(11.4, 26.6, 17.8, 9.2);
  assertEquals(
      'The function should return the target instance', box, box.floor());
  assertObjectEquals(new goog.math.Box(11, 26, 17, 9), box);
}

function testBoxRound() {
  var box = new goog.math.Box(11.4, 26.6, 17.8, 9.2);
  assertEquals(
      'The function should return the target instance', box, box.round());
  assertObjectEquals(new goog.math.Box(11, 27, 18, 9), box);
}

function testBoxTranslateCoordinate() {
  var box = new goog.math.Box(10, 30, 20, 5);
  var c = new goog.math.Coordinate(10, 5);
  assertEquals(
      'The function should return the target instance', box, box.translate(c));
  assertObjectEquals(new goog.math.Box(15, 40, 25, 15), box);
}

function testBoxTranslateXY() {
  var box = new goog.math.Box(10, 30, 20, 5);
  assertEquals(
      'The function should return the target instance', box,
      box.translate(5, 2));
  assertObjectEquals(new goog.math.Box(12, 35, 22, 10), box);
}

function testBoxTranslateX() {
  var box = new goog.math.Box(10, 30, 20, 5);
  assertEquals(
      'The function should return the target instance', box, box.translate(3));
  assertObjectEquals(new goog.math.Box(10, 33, 20, 8), box);
}

function testBoxScaleXY() {
  var box = new goog.math.Box(10, 20, 30, 5);
  assertEquals(
      'The function should return the target instance', box, box.scale(2, 3));
  assertObjectEquals(new goog.math.Box(30, 40, 90, 10), box);
}

function testBoxScaleFactor() {
  var box = new goog.math.Box(10, 20, 30, 5);
  assertEquals(
      'The function should return the target instance', box, box.scale(2));
  assertObjectEquals(new goog.math.Box(20, 40, 60, 10), box);
}
