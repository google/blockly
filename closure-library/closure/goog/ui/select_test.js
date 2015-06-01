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

goog.provide('goog.ui.SelectTest');
goog.setTestOnly('goog.ui.SelectTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.Role');
goog.require('goog.a11y.aria.State');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');
goog.require('goog.ui.Component');
goog.require('goog.ui.CustomButtonRenderer');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.Select');
goog.require('goog.ui.Separator');

var defaultCaption = 'initial caption';
var sandboxEl;
var select;

function setUp() {
  sandboxEl = goog.dom.getElement('sandbox');
  select = new goog.ui.Select(defaultCaption);
}

function tearDown() {
  select.dispose();
  goog.dom.removeChildren(sandboxEl);
}


/**
 * Checks that the default caption passed in the constructor and in the setter
 * is returned by getDefaultCaption, and acts as a default caption, i.e. is
 * shown as a caption when no items are selected.
 */
function testDefaultCaption() {
  select.render(sandboxEl);
  var item1 = new goog.ui.MenuItem('item 1');
  select.addItem(item1);
  select.addItem(new goog.ui.MenuItem('item 2'));
  assertEquals(defaultCaption, select.getDefaultCaption());
  assertEquals(defaultCaption, select.getCaption());

  var newCaption = 'new caption';
  select.setDefaultCaption(newCaption);
  assertEquals(newCaption, select.getDefaultCaption());
  assertEquals(newCaption, select.getCaption());

  select.setSelectedItem(item1);
  assertNotEquals(newCaption, select.getCaption());

  select.setSelectedItem(null);
  assertEquals(newCaption, select.getCaption());
}

function testNoDefaultCaption() {
  assertNull(new goog.ui.Select().getDefaultCaption());
  assertEquals('', new goog.ui.Select('').getDefaultCaption());
}

// Confirms that aria roles for select conform to spec:
// http://www.w3.org/TR/wai-aria/roles#listbox
// Basically the select should have a role of LISTBOX and all the items should
// have a role of OPTION.
function testAriaRoles() {
  select.render(sandboxEl);
  var item1 = new goog.ui.MenuItem('item 1');
  select.addItem(item1);
  // Added a separator to make sure that the SETSIZE ignores the separator
  // items.
  var separator = new goog.ui.Separator();
  select.addItem(separator);
  var item2 = new goog.ui.MenuItem('item 2');
  select.addItem(item2);
  assertNotNull(select.getElement());
  assertNotNull(item1.getElement());
  assertNotNull(item2.getElement());
  assertEquals(goog.a11y.aria.Role.LISTBOX,
      goog.a11y.aria.getRole(select.getElement()));
  assertEquals(goog.a11y.aria.Role.OPTION,
      goog.a11y.aria.getRole(item1.getElement()));
  assertEquals(goog.a11y.aria.Role.OPTION,
      goog.a11y.aria.getRole(item2.getElement()));
  assertNotNull(goog.a11y.aria.getState(select.getElement(),
      goog.a11y.aria.State.ACTIVEDESCENDANT));
  var contentElement = select.getRenderer().
      getContentElement(select.getElement());
  assertEquals('2', goog.a11y.aria.getState(contentElement,
      goog.a11y.aria.State.SETSIZE));
  assertEquals('0', goog.a11y.aria.getState(contentElement,
      goog.a11y.aria.State.POSINSET));
  select.setSelectedItem(item1);
  assertEquals('1', goog.a11y.aria.getState(contentElement,
      goog.a11y.aria.State.POSINSET));
  select.setSelectedItem(item2);
  assertEquals('2', goog.a11y.aria.getState(contentElement,
      goog.a11y.aria.State.POSINSET));
}


/**
 * Checks that the select control handles ACTION events from its items.
 */
function testHandlesItemActions() {
  select.render(sandboxEl);
  var item1 = new goog.ui.MenuItem('item 1');
  var item2 = new goog.ui.MenuItem('item 2');
  select.addItem(item1);
  select.addItem(item2);

  item1.dispatchEvent(goog.ui.Component.EventType.ACTION);
  assertEquals(item1, select.getSelectedItem());
  assertEquals(item1.getCaption(), select.getCaption());

  item2.dispatchEvent(goog.ui.Component.EventType.ACTION);
  assertEquals(item2, select.getSelectedItem());
  assertEquals(item2.getCaption(), select.getCaption());
}


/**
 * Tests goog.ui.Select.prototype.setValue.
 */
function testSetValue() {
  select.render(sandboxEl);
  var item1 = new goog.ui.MenuItem('item 1', 1);
  var item2 = new goog.ui.MenuItem('item 2', 2);
  select.addItem(item1);
  select.addItem(item2);

  select.setValue(1);
  assertEquals(item1, select.getSelectedItem());

  select.setValue(2);
  assertEquals(item2, select.getSelectedItem());

  select.setValue(3);
  assertNull(select.getSelectedItem());
}


/**
 * Checks that the current selection is cleared when the selected item is
 * removed.
 */
function testSelectionIsClearedWhenSelectedItemIsRemoved() {
  select.render(sandboxEl);
  var item1 = new goog.ui.MenuItem('item 1');
  select.addItem(item1);
  select.addItem(new goog.ui.MenuItem('item 2'));

  select.setSelectedItem(item1);
  select.removeItem(item1);
  assertNull(select.getSelectedItem());
}


/**
 * Check that the select control is subscribed to its selection model events
 * after being added, removed and added back again into the document.
 */
function testExitAndEnterDocument() {
  var component = new goog.ui.Component();
  component.render(sandboxEl);

  var item1 = new goog.ui.MenuItem('item 1');
  var item2 = new goog.ui.MenuItem('item 2');
  var item3 = new goog.ui.MenuItem('item 3');

  select.addItem(item1);
  select.addItem(item2);
  select.addItem(item3);

  component.addChild(select, true);
  item2.dispatchEvent(goog.ui.Component.EventType.ACTION);
  assertEquals(item2.getCaption(), select.getCaption());

  component.removeChild(select, true);
  item1.dispatchEvent(goog.ui.Component.EventType.ACTION);
  assertEquals(item2.getCaption(), select.getCaption());

  component.addChild(select, true);
  item3.dispatchEvent(goog.ui.Component.EventType.ACTION);
  assertEquals(item3.getCaption(), select.getCaption());
}

function testSelectEventFiresForProgrammaticChange() {
  select.render();
  var item1 = new goog.ui.MenuItem('item 1');
  var item2 = new goog.ui.MenuItem('item 2');
  select.addItem(item1);
  select.addItem(item2);

  var recordingHandler = new goog.testing.recordFunction();
  goog.events.listen(
      select, goog.ui.Component.EventType.CHANGE, recordingHandler);

  select.setSelectedItem(item2);
  assertEquals('Selecting new item should fire CHANGE event.',
      1, recordingHandler.getCallCount());

  select.setSelectedItem(item2);
  assertEquals('Selecting the same item should not fire CHANGE event.',
      1, recordingHandler.getCallCount());

  select.setSelectedIndex(0);
  assertEquals('Selecting new item should fire CHANGE event.',
      2, recordingHandler.getCallCount());

  select.setSelectedIndex(0);
  assertEquals('Selecting the same item should not fire CHANGE event.',
      2, recordingHandler.getCallCount());
}

function testSelectEventFiresForUserInitiatedAction() {
  select.render();
  var item1 = new goog.ui.MenuItem('item 1');
  var item2 = new goog.ui.MenuItem('item 2');
  select.addItem(item1);
  select.addItem(item2);

  var recordingHandler = new goog.testing.recordFunction();
  goog.events.listen(
      select, goog.ui.Component.EventType.CHANGE, recordingHandler);

  select.setOpen(true);

  item2.dispatchEvent(goog.ui.Component.EventType.ACTION);
  assertEquals('Selecting new item should fire CHANGE event.',
      1, recordingHandler.getCallCount());
  assertFalse(select.isOpen());

  select.setOpen(true);

  item2.dispatchEvent(goog.ui.Component.EventType.ACTION);
  assertEquals('Selecting the same item should not fire CHANGE event.',
      1, recordingHandler.getCallCount());
  assertFalse(select.isOpen());
}


/**
 * Checks that if an item is selected before decorate is called, the selection
 * is preserved after decorate.
 */
function testSetSelectedItemBeforeRender() {
  select.addItem(new goog.ui.MenuItem('item 1'));
  select.addItem(new goog.ui.MenuItem('item 2'));
  var item3 = new goog.ui.MenuItem('item 3');
  select.addItem(item3);
  select.setSelectedItem(item3);
  assertEquals(2, select.getSelectedIndex());

  select.decorate(sandboxEl);
  assertEquals(2, select.getSelectedIndex());
}


/**
 * Checks that if a value is set before decorate is called, the value is
 * preserved after decorate.
 */
function testSetValueBeforeRender() {
  select.addItem(new goog.ui.MenuItem('item 1', 1));
  select.addItem(new goog.ui.MenuItem('item 2', 2));
  select.setValue(2);
  assertEquals(2, select.getValue());

  select.decorate(sandboxEl);
  assertEquals(2, select.getValue());
}


function testUpdateCaption_aria() {
  select.render(sandboxEl);

  // Verify default state.
  assertEquals(defaultCaption, select.getCaption());
  assertFalse(
      !!goog.a11y.aria.getLabel(
          select.getRenderer().getContentElement(select.getElement())));

  // Add and select an item with aria-label.
  var item1 = new goog.ui.MenuItem();
  select.addItem(item1);
  item1.getElement().setAttribute('aria-label', 'item1');
  select.setSelectedIndex(0);
  assertEquals(
      'item1',
      goog.a11y.aria.getLabel(
          select.getRenderer().getContentElement(select.getElement())));

  // Add and select an item without a label.
  var item2 = new goog.ui.MenuItem();
  select.addItem(item2);
  select.setSelectedIndex(1);
  assertFalse(
      !!goog.a11y.aria.getLabel(
          select.getRenderer().getContentElement(select.getElement())));
}

function testDisposeWhenInnerHTMLHasBeenClearedInIE10() {
  assertNotThrows(function() {
    var customSelect = new goog.ui.Select(null /* label */, new goog.ui.Menu(),
        new goog.ui.CustomButtonRenderer());
    customSelect.render(sandboxEl);

    // In IE10 setting the innerHTML of a node invalidates the parent child
    // relation of all its child nodes (unlike removeNode).
    sandboxEl.innerHTML = '';

    // goog.ui.Select's disposeInternal trigger's goog.ui.Component's
    // disposeInternal, which triggers goog.ui.MenuButton's exitDocument,
    // which closes the associated menu and updates the activeDescendent.
    // In the case of a CustomMenuButton the contentElement is referenced by
    // element.firstChild.firstChild, an invalid relation in IE 10.
    customSelect.dispose();
  });
}
