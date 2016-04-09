// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.acTest');
goog.setTestOnly('goog.ui.acTest');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.classlist');
goog.require('goog.dom.selection');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.style');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.ac');
goog.require('goog.userAgent');
var autocomplete;
var data = ['ab', 'aab', 'aaab'];
var input;
var mockClock;

function setUpPage() {
  goog.ui.ac.createSimpleAutoComplete(
      data, goog.dom.getElement('user'), true, false);
}

function setUp() {
  mockClock = new goog.testing.MockClock(true);
  input = goog.dom.getElement('input');
  input.value = '';
  autocomplete = goog.ui.ac.createSimpleAutoComplete(data, input, true, false);
}

function tearDown() {
  autocomplete.dispose();
  mockClock.dispose();
}

//=========================================================================
// Utility methods


/**
 * Fire listeners of a given type that are listening to the event's
 * currentTarget.
 *
 * @param {goog.events.BrowserEvent} event
 */
function simulateEvent(event) {
  goog.events.fireListeners(event.currentTarget, event.type, true, event);
  goog.events.fireListeners(event.currentTarget, event.type, false, event);
}


/**
 * Fire all key event listeners that are listening to the input element.
 *
 * @param {number} keyCode The key code.
 */
function simulateAllKeyEventsOnInput(keyCode) {
  var eventTypes = [
    goog.events.EventType.KEYDOWN, goog.events.EventType.KEYPRESS,
    goog.events.EventType.KEYUP
  ];

  goog.array.forEach(eventTypes, function(type) {
    var event = new goog.events.Event(type, input);
    event.keyCode = keyCode;
    simulateEvent(new goog.events.BrowserEvent(event, input));
  });
}


/**
 * @param {string} text
 * @return {Node} Node whose inner text maches the given text.
 */
function findNodeByInnerText(text) {
  return goog.dom.findNode(document.body, function(node) {
    try {
      var display = goog.userAgent.IE ?
          goog.style.getCascadedStyle(node, 'display') :
          goog.style.getComputedStyle(node, 'display');

      return goog.dom.getRawTextContent(node) == text && 'none' != display &&
          node.nodeType == goog.dom.NodeType.ELEMENT;
    } catch (e) {
      return false;
    }
  });
}

//=========================================================================
// Tests


/**
 * Ensure that the display of the autocompleter works.
 */
function testBasicDisplay() {
  simulateAllKeyEventsOnInput(goog.events.KeyCodes.DOWN);

  input.value = 'a';
  simulateAllKeyEventsOnInput(goog.events.KeyCodes.A);
  mockClock.tick(500);

  var nodes = [
    findNodeByInnerText(data[0]), findNodeByInnerText(data[1]),
    findNodeByInnerText(data[2])
  ];
  assert(!!nodes[0]);
  assert(!!nodes[1]);
  assert(!!nodes[2]);
  assert(goog.style.isUnselectable(nodes[0]));
  assert(goog.style.isUnselectable(nodes[1]));
  assert(goog.style.isUnselectable(nodes[2]));

  input.value = 'aa';
  simulateAllKeyEventsOnInput(goog.events.KeyCodes.A);
  mockClock.tick(500);

  assertFalse(!!findNodeByInnerText(data[0]));
  assert(!!findNodeByInnerText(data[1]));
  assert(!!findNodeByInnerText(data[2]));
}


/**
 * Ensure that key navigation with multiple inputs work
 */
function testKeyNavigation() {
  simulateAllKeyEventsOnInput(goog.events.KeyCodes.DOWN);

  input.value = 'c, a';
  goog.dom.selection.setCursorPosition(input, 'c, a'.length);
  simulateAllKeyEventsOnInput(goog.events.KeyCodes.A);
  mockClock.tick(500);

  assert(document.body.innerHTML, !!findNodeByInnerText(data[1]));
  assert(!!findNodeByInnerText(data[2]));

  var selected = goog.asserts.assertElement(findNodeByInnerText(data[0]));
  assertTrue(
      'Should have new standard active class',
      goog.dom.classlist.contains(selected, 'ac-active'));
  assertTrue(
      'Should have legacy active class',
      goog.dom.classlist.contains(selected, 'active'));

  simulateAllKeyEventsOnInput(goog.events.KeyCodes.DOWN);
  assertFalse(
      goog.dom.classlist.contains(
          goog.asserts.assertElement(findNodeByInnerText(data[0])),
          'ac-active'));
  assert(
      goog.dom.classlist.contains(
          goog.asserts.assertElement(findNodeByInnerText(data[1])),
          'ac-active'));

  simulateAllKeyEventsOnInput(goog.events.KeyCodes.ENTER);
  assertEquals('c, aab, ', input.value);
}


/**
 * Ensure that mouse navigation with multiple inputs works.
 */
function testMouseNavigation() {
  simulateAllKeyEventsOnInput(goog.events.KeyCodes.DOWN);

  input.value = 'c, a';
  goog.dom.selection.setCursorPosition(input, 'c, a'.length);
  simulateAllKeyEventsOnInput(goog.events.KeyCodes.A);
  mockClock.tick(500);

  var secondOption = goog.asserts.assertElement(findNodeByInnerText(data[1]));
  var parent = secondOption.parentNode;
  assertFalse(goog.dom.classlist.contains(secondOption, 'ac-active'));

  var mouseOver =
      new goog.events.Event(goog.events.EventType.MOUSEOVER, secondOption);
  simulateEvent(new goog.events.BrowserEvent(mouseOver, parent));
  assert(goog.dom.classlist.contains(secondOption, 'ac-active'));

  var mouseDown =
      new goog.events.Event(goog.events.EventType.MOUSEDOWN, secondOption);
  simulateEvent(new goog.events.BrowserEvent(mouseDown, parent));
  var mouseClick =
      new goog.events.Event(goog.events.EventType.CLICK, secondOption);
  simulateEvent(new goog.events.BrowserEvent(mouseClick, parent));

  assertEquals('c, aab, ', input.value);
}
