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

goog.provide('goog.defineClassTest');
goog.setTestOnly('goog.defineClassTest');

goog.require('goog.testing.jsunit');

function testSuper() {
  /** @constructor */
  function SomeSuper(){};

  var SomeClass = goog.defineClass(SomeSuper, {
    /** @constructor */
    constructor: function() {}
  });

  assertTrue(new SomeClass() instanceof SomeClass);
  assertTrue(new SomeClass() instanceof SomeSuper);
}

function testPrototypeProp() {
  var SomeClass = goog.defineClass(null, {
    /** @constructor */
    constructor: function() {},
    trueMethod: function() { return true; }
  });

  assertEquals(new SomeClass().falseProp, false);
  assertEquals(new SomeClass().trueMethod(), true);
}

function testInstanceProp() {
  var SomeClass = goog.defineClass(null, {
    /** @constructor */
    constructor: function() { this.falseProp = false; }
  });

  assertEquals(new SomeClass().falseProp, false);
}

function testPrototypeProp() {
  var SomeClass = goog.defineClass(null, {
    /** @constructor */
    constructor: function() {},
    trueMethod: function() { return true; }
  });

  assertEquals(new SomeClass().trueMethod(), true);
  assertEquals(SomeClass.prototype.trueMethod(), true);
}

function testStaticProp() {
  var SomeClass = goog.defineClass(null, {
    /** @constructor */
    constructor: function() {},
    statics: {someProp: 100}
  });

  assertEquals(new SomeClass().statics, undefined);
  assertEquals(new SomeClass().someProp, undefined);
  assertEquals(SomeClass.someProp, 100);
}

function testStaticPropFn() {
  var SomeClass = goog.defineClass(null, {
    /** @constructor */
    constructor: function() {},
    statics: function(cls) { cls.someProp = 100; }
  });

  assertEquals(new SomeClass().statics, undefined);
  assertEquals(new SomeClass().someProp, undefined);
  assertEquals(SomeClass.someProp, 100);
}

function testUid() {
  var SomeClass = goog.defineClass(null, {constructor: function() {}});

  var obj1 = new SomeClass();
  var obj2 = new SomeClass();
  assertEquals(goog.getUid(obj1), goog.getUid(obj1));
  assertEquals(goog.getUid(obj2), goog.getUid(obj2));
  assertNotEquals(goog.getUid(obj1), goog.getUid(obj2));
}
