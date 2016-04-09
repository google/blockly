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

goog.require('goog.testing.fs');
goog.require('goog.testing.fs.Blob');
goog.require('goog.testing.jsunit');

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
      goog.testing.fs.getBlob('foo', new goog.testing.fs.Blob('bar'), 'baz')
          .toString());
}

function testBlobToString() {
  return goog.testing.fs.blobToString(new goog.testing.fs.Blob('foobarbaz'))
      .then(function(result) { assertEquals('foobarbaz', result); });
}

function testGetBlobWithProperties() {
  assertEquals(
      'data:spam/eggs;base64,Zm9vYmFy',
      new goog.testing.fs
          .getBlobWithProperties(
              ['foo', new goog.testing.fs.Blob('bar')], 'spam/eggs')
          .toDataUrl());
}

function testSliceBlob() {
  myBlob = new goog.testing.fs.Blob('0123456789');
  actual = new goog.testing.fs.sliceBlob(myBlob, 1, 3);
  expected = new goog.testing.fs.Blob('12');
  assertEquals(expected.toString(), actual.toString());

  myBlob = new goog.testing.fs.Blob('0123456789');
  actual = new goog.testing.fs.sliceBlob(myBlob, 0, -1);
  expected = new goog.testing.fs.Blob('012345678');
  assertEquals(expected.toString(), actual.toString());
}
