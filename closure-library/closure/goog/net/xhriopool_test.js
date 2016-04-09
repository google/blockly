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

goog.provide('goog.net.XhrIoPoolTest');
goog.setTestOnly('goog.net.XhrIoPoolTest');

goog.require('goog.net.XhrIoPool');
goog.require('goog.structs.Map');
goog.require('goog.testing.jsunit');


var headers = new goog.structs.Map();
headers.set('X-Foo', 'Bar');


function testSetHeadersForNewPoolObjects() {
  var xhrIoPool = new goog.net.XhrIoPool(headers, 0);
  var xhrIo = xhrIoPool.getObject();

  assertEquals('Request should contain 1 header', 1, xhrIo.headers.getCount());
  assertTrue(
      'Request should contain right header key',
      xhrIo.headers.containsKey('X-Foo'));
  assertEquals(
      'Request should contain right header value', xhrIo.headers.get('X-Foo'),
      'Bar');

  xhrIoPool.releaseObject(xhrIo);
  goog.dispose(xhrIoPool);
}


function testSetHeadersForInitializedPoolObjects() {
  var xhrIoPool = new goog.net.XhrIoPool(headers, 1, 1);
  var xhrIo = xhrIoPool.getObject();

  assertEquals('Request should contain 1 header', 1, xhrIo.headers.getCount());
  assertTrue(
      'Request should contain right header key',
      xhrIo.headers.containsKey('X-Foo'));
  assertEquals(
      'Request should contain right header value', 'Bar',
      xhrIo.headers.get('X-Foo'));

  xhrIoPool.releaseObject(xhrIo);
  goog.dispose(xhrIoPool);
}


function testSetCredentials() {
  var xhrIoPool = new goog.net.XhrIoPool(
      undefined /* opt_headers */, undefined /* opt_minCount */,
      undefined /* opt_maxCount */, true /* opt_withCredentials */);
  var xhrIo = xhrIoPool.getObject();

  assertTrue(
      'withCredentials should be set on a request object',
      xhrIo.getWithCredentials());

  xhrIoPool.releaseObject(xhrIo);
  goog.dispose(xhrIoPool);
}
