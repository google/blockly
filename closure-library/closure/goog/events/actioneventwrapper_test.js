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

goog.provide('goog.events.actionEventWrapperTest');
goog.setTestOnly('goog.events.actionEventWrapperTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Role');
goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.actionEventWrapper');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
var a, eh, events;

function setUpPage() {
  a = document.getElementById('a');
}

function setUp() {
  events = [];
  eh = new goog.events.EventHandler();

  assertEquals('No listeners registered yet', 0,
      goog.events.getListeners(a).length);
}


function tearDown() {
  eh.dispose();
}

var Foo = function() {};
Foo.prototype.test = function(e) {
  events.push(e);
};

function assertListenersExist(el, listenerCount, capt) {
  var EVENT_TYPES = goog.events.ActionEventWrapper_.EVENT_TYPES_;
  for (var i = 0; i < EVENT_TYPES.length; ++i) {
    assertEquals(listenerCount, goog.events.getListeners(
        el, EVENT_TYPES[i], capt).length);
  }
}

function testAddActionListener() {
  var listener = function(e) { events.push(e);};
  goog.events.listenWithWrapper(a, goog.events.actionEventWrapper, listener);

  assertListenersExist(a, 1, false);

  goog.testing.events.fireClickSequence(a);
  assertEquals('1 event should have been dispatched', 1, events.length);
  assertEquals('Should be an click event', 'click', events[0].type);

  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.ENTER);
  assertEquals('2 events should have been dispatched', 2, events.length);
  assertEquals('Should be a keypress event', 'keypress', events[1].type);

  goog.a11y.aria.setRole(
      /** @type {!Element} */ (a), goog.a11y.aria.Role.BUTTON);
  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.SPACE);
  assertEquals('3 events should have been dispatched', 3, events.length);
  assertEquals('Should be a keyup event', 'keyup', events[2].type);
  assertTrue('Should be default prevented.', events[2].defaultPrevented);
  goog.a11y.aria.removeRole(/** @type {!Element} */ (a));

  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.SPACE);
  assertEquals('3 events should have been dispatched', 3, events.length);

  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.ESC);
  assertEquals('3 events should have been dispatched', 3, events.length);

  goog.a11y.aria.setRole(
      /** @type {!Element} */ (a), goog.a11y.aria.Role.TAB);
  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.SPACE);
  assertEquals('4 events should have been dispatched', 4, events.length);
  assertEquals('Should be a keyup event', 'keyup', events[2].type);
  assertTrue('Should be default prevented.', events[2].defaultPrevented);
  goog.a11y.aria.removeRole(/** @type {!Element} */ (a));

  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.SPACE);
  assertEquals('4 events should have been dispatched', 4, events.length);

  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.ESC);
  assertEquals('4 events should have been dispatched', 4, events.length);

  goog.events.unlistenWithWrapper(a, goog.events.actionEventWrapper,
      listener);
  assertListenersExist(a, 0, false);
}


function testAddActionListenerForHandleEvent() {
  var listener = {
    handleEvent: function(e) { events.push(e); }
  };
  goog.events.listenWithWrapper(a, goog.events.actionEventWrapper, listener);

  assertListenersExist(a, 1, false);

  goog.testing.events.fireClickSequence(a);
  assertEquals('1 event should have been dispatched', 1, events.length);
  assertEquals('Should be an click event', 'click', events[0].type);

  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.ENTER);
  assertEquals('2 events should have been dispatched', 2, events.length);
  assertEquals('Should be a keypress event', 'keypress', events[1].type);

  goog.a11y.aria.setRole(
      /** @type {!Element} */ (a), goog.a11y.aria.Role.BUTTON);
  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.SPACE);
  assertEquals('3 events should have been dispatched', 3, events.length);
  assertEquals('Should be a keyup event', 'keyup', events[2].type);
  assertTrue('Should be default prevented.', events[2].defaultPrevented);
  goog.a11y.aria.removeRole(/** @type {!Element} */ (a));

  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.SPACE);
  assertEquals('3 events should have been dispatched', 3, events.length);

  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.ESC);
  assertEquals('3 events should have been dispatched', 3, events.length);

  goog.events.unlistenWithWrapper(a, goog.events.actionEventWrapper,
      listener);
  assertListenersExist(a, 0, false);
}


function testAddActionListenerInCaptPhase() {
  var count = 0;
  var captListener = function(e) {
    events.push(e);
    assertEquals(0, count);
    count++;
  };

  var bubbleListener = function(e) {
    events.push(e);
    assertEquals(1, count);
    count = 0;
  };

  goog.events.listenWithWrapper(a, goog.events.actionEventWrapper,
      captListener, true);

  goog.events.listenWithWrapper(a, goog.events.actionEventWrapper,
      bubbleListener);

  assertListenersExist(a, 1, false);
  assertListenersExist(a, 1, true);

  goog.testing.events.fireClickSequence(a);
  assertEquals('2 event should have been dispatched', 2, events.length);
  assertEquals('Should be an click event', 'click', events[0].type);

  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.ENTER);
  assertEquals('4 events should have been dispatched', 4, events.length);
  assertEquals('Should be a keypress event', 'keypress', events[2].type);

  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.SPACE);
  assertEquals('4 events should have been dispatched', 4, events.length);

  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.ESC);
  assertEquals('4 events should have been dispatched', 4, events.length);

  goog.events.unlistenWithWrapper(a, goog.events.actionEventWrapper,
      captListener, true);
  goog.events.unlistenWithWrapper(a, goog.events.actionEventWrapper,
      bubbleListener);

  assertListenersExist(a, 0, false);
  assertListenersExist(a, 0, true);
}


function testRemoveActionListener() {
  var listener1 = function(e) { events.push(e); };
  var listener2 = function(e) { events.push({type: 'err'}); };

  goog.events.listenWithWrapper(a, goog.events.actionEventWrapper, listener1);
  assertListenersExist(a, 1, false);

  goog.events.listenWithWrapper(a, goog.events.actionEventWrapper, listener2);
  assertListenersExist(a, 2, false);

  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.ENTER);
  assertEquals('2 events should have been dispatched', 2, events.length);
  assertEquals('Should be a keypress event', 'keypress', events[0].type);
  assertEquals('Should be an err event', 'err', events[1].type);

  goog.events.unlistenWithWrapper(a, goog.events.actionEventWrapper,
      listener2);
  assertListenersExist(a, 1, false);

  events = [];
  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.ENTER);
  assertEquals('1 event should have been dispatched', 1, events.length);
  assertEquals('Should be a keypress event', 'keypress', events[0].type);

  goog.events.unlistenWithWrapper(a, goog.events.actionEventWrapper,
      listener1);
  assertListenersExist(a, 0, false);
}


function testEventHandlerActionListener() {
  var listener = function(e) { events.push(e); };
  eh.listenWithWrapper(a, goog.events.actionEventWrapper, listener);

  assertListenersExist(a, 1, false);

  goog.testing.events.fireClickSequence(a);
  assertEquals('1 event should have been dispatched', 1, events.length);
  assertEquals('Should be an click event', 'click', events[0].type);

  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.ENTER);
  assertEquals('2 events should have been dispatched', 2, events.length);
  assertEquals('Should be a keypress event', 'keypress', events[1].type);

  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.SPACE);
  assertEquals('2 events should have been dispatched', 2, events.length);

  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.ESC);
  assertEquals('2 events should have been dispatched', 2, events.length);

  eh.unlistenWithWrapper(a, goog.events.actionEventWrapper,
      listener);
  assertListenersExist(a, 0, false);
}


function testEventHandlerActionListenerWithScope() {
  var foo = new Foo();
  var eh2 = new goog.events.EventHandler(foo);

  eh2.listenWithWrapper(a, goog.events.actionEventWrapper, foo.test);

  assertListenersExist(a, 1, false);

  goog.testing.events.fireClickSequence(a);
  assertEquals('1 event should have been dispatched', 1, events.length);
  assertEquals('Should be an click event', 'click', events[0].type);

  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.ENTER);
  assertEquals('2 events should have been dispatched', 2, events.length);
  assertEquals('Should be a keypress event', 'keypress', events[1].type);

  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.SPACE);
  assertEquals('2 events should have been dispatched', 2, events.length);

  goog.testing.events.fireKeySequence(a, goog.events.KeyCodes.ESC);
  assertEquals('2 events should have been dispatched', 2, events.length);

  eh2.dispose();
  assertListenersExist(a, 0, false);
  delete foo;
}
