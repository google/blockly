// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.crypt.base64Test');
goog.setTestOnly('goog.crypt.base64Test');

goog.require('goog.crypt');
goog.require('goog.crypt.base64');
goog.require('goog.testing.jsunit');

// Static test data
var tests = [
  '', '',
  'f', 'Zg==',
  'fo', 'Zm8=',
  'foo', 'Zm9v',
  'foob', 'Zm9vYg==',
  'fooba', 'Zm9vYmE=',
  'foobar', 'Zm9vYmFy',

  // Testing non-ascii characters (1-10 in chinese)
  '\xe4\xb8\x80\xe4\xba\x8c\xe4\xb8\x89\xe5\x9b\x9b\xe4\xba\x94\xe5' +
      '\x85\xad\xe4\xb8\x83\xe5\x85\xab\xe4\xb9\x9d\xe5\x8d\x81',
  '5LiA5LqM5LiJ5Zub5LqU5YWt5LiD5YWr5Lmd5Y2B'];

function testByteArrayEncoding() {
  // Let's see if it's sane by feeding it some well-known values. Index i
  // has the input and index i+1 has the expected value.
  for (var i = 0; i < tests.length; i += 2) {
    var enc = goog.crypt.base64.encodeByteArray(
        goog.crypt.stringToByteArray(tests[i]));
    assertEquals(tests[i + 1], enc);
    var dec = goog.crypt.byteArrayToString(
        goog.crypt.base64.decodeStringToByteArray(enc));
    assertEquals(tests[i], dec);

    // Check that websafe decoding accepts non-websafe codes.
    dec = goog.crypt.byteArrayToString(
        goog.crypt.base64.decodeStringToByteArray(enc, true /* websafe */));
    assertEquals(tests[i], dec);

    // Re-encode as websafe.
    enc = goog.crypt.base64.encodeByteArray(
        goog.crypt.stringToByteArray(tests[i], true /* websafe */));

    // Check that non-websafe decoding accepts websafe codes.
    dec = goog.crypt.byteArrayToString(
        goog.crypt.base64.decodeStringToByteArray(enc));
    assertEquals(tests[i], dec);

    // Check that websafe decoding accepts websafe codes.
    dec = goog.crypt.byteArrayToString(
        goog.crypt.base64.decodeStringToByteArray(enc, true /* websafe */));
    assertEquals(tests[i], dec);
  }
}

function testOddLengthByteArrayEncoding() {
  var buffer = [0, 0, 0];
  var encodedBuffer = goog.crypt.base64.encodeByteArray(buffer);
  assertEquals('AAAA', encodedBuffer);

  var decodedBuffer = goog.crypt.base64.decodeStringToByteArray(encodedBuffer);
  assertEquals(decodedBuffer.length, buffer.length);
  for (i = 0; i < buffer.length; i++) {
    assertEquals(buffer[i], decodedBuffer[i]);
  }
}

// Tests that decoding a string where the length is not a multiple of 4 does
// not produce spurious trailing zeroes.  This is a regression test for
// cl/65120705, which fixes a bug that was introduced when support for
// non-padded base64 encoding was added in cl/20209336.
function testOddLengthByteArrayDecoding() {
  // The base-64 encoding of the bytes [97, 98, 99, 100], with no padding.
  // The padded version would be "YWJjZA==" (length 8), or "YWJjZA.." if
  // web-safe.
  var encodedBuffer = 'YWJjZA';
  var decodedBuffer1 = goog.crypt.base64.decodeStringToByteArray(encodedBuffer);
  assertEquals(4, decodedBuffer1.length);
  // Note that byteArrayToString ignores any trailing zeroes because
  // String.fromCharCode(0) is ''.
  assertEquals('abcd', goog.crypt.byteArrayToString(decodedBuffer1));

  // Repeat the test in web-safe decoding mode.
  var decodedBuffer2 = goog.crypt.base64.decodeStringToByteArray(encodedBuffer,
      true  /* web-safe */);
  assertEquals(4, decodedBuffer2.length);
  assertEquals('abcd', goog.crypt.byteArrayToString(decodedBuffer2));
}

function testShortcutPathEncoding() {
  // Test the higher-level API (tests the btoa/atob shortcut path)
  for (var i = 0; i < tests.length; i += 2) {
    var enc = goog.crypt.base64.encodeString(tests[i]);
    assertEquals(tests[i + 1], enc);
    var dec = goog.crypt.base64.decodeString(enc);
    assertEquals(tests[i], dec);
  }
}

function testMultipleIterations() {
  // Now run it through its paces

  var numIterations = 100;
  for (var i = 0; i < numIterations; i++) {

    var input = [];
    for (var j = 0; j < i; j++)
      input[j] = j % 256;

    var encoded = goog.crypt.base64.encodeByteArray(input);
    var decoded = goog.crypt.base64.decodeStringToByteArray(encoded);
    assertEquals('Decoded length not equal to input length?',
        input.length, decoded.length);

    for (var j = 0; j < i; j++)
      assertEquals('Values differ at position ' + j, input[j], decoded[j]);
  }
}

function testWebSafeEncoding() {
  // Test non-websafe / websafe difference
  var test = '>>>???>>>???=/+';
  var enc = goog.crypt.base64.encodeByteArray(
      goog.crypt.stringToByteArray(test));
  assertEquals('Non-websafe broken?', 'Pj4+Pz8/Pj4+Pz8/PS8r', enc);
  enc = goog.crypt.base64.encodeString(test);
  assertEquals('Non-websafe broken?', 'Pj4+Pz8/Pj4+Pz8/PS8r', enc);
  enc = goog.crypt.base64.encodeByteArray(
      goog.crypt.stringToByteArray(test), true /* websafe */);
  assertEquals('Websafe encoding broken', 'Pj4-Pz8_Pj4-Pz8_PS8r', enc);
  enc = goog.crypt.base64.encodeString(test, true);
  assertEquals('Non-websafe broken?', 'Pj4-Pz8_Pj4-Pz8_PS8r', enc);
  var dec = goog.crypt.byteArrayToString(
      goog.crypt.base64.decodeStringToByteArray(enc, true /* websafe */));
  assertEquals('Websafe decoding broken', test, dec);
  dec = goog.crypt.base64.decodeString(enc, true /* websafe */);
  assertEquals('Websafe decoding broken', test, dec);

  // Test parsing malformed characters
  assertThrows('Didn\'t throw on malformed input', function() {
    goog.crypt.base64.decodeStringToByteArray('foooooo)oooo', true /*websafe*/);
  });
}
