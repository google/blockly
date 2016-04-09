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
 * @fileoverview Unit tests for goog.labs.net.Image.
 *
 * @author nnaze@google.com (Nathan Naze)
 */

goog.provide('goog.labs.net.imageTest');

goog.require('goog.labs.net.image');
goog.require('goog.string');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');

goog.setTestOnly('goog.labs.net.imageTest');


function setUpPage() {
  goog.testing.TestCase.getActiveTestCase().promiseTimeout = 10000;  // 10s
}

function testValidImage() {
  var url = 'testdata/cleardot.gif';

  return goog.labs.net.image.load(url).then(function(value) {
    assertEquals('IMG', value.tagName);
    assertTrue(goog.string.endsWith(value.src, url));
  });
}

function testInvalidImage() {
  var url = 'testdata/invalid.gif';  // This file does not exist.

  return goog.labs.net.image.load(url).then(
      function() { fail('Invalid image should not resolve'); },
      function(errResult) { assertNull(errResult); });
}

function testImageFactory() {
  var returnedImage = new Image();
  var factory = function() { return returnedImage; };
  var countedFactory = goog.testing.recordFunction(factory);

  var url = 'testdata/cleardot.gif';

  return goog.labs.net.image.load(url, countedFactory).then(function(value) {
    assertEquals(returnedImage, value);
    assertEquals(1, countedFactory.getCallCount());
  });
}

function testExistingImage() {
  var image = new Image();

  var url = 'testdata/cleardot.gif';

  return goog.labs.net.image.load(url, image).then(function(value) {
    assertEquals(image, value);
  });
}
