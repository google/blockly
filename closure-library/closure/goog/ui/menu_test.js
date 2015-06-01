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

goog.provide('goog.ui.MenuTest');
goog.setTestOnly('goog.ui.MenuTest');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.math.Coordinate');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');
goog.require('goog.ui.Menu');

var menu;
var clonedMenuDom;

function setUp() {
  clonedMenuDom = goog.dom.getElement('demoMenu').cloneNode(true);

  menu = new goog.ui.Menu();
}

function tearDown() {
  menu.dispose();

  var element = goog.dom.getElement('demoMenu');
  element.parentNode.replaceChild(clonedMenuDom, element);
}


/** @bug 1463524 */
function testMouseupDoesntActivateMenuItemImmediately() {
  menu.decorate(goog.dom.getElement('demoMenu'));

  var fakeEvent = {clientX: 42, clientY: 42};
  var itemElem = goog.dom.getElement('menuItem2');
  var coords = new goog.math.Coordinate(42, 42);

  var menuItem = menu.getChildAt(1);
  var actionDispatched = false;
  goog.events.listen(menuItem, goog.ui.Component.EventType.ACTION,
      function(e) {
        actionDispatched = true;
      });

  menu.setVisible(true, false, fakeEvent);
  // Makes the menu item active so it can be selected on mouseup.
  menuItem.setActive(true);

  goog.testing.events.fireMouseUpEvent(itemElem, undefined, coords);
  assertFalse('ACTION should not be dispatched after the initial mouseup',
              actionDispatched);

  goog.testing.events.fireMouseUpEvent(itemElem, undefined, coords);
  assertTrue('ACTION should be dispatched after the second mouseup',
             actionDispatched);

}

function testHoverBehavior() {
  menu.decorate(goog.dom.getElement('demoMenu'));

  goog.testing.events.fireMouseOverEvent(goog.dom.getElement('menuItem2'),
      document.body);
  assertEquals(1, menu.getHighlightedIndex());

  menu.exitDocument();
  assertEquals(-1, menu.getHighlightedIndex());
}

function testIndirectionDecoration() {
  menu.decorate(goog.dom.getElement('complexMenu'));

  goog.testing.events.fireMouseOverEvent(goog.dom.getElement('complexItem3'),
      document.body);
  assertEquals(2, menu.getHighlightedIndex());

  menu.exitDocument();
  assertEquals(-1, menu.getHighlightedIndex());
}

function testSetHighlightedIndex() {
  menu.decorate(goog.dom.getElement('scrollableMenu'));
  assertEquals(0, menu.getElement().scrollTop);

  // Scroll down
  var element = goog.dom.getElement('scrollableMenuItem4');
  menu.setHighlightedIndex(3);
  assertTrue(element.offsetTop >= menu.getElement().scrollTop);
  assertTrue(element.offsetTop <=
      menu.getElement().scrollTop + menu.getElement().offsetHeight);

  // Scroll up
  element = goog.dom.getElement('scrollableMenuItem3');
  menu.setHighlightedIndex(2);
  assertTrue(element.offsetTop >= menu.getElement().scrollTop);
  assertTrue(element.offsetTop <=
      menu.getElement().scrollTop + menu.getElement().offsetHeight);

  menu.exitDocument();
  assertEquals(-1, menu.getHighlightedIndex());
}
