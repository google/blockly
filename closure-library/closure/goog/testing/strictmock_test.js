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

goog.provide('goog.testing.StrictMockTest');
goog.setTestOnly('goog.testing.StrictMockTest');

goog.require('goog.testing.StrictMock');
goog.require('goog.testing.jsunit');

// The object that we will be mocking
var RealObject = function() {
};

RealObject.prototype.a = function() {
  fail('real object should never be called');
};

RealObject.prototype.b = function() {
  fail('real object should never be called');
};

RealObject.prototype.c = function() {
  fail('real object should never be called');
};

var mock;

function setUp() {
  var obj = new RealObject();
  mock = new goog.testing.StrictMock(obj);
}


function testMockFunction() {
  var mock = new goog.testing.StrictMock(RealObject);
  mock.a();
  mock.b();
  mock.c();
  mock.$replay();
  mock.a();
  mock.b();
  mock.c();
  mock.$verify();

  mock.$reset();

  assertThrows(function() {mock.x()});
}


function testSimpleExpectations() {
  mock.a();
  mock.$replay();
  mock.a();
  mock.$verify();

  mock.$reset();

  mock.a();
  mock.b();
  mock.a();
  mock.a();
  mock.$replay();
  mock.a();
  mock.b();
  mock.a();
  mock.a();
  mock.$verify();
}


function testFailToSetExpectation() {
  mock.$replay();
  assertThrows(goog.bind(mock.a, mock));

  mock.$reset();

  mock.$replay();
  assertThrows(goog.bind(mock.b, mock));
}


function testUnexpectedCall() {
  mock.a();
  mock.$replay();
  mock.a();
  assertThrows(goog.bind(mock.a, mock));

  mock.$reset();

  mock.a();
  mock.$replay();
  assertThrows(goog.bind(mock.b, mock));
}


function testNotEnoughCalls() {
  mock.a();
  mock.$replay();
  assertThrows(goog.bind(mock.$verify, mock));

  mock.$reset();

  mock.a();
  mock.b();
  mock.$replay();
  mock.a();
  assertThrows(goog.bind(mock.$verify, mock));
}


function testOutOfOrderCalls() {
  mock.a();
  mock.b();
  mock.$replay();
  assertThrows(goog.bind(mock.b, mock));
}


function testVerify() {
  mock.a();
  mock.$replay();
  mock.a();
  mock.$verify();

  mock.$reset();

  mock.a();
  mock.$replay();
  assertThrows(goog.bind(mock.$verify, mock));
}


function testArgumentMatching() {
  mock.a('foo');
  mock.b('bar');
  mock.$replay();
  mock.a('foo');
  assertThrows(function() {mock.b('foo')});

  mock.$reset();
  mock.a('foo');
  mock.a('bar');
  mock.$replay();
  mock.a('foo');
  mock.a('bar');
  mock.$verify();

  mock.$reset();
  mock.a('foo');
  mock.a('bar');
  mock.$replay();
  assertThrows(function() {mock.a('bar')});
}


function testReturnValue() {
  mock.a().$returns(5);
  mock.$replay();

  assertEquals('Mock should return the right value', 5, mock.a());

  mock.$verify();
}

function testMultipleReturnValues() {
  mock.a().$returns(3);
  mock.a().$returns(2);
  mock.a().$returns(1);

  mock.$replay();

  assertArrayEquals('Mock should return the right value sequence',
      [3, 2, 1],
      [mock.a(), mock.a(), mock.a()]);

  mock.$verify();
}


function testAtMostOnce() {
  // Zero times SUCCESS.
  mock.a().$atMostOnce();
  mock.$replay();
  mock.$verify();

  mock.$reset();

  // One time SUCCESS.
  mock.a().$atMostOnce();
  mock.$replay();
  mock.a();
  mock.$verify();

  mock.$reset();

  // Many times FAIL.
  mock.a().$atMostOnce();
  mock.$replay();
  mock.a();
  assertThrows(goog.bind(mock.a, mock));

  mock.$reset();

  // atMostOnce only lasts until a new method is called.
  mock.a().$atMostOnce();
  mock.b();
  mock.a();
  mock.$replay();
  mock.b();
  assertThrows(goog.bind(mock.$verify, mock));
}


function testAtLeastOnce() {
  // atLeastOnce does not mean zero times
  mock.a().$atLeastOnce();
  mock.$replay();
  assertThrows(goog.bind(mock.$verify, mock));

  mock.$reset();

  // atLeastOnce does mean three times
  mock.a().$atLeastOnce();
  mock.$replay();
  mock.a();
  mock.a();
  mock.a();
  mock.$verify();

  mock.$reset();

  // atLeastOnce only lasts until a new method is called
  mock.a().$atLeastOnce();
  mock.b();
  mock.a();
  mock.$replay();
  mock.a();
  mock.a();
  mock.b();
  mock.a();
  assertThrows(goog.bind(mock.a, mock));
}


function testAtLeastOnceWithArgs() {
  mock.a('asdf').$atLeastOnce();
  mock.a('qwert');
  mock.$replay();
  mock.a('asdf');
  mock.a('asdf');
  mock.a('qwert');
  mock.$verify();

  mock.$reset();

  mock.a('asdf').$atLeastOnce();
  mock.a('qwert');
  mock.$replay();
  mock.a('asdf');
  mock.a('asdf');
  assertThrows(function() {mock.a('zxcv')});
  assertThrows(goog.bind(mock.$verify, mock));
}


function testAnyTimes() {
  mock.a().$anyTimes();
  mock.$replay();
  mock.$verify();

  mock.$reset();

  mock.a().$anyTimes();
  mock.$replay();
  mock.a();
  mock.a();
  mock.a();
  mock.a();
  mock.a();
  mock.$verify();
}


function testAnyTimesWithArguments() {
  mock.a('foo').$anyTimes();
  mock.$replay();
  mock.$verify();

  mock.$reset();

  mock.a('foo').$anyTimes();
  mock.a('bar').$anyTimes();
  mock.$replay();
  mock.a('foo');
  mock.a('foo');
  mock.a('foo');
  mock.a('bar');
  mock.a('bar');
  mock.$verify();
}


function testZeroTimes() {
  mock.a().$times(0);
  mock.$replay();
  mock.$verify();

  mock.$reset();

  mock.a().$times(0);
  mock.$replay();
  assertThrows(function() {mock.a()});
}


function testZeroTimesWithArguments() {
  mock.a('foo').$times(0);
  mock.$replay();
  mock.$verify();

  mock.$reset();

  mock.a('foo').$times(0);
  mock.$replay();
  assertThrows(function() {mock.a('foo')});
}


function testTooManyCalls() {
  mock.a().$times(2);
  mock.$replay();
  mock.a();
  mock.a();
  assertThrows(function() {mock.a()});
}


function testTooManyCallsWithArguments() {
  mock.a('foo').$times(2);
  mock.$replay();
  mock.a('foo');
  mock.a('foo');
  assertThrows(function() {mock.a('foo')});
}


function testMultipleSkippedAnyTimes() {
  mock.a().$anyTimes();
  mock.b().$anyTimes();
  mock.c().$anyTimes();
  mock.$replay();
  mock.c();
  mock.$verify();
}


function testMultipleSkippedAnyTimesWithArguments() {
  mock.a('foo').$anyTimes();
  mock.a('bar').$anyTimes();
  mock.a('baz').$anyTimes();
  mock.$replay();
  mock.a('baz');
  mock.$verify();
}


function testVerifyThrows() {
  mock.a(1);
  mock.$replay();
  mock.a(1);
  try {
    mock.a(2);
    fail('bad mock, should fail');
  } catch (ex) {
    // this could be an event handler, for example
  }
  assertThrows(goog.bind(mock.$verify, mock));
}


function testThrows() {
  mock.a().$throws('exception!');
  mock.$replay();
  assertThrows(goog.bind(mock.a, mock));
  mock.$verify();
}


function testDoes() {
  mock.a(1, 2).$does(function(a, b) {return a + b;});
  mock.$replay();
  assertEquals('Mock should call the function', 3, mock.a(1, 2));
  mock.$verify();
}

function testErrorMessageForBadArgs() {
  mock.a();
  mock.$anyTimes();

  mock.$replay();

  var message;
  try {
    mock.a('a');
  } catch (e) {
    message = e.message;
  }

  assertTrue('No exception thrown on verify', goog.isDef(message));
  assertContains('Bad arguments to a()', message);
}
