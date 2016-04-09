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

goog.provide('goog.crypt.pbkdf2Test');
goog.setTestOnly('goog.crypt.pbkdf2Test');

goog.require('goog.crypt');
goog.require('goog.crypt.pbkdf2');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

function testPBKDF2() {
  // PBKDF2 test vectors from:
  // http://tools.ietf.org/html/rfc6070

  if (goog.userAgent.IE && goog.userAgent.isVersionOrHigher('7')) {
    return;
  }

  var testPassword = goog.crypt.stringToByteArray('password');
  var testSalt = goog.crypt.stringToByteArray('salt');

  assertElementsEquals(
      goog.crypt.hexToByteArray('0c60c80f961f0e71f3a9b524af6012062fe037a6'),
      goog.crypt.pbkdf2.deriveKeySha1(testPassword, testSalt, 1, 160));

  assertElementsEquals(
      goog.crypt.hexToByteArray('ea6c014dc72d6f8ccd1ed92ace1d41f0d8de8957'),
      goog.crypt.pbkdf2.deriveKeySha1(testPassword, testSalt, 2, 160));

  assertElementsEquals(
      goog.crypt.hexToByteArray('4b007901b765489abead49d926f721d065a429c1'),
      goog.crypt.pbkdf2.deriveKeySha1(testPassword, testSalt, 4096, 160));

  testPassword = goog.crypt.stringToByteArray('passwordPASSWORDpassword');
  testSalt =
      goog.crypt.stringToByteArray('saltSALTsaltSALTsaltSALTsaltSALTsalt');

  assertElementsEquals(
      goog.crypt.hexToByteArray(
          '3d2eec4fe41c849b80c8d83662c0e44a8b291a964cf2f07038'),
      goog.crypt.pbkdf2.deriveKeySha1(testPassword, testSalt, 4096, 200));

  testPassword = goog.crypt.stringToByteArray('pass\0word');
  testSalt = goog.crypt.stringToByteArray('sa\0lt');

  assertElementsEquals(
      goog.crypt.hexToByteArray('56fa6aa75548099dcc37d7f03425e0c3'),
      goog.crypt.pbkdf2.deriveKeySha1(testPassword, testSalt, 4096, 128));
}
