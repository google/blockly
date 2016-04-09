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

goog.provide('goog.net.streams.JsonStreamParserTest');
goog.setTestOnly('goog.net.streams.JsonStreamParserTest');

goog.require('goog.array');
goog.require('goog.json');
goog.require('goog.labs.testing.JsonFuzzing');
goog.require('goog.net.streams.JsonStreamParser');
goog.require('goog.testing.asserts');
goog.require('goog.testing.jsunit');
goog.require('goog.uri.utils');


var debug;


function setUp() {
  var uri = window.document.URL;
  if (uri) {
    var debugFlag = goog.uri.utils.getParamValue(uri, 'debug');
    if (debugFlag) {
      debug = window.document.getElementById('debug');
    }
  }
}


/**
 * Debug is enabled with "&debug=on" on the URL.
 *
 * @param {string} info The debug info
 */
function print(info) {
  if (debug) {
    debug.innerHTML += '<p><p>' + info;
  }
}

function testEmptyStream() {
  var parser = new goog.net.streams.JsonStreamParser();
  var result = parser.parse('[]');
  assertNull(result);
}

function testEmptyStreamMore() {
  var parser = new goog.net.streams.JsonStreamParser();
  var result = parser.parse('  [   ]  ');
  assertNull(result);

  parser = new goog.net.streams.JsonStreamParser();
  result = parser.parse('  [   ');
  assertNull(result);

  result = parser.parse('  ]   ');
  assertNull(result);

  parser = new goog.net.streams.JsonStreamParser();
  assertThrows(function() { parser.parse(' a [   '); });

  parser = new goog.net.streams.JsonStreamParser();
  parser.parse(' [   ');
  assertThrows(function() { parser.parse(' ]  a   '); });
}

function testSingleMessage() {
  var parser = new goog.net.streams.JsonStreamParser();
  var result = parser.parse('[{"a" : "b"}]');
  assertEquals(1, result.length);
  assertEquals('b', result[0].a);
}

function testEnclosingArray() {
  var parser = new goog.net.streams.JsonStreamParser();
  var result = parser.parse('[\n');
  assertNull(result);

  result = parser.parse('{"a" : "b"}');
  assertEquals(1, result.length);
  assertEquals('b', result[0].a);

  result = parser.parse('\n]');
  assertNull(result);
}

function testSingleMessageInChunks() {
  var parser = new goog.net.streams.JsonStreamParser();
  var result = parser.parse('[{"a" : ');
  assertNull(result);
  result = parser.parse('"b"}]');
  assertEquals(1, result.length);
  assertEquals('b', result[0].a);

  parser = new goog.net.streams.JsonStreamParser();
  result = parser.parse('[ {  "a" : ');
  assertNull(result);
  result = parser.parse('"b"} ');
  assertEquals(1, result.length);
  assertEquals('b', result[0].a);

  result = parser.parse('] ');
  assertNull(result);
}

function testTwoMessages() {
  var parser = new goog.net.streams.JsonStreamParser();
  var result = parser.parse('[{"a" : "b"}, {"c" : "d"}]');
  assertEquals(2, result.length);
  assertEquals('b', result[0].a);
  assertEquals('d', result[1].c);
}

function testTwoMessagesInChunks() {
  var parser = new goog.net.streams.JsonStreamParser();
  var result = parser.parse('[{"a" : "b"}, ');
  assertEquals(1, result.length);
  assertEquals('b', result[0].a);
  result = parser.parse('{"c" : "d"} ');
  assertEquals(1, result.length);
  assertEquals('d', result[0].c);
  result = parser.parse('] ');
  assertNull(result);
  assertThrows(function() { parser.parse('  a   '); });
}


/**
 * Parse a fuzzy json string only once.
 */
function testSingleFuzzyMessages() {
  var fuzzing = new goog.labs.testing.JsonFuzzing();

  // total # of tests
  for (var i = 0; i < 5; i++) {
    var data = fuzzing.newArray();
    var dataString = goog.json.serialize(data);
    var parser = new goog.net.streams.JsonStreamParser();
    var result = parser.parse(dataString);

    assertEquals(data.length, result.length);
    goog.array.forEach(data, function(elm, index) {
      assertNotNull(elm);
      assertObjectEquals(dataString, elm, result[index]);
    });
  }
}


/**
 * Parse a fuzzy json string split (in two chunks) at each index of the string.
 *
 * This is a VERY expensive test, so change the fuzzing options for manual runs
 * as required.
 */
function testChunkedFuzzyMessages() {
  var options = {jsonSize: 5, numFields: 5, arraySize: 4, maxDepth: 3};
  var fuzzing = new goog.labs.testing.JsonFuzzing(options);

  var data = fuzzing.newArray();
  var dataString = goog.json.serialize(data);

  print(dataString);

  for (var j = 1; j < dataString.length; j++) {
    var parser = new goog.net.streams.JsonStreamParser();
    var result = [];

    var string1 = dataString.substring(0, j);

    var parsed = parser.parse(string1);
    if (parsed) {
      result = goog.array.concat(result, parsed);
    }

    var string2 = dataString.substring(j);

    parsed = parser.parse(string2);
    if (parsed) {
      result = goog.array.concat(result, parsed);
    }

    assertEquals(data.length, result.length);
    goog.array.forEach(data, function(elm, index) {
      assertObjectEquals(dataString, elm, result[index]);
    });
  }
}


/**
 * Parse a fuzzy json string in randomly generated chunks.
 */
function testRandomlyChunkedFuzzyMessages() {
  var fuzzing = new goog.labs.testing.JsonFuzzing();

  var data = fuzzing.newArray();
  var dataString = goog.json.serialize(data);

  var parser = new goog.net.streams.JsonStreamParser();

  var result = [];

  print(dataString);

  // randomly generated chunks
  var pos = 0;
  while (pos < dataString.length) {
    var num = fuzzing.nextInt(1, dataString.length - pos);
    var next = pos + num;
    var subString = dataString.substring(pos, next);

    print(subString);

    pos = next;
    var parsed = parser.parse(subString);
    if (parsed) {
      result = goog.array.concat(result, parsed);
    }
  }

  assertEquals(data.length, result.length);
  goog.array.forEach(data, function(elm, index) {
    assertObjectEquals(dataString + '\n@' + index, elm, result[index]);
  });
}
