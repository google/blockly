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

goog.provide('goog.crypt.Sha256Test');
goog.setTestOnly('goog.crypt.Sha256Test');

goog.require('goog.crypt');
goog.require('goog.crypt.Sha256');
goog.require('goog.crypt.hashTester');
goog.require('goog.testing.jsunit');

function testBasicOperations() {
  var sha256 = new goog.crypt.Sha256();
  goog.crypt.hashTester.runBasicTests(sha256);
}

function testHashing() {
  // Some test vectors from:
  // csrc.nist.gov/publications/fips/fips180-2/fips180-2withchangenotice.pdf

  var sha256 = new goog.crypt.Sha256();

  // Empty message.
  sha256.update([]);
  assertEquals(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      goog.crypt.byteArrayToHex(sha256.digest()));

  // NIST one block test vector.
  sha256.reset();
  sha256.update(goog.crypt.stringToByteArray('abc'));
  assertEquals(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
      goog.crypt.byteArrayToHex(sha256.digest()));

  // NIST multi-block test vector.
  sha256.reset();
  sha256.update(
      goog.crypt.stringToByteArray(
          'abcdbcdecdefdefgefghfghighij' +
          'hijkijkljklmklmnlmnomnopnopq'));
  assertEquals(
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
      goog.crypt.byteArrayToHex(sha256.digest()));

  // Message larger than one block (but less than two).
  sha256.reset();
  var biggerThanOneBlock = 'abcdbcdecdefdefgefghfghighij' +
      'hijkijkljklmklmnlmnomnopnopq' +
      'asdfljhr78yasdfljh45opa78sdf' +
      '120839414104897aavnasdfafasd';
  assertTrue(biggerThanOneBlock.length > goog.crypt.Sha2.BLOCKSIZE_ &&
      biggerThanOneBlock.length < 2 * goog.crypt.Sha2.BLOCKSIZE_);
  sha256.update(goog.crypt.stringToByteArray(biggerThanOneBlock));
  assertEquals(
      '390a5035433e46b740600f3117d11ece3c64706dc889106666ac04fe4f458abc',
      goog.crypt.byteArrayToHex(sha256.digest()));

  // Message larger than two blocks.
  sha256.reset();
  var biggerThanTwoBlocks = 'abcdbcdecdefdefgefghfghighij' +
      'hijkijkljklmklmnlmnomnopnopq' +
      'asdfljhr78yasdfljh45opa78sdf' +
      '120839414104897aavnasdfafasd' +
      'laasdouvhalacbnalalseryalcla';
  assertTrue(biggerThanTwoBlocks.length > 2 * goog.crypt.Sha2.BLOCKSIZE_);
  sha256.update(goog.crypt.stringToByteArray(biggerThanTwoBlocks));
  assertEquals(
      'd655c513fd347e9be372d891f8bb42895ca310fabf6ead6681ebc66a04e84db5',
      goog.crypt.byteArrayToHex(sha256.digest()));
}


/** Check that the code checks for bad input */
function testBadInput() {
  assertThrows('Bad input', function() {
    new goog.crypt.Sha256().update({});
  });
  assertThrows('Floating point not allows', function() {
    new goog.crypt.Sha256().update([1, 2, 3, 4, 4.5]);
  });
  assertThrows('Negative not allowed', function() {
    new goog.crypt.Sha256().update([1, 2, 3, 4, -10]);
  });
  assertThrows('Must be byte array', function() {
    new goog.crypt.Sha256().update([1, 2, 3, 4, {}]);
  });
}
