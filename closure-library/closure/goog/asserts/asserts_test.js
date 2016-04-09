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

goog.provide('goog.assertsTest');
goog.setTestOnly('goog.assertsTest');

goog.require('goog.asserts');
goog.require('goog.asserts.AssertionError');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.string');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

function doTestMessage(failFunc, expectedMsg) {
  var error = assertThrows('failFunc should throw.', failFunc);
  // Test error message.
  // Opera 10 adds cruft to the end of the message, so do a startsWith check.
  assertTrue(
      'Message check failed. Expected: ' + expectedMsg + ' Actual: ' +
          error.message,
      goog.string.startsWith(error.message, expectedMsg));
}

function testAssert() {
  // None of them may throw exception
  goog.asserts.assert(true);
  goog.asserts.assert(1);
  goog.asserts.assert([]);
  goog.asserts.assert({});

  assertThrows('assert(false)', goog.partial(goog.asserts.assert, false));
  assertThrows('assert(0)', goog.partial(goog.asserts.assert, 0));
  assertThrows('assert(null)', goog.partial(goog.asserts.assert, null));
  assertThrows(
      'assert(undefined)', goog.partial(goog.asserts.assert, undefined));

  // Test error messages.
  doTestMessage(goog.partial(goog.asserts.assert, false), 'Assertion failed');
  doTestMessage(
      goog.partial(goog.asserts.assert, false, 'ouch %s', 1),
      'Assertion failed: ouch 1');
}


function testFail() {
  assertThrows('fail()', goog.asserts.fail);
  // Test error messages.
  doTestMessage(goog.partial(goog.asserts.fail, false), 'Failure');
  doTestMessage(
      goog.partial(goog.asserts.fail, 'ouch %s', 1), 'Failure: ouch 1');
}

function testNumber() {
  goog.asserts.assertNumber(1);
  assertThrows(
      'assertNumber(null)', goog.partial(goog.asserts.assertNumber, null));
  // Test error messages.
  doTestMessage(
      goog.partial(goog.asserts.assertNumber, null),
      'Assertion failed: Expected number but got null: null.');
  doTestMessage(
      goog.partial(goog.asserts.assertNumber, '1234'),
      'Assertion failed: Expected number but got string: 1234.');
  doTestMessage(
      goog.partial(goog.asserts.assertNumber, null, 'ouch %s', 1),
      'Assertion failed: ouch 1');
}

function testString() {
  assertEquals('1', goog.asserts.assertString('1'));
  assertThrows(
      'assertString(null)', goog.partial(goog.asserts.assertString, null));
  // Test error messages.
  doTestMessage(
      goog.partial(goog.asserts.assertString, null),
      'Assertion failed: Expected string but got null: null.');
  doTestMessage(
      goog.partial(goog.asserts.assertString, 1234),
      'Assertion failed: Expected string but got number: 1234.');
  doTestMessage(
      goog.partial(goog.asserts.assertString, null, 'ouch %s', 1),
      'Assertion failed: ouch 1');
}

function testFunction() {
  function f(){};
  assertEquals(f, goog.asserts.assertFunction(f));
  assertThrows(
      'assertFunction(null)', goog.partial(goog.asserts.assertFunction, null));
  // Test error messages.
  doTestMessage(
      goog.partial(goog.asserts.assertFunction, null),
      'Assertion failed: Expected function but got null: null.');
  doTestMessage(
      goog.partial(goog.asserts.assertFunction, 1234),
      'Assertion failed: Expected function but got number: 1234.');
  doTestMessage(
      goog.partial(goog.asserts.assertFunction, null, 'ouch %s', 1),
      'Assertion failed: ouch 1');
}

function testObject() {
  var o = {};
  assertEquals(o, goog.asserts.assertObject(o));
  assertThrows(
      'assertObject(null)', goog.partial(goog.asserts.assertObject, null));
  // Test error messages.
  doTestMessage(
      goog.partial(goog.asserts.assertObject, null),
      'Assertion failed: Expected object but got null: null.');
  doTestMessage(
      goog.partial(goog.asserts.assertObject, 1234),
      'Assertion failed: Expected object but got number: 1234.');
  doTestMessage(
      goog.partial(goog.asserts.assertObject, null, 'ouch %s', 1),
      'Assertion failed: ouch 1');
}

function testArray() {
  var a = [];
  assertEquals(a, goog.asserts.assertArray(a));
  assertThrows('assertArray({})', goog.partial(goog.asserts.assertArray, {}));
  // Test error messages.
  doTestMessage(
      goog.partial(goog.asserts.assertArray, null),
      'Assertion failed: Expected array but got null: null.');
  doTestMessage(
      goog.partial(goog.asserts.assertArray, 1234),
      'Assertion failed: Expected array but got number: 1234.');
  doTestMessage(
      goog.partial(goog.asserts.assertArray, null, 'ouch %s', 1),
      'Assertion failed: ouch 1');
}

function testBoolean() {
  assertEquals(true, goog.asserts.assertBoolean(true));
  assertEquals(false, goog.asserts.assertBoolean(false));
  assertThrows(goog.partial(goog.asserts.assertBoolean, null));
  assertThrows(goog.partial(goog.asserts.assertBoolean, 'foo'));

  // Test error messages.
  doTestMessage(
      goog.partial(goog.asserts.assertBoolean, null),
      'Assertion failed: Expected boolean but got null: null.');
  doTestMessage(
      goog.partial(goog.asserts.assertBoolean, 1234),
      'Assertion failed: Expected boolean but got number: 1234.');
  doTestMessage(
      goog.partial(goog.asserts.assertBoolean, null, 'ouch %s', 1),
      'Assertion failed: ouch 1');
}

function testElement() {
  assertThrows(goog.partial(goog.asserts.assertElement, null));
  assertThrows(goog.partial(goog.asserts.assertElement, 'foo'));
  assertThrows(
      goog.partial(goog.asserts.assertElement, goog.dom.createTextNode('foo')));
  var elem = goog.dom.createElement(goog.dom.TagName.DIV);
  assertEquals(elem, goog.asserts.assertElement(elem));
}

function testInstanceof() {
  /** @constructor */
  var F = function() {};
  goog.asserts.assertInstanceof(new F(), F);
  assertThrows(
      'assertInstanceof({}, F)',
      goog.partial(goog.asserts.assertInstanceof, {}, F));
  // IE lacks support for function.name and will fallback to toString().
  var object = goog.userAgent.IE ? '[object Object]' : 'Object';

  // Test error messages.
  doTestMessage(
      goog.partial(goog.asserts.assertInstanceof, {}, F),
      'Assertion failed: Expected instanceof unknown type name but got ' +
          object + '.');
  doTestMessage(
      goog.partial(goog.asserts.assertInstanceof, {}, F, 'a %s', 1),
      'Assertion failed: a 1');
  doTestMessage(
      goog.partial(goog.asserts.assertInstanceof, null, F),
      'Assertion failed: Expected instanceof unknown type name but got null.');
  doTestMessage(
      goog.partial(goog.asserts.assertInstanceof, 5, F), 'Assertion failed: ' +
          'Expected instanceof unknown type name but got number.');

  // Test a constructor a with a name (IE does not support function.name).
  if (!goog.userAgent.IE) {
    F = function foo() {};
    doTestMessage(
        goog.partial(goog.asserts.assertInstanceof, {}, F),
        'Assertion failed: Expected instanceof foo but got ' + object + '.');
  }

  // Test a constructor with a displayName.
  F.displayName = 'bar';
  doTestMessage(
      goog.partial(goog.asserts.assertInstanceof, {}, F),
      'Assertion failed: Expected instanceof bar but got ' + object + '.');
}

function testObjectPrototypeIsIntact() {
  goog.asserts.assertObjectPrototypeIsIntact();
  var originalToString = Object.prototype.toString;
  Object.prototype.toString = goog.nullFunction;
  try {
    goog.asserts.assertObjectPrototypeIsIntact();
    Object.prototype.foo = 1;
    doTestMessage(
        goog.asserts.assertObjectPrototypeIsIntact,
        'Failure: foo should not be enumerable in Object.prototype.');
  } finally {
    Object.prototype.toString = originalToString;
    delete Object.prototype.foo;
  }
}

function testAssertionError() {
  var error = new goog.asserts.AssertionError('foo %s %s', [1, 'two']);
  assertEquals('Wrong message', 'foo 1 two', error.message);
  assertEquals('Wrong messagePattern', 'foo %s %s', error.messagePattern);
}

function testFailWithCustomErrorHandler() {
  try {
    var handledException;
    goog.asserts.setErrorHandler(function(e) { handledException = e; });

    var expectedMessage = 'Failure: Gevalt!';

    goog.asserts.fail('Gevalt!');
    assertTrue('handledException is null.', handledException != null);
    assertTrue(
        'Message check failed.  Expected: ' + expectedMessage + ' Actual: ' +
            handledException.message,
        goog.string.startsWith(expectedMessage, handledException.message));
  } finally {
    goog.asserts.setErrorHandler(goog.asserts.DEFAULT_ERROR_HANDLER);
  }
}

function testAssertWithCustomErrorHandler() {
  try {
    var handledException;
    goog.asserts.setErrorHandler(function(e) { handledException = e; });

    var expectedMessage = 'Assertion failed: Gevalt!';

    goog.asserts.assert(false, 'Gevalt!');
    assertTrue('handledException is null.', handledException != null);
    assertTrue(
        'Message check failed.  Expected: ' + expectedMessage + ' Actual: ' +
            handledException.message,
        goog.string.startsWith(expectedMessage, handledException.message));
  } finally {
    goog.asserts.setErrorHandler(goog.asserts.DEFAULT_ERROR_HANDLER);
  }
}
