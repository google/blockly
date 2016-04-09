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

goog.setTestOnly('goog.testing.MockClassFactoryTest');
goog.require('goog.testing');
goog.require('goog.testing.MockClassFactory');
goog.require('goog.testing.jsunit');
goog.provide('fake.BaseClass');
goog.provide('fake.ChildClass');
goog.provide('goog.testing.MockClassFactoryTest');

// Classes that will be mocked.  A base class and child class are used to
// test inheritance.
fake.BaseClass = function(a) {
  fail('real object should never be called');
};

fake.BaseClass.prototype.foo = function() {
  fail('real object should never be called');
};

fake.BaseClass.prototype.toString = function() {
  return 'foo';
};

fake.BaseClass.prototype.toLocaleString = function() {
  return 'bar';
};

fake.BaseClass.prototype.overridden = function() {
  return 42;
};

fake.ChildClass = function(a) {
  fail('real object should never be called');
};
goog.inherits(fake.ChildClass, fake.BaseClass);

fake.ChildClass.staticFoo = function() {
  fail('real object should never be called');
};

fake.ChildClass.prototype.bar = function() {
  fail('real object should never be called');
};

fake.ChildClass.staticProperty = 'staticPropertyOnClass';

function TopLevelBaseClass() {}

fake.ChildClass.prototype.overridden = function() {
  var superResult = fake.ChildClass.base(this, 'overridden');
  if (superResult != 42) {
    fail('super method not invoked or returned wrong value');
  }
  return superResult + 1;
};

var mockClassFactory = new goog.testing.MockClassFactory();
var matchers = goog.testing.mockmatchers;

function tearDown() {
  mockClassFactory.reset();
}

function testGetStrictMockClass() {
  var mock1 = mockClassFactory.getStrictMockClass(fake, fake.BaseClass, 1);
  mock1.foo();
  mock1.$replay();

  var mock2 = mockClassFactory.getStrictMockClass(fake, fake.BaseClass, 2);
  mock2.foo();
  mock2.$replay();

  var mock3 = mockClassFactory.getStrictMockClass(fake, fake.ChildClass, 3);
  mock3.foo();
  mock3.bar();
  mock3.$replay();

  var instance1 = new fake.BaseClass(1);
  instance1.foo();
  mock1.$verify();

  var instance2 = new fake.BaseClass(2);
  instance2.foo();
  mock2.$verify();

  var instance3 = new fake.ChildClass(3);
  instance3.foo();
  instance3.bar();
  mock3.$verify();

  assertThrows(function() { new fake.BaseClass(-1) });
  assertTrue(instance1 instanceof fake.BaseClass);
  assertTrue(instance2 instanceof fake.BaseClass);
  assertTrue(instance3 instanceof fake.ChildClass);
}

function testGetStrictMockClassCreatesAllProxies() {
  var mock1 = mockClassFactory.getStrictMockClass(fake, fake.BaseClass, 1);
  // toString(), toLocaleString() and others are treaded specially in
  // createProxy_().
  mock1.toString();
  mock1.toLocaleString();
  mock1.$replay();

  var instance1 = new fake.BaseClass(1);
  instance1.toString();
  instance1.toLocaleString();
  mock1.$verify();
}

function testGetLooseMockClass() {
  var mock1 = mockClassFactory.getLooseMockClass(fake, fake.BaseClass, 1);
  mock1.foo().$anyTimes().$returns(3);
  mock1.$replay();

  var mock2 = mockClassFactory.getLooseMockClass(fake, fake.BaseClass, 2);
  mock2.foo().$times(3);
  mock2.$replay();

  var mock3 = mockClassFactory.getLooseMockClass(fake, fake.ChildClass, 3);
  mock3.foo().$atLeastOnce().$returns(5);
  mock3.bar().$atLeastOnce();
  mock3.$replay();

  var instance1 = new fake.BaseClass(1);
  assertEquals(3, instance1.foo());
  assertEquals(3, instance1.foo());
  assertEquals(3, instance1.foo());
  assertEquals(3, instance1.foo());
  assertEquals(3, instance1.foo());
  mock1.$verify();

  var instance2 = new fake.BaseClass(2);
  instance2.foo();
  instance2.foo();
  instance2.foo();
  mock2.$verify();

  var instance3 = new fake.ChildClass(3);
  assertEquals(5, instance3.foo());
  assertEquals(5, instance3.foo());
  instance3.bar();
  mock3.$verify();

  assertThrows(function() { new fake.BaseClass(-1) });
  assertTrue(instance1 instanceof fake.BaseClass);
  assertTrue(instance2 instanceof fake.BaseClass);
  assertTrue(instance3 instanceof fake.ChildClass);
}

function testGetStrictStaticMock() {
  var staticMock = mockClassFactory.getStrictStaticMock(fake, fake.ChildClass);
  var mock = mockClassFactory.getStrictMockClass(fake, fake.ChildClass, 1);

  mock.foo();
  mock.bar();
  staticMock.staticFoo();
  mock.$replay();
  staticMock.$replay();

  var instance = new fake.ChildClass(1);
  instance.foo();
  instance.bar();
  fake.ChildClass.staticFoo();
  mock.$verify();
  staticMock.$verify();

  assertTrue(instance instanceof fake.BaseClass);
  assertTrue(instance instanceof fake.ChildClass);
  assertThrows(function() {
    mockClassFactory.getLooseStaticMock(fake, fake.ChildClass);
  });
}

function testGetStrictStaticMockKeepsStaticProperties() {
  var OriginalChildClass = fake.ChildClass;
  var staticMock = mockClassFactory.getStrictStaticMock(fake, fake.ChildClass);
  assertEquals(
      OriginalChildClass.staticProperty, fake.ChildClass.staticProperty);
}

function testGetLooseStaticMockKeepsStaticProperties() {
  var OriginalChildClass = fake.ChildClass;
  var staticMock = mockClassFactory.getLooseStaticMock(fake, fake.ChildClass);
  assertEquals(
      OriginalChildClass.staticProperty, fake.ChildClass.staticProperty);
}

function testGetLooseStaticMock() {
  var staticMock = mockClassFactory.getLooseStaticMock(fake, fake.ChildClass);
  var mock = mockClassFactory.getStrictMockClass(fake, fake.ChildClass, 1);

  mock.foo();
  mock.bar();
  staticMock.staticFoo().$atLeastOnce();
  mock.$replay();
  staticMock.$replay();

  var instance = new fake.ChildClass(1);
  instance.foo();
  instance.bar();
  fake.ChildClass.staticFoo();
  fake.ChildClass.staticFoo();
  mock.$verify();
  staticMock.$verify();

  assertTrue(instance instanceof fake.BaseClass);
  assertTrue(instance instanceof fake.ChildClass);
  assertThrows(function() {
    mockClassFactory.getStrictStaticMock(fake, fake.ChildClass);
  });
}

function testFlexibleClassMockInstantiation() {
  // This mock should be returned for all instances created with a number
  // as the first argument.
  var mock = mockClassFactory.getStrictMockClass(
      fake, fake.ChildClass, matchers.isNumber);
  mock.foo();  // Will be called by the first mock instance.
  mock.foo();  // Will be called by the second mock instance.
  mock.$replay();

  var instance1 = new fake.ChildClass(1);
  var instance2 = new fake.ChildClass(2);
  instance1.foo();
  instance2.foo();
  assertThrows(function() { new fake.ChildClass('foo'); });
  mock.$verify();
}

function testMockTopLevelClass() {
  var mock = mockClassFactory.getStrictMockClass(
      goog.global, goog.global.TopLevelBaseClass);
}

function testGoogBaseCall() {
  var overriddenFn = fake.ChildClass.prototype.overridden;
  var mock = mockClassFactory.getLooseMockClass(fake, fake.ChildClass, 1);
  var instance1 = new fake.ChildClass(1);
  assertTrue(43 == overriddenFn.call(instance1));
}
