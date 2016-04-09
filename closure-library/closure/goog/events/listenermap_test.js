// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Tests for listenermap.js.
 *
 * Most of this class functionality is already tested by
 * goog.events.EventTarget tests. This test file only provides tests
 * for features that are not direct duplicates of tests in
 * goog.events.EventTarget.
 */

goog.provide('goog.events.ListenerMapTest');
goog.setTestOnly('goog.events.ListenerMapTest');

goog.require('goog.dispose');
goog.require('goog.events');
goog.require('goog.events.EventId');
goog.require('goog.events.EventTarget');
goog.require('goog.events.ListenerMap');
goog.require('goog.testing.jsunit');


var et, map;
var handler1 = function() {};
var handler2 = function() {};
var handler3 = function() {};
var CLICK_EVENT_ID = new goog.events.EventId(goog.events.getUniqueId('click'));


function setUp() {
  et = new goog.events.EventTarget();
  map = new goog.events.ListenerMap(et);
}


function tearDown() {
  goog.dispose(et);
}


function testGetTypeCount() {
  assertEquals(0, map.getTypeCount());

  map.add('click', handler1, false);
  assertEquals(1, map.getTypeCount());
  map.remove('click', handler1);
  assertEquals(0, map.getTypeCount());

  map.add(CLICK_EVENT_ID, handler1, false);
  assertEquals(1, map.getTypeCount());
  map.remove(CLICK_EVENT_ID, handler1);
  assertEquals(0, map.getTypeCount());

  map.add('click', handler1, false, true);
  assertEquals(1, map.getTypeCount());
  map.remove('click', handler1, true);
  assertEquals(0, map.getTypeCount());

  map.add(CLICK_EVENT_ID, handler1, false, true);
  assertEquals(1, map.getTypeCount());
  map.remove(CLICK_EVENT_ID, handler1, true);
  assertEquals(0, map.getTypeCount());

  map.add('click', handler1, false);
  map.add('click', handler1, false, true);
  assertEquals(1, map.getTypeCount());
  map.remove('click', handler1);
  assertEquals(1, map.getTypeCount());
  map.remove('click', handler1, true);
  assertEquals(0, map.getTypeCount());

  map.add(CLICK_EVENT_ID, handler1, false);
  map.add(CLICK_EVENT_ID, handler1, false, true);
  assertEquals(1, map.getTypeCount());
  map.remove(CLICK_EVENT_ID, handler1);
  assertEquals(1, map.getTypeCount());
  map.remove(CLICK_EVENT_ID, handler1, true);
  assertEquals(0, map.getTypeCount());

  map.add('click', handler1, false);
  map.add('touchstart', handler2, false);
  map.add(CLICK_EVENT_ID, handler3, false);
  assertEquals(3, map.getTypeCount());
  map.remove(CLICK_EVENT_ID, handler3);
  assertEquals(2, map.getTypeCount());
  map.remove('touchstart', handler2);
  assertEquals(1, map.getTypeCount());
  map.remove('click', handler1);
  assertEquals(0, map.getTypeCount());
}


function testGetListenerCount() {
  assertEquals(0, map.getListenerCount());

  map.add('click', handler1, false);
  assertEquals(1, map.getListenerCount());
  map.remove('click', handler1);
  assertEquals(0, map.getListenerCount());

  map.add(CLICK_EVENT_ID, handler1, false);
  assertEquals(1, map.getListenerCount());
  map.remove(CLICK_EVENT_ID, handler1);
  assertEquals(0, map.getListenerCount());

  map.add('click', handler1, false, true);
  assertEquals(1, map.getListenerCount());
  map.remove('click', handler1, true);
  assertEquals(0, map.getListenerCount());

  map.add(CLICK_EVENT_ID, handler1, false, true);
  assertEquals(1, map.getListenerCount());
  map.remove(CLICK_EVENT_ID, handler1, true);
  assertEquals(0, map.getListenerCount());

  map.add('click', handler1, false);
  map.add('click', handler1, false, true);
  assertEquals(2, map.getListenerCount());
  map.remove('click', handler1);
  map.remove('click', handler1, true);
  assertEquals(0, map.getListenerCount());

  map.add(CLICK_EVENT_ID, handler1, false);
  map.add(CLICK_EVENT_ID, handler1, false, true);
  assertEquals(2, map.getListenerCount());
  map.remove(CLICK_EVENT_ID, handler1);
  map.remove(CLICK_EVENT_ID, handler1, true);
  assertEquals(0, map.getListenerCount());

  map.add('click', handler1, false);
  map.add('touchstart', handler2, false);
  map.add(CLICK_EVENT_ID, handler3, false);
  assertEquals(3, map.getListenerCount());
  map.remove(CLICK_EVENT_ID, handler3);
  map.remove('touchstart', handler2);
  map.remove('click', handler1);
  assertEquals(0, map.getListenerCount());
}


function testListenerSourceIsSetCorrectly() {
  map.add('click', handler1, false);
  var listener = map.getListener('click', handler1);
  assertEquals(et, listener.src);

  map.add(CLICK_EVENT_ID, handler2, false);
  listener = map.getListener(CLICK_EVENT_ID, handler2);
  assertEquals(et, listener.src);
}
