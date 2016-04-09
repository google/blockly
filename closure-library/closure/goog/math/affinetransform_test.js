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

goog.provide('goog.math.AffineTransformTest');

goog.require('goog.array');
goog.require('goog.math');
goog.require('goog.math.AffineTransform');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.math.AffineTransformTest');

function testGetTranslateInstance() {
  var tx = goog.math.AffineTransform.getTranslateInstance(2, 4);
  assertEquals(1, tx.getScaleX());
  assertEquals(0, tx.getShearY());
  assertEquals(0, tx.getShearX());
  assertEquals(1, tx.getScaleY());
  assertEquals(2, tx.getTranslateX());
  assertEquals(4, tx.getTranslateY());
}

function testGetScaleInstance() {
  var tx = goog.math.AffineTransform.getScaleInstance(2, 4);
  assertEquals(2, tx.getScaleX());
  assertEquals(0, tx.getShearY());
  assertEquals(0, tx.getShearX());
  assertEquals(4, tx.getScaleY());
  assertEquals(0, tx.getTranslateX());
  assertEquals(0, tx.getTranslateY());
}

function testGetRotateInstance() {
  var tx = goog.math.AffineTransform.getRotateInstance(Math.PI / 2, 1, 2);
  assertRoughlyEquals(0, tx.getScaleX(), 1e-9);
  assertRoughlyEquals(1, tx.getShearY(), 1e-9);
  assertRoughlyEquals(-1, tx.getShearX(), 1e-9);
  assertRoughlyEquals(0, tx.getScaleY(), 1e-9);
  assertRoughlyEquals(3, tx.getTranslateX(), 1e-9);
  assertRoughlyEquals(1, tx.getTranslateY(), 1e-9);
}

function testGetShearInstance() {
  var tx = goog.math.AffineTransform.getShearInstance(2, 4);
  assertEquals(1, tx.getScaleX());
  assertEquals(4, tx.getShearY());
  assertEquals(2, tx.getShearX());
  assertEquals(1, tx.getScaleY());
  assertEquals(0, tx.getTranslateX());
  assertEquals(0, tx.getTranslateY());
}

function testConstructor() {
  assertThrows(function() { new goog.math.AffineTransform([0, 0]); });
  assertThrows(function() { new goog.math.AffineTransform({}); });
  assertThrows(function() {
    new goog.math.AffineTransform(0, 0, 0, 'a', 0, 0);
  });

  var tx = new goog.math.AffineTransform(1, 2, 3, 4, 5, 6);
  assertEquals(1, tx.getScaleX());
  assertEquals(2, tx.getShearY());
  assertEquals(3, tx.getShearX());
  assertEquals(4, tx.getScaleY());
  assertEquals(5, tx.getTranslateX());
  assertEquals(6, tx.getTranslateY());

  tx = new goog.math.AffineTransform();
  assert(tx.isIdentity());
}

function testIsIdentity() {
  var tx = new goog.math.AffineTransform(1, 2, 3, 4, 5, 6);
  assertFalse(tx.isIdentity());
  tx.setTransform(1, 0, 0, 1, 0, 0);
  assert(tx.isIdentity());
}

function testClone() {
  var tx = new goog.math.AffineTransform(1, 2, 3, 4, 5, 6);
  var copy = tx.clone();
  assertEquals(copy.getScaleX(), tx.getScaleX());
  assertEquals(copy.getShearY(), tx.getShearY());
  assertEquals(copy.getShearX(), tx.getShearX());
  assertEquals(copy.getScaleY(), tx.getScaleY());
  assertEquals(copy.getTranslateX(), tx.getTranslateX());
  assertEquals(copy.getTranslateY(), tx.getTranslateY());
}

function testSetTransform() {
  var tx = new goog.math.AffineTransform();
  assertThrows(function() { tx.setTransform(1, 2, 3, 4, 6); });
  assertThrows(function() { tx.setTransform('a', 2, 3, 4, 5, 6); });

  tx.setTransform(1, 2, 3, 4, 5, 6);
  assertEquals(1, tx.getScaleX());
  assertEquals(2, tx.getShearY());
  assertEquals(3, tx.getShearX());
  assertEquals(4, tx.getScaleY());
  assertEquals(5, tx.getTranslateX());
  assertEquals(6, tx.getTranslateY());
}

function testScale() {
  var tx = new goog.math.AffineTransform(1, 2, 3, 4, 5, 6);
  tx.scale(2, 3);
  assertEquals(2, tx.getScaleX());
  assertEquals(4, tx.getShearY());
  assertEquals(9, tx.getShearX());
  assertEquals(12, tx.getScaleY());
  assertEquals(5, tx.getTranslateX());
  assertEquals(6, tx.getTranslateY());
}

function testPreScale() {
  var tx = new goog.math.AffineTransform(1, 2, 3, 4, 5, 6);
  tx.preScale(2, 3);
  assertEquals(2, tx.getScaleX());
  assertEquals(6, tx.getShearY());
  assertEquals(6, tx.getShearX());
  assertEquals(12, tx.getScaleY());
  assertEquals(10, tx.getTranslateX());
  assertEquals(18, tx.getTranslateY());
}

function testTranslate() {
  var tx = new goog.math.AffineTransform(1, 2, 3, 4, 5, 6);
  tx.translate(2, 3);
  assertEquals(1, tx.getScaleX());
  assertEquals(2, tx.getShearY());
  assertEquals(3, tx.getShearX());
  assertEquals(4, tx.getScaleY());
  assertEquals(16, tx.getTranslateX());
  assertEquals(22, tx.getTranslateY());
}

function testPreTranslate() {
  var tx = new goog.math.AffineTransform(1, 2, 3, 4, 5, 6);
  tx.preTranslate(2, 3);
  assertEquals(1, tx.getScaleX());
  assertEquals(2, tx.getShearY());
  assertEquals(3, tx.getShearX());
  assertEquals(4, tx.getScaleY());
  assertEquals(7, tx.getTranslateX());
  assertEquals(9, tx.getTranslateY());
}

function testRotate() {
  var tx = new goog.math.AffineTransform(1, 2, 3, 4, 5, 6);
  tx.rotate(Math.PI / 2, 1, 1);
  assertRoughlyEquals(3, tx.getScaleX(), 1e-9);
  assertRoughlyEquals(4, tx.getShearY(), 1e-9);
  assertRoughlyEquals(-1, tx.getShearX(), 1e-9);
  assertRoughlyEquals(-2, tx.getScaleY(), 1e-9);
  assertRoughlyEquals(7, tx.getTranslateX(), 1e-9);
  assertRoughlyEquals(10, tx.getTranslateY(), 1e-9);
}

function testPreRotate() {
  var tx = new goog.math.AffineTransform(1, 2, 3, 4, 5, 6);
  tx.preRotate(Math.PI / 2, 1, 1);
  assertRoughlyEquals(-2, tx.getScaleX(), 1e-9);
  assertRoughlyEquals(1, tx.getShearY(), 1e-9);
  assertRoughlyEquals(-4, tx.getShearX(), 1e-9);
  assertRoughlyEquals(3, tx.getScaleY(), 1e-9);
  assertRoughlyEquals(-4, tx.getTranslateX(), 1e-9);
  assertRoughlyEquals(5, tx.getTranslateY(), 1e-9);
}

function testShear() {
  var tx = new goog.math.AffineTransform(1, 2, 3, 4, 5, 6);
  tx.shear(2, 3);
  assertEquals(10, tx.getScaleX());
  assertEquals(14, tx.getShearY());
  assertEquals(5, tx.getShearX());
  assertEquals(8, tx.getScaleY());
  assertEquals(5, tx.getTranslateX());
  assertEquals(6, tx.getTranslateY());
}

function testPreShear() {
  var tx = new goog.math.AffineTransform(1, 2, 3, 4, 5, 6);
  tx.preShear(2, 3);
  assertEquals(5, tx.getScaleX());
  assertEquals(5, tx.getShearY());
  assertEquals(11, tx.getShearX());
  assertEquals(13, tx.getScaleY());
  assertEquals(17, tx.getTranslateX());
  assertEquals(21, tx.getTranslateY());
}

function testConcatentate() {
  var tx = new goog.math.AffineTransform(1, 2, 3, 4, 5, 6);
  tx.concatenate(new goog.math.AffineTransform(2, 1, 6, 5, 4, 3));
  assertEquals(5, tx.getScaleX());
  assertEquals(8, tx.getShearY());
  assertEquals(21, tx.getShearX());
  assertEquals(32, tx.getScaleY());
  assertEquals(18, tx.getTranslateX());
  assertEquals(26, tx.getTranslateY());
}

function testPreConcatentate() {
  var tx = new goog.math.AffineTransform(1, 2, 3, 4, 5, 6);
  tx.preConcatenate(new goog.math.AffineTransform(2, 1, 6, 5, 4, 3));
  assertEquals(14, tx.getScaleX());
  assertEquals(11, tx.getShearY());
  assertEquals(30, tx.getShearX());
  assertEquals(23, tx.getScaleY());
  assertEquals(50, tx.getTranslateX());
  assertEquals(38, tx.getTranslateY());
}

function testAssociativeConcatenate() {
  var x =
      new goog.math.AffineTransform(2, 3, 5, 7, 11, 13)
          .concatenate(new goog.math.AffineTransform(17, 19, 23, 29, 31, 37));
  var y =
      new goog.math.AffineTransform(17, 19, 23, 29, 31, 37)
          .preConcatenate(new goog.math.AffineTransform(2, 3, 5, 7, 11, 13));
  assertEquals(x.getScaleX(), y.getScaleX());
  assertEquals(x.getShearY(), y.getShearY());
  assertEquals(x.getShearX(), y.getShearX());
  assertEquals(x.getScaleY(), y.getScaleY());
  assertEquals(x.getTranslateX(), y.getTranslateX());
  assertEquals(x.getTranslateY(), y.getTranslateY());
}

function testTransform() {
  var srcPts = [0, 0, 1, 0, 1, 1, 0, 1];
  var dstPts = [];
  var tx = goog.math.AffineTransform.getScaleInstance(2, 3);
  tx.translate(5, 10);
  tx.rotate(Math.PI / 4, 5, 10);
  tx.transform(srcPts, 0, dstPts, 0, 4);
  assert(
      goog.array.equals(
          [
            27.071068, 28.180195, 28.485281, 30.301516, 27.071068, 32.422836,
            25.656855, 30.301516
          ],
          dstPts, goog.math.nearlyEquals));
}

function testGetDeterminant() {
  var tx = goog.math.AffineTransform.getScaleInstance(2, 3);
  tx.translate(5, 10);
  tx.rotate(Math.PI / 4, 5, 10);
  assertRoughlyEquals(6, tx.getDeterminant(), 0.001);
}

function testIsInvertible() {
  assertTrue(new goog.math.AffineTransform(2, 3, 4, 5, 6, 7).isInvertible());
  assertTrue(new goog.math.AffineTransform(1, 0, 0, 1, 0, 0).isInvertible());
  assertFalse(new goog.math.AffineTransform(NaN, 0, 0, 1, 0, 0).isInvertible());
  assertFalse(new goog.math.AffineTransform(1, NaN, 0, 1, 0, 0).isInvertible());
  assertFalse(new goog.math.AffineTransform(1, 0, NaN, 1, 0, 0).isInvertible());
  assertFalse(new goog.math.AffineTransform(1, 0, 0, NaN, 0, 0).isInvertible());
  assertFalse(new goog.math.AffineTransform(1, 0, 0, 1, NaN, 0).isInvertible());
  assertFalse(new goog.math.AffineTransform(1, 0, 0, 1, 0, NaN).isInvertible());
  assertFalse(
      new goog.math.AffineTransform(Infinity, 0, 0, 1, 0, 0).isInvertible());
  assertFalse(
      new goog.math.AffineTransform(1, Infinity, 0, 1, 0, 0).isInvertible());
  assertFalse(
      new goog.math.AffineTransform(1, 0, Infinity, 1, 0, 0).isInvertible());
  assertFalse(
      new goog.math.AffineTransform(1, 0, 0, Infinity, 0, 0).isInvertible());
  assertFalse(
      new goog.math.AffineTransform(1, 0, 0, 1, Infinity, 0).isInvertible());
  assertFalse(
      new goog.math.AffineTransform(1, 0, 0, 1, 0, Infinity).isInvertible());
  assertFalse(new goog.math.AffineTransform(0, 0, 0, 0, 1, 0).isInvertible());
}

function testCreateInverse() {
  var tx = goog.math.AffineTransform.getScaleInstance(2, 3);
  tx.translate(5, 10);
  tx.rotate(Math.PI / 4, 5, 10);
  var inverse = tx.createInverse();
  assert(goog.math.nearlyEquals(0.353553, inverse.getScaleX()));
  assert(goog.math.nearlyEquals(-0.353553, inverse.getShearY()));
  assert(goog.math.nearlyEquals(0.235702, inverse.getShearX()));
  assert(goog.math.nearlyEquals(0.235702, inverse.getScaleY()));
  assert(goog.math.nearlyEquals(-16.213203, inverse.getTranslateX()));
  assert(goog.math.nearlyEquals(2.928932, inverse.getTranslateY()));
}

function testCopyFrom() {
  var from = new goog.math.AffineTransform(1, 2, 3, 4, 5, 6);
  var to = new goog.math.AffineTransform();
  to.copyFrom(from);
  assertEquals(from.getScaleX(), to.getScaleX());
  assertEquals(from.getShearY(), to.getShearY());
  assertEquals(from.getShearX(), to.getShearX());
  assertEquals(from.getScaleY(), to.getScaleY());
  assertEquals(from.getTranslateX(), to.getTranslateX());
  assertEquals(from.getTranslateY(), to.getTranslateY());
}

function testToString() {
  var tx = new goog.math.AffineTransform(1, 2, 3, 4, 5, 6);
  assertEquals('matrix(1,2,3,4,5,6)', tx.toString());
}

function testEquals() {
  var tx1 = new goog.math.AffineTransform(1, 2, 3, 4, 5, 6);
  var tx2 = new goog.math.AffineTransform(1, 2, 3, 4, 5, 6);
  assertEqualsMethod(tx1, tx2, true);

  tx2 = new goog.math.AffineTransform(-1, 2, 3, 4, 5, 6);
  assertEqualsMethod(tx1, tx2, false);

  tx2 = new goog.math.AffineTransform(1, -1, 3, 4, 5, 6);
  assertEqualsMethod(tx1, tx2, false);

  tx2 = new goog.math.AffineTransform(1, 2, -3, 4, 5, 6);
  assertEqualsMethod(tx1, tx2, false);

  tx2 = new goog.math.AffineTransform(1, 2, 3, -4, 5, 6);
  assertEqualsMethod(tx1, tx2, false);

  tx2 = new goog.math.AffineTransform(1, 2, 3, 4, -5, 6);
  assertEqualsMethod(tx1, tx2, false);

  tx2 = new goog.math.AffineTransform(1, 2, 3, 4, 5, -6);
  assertEqualsMethod(tx1, tx2, false);
}

function assertEqualsMethod(tx1, tx2, expected) {
  assertEquals(expected, tx1.equals(tx2));
  assertEquals(expected, tx2.equals(tx1));
  assertEquals(true, tx1.equals(tx1));
  assertEquals(true, tx2.equals(tx2));
}
