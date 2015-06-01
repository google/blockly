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

goog.provide('goog.ui.SelectionMenuButtonTest');
goog.setTestOnly('goog.ui.SelectionMenuButtonTest');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');
goog.require('goog.ui.SelectionMenuButton');

var selectionMenuButton;
var clonedSelectionMenuButtonDom;


function setUp() {
  clonedSelectionMenuButtonDom =
      goog.dom.getElement('demoSelectionMenuButton').cloneNode(true);

  selectionMenuButton = new goog.ui.SelectionMenuButton();
}

function tearDown() {
  selectionMenuButton.dispose();

  var element = goog.dom.getElement('demoSelectionMenuButton');
  element.parentNode.replaceChild(clonedSelectionMenuButtonDom, element);
}


/**
 * Open the menu and click on the menu item inside.
 */
function testBasicButtonBehavior() {
  var node = goog.dom.getElement('demoSelectionMenuButton');
  selectionMenuButton.decorate(node);
  goog.testing.events.fireClickSequence(node);

  assertTrue('Menu must open after click', selectionMenuButton.isOpen());

  var menuItemClicked = 0;
  var lastMenuItemClicked = null;
  goog.events.listen(selectionMenuButton.getMenu(),
      goog.ui.Component.EventType.ACTION,
      function(e) {
        menuItemClicked++;
        lastMenuItemClicked = e.target;
      });

  var menuItem2 = goog.dom.getElement('menuItem2');
  goog.testing.events.fireClickSequence(menuItem2);
  assertFalse('Menu must close on clicking when open',
      selectionMenuButton.isOpen());
  assertEquals('Number of menu items clicked should be 1', 1, menuItemClicked);
  assertEquals('menuItem2 should be the last menuitem clicked', menuItem2,
      lastMenuItemClicked.getElement());
}


/**
 * Tests that the checkbox fires the same events as the first 2 items.
 */
function testCheckboxFireEvents() {
  var node = goog.dom.getElement('demoSelectionMenuButton');
  selectionMenuButton.decorate(node);

  var menuItemClicked = 0;
  var lastMenuItemClicked = null;
  goog.events.listen(selectionMenuButton.getMenu(),
      goog.ui.Component.EventType.ACTION,
      function(e) {
        menuItemClicked++;
        lastMenuItemClicked = e.target;
      });

  var checkbox = goog.dom.getElement('demoCheckbox');
  assertFalse('Checkbox must be unchecked (i.e. unselected)', checkbox.checked);

  checkbox.checked = true;
  goog.testing.events.fireClickSequence(checkbox);
  assertFalse('Menu must be closed when clicking checkbox',
      selectionMenuButton.isOpen());
  assertEquals('Number of menu items clicked should be 1', 1, menuItemClicked);
  assertEquals('menuItem1 should be the last menuitem clicked',
      goog.dom.getElement('menuItem1'),
      lastMenuItemClicked.getElement());

  checkbox.checked = false;
  goog.testing.events.fireClickSequence(checkbox);
  assertFalse('Menu must be closed when clicking checkbox',
      selectionMenuButton.isOpen());
  assertEquals('Number of menu items clicked should be 2', 2, menuItemClicked);
  assertEquals('menuItem2 should be the last menuitem clicked',
      goog.dom.getElement('menuItem2'), lastMenuItemClicked.getElement());
}


/**
 * Tests that the checkbox state gets updated when the first 2 events fire
 */
function testCheckboxReceiveEvents() {
  var node = goog.dom.getElement('demoSelectionMenuButton');
  selectionMenuButton.decorate(node);

  var checkbox = goog.dom.getElement('demoCheckbox');
  assertFalse('Checkbox must be unchecked (i.e. unselected)', checkbox.checked);

  goog.testing.events.fireClickSequence(goog.dom.getElement('menuItem1'));
  assertTrue('Checkbox must be checked (i.e. selected)', checkbox.checked);

  goog.testing.events.fireClickSequence(goog.dom.getElement('menuItem2'));
  assertFalse('Checkbox must be unchecked (i.e. unselected)', checkbox.checked);
}


/**
 * Tests that set/getSelectionState correctly changes the state
 */
function testSelectionState() {
  var node = goog.dom.getElement('demoSelectionMenuButton');
  selectionMenuButton.decorate(node);

  var checkbox = goog.dom.getElement('demoCheckbox');
  assertFalse('Checkbox must be unchecked (i.e. unselected)', checkbox.checked);

  selectionMenuButton.setSelectionState(
      goog.ui.SelectionMenuButton.SelectionState.ALL);
  assertTrue('Checkbox should be checked when selecting all', checkbox.checked);
  assertEquals('selectionState should be ALL',
      selectionMenuButton.getSelectionState(),
      goog.ui.SelectionMenuButton.SelectionState.ALL);

  selectionMenuButton.setSelectionState(
      goog.ui.SelectionMenuButton.SelectionState.NONE);
  assertFalse('Checkbox should be checked when selecting all',
      checkbox.checked);
  assertEquals('selectionState should be NONE',
      selectionMenuButton.getSelectionState(),
      goog.ui.SelectionMenuButton.SelectionState.NONE);

  selectionMenuButton.setSelectionState(
      goog.ui.SelectionMenuButton.SelectionState.SOME);
  assertTrue('Checkbox should be checked when selecting all', checkbox.checked);
  assertEquals('selectionState should be SOME',
      selectionMenuButton.getSelectionState(),
      goog.ui.SelectionMenuButton.SelectionState.SOME);
}


/**
 * Tests that the checkbox gets disabled when the button is disabled
 */
function testCheckboxDisabled() {
  var node = goog.dom.getElement('demoSelectionMenuButton');
  selectionMenuButton.decorate(node);

  var checkbox = goog.dom.getElement('demoCheckbox');
  assertFalse('Checkbox must be enabled', checkbox.disabled);

  selectionMenuButton.setEnabled(false);
  assertTrue('Checkbox must be disabled', checkbox.disabled);

  selectionMenuButton.setEnabled(true);
  assertFalse('Checkbox must be enabled', checkbox.disabled);
}


/**
 * Tests that clicking the checkbox does not open the menu
 */
function testCheckboxClickMenuClosed() {
  var node = goog.dom.getElement('demoSelectionMenuButton');
  selectionMenuButton.decorate(node);

  var checkbox = goog.dom.getElement('demoCheckbox');
  goog.testing.events.fireMouseDownEvent(checkbox);
  assertFalse('Menu must be closed when mousedown checkbox',
      selectionMenuButton.isOpen());
  goog.testing.events.fireMouseUpEvent(checkbox);
  assertFalse('Menu must remain closed when mouseup checkbox',
      selectionMenuButton.isOpen());

  selectionMenuButton.setOpen(true);
  goog.testing.events.fireClickSequence(checkbox);
  assertFalse('Menu must close when clickin checkbox',
      selectionMenuButton.isOpen());

}
