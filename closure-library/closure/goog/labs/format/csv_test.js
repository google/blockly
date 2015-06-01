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

goog.provide('goog.labs.format.csvTest');

goog.require('goog.labs.format.csv');
goog.require('goog.labs.format.csv.ParseError');
goog.require('goog.object');
goog.require('goog.testing.asserts');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.labs.format.csvTest');


function testGoldenPath() {
  assertObjectEquals(
      [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']],
      goog.labs.format.csv.parse('a,b,c\nd,e,f\ng,h,i\n'));
  assertObjectEquals(
      [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']],
      goog.labs.format.csv.parse('a,b,c\r\nd,e,f\r\ng,h,i\r\n'));
}

function testNoCrlfAtEnd() {
  assertObjectEquals(
      [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']],
      goog.labs.format.csv.parse('a,b,c\nd,e,f\ng,h,i'));
}

function testQuotes() {
  assertObjectEquals(
      [['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i']],
      goog.labs.format.csv.parse('a,"b",c\n"d","e","f"\ng,h,"i"'));
  assertObjectEquals(
      [['a', 'b, as in boy', 'c'], ['d', 'e', 'f']],
      goog.labs.format.csv.parse('a,"b, as in boy",c\n"d","e","f"\n'));
}

function testEmbeddedCrlfs() {
  assertObjectEquals(
      [['a', 'b\nball', 'c'], ['d\nd', 'e', 'f'], ['g', 'h', 'i']],
      goog.labs.format.csv.parse('a,"b\nball",c\n"d\nd","e","f"\ng,h,"i"\n'));
}

function testEmbeddedQuotes() {
  assertObjectEquals(
      [['a', '"b"', 'Jonathan "Smokey" Feinberg'], ['d', 'e', 'f']],
      goog.labs.format.csv.parse(
          'a,"""b""","Jonathan ""Smokey"" Feinberg"\nd,e,f\r\n'));
}

function testUnclosedQuote() {
  var e = assertThrows(function() {
    goog.labs.format.csv.parse('a,"b,c\nd,e,f');
  });

  assertTrue(e instanceof goog.labs.format.csv.ParseError);
  assertEquals(2, e.position.line);
  assertEquals(5, e.position.column);
  assertEquals(
      'Unexpected end of text after open quote at line 2 column 5\n' +
      'd,e,f\n' +
      '    ^',
      e.message);
}

function testQuotesInUnquotedField() {
  var e = assertThrows(function() {
    goog.labs.format.csv.parse('a,b "and" b,c\nd,e,f');
  });

  assertTrue(e instanceof goog.labs.format.csv.ParseError);

  assertEquals(1, e.position.line);
  assertEquals(5, e.position.column);

  assertEquals(
      'Unexpected quote mark at line 1 column 5\n' +
      'a,b "and" b,c\n' +
      '    ^',
      e.message);
}

function testGarbageOutsideQuotes() {
  var e = assertThrows(function() {
    goog.labs.format.csv.parse('a,"b",c\nd,"e"oops,f');
  });

  assertTrue(e instanceof goog.labs.format.csv.ParseError);
  assertEquals(2, e.position.line);
  assertEquals(6, e.position.column);
  assertEquals(
      'Unexpected character "o" after quote mark at line 2 column 6\n' +
      'd,"e"oops,f\n' +
      '     ^',
      e.message);
}

function testEmptyRecords() {
  assertObjectEquals(
      [['a', '', 'c'], ['d', 'e', ''], ['', '', '']],
      goog.labs.format.csv.parse('a,,c\r\nd,e,\n,,'));
}

function testIgnoringErrors() {
  // The results of these tests are not defined by the RFC. They
  // generally strive to be "reasonable" while keeping the code simple.

  // Quotes inside field
  assertObjectEquals(
      [['Hello "World"!', 'b'], ['c', 'd']], goog.labs.format.csv.parse(
          'Hello "World"!,b\nc,d', true));

  // Missing closing quote
  assertObjectEquals(
      [['Hello', 'World!']], goog.labs.format.csv.parse(
          'Hello,"World!', true));

  // Broken use of quotes in quoted field
  assertObjectEquals(
      [['a', '"Hello"World!"']], goog.labs.format.csv.parse(
          'a,"Hello"World!"', true));

  // All of the above. A real mess.
  assertObjectEquals(
      [['This" is', '"very\n\tvery"broken"', ' indeed!']],
      goog.labs.format.csv.parse(
          'This" is,"very\n\tvery"broken"," indeed!', true));
}

function testIgnoringErrorsTrailingTabs() {
  assertObjectEquals(
      [['"a\tb"\t'], ['c,d']], goog.labs.format.csv.parse(
          '"a\tb"\t\n"c,d"', true));
}

function testFindLineInfo() {
  var testString = 'abc\ndef\rghi';
  var info = goog.labs.format.csv.ParseError.findLineInfo_(testString, 4);

  assertEquals(4, info.line.startLineIndex);
  assertEquals(7, info.line.endContentIndex);
  assertEquals(8, info.line.endLineIndex);

  assertEquals(1, info.lineIndex);
}

function testGetLineDebugString() {
  var str = 'abcdefghijklmnop';
  var index = str.indexOf('j');
  var column = index + 1;
  assertEquals(
      goog.labs.format.csv.ParseError.getLineDebugString_(str, column),
      'abcdefghijklmnop\n' +
      '         ^');

}

function testIsCharacterString() {
  assertTrue(goog.labs.format.csv.isCharacterString_('a'));
  assertTrue(goog.labs.format.csv.isCharacterString_('\n'));
  assertTrue(goog.labs.format.csv.isCharacterString_(' '));

  assertFalse(goog.labs.format.csv.isCharacterString_(null));
  assertFalse(goog.labs.format.csv.isCharacterString_('  '));
  assertFalse(goog.labs.format.csv.isCharacterString_(''));
  assertFalse(goog.labs.format.csv.isCharacterString_('aa'));
}


function testAssertToken() {
  goog.labs.format.csv.assertToken_('a');

  goog.object.forEach(goog.labs.format.csv.SENTINELS_,
      function(value) {
        goog.labs.format.csv.assertToken_(value);
      });

  assertThrows(function() {
    goog.labs.format.csv.assertToken_('aa');
  });

  assertThrows(function() {
    goog.labs.format.csv.assertToken_('');
  });

  assertThrows(function() {
    goog.labs.format.csv.assertToken_({});
  });
}
