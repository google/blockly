// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.format.JsonPrettyPrinterTest');
goog.setTestOnly('goog.format.JsonPrettyPrinterTest');

goog.require('goog.format.JsonPrettyPrinter');
goog.require('goog.testing.jsunit');

var formatter;


function setUp() {
  formatter = new goog.format.JsonPrettyPrinter();
}


function testUndefined() {
  assertEquals('', formatter.format());
}


function testNull() {
  assertEquals('', formatter.format(null));
}


function testBoolean() {
  assertEquals('true', formatter.format(true));
}


function testNumber() {
  assertEquals('1', formatter.format(1));
}


function testEmptyString() {
  assertEquals('', formatter.format(''));
}


function testWhitespaceString() {
  assertEquals('', formatter.format('   '));
}


function testString() {
  assertEquals('{}', formatter.format('{}'));
}


function testEmptyArray() {
  assertEquals('[]', formatter.format([]));
}


function testArrayOneElement() {
  assertEquals('[\n  1\n]', formatter.format([1]));
}


function testArrayMultipleElements() {
  assertEquals('[\n  1,\n  2,\n  3\n]', formatter.format([1, 2, 3]));
}


function testFunction() {
  assertEquals('{\n  "a": "1",\n  "b": ""\n}',
      formatter.format({'a': '1', 'b': function() { return null; }}));
}


function testObject() {
  assertEquals('{}', formatter.format({}));
}


function testObjectMultipleProperties() {
  assertEquals('{\n  "a": null,\n  "b": true,\n  "c": 1,\n  "d": "d",\n  "e":' +
      ' [\n    1,\n    2,\n    3\n  ],\n  "f": {\n    "g": 1,\n    "h": "h"\n' +
      '  }\n}',
      formatter.format({'a': null, 'b': true, 'c': 1, 'd': 'd', 'e': [1, 2, 3],
        'f': {'g': 1, 'h': 'h'}}));
}


function testHtmlDelimiters() {
  var htmlFormatter = new goog.format.JsonPrettyPrinter(
      new goog.format.JsonPrettyPrinter.HtmlDelimiters());
  assertEquals('{\n  <span class="goog-jsonprettyprinter-propertyname">"a"</s' +
      'pan>: <span class="goog-jsonprettyprinter-propertyvalue-number">1</spa' +
      'n>,\n  <span class="goog-jsonprettyprinter-propertyname">"b"</span>: <' +
      'span class="goog-jsonprettyprinter-propertyvalue-string">"2"</span>,\n' +
      '  <span class="goog-jsonprettyprinter-propertyname">"c"</span>: <span ' +
      'class="goog-jsonprettyprinter-propertyvalue-unknown">""</span>\n}',
      htmlFormatter.format({'a': 1, 'b': '2', 'c': function() {}}));
}
