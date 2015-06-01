// Copyright 2015 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.urlTest');
goog.setTestOnly('goog.urlTest');

goog.require('goog.fs.url');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');

var stubs = new goog.testing.PropertyReplacer();

function testBrowserSupportsObjectUrls() {
  stubs.remove(goog.global, 'URL');
  stubs.remove(goog.global, 'webkitURL');
  stubs.remove(goog.global, 'createObjectURL');

  assertFalse(goog.fs.url.browserSupportsObjectUrls());
  try {
    goog.fs.url.createObjectUrl();
    fail();
  } catch (e) {
    assertEquals('This browser doesn\'t seem to support blob URLs', e.message);
  }

  var objectUrl = {};
  function createObjectURL() { return objectUrl; }
  stubs.set(goog.global, 'createObjectURL', createObjectURL);

  assertTrue(goog.fs.url.browserSupportsObjectUrls());
  assertEquals(objectUrl, goog.fs.url.createObjectUrl());

  stubs.reset();
}
