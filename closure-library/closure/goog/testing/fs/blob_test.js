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

goog.provide('goog.testing.fs.BlobTest');
goog.setTestOnly('goog.testing.fs.BlobTest');

goog.require('goog.testing.fs.Blob');
goog.require('goog.testing.jsunit');

function testAttributes() {
  var blob = new goog.testing.fs.Blob();
  assertEquals(0, blob.size);
  assertEquals('', blob.type);

  blob = new goog.testing.fs.Blob('foo bar baz');
  assertEquals(11, blob.size);
  assertEquals('', blob.type);

  blob = new goog.testing.fs.Blob('foo bar baz', 'text/plain');
  assertEquals(11, blob.size);
  assertEquals('text/plain', blob.type);
}

function testToString() {
  assertEquals('', new goog.testing.fs.Blob().toString());
  assertEquals('foo bar', new goog.testing.fs.Blob('foo bar').toString());
}

function testSlice() {
  var blob = new goog.testing.fs.Blob('abcdef');
  assertEquals('bc', blob.slice(1, 3).toString());
  assertEquals('def', blob.slice(3, 10).toString());
  assertEquals('abcd', blob.slice(0, -2).toString());
  assertEquals('', blob.slice(10, 1).toString());
  assertEquals('b', blob.slice(-5, 2).toString());

  assertEquals('abcdef', blob.slice().toString());
  assertEquals('abc', blob.slice(/* opt_start */ undefined, 3).toString());
  assertEquals('def', blob.slice(3).toString());

  assertEquals('text/plain', blob.slice(1, 2, 'text/plain').type);
}

function testSetDataInternal() {
  var blob = new goog.testing.fs.Blob();

  blob.setDataInternal('asdf');
  assertEquals('asdf', blob.toString());
  assertEquals(4, blob.size);

  blob.setDataInternal('');
  assertEquals('', blob.toString());
  assertEquals(0, blob.size);
}
