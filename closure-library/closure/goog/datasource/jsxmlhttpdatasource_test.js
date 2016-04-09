// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ds.JsXmlHttpDataSourceTest');
goog.setTestOnly('goog.ds.JsXmlHttpDataSourceTest');

goog.require('goog.ds.JsXmlHttpDataSource');
goog.require('goog.testing.TestQueue');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.net.XhrIo');

var TEXT_PREFIX = null;
var TEXT_POSTFIX = null;

var INDEX_OF_URI_ENTRY = 1;
var INDEX_OF_CONTENT_ENTRY = 3;

function setUp() {}

function tearDown() {}

function testLoad_WithPostAndQueryDataSet() {
  var USE_POST = true;
  var dataSource = new goog.ds.JsXmlHttpDataSource(
      'uri', 'namne', TEXT_PREFIX, TEXT_POSTFIX, USE_POST);

  var testQueue = new goog.testing.TestQueue();
  dataSource.xhr_ = new goog.testing.net.XhrIo(testQueue);

  var expectedContent = 'Some test content';
  dataSource.setQueryData(expectedContent);
  dataSource.load();

  assertFalse(testQueue.isEmpty());

  var actualRequest = testQueue.dequeue();
  assertEquals(expectedContent, actualRequest[INDEX_OF_CONTENT_ENTRY]);
  assertTrue(testQueue.isEmpty());
}

function testLoad_WithPostAndNoQueryDataSet() {
  var USE_POST = true;
  var dataSource = new goog.ds.JsXmlHttpDataSource(
      'uri?a=1&b=2', 'namne', TEXT_PREFIX, TEXT_POSTFIX, USE_POST);

  var testQueue = new goog.testing.TestQueue();
  dataSource.xhr_ = new goog.testing.net.XhrIo(testQueue);

  dataSource.load();

  assertFalse(testQueue.isEmpty());

  var actualRequest = testQueue.dequeue();
  assertEquals('a=1&b=2', actualRequest[INDEX_OF_CONTENT_ENTRY].toString());
  assertTrue(testQueue.isEmpty());
}

function testLoad_WithGet() {
  var USE_GET = false;
  var expectedUri = 'uri?a=1&b=2';
  var dataSource = new goog.ds.JsXmlHttpDataSource(
      expectedUri, 'namne', TEXT_PREFIX, TEXT_POSTFIX, USE_GET);

  var testQueue = new goog.testing.TestQueue();
  dataSource.xhr_ = new goog.testing.net.XhrIo(testQueue);

  dataSource.load();

  assertFalse(testQueue.isEmpty());

  var actualRequest = testQueue.dequeue();
  assertEquals(expectedUri, actualRequest[INDEX_OF_URI_ENTRY].toString());
  assertTrue(testQueue.isEmpty());
}
