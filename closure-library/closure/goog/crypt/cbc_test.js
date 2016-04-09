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

/**
 * @fileoverview Unit tests for CBC mode for block ciphers.
 *
 * @author nnaze@google.com (Nathan Naze)
 */

/** @suppress {extraProvide} */
goog.provide('goog.crypt.CbcTest');

goog.require('goog.crypt');
goog.require('goog.crypt.Aes');
goog.require('goog.crypt.Cbc');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.crypt.CbcTest');

function stringToBytes(s) {
  var bytes = new Array(s.length);
  for (var i = 0; i < s.length; ++i) bytes[i] = s.charCodeAt(i) & 255;
  return bytes;
}

function runCbcAesTest(
    keyBytes, initialVectorBytes, plainTextBytes, cipherTextBytes) {
  var aes = new goog.crypt.Aes(keyBytes);
  var cbc = new goog.crypt.Cbc(aes);

  var encryptedBytes = cbc.encrypt(plainTextBytes, initialVectorBytes);
  assertEquals(
      'Encrypted bytes should match cipher text.',
      goog.crypt.byteArrayToHex(cipherTextBytes),
      goog.crypt.byteArrayToHex(encryptedBytes));

  var decryptedBytes = cbc.decrypt(cipherTextBytes, initialVectorBytes);
  assertEquals(
      'Decrypted bytes should match plain text.',
      goog.crypt.byteArrayToHex(plainTextBytes),
      goog.crypt.byteArrayToHex(decryptedBytes));
}

function testAesCbcCipherAlgorithm() {
  // Test values from http://www.ietf.org/rfc/rfc3602.txt

  // Case #1
  runCbcAesTest(
      goog.crypt.hexToByteArray('06a9214036b8a15b512e03d534120006'),
      goog.crypt.hexToByteArray('3dafba429d9eb430b422da802c9fac41'),
      stringToBytes('Single block msg'),
      goog.crypt.hexToByteArray('e353779c1079aeb82708942dbe77181a'));

  // Case #2
  runCbcAesTest(
      goog.crypt.hexToByteArray('c286696d887c9aa0611bbb3e2025a45a'),
      goog.crypt.hexToByteArray('562e17996d093d28ddb3ba695a2e6f58'),
      goog.crypt.hexToByteArray(
          '000102030405060708090a0b0c0d0e0f' +
          '101112131415161718191a1b1c1d1e1f'),
      goog.crypt.hexToByteArray(
          'd296cd94c2cccf8a3a863028b5e1dc0a' +
          '7586602d253cfff91b8266bea6d61ab1'));

  // Case #3
  runCbcAesTest(
      goog.crypt.hexToByteArray('6c3ea0477630ce21a2ce334aa746c2cd'),
      goog.crypt.hexToByteArray('c782dc4c098c66cbd9cd27d825682c81'),
      stringToBytes('This is a 48-byte message (exactly 3 AES blocks)'),
      goog.crypt.hexToByteArray(
          'd0a02b3836451753d493665d33f0e886' +
          '2dea54cdb293abc7506939276772f8d5' +
          '021c19216bad525c8579695d83ba2684'));

  // Case #4
  runCbcAesTest(
      goog.crypt.hexToByteArray('56e47a38c5598974bc46903dba290349'),
      goog.crypt.hexToByteArray('8ce82eefbea0da3c44699ed7db51b7d9'),
      goog.crypt.hexToByteArray(
          'a0a1a2a3a4a5a6a7a8a9aaabacadaeaf' +
          'b0b1b2b3b4b5b6b7b8b9babbbcbdbebf' +
          'c0c1c2c3c4c5c6c7c8c9cacbcccdcecf' +
          'd0d1d2d3d4d5d6d7d8d9dadbdcdddedf'),
      goog.crypt.hexToByteArray(
          'c30e32ffedc0774e6aff6af0869f71aa' +
          '0f3af07a9a31a9c684db207eb0ef8e4e' +
          '35907aa632c3ffdf868bb7b29d3d46ad' +
          '83ce9f9a102ee99d49a53e87f4c3da55'));
}
