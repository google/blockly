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

goog.provide('goog.testing.PropertyReplacerTest');
goog.setTestOnly('goog.testing.PropertyReplacerTest');

goog.require('goog.dom.TagName');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.asserts');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent.product');
goog.require('goog.userAgent.product.isVersion');


function isSafari8() {
  return goog.userAgent.product.SAFARI &&
      goog.userAgent.product.isVersion('8.0');
}

// Test PropertyReplacer with JavaScript objects.
function testSetJsProperties() {
  var stubs = new goog.testing.PropertyReplacer();
  var x = {a: 1, b: undefined};

  // Setting simple values.
  stubs.set(x, 'num', 1);
  assertEquals('x.num = 1', 1, x.num);
  stubs.set(x, 'undef', undefined);
  assertTrue('x.undef = undefined', 'undef' in x && x.undef === undefined);
  stubs.set(x, 'null', null);
  assertTrue('x["null"] = null', x['null'] === null);

  // Setting a simple value that existed originally.
  stubs.set(x, 'b', null);
  assertTrue('x.b = null', x.b === null);

  // Setting a complex value.
  stubs.set(x, 'obj', {});
  assertEquals('x.obj = {}', 'object', typeof x.obj);
  stubs.set(x.obj, 'num', 2);
  assertEquals('x.obj.num = 2', 2, x.obj.num);

  // Overwriting a leaf.
  stubs.set(x.obj, 'num', 3);
  assertEquals('x.obj.num = 3', 3, x.obj.num);

  // Overwriting a non-leaf.
  stubs.set(x, 'obj', {});
  assertFalse('x.obj = {} again', 'num' in x.obj);

  // Setting a function.
  stubs.set(x, 'func', function(n) { return n + 1; });
  assertEquals('x.func = lambda n: n+1', 11, x.func(10));

  // Setting a constructor and a prototype method.
  stubs.set(x, 'Class', function(num) { this.num = num; });
  stubs.set(x.Class.prototype, 'triple', function() { return this.num * 3; });
  assertEquals('prototype method', 12, (new x.Class(4)).triple());

  // Cleaning up with UnsetAll() twice. The second run should have no effect.
  for (var i = 0; i < 2; i++) {
    stubs.reset();
    assertEquals('x.a preserved', 1, x.a);
    assertTrue('x.b reset', 'b' in x && x.b === undefined);
    assertFalse('x.num removed', 'num' in x);
    assertFalse('x.undef removed', 'undef' in x);
    assertFalse('x["null"] removed', 'null' in x);
    assertFalse('x.obj removed', 'obj' in x);
    assertFalse('x.func removed', 'func' in x);
    assertFalse('x.Class removed', 'Class' in x);
  }
}

// Test removing JavaScript object properties.
function testRemoveJsProperties() {
  var stubs = new goog.testing.PropertyReplacer();
  var orig = {'a': 1, 'b': undefined};
  var x = {'a': 1, 'b': undefined};

  stubs.remove(x, 'a');
  assertFalse('x.a removed', 'a' in x);
  assertTrue('x.b not removed', 'b' in x);
  stubs.reset();
  assertObjectEquals('x.a reset', x, orig);

  stubs.remove(x, 'b');
  assertFalse('x.b removed', 'b' in x);
  stubs.reset();
  assertObjectEquals('x.b reset', x, orig);

  stubs.set(x, 'c', 2);
  stubs.remove(x, 'c');
  assertObjectEquals('x.c added then removed', x, orig);
  stubs.reset();
  assertObjectEquals('x.c reset', x, orig);

  stubs.remove(x, 'b');
  stubs.set(x, 'b', undefined);
  assertObjectEquals('x.b removed then added', x, orig);
  stubs.reset();
  assertObjectEquals('x.b reset', x, orig);

  stubs.remove(x, 'd');
  assertObjectEquals('removing non-existing key', x, orig);
  stubs.reset();
  assertObjectEquals('reset removing non-existing key', x, orig);
}

// Test PropertyReplacer with prototype chain.
function testPrototype() {
  var stubs = new goog.testing.PropertyReplacer();

  // Simple inheritance.
  var a = {a: 0};
  function B(){};
  B.prototype = a;
  var b = new B();

  stubs.set(a, 0, 1);
  stubs.set(b, 0, 2);
  stubs.reset();
  assertEquals('a.a == 0', 0, a['a']);
  assertEquals('b.a == 0', 0, b['a']);

  // Inheritance with goog.inherits.
  var c = {a: 0};
  function C(){};
  C.prototype = c;
  function D(){};
  goog.inherits(D, C);
  var d = new D();

  var stubs = new goog.testing.PropertyReplacer();
  stubs.set(c, 'a', 1);
  stubs.set(d, 'a', 2);
  stubs.reset();
  assertEquals('c.a == 0', 0, c['a']);
  assertEquals('d.a == 0', 0, d['a']);

  // Setting prototype fields.
  stubs.set(B.prototype, 'c', 'z');
  assertEquals('b.c=="z"', 'z', b.c);
  stubs.reset();
  assertFalse('b.c deleted', 'c' in b);

  // Setting Object.prototype's fields.
  stubs.set(Object.prototype, 'one', 1);
  assertEquals('b.one==1', 1, b.one);
  stubs.reset();
  assertFalse('b.one deleted', 'one' in b);

  stubs.set(Object.prototype, 'two', 2);
  stubs.remove(b, 'two');
  assertEquals('b.two==2', 2, b.two);
  stubs.remove(Object.prototype, 'two');
  assertFalse('b.two deleted', 'two' in b);
  stubs.reset();
  assertFalse('Object prototype reset', 'two' in b);
}

// Test replacing function properties.
function testFunctionProperties() {
  var stubs = new goog.testing.PropertyReplacer();
  stubs.set(Array, 'x', 1);
  assertEquals('Array.x==1', 1, Array.x);
  stubs.reset();
  assertFalse('Array.x deleted', 'x' in Array);

  stubs.set(Math.random, 'x', 1);
  assertEquals('Math.random.x==1', 1, Math.random.x);
  stubs.reset();
  assertFalse('Math.random.x deleted', 'x' in Math.random);
}

// Test the hasKey_ private method.
function testHasKey() {
  f = goog.testing.PropertyReplacer.hasKey_;

  assertFalse('{}.a', f({}, 'a'));
  assertTrue('{a:0}.a', f({a: 0}, 'a'));

  function C(){};
  C.prototype.a = 0;
  assertFalse('C.prototype.a set, is C.a own?', f(C, 'a'));
  assertTrue('C.prototype.a', f(C.prototype, 'a'));
  assertFalse('C.a not set', f(C, 'a'));
  C.a = 0;
  assertTrue('C.a set', f(C, 'a'));

  var c = new C();
  assertFalse('C().a, inherited', f(c, 'a'));
  c.a = 0;
  assertTrue('C().a, own', f(c, 'a'));

  assertFalse('window, invalid key', f(window, 'no such key'));
  assertTrue('window, global variable', f(window, 'goog'));
  assertTrue('window, build-in key', f(window, 'location'));

  assertFalse('document, invalid key', f(document, 'no such key'));

  var div = document.createElement(goog.dom.TagName.DIV);
  assertFalse('div, invalid key', f(div, 'no such key'));
  div['a'] = 0;
  assertTrue('div, key added by JS', f(div, 'a'));

  // hasKey_ returns false for these DOM properties on Safari 8. See b/22044928.
  if (!isSafari8()) {
    assertTrue('div.className', f(div, 'className'));
    assertTrue('document.body', f(document, 'body'));
  }

  assertFalse('Date().getTime', f(new Date(), 'getTime'));
  assertTrue('Date.prototype.getTime', f(Date.prototype, 'getTime'));

  assertFalse('Math, invalid key', f(Math, 'no such key'));
  assertTrue('Math.random', f(Math, 'random'));

  function Parent(){};
  Parent.prototype.a = 0;
  function Child(){};
  goog.inherits(Child, Parent);
  assertFalse('goog.inherits, parent prototype', f(new Child, 'a'));
  Child.prototype.a = 1;
  assertFalse('goog.inherits, child prototype', f(new Child, 'a'));

  function OverwrittenProto(){};
  OverwrittenProto.prototype = {a: 0};
  assertFalse(f(new OverwrittenProto, 'a'));
}

// Test PropertyReplacer with DOM objects' built in attributes.
function testDomBuiltInAttributes() {
  var div = document.createElement(goog.dom.TagName.DIV);
  div.id = 'old-id';

  var stubs = new goog.testing.PropertyReplacer();
  stubs.set(div, 'id', 'new-id');
  stubs.set(div, 'className', 'test-class');
  assertEquals('div.id == "new-id"', 'new-id', div.id);
  assertEquals('div.className == "test-class"', 'test-class', div.className);

  stubs.remove(div, 'className');

  // Removal of these DOM properties is not supported in Safari 8. See
  // b/22044928.
  if (!isSafari8()) {
    // '' in Firefox, undefined in Chrome.
    assertEvaluatesToFalse('div.className is empty', div.className);
    stubs.reset();
    assertEquals('div.id == "old-id"', 'old-id', div.id);
    assertEquals('div.name == ""', '', div.className);
  }
}

// Test PropertyReplacer with DOM objects' custom attributes.
function testDomCustomAttributes() {
  var div = document.createElement(goog.dom.TagName.DIV);
  div.attr1 = 'old';

  var stubs = new goog.testing.PropertyReplacer();
  stubs.set(div, 'attr1', 'new');
  stubs.set(div, 'attr2', 'new');
  assertEquals('div.attr1 == "new"', 'new', div.attr1);
  assertEquals('div.attr2 == "new"', 'new', div.attr2);

  stubs.set(div, 'attr3', 'new');
  stubs.remove(div, 'attr3');
  assertEquals('div.attr3 == undefined', undefined, div.attr3);

  stubs.reset();
  assertEquals('div.attr1 == "old"', 'old', div.attr1);
  assertEquals('div.attr2 == undefined', undefined, div.attr2);
}

// Test PropertyReplacer trying to override a read-only property.
function testReadOnlyProperties() {
  var stubs = new goog.testing.PropertyReplacer();

  // Function.prototype.length should be read-only.
  var foo = function(_) {};
  assertThrows(
      'Trying to set a read-only property fails silently.',
      goog.bind(stubs.set, stubs, foo, 'length', 10));
  assertThrows(
      'Trying to replace a read-only property fails silently.',
      goog.bind(stubs.replace, stubs, foo, 'length', 10));

  // Array length should be undeletable.
  var a = [1, 2, 3];
  assertThrows(
      'Trying to remove a read-only property fails silently.',
      goog.bind(stubs.remove, stubs, a, 'length'));

  window.foo = foo;
  assertThrows(
      'Trying to set a read-only property by path fails silently.',
      goog.bind(stubs.setPath, stubs, 'window.foo.length', 10));
  window.foo = undefined;
}

// Test PropertyReplacer trying to override a style property doesn't trigger
// read-only exception.
function testSettingStyleProperties() {
  var stubs = new goog.testing.PropertyReplacer();

  var div = document.createElement('div');
  // Ensures setting a pixel style value doesn't trigger the read-only property
  // exception, considering div.style.margin will return "0px" instead of just
  // "0".
  assertNotThrows(
      'Trying to set a read-only property fails silently.',
      goog.bind(stubs.set, stubs, div.style, 'margin', '0'));
}

// Test PropertyReplacer trying to override a sealed property.
function testSealedProperties() {
  if (!goog.isFunction(Object.seal)) {
    return;
  }

  var stubs = new goog.testing.PropertyReplacer();
  var sealed = Object.seal({a: 1});
  assertThrows(
      'Trying to set a new sealed property fails silently.',
      goog.bind(stubs.set, stubs, sealed, 'b', 2));
  assertNotThrows(
      'Trying to remove a new sealed property fails.',
      goog.bind(stubs.remove, stubs, sealed, 'b'));
  assertNotThrows(
      'Trying to remove a sealed property fails.',
      goog.bind(stubs.remove, stubs, sealed, 'a'));

  window.sealed = sealed;
  assertThrows(
      'Trying to set a new sealed property by path fails silently in strict ' +
          'mode.',
      goog.bind(stubs.setPath, stubs, 'window.sealed.b', 2));

  (function() {
    // Test Object.seal() in strict mode, where the assignment itself throws the
    // error rather than our explicit consistency check.
    'use strict';

    var sealed = Object.seal({a: 1});
    assertThrows(
        'Trying to set a new sealed property fails silently in strict mode.',
        goog.bind(stubs.set, stubs, sealed, 'b', 2));
    assertNotThrows(
        'Trying to remove a new sealed property fails in strict mode.',
        goog.bind(stubs.remove, stubs, sealed, 'b'));
    assertNotThrows(
        'Trying to remove a sealed property fails in strict mode.',
        goog.bind(stubs.remove, stubs, sealed, 'a'));

    window.sealed = sealed;
    assertThrows(
        'Trying to set a new sealed property by path fails silently in ' +
            'strict mode.',
        goog.bind(stubs.setPath, stubs, 'window.sealed.b', 2));
  })();

  delete window.sealed;
}

// Test PropertyReplacer trying to override a frozen property.
function testFrozenProperty() {
  if (!goog.isFunction(Object.freeze)) {
    return;
  }

  var stubs = new goog.testing.PropertyReplacer();
  var frozen = Object.freeze({a: 1});
  assertThrows(
      'Trying to set a new frozen property fails silently.',
      goog.bind(stubs.set, stubs, frozen, 'b', 2));
  assertThrows(
      'Trying to set a frozen property fails silently.',
      goog.bind(stubs.set, stubs, frozen, 'a', 2));
  assertThrows(
      'Trying to replace a frozen property fails silently.',
      goog.bind(stubs.replace, stubs, frozen, 'a', 2));
  assertNotThrows(
      'Trying to remove a new frozen property fails.',
      goog.bind(stubs.remove, stubs, frozen, 'b'));
  assertThrows(
      'Trying to remove a frozen property fails silently.',
      goog.bind(stubs.remove, stubs, frozen, 'a'));


  window.frozen = frozen;
  assertThrows(
      'Trying to set a frozen property by path fails silently.',
      goog.bind(stubs.setPath, stubs, 'window.frozen.a', 2));

  (function() {
    // Test Object.freeze() in strict mode, where the assignment itself throws
    // the error rather than our explicit consistency check.
    'use strict';

    var frozen = Object.freeze({a: 1});
    assertThrows(
        'Trying to set a new frozen property fails silently in strict mode.',
        goog.bind(stubs.set, stubs, frozen, 'b', 2));
    assertThrows(
        'Trying to ovewrite a frozen property fails silently in strict mode.',
        goog.bind(stubs.set, stubs, frozen, 'a', 2));
    assertThrows(
        'Trying to replace a frozen property fails silently in strict mode.',
        goog.bind(stubs.replace, stubs, frozen, 'a', 2));
    assertNotThrows(
        'Trying to remove a new frozen property fails in strict mode.',
        goog.bind(stubs.remove, stubs, frozen, 'b'));
    assertThrows(
        'Trying to remove a frozen property fails silently in strict mode.',
        goog.bind(stubs.remove, stubs, frozen, 'a'));

    window.frozen = frozen;
    assertThrows(
        'Trying to set a new frozen property by path fails silently in ' +
            'strict mode.',
        goog.bind(stubs.setPath, stubs, 'window.frozen.b', 2));
    assertThrows(
        'Trying to set a frozen property by path fails silently in strict ' +
            'mode.',
        goog.bind(stubs.setPath, stubs, 'window.frozen.a', 2));
  })();

  delete window.frozen;
}

// Test PropertyReplacer overriding Math.random.
function testMathRandom() {
  var stubs = new goog.testing.PropertyReplacer();
  stubs.set(Math, 'random', function() { return -1; });
  assertEquals('mocked Math.random', -1, Math.random());

  stubs.reset();
  assertNotEquals('original Math.random', -1, Math.random());
}

// Tests the replace method of PropertyReplacer.
function testReplace() {
  var stubs = new goog.testing.PropertyReplacer();
  function C() { this.a = 1; };
  C.prototype.b = 1;
  C.prototype.toString = function() { return 'obj'; };
  var obj = new C();

  stubs.replace(obj, 'a', 2);
  assertEquals('successfully replaced the own property of an object', 2, obj.a);

  stubs.replace(obj, 'b', 2);
  assertEquals('successfully replaced the property in the prototype', 2, obj.b);

  var error = assertThrows(
      'cannot replace missing key',
      goog.bind(stubs.replace, stubs, obj, 'unknown', 1));
  // Using assertContains instead of assertEquals because Opera 10.0 adds
  // the stack trace to the error message.
  assertEquals(
      'error message for missing key',
      'Cannot replace missing property "unknown" in obj', error.message);
  assertFalse('object not touched', 'unknown' in obj);

  var error = assertThrows(
      'cannot change value type',
      goog.bind(stubs.replace, stubs, obj, 'a', '3'));
  assertContains(
      'error message for type mismatch',
      'Cannot replace property "a" in obj with a value of different type',
      error.message);
}

// Tests altering complete namespace paths.
function testSetPath() {
  goog.global.a = {b: {}};
  var stubs = new goog.testing.PropertyReplacer();

  stubs.setPath('a.b.c.d', 1);
  assertObjectEquals('a.b.c.d=1', {b: {c: {d: 1}}}, goog.global.a);
  stubs.setPath('a.b.e', 2);
  assertObjectEquals('a.b.e=2', {b: {c: {d: 1}, e: 2}}, goog.global.a);
  stubs.setPath('a.f', 3);
  assertObjectEquals('a.f=3', {b: {c: {d: 1}, e: 2}, f: 3}, goog.global.a);
  stubs.setPath('a.f.g', 4);
  assertObjectEquals(
      'a.f.g=4', {b: {c: {d: 1}, e: 2}, f: {g: 4}}, goog.global.a);
  stubs.setPath('a', 5);
  assertEquals('a=5', 5, goog.global.a);

  stubs.setPath('x.y.z', 5);
  assertObjectEquals('x.y.z=5', {y: {z: 5}}, goog.global.x);

  stubs.reset();
  assertObjectEquals('a.* reset', {b: {}}, goog.global.a);
  // NOTE: it's impossible to delete global variables in Internet Explorer,
  // so ('x' in goog.global) would be true.
  assertUndefined('x.* reset', goog.global.x);
}

// Tests altering paths with functions in them.
function testSetPathWithFunction() {
  var f = function() {};
  goog.global.a = {b: f};
  var stubs = new goog.testing.PropertyReplacer();

  stubs.setPath('a.b.c', 1);
  assertEquals('a.b.c=1, f kept', f, goog.global.a.b);
  assertEquals('a.b.c=1, c set', 1, goog.global.a.b.c);

  stubs.setPath('a.b.prototype.d', 2);
  assertEquals('a.b.prototype.d=2, b kept', f, goog.global.a.b);
  assertEquals('a.b.prototype.d=2, c kept', 1, goog.global.a.b.c);
  assertFalse('a.b.prototype.d=2, a.b.d not set', 'd' in goog.global.a.b);
  assertTrue('a.b.prototype.d=2, proto set', 'd' in goog.global.a.b.prototype);
  assertEquals('a.b.prototype.d=2, d set', 2, new goog.global.a.b().d);

  var invalidSetPath = function() { stubs.setPath('a.prototype.e', 3); };
  assertThrows('setting the prototype of a non-function', invalidSetPath);

  stubs.reset();
  assertObjectEquals('a.b.c reset', {b: f}, goog.global.a);
  assertObjectEquals('a.b.prototype reset', {}, goog.global.a.b.prototype);
}

// Tests restoring original attribute values with restore() rather than reset().
function testRestore() {
  var stubs = new goog.testing.PropertyReplacer();
  var x = {a: 1, b: undefined};

  // Setting simple value.
  stubs.set(x, 'num', 1);
  assertEquals('x.num = 1', 1, x.num);
  stubs.restore(x, 'num');
  assertFalse('x.num removed', 'num' in x);

  // Setting undefined value.
  stubs.set(x, 'undef', undefined);
  assertTrue('x.undef = undefined', 'undef' in x && x.undef === undefined);
  stubs.restore(x, 'undef');
  assertFalse('x.undef removed', 'undef' in x);

  // Setting null value.
  stubs.set(x, 'null', null);
  assertTrue('x["null"] = null', x['null'] === null);
  stubs.restore(x, 'null');
  assertFalse('x["null"] removed', 'null' in x);

  // Setting a simple value that existed originally.
  stubs.set(x, 'b', null);
  assertTrue('x.b = null', x.b === null);

  // Setting a complex value.
  stubs.set(x, 'obj', {});
  assertEquals('x.obj = {}', 'object', typeof x.obj);
  stubs.set(x.obj, 'num', 2);
  assertEquals('x.obj.num = 2', 2, x.obj.num);
  stubs.restore(x.obj, 'num');
  assertFalse('x.obj.num removed', 'num' in x.obj);
  stubs.restore(x, 'obj');
  assertFalse('x.obj removed', 'obj' in x);

  // Setting a function.
  stubs.set(x, 'func', function(n) { return n + 1; });
  assertEquals('x.func = lambda n: n+1', 11, x.func(10));
  stubs.restore(x, 'func');
  assertFalse('x.func removed', 'func' in x);

  // Setting a constructor and a prototype method.
  stubs.set(x, 'Class', function(num) { this.num = num; });
  stubs.set(x.Class.prototype, 'triple', function() { return this.num * 3; });
  assertEquals('prototype method', 12, (new x.Class(4)).triple());
  stubs.restore(x, 'Class');
  assertFalse('x.Class removed', 'Class' in x);

  // Final cleanup with reset(). This should have no effect:
  // all assertions about the original state shall still hold.
  stubs.reset();
  assertEquals('x.a preserved', 1, x.a);
  assertTrue('x.b reset', 'b' in x && x.b === undefined);
  assertFalse('x.num removed', 'num' in x);
  assertFalse('x.undef removed', 'undef' in x);
  assertFalse('x["null"] removed', 'null' in x);
  assertFalse('x.obj removed', 'obj' in x);
  assertFalse('x.func removed', 'func' in x);
  assertFalse('x.Class removed', 'Class' in x);
}

// Tests restore() with invalid arguments.
function testRestoreWithInvalidArguments() {
  var stubs = new goog.testing.PropertyReplacer();
  var x = {a: 1, b: undefined};
  var y = {a: 1};

  stubs.set(x, 'a', 42);

  assertThrows(
      'Trying to restore state of an unmodified property',
      goog.bind(stubs.restore, stubs, x, 'b'));
  assertThrows(
      'Trying to restore state of a non-existing property',
      goog.bind(stubs.restore, stubs, x, 'not_here'));
  assertThrows(
      'Trying to restore state of an unmodified object',
      goog.bind(stubs.restore, stubs, y, 'a'));
}
