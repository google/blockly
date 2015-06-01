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

goog.provide('goog.debugTest');
goog.setTestOnly('goog.debugTest');

goog.require('goog.debug');
goog.require('goog.html.SafeHtml');
goog.require('goog.structs.Set');
goog.require('goog.testing.jsunit');

function testExposeException() {
  var expected =
      'Message: message&quot;<br>' +
      'Url: <a href="view-source:http://fileName%22" ' +
          'target="_new">http://fileName&quot;</a><br>' +
      'Line: lineNumber&quot;<br><br>' +
      'Browser stack:<br>' +
      'stack&quot;-&gt; [end]';
  var error = {
    message: 'message"',
    fileName: 'http://fileName"',
    lineNumber: 'lineNumber"',
    stack: 'stack"'
  };
  var actualHtml = goog.debug.exposeExceptionAsHtml(error);
  var actual = goog.html.SafeHtml.unwrap(actualHtml);
  actual = actual.substring(0, expected.length);
  assertEquals(expected, actual);
}

function testMakeWhitespaceVisible() {
  assertEquals(
      'Hello[_][_]World![r][n]\n' +
      '[r][n]\n' +
      '[f][f]I[_]am[t][t]here![r][n]\n',
      goog.debug.makeWhitespaceVisible(
          'Hello  World!\r\n\r\n\f\fI am\t\there!\r\n'));
}

function testGetFunctionName() {
  // Trivial resolver that matches just a few names: a static function, a
  // constructor, and a member function.
  var resolver = function(f) {
    if (f === goog.debug.getFunctionName) {
      return 'goog.debug.getFunctionName';
    } else if (f === goog.structs.Set) {
      return 'goog.structs.Set';
    } else if (f === goog.structs.Set.prototype.getCount) {
      return 'goog.structs.Set.getCount';
    } else {
      return null;
    }
  };
  goog.debug.setFunctionResolver(resolver);

  assertEquals(
      'goog.debug.getFunctionName',
      goog.debug.getFunctionName(goog.debug.getFunctionName));
  assertEquals(
      'goog.structs.Set',
      goog.debug.getFunctionName(goog.structs.Set));
  var set = new goog.structs.Set();
  assertEquals(
      'goog.structs.Set.getCount',
      goog.debug.getFunctionName(set.getCount));

  // This function is matched by the fallback heuristic.
  assertEquals(
      'testGetFunctionName',
      goog.debug.getFunctionName(testGetFunctionName));

  goog.debug.setFunctionResolver(null);
}


/**
 * Asserts that a substring can be found in a specified text string.
 *
 * @param {string} substring The substring to search for.
 * @param {string} text The text string to search within.
 */
function assertContainsSubstring(substring, text) {
  assertNotEquals('Could not find "' + substring + '" in "' + text + '"',
      -1, text.search(substring));
}


function testDeepExpose() {
  var a = {};
  var b = {};
  a.ancestor = a;
  a.otherObject = b;
  a.otherObjectAgain = b;

  var deepExpose = goog.debug.deepExpose(a);

  assertContainsSubstring('ancestor = ... reference loop detected ...',
                          deepExpose);

  assertContainsSubstring('otherObjectAgain = {', deepExpose);
}
