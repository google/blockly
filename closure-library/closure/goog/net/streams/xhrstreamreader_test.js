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

goog.provide('goog.net.streams.XhrStreamReaderTest');
goog.setTestOnly('goog.net.streams.XhrStreamReaderTest');

goog.require('goog.net.ErrorCode');
goog.require('goog.net.XmlHttp');
goog.require('goog.net.streams.XhrStreamReader');
goog.require('goog.testing.asserts');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.net.XhrIo');


var xhrReader;

var xhrIo;

var Status = goog.net.streams.XhrStreamReader.Status;
var ReadyState = goog.net.XmlHttp.ReadyState;


function shouldRunTests() {
  return goog.net.streams.XhrStreamReader.isStreamingSupported();
}


function setUp() {
  xhrIo = new goog.testing.net.XhrIo();
  xhrIo.getResponseHeader = function() { return 'application/json'; };
}


function tearDown() {
  xhrIo = null;
}


function testContentType() {
  xhrReader = new goog.net.streams.XhrStreamReader(xhrIo);
  assertNotNull(xhrReader.getParserByContentType_());
}


function testXhrTimeout() {
  xhrReader = new goog.net.streams.XhrStreamReader(xhrIo);

  xhrIo.send('/test', null, 'GET', null, null, 1000, false);

  xhrIo.getLastErrorCode = function() { return goog.net.ErrorCode.TIMEOUT; };
  xhrIo.simulateReadyStateChange(ReadyState.COMPLETE);

  assertEquals(Status.TIMEOUT, xhrReader.getStatus());
}


// TODO: more mocked/networked tests, testing.xhrio not useful
