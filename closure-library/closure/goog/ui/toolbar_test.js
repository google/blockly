// Copyright 2014 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.ToolbarTest');
goog.setTestOnly('goog.ui.ToolbarTest');

goog.require('goog.a11y.aria');
goog.require('goog.dom');
goog.require('goog.events.EventType');
goog.require('goog.testing.events');
goog.require('goog.testing.events.Event');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Toolbar');
goog.require('goog.ui.ToolbarMenuButton');

var toolbar;
var toolbarWrapper;
var buttons;

function setUp() {
  toolbar = new goog.ui.Toolbar();
  toolbarWrapper = goog.dom.getElement('toolbar-wrapper');

  // Render and populate the toolbar.
  toolbar.render(toolbarWrapper);
  var toolbarElem = toolbar.getElement();
  var button1 = new goog.ui.ToolbarMenuButton('button 1');
  var button2 = new goog.ui.ToolbarMenuButton('button 2');
  var button3 = new goog.ui.ToolbarMenuButton('button 3');
  button1.render(toolbarElem);
  button2.render(toolbarElem);
  button3.render(toolbarElem);
  toolbar.addChild(button1);
  toolbar.addChild(button2);
  toolbar.addChild(button3);
  buttons = [button1, button2, button3];
}

function tearDown() {
  toolbar.dispose();
}

function testHighlightFirstOnFocus() {
  var firstButton = buttons[0];

  // Verify that focusing the toolbar via the keyboard (i.e. no click event)
  // highlights the first item and sets it as the active descendant.
  goog.testing.events.fireFocusEvent(toolbar.getElement());
  assertEquals(0, toolbar.getHighlightedIndex());
  assertTrue(firstButton.isHighlighted());
  assertEquals(
      firstButton.getElement(),
      goog.a11y.aria.getActiveDescendant(toolbar.getElement()));

  // Verify that removing focus unhighlights the first item and removes it as
  // the active descendant.
  goog.testing.events.fireBlurEvent(toolbar.getElement());
  assertEquals(-1, toolbar.getHighlightedIndex());
  assertNull(goog.a11y.aria.getActiveDescendant(toolbar.getElement()));
  assertFalse(firstButton.isHighlighted());
}

function testHighlightSelectedOnClick() {
  var firstButton = buttons[0];
  var secondButton = buttons[1];

  // Verify that mousing over and clicking on a toolbar button selects only the
  // correct item.
  var mouseover = new goog.testing.events.Event(
      goog.events.EventType.MOUSEOVER, secondButton.getElement());
  goog.testing.events.fireBrowserEvent(mouseover);
  var mousedown = new goog.testing.events.Event(
      goog.events.EventType.MOUSEDOWN, toolbar.getElement());
  goog.testing.events.fireBrowserEvent(mousedown);
  assertEquals(1, toolbar.getHighlightedIndex());
  assertTrue(secondButton.isHighlighted());
  assertFalse(firstButton.isHighlighted());
  assertEquals(
      secondButton.getElement(),
      goog.a11y.aria.getActiveDescendant(toolbar.getElement()));
}
