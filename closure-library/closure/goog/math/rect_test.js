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

goog.provide('goog.math.RectTest');
goog.setTestOnly('goog.math.RectTest');

goog.require('goog.math.Box');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Rect');
goog.require('goog.math.Size');
goog.require('goog.testing.jsunit');


/**
 * Produce legible assertion results. If two rects are not equal, the error
 * message will be of the form
 * "Expected <(1, 2 - 10 x 10)> (Object) but was <(3, 4 - 20 x 20)> (Object)"
 */
function assertRectsEqual(expected, actual) {
  if (!goog.math.Rect.equals(expected, actual)) {
    assertEquals(expected, actual);
  }
}

function createRect(a) {
  return a ? new goog.math.Rect(a[0], a[1], a[2] - a[0], a[3] - a[1]) : null;
}

function testRectClone() {
  var r = new goog.math.Rect(0, 0, 0, 0);
  assertRectsEqual(r, r.clone());
  r.left = -10;
  r.top = -20;
  r.width = 10;
  r.height = 20;
  assertRectsEqual(r, r.clone());
}

function testRectIntersection() {
  var tests = [[[10, 10, 20, 20], [15, 15, 25, 25], [15, 15, 20, 20]],
               [[10, 10, 20, 20], [20, 0, 30, 10], [20, 10, 20, 10]],
               [[0, 0, 1, 1], [10, 11, 12, 13], null],
               [[11, 12, 98, 99], [22, 23, 34, 35], [22, 23, 34, 35]]];
  for (var i = 0; i < tests.length; ++i) {
    var t = tests[i];
    var r0 = createRect(t[0]);
    var r1 = createRect(t[1]);

    var expected = createRect(t[2]);

    assertRectsEqual(expected, goog.math.Rect.intersection(r0, r1));
    assertRectsEqual(expected, goog.math.Rect.intersection(r1, r0));

    // Test in place methods.
    var clone = r0.clone();

    assertRectsEqual(expected, clone.intersection(r1) ? clone : null);
    assertRectsEqual(expected, r1.intersection(r0) ? r1 : null);
  }
}

function testRectIntersects() {
  var r0 = createRect([10, 10, 20, 20]);
  var r1 = createRect([15, 15, 25, 25]);
  var r2 = createRect([0, 0, 1, 1]);

  assertTrue(goog.math.Rect.intersects(r0, r1));
  assertTrue(goog.math.Rect.intersects(r1, r0));
  assertTrue(r0.intersects(r1));
  assertTrue(r1.intersects(r0));

  assertFalse(goog.math.Rect.intersects(r0, r2));
  assertFalse(goog.math.Rect.intersects(r2, r0));
  assertFalse(r0.intersects(r2));
  assertFalse(r2.intersects(r0));
}

function testRectBoundingRect() {
  var tests = [[[10, 10, 20, 20], [15, 15, 25, 25], [10, 10, 25, 25]],
               [[10, 10, 20, 20], [20, 0, 30, 10], [10, 0, 30, 20]],
               [[0, 0, 1, 1], [10, 11, 12, 13], [0, 0, 12, 13]],
               [[11, 12, 98, 99], [22, 23, 34, 35], [11, 12, 98, 99]]];
  for (var i = 0; i < tests.length; ++i) {
    var t = tests[i];
    var r0 = createRect(t[0]);
    var r1 = createRect(t[1]);
    var expected = createRect(t[2]);
    assertRectsEqual(expected, goog.math.Rect.boundingRect(r0, r1));
    assertRectsEqual(expected, goog.math.Rect.boundingRect(r1, r0));

    // Test in place methods.
    var clone = r0.clone();

    clone.boundingRect(r1);
    assertRectsEqual(expected, clone);

    r1.boundingRect(r0);
    assertRectsEqual(expected, r1);
  }
}

function testRectDifference() {
  // B is the same as A.
  assertDifference([10, 10, 20, 20], [10, 10, 20, 20], []);
  // B does not touch A.
  assertDifference([10, 10, 20, 20], [0, 0, 5, 5], [[10, 10, 20, 20]]);
  // B overlaps top half of A.
  assertDifference([10, 10, 20, 20], [5, 15, 25, 25],
      [[10, 10, 20, 15]]);
  // B overlaps bottom half of A.
  assertDifference([10, 10, 20, 20], [5, 5, 25, 15],
      [[10, 15, 20, 20]]);
  // B overlaps right half of A.
  assertDifference([10, 10, 20, 20], [15, 5, 25, 25],
      [[10, 10, 15, 20]]);
  // B overlaps left half of A.
  assertDifference([10, 10, 20, 20], [5, 5, 15, 25],
      [[15, 10, 20, 20]]);
  // B touches A at its bottom right corner
  assertDifference([10, 10, 20, 20], [20, 20, 30, 30],
      [[10, 10, 20, 20]]);
  // B touches A at its top left corner
  assertDifference([10, 10, 20, 20], [5, 5, 10, 10],
      [[10, 10, 20, 20]]);
  // B touches A along its bottom edge
  assertDifference([10, 10, 20, 20], [12, 20, 17, 25],
      [[10, 10, 20, 20]]);
  // B splits A horizontally.
  assertDifference([10, 10, 20, 20], [5, 12, 25, 18],
      [[10, 10, 20, 12], [10, 18, 20, 20]]);
  // B splits A vertically.
  assertDifference([10, 10, 20, 20], [12, 5, 18, 25],
      [[10, 10, 12, 20], [18, 10, 20, 20]]);
  // B subtracts a notch from the top of A.
  assertDifference([10, 10, 20, 20], [12, 5, 18, 15],
      [[10, 15, 20, 20], [10, 10, 12, 15], [18, 10, 20, 15]]);
  // B subtracts a notch from the bottom left of A
  assertDifference([1, 6, 3, 9], [1, 7, 2, 9],
      [[1, 6, 3, 7], [2, 7, 3, 9]]);
  // B subtracts a notch from the bottom right of A
  assertDifference([1, 6, 3, 9], [2, 7, 3, 9],
      [[1, 6, 3, 7], [1, 7, 2, 9]]);
  // B subtracts a notch from the top left of A
  assertDifference([1, 6, 3, 9], [1, 6, 2, 8],
      [[1, 8, 3, 9], [2, 6, 3, 8]]);
  // B subtracts a notch from the top left of A (no coinciding edge)
  assertDifference([1, 6, 3, 9], [0, 5, 2, 8],
      [[1, 8, 3, 9], [2, 6, 3, 8]]);
  // B subtracts a hole from the center of A.
  assertDifference([-20, -20, -10, -10], [-18, -18, -12, -12],
      [[-20, -20, -10, -18], [-20, -12, -10, -10],
       [-20, -18, -18, -12], [-12, -18, -10, -12]]);
}

function assertDifference(a, b, expected) {
  var r0 = createRect(a);
  var r1 = createRect(b);
  var diff = goog.math.Rect.difference(r0, r1);

  assertEquals('Wrong number of rectangles in difference ',
      expected.length, diff.length);

  for (var j = 0; j < expected.length; ++j) {
    var e = createRect(expected[j]);
    if (!goog.math.Rect.equals(e, diff[j])) {
      alert(j + ': ' + e + ' != ' + diff[j]);
    }
    assertRectsEqual(e, diff[j]);
  }

  // Test in place version
  var diff = r0.difference(r1);

  assertEquals('Wrong number of rectangles in in-place difference ',
      expected.length, diff.length);

  for (var j = 0; j < expected.length; ++j) {
    var e = createRect(expected[j]);
    if (!goog.math.Rect.equals(e, diff[j])) {
      alert(j + ': ' + e + ' != ' + diff[j]);
    }
    assertRectsEqual(e, diff[j]);
  }
}

function testRectToBox() {
  var r = new goog.math.Rect(0, 0, 0, 0);
  assertObjectEquals(new goog.math.Box(0, 0, 0, 0), r.toBox());

  r.top = 10;
  r.left = 10;
  r.width = 20;
  r.height = 20;
  assertObjectEquals(new goog.math.Box(10, 30, 30, 10), r.toBox());

  r.top = -10;
  r.left = 0;
  r.width = 10;
  r.height = 10;
  assertObjectEquals(new goog.math.Box(-10, 10, 0, 0), r.toBox());
}

function testBoxToRect() {
  var box = new goog.math.Box(0, 0, 0, 0);
  assertObjectEquals(new goog.math.Rect(0, 0, 0, 0),
                     goog.math.Rect.createFromBox(box));

  box.top = 10;
  box.left = 15;
  box.right = 23;
  box.bottom = 27;
  assertObjectEquals(new goog.math.Rect(15, 10, 8, 17),
                     goog.math.Rect.createFromBox(box));

  box.top = -10;
  box.left = 3;
  box.right = 12;
  box.bottom = 7;
  assertObjectEquals(new goog.math.Rect(3, -10, 9, 17),
                     goog.math.Rect.createFromBox(box));
}

function testBoxToRectAndBack() {
  rectToBoxAndBackTest(new goog.math.Rect(8, 11, 20, 23));
  rectToBoxAndBackTest(new goog.math.Rect(9, 13, NaN, NaN));
  rectToBoxAndBackTest(new goog.math.Rect(10, 13, NaN, 21));
  rectToBoxAndBackTest(new goog.math.Rect(5, 7, 14, NaN));
}

function rectToBoxAndBackTest(rect) {
  var box = rect.toBox();
  var rect2 = goog.math.Rect.createFromBox(box);

  // Use toString for this test since otherwise NaN != NaN.
  assertObjectEquals(rect.toString(), rect2.toString());
}

function testRectToBoxAndBack() {
  // This doesn't work if left or top is undefined.
  boxToRectAndBackTest(new goog.math.Box(11, 13, 20, 17));
  boxToRectAndBackTest(new goog.math.Box(10, NaN, NaN, 11));
  boxToRectAndBackTest(new goog.math.Box(9, 14, NaN, 11));
  boxToRectAndBackTest(new goog.math.Box(10, NaN, 22, 15));
}

function boxToRectAndBackTest(box) {
  var rect = goog.math.Rect.createFromBox(box);
  var box2 = rect.toBox();

  // Use toString for this test since otherwise NaN != NaN.
  assertEquals(box.toString(), box2.toString());
}

function testRectContainsRect() {
  var r = new goog.math.Rect(-10, 0, 20, 10);
  assertTrue(r.contains(r));
  assertFalse(r.contains(new goog.math.Rect(NaN, NaN, NaN, NaN)));
  var r2 = new goog.math.Rect(0, 2, 5, 5);
  assertTrue(r.contains(r2));
  assertFalse(r2.contains(r));
  r2.left = -11;
  assertFalse(r.contains(r2));
  r2.left = 0;
  r2.width = 15;
  assertFalse(r.contains(r2));
  r2.width = 5;
  r2.height = 10;
  assertFalse(r.contains(r2));
  r2.top = 0;
  assertTrue(r.contains(r2));
}

function testRectContainsCoordinate() {
  var r = new goog.math.Rect(20, 40, 60, 80);

  // Test middle.
  assertTrue(r.contains(new goog.math.Coordinate(50, 80)));

  // Test edges.
  assertTrue(r.contains(new goog.math.Coordinate(20, 40)));
  assertTrue(r.contains(new goog.math.Coordinate(50, 40)));
  assertTrue(r.contains(new goog.math.Coordinate(80, 40)));
  assertTrue(r.contains(new goog.math.Coordinate(80, 80)));
  assertTrue(r.contains(new goog.math.Coordinate(80, 120)));
  assertTrue(r.contains(new goog.math.Coordinate(50, 120)));
  assertTrue(r.contains(new goog.math.Coordinate(20, 120)));
  assertTrue(r.contains(new goog.math.Coordinate(20, 80)));

  // Test outside.
  assertFalse(r.contains(new goog.math.Coordinate(0, 0)));
  assertFalse(r.contains(new goog.math.Coordinate(50, 0)));
  assertFalse(r.contains(new goog.math.Coordinate(100, 0)));
  assertFalse(r.contains(new goog.math.Coordinate(100, 80)));
  assertFalse(r.contains(new goog.math.Coordinate(100, 160)));
  assertFalse(r.contains(new goog.math.Coordinate(50, 160)));
  assertFalse(r.contains(new goog.math.Coordinate(0, 160)));
  assertFalse(r.contains(new goog.math.Coordinate(0, 80)));
}

function testGetSize() {
  assertObjectEquals(new goog.math.Size(60, 80),
                     new goog.math.Rect(20, 40, 60, 80).getSize());
}

function testGetBottomRight() {
  assertObjectEquals(new goog.math.Coordinate(40, 60),
                     new goog.math.Rect(10, 20, 30, 40).getBottomRight());
}

function testGetCenter() {
  assertObjectEquals(new goog.math.Coordinate(25, 40),
                     new goog.math.Rect(10, 20, 30, 40).getCenter());
}

function testGetTopLeft() {
  assertObjectEquals(new goog.math.Coordinate(10, 20),
                     new goog.math.Rect(10, 20, 30, 40).getTopLeft());
}

function testRectCeil() {
  var rect = new goog.math.Rect(11.4, 26.6, 17.8, 9.2);
  assertEquals('The function should return the target instance',
      rect, rect.ceil());
  assertRectsEqual(new goog.math.Rect(12, 27, 18, 10), rect);
}

function testRectFloor() {
  var rect = new goog.math.Rect(11.4, 26.6, 17.8, 9.2);
  assertEquals('The function should return the target instance',
      rect, rect.floor());
  assertRectsEqual(new goog.math.Rect(11, 26, 17, 9), rect);
}

function testRectRound() {
  var rect = new goog.math.Rect(11.4, 26.6, 17.8, 9.2);
  assertEquals('The function should return the target instance',
      rect, rect.round());
  assertRectsEqual(new goog.math.Rect(11, 27, 18, 9), rect);
}

function testRectTranslateCoordinate() {
  var rect = new goog.math.Rect(10, 40, 30, 20);
  var c = new goog.math.Coordinate(10, 5);
  assertEquals('The function should return the target instance',
      rect, rect.translate(c));
  assertRectsEqual(new goog.math.Rect(20, 45, 30, 20), rect);
}

function testRectTranslateXY() {
  var rect = new goog.math.Rect(10, 20, 40, 35);
  assertEquals('The function should return the target instance',
      rect, rect.translate(15, 10));
  assertRectsEqual(new goog.math.Rect(25, 30, 40, 35), rect);
}

function testRectTranslateX() {
  var rect = new goog.math.Rect(12, 34, 113, 88);
  assertEquals('The function should return the target instance',
      rect, rect.translate(10));
  assertRectsEqual(new goog.math.Rect(22, 34, 113, 88), rect);
}

function testRectScaleXY() {
  var rect = new goog.math.Rect(10, 30, 100, 60);
  assertEquals('The function should return the target instance',
      rect, rect.scale(2, 5));
  assertRectsEqual(new goog.math.Rect(20, 150, 200, 300), rect);
}

function testRectScaleFactor() {
  var rect = new goog.math.Rect(12, 34, 113, 88);
  assertEquals('The function should return the target instance',
      rect, rect.scale(10));
  assertRectsEqual(new goog.math.Rect(120, 340, 1130, 880), rect);
}

function testSquaredDistance() {
  var rect = new goog.math.Rect(-10, -20, 15, 25);

  // Test regions:
  // 1  2  3
  //   +-+
  // 4 |5| 6
  //   +-+
  // 7  8  9

  // Region 5 (inside the rectangle).
  assertEquals(0, rect.squaredDistance(new goog.math.Coordinate(-10, 5)));
  assertEquals(0, rect.squaredDistance(new goog.math.Coordinate(5, -20)));

  // 1, 2, and 3.
  assertEquals(25, rect.squaredDistance(new goog.math.Coordinate(9, 8)));
  assertEquals(36, rect.squaredDistance(new goog.math.Coordinate(2, 11)));
  assertEquals(53, rect.squaredDistance(new goog.math.Coordinate(12, 7)));

  // 4 and 6.
  assertEquals(81, rect.squaredDistance(new goog.math.Coordinate(-19, -10)));
  assertEquals(64, rect.squaredDistance(new goog.math.Coordinate(13, 0)));

  // 7, 8, and 9.
  assertEquals(20, rect.squaredDistance(new goog.math.Coordinate(-12, -24)));
  assertEquals(9, rect.squaredDistance(new goog.math.Coordinate(0, -23)));
  assertEquals(34, rect.squaredDistance(new goog.math.Coordinate(8, -25)));
}


function testDistance() {
  var rect = new goog.math.Rect(2, 4, 8, 16);

  // Region 5 (inside the rectangle).
  assertEquals(0, rect.distance(new goog.math.Coordinate(2, 4)));
  assertEquals(0, rect.distance(new goog.math.Coordinate(10, 20)));

  // 1, 2, and 3.
  assertRoughlyEquals(
      Math.sqrt(8), rect.distance(new goog.math.Coordinate(0, 22)), .0001);
  assertEquals(8, rect.distance(new goog.math.Coordinate(9, 28)));
  assertRoughlyEquals(
      Math.sqrt(50), rect.distance(new goog.math.Coordinate(15, 25)), .0001);

  // 4 and 6.
  assertEquals(7, rect.distance(new goog.math.Coordinate(-5, 6)));
  assertEquals(10, rect.distance(new goog.math.Coordinate(20, 10)));

  // 7, 8, and 9.
  assertEquals(5, rect.distance(new goog.math.Coordinate(-2, 1)));
  assertEquals(2, rect.distance(new goog.math.Coordinate(5, 2)));
  assertRoughlyEquals(
      Math.sqrt(10), rect.distance(new goog.math.Coordinate(1, 1)), .0001);
}
