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

goog.provide('goog.math.RangeTest');
goog.setTestOnly('goog.math.RangeTest');

goog.require('goog.math.Range');
goog.require('goog.testing.jsunit');


/**
 * Produce legible assertion results. If two ranges are not equal, the error
 * message will be of the form
 * "Expected <[1, 2]> (Object) but was <[3, 4]> (Object)"
 */
function assertRangesEqual(expected, actual) {
  if (!goog.math.Range.equals(expected, actual)) {
    assertEquals(expected, actual);
  }
}

function createRange(a) {
  return a ? new goog.math.Range(a[0], a[1]) : null;
}

function testFromPair() {
  var range = goog.math.Range.fromPair([1, 2]);
  assertEquals(1, range.start);
  assertEquals(2, range.end);
  range = goog.math.Range.fromPair([2, 1]);
  assertEquals(1, range.start);
  assertEquals(2, range.end);
}

function testRangeIntersection() {
  var tests = [
    [[1, 2], [3, 4], null], [[1, 3], [2, 4], [2, 3]], [[1, 4], [2, 3], [2, 3]],
    [[-1, 2], [-1, 2], [-1, 2]], [[1, 2], [2, 3], [2, 2]],
    [[1, 1], [1, 1], [1, 1]]
  ];
  for (var i = 0; i < tests.length; ++i) {
    var t = tests[i];
    var r0 = createRange(t[0]);
    var r1 = createRange(t[1]);
    var expected = createRange(t[2]);
    assertRangesEqual(expected, goog.math.Range.intersection(r0, r1));
    assertRangesEqual(expected, goog.math.Range.intersection(r1, r0));

    assertEquals(expected != null, goog.math.Range.hasIntersection(r0, r1));
    assertEquals(expected != null, goog.math.Range.hasIntersection(r1, r0));
  }
}

function testBoundingRange() {
  var tests = [
    [[1, 2], [3, 4], [1, 4]], [[1, 3], [2, 4], [1, 4]],
    [[1, 4], [2, 3], [1, 4]], [[-1, 2], [-1, 2], [-1, 2]],
    [[1, 2], [2, 3], [1, 3]], [[1, 1], [1, 1], [1, 1]]
  ];
  for (var i = 0; i < tests.length; ++i) {
    var t = tests[i];
    var r0 = createRange(t[0]);
    var r1 = createRange(t[1]);
    var expected = createRange(t[2]);
    assertRangesEqual(expected, goog.math.Range.boundingRange(r0, r1));
    assertRangesEqual(expected, goog.math.Range.boundingRange(r1, r0));
  }
}

function testRangeContains() {
  var tests = [
    [[0, 4], [2, 1], true], [[-4, -1], [-2, -3], true], [[1, 3], [2, 4], false],
    [[-1, 0], [0, 1], false], [[0, 2], [3, 5], false]
  ];
  for (var i = 0; i < tests.length; ++i) {
    var t = tests[i];
    var r0 = createRange(t[0]);
    var r1 = createRange(t[1]);
    var expected = t[2];
    assertEquals(expected, goog.math.Range.contains(r0, r1));
  }
}

function testRangeClone() {
  var r = new goog.math.Range(5.6, -3.4);
  assertRangesEqual(r, r.clone());
}

function testGetLength() {
  assertEquals(2, new goog.math.Range(1, 3).getLength());
  assertEquals(2, new goog.math.Range(3, 1).getLength());
}

function testRangeContainsPoint() {
  var r = new goog.math.Range(0, 1);
  assert(goog.math.Range.containsPoint(r, 0));
  assert(goog.math.Range.containsPoint(r, 1));
  assertFalse(goog.math.Range.containsPoint(r, -1));
  assertFalse(goog.math.Range.containsPoint(r, 2));
}

function testIncludePoint() {
  var r = new goog.math.Range(0, 2);
  r.includePoint(0);
  assertObjectEquals(new goog.math.Range(0, 2), r);
  r.includePoint(1);
  assertObjectEquals(new goog.math.Range(0, 2), r);
  r.includePoint(2);
  assertObjectEquals(new goog.math.Range(0, 2), r);
  r.includePoint(-1);
  assertObjectEquals(new goog.math.Range(-1, 2), r);
  r.includePoint(3);
  assertObjectEquals(new goog.math.Range(-1, 3), r);
}

function testIncludeRange() {
  var r = new goog.math.Range(0, 4);
  r.includeRange(r);
  assertObjectEquals(new goog.math.Range(0, 4), r);
  r.includeRange(new goog.math.Range(1, 3));
  assertObjectEquals(new goog.math.Range(0, 4), r);
  r.includeRange(new goog.math.Range(-1, 2));
  assertObjectEquals(new goog.math.Range(-1, 4), r);
  r.includeRange(new goog.math.Range(2, 5));
  assertObjectEquals(new goog.math.Range(-1, 5), r);
  r.includeRange(new goog.math.Range(-2, 6));
  assertObjectEquals(new goog.math.Range(-2, 6), r);
}
