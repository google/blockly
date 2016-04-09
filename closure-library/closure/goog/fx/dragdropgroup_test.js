// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.fx.DragDropGroupTest');
goog.setTestOnly('goog.fx.DragDropGroupTest');

goog.require('goog.events');
goog.require('goog.fx.DragDropGroup');
goog.require('goog.testing.jsunit');

var s1;
var s2;
var t1;
var t2;

var source = null;
var target = null;

function setUpPage() {
  s1 = document.getElementById('s1');
  s2 = document.getElementById('s2');
  t1 = document.getElementById('t1');
  t2 = document.getElementById('t2');
}


function setUp() {
  source = new goog.fx.DragDropGroup();
  source.setSourceClass('ss');
  source.setTargetClass('st');

  target = new goog.fx.DragDropGroup();
  target.setSourceClass('ts');
  target.setTargetClass('tt');

  source.addTarget(target);
}


function tearDown() {
  source.removeItems();
  target.removeItems();
}


function addElementsToGroups() {
  source.addItem(s1);
  source.addItem(s2);
  target.addItem(t1);
  target.addItem(t2);
}


function testAddItemsBeforeInit() {
  addElementsToGroups();
  source.init();
  target.init();

  assertEquals(2, source.items_.length);
  assertEquals(2, target.items_.length);

  assertEquals('s ss', s1.className);
  assertEquals('s ss', s2.className);
  assertEquals('t tt', t1.className);
  assertEquals('t tt', t2.className);

  assertTrue(goog.events.hasListener(s1));
  assertTrue(goog.events.hasListener(s2));
  assertFalse(goog.events.hasListener(t1));
  assertFalse(goog.events.hasListener(t2));
}

function testAddItemsAfterInit() {
  source.init();
  target.init();
  addElementsToGroups();

  assertEquals(2, source.items_.length);
  assertEquals(2, target.items_.length);

  assertEquals('s ss', s1.className);
  assertEquals('s ss', s2.className);
  assertEquals('t tt', t1.className);
  assertEquals('t tt', t2.className);

  assertTrue(goog.events.hasListener(s1));
  assertTrue(goog.events.hasListener(s2));
  assertFalse(goog.events.hasListener(t1));
  assertFalse(goog.events.hasListener(t2));
}


function testRemoveItems() {
  source.init();
  target.init();
  addElementsToGroups();

  assertEquals(2, source.items_.length);
  assertEquals(s1, source.items_[0].element);
  assertEquals(s2, source.items_[1].element);

  assertEquals('s ss', s1.className);
  assertEquals('s ss', s2.className);
  assertTrue(goog.events.hasListener(s1));
  assertTrue(goog.events.hasListener(s2));

  source.removeItems();

  assertEquals(0, source.items_.length);

  assertEquals('s', s1.className);
  assertEquals('s', s2.className);
  assertFalse(goog.events.hasListener(s1));
  assertFalse(goog.events.hasListener(s2));
}

function testRemoveSourceItem1() {
  source.init();
  target.init();
  addElementsToGroups();

  assertEquals(2, source.items_.length);
  assertEquals(s1, source.items_[0].element);
  assertEquals(s2, source.items_[1].element);

  assertEquals('s ss', s1.className);
  assertEquals('s ss', s2.className);
  assertTrue(goog.events.hasListener(s1));
  assertTrue(goog.events.hasListener(s2));

  source.removeItem(s1);

  assertEquals(1, source.items_.length);
  assertEquals(s2, source.items_[0].element);

  assertEquals('s', s1.className);
  assertEquals('s ss', s2.className);
  assertFalse(goog.events.hasListener(s1));
  assertTrue(goog.events.hasListener(s2));
}


function testRemoveSourceItem2() {
  source.init();
  target.init();
  addElementsToGroups();

  assertEquals(2, source.items_.length);
  assertEquals(s1, source.items_[0].element);
  assertEquals(s2, source.items_[1].element);

  assertEquals('s ss', s1.className);
  assertEquals('s ss', s2.className);
  assertTrue(goog.events.hasListener(s1));
  assertTrue(goog.events.hasListener(s2));

  source.removeItem(s2);

  assertEquals(1, source.items_.length);
  assertEquals(s1, source.items_[0].element);

  assertEquals('s ss', s1.className);
  assertEquals('s', s2.className);
  assertTrue(goog.events.hasListener(s1));
  assertFalse(goog.events.hasListener(s2));
}


function testRemoveTargetItem1() {
  source.init();
  target.init();
  addElementsToGroups();

  assertEquals(2, target.items_.length);
  assertEquals(t1, target.items_[0].element);
  assertEquals(t2, target.items_[1].element);

  assertEquals('t tt', t1.className);
  assertEquals('t tt', t2.className);
  assertFalse(goog.events.hasListener(t1));
  assertFalse(goog.events.hasListener(t2));

  target.removeItem(t1);

  assertEquals(1, target.items_.length);
  assertEquals(t2, target.items_[0].element);

  assertEquals('t', t1.className);
  assertEquals('t tt', t2.className);
  assertFalse(goog.events.hasListener(t1));
  assertFalse(goog.events.hasListener(t2));
}


function testRemoveTargetItem2() {
  source.init();
  target.init();
  addElementsToGroups();

  assertEquals(2, target.items_.length);
  assertEquals(t1, target.items_[0].element);
  assertEquals(t2, target.items_[1].element);

  assertEquals('t tt', t1.className);
  assertEquals('t tt', t2.className);
  assertFalse(goog.events.hasListener(t1));
  assertFalse(goog.events.hasListener(t2));

  target.removeItem(t2);

  assertEquals(1, target.items_.length);
  assertEquals(t1, target.items_[0].element);

  assertEquals('t tt', t1.className);
  assertEquals('t', t2.className);
  assertFalse(goog.events.hasListener(t1));
  assertFalse(goog.events.hasListener(t2));
}
