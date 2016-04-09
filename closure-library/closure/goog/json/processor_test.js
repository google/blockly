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

goog.provide('goog.json.processorTest');
goog.setTestOnly('goog.json.processorTest');

goog.require('goog.json.EvalJsonProcessor');
goog.require('goog.json.NativeJsonProcessor');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var SUPPORTS_NATIVE_JSON = false;

function setUpPage() {
  SUPPORTS_NATIVE_JSON = goog.global['JSON'] &&
      !(goog.userAgent.GECKO && !goog.userAgent.isVersionOrHigher('5.0'));
}

var REPLACER = function(k, v) {
  return !!k ? v + 'd' : v;
};

var REVIVER = function(k, v) {
  return !!k ? v.substring(0, v.length - 1) : v;
};

// Just sanity check parsing and stringifying.
// Thorough tests are in json_test.html.

function testJsParser() {
  var json = '{"a":1,"b":{"c":2}}';
  runParsingTest(new goog.json.EvalJsonProcessor(), json, json);
}

function testNativeParser() {
  if (!SUPPORTS_NATIVE_JSON) {
    return;
  }
  var json = '{"a":1,"b":{"c":2}}';
  runParsingTest(new goog.json.NativeJsonProcessor(), json, json);
}

function testJsParser_withReplacer() {
  runParsingTest(
      new goog.json.EvalJsonProcessor(REPLACER), '{"a":"foo","b":"goo"}',
      '{"a":"food","b":"good"}');
}

function testNativeParser_withReplacer() {
  if (!SUPPORTS_NATIVE_JSON) {
    return;
  }
  runParsingTest(
      new goog.json.NativeJsonProcessor(REPLACER), '{"a":"foo","b":"goo"}',
      '{"a":"food","b":"good"}');
}

function testNativeParser_withReviver() {
  if (!SUPPORTS_NATIVE_JSON) {
    return;
  }
  var json = '{"a":"fod","b":"god"}';
  runParsingTest(
      new goog.json.NativeJsonProcessor(REPLACER, REVIVER), json, json);
}

function testUnsafeJsParser() {
  var json = '{"a":1,"b":{"c":2}}';
  runParsingTest(new goog.json.EvalJsonProcessor(null, true), json, json);
}

function testUnsafeJsParser_withReplacer() {
  runParsingTest(
      new goog.json.EvalJsonProcessor(REPLACER, true), '{"a":"foo","b":"goo"}',
      '{"a":"food","b":"good"}');
}

function runParsingTest(parser, input, expected) {
  assertEquals(expected, parser.stringify(parser.parse(input)));
}
