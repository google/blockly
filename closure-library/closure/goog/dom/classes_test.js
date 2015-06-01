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

/**
 * @fileoverview Shared code for classes_test.html & classes_quirks_test.html.
 */

goog.provide('goog.dom.classes_test');
goog.setTestOnly('goog.dom.classes_test');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classes');
goog.require('goog.testing.jsunit');


var classes = goog.dom.classes;

function testGet() {
  var el = document.createElement(goog.dom.TagName.DIV);
  assertArrayEquals([], goog.dom.classes.get(el));
  el.className = 'C';
  assertArrayEquals(['C'], goog.dom.classes.get(el));
  el.className = 'C D';
  assertArrayEquals(['C', 'D'], goog.dom.classes.get(el));
  el.className = 'C\nD';
  assertArrayEquals(['C', 'D'], goog.dom.classes.get(el));
  el.className = ' C ';
  assertArrayEquals(['C'], goog.dom.classes.get(el));
}

function testSetAddHasRemove() {
  var el = goog.dom.getElement('p1');
  classes.set(el, 'SOMECLASS');
  assertTrue('Should have SOMECLASS', classes.has(el, 'SOMECLASS'));

  classes.set(el, 'OTHERCLASS');
  assertTrue('Should have OTHERCLASS', classes.has(el, 'OTHERCLASS'));
  assertFalse('Should not have SOMECLASS', classes.has(el, 'SOMECLASS'));

  classes.add(el, 'WOOCLASS');
  assertTrue('Should have OTHERCLASS', classes.has(el, 'OTHERCLASS'));
  assertTrue('Should have WOOCLASS', classes.has(el, 'WOOCLASS'));

  classes.add(el, 'ACLASS', 'BCLASS', 'CCLASS');
  assertTrue('Should have OTHERCLASS', classes.has(el, 'OTHERCLASS'));
  assertTrue('Should have WOOCLASS', classes.has(el, 'WOOCLASS'));
  assertTrue('Should have ACLASS', classes.has(el, 'ACLASS'));
  assertTrue('Should have BCLASS', classes.has(el, 'BCLASS'));
  assertTrue('Should have CCLASS', classes.has(el, 'CCLASS'));

  classes.remove(el, 'CCLASS');
  assertTrue('Should have OTHERCLASS', classes.has(el, 'OTHERCLASS'));
  assertTrue('Should have WOOCLASS', classes.has(el, 'WOOCLASS'));
  assertTrue('Should have ACLASS', classes.has(el, 'ACLASS'));
  assertTrue('Should have BCLASS', classes.has(el, 'BCLASS'));
  assertFalse('Should not have CCLASS', classes.has(el, 'CCLASS'));

  classes.remove(el, 'ACLASS', 'BCLASS');
  assertTrue('Should have OTHERCLASS', classes.has(el, 'OTHERCLASS'));
  assertTrue('Should have WOOCLASS', classes.has(el, 'WOOCLASS'));
  assertFalse('Should not have ACLASS', classes.has(el, 'ACLASS'));
  assertFalse('Should not have BCLASS', classes.has(el, 'BCLASS'));
}

// While support for this isn't implied in the method documentation,
// this is a frequently used pattern.
function testAddWithSpacesInClassName() {
  var el = goog.dom.getElement('p1');
  classes.add(el, 'CLASS1 CLASS2', 'CLASS3 CLASS4');
  assertTrue('Should have CLASS1', classes.has(el, 'CLASS1'));
  assertTrue('Should have CLASS2', classes.has(el, 'CLASS2'));
  assertTrue('Should have CLASS3', classes.has(el, 'CLASS3'));
  assertTrue('Should have CLASS4', classes.has(el, 'CLASS4'));
}

function testSwap() {
  var el = goog.dom.getElement('p1');
  classes.set(el, 'SOMECLASS FIRST');

  assertTrue('Should have FIRST class', classes.has(el, 'FIRST'));
  assertTrue('Should have FIRST class', classes.has(el, 'SOMECLASS'));
  assertFalse('Should not have second class', classes.has(el, 'second'));

  classes.swap(el, 'FIRST', 'second');

  assertFalse('Should not have FIRST class', classes.has(el, 'FIRST'));
  assertTrue('Should have FIRST class', classes.has(el, 'SOMECLASS'));
  assertTrue('Should have second class', classes.has(el, 'second'));

  classes.swap(el, 'second', 'FIRST');

  assertTrue('Should have FIRST class', classes.has(el, 'FIRST'));
  assertTrue('Should have FIRST class', classes.has(el, 'SOMECLASS'));
  assertFalse('Should not have second class', classes.has(el, 'second'));
}

function testEnable() {
  var el = goog.dom.getElement('p1');
  classes.set(el, 'SOMECLASS FIRST');

  assertTrue('Should have FIRST class', classes.has(el, 'FIRST'));
  assertTrue('Should have SOMECLASS class', classes.has(el, 'SOMECLASS'));

  classes.enable(el, 'FIRST', false);

  assertFalse('Should not have FIRST class', classes.has(el, 'FIRST'));
  assertTrue('Should have SOMECLASS class', classes.has(el, 'SOMECLASS'));

  classes.enable(el, 'FIRST', true);

  assertTrue('Should have FIRST class', classes.has(el, 'FIRST'));
  assertTrue('Should have SOMECLASS class', classes.has(el, 'SOMECLASS'));
}

function testToggle() {
  var el = goog.dom.getElement('p1');
  classes.set(el, 'SOMECLASS FIRST');

  assertTrue('Should have FIRST class', classes.has(el, 'FIRST'));
  assertTrue('Should have SOMECLASS class', classes.has(el, 'SOMECLASS'));

  classes.toggle(el, 'FIRST');

  assertFalse('Should not have FIRST class', classes.has(el, 'FIRST'));
  assertTrue('Should have SOMECLASS class', classes.has(el, 'SOMECLASS'));

  classes.toggle(el, 'FIRST');

  assertTrue('Should have FIRST class', classes.has(el, 'FIRST'));
  assertTrue('Should have SOMECLASS class', classes.has(el, 'SOMECLASS'));
}

function testAddNotAddingMultiples() {
  var el = goog.dom.getElement('span6');
  assertTrue(classes.add(el, 'A'));
  assertEquals('A', el.className);
  assertFalse(classes.add(el, 'A'));
  assertEquals('A', el.className);
  assertFalse(classes.add(el, 'B', 'B'));
  assertEquals('A B', el.className);
}

function testAddRemoveString() {
  var el = goog.dom.getElement('span6');
  el.className = 'A';

  goog.dom.classes.addRemove(el, 'A', 'B');
  assertEquals('B', el.className);

  goog.dom.classes.addRemove(el, null, 'C');
  assertEquals('B C', el.className);

  goog.dom.classes.addRemove(el, 'C', 'D');
  assertEquals('B D', el.className);

  goog.dom.classes.addRemove(el, 'D', null);
  assertEquals('B', el.className);
}

function testAddRemoveArray() {
  var el = goog.dom.getElement('span6');
  el.className = 'A';

  goog.dom.classes.addRemove(el, ['A'], ['B']);
  assertEquals('B', el.className);

  goog.dom.classes.addRemove(el, [], ['C']);
  assertEquals('B C', el.className);

  goog.dom.classes.addRemove(el, ['C'], ['D']);
  assertEquals('B D', el.className);

  goog.dom.classes.addRemove(el, ['D'], []);
  assertEquals('B', el.className);
}

function testAddRemoveMultiple() {
  var el = goog.dom.getElement('span6');
  el.className = 'A';

  goog.dom.classes.addRemove(el, ['A'], ['B', 'C', 'D']);
  assertEquals('B C D', el.className);

  goog.dom.classes.addRemove(el, [], ['E', 'F']);
  assertEquals('B C D E F', el.className);

  goog.dom.classes.addRemove(el, ['C', 'E'], []);
  assertEquals('B D F', el.className);

  goog.dom.classes.addRemove(el, ['B'], ['G']);
  assertEquals('D F G', el.className);
}

// While support for this isn't implied in the method documentation,
// this is a frequently used pattern.
function testAddRemoveWithSpacesInClassName() {
  var el = goog.dom.getElement('p1');
  classes.addRemove(el, '', 'CLASS1 CLASS2');
  assertTrue('Should have CLASS1', classes.has(el, 'CLASS1'));
  assertTrue('Should have CLASS2', classes.has(el, 'CLASS2'));
}

function testHasWithNewlines() {
  var el = goog.dom.getElement('p3');
  assertTrue('Should have SOMECLASS', classes.has(el, 'SOMECLASS'));
  assertTrue('Should also have OTHERCLASS', classes.has(el, 'OTHERCLASS'));
  assertFalse('Should not have WEIRDCLASS', classes.has(el, 'WEIRDCLASS'));
}

function testEmptyClassNames() {
  var el = goog.dom.getElement('span1');
  // At the very least, make sure these do not error out.
  assertFalse('Should not have an empty class', classes.has(el, ''));
  classes.add(el, '');
  classes.toggle(el, '');
  assertFalse('Should not remove an empty class', classes.remove(el, ''));
  classes.swap(el, '', 'OTHERCLASS');
  classes.swap(el, 'TEST1', '');
  classes.addRemove(el, '', '');
}
