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

goog.provide('goog.testing.fsTest');
goog.setTestOnly('goog.testing.fsTest');

goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.fs');
goog.require('goog.testing.fs.Blob');
goog.require('goog.testing.jsunit');

var asyncTestCase = goog.testing.AsyncTestCase.createAndInstall();

function testObjectUrls() {
  var blob = goog.testing.fs.getBlob('foo');
  var url = goog.testing.fs.createObjectUrl(blob);
  assertTrue(goog.testing.fs.isObjectUrlGranted(blob));
  goog.testing.fs.revokeObjectUrl(url);
  assertFalse(goog.testing.fs.isObjectUrlGranted(blob));
}

function testGetBlob() {
  assertEquals(
      new goog.testing.fs.Blob('foobarbaz').toString(),
      goog.testing.fs.getBlob('foo', 'bar', 'baz').toString());
  assertEquals(
      new goog.testing.fs.Blob('foobarbaz').toString(),
      goog.testing.fs.getBlob('foo', new goog.testing.fs.Blob('bar'), 'baz').
      toString());
}

function testBlobToString() {
  goog.testing.fs.blobToString(new goog.testing.fs.Blob('foobarbaz')).
      addCallback(goog.partial(assertEquals, 'foobarbaz')).
      addCallback(goog.bind(asyncTestCase.continueTesting, asyncTestCase));
  asyncTestCase.waitForAsync('testBlobToString');
}

function testGetBlobWithProperties() {
  assertEquals(
      'data:spam/eggs;base64,Zm9vYmFy',
      new goog.testing.fs.getBlobWithProperties(
          ['foo', new goog.testing.fs.Blob('bar')], 'spam/eggs').toDataUrl());
}
