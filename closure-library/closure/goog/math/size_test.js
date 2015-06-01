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

goog.provide('goog.math.SizeTest');
goog.setTestOnly('goog.math.SizeTest');

goog.require('goog.math.Size');
goog.require('goog.testing.jsunit');

function testSize1() {
  var s = new goog.math.Size(undefined, undefined);
  assertUndefined(s.width);
  assertUndefined(s.height);
  assertEquals('(undefined x undefined)', s.toString());
}

function testSize3() {
  var s = new goog.math.Size(10, 20);
  assertEquals(10, s.width);
  assertEquals(20, s.height);
  assertEquals('(10 x 20)', s.toString());
}

function testSize4() {
  var s = new goog.math.Size(10.5, 20.897);
  assertEquals(10.5, s.width);
  assertEquals(20.897, s.height);
  assertEquals('(10.5 x 20.897)', s.toString());
}

function testSizeClone() {
  var s = new goog.math.Size(undefined, undefined);
  assertEquals(s.toString(), s.clone().toString());
  s.width = 4;
  s.height = 5;
  assertEquals(s.toString(), s.clone().toString());
}

function testSizeEquals() {
  var a = new goog.math.Size(4, 5);

  assertTrue(goog.math.Size.equals(a, a));
  assertFalse(goog.math.Size.equals(a, null));
  assertFalse(goog.math.Size.equals(null, a));

  var b = new goog.math.Size(4, 5);
  var c = new goog.math.Size(4, 6);
  assertTrue(goog.math.Size.equals(a, b));
  assertFalse(goog.math.Size.equals(a, c));
}

function testSizeArea() {
  var s = new goog.math.Size(4, 5);
  assertEquals(20, s.area());
}

function testSizePerimeter() {
  var s = new goog.math.Size(4, 5);
  assertEquals(18, s.perimeter());
}

function testSizeAspectRatio() {
  var s = new goog.math.Size(undefined, undefined);
  assertNaN(s.aspectRatio());

  s.width = 4;
  s.height = 0;
  assertEquals(Infinity, s.aspectRatio());

  s.height = 5;
  assertEquals(0.8, s.aspectRatio());
}

function testSizeFitsInside() {
  var target = new goog.math.Size(10, 10);

  var a = new goog.math.Size(5, 8);
  var b = new goog.math.Size(5, 12);
  var c = new goog.math.Size(19, 7);


  assertTrue(a.fitsInside(target));
  assertFalse(b.fitsInside(target));
  assertFalse(c.fitsInside(target));
}

function testSizeScaleToCover() {
  var target = new goog.math.Size(512, 640);

  var a = new goog.math.Size(1000, 1600);
  var b = new goog.math.Size(1600, 1000);
  var c = new goog.math.Size(500, 800);
  var d = new goog.math.Size(undefined, undefined);

  assertEquals('(512 x 819.2)', a.scaleToCover(target).toString());
  assertEquals('(1024 x 640)', b.scaleToCover(target).toString());
  assertEquals('(512 x 819.2)', c.scaleToCover(target).toString());
  assertEquals('(512 x 640)', target.scaleToCover(target).toString());

  assertEquals('(NaN x NaN)', d.scaleToCover(target).toString());
  assertEquals('(NaN x NaN)', a.scaleToCover(d).toString());
}

function testSizeScaleToFit() {
  var target = new goog.math.Size(512, 640);

  var a = new goog.math.Size(1600, 1200);
  var b = new goog.math.Size(1200, 1600);
  var c = new goog.math.Size(400, 300);
  var d = new goog.math.Size(undefined, undefined);

  assertEquals('(512 x 384)', a.scaleToFit(target).toString());
  assertEquals('(480 x 640)', b.scaleToFit(target).toString());
  assertEquals('(512 x 384)', c.scaleToFit(target).toString());
  assertEquals('(512 x 640)', target.scaleToFit(target).toString());

  assertEquals('(NaN x NaN)', d.scaleToFit(target).toString());
  assertEquals('(NaN x NaN)', a.scaleToFit(d).toString());
}

function testSizeIsEmpty() {
  var s = new goog.math.Size(undefined, undefined);
  assertTrue(s.isEmpty());
  s.width = 0;
  s.height = 5;
  assertTrue(s.isEmpty());
  s.width = 4;
  assertFalse(s.isEmpty());
}

function testSizeScaleFactor() {
  var s = new goog.math.Size(4, 5);
  assertEquals('(8 x 10)', s.scale(2).toString());
  assertEquals('(0.8 x 1)', s.scale(0.1).toString());
}

function testSizeCeil() {
  var s = new goog.math.Size(2.3, 4.7);
  assertEquals('(3 x 5)', s.ceil().toString());
}

function testSizeFloor() {
  var s = new goog.math.Size(2.3, 4.7);
  assertEquals('(2 x 4)', s.floor().toString());
}

function testSizeRound() {
  var s = new goog.math.Size(2.3, 4.7);
  assertEquals('(2 x 5)', s.round().toString());
}

function testSizeGetLongest() {
  var s = new goog.math.Size(3, 4);
  assertEquals(4, s.getLongest());

  s.height = 3;
  assertEquals(3, s.getLongest());

  s.height = 2;
  assertEquals(3, s.getLongest());

  assertNaN(new goog.math.Size(undefined, undefined).getLongest());
}

function testSizeGetShortest() {
  var s = new goog.math.Size(3, 4);
  assertEquals(3, s.getShortest());

  s.height = 3;
  assertEquals(3, s.getShortest());

  s.height = 2;
  assertEquals(2, s.getShortest());

  assertNaN(new goog.math.Size(undefined, undefined).getShortest());
}

function testSizeScaleXY() {
  var s = new goog.math.Size(5, 10);
  assertEquals('(20 x 30)', s.scale(4, 3).toString());
}
