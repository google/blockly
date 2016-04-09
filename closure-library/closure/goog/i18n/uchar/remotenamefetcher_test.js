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


goog.provide('goog.i18n.uChar.RemoteNameFetcherTest');
goog.setTestOnly('goog.i18n.uChar.RemoteNameFetcherTest');

goog.require('goog.i18n.uChar.RemoteNameFetcher');
goog.require('goog.net.XhrIo');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.net.XhrIo');
goog.require('goog.testing.recordFunction');

var nameFetcher = null;

function setUp() {
  goog.net.XhrIo = goog.testing.net.XhrIo;
  nameFetcher = new goog.i18n.uChar.RemoteNameFetcher('http://www.example.com');
}

function tearDown() {
  nameFetcher.dispose();
}

function testGetName_remote() {
  var callback = goog.testing.recordFunction(function(name) {
    assertEquals('Latin Capital Letter P', name);
    assertTrue(nameFetcher.charNames_.containsKey('50'));
  });
  nameFetcher.getName('P', callback);
  var responseJsonText = '{"50":{"name":"Latin Capital Letter P"}}';
  nameFetcher.getNameXhrIo_.simulateResponse(200, responseJsonText);
  assertEquals(1, callback.getCallCount());
}

function testGetName_existing() {
  nameFetcher.charNames_.set('1049d', 'OSYMANYA LETTER OO');
  var callback = goog.testing.recordFunction(function(name) {
    assertEquals('OSYMANYA LETTER OO', name);
  });
  nameFetcher.getName('\uD801\uDC9D', callback);
  assertEquals(1, callback.getCallCount());
}

function testGetName_fail() {
  var callback =
      goog.testing.recordFunction(function(name) { assertNull(name); });
  nameFetcher.getName('\uD801\uDC9D', callback);
  assertEquals(
      'http://www.example.com?c=1049d&p=name',
      nameFetcher.getNameXhrIo_.getLastUri().toString());
  nameFetcher.getNameXhrIo_.simulateResponse(400);
  assertEquals(1, callback.getCallCount());
}

function testGetName_abort() {
  var callback1 =
      goog.testing.recordFunction(function(name) { assertNull(name); });
  nameFetcher.getName('I', callback1);
  var callback2 = goog.testing.recordFunction(function(name) {
    assertEquals(name, 'LATIN SMALL LETTER Y');
  });
  nameFetcher.getName('ÿ', callback2);
  assertEquals(
      'http://www.example.com?c=ff&p=name',
      nameFetcher.getNameXhrIo_.getLastUri().toString());
  var responseJsonText = '{"ff":{"name":"LATIN SMALL LETTER Y"}}';
  nameFetcher.getNameXhrIo_.simulateResponse(200, responseJsonText);
  assertEquals(1, callback1.getCallCount());
  assertEquals(1, callback2.getCallCount());
}

function testPrefetch() {
  nameFetcher.prefetch('ÿI\uD801\uDC9D');
  assertEquals(
      'http://www.example.com?b88=%C3%BFI%F0%90%92%9D&p=name',
      nameFetcher.prefetchXhrIo_.getLastUri().toString());

  var responseJsonText = '{"ff":{"name":"LATIN SMALL LETTER Y"},"49":{' +
      '"name":"LATIN CAPITAL LETTER I"}, "1049d":{"name":"OSMYANA OO"}}';
  nameFetcher.prefetchXhrIo_.simulateResponse(200, responseJsonText);

  assertEquals(3, nameFetcher.charNames_.getCount());
  assertEquals('LATIN SMALL LETTER Y', nameFetcher.charNames_.get('ff'));
  assertEquals('LATIN CAPITAL LETTER I', nameFetcher.charNames_.get('49'));
  assertEquals('OSMYANA OO', nameFetcher.charNames_.get('1049d'));
}

function testPrefetch_abort() {
  nameFetcher.prefetch('I\uD801\uDC9D');
  nameFetcher.prefetch('ÿ');
  assertEquals(
      'http://www.example.com?b88=%C3%BF&p=name',
      nameFetcher.prefetchXhrIo_.getLastUri().toString());
}

function testIsNameAvailable() {
  assertTrue(nameFetcher.isNameAvailable('a'));
}
