// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.crypt.HmacTest');
goog.setTestOnly('goog.crypt.HmacTest');

goog.require('goog.crypt.Hmac');
goog.require('goog.crypt.Sha1');
goog.require('goog.crypt.hashTester');
goog.require('goog.testing.jsunit');

function stringToBytes(s) {
  var bytes = new Array(s.length);

  for (var i = 0; i < s.length; ++i) {
    bytes[i] = s.charCodeAt(i) & 255;
  }
  return bytes;
}

function hexToBytes(str) {
  var arr = [];

  for (var i = 0; i < str.length; i += 2) {
    arr.push(parseInt(str.substring(i, i + 2), 16));
  }

  return arr;
}

function bytesToHex(b) {
  var hexchars = '0123456789abcdef';
  var hexrep = new Array(b.length * 2);

  for (var i = 0; i < b.length; ++i) {
    hexrep[i * 2] = hexchars.charAt((b[i] >> 4) & 15);
    hexrep[i * 2 + 1] = hexchars.charAt(b[i] & 15);
  }
  return hexrep.join('');
}


/**
 * helper to get an hmac of the given message with the given key.
 */
function getHmac(key, message, opt_blockSize) {
  var hasher = new goog.crypt.Sha1();
  var hmacer = new goog.crypt.Hmac(hasher, key, opt_blockSize);
  return bytesToHex(hmacer.getHmac(message));
}

function testBasicOperations() {
  var hmac = new goog.crypt.Hmac(new goog.crypt.Sha1(), 'key', 64);
  goog.crypt.hashTester.runBasicTests(hmac);
}

function testBasicOperationsWithNoBlockSize() {
  var hmac = new goog.crypt.Hmac(new goog.crypt.Sha1(), 'key');
  goog.crypt.hashTester.runBasicTests(hmac);
}

function testHmac() {
  // HMAC test vectors from:
  // http://tools.ietf.org/html/2202

  assertEquals('test 1 failed',
      'b617318655057264e28bc0b6fb378c8ef146be00',
      getHmac(hexToBytes('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b'),
          stringToBytes('Hi There')));

  assertEquals('test 2 failed',
      'effcdf6ae5eb2fa2d27416d5f184df9c259a7c79',
      getHmac(stringToBytes('Jefe'),
          stringToBytes('what do ya want for nothing?')));

  assertEquals('test 3 failed',
      '125d7342b9ac11cd91a39af48aa17b4f63f175d3',
      getHmac(hexToBytes('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
          hexToBytes('dddddddddddddddddddddddddddddddddddddddd' +
              'dddddddddddddddddddddddddddddddddddddddd' +
              'dddddddddddddddddddd')));

  assertEquals('test 4 failed',
      '4c9007f4026250c6bc8414f9bf50c86c2d7235da',
      getHmac(hexToBytes('0102030405060708090a0b0c0d0e0f10111213141516171819'),
          hexToBytes('cdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd' +
              'cdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcd' +
              'cdcdcdcdcdcdcdcdcdcd')));

  assertEquals('test 5 failed',
      '4c1a03424b55e07fe7f27be1d58bb9324a9a5a04',
      getHmac(hexToBytes('0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c'),
          stringToBytes('Test With Truncation')));

  assertEquals('test 6 failed',
      'aa4ae5e15272d00e95705637ce8a3b55ed402112',
      getHmac(hexToBytes('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
              'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
              'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
              'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
          stringToBytes(
              'Test Using Larger Than Block-Size Key - Hash Key First')));

  assertEquals('test 7 failed',
      'b617318655057264e28bc0b6fb378c8ef146be00',
      getHmac(hexToBytes('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b'),
          stringToBytes('Hi There'), 64));

  assertEquals('test 8 failed',
      '941f806707826395dc510add6a45ce9933db976e',
      getHmac(hexToBytes('0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b'),
          stringToBytes('Hi There'), 32));
}


/** Regression test for Bug 12863104 */
function testUpdateWithLongKey() {
  // Calling update() then digest() should give the same result as just
  // calling getHmac()
  var key = hexToBytes('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
                       'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
                       'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' +
                       'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  var message = 'Secret Message';
  var hmac = new goog.crypt.Hmac(new goog.crypt.Sha1(), key);
  hmac.update(message);
  var result1 = bytesToHex(hmac.digest());
  hmac.reset();
  var result2 = bytesToHex(hmac.getHmac(message));
  assertEquals('Results must be the same', result1, result2);
}
