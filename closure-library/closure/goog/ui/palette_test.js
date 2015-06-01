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

goog.provide('goog.ui.PaletteTest');
goog.setTestOnly('goog.ui.PaletteTest');

goog.require('goog.a11y.aria');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyEvent');
goog.require('goog.testing.events.Event');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');
goog.require('goog.ui.Component');
goog.require('goog.ui.Container');
goog.require('goog.ui.Palette');

var palette;
var nodes;

function setUp() {
  nodes = [];
  for (var i = 0; i < 23; i++) {
    var node = goog.dom.createTextNode('node[' + i + ']');
    nodes.push(node);
  }
  palette = new goog.ui.Palette(nodes);
}

function tearDown() {
  palette.dispose();
  document.getElementById('sandbox').innerHTML = '';
}

function testAfterHighlightListener() {
  palette.setHighlightedIndex(0);
  var handler = new goog.testing.recordFunction();
  goog.events.listen(palette,
      goog.ui.Palette.EventType.AFTER_HIGHLIGHT, handler);
  palette.setHighlightedIndex(2);
  assertEquals(1, handler.getCallCount());
  palette.setHighlightedIndex(-1);
  assertEquals(2, handler.getCallCount());
}

function testHighlightItemUpdatesParentA11yActiveDescendant() {
  var container = new goog.ui.Container();
  container.render(document.getElementById('sandbox'));
  container.addChild(palette, true);

  palette.setHighlightedItem(nodes[0]);
  assertEquals('Node 0 cell should be the container\'s active descendant',
      palette.getRenderer().getCellForItem(nodes[0]),
      goog.a11y.aria.getActiveDescendant(container.getElement()));

  palette.setHighlightedItem(nodes[1]);
  assertEquals('Node 1 cell should be the container\'s active descendant',
      palette.getRenderer().getCellForItem(nodes[1]),
      goog.a11y.aria.getActiveDescendant(container.getElement()));

  palette.setHighlightedItem();
  assertNull('Container should have no active descendant',
      goog.a11y.aria.getActiveDescendant(container.getElement()));

  container.dispose();
}

function testHighlightCellEvents() {
  var container = new goog.ui.Container();
  container.render(document.getElementById('sandbox'));
  container.addChild(palette, true);
  var renderer = palette.getRenderer();

  var events = [];
  var targetElements = [];
  var handleEvent = function(e) {
    events.push(e);
    targetElements.push(e.target.getElement());
  };
  palette.getHandler().listen(palette, [
    this, goog.ui.Component.EventType.HIGHLIGHT,
    this, goog.ui.Component.EventType.UNHIGHLIGHT
  ], handleEvent);

  // Test highlight events on first selection
  palette.setHighlightedItem(nodes[0]);
  assertEquals('Should have fired 1 event', 1, events.length);
  assertEquals('HIGHLIGHT event should be fired',
      goog.ui.Component.EventType.HIGHLIGHT, events[0].type);
  assertEquals('Event should be fired for node[0] cell',
      renderer.getCellForItem(nodes[0]), targetElements[0]);

  events = [];
  targetElements = [];

  // Only fire highlight events when there is a selection change
  palette.setHighlightedItem(nodes[0]);
  assertEquals('Should have fired 0 events', 0, events.length);

  // Test highlight events on cell change
  palette.setHighlightedItem(nodes[1]);
  assertEquals('Should have fired 2 events', 2, events.length);
  var unhighlightEvent = events.shift();
  var highlightEvent = events.shift();
  assertEquals('UNHIGHLIGHT should be fired first',
      goog.ui.Component.EventType.UNHIGHLIGHT, unhighlightEvent.type);
  assertEquals('UNHIGHLIGHT should be fired for node[0] cell',
      renderer.getCellForItem(nodes[0]), targetElements[0]);
  assertEquals('HIGHLIGHT should be fired after UNHIGHLIGHT',
      goog.ui.Component.EventType.HIGHLIGHT, highlightEvent.type);
  assertEquals('HIGHLIGHT should be fired for node[1] cell',
      renderer.getCellForItem(nodes[1]), targetElements[1]);

  events = [];
  targetElements = [];

  // Test highlight events when a cell is unselected
  palette.setHighlightedItem();

  assertEquals('Should have fired 1 event', 1, events.length);
  assertEquals('UNHIGHLIGHT event should be fired',
      goog.ui.Component.EventType.UNHIGHLIGHT, events[0].type);
  assertEquals('Event should be fired for node[1] cell',
      renderer.getCellForItem(nodes[1]), targetElements[0]);
}

function testHandleKeyEventLoops() {
  palette.setHighlightedIndex(0);
  var createKeyEvent = function(keyCode) {
    return new goog.events.KeyEvent(keyCode,
        0 /* charCode */,
        false /* repeat */,
        new goog.testing.events.Event(goog.events.EventType.KEYDOWN));
  };
  palette.handleKeyEvent(createKeyEvent(goog.events.KeyCodes.LEFT));
  assertEquals(nodes.length - 1, palette.getHighlightedIndex());

  palette.handleKeyEvent(createKeyEvent(goog.events.KeyCodes.RIGHT));
  assertEquals(0, palette.getHighlightedIndex());
}

function testSetHighlight() {
  assertEquals(-1, palette.getHighlightedIndex());
  palette.setHighlighted(true);
  assertEquals(0, palette.getHighlightedIndex());

  palette.setHighlightedIndex(3);
  palette.setHighlighted(false);
  assertEquals(-1, palette.getHighlightedIndex());
  palette.setHighlighted(true);
  assertEquals(3, palette.getHighlightedIndex());

  palette.setHighlighted(false);
  palette.setHighlightedIndex(5);
  palette.setHighlighted(true);
  assertEquals(5, palette.getHighlightedIndex());
  palette.setHighlighted(true);
  assertEquals(5, palette.getHighlightedIndex());
}

function testSetAriaLabel() {
  assertNull('Palette must not have aria label by default',
      palette.getAriaLabel());
  palette.setAriaLabel('My Palette');
  palette.render();
  var element = palette.getElementStrict();
  assertNotNull('Element must not be null', element);
  assertEquals('Palette element must have expected aria-label', 'My Palette',
      element.getAttribute('aria-label'));
  assertEquals('Palette element must have expected aria role', 'grid',
      element.getAttribute('role'));
  palette.setAriaLabel('My new Palette');
  assertEquals('Palette element must have updated aria-label', 'My new Palette',
      element.getAttribute('aria-label'));
}
