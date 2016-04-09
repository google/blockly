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

goog.provide('goog.ui.FilteredMenuTest');
goog.setTestOnly('goog.ui.FilteredMenuTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.AutoCompleteValues');
goog.require('goog.a11y.aria.State');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.math.Rect');
goog.require('goog.style');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.FilteredMenu');
goog.require('goog.ui.MenuItem');

var sandbox;

function setUp() {
  sandbox = goog.dom.getElement('sandbox');
}


function tearDown() {
  goog.dom.removeChildren(sandbox);
}


function testRender() {
  menu = new goog.ui.FilteredMenu();
  menu.addItem(new goog.ui.MenuItem('Menu Item 1'));
  menu.addItem(new goog.ui.MenuItem('Menu Item 2'));
  menu.render(sandbox);

  assertEquals('Menu should contain two items.', 2, menu.getChildCount());
  assertEquals(
      'Caption of first menu item should match supplied value.', 'Menu Item 1',
      menu.getItemAt(0).getCaption());
  assertEquals(
      'Caption of second menu item should match supplied value.', 'Menu Item 2',
      menu.getItemAt(1).getCaption());
  assertTrue(
      'Caption of first item should be in document.',
      sandbox.innerHTML.indexOf('Menu Item 1') != -1);
  assertTrue(
      'Caption of second item should be in document.',
      sandbox.innerHTML.indexOf('Menu Item 2') != -1);

  menu.dispose();
}


function testDecorate() {
  menu = new goog.ui.FilteredMenu();
  menu.decorate(goog.dom.getElement('testmenu'));

  assertEquals('Menu should contain four items.', 4, menu.getChildCount());
  assertEquals(
      'Caption of menu item should match decorated element', 'Apple',
      menu.getItemAt(0).getCaption());
  assertEquals(
      'Accelerator of menu item should match accelerator element', 'A',
      menu.getItemAt(0).getAccelerator());
  assertEquals(
      'Caption of menu item should match decorated element', 'Lemon',
      menu.getItemAt(1).getCaption());
  assertEquals(
      'Caption of menu item should match decorated element', 'Orange',
      menu.getItemAt(2).getCaption());
  assertEquals(
      'Caption of menu item should match decorated element', 'Strawberry',
      menu.getItemAt(3).getCaption());

  menu.dispose();
}


function testFilter() {
  menu = new goog.ui.FilteredMenu();
  menu.addItem(new goog.ui.MenuItem('Family'));
  menu.addItem(new goog.ui.MenuItem('Friends'));
  menu.addItem(new goog.ui.MenuItem('Photos'));
  menu.addItem(new goog.ui.MenuItem([
    goog.dom.createTextNode('Work'),
    goog.dom.createDom(
        goog.dom.TagName.SPAN, goog.ui.MenuItem.ACCELERATOR_CLASS, 'W')
  ]));

  menu.render(sandbox);

  // Check menu items.
  assertEquals(
      'Family should be the first label in the move to menu', 'Family',
      menu.getChildAt(0).getCaption());
  assertEquals(
      'Friends should be the second label in the move to menu', 'Friends',
      menu.getChildAt(1).getCaption());
  assertEquals(
      'Photos should be the third label in the move to menu', 'Photos',
      menu.getChildAt(2).getCaption());
  assertEquals(
      'Work should be the fourth label in the move to menu', 'Work',
      menu.getChildAt(3).getCaption());

  // Filter menu.
  menu.setFilter('W');
  assertFalse(
      'Family should not be visible when the menu is filtered',
      menu.getChildAt(0).isVisible());
  assertFalse(
      'Friends should not be visible when the menu is filtered',
      menu.getChildAt(1).isVisible());
  assertFalse(
      'Photos should not be visible when the menu is filtered',
      menu.getChildAt(2).isVisible());
  assertTrue(
      'Work should be visible when the menu is filtered',
      menu.getChildAt(3).isVisible());
  // Check accelerator.
  assertEquals(
      'The accelerator for Work should be present', 'W',
      menu.getChildAt(3).getAccelerator());

  menu.setFilter('W,');
  for (var i = 0; i < menu.getChildCount(); i++) {
    assertFalse(
        'W, should not match anything with allowMultiple set to false',
        menu.getChildAt(i).isVisible());
  }

  // Clear filter.
  menu.setFilter('');
  for (var i = 0; i < menu.getChildCount(); i++) {
    assertTrue('All items should be visible', menu.getChildAt(i).isVisible());
  }

  menu.dispose();
}


function testFilterAllowMultiple() {
  menu = new goog.ui.FilteredMenu();
  menu.setAllowMultiple(true);
  menu.addItem(new goog.ui.MenuItem('Family'));
  menu.addItem(new goog.ui.MenuItem('Friends'));
  menu.addItem(new goog.ui.MenuItem('Photos'));
  menu.addItem(new goog.ui.MenuItem('Work'));

  menu.render(sandbox);

  // Filter menu.
  menu.setFilter('W,');
  for (var i = 0; i < menu.getChildCount(); i++) {
    assertTrue(
        'W, should show all items with allowMultiple set to true',
        menu.getChildAt(i).isVisible());
  }

  // Filter second label.
  menu.setFilter('Work,P');
  assertFalse(
      'Family should not be visible when the menu is filtered',
      menu.getChildAt(0).isVisible());
  assertFalse(
      'Friends should not be visible when the menu is filtered',
      menu.getChildAt(1).isVisible());
  assertTrue(
      'Photos should be visible when the menu is filtered',
      menu.getChildAt(2).isVisible());
  assertFalse(
      'Work should not be visible when the menu is filtered',
      menu.getChildAt(3).isVisible());

  // Clear filter.
  menu.setFilter('');
  for (var i = 0; i < menu.getChildCount(); i++) {
    assertTrue('All items should be visible', menu.getChildAt(i).isVisible());
  }

  menu.dispose();
}


function testFilterWordBoundary() {
  menu = new goog.ui.FilteredMenu();
  menu.addItem(new goog.ui.MenuItem('Vacation Photos'));
  menu.addItem(new goog.ui.MenuItem('Work'));
  menu.addItem(new goog.ui.MenuItem('Receipts & Invoices'));
  menu.addItem(new goog.ui.MenuItem('Invitations'));
  menu.addItem(new goog.ui.MenuItem('3.Family'));
  menu.addItem(new goog.ui.MenuItem('No:Farm'));
  menu.addItem(new goog.ui.MenuItem('Syd/Family'));

  menu.render(sandbox);

  // Filter menu.
  menu.setFilter('Photos');
  assertTrue(
      'Vacation Photos should be visible when the menu is filtered',
      menu.getChildAt(0).isVisible());
  assertFalse(
      'Work should not be visible when the menu is filtered',
      menu.getChildAt(1).isVisible());
  assertFalse(
      'Receipts & Invoices should not be visible when the menu is ' +
          'filtered',
      menu.getChildAt(2).isVisible());
  assertFalse(
      'Invitations should not be visible when the menu is filtered',
      menu.getChildAt(3).isVisible());

  menu.setFilter('I');
  assertFalse(
      'Vacation Photos should not be visible when the menu is filtered',
      menu.getChildAt(0).isVisible());
  assertFalse(
      'Work should not be visible when the menu is filtered',
      menu.getChildAt(1).isVisible());
  assertTrue(
      'Receipts & Invoices should be visible when the menu is filtered',
      menu.getChildAt(2).isVisible());
  assertTrue(
      'Invitations should be visible when the menu is filtered',
      menu.getChildAt(3).isVisible());

  menu.setFilter('Fa');
  assertTrue(
      '3.Family should be visible when the menu is filtered',
      menu.getChildAt(4).isVisible());
  assertTrue(
      'No:Farm should be visible when the menu is filtered',
      menu.getChildAt(5).isVisible());
  assertTrue(
      'Syd/Family should be visible when the menu is filtered',
      menu.getChildAt(6).isVisible());

  menu.dispose();
}


function testScrollIntoView() {
  menu = new goog.ui.FilteredMenu();
  menu.addItem(new goog.ui.MenuItem('Family'));
  menu.addItem(new goog.ui.MenuItem('Friends'));
  menu.addItem(new goog.ui.MenuItem('Photos'));
  menu.addItem(new goog.ui.MenuItem('Work'));
  menu.render(sandbox);

  menu.setHighlightedIndex(0);
  assertTrue('Highlighted item should be visible', isHighlightedVisible(menu));
  menu.setHighlightedIndex(1);
  assertTrue('Highlighted item should be visible', isHighlightedVisible(menu));
  menu.setHighlightedIndex(2);
  assertTrue('Highlighted item should be visible', isHighlightedVisible(menu));
  menu.setHighlightedIndex(3);
  assertTrue('Highlighted item should be visible', isHighlightedVisible(menu));
  menu.setHighlightedIndex(0);
  assertTrue('Highlighted item should be visible', isHighlightedVisible(menu));

  menu.dispose();
}

function testEscapeKeyHandling() {
  menu = new goog.ui.FilteredMenu();
  menu.addItem(new goog.ui.MenuItem('Family'));
  menu.addItem(new goog.ui.MenuItem('Friends'));
  menu.render(sandbox);

  var gotKeyCode = false;
  var wrapper = document.getElementById('wrapper');
  goog.events.listenOnce(wrapper, goog.events.EventType.KEYPRESS, function(e) {
    gotKeyCode = true;
  });
  goog.testing.events.fireKeySequence(
      menu.getFilterInputElement(), goog.events.KeyCodes.ESC);
  assertFalse('ESC key should not propagate out to parent', gotKeyCode);
}


function testAriaRoles() {
  menu = new goog.ui.FilteredMenu();
  menu.addItem(new goog.ui.MenuItem('Item 1'));
  menu.render(sandbox);

  var input = menu.getFilterInputElement();
  assertEquals(
      goog.a11y.aria.AutoCompleteValues.LIST,
      goog.a11y.aria.getState(input, goog.a11y.aria.State.AUTOCOMPLETE));
  assertEquals(
      menu.getContentElement().id,
      goog.a11y.aria.getState(input, goog.a11y.aria.State.OWNS));
  assertEquals(
      'true', goog.a11y.aria.getState(input, goog.a11y.aria.State.EXPANDED));
}


function testInputActiveDecendant() {
  menu = new goog.ui.FilteredMenu();
  var menuItem1 = new goog.ui.MenuItem('Item 1');
  var menuItem2 = new goog.ui.MenuItem('Item 2');
  menu.addItem(menuItem1);
  menu.addItem(menuItem2);
  menu.render(sandbox);

  assertNull(goog.a11y.aria.getActiveDescendant(menu.getFilterInputElement()));
  menu.setHighlightedIndex(0);
  assertEquals(
      menuItem1.getElementStrict(),
      goog.a11y.aria.getActiveDescendant(menu.getFilterInputElement()));
  menu.setHighlightedIndex(1);
  assertEquals(
      menuItem2.getElementStrict(),
      goog.a11y.aria.getActiveDescendant(menu.getFilterInputElement()));
}


function isHighlightedVisible(menu) {
  var contRect = goog.style.getBounds(menu.getContentElement());
  // Expands the containing rectangle by 1px on top and bottom. The test
  // sometime fails with 1px out of bound on FF6/Linux. This is not
  // consistently reproducible.
  contRect = new goog.math.Rect(
      contRect.left, contRect.top - 1, contRect.width, contRect.height + 2);
  var itemRect = goog.style.getBounds(menu.getHighlighted().getElement());
  return contRect.contains(itemRect);
}
