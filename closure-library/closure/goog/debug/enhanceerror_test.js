// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.debugEnhanceErrorTest');
goog.setTestOnly('goog.debugEnhanceErrorTest');

goog.require('goog.debug');
goog.require('goog.testing.jsunit');

var THROW_STRING = 1;
var THROW_NPE = 2;
var THROW_ERROR = 3;
var THROW_ENHANCED_ERROR = 4;
var THROW_ENHANCED_STRING = 5;

if (typeof debug == 'undefined') {
  function debug(str) {
    if (window.console) window.console.log(str);
  }
}

function testEnhanceError() {
  // Tests are like this:
  // [test num, expect something in the stack, expect an extra message]
  var tests = [
    [THROW_STRING], [THROW_NPE], [THROW_ERROR],
    [THROW_ENHANCED_ERROR, 'throwEnhancedError', 'an enhanced error'],
    [THROW_ENHANCED_STRING, 'throwEnhancedString']
  ];
  for (var i = 0; i < tests.length; ++i) {
    var test = tests[i];
    var testNum = test[0];
    var testInStack = test[1];
    var testExtraMessage = test[2] || null;
    try {
      foo(testNum);
    } catch (e) {
      debug(goog.debug.expose(e));
      var s = e.stack.split('\n');
      for (var j = 0; j < s.length; ++j) {
        debug(s[j]);
      }
      // 'baz' is always in the stack
      assertTrue('stack should contain "baz"', e.stack.indexOf('baz') != -1);

      if (testInStack) {
        assertTrue(
            'stack should contain "' + testInStack + '"',
            e.stack.indexOf(testInStack) != -1);
      }
      if (testExtraMessage) {
        // 2 messages
        assertTrue(
            'message0 should contain "' + testExtraMessage + '"',
            e.message0.indexOf(testExtraMessage) != -1);
        assertTrue(
            'message1 should contain "message from baz"',
            e.message1.indexOf('message from baz') != -1);
      } else {
        // 1 message
        assertTrue(
            'message0 should contain "message from baz"',
            e.message0.indexOf('message from baz') != -1);
      }
      continue;
    }
    fail('expected to catch an exception');
  }
}


function foo(testNum) {
  bar(testNum);
}

function bar(testNum) {
  baz(testNum);
}

function baz(testNum) {
  try {
    switch (testNum) {
      case THROW_STRING:
        throwString();
        break;
      case THROW_NPE:
        throwNpe();
        break;
      case THROW_ERROR:
        throwError();
        break;
      case THROW_ENHANCED_ERROR:
        throwEnhancedError();
        break;
      case THROW_ENHANCED_STRING:
        throwEnhancedString();
        break;
    }
  } catch (e) {
    throw goog.debug.enhanceError(e, 'message from baz');
  }
}

function throwString() {
  throw 'a string';
}

function throwNpe() {
  var nada = null;
  nada.noSuchFunction();
}

function throwError() {
  throw Error('an error');
}

function throwEnhancedError() {
  throw goog.debug.enhanceError(Error('dang!'), 'an enhanced error');
}

function throwEnhancedString() {
  throw goog.debug.enhanceError('oh nos!');
}
