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

goog.provide('goog.cryptTest');
goog.setTestOnly('goog.cryptTest');

goog.require('goog.crypt');
goog.require('goog.string');
goog.require('goog.testing.jsunit');

var UTF8_RANGES_BYTE_ARRAY =
    [0x00, 0x7F, 0xC2, 0x80, 0xDF, 0xBF, 0xE0, 0xA0, 0x80, 0xEF, 0xBF, 0xBF];

var UTF8_SURROGATE_PAIR_RANGES_BYTE_ARRAY = [
  0xF0, 0x90, 0x80, 0x80,  // \uD800\uDC00
  0xF0, 0x90, 0x8F, 0xBF,  // \uD800\uDFFF
  0xF4, 0x8F, 0xB0, 0x80,  // \uDBFF\uDC00
  0xF4, 0x8F, 0xBF, 0xBF   // \uDBFF\uDFFF
];

var UTF8_RANGES_STRING = '\u0000\u007F\u0080\u07FF\u0800\uFFFF';

var UTF8_SURROGATE_PAIR_RANGES_STRING =
    '\uD800\uDC00\uD800\uDFFF\uDBFF\uDC00\uDBFF\uDFFF';

function testStringToUtf8ByteArray() {
  // Known encodings taken from Java's String.getBytes("UTF8")

  assertArrayEquals(
      'ASCII', [72, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100],
      goog.crypt.stringToUtf8ByteArray('Hello, world'));

  assertArrayEquals(
      'Latin', [83, 99, 104, 195, 182, 110],
      goog.crypt.stringToUtf8ByteArray('Sch\u00f6n'));

  assertArrayEquals(
      'limits of the first 3 UTF-8 character ranges', UTF8_RANGES_BYTE_ARRAY,
      goog.crypt.stringToUtf8ByteArray(UTF8_RANGES_STRING));

  assertArrayEquals(
      'Surrogate Pair', UTF8_SURROGATE_PAIR_RANGES_BYTE_ARRAY,
      goog.crypt.stringToUtf8ByteArray(UTF8_SURROGATE_PAIR_RANGES_STRING));
}

function testUtf8ByteArrayToString() {
  // Known encodings taken from Java's String.getBytes("UTF8")

  assertEquals('ASCII', 'Hello, world', goog.crypt.utf8ByteArrayToString([
    72, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100
  ]));

  assertEquals(
      'Latin', 'Sch\u00f6n',
      goog.crypt.utf8ByteArrayToString([83, 99, 104, 195, 182, 110]));

  assertEquals(
      'limits of the first 3 UTF-8 character ranges', UTF8_RANGES_STRING,
      goog.crypt.utf8ByteArrayToString(UTF8_RANGES_BYTE_ARRAY));

  assertEquals(
      'Surrogate Pair', UTF8_SURROGATE_PAIR_RANGES_STRING,
      goog.crypt.utf8ByteArrayToString(UTF8_SURROGATE_PAIR_RANGES_BYTE_ARRAY));
}


/**
 * Same as testUtf8ByteArrayToString but with Uint8Array instead of
 * Array<number>.
 */
function testUint8ArrayToString() {
  if (!goog.global.Uint8Array) {
    // Uint8Array not supported.
    return;
  }

  var arr =
      new Uint8Array([72, 101, 108, 108, 111, 44, 32, 119, 111, 114, 108, 100]);
  assertEquals('ASCII', 'Hello, world', goog.crypt.utf8ByteArrayToString(arr));

  arr = new Uint8Array([83, 99, 104, 195, 182, 110]);
  assertEquals('Latin', 'Sch\u00f6n', goog.crypt.utf8ByteArrayToString(arr));

  arr = new Uint8Array(UTF8_RANGES_BYTE_ARRAY);
  assertEquals(
      'limits of the first 3 UTF-8 character ranges', UTF8_RANGES_STRING,
      goog.crypt.utf8ByteArrayToString(arr));
}

function testByteArrayToString() {
  assertEquals('', goog.crypt.byteArrayToString([]));
  assertEquals('abc', goog.crypt.byteArrayToString([97, 98, 99]));
}

function testHexToByteArray() {
  assertElementsEquals(
      [202, 254, 222, 173],
      // Java magic number
      goog.crypt.hexToByteArray('cafedead'));

  assertElementsEquals(
      [222, 173, 190, 239],
      // IBM magic number
      goog.crypt.hexToByteArray('DEADBEEF'));
}

function testByteArrayToHex() {
  assertEquals(
      // Java magic number
      'cafedead', goog.crypt.byteArrayToHex([202, 254, 222, 173]));

  assertEquals(
      // IBM magic number
      'deadbeef', goog.crypt.byteArrayToHex([222, 173, 190, 239]));
}


/** Same as testByteArrayToHex but with Uint8Array instead of Array<number>. */
function testUint8ArrayToHex() {
  if (!goog.isDef(goog.global.Uint8Array)) {
    // Uint8Array not supported.
    return;
  }

  assertEquals(
      // Java magic number
      'cafedead',
      goog.crypt.byteArrayToHex(new Uint8Array([202, 254, 222, 173])));

  assertEquals(
      // IBM magic number
      'deadbeef',
      goog.crypt.byteArrayToHex(new Uint8Array([222, 173, 190, 239])));
}

function testXorByteArray() {
  assertElementsEquals(
      [20, 83, 96, 66],
      goog.crypt.xorByteArray([202, 254, 222, 173], [222, 173, 190, 239]));
}


/** Same as testXorByteArray but with Uint8Array instead of Array<number>. */
function testXorUint8Array() {
  if (!goog.isDef(goog.global.Uint8Array)) {
    // Uint8Array not supported.
    return;
  }

  assertElementsEquals(
      [20, 83, 96, 66], goog.crypt.xorByteArray(
                            new Uint8Array([202, 254, 222, 173]),
                            new Uint8Array([222, 173, 190, 239])));
}


// Tests a one-megabyte byte array conversion to string.
// This would break on many JS implementations unless byteArrayToString
// split the input up.
// See discussion and bug report: http://goo.gl/LrWmZ9
function testByteArrayToStringCallStack() {
  // One megabyte is 2 to the 20th.
  var count = Math.pow(2, 20);
  var bytes = [];
  for (var i = 0; i < count; i++) {
    bytes.push('A'.charCodeAt(0));
  }
  var str = goog.crypt.byteArrayToString(bytes);
  assertEquals(goog.string.repeat('A', count), str);
}
