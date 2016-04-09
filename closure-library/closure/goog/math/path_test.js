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

goog.provide('goog.math.PathTest');

goog.require('goog.array');
goog.require('goog.math.AffineTransform');
goog.require('goog.math.Path');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.math.PathTest');


/**
 * Array mapping numeric segment constant to a descriptive character.
 * @type {!Array<string>}
 * @private
 */
var SEGMENT_NAMES_ = function() {
  var arr = [];
  arr[goog.math.Path.Segment.MOVETO] = 'M';
  arr[goog.math.Path.Segment.LINETO] = 'L';
  arr[goog.math.Path.Segment.CURVETO] = 'C';
  arr[goog.math.Path.Segment.ARCTO] = 'A';
  arr[goog.math.Path.Segment.CLOSE] = 'X';
  return arr;
}();


/**
 * Test if the given path matches the expected array of commands and parameters.
 * @param {Array<string|number>} expected The expected array of commands and
 *     parameters.
 * @param {goog.math.Path} path The path to test against.
 */
var assertPathEquals = function(expected, path) {
  var actual = [];
  path.forEachSegment(function(seg, args) {
    actual.push(SEGMENT_NAMES_[seg]);
    Array.prototype.push.apply(actual, args);
  });
  assertEquals(expected.length, actual.length);
  for (var i = 0; i < expected.length; i++) {
    if (goog.isNumber(expected[i])) {
      assertTrue(goog.isNumber(actual[i]));
      assertRoughlyEquals(expected[i], actual[i], 0.01);
    } else {
      assertEquals(expected[i], actual[i]);
    }
  }
};


function testConstructor() {
  var path = new goog.math.Path();
  assertTrue(path.isSimple());
  assertNull(path.getCurrentPoint());
  assertPathEquals([], path);
}


function testGetSegmentCount() {
  assertArrayEquals(
      [2, 2, 6, 6, 0],
      goog.array.map(
          [
            goog.math.Path.Segment.MOVETO, goog.math.Path.Segment.LINETO,
            goog.math.Path.Segment.CURVETO, goog.math.Path.Segment.ARCTO,
            goog.math.Path.Segment.CLOSE
          ],
          goog.math.Path.getSegmentCount));
}


function testSimpleMoveTo() {
  var path = new goog.math.Path();
  path.moveTo(30, 50);
  assertTrue(path.isSimple());
  assertObjectEquals([30, 50], path.getCurrentPoint());
  assertPathEquals(['M', 30, 50], path);
}


function testRepeatedMoveTo() {
  var path = new goog.math.Path();
  path.moveTo(30, 50);
  path.moveTo(40, 60);
  assertTrue(path.isSimple());
  assertObjectEquals([40, 60], path.getCurrentPoint());
  assertPathEquals(['M', 40, 60], path);
}


function testSimpleLineTo_fromArgs() {
  var path = new goog.math.Path();
  var e = assertThrows(function() { path.lineTo(30, 50); });
  assertEquals('Path cannot start with lineTo', e.message);
  path.moveTo(0, 0);
  path.lineTo(30, 50);
  assertTrue(path.isSimple());
  assertObjectEquals([30, 50], path.getCurrentPoint());
  assertPathEquals(['M', 0, 0, 'L', 30, 50], path);
}


function testSimpleLineTo_fromArray() {
  var path = new goog.math.Path();
  var e = assertThrows(function() { path.lineToFromArray([30, 50]); });
  assertEquals('Path cannot start with lineTo', e.message);
  path.moveTo(0, 0);
  path.lineToFromArray([30, 50]);
  assertTrue(path.isSimple());
  assertObjectEquals([30, 50], path.getCurrentPoint());
  assertPathEquals(['M', 0, 0, 'L', 30, 50], path);
}


function testMultiArgLineTo_fromArgs() {
  var path = new goog.math.Path();
  path.moveTo(0, 0);
  path.lineTo(30, 50, 40, 60);
  assertTrue(path.isSimple());
  assertObjectEquals([40, 60], path.getCurrentPoint());
  assertPathEquals(['M', 0, 0, 'L', 30, 50, 40, 60], path);
}


function testMultiArgLineTo_fromArray() {
  var path = new goog.math.Path();
  path.moveTo(0, 0);
  path.lineToFromArray([30, 50, 40, 60]);
  assertTrue(path.isSimple());
  assertObjectEquals([40, 60], path.getCurrentPoint());
  assertPathEquals(['M', 0, 0, 'L', 30, 50, 40, 60], path);
}


function testRepeatedLineTo_fromArgs() {
  var path = new goog.math.Path();
  path.moveTo(0, 0);
  path.lineTo(30, 50);
  path.lineTo(40, 60);
  assertTrue(path.isSimple());
  assertObjectEquals([40, 60], path.getCurrentPoint());
  assertPathEquals(['M', 0, 0, 'L', 30, 50, 40, 60], path);
}


function testRepeatedLineTo_fromArray() {
  var path = new goog.math.Path();
  path.moveTo(0, 0);
  path.lineToFromArray([30, 50]);
  path.lineToFromArray([40, 60]);
  assertTrue(path.isSimple());
  assertObjectEquals([40, 60], path.getCurrentPoint());
  assertPathEquals(['M', 0, 0, 'L', 30, 50, 40, 60], path);
}


function testSimpleCurveTo_fromArgs() {
  var path = new goog.math.Path();
  var e = assertThrows(function() { path.curveTo(10, 20, 30, 40, 50, 60); });
  assertEquals('Path cannot start with curve', e.message);
  path.moveTo(0, 0);
  path.curveTo(10, 20, 30, 40, 50, 60);
  assertTrue(path.isSimple());
  assertObjectEquals([50, 60], path.getCurrentPoint());
  assertPathEquals(['M', 0, 0, 'C', 10, 20, 30, 40, 50, 60], path);
}


function testSimpleCurveTo_fromArray() {
  var path = new goog.math.Path();
  var e = assertThrows(function() {
    path.curveToFromArray([10, 20, 30, 40, 50, 60]);
  });
  assertEquals('Path cannot start with curve', e.message);
  path.moveTo(0, 0);
  path.curveToFromArray([10, 20, 30, 40, 50, 60]);
  assertTrue(path.isSimple());
  assertObjectEquals([50, 60], path.getCurrentPoint());
  assertPathEquals(['M', 0, 0, 'C', 10, 20, 30, 40, 50, 60], path);
}


function testMultiCurveTo_fromArgs() {
  var path = new goog.math.Path();
  path.moveTo(0, 0);
  path.curveTo(10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120);
  assertTrue(path.isSimple());
  assertObjectEquals([110, 120], path.getCurrentPoint());
  assertPathEquals(
      ['M', 0, 0, 'C', 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
      path);
}


function testMultiCurveTo_fromArray() {
  var path = new goog.math.Path();
  path.moveTo(0, 0);
  path.curveToFromArray([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]);
  assertTrue(path.isSimple());
  assertObjectEquals([110, 120], path.getCurrentPoint());
  assertPathEquals(
      ['M', 0, 0, 'C', 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
      path);
}


function testRepeatedCurveTo_fromArgs() {
  var path = new goog.math.Path();
  path.moveTo(0, 0);
  path.curveTo(10, 20, 30, 40, 50, 60);
  path.curveTo(70, 80, 90, 100, 110, 120);
  assertTrue(path.isSimple());
  assertObjectEquals([110, 120], path.getCurrentPoint());
  assertPathEquals(
      ['M', 0, 0, 'C', 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
      path);
}


function testRepeatedCurveTo_fromArray() {
  var path = new goog.math.Path();
  path.moveTo(0, 0);
  path.curveToFromArray([10, 20, 30, 40, 50, 60]);
  path.curveToFromArray([70, 80, 90, 100, 110, 120]);
  assertTrue(path.isSimple());
  assertObjectEquals([110, 120], path.getCurrentPoint());
  assertPathEquals(
      ['M', 0, 0, 'C', 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
      path);
}


function testSimpleArc() {
  var path = new goog.math.Path();
  path.arc(50, 60, 10, 20, 30, 30, false);
  assertFalse(path.isSimple());
  var p = path.getCurrentPoint();
  assertEquals(55, p[0]);
  assertRoughlyEquals(77.32, p[1], 0.01);
  assertPathEquals(['M', 58.66, 70, 'A', 10, 20, 30, 30, 55, 77.32], path);
}


function testArcNonConnectClose() {
  var path = new goog.math.Path();
  path.moveTo(0, 0);
  path.arc(10, 10, 10, 10, -90, 180, false);
  assertObjectEquals([10, 20], path.getCurrentPoint());
  path.close();
  assertObjectEquals([10, 0], path.getCurrentPoint());
}


function testRepeatedArc() {
  var path = new goog.math.Path();
  path.arc(50, 60, 10, 20, 30, 30, false);
  path.arc(50, 60, 10, 20, 60, 30, false);
  assertFalse(path.isSimple());
  assertObjectEquals([50, 80], path.getCurrentPoint());
  assertPathEquals(
      [
        'M', 58.66, 70,    'A', 10, 20, 30, 30, 55, 77.32,
        'M', 55,    77.32, 'A', 10, 20, 60, 30, 50, 80
      ],
      path);
}


function testRepeatedArc2() {
  var path = new goog.math.Path();
  path.arc(50, 60, 10, 20, 30, 30, false);
  path.arc(50, 60, 10, 20, 60, 30, true);
  assertPathEquals(
      [
        'M', 58.66, 70, 'A', 10, 20, 30, 30, 55, 77.32, 'A', 10, 20, 60, 30, 50,
        80
      ],
      path);
}


function testCompleteCircle() {
  var path = new goog.math.Path();
  path.arc(0, 0, 10, 10, 0, 360, false);
  assertFalse(path.isSimple());
  var p = path.getCurrentPoint();
  assertRoughlyEquals(10, p[0], 0.01);
  assertRoughlyEquals(0, p[1], 0.01);
  assertPathEquals(['M', 10, 0, 'A', 10, 10, 0, 360, 10, 0], path);
}


function testClose() {
  var path = new goog.math.Path();
  assertThrows('Path cannot start with close', function() { path.close(); });

  path.moveTo(0, 0);
  path.lineTo(10, 20, 30, 40, 50, 60);
  path.close();
  assertTrue(path.isSimple());
  assertObjectEquals([0, 0], path.getCurrentPoint());
  assertPathEquals(['M', 0, 0, 'L', 10, 20, 30, 40, 50, 60, 'X'], path);
}


function testClear() {
  var path = new goog.math.Path();
  path.moveTo(0, 0);
  path.arc(50, 60, 10, 20, 30, 30, false);
  path.clear();
  assertTrue(path.isSimple());
  assertNull(path.getCurrentPoint());
  assertPathEquals([], path);
}


function testCreateSimplifiedPath() {
  var path = new goog.math.Path();
  path.moveTo(0, 0);
  path.arc(50, 60, 10, 20, 30, 30, false);
  assertFalse(path.isSimple());
  path = goog.math.Path.createSimplifiedPath(path);
  assertTrue(path.isSimple());
  var p = path.getCurrentPoint();
  assertEquals(55, p[0]);
  assertRoughlyEquals(77.32, p[1], 0.01);
  assertPathEquals(
      ['M', 58.66, 70, 'C', 57.78, 73.04, 56.52, 75.57, 55, 77.32], path);
}


function testCreateSimplifiedPath2() {
  var path = new goog.math.Path();
  path.arc(50, 60, 10, 20, 30, 30, false);
  path.arc(50, 60, 10, 20, 60, 30, false);
  assertFalse(path.isSimple());
  path = goog.math.Path.createSimplifiedPath(path);
  assertTrue(path.isSimple());
  assertPathEquals(
      [
        'M', 58.66, 70,    'C', 57.78, 73.04, 56.52, 75.57, 55, 77.32,
        'M', 55,    77.32, 'C', 53.48, 79.08, 51.76, 80,    50, 80
      ],
      path);
}


function testCreateSimplifiedPath3() {
  var path = new goog.math.Path();
  path.arc(50, 60, 10, 20, 30, 30, false);
  path.arc(50, 60, 10, 20, 60, 30, true);
  path.close();
  path = goog.math.Path.createSimplifiedPath(path);
  assertPathEquals(
      [
        'M', 58.66, 70, 'C', 57.78, 73.04, 56.52, 75.57, 55, 77.32, 53.48,
        79.08, 51.76, 80, 50, 80, 'X'
      ],
      path);
  var p = path.getCurrentPoint();
  assertRoughlyEquals(58.66, p[0], 0.01);
  assertRoughlyEquals(70, p[1], 0.01);
}


function testArcToAsCurves() {
  var path = new goog.math.Path();
  path.moveTo(58.66, 70);
  path.arcToAsCurves(10, 20, 30, 30);
  assertPathEquals(
      ['M', 58.66, 70, 'C', 57.78, 73.04, 56.52, 75.57, 55, 77.32], path);
}


function testCreateTransformedPath() {
  var path = new goog.math.Path();
  path.moveTo(0, 0);
  path.lineTo(0, 10, 10, 10, 10, 0);
  path.close();
  var tx = new goog.math.AffineTransform(2, 0, 0, 3, 10, 20);
  var path2 = path.createTransformedPath(tx);
  assertPathEquals(['M', 0, 0, 'L', 0, 10, 10, 10, 10, 0, 'X'], path);
  assertPathEquals(['M', 10, 20, 'L', 10, 50, 30, 50, 30, 20, 'X'], path2);
}


function testTransform() {
  var path = new goog.math.Path();
  path.moveTo(0, 0);
  path.lineTo(0, 10, 10, 10, 10, 0);
  path.close();
  var tx = new goog.math.AffineTransform(2, 0, 0, 3, 10, 20);
  var path2 = path.transform(tx);
  assertTrue(path === path2);
  assertPathEquals(['M', 10, 20, 'L', 10, 50, 30, 50, 30, 20, 'X'], path2);
}


function testTransformCurrentAndClosePoints() {
  var path = new goog.math.Path();
  path.moveTo(0, 0);
  assertObjectEquals([0, 0], path.getCurrentPoint());
  path.transform(new goog.math.AffineTransform(1, 0, 0, 1, 10, 20));
  assertObjectEquals([10, 20], path.getCurrentPoint());
  path.lineTo(50, 50);
  path.close();
  assertObjectEquals([10, 20], path.getCurrentPoint());
}


function testTransformNonSimple() {
  var path = new goog.math.Path();
  path.arc(50, 60, 10, 20, 30, 30, false);
  assertThrows(function() {
    path.transform(new goog.math.AffineTransform(1, 0, 0, 1, 10, 20));
  });
}


function testAppendPath() {
  var path1 = new goog.math.Path();
  path1.moveTo(0, 0);
  path1.lineTo(0, 10, 10, 10, 10, 0);
  path1.close();

  var path2 = new goog.math.Path();
  path2.arc(50, 60, 10, 20, 30, 30, false);

  assertTrue(path1.isSimple());
  path1.appendPath(path2);
  assertFalse(path1.isSimple());
  assertPathEquals(
      [
        'M', 0,     0,  'L', 0,  10, 10, 10, 10, 0,    'X',
        'M', 58.66, 70, 'A', 10, 20, 30, 30, 55, 77.32
      ],
      path1);
}


function testIsEmpty() {
  var path = new goog.math.Path();
  assertTrue('Initially path is empty', path.isEmpty());

  path.moveTo(0, 0);
  assertFalse('After command addition, path is not empty', path.isEmpty());

  path.clear();
  assertTrue('After clear, path is empty again', path.isEmpty());
}


function testGetSegmentTypes() {
  var path = new goog.math.Path();
  path.moveTo(0, 0);
  path.lineTo(10, 20, 30, 40);
  path.close();

  var Segment = goog.math.Path.Segment;
  var segmentTypes = path.getSegmentTypes();
  assertArrayEquals(
      'The returned segment types do not match the expected values',
      [Segment.MOVETO, Segment.LINETO, Segment.CLOSE], segmentTypes);

  segmentTypes[2] = Segment.LINETO;
  assertArrayEquals(
      'Modifying the returned segment types changed the path',
      [Segment.MOVETO, Segment.LINETO, Segment.CLOSE], path.getSegmentTypes());
}


function testGetSegmentCounts() {
  var path = new goog.math.Path();
  path.moveTo(0, 0);
  path.lineTo(10, 20, 30, 40);
  path.close();

  var segmentTypes = path.getSegmentCounts();
  assertArrayEquals(
      'The returned segment counts do not match the expected values', [1, 2, 1],
      segmentTypes);

  segmentTypes[1] = 3;
  assertArrayEquals(
      'Modifying the returned segment counts changed the path', [1, 2, 1],
      path.getSegmentCounts());
}


function testGetSegmentArgs() {
  var path = new goog.math.Path();
  path.moveTo(0, 0);
  path.lineTo(10, 20, 30, 40);
  path.close();

  var segmentTypes = path.getSegmentArgs();
  assertArrayEquals(
      'The returned segment args do not match the expected values',
      [0, 0, 10, 20, 30, 40], segmentTypes);

  segmentTypes[1] = -10;
  assertArrayEquals(
      'Modifying the returned segment args changed the path',
      [0, 0, 10, 20, 30, 40], path.getSegmentArgs());
}
