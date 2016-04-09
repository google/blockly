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

goog.provide('goog.labs.mockTest');
goog.setTestOnly('goog.labs.mockTest');

goog.require('goog.array');
goog.require('goog.labs.mock');
goog.require('goog.labs.mock.VerificationError');
/** @suppress {extraRequire} */
goog.require('goog.labs.testing.AnythingMatcher');
/** @suppress {extraRequire} */
goog.require('goog.labs.testing.GreaterThanMatcher');
goog.require('goog.string');
goog.require('goog.testing.jsunit');

var ParentClass = function() {};
ParentClass.prototype.method1 = function() {};
ParentClass.prototype.x = 1;
ParentClass.prototype.val = 0;
ParentClass.prototype.incrementVal = function() {
  this.val++;
};

var ChildClass = function() {};
goog.inherits(ChildClass, ParentClass);
ChildClass.prototype.method2 = function() {};
ChildClass.prototype.y = 2;

function testParentClass() {
  var parentMock = goog.labs.mock.mock(ParentClass);

  assertNotUndefined(parentMock.method1);
  assertUndefined(parentMock.method1());
  assertUndefined(parentMock.method2);
  assertNotUndefined(parentMock.x);
  assertUndefined(parentMock.y);
  assertTrue(
      'Mock should be an instance of the mocked class.',
      parentMock instanceof ParentClass);
}

function testChildClass() {
  var childMock = goog.labs.mock.mock(ChildClass);

  assertNotUndefined(childMock.method1);
  assertUndefined(childMock.method1());
  assertNotUndefined(childMock.method2);
  assertUndefined(childMock.method2());
  assertNotUndefined(childMock.x);
  assertNotUndefined(childMock.y);
  assertTrue(
      'Mock should be an instance of the mocked class.',
      childMock instanceof ChildClass);
}

function testParentClassInstance() {
  var parentMock = goog.labs.mock.mock(new ParentClass());

  assertNotUndefined(parentMock.method1);
  assertUndefined(parentMock.method1());
  assertUndefined(parentMock.method2);
  assertNotUndefined(parentMock.x);
  assertUndefined(parentMock.y);
  assertTrue(
      'Mock should be an instance of the mocked class.',
      parentMock instanceof ParentClass);
}

function testChildClassInstance() {
  var childMock = goog.labs.mock.mock(new ChildClass());

  assertNotUndefined(childMock.method1);
  assertUndefined(childMock.method1());
  assertNotUndefined(childMock.method2);
  assertUndefined(childMock.method2());
  assertNotUndefined(childMock.x);
  assertNotUndefined(childMock.y);
  assertTrue(
      'Mock should be an instance of the mocked class.',
      childMock instanceof ParentClass);
}

function testNonEnumerableProperties() {
  var mockObject = goog.labs.mock.mock({});
  assertNotUndefined(mockObject.toString);
  goog.labs.mock.when(mockObject).toString().then(function() {
    return 'toString';
  });
  assertEquals('toString', mockObject.toString());
}

function testBasicStubbing() {
  var obj = {
    method1: function(i) { return 2 * i; },
    method2: function(i, str) { return str; },
    method3: function(x) { return x; }
  };

  var mockObj = goog.labs.mock.mock(obj);
  goog.labs.mock.when(mockObj).method1(2).then(function(i) { return i; });

  assertEquals(4, obj.method1(2));
  assertEquals(2, mockObj.method1(2));
  assertUndefined(mockObj.method1(4));

  goog.labs.mock.when(mockObj).method2(1, 'hi').then(function(i) {
    return 'oh'
  });
  assertEquals('hi', obj.method2(1, 'hi'));
  assertEquals('oh', mockObj.method2(1, 'hi'));
  assertUndefined(mockObj.method2(3, 'foo'));

  goog.labs.mock.when(mockObj).method3(4).thenReturn(10);
  assertEquals(4, obj.method3(4));
  assertEquals(10, mockObj.method3(4));
  goog.labs.mock.verify(mockObj).method3(4);
  assertUndefined(mockObj.method3(5));
}

function testMockFunctions() {
  function x(i) { return i; }

  var mockedFunc = goog.labs.mock.mockFunction(x);
  goog.labs.mock.when(mockedFunc)(100).thenReturn(10);
  goog.labs.mock.when(mockedFunc)(50).thenReturn(25);

  assertEquals(100, x(100));
  assertEquals(10, mockedFunc(100));
  assertEquals(25, mockedFunc(50));
}

function testStubbingConsecutiveCalls() {
  var obj = {method: function(i) { return i * 42; }};

  var mockObj = goog.labs.mock.mock(obj);
  goog.labs.mock.when(mockObj).method(1).thenReturn(3);
  goog.labs.mock.when(mockObj).method(1).thenReturn(4);

  assertEquals(42, obj.method(1));
  assertEquals(3, mockObj.method(1));
  assertEquals(4, mockObj.method(1));
  assertEquals(4, mockObj.method(1));

  var x = function(i) { return i; };
  var mockedFunc = goog.labs.mock.mockFunction(x);
  goog.labs.mock.when(mockedFunc)(100).thenReturn(10);
  goog.labs.mock.when(mockedFunc)(100).thenReturn(25);

  assertEquals(100, x(100));
  assertEquals(10, mockedFunc(100));
  assertEquals(25, mockedFunc(100));
  assertEquals(25, mockedFunc(100));
}

function testSpying() {
  var obj = {
    method1: function(i) { return 2 * i; },
    method2: function(i) { return 5 * i; }
  };

  var spyObj = goog.labs.mock.spy(obj);
  goog.labs.mock.when(spyObj).method1(2).thenReturn(5);

  assertEquals(2, obj.method1(1));
  assertEquals(5, spyObj.method1(2));
  goog.labs.mock.verify(spyObj).method1(2);
  assertEquals(2, spyObj.method1(1));
  goog.labs.mock.verify(spyObj).method1(1);
  assertEquals(20, spyObj.method2(4));
  goog.labs.mock.verify(spyObj).method2(4);
}

function testSpyParentClassInstance() {
  var parent = new ParentClass();
  var parentMock = goog.labs.mock.spy(parent);

  assertNotUndefined(parentMock.method1);
  assertUndefined(parentMock.method1());
  assertUndefined(parentMock.method2);
  assertNotUndefined(parentMock.x);
  assertUndefined(parentMock.y);
  assertTrue(
      'Mock should be an instance of the mocked class.',
      parentMock instanceof ParentClass);
  var incrementedOrigVal = parent.val + 1;
  parentMock.incrementVal();
  assertEquals(
      'Changes in the spied object should reflect in the spy.',
      incrementedOrigVal, parentMock.val);
}

function testSpyChildClassInstance() {
  var child = new ChildClass();
  var childMock = goog.labs.mock.spy(child);

  assertNotUndefined(childMock.method1);
  assertUndefined(childMock.method1());
  assertNotUndefined(childMock.method2);
  assertUndefined(childMock.method2());
  assertNotUndefined(childMock.x);
  assertNotUndefined(childMock.y);
  assertTrue(
      'Mock should be an instance of the mocked class.',
      childMock instanceof ParentClass);
  var incrementedOrigVal = child.val + 1;
  childMock.incrementVal();
  assertEquals(
      'Changes in the spied object should reflect in the spy.',
      incrementedOrigVal, childMock.val);
}

function testVerifyForObjects() {
  var obj = {
    method1: function(i) { return 2 * i; },
    method2: function(i) { return 5 * i; }
  };

  var mockObj = goog.labs.mock.mock(obj);
  goog.labs.mock.when(mockObj).method1(2).thenReturn(5);

  assertEquals(5, mockObj.method1(2));
  goog.labs.mock.verify(mockObj).method1(2);
  var e = assertThrows(goog.bind(goog.labs.mock.verify(mockObj).method1, 2));
  assertTrue(e instanceof goog.labs.mock.VerificationError);
}

function testVerifyForFunctions() {
  var func = function(i) { return i; };

  var mockFunc = goog.labs.mock.mockFunction(func);
  goog.labs.mock.when(mockFunc)(2).thenReturn(55);
  assertEquals(55, mockFunc(2));
  goog.labs.mock.verify(mockFunc)(2);
  goog.labs.mock.verify(mockFunc)(lessThan(3));

  var e = assertThrows(goog.bind(goog.labs.mock.verify(mockFunc), 3));
  assertTrue(e instanceof goog.labs.mock.VerificationError);
}


/**
* When a function invocation verification fails, it should show the failed
* expectation call, as well as the recorded calls to the same method.
*/
function testVerificationErrorMessages() {
  var mock = goog.labs.mock.mock({method: function(i) { return i; }});

  // Failure when there are no recorded calls.
  var e = assertThrows(function() { goog.labs.mock.verify(mock).method(4); });
  assertTrue(e instanceof goog.labs.mock.VerificationError);
  var expected = '\nExpected: method(4)\n' +
      'Recorded: No recorded calls';
  assertEquals(expected, e.message);


  // Failure when there are recorded calls with ints and functions
  // as arguments.
  var callback = function() {};
  var callbackId = goog.labs.mock.getUid(callback);

  mock.method(1);
  mock.method(2);
  mock.method(callback);

  e = assertThrows(function() { goog.labs.mock.verify(mock).method(3); });
  assertTrue(e instanceof goog.labs.mock.VerificationError);

  expected = '\nExpected: method(3)\n' +
      'Recorded: method(1),\n' +
      '          method(2),\n' +
      '          method(<function #anonymous' + callbackId + '>)';
  assertEquals(expected, e.message);

  // With mockFunctions
  var mockCallback = goog.labs.mock.mockFunction(callback);
  e = assertThrows(function() { goog.labs.mock.verify(mockCallback)(5); });
  expected = '\nExpected: #mockFor<#anonymous' + callbackId + '>(5)\n' +
      'Recorded: No recorded calls';

  mockCallback(8);
  goog.labs.mock.verify(mockCallback)(8);
  assertEquals(expected, e.message);

  // Objects with circular references should not fail.
  var obj = {x: 1};
  obj.y = obj;

  mockCallback(obj);
  e = assertThrows(function() { goog.labs.mock.verify(mockCallback)(5); });
  assertTrue(e instanceof goog.labs.mock.VerificationError);

  // Should respect string representation of different custom classes.
  var myClass = function() {};
  myClass.prototype.toString = function() { return '<superClass>'; };

  var mockFunction = goog.labs.mock.mockFunction(function f() {});
  mockFunction(new myClass());

  e = assertThrows(function() { goog.labs.mock.verify(mockFunction)(5); });
  expected = '\nExpected: #mockFor<f>(5)\n' +
      'Recorded: #mockFor<f>(<superClass>)';
  assertEquals(expected, e.message);
}


/**
* Asserts that the given string contains a list of others strings
* in the given order.
*/
function assertContainsInOrder(str, var_args) {
  var expected = goog.array.splice(arguments, 1);
  var indices =
      goog.array.map(expected, function(val) { return str.indexOf(val); });

  for (var i = 0; i < expected.length; i++) {
    var msg = 'Missing "' + expected[i] + '" from "' + str + '"';
    assertTrue(msg, indices[i] != -1);

    if (i > 0) {
      msg = '"' + expected[i - 1] + '" should come before "' + expected[i] +
          '" in "' + str + '"';
      assertTrue(msg, indices[i] > indices[i - 1]);
    }
  }
}

function testMatchers() {
  var obj = {
    method1: function(i) { return 2 * i; },
    method2: function(i) { return 5 * i; }
  };

  var mockObj = goog.labs.mock.mock(obj);

  goog.labs.mock.when(mockObj).method1(greaterThan(4)).thenReturn(100);
  goog.labs.mock.when(mockObj).method1(lessThan(4)).thenReturn(40);

  assertEquals(100, mockObj.method1(5));
  assertEquals(100, mockObj.method1(6));
  assertEquals(40, mockObj.method1(2));
  assertEquals(40, mockObj.method1(1));
  assertUndefined(mockObj.method1(4));
}

function testMatcherVerify() {
  var obj = {method: function(i) { return 2 * i; }};

  // Using spy objects.
  var spy = goog.labs.mock.spy(obj);

  spy.method(6);

  goog.labs.mock.verify(spy).method(greaterThan(4));
  var e =
      assertThrows(goog.bind(goog.labs.mock.verify(spy).method, lessThan(4)));
  assertTrue(e instanceof goog.labs.mock.VerificationError);

  // Using mocks
  var mockObj = goog.labs.mock.mock(obj);

  mockObj.method(8);

  goog.labs.mock.verify(mockObj).method(greaterThan(7));
  var e = assertThrows(
      goog.bind(goog.labs.mock.verify(mockObj).method, lessThan(7)));
  assertTrue(e instanceof goog.labs.mock.VerificationError);
}

function testMatcherVerifyCollision() {
  var obj = {method: function(i) { return 2 * i; }};
  var mockObj = goog.labs.mock.mock(obj);

  goog.labs.mock.when(mockObj).method(5).thenReturn(100);
  assertNotEquals(100, mockObj.method(greaterThan(2)));
}

function testMatcherVerifyCollisionBetweenMatchers() {
  var obj = {method: function(i) { return 2 * i; }};
  var mockObj = goog.labs.mock.mock(obj);

  goog.labs.mock.when(mockObj).method(anything()).thenReturn(100);

  var e = assertThrows(
      goog.bind(goog.labs.mock.verify(mockObj).method, anything()));
  assertTrue(e instanceof goog.labs.mock.VerificationError);
}

function testVerifyForUnmockedMethods() {
  var Task = function() {};
  Task.prototype.run = function() {};

  var mockTask = goog.labs.mock.mock(Task);
  mockTask.run();

  goog.labs.mock.verify(mockTask).run();
}

function testFormatMethodCall() {
  var formatMethodCall = goog.labs.mock.formatMethodCall_;
  assertEquals('alert()', formatMethodCall('alert'));
  assertEquals('sum(2, 4)', formatMethodCall('sum', [2, 4]));
  assertEquals('sum("2", "4")', formatMethodCall('sum', ['2', '4']));
  assertEquals(
      'call(<function unicorn>)',
      formatMethodCall('call', [function unicorn() {}]));

  var arg = {x: 1, y: {hello: 'world'}};
  assertEquals(
      'call(' + goog.labs.mock.formatValue_(arg) + ')',
      formatMethodCall('call', [arg]));
}

function testGetFunctionName() {
  var f1 = function() {};
  var f2 = function() {};
  var named = function myName() {};

  assert(
      goog.string.startsWith(
          goog.labs.mock.getFunctionName_(f1), '#anonymous'));
  assert(
      goog.string.startsWith(
          goog.labs.mock.getFunctionName_(f2), '#anonymous'));
  assertNotEquals(
      goog.labs.mock.getFunctionName_(f1), goog.labs.mock.getFunctionName_(f2));
  assertEquals('myName', goog.labs.mock.getFunctionName_(named));
}

function testFormatObject() {
  var obj, obj2, obj3;

  obj = {x: 1};
  assertEquals(
      '{"x":1 _id:' + goog.labs.mock.getUid(obj) + '}',
      goog.labs.mock.formatValue_(obj));
  assertEquals('{"x":1}', goog.labs.mock.formatValue_(obj, false /* id */));

  obj = {x: 'hello'};
  assertEquals(
      '{"x":"hello" _id:' + goog.labs.mock.getUid(obj) + '}',
      goog.labs.mock.formatValue_(obj));
  assertEquals(
      '{"x":"hello"}', goog.labs.mock.formatValue_(obj, false /* id */));

  obj3 = {};
  obj2 = {y: obj3};
  obj3.x = obj2;
  assertEquals(
      '{"x":{"y":<recursive/dupe obj_' + goog.labs.mock.getUid(obj3) + '> ' +
          '_id:' + goog.labs.mock.getUid(obj2) + '} ' +
          '_id:' + goog.labs.mock.getUid(obj3) + '}',
      goog.labs.mock.formatValue_(obj3));
  assertEquals(
      '{"x":{"y":<recursive/dupe>}}',
      goog.labs.mock.formatValue_(obj3, false /* id */));


  obj = {x: function y() {}};
  assertEquals(
      '{"x":<function y> _id:' + goog.labs.mock.getUid(obj) + '}',
      goog.labs.mock.formatValue_(obj));
  assertEquals(
      '{"x":<function y>}', goog.labs.mock.formatValue_(obj, false /* id */));
}

function testGetUid() {
  var obj1 = {};
  var obj2 = {};
  var func1 = function() {};
  var func2 = function() {};

  assertNotEquals(goog.labs.mock.getUid(obj1), goog.labs.mock.getUid(obj2));
  assertNotEquals(goog.labs.mock.getUid(func1), goog.labs.mock.getUid(func2));
  assertNotEquals(goog.labs.mock.getUid(obj1), goog.labs.mock.getUid(func2));
  assertEquals(goog.labs.mock.getUid(obj1), goog.labs.mock.getUid(obj1));
  assertEquals(goog.labs.mock.getUid(func1), goog.labs.mock.getUid(func1));
}
