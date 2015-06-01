// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.crypt.Arc4Test');
goog.setTestOnly('goog.crypt.Arc4Test');

goog.require('goog.array');
goog.require('goog.crypt.Arc4');
goog.require('goog.testing.jsunit');

function testEncryptionDecryption() {
  var key = [0x25, 0x26, 0x27, 0x28];
  var startArray = [0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67];
  var byteArray = [0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67];

  var arc4 = new goog.crypt.Arc4();
  arc4.setKey(key);
  arc4.crypt(byteArray);

  assertArrayEquals(byteArray, [0x51, 0xBB, 0xDD, 0x95, 0x9B, 0x42, 0x34]);

  // The same key and crypt call should unencrypt the data back to its original
  // state
  arc4 = new goog.crypt.Arc4();
  arc4.setKey(key);
  arc4.crypt(byteArray);
  assertArrayEquals(byteArray, startArray);
}

function testDiscard() {
  var key = [0x25, 0x26, 0x27, 0x28];
  var data = [0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67];

  var arc4 = new goog.crypt.Arc4();
  arc4.setKey(key);
  arc4.discard(256);
  var withDiscard = goog.array.clone(data);
  arc4.crypt(withDiscard);

  // First encrypting a dummy array should give the same result as
  // discarding.
  arc4 = new goog.crypt.Arc4();
  arc4.setKey(key);
  var withCrypt = goog.array.clone(data);
  arc4.crypt(new Array(256));
  arc4.crypt(withCrypt);
  assertArrayEquals(withDiscard, withCrypt);
}
