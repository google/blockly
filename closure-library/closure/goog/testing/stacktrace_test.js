// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.testing.stacktraceTest');
goog.setTestOnly('goog.testing.stacktraceTest');

goog.require('goog.functions');
goog.require('goog.string');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.StrictMock');
goog.require('goog.testing.asserts');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.stacktrace');
goog.require('goog.testing.stacktrace.Frame');
goog.require('goog.userAgent');

var stubs = new goog.testing.PropertyReplacer();
var expectedFailures;
function setUpPage() {
  expectedFailures = new goog.testing.ExpectedFailures();
}

function setUp() {
  stubs.set(goog.testing.stacktrace, 'isClosureInspectorActive_', function() {
    return false;
  });
}

function tearDown() {
  stubs.reset();
  expectedFailures.handleTearDown();
}

function testParseStackFrameInV8() {
  var frameString = '    at Error (unknown source)';
  var frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  var expected = new goog.testing.stacktrace.Frame('', 'Error', '', '');
  assertObjectEquals('exception name only', expected, frame);

  frameString = '    at Object.assert (file:///.../asserts.js:29:10)';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected = new goog.testing.stacktrace.Frame(
      'Object', 'assert', '', 'file:///.../asserts.js:29:10');
  assertObjectEquals('context object + function name + url', expected, frame);

  frameString = '    at Object.x.y.z (/Users/bob/file.js:564:9)';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected = new goog.testing.stacktrace.Frame(
      'Object.x.y', 'z', '', '/Users/bob/file.js:564:9');
  assertObjectEquals(
      'nested context object + function name + url', expected, frame);

  frameString = '    at http://www.example.com/jsunit.js:117:13';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected = new goog.testing.stacktrace.Frame(
      '', '', '', 'http://www.example.com/jsunit.js:117:13');
  assertObjectEquals('url only', expected, frame);

  frameString = '    at [object Object].exec [as execute] (file:///foo)';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected = new goog.testing.stacktrace.Frame(
      '[object Object]', 'exec', 'execute', 'file:///foo');
  assertObjectEquals('function alias', expected, frame);

  frameString = '    at new Class (file:///foo)';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected =
      new goog.testing.stacktrace.Frame('', 'new Class', '', 'file:///foo');
  assertObjectEquals('constructor call', expected, frame);

  frameString = '    at new <anonymous> (file:///foo)';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected = new goog.testing.stacktrace.Frame(
      '', 'new <anonymous>', '', 'file:///foo');
  assertObjectEquals('anonymous constructor call', expected, frame);

  frameString = '    at Array.forEach (native)';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected = new goog.testing.stacktrace.Frame('Array', 'forEach', '', '');
  assertObjectEquals('native function call', expected, frame);

  frameString = '    at foo (eval at file://bar)';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected =
      new goog.testing.stacktrace.Frame('', 'foo', '', 'eval at file://bar');
  assertObjectEquals('eval', expected, frame);

  frameString = '    at foo.bar (closure/goog/foo.js:11:99)';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected = new goog.testing.stacktrace.Frame(
      'foo', 'bar', '', 'closure/goog/foo.js:11:99');
  assertObjectEquals('Path without schema', expected, frame);

  // In the Chrome console, execute: console.log(eval('Error().stack')).
  frameString =
      '    at eval (eval at <anonymous> (unknown source), <anonymous>:1:1)';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected = new goog.testing.stacktrace.Frame(
      '', 'eval', '', 'eval at <anonymous> (unknown source), <anonymous>:1:1');
  assertObjectEquals('nested eval', expected, frame);
}

function testParseStackFrameInOpera() {
  var frameString = '@';
  var frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  var expected = new goog.testing.stacktrace.Frame('', '', '', '');
  assertObjectEquals('empty frame', expected, frame);

  frameString = '@javascript:console.log(Error().stack):1';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected = new goog.testing.stacktrace.Frame(
      '', '', '', 'javascript:console.log(Error().stack):1');
  assertObjectEquals('javascript path only', expected, frame);

  frameString = '@file:///foo:42';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected = new goog.testing.stacktrace.Frame('', '', '', 'file:///foo:42');
  assertObjectEquals('path only', expected, frame);

  // (function go() { throw Error() })()
  // var c = go; c()
  frameString = 'go([arguments not available])@';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected = new goog.testing.stacktrace.Frame('', 'go', '', '');
  assertObjectEquals('name and empty path', expected, frame);

  frameString = 'go([arguments not available])@file:///foo:42';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected = new goog.testing.stacktrace.Frame('', 'go', '', 'file:///foo:42');
  assertObjectEquals('name and path', expected, frame);

  // (function() { throw Error() })()
  frameString =
      '<anonymous function>([arguments not available])@file:///foo:42';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected = new goog.testing.stacktrace.Frame('', '', '', 'file:///foo:42');
  assertObjectEquals('anonymous function', expected, frame);

  // var b = {foo: function() { throw Error() }}
  frameString = '<anonymous function: foo>()@file:///foo:42';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected = new goog.testing.stacktrace.Frame('', 'foo', '', 'file:///foo:42');
  assertObjectEquals('object literal function', expected, frame);

  // var c = {}; c.foo = function() { throw Error() }
  frameString = '<anonymous function: c.foo>()@file:///foo:42';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected =
      new goog.testing.stacktrace.Frame('c', 'foo', '', 'file:///foo:42');
  assertObjectEquals('named object literal function', expected, frame);

  frameString = '<anonymous function: Foo.prototype.bar>()@';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected = new goog.testing.stacktrace.Frame('Foo.prototype', 'bar', '', '');
  assertObjectEquals('prototype function', expected, frame);

  frameString = '<anonymous function: goog.Foo.prototype.bar>()@';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected =
      new goog.testing.stacktrace.Frame('goog.Foo.prototype', 'bar', '', '');
  assertObjectEquals('namespaced prototype function', expected, frame);
}

// All test strings are parsed with the conventional and long
// frame algorithms.
function testParseStackFrameInFirefox() {
  var frameString = 'Error("Assertion failed")@:0';
  var frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  var expected = new goog.testing.stacktrace.Frame('', 'Error', '', '');
  assertObjectEquals('function name + arguments', expected, frame);

  frameString = '()@file:///foo:42';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected = new goog.testing.stacktrace.Frame('', '', '', 'file:///foo:42');
  assertObjectEquals('anonymous function', expected, frame);

  frameString = '@javascript:alert(0)';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected =
      new goog.testing.stacktrace.Frame('', '', '', 'javascript:alert(0)');
  assertObjectEquals('anonymous function', expected, frame);
}

// All test strings are parsed with the conventional and long
// frame algorithms.
function testParseStackFrameInFirefoxWithQualifiedName() {
  var frameString = 'ns.method@http://some.thing/a.js:1:2';
  var frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  var expected = new goog.testing.stacktrace.Frame(
      '', 'ns.method', '', 'http://some.thing/a.js:1:2');
  assertObjectEquals('anonymous function', expected, frame);
}

function testCanonicalizeFrame() {
  var frame = new goog.testing.stacktrace.Frame(
      '<window>', 'foo', 'bar', 'http://x?a=1&b=2:1');
  assertEquals(
      'canonical stack frame, everything is escaped', '&lt;window&gt;.foo ' +
          '[as bar] at http://x?a=1&amp;b=2:1',
      frame.toCanonicalString());
}

function testDeobfuscateFunctionName() {
  goog.testing.stacktrace.setDeobfuscateFunctionName(function(name) {
    return name.replace(/\$/g, '.');
  });

  var frame = new goog.testing.stacktrace.Frame('', 'a$b$c', 'd$e', '');
  assertEquals(
      'deobfuscated function name', 'a.b.c [as d.e]',
      frame.toCanonicalString());
}

function testFramesToString() {
  var normalFrame = new goog.testing.stacktrace.Frame('', 'foo', '', '');
  var anonFrame = new goog.testing.stacktrace.Frame('', '', '', '');
  var frames = [normalFrame, anonFrame, null, anonFrame];
  var stack = goog.testing.stacktrace.framesToString_(frames);
  assertEquals('framesToString', '> foo\n> anonymous\n> (unknown)\n', stack);
}

function testFollowCallChain() {
  var func = function(var_args) {
    return goog.testing.stacktrace.followCallChain_();
  };

  // Created a fake type with a toString method.
  function LocalType(){};
  LocalType.prototype.toString = function() { return 'sg'; };

  // Create a mock with no expectations.
  var mock = new goog.testing.StrictMock(LocalType);

  mock.$replay();

  var frames = func(
      undefined, null, false, 0, '', {}, goog.nullFunction, mock,
      new LocalType);

  // Opera before version 10 doesn't support the caller attribute. In that
  // browser followCallChain_() returns empty stack trace.
  expectedFailures.expectFailureFor(
      goog.userAgent.OPERA && !goog.userAgent.isVersionOrHigher('10'));
  try {
    assertTrue('The stack trace consists of >=2 frames', frames.length >= 2);
  } catch (e) {
    expectedFailures.handleException(e);
  }

  if (frames.length >= 2) {
    assertEquals('innermost function is anonymous', '', frames[0].getName());
    // There are white space differences how browsers convert functions to
    // strings.
    assertEquals(
        'test function name', 'testFollowCallChain', frames[1].getName());
  }

  mock.$verify();
}

// Create a stack trace string with one modest record and one long record,
// Verify that all frames are parsed. The length of the long arg is set
// to blow Firefox 3x's stack if put through a RegExp.
function testParsingLongStackTrace() {
  var longArg =
      goog.string.buildString('(', goog.string.repeat('x', 1000000), ')');
  var stackTrace = goog.string.buildString(
      'shortFrame()@:0\n', 'longFrame', longArg,
      '@http://google.com/somescript:0\n');
  var frames = goog.testing.stacktrace.parse_(stackTrace);
  assertEquals('number of returned frames', 2, frames.length);
  var expected = new goog.testing.stacktrace.Frame('', 'shortFrame', '', '');
  assertObjectEquals('short frame', expected, frames[0]);

  assertNull('exception no frame', frames[1]);
}

function testParseStackFrameInIE10() {
  var frameString = '   at foo (http://bar:4000/bar.js:150:3)';
  var frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  var expected = new goog.testing.stacktrace.Frame(
      '', 'foo', '', 'http://bar:4000/bar.js:150:3');
  assertObjectEquals('name and path', expected, frame);

  frameString = '   at Anonymous function (http://bar:4000/bar.js:150:3)';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected = new goog.testing.stacktrace.Frame(
      '', 'Anonymous function', '', 'http://bar:4000/bar.js:150:3');
  assertObjectEquals('Anonymous function', expected, frame);

  frameString = '   at Global code (http://bar:4000/bar.js:150:3)';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected = new goog.testing.stacktrace.Frame(
      '', 'Global code', '', 'http://bar:4000/bar.js:150:3');
  assertObjectEquals('Global code', expected, frame);

  frameString = '   at foo (eval code:150:3)';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected =
      new goog.testing.stacktrace.Frame('', 'foo', '', 'eval code:150:3');
  assertObjectEquals('eval code', expected, frame);

  frameString = '   at eval code (eval code:150:3)';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected =
      new goog.testing.stacktrace.Frame('', 'eval code', '', 'eval code:150:3');
  assertObjectEquals('nested eval', expected, frame);
}

function testParseStackFrameInEdge() {
  frameString = '   at a.b.c (http://host.com:80/some/file.js:101:2)';
  frame = goog.testing.stacktrace.parseStackFrame_(frameString);
  expected = new goog.testing.stacktrace.Frame(
      '', 'a.b.c', '', 'http://host.com:80/some/file.js:101:2');
  assertObjectEquals(expected, frame);
}

// Verifies that retrieving the stack trace works when the 'stack' field of an
// exception contains an array of CallSites instead of a string. This is the
// case when running in a lightweight V8 runtime (for instance, in gjstests),
// as opposed to a browser environment.
function testGetStackFrameWithV8CallSites() {
  // A function to create V8 CallSites. Note that CallSite is an extern and thus
  // cannot be mocked with closure mocks.
  function createCallSite(functionName, fileName, lineNumber, colNumber) {
    return {
      getFunctionName: goog.functions.constant(functionName),
      getFileName: goog.functions.constant(fileName),
      getLineNumber: goog.functions.constant(lineNumber),
      getColumnNumber: goog.functions.constant(colNumber)
    };
  }

  // Mock the goog.testing.stacktrace.getStack_ function, which normally
  // triggers an exception for the purpose of reading and returning its stack
  // trace. Here, pretend that V8 provided an array of CallSites instead of the
  // string that browsers provide.
  stubs.set(goog.testing.stacktrace, 'getNativeStack_', function() {
    return [
      createCallSite('fn1', 'file1', 1, 2),
      createCallSite('fn2', 'file2', 3, 4), createCallSite('fn3', 'file3', 5, 6)
    ];
  });

  // Retrieve the stacktrace. This should translate the array of CallSites into
  // a single multi-line string.
  var stackTrace = goog.testing.stacktrace.get();

  // Make sure the stack trace was translated correctly.
  var frames = stackTrace.split('\n');
  assertEquals(frames[0], '> fn1 at file1:1:2');
  assertEquals(frames[1], '> fn2 at file2:3:4');
  assertEquals(frames[2], '> fn3 at file3:5:6');
}
