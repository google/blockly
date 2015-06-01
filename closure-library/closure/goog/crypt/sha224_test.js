// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.crypt.Sha224Test');
goog.setTestOnly('goog.crypt.Sha224Test');

goog.require('goog.crypt');
goog.require('goog.crypt.Sha224');
goog.require('goog.crypt.hashTester');
goog.require('goog.testing.jsunit');

function testBasicOperations() {
  var sha224 = new goog.crypt.Sha224();
  goog.crypt.hashTester.runBasicTests(sha224);
}

function testHashing() {
  // Some test vectors from:
  // csrc.nist.gov/publications/fips/fips180-2/fips180-2withchangenotice.pdf

  var sha224 = new goog.crypt.Sha224();

  // NIST one block test vector.
  sha224.update(goog.crypt.stringToByteArray('abc'));
  assertEquals(
      '23097d223405d8228642a477bda255b32aadbce4bda0b3f7e36c9da7',
      goog.crypt.byteArrayToHex(sha224.digest()));

  // NIST multi-block test vector.
  sha224.reset();
  sha224.update(
      goog.crypt.stringToByteArray(
          'abcdbcdecdefdefgefghfghighij' +
          'hijkijkljklmklmnlmnomnopnopq'));
  assertEquals(
      '75388b16512776cc5dba5da1fd890150b0c6455cb4f58b1952522525',
      goog.crypt.byteArrayToHex(sha224.digest()));

  // Message larger than one block (but less than two).
  sha224.reset();
  var biggerThanOneBlock = 'abcdbcdecdefdefgefghfghighij' +
      'hijkijkljklmklmnlmnomnopnopq' +
      'asdfljhr78yasdfljh45opa78sdf' +
      '120839414104897aavnasdfafasd';
  assertTrue(biggerThanOneBlock.length > goog.crypt.Sha2.BLOCKSIZE_ &&
      biggerThanOneBlock.length < 2 * goog.crypt.Sha2.BLOCKSIZE_);
  sha224.update(goog.crypt.stringToByteArray(biggerThanOneBlock));
  assertEquals(
      '27c9b678012becd6891bac653f355b2d26f63132e840644d565f5dac',
      goog.crypt.byteArrayToHex(sha224.digest()));

  // Message larger than two blocks.
  sha224.reset();
  var biggerThanTwoBlocks = 'abcdbcdecdefdefgefghfghighij' +
      'hijkijkljklmklmnlmnomnopnopq' +
      'asdfljhr78yasdfljh45opa78sdf' +
      '120839414104897aavnasdfafasd' +
      'laasdouvhalacbnalalseryalcla';
  assertTrue(biggerThanTwoBlocks.length > 2 * goog.crypt.Sha2.BLOCKSIZE_);
  sha224.update(goog.crypt.stringToByteArray(biggerThanTwoBlocks));
  assertEquals(
      '1c2c1455cc984eef6f25ec9d79b1c661b3794887c3d0b24111ed9803',
      goog.crypt.byteArrayToHex(sha224.digest()));
}
