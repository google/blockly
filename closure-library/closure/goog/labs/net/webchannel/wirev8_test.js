// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Unit tests for goog.labs.net.webChannel.WireV8.
 *
 */


goog.provide('goog.labs.net.webChannel.WireV8Test');

goog.require('goog.labs.net.webChannel.WireV8');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.labs.net.webChannel.WireV8Test');


var wireCodec;


function setUp() {
  wireCodec = new goog.labs.net.webChannel.WireV8();
}

function tearDown() {}


function testEncodeSimpleMessage() {
  // scalar types only
  var message = {a: 'a', b: 'b'};
  var buff = [];
  wireCodec.encodeMessage(message, buff, 'prefix_');
  assertEquals(2, buff.length);
  assertEquals('prefix_a=a', buff[0]);
  assertEquals('prefix_b=b', buff[1]);
}


function testEncodeComplexMessage() {
  var message = {a: 'a', b: {x: 1, y: 2}};
  var buff = [];
  wireCodec.encodeMessage(message, buff, 'prefix_');
  assertEquals(2, buff.length);
  assertEquals('prefix_a=a', buff[0]);
  // a round-trip URI codec
  assertEquals('prefix_b={\"x\":1,\"y\":2}', decodeURIComponent(buff[1]));
}


function testEncodeMessageQueue() {
  var message1 = {a: 'a'};
  var queuedMessage1 = {map: message1, mapId: 3};
  var message2 = {b: 'b'};
  var queuedMessage2 = {map: message2, mapId: 4};
  var queue = [queuedMessage1, queuedMessage2];
  var result = wireCodec.encodeMessageQueue(queue, 2, null);
  assertEquals('count=2&ofs=3&req0_a=a&req1_b=b', result);
}


function testDecodeMessage() {
  var message = wireCodec.decodeMessage('[{"a":"a", "x":1}, {"b":"b"}]');
  assertTrue(goog.isArray(message));
  assertEquals(2, message.length);
  assertEquals('a', message[0].a);
  assertEquals(1, message[0].x);
  assertEquals('b', message[1].b);
}
