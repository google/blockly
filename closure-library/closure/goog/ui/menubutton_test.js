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

goog.provide('goog.ui.MenuButtonTest');
goog.setTestOnly('goog.ui.MenuButtonTest');

goog.require('goog.Timer');
goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.State');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.positioning');
goog.require('goog.positioning.Corner');
goog.require('goog.positioning.MenuAnchoredPosition');
goog.require('goog.positioning.Overflow');
goog.require('goog.style');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');
goog.require('goog.ui.Component');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuButton');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.SubMenu');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');
goog.require('goog.userAgent.product.isVersion');

var menuButton;
var clonedMenuButtonDom;
var expectedFailures;

function setUpPage() {
  expectedFailures = new goog.testing.ExpectedFailures();
}

// Mock out goog.positioning.positionAtCoordinate to always ignore failure when
// the window is too small, since we don't care about the viewport size on
// the selenium farm.
// TODO(nicksantos): Move this into a common location if we ever have enough
// code for a general goog.testing.ui library.
var originalPositionAtCoordinate = goog.positioning.positionAtCoordinate;
goog.positioning.positionAtCoordinate = function(absolutePos, movableElement,
    movableElementCorner, opt_margin, opt_viewport, opt_overflow,
    opt_preferredSize) {
  return originalPositionAtCoordinate.call(this, absolutePos, movableElement,
      movableElementCorner, opt_margin, opt_viewport,
      goog.positioning.Overflow.IGNORE, opt_preferredSize);
};

function MyFakeEvent(keyCode, opt_eventType) {
  this.type = opt_eventType || goog.events.KeyHandler.EventType.KEY;
  this.keyCode = keyCode;
  this.propagationStopped = false;
  this.preventDefault = goog.nullFunction;
  this.stopPropagation = function() {
    this.propagationStopped = true;
  };
}

function setUp() {
  window.scrollTo(0, 0);

  var viewportSize = goog.dom.getViewportSize();
  // Some tests need enough size viewport.
  if (viewportSize.width < 600 || viewportSize.height < 600) {
    window.moveTo(0, 0);
    window.resizeTo(640, 640);
  }

  clonedMenuButtonDom = goog.dom.getElement('demoMenuButton').cloneNode(true);

  menuButton = new goog.ui.MenuButton();
}

function tearDown() {
  expectedFailures.handleTearDown();
  menuButton.dispose();

  var element = goog.dom.getElement('demoMenuButton');
  element.parentNode.replaceChild(clonedMenuButtonDom, element);
}


/**
 * Check if the aria-haspopup property is set correctly.
 */
function checkHasPopUp() {
  menuButton.enterDocument();
  assertFalse('Menu button must have aria-haspopup attribute set to false',
      goog.a11y.aria.getState(menuButton.getElement(),
      goog.a11y.aria.State.HASPOPUP));
  var menu = new goog.ui.Menu();
  menu.createDom();
  menuButton.setMenu(menu);
  assertTrue('Menu button must have aria-haspopup attribute set to true',
      goog.a11y.aria.getState(menuButton.getElement(),
      goog.a11y.aria.State.HASPOPUP));
  menuButton.setMenu(null);
  assertFale('Menu button must have aria-haspopup attribute set to false',
      goog.a11y.aria.getState(menuButton.getElement(),
      goog.a11y.aria.State.HASPOPUP));
}


/**
 * Open the menu and click on the menu item inside.
 * Check if the aria-haspopup property is set correctly.
 */
function testBasicButtonBehavior() {
  var node = goog.dom.getElement('demoMenuButton');
  menuButton.decorate(node);

  assertEquals('Menu button must have aria-haspopup attribute set to true',
      'true', goog.a11y.aria.getState(menuButton.getElement(),
      goog.a11y.aria.State.HASPOPUP));

  goog.testing.events.fireClickSequence(node);

  assertTrue('Menu must open after click', menuButton.isOpen());

  var menuItemClicked = 0;
  var lastMenuItemClicked = null;
  goog.events.listen(menuButton.getMenu(),
      goog.ui.Component.EventType.ACTION,
      function(e) {
        menuItemClicked++;
        lastMenuItemClicked = e.target;
      });

  var menuItem2 = goog.dom.getElement('menuItem2');
  goog.testing.events.fireClickSequence(menuItem2);
  assertFalse('Menu must close on clicking when open', menuButton.isOpen());
  assertEquals('Number of menu items clicked should be 1', 1, menuItemClicked);
  assertEquals('menuItem2 should be the last menuitem clicked', menuItem2,
      lastMenuItemClicked.getElement());
}


/**
 * Open the menu, highlight first menuitem and then the second.
 * Check if the aria-activedescendant property is set correctly.
 */
function testHighlightItemBehavior() {
  var node = goog.dom.getElement('demoMenuButton');
  menuButton.decorate(node);
  goog.testing.events.fireClickSequence(node);

  assertTrue('Menu must open after click', menuButton.isOpen());

  menuButton.handleKeyEvent(new MyFakeEvent(goog.events.KeyCodes.DOWN));
  assertNotNull(menuButton.getElement());
  assertEquals('First menuitem must be the aria-activedescendant',
      'menuItem1', goog.a11y.aria.getState(menuButton.getElement(),
      goog.a11y.aria.State.ACTIVEDESCENDANT));

  menuButton.handleKeyEvent(new MyFakeEvent(goog.events.KeyCodes.DOWN));
  assertEquals('Second menuitem must be the aria-activedescendant',
      'menuItem2', goog.a11y.aria.getState(menuButton.getElement(),
      goog.a11y.aria.State.ACTIVEDESCENDANT));
}


/**
 * Check that the appropriate items are selected when menus are opened with the
 * keyboard and setSelectFirstOnEnterOrSpace is not set.
 */
function testHighlightFirstOnOpen() {
  var node = goog.dom.getElement('demoMenuButton');
  menuButton.decorate(node);
  menuButton.handleKeyEvent(new MyFakeEvent(goog.events.KeyCodes.ENTER));
  assertEquals(
      'By default no items should be highlighted when opened with enter.',
      null, menuButton.getMenu().getHighlighted());

  menuButton.setOpen(false);
  menuButton.handleKeyEvent(new MyFakeEvent(goog.events.KeyCodes.DOWN));
  assertTrue('Menu must open after down key', menuButton.isOpen());
  assertEquals('First menuitem must be highlighted',
      'menuItem1', menuButton.getMenu().getHighlighted().getElement().id);
}


/**
 * Check that the appropriate items are selected when menus are opened with the
 * keyboard, setSelectFirstOnEnterOrSpace is not set, and the first menu item is
 * disabled.
 */
function testHighlightFirstOnOpen_withFirstDisabled() {
  var node = goog.dom.getElement('demoMenuButton');
  menuButton.decorate(node);
  var menu = menuButton.getMenu();
  menu.getItemAt(0).setEnabled(false);

  menuButton.handleKeyEvent(new MyFakeEvent(goog.events.KeyCodes.ENTER));
  assertEquals(
      'By default no items should be highlighted when opened with enter.',
      null, menuButton.getMenu().getHighlighted());

  menuButton.setOpen(false);
  menuButton.handleKeyEvent(new MyFakeEvent(goog.events.KeyCodes.DOWN));
  assertTrue('Menu must open after down key', menuButton.isOpen());
  assertEquals('First enabled menuitem must be highlighted',
      'menuItem2', menuButton.getMenu().getHighlighted().getElement().id);
}


/**
 * Check that the appropriate items are selected when menus are opened with the
 * keyboard and setSelectFirstOnEnterOrSpace is set.
 */
function testHighlightFirstOnOpen_withEnterOrSpaceSet() {
  var node = goog.dom.getElement('demoMenuButton');
  menuButton.decorate(node);
  menuButton.setSelectFirstOnEnterOrSpace(true);
  menuButton.handleKeyEvent(new MyFakeEvent(goog.events.KeyCodes.ENTER));
  assertEquals('The first item should be highlighted when opened with enter ' +
      'after setting selectFirstOnEnterOrSpace',
      'menuItem1', menuButton.getMenu().getHighlighted().getElement().id);
}


/**
 * Check that the appropriate item is selected when a menu is opened with the
 * keyboard, setSelectFirstOnEnterOrSpace is true, and the first menu item is
 * disabled.
 */
function testHighlightFirstOnOpen_withEnterOrSpaceSetAndFirstDisabled() {
  var node = goog.dom.getElement('demoMenuButton');
  menuButton.decorate(node);
  menuButton.setSelectFirstOnEnterOrSpace(true);
  var menu = menuButton.getMenu();
  menu.getItemAt(0).setEnabled(false);

  menuButton.handleKeyEvent(new MyFakeEvent(goog.events.KeyCodes.ENTER));
  assertEquals('The first enabled item should be highlighted when opened ' +
      'with enter after setting selectFirstOnEnterOrSpace',
      'menuItem2', menuButton.getMenu().getHighlighted().getElement().id);
}


/**
 * Open the menu, enter a submenu and then back out of it.
 * Check if the aria-activedescendant property is set correctly.
 */
function testCloseSubMenuBehavior() {
  var node = goog.dom.getElement('demoMenuButton');
  menuButton.decorate(node);
  var menu = menuButton.getMenu();
  var subMenu = new goog.ui.SubMenu('Submenu');
  menu.addItem(subMenu);
  subMenu.getElement().id = 'subMenu';
  var subMenuMenu = new goog.ui.Menu();
  subMenu.setMenu(subMenuMenu);
  var subMenuItem = new goog.ui.MenuItem('Submenu item 1');
  subMenuMenu.addItem(subMenuItem);
  subMenuItem.getElement().id = 'subMenuItem1';
  menuButton.setOpen(true);

  for (var i = 0; i < 4; i++) {
    menuButton.handleKeyEvent(new MyFakeEvent(goog.events.KeyCodes.DOWN));
  }
  assertEquals('Submenu must be the aria-activedescendant',
      'subMenu', goog.a11y.aria.getState(menuButton.getElement(),
          goog.a11y.aria.State.ACTIVEDESCENDANT));

  menuButton.handleKeyEvent(new MyFakeEvent(goog.events.KeyCodes.RIGHT));
  assertEquals('Submenu item 1 must be the aria-activedescendant',
      'subMenuItem1', goog.a11y.aria.getState(menuButton.getElement(),
          goog.a11y.aria.State.ACTIVEDESCENDANT));

  menuButton.handleKeyEvent(new MyFakeEvent(goog.events.KeyCodes.LEFT));
  assertEquals('Submenu must be the aria-activedescendant',
      'subMenu', goog.a11y.aria.getState(menuButton.getElement(),
          goog.a11y.aria.State.ACTIVEDESCENDANT));
}


/**
 * Make sure the menu opens when enter is pressed.
 */
function testEnterOpensMenu() {
  var node = goog.dom.getElement('demoMenuButton');
  menuButton.decorate(node);
  menuButton.handleKeyEvent(new MyFakeEvent(goog.events.KeyCodes.ENTER));
  assertTrue('Menu must open after enter', menuButton.isOpen());
}


/**
 * Tests the behavior of the enter and space keys when the menu is open.
 */
function testSpaceOrEnterClosesMenu() {
  var node = goog.dom.getElement('demoMenuButton');
  menuButton.decorate(node);

  menuButton.setOpen(true);
  menuButton.handleKeyEvent(new MyFakeEvent(goog.events.KeyCodes.ENTER));
  assertFalse('Menu should close after pressing Enter', menuButton.isOpen());

  menuButton.setOpen(true);
  menuButton.handleKeyEvent(new MyFakeEvent(goog.events.KeyCodes.SPACE,
      goog.events.EventType.KEYUP));
  assertFalse('Menu should close after pressing Space', menuButton.isOpen());
}


/**
 * Tests that a keydown event of the escape key propagates normally when the
 * menu is closed.
 */
function testStopEscapePropagationMenuClosed() {
  var node = goog.dom.getElement('demoMenuButton');
  var fakeEvent = new MyFakeEvent(
      goog.events.KeyCodes.ESCAPE, goog.events.EventType.KEYDOWN);
  menuButton.decorate(node);
  menuButton.setOpen(false);

  menuButton.handleKeyDownEvent_(fakeEvent);
  assertFalse('Event propagation was erroneously stopped.',
      fakeEvent.propagationStopped);
}


/**
 * Tests that a keydown event of the escape key is prevented from propagating
 * when the menu is open.
 */
function testStopEscapePropagationMenuOpen() {
  var node = goog.dom.getElement('demoMenuButton');
  var fakeEvent = new MyFakeEvent(
      goog.events.KeyCodes.ESCAPE, goog.events.EventType.KEYDOWN);
  menuButton.decorate(node);
  menuButton.setOpen(true);

  menuButton.handleKeyDownEvent_(fakeEvent);
  assertTrue(
      'Event propagation was not stopped.', fakeEvent.propagationStopped);
}


/**
 * Open the menu and click on the menu item inside after exiting and entering
 * the document once, to test proper setup/teardown behavior of MenuButton.
 */
function testButtonAfterEnterDocument() {
  var node = goog.dom.getElement('demoMenuButton');
  menuButton.decorate(node);

  menuButton.exitDocument();
  menuButton.enterDocument();

  goog.testing.events.fireClickSequence(node);
  assertTrue('Menu must open after click', menuButton.isOpen());

  var menuItem2 = goog.dom.getElement('menuItem2');
  goog.testing.events.fireClickSequence(menuItem2);
  assertFalse('Menu must close on clicking when open', menuButton.isOpen());
}


/**
 * Renders the menu button, moves its menu and then repositions to make sure the
 * position is more or less ok.
 */
function testPositionMenu() {
  var node = goog.dom.getElement('demoMenuButton');
  menuButton.decorate(node);
  var menu = menuButton.getMenu();
  menu.setVisible(true, true);

  // Move to 500, 500
  menu.setPosition(500, 500);

  // Now reposition and make sure position is more or less ok.
  menuButton.positionMenu();
  var menuNode = goog.dom.getElement('demoMenu');
  assertRoughlyEquals(menuNode.offsetTop, node.offsetTop + node.offsetHeight,
      20);
  assertRoughlyEquals(menuNode.offsetLeft, node.offsetLeft, 20);
}


/**
 * Tests that calling positionMenu when the menu is not in the document does not
 * throw an exception.
 */
function testPositionMenuNotInDocument() {
  var menu = new goog.ui.Menu();
  menu.createDom();
  menuButton.setMenu(menu);
  menuButton.positionMenu();
}


/**
 * Shows the menu and moves the menu button, a timer correct the menu position.
 */
function testOpenedMenuPositionCorrection() {
  var iframe = goog.dom.getElement('iframe1');
  var iframeDoc = goog.dom.getFrameContentDocument(iframe);
  var iframeDom = goog.dom.getDomHelper(iframeDoc);
  var iframeWindow = goog.dom.getWindow(iframeDoc);

  var button = new goog.ui.MenuButton();
  iframeWindow.scrollTo(0, 0);
  var node = iframeDom.getElement('demoMenuButton');
  button.decorate(node);
  var mockTimer = new goog.Timer();
  // Don't start the timer.  We manually dispatch the Tick event.
  mockTimer.start = goog.nullFunction;
  button.timer_ = mockTimer;

  var replacer = new goog.testing.PropertyReplacer();
  var positionMenuCalled;
  var origPositionMenu = goog.bind(button.positionMenu, button);
  replacer.set(button, 'positionMenu', function() {
    positionMenuCalled = true;
    origPositionMenu();
  });

  // Show the menu.
  button.setOpen(true);

  // Confirm the menu position
  var menuNode = iframeDom.getElement('demoMenu');
  assertRoughlyEquals(menuNode.offsetTop, node.offsetTop + node.offsetHeight,
      20);
  assertRoughlyEquals(menuNode.offsetLeft, node.offsetLeft, 20);

  positionMenuCalled = false;
  // A Tick event is dispatched.
  mockTimer.dispatchEvent(goog.Timer.TICK);
  assertFalse('positionMenu() shouldn\'t be called.', positionMenuCalled);

  // Move the menu button by DOM structure change
  var p1 = iframeDom.createDom(goog.dom.TagName.P, null,
                               iframeDom.createTextNode('foo'));
  var p2 = iframeDom.createDom(goog.dom.TagName.P, null,
                               iframeDom.createTextNode('foo'));
  var p3 = iframeDom.createDom(goog.dom.TagName.P, null,
                               iframeDom.createTextNode('foo'));
  iframeDom.insertSiblingBefore(p1, node);
  iframeDom.insertSiblingBefore(p2, node);
  iframeDom.insertSiblingBefore(p3, node);

  // Confirm the menu is detached from the button.
  assertTrue(Math.abs(node.offsetTop + node.offsetHeight -
      menuNode.offsetTop) > 20);

  positionMenuCalled = false;
  // A Tick event is dispatched.
  mockTimer.dispatchEvent(goog.Timer.TICK);
  assertTrue('positionMenu() should be called.', positionMenuCalled);

  // The menu is moved to appropriate position again.
  assertRoughlyEquals(menuNode.offsetTop, node.offsetTop + node.offsetHeight,
      20);

  // Make the frame page scrollable.
  var viewportHeight = iframeDom.getViewportSize().height;
  var footer = iframeDom.getElement('footer');
  goog.style.setSize(footer, 1, viewportHeight * 2);
  // Change the viewport offset.
  iframeWindow.scrollTo(0, viewportHeight);
  // A Tick event is dispatched and positionMenu() should be called.
  positionMenuCalled = false;
  mockTimer.dispatchEvent(goog.Timer.TICK);
  assertTrue('positionMenu() should be called.', positionMenuCalled);
  goog.style.setSize(footer, 1, 1);

  // Tear down.
  iframeDom.removeNode(p1);
  iframeDom.removeNode(p2);
  iframeDom.removeNode(p3);
  replacer.reset();
  button.dispose();
}


/**
 * Use a different button to position the menu and make sure it does so
 * correctly.
 */
function testAlternatePositioningElement() {
  var node = goog.dom.getElement('demoMenuButton');
  menuButton.decorate(node);

  var posElement = goog.dom.getElement('positionElement');
  menuButton.setPositionElement(posElement);

  // Show the menu.
  menuButton.setOpen(true);

  // Confirm the menu position
  var menuNode = menuButton.getMenu().getElement();
  assertRoughlyEquals(menuNode.offsetTop, posElement.offsetTop +
      posElement.offsetHeight, 20);
  assertRoughlyEquals(menuNode.offsetLeft, posElement.offsetLeft, 20);
}


/**
 * Test forced positioning above the button.
 */
function testPositioningAboveAnchor() {
  var node = goog.dom.getElement('demoMenuButton');
  menuButton.decorate(node);

  // Show the menu.
  menuButton.setAlignMenuToStart(true);  // Should get overridden below
  menuButton.setScrollOnOverflow(true);  // Should get overridden below

  var position = new goog.positioning.MenuAnchoredPosition(
      menuButton.getElement(),
      goog.positioning.Corner.TOP_START,
      /* opt_adjust */ false, /* opt_resize */ false);
  menuButton.setMenuPosition(position);
  menuButton.setOpen(true);

  // Confirm the menu position
  var buttonBounds = goog.style.getBounds(node);
  var menuNode = menuButton.getMenu().getElement();
  var menuBounds = goog.style.getBounds(menuNode);

  assertRoughlyEquals(menuBounds.top + menuBounds.height,
      buttonBounds.top, 3);
  assertRoughlyEquals(menuBounds.left, buttonBounds.left, 3);
  // For this test to be valid, the node must have non-trival height.
  assertRoughlyEquals(node.offsetHeight, 19, 3);
}


/**
 * Test forced positioning below the button.
 */
function testPositioningBelowAnchor() {
  var node = goog.dom.getElement('demoMenuButton');
  menuButton.decorate(node);

  // Show the menu.
  menuButton.setAlignMenuToStart(true);  // Should get overridden below
  menuButton.setScrollOnOverflow(true);  // Should get overridden below

  var position = new goog.positioning.MenuAnchoredPosition(
      menuButton.getElement(),
      goog.positioning.Corner.BOTTOM_START,
      /* opt_adjust */ false, /* opt_resize */ false);
  menuButton.setMenuPosition(position);
  menuButton.setOpen(true);

  // Confirm the menu position
  var buttonBounds = goog.style.getBounds(node);
  var menuNode = menuButton.getMenu().getElement();
  var menuBounds = goog.style.getBounds(menuNode);

  expectedFailures.expectFailureFor(isWinSafariBefore5());
  try {
    assertRoughlyEquals(menuBounds.top,
        buttonBounds.top + buttonBounds.height, 3);
    assertRoughlyEquals(menuBounds.left, buttonBounds.left, 3);
  } catch (e) {
    expectedFailures.handleException(e);
  }
  // For this test to be valid, the node must have non-trival height.
  assertRoughlyEquals(node.offsetHeight, 19, 3);
}

function isWinSafariBefore5() {
  return goog.userAgent.WINDOWS && goog.userAgent.product.SAFARI &&
      goog.userAgent.product.isVersion(4) &&
      !goog.userAgent.product.isVersion(5);
}


/**
 * Tests that space, and only space, fire on key up.
 */
function testSpaceFireOnKeyUp() {
  var node = goog.dom.getElement('demoMenuButton');
  menuButton.decorate(node);

  e = new goog.events.Event(goog.events.KeyHandler.EventType.KEY, menuButton);
  e.preventDefault = goog.testing.recordFunction();
  e.keyCode = goog.events.KeyCodes.SPACE;
  menuButton.handleKeyEvent(e);
  assertFalse('Menu must not have been triggered by Space keypress',
      menuButton.isOpen());
  assertNotNull('Page scrolling is prevented', e.preventDefault.getLastCall());

  e = new goog.events.Event(goog.events.EventType.KEYUP, menuButton);
  e.keyCode = goog.events.KeyCodes.SPACE;
  menuButton.handleKeyEvent(e);
  assertTrue('Menu must have been triggered by Space keyup',
      menuButton.isOpen());
  menuButton.getMenu().setHighlightedIndex(0);
  e = new goog.events.Event(goog.events.KeyHandler.EventType.KEY, menuButton);
  e.keyCode = goog.events.KeyCodes.DOWN;
  menuButton.handleKeyEvent(e);
  assertEquals('Highlighted menu item must have hanged by Down keypress',
      1,
      menuButton.getMenu().getHighlightedIndex());

  menuButton.getMenu().setHighlightedIndex(0);
  e = new goog.events.Event(goog.events.EventType.KEYUP, menuButton);
  e.keyCode = goog.events.KeyCodes.DOWN;
  menuButton.handleKeyEvent(e);
  assertEquals('Highlighted menu item must not have changed by Down keyup',
      0,
      menuButton.getMenu().getHighlightedIndex());
}


/**
 * Tests that preventing the button from closing also prevents the menu from
 * being hidden.
 */
function testPreventHide() {
  var node = goog.dom.getElement('demoMenuButton');
  menuButton.decorate(node);
  menuButton.setDispatchTransitionEvents(goog.ui.Component.State.OPENED, true);

  // Show the menu.
  menuButton.setOpen(true);
  assertTrue('Menu button should be open.', menuButton.isOpen());
  assertTrue('Menu should be visible.', menuButton.getMenu().isVisible());

  var key = goog.events.listen(menuButton,
                               goog.ui.Component.EventType.CLOSE,
                               function(event) { event.preventDefault(); });

  // Try to hide the menu.
  menuButton.setOpen(false);
  assertTrue('Menu button should still be open.', menuButton.isOpen());
  assertTrue('Menu should still be visible.', menuButton.getMenu().isVisible());

  // Remove listener and try again.
  goog.events.unlistenByKey(key);
  menuButton.setOpen(false);
  assertFalse('Menu button should not be open.', menuButton.isOpen());
  assertFalse('Menu should not be visible.', menuButton.getMenu().isVisible());
}


/**
 * Tests that opening and closing the menu does not affect how adding or
 * removing menu items changes the size of the menu.
 */
function testResizeOnItemAddOrRemove() {
  var node = goog.dom.getElement('demoMenuButton');
  menuButton.decorate(node);
  var menu = menuButton.getMenu();

  // Show the menu.
  menuButton.setOpen(true);
  var originalSize = goog.style.getSize(menu.getElement());

  // Check that removing an item while the menu is left open correctly changes
  // the size of the menu.
  // Remove an item using a method on Menu.
  var item = menu.removeChildAt(0, true);
  // Confirm size of menu changed.
  var afterRemoveSize = goog.style.getSize(menu.getElement());
  assertTrue('Height of menu must decrease after removing a menu item.',
      afterRemoveSize.height < originalSize.height);

  // Check that removing an item while the menu is closed, then opened
  // (so that reposition is called) correctly changes the size of the menu.
  // Hide menu.
  menuButton.setOpen(false);
  var item2 = menu.removeChildAt(0, true);
  menuButton.setOpen(true);
  // Confirm size of menu changed.
  var afterRemoveAgainSize = goog.style.getSize(menu.getElement());
  assertTrue('Height of menu must decrease after removing a second menu item.',
      afterRemoveAgainSize.height < afterRemoveSize.height);

  // Check that adding an item while the menu is opened, then closed, then
  // opened, correctly changes the size of the menu.
  // Add an item, this time using a MenuButton method.
  menuButton.setOpen(true);
  menuButton.addItem(item2);
  menuButton.setOpen(false);
  menuButton.setOpen(true);
  // Confirm size of menu changed.
  var afterAddSize = goog.style.getSize(menu.getElement());
  assertTrue('Height of menu must increase after adding a menu item.',
      afterRemoveAgainSize.height < afterAddSize.height);
  assertEquals(
      'Removing and adding back items must not change the height of a menu.',
      afterRemoveSize.height, afterAddSize.height);

  // Add back the last item to keep state consistent.
  menuButton.addItem(item);
}


/**
 * Tests that adding and removing items from a menu with scrollOnOverflow is on
 * correctly resizes the menu.
 */
function testResizeOnItemAddOrRemoveWithScrollOnOverflow() {
  var node = goog.dom.getElement('demoMenuButton');
  menuButton.decorate(node);
  var menu = menuButton.getMenu();

  // Show the menu.
  menuButton.setScrollOnOverflow(true);
  menuButton.setOpen(true);
  var originalSize = goog.style.getSize(menu.getElement());

  // Check that removing an item while the menu is left open correctly changes
  // the size of the menu.
  // Remove an item using a method on Menu.
  var item = menu.removeChildAt(0, true);
  menuButton.invalidateMenuSize();
  menuButton.positionMenu();

  // Confirm size of menu changed.
  var afterRemoveSize = goog.style.getSize(menu.getElement());
  assertTrue('Height of menu must decrease after removing a menu item.',
      afterRemoveSize.height < originalSize.height);

  var item2 = menu.removeChildAt(0, true);
  menuButton.invalidateMenuSize();
  menuButton.positionMenu();

  // Confirm size of menu changed.
  var afterRemoveAgainSize = goog.style.getSize(menu.getElement());
  assertTrue('Height of menu must decrease after removing a second menu item.',
      afterRemoveAgainSize.height < afterRemoveSize.height);

  // Check that adding an item while the menu is opened correctly changes the
  // size of the menu.
  menuButton.addItem(item2);
  menuButton.invalidateMenuSize();
  menuButton.positionMenu();

  // Confirm size of menu changed.
  var afterAddSize = goog.style.getSize(menu.getElement());
  assertTrue('Height of menu must increase after adding a menu item.',
      afterRemoveAgainSize.height < afterAddSize.height);
  assertEquals(
      'Removing and adding back items must not change the height of a menu.',
      afterRemoveSize.height, afterAddSize.height);
}


/**
 * Try rendering the menu as a sibling rather than as a child of the dom. This
 * tests the case when the button is rendered, rather than decorated.
 */
function testRenderMenuAsSibling() {
  menuButton.setRenderMenuAsSibling(true);
  menuButton.addItem(new goog.ui.MenuItem('Menu item 1'));
  menuButton.addItem(new goog.ui.MenuItem('Menu item 2'));
  // By default the menu is rendered into the top level dom and the button
  // is rendered into whatever parent we provide.  If we don't provide a
  // parent then we aren't really testing anything, since both would be, by
  // default, rendered into the top level dom, and therefore siblings.
  menuButton.render(goog.dom.getElement('siblingTest'));
  menuButton.setOpen(true);
  assertEquals(
      menuButton.getElement().parentNode,
      menuButton.getMenu().getElement().parentNode);
}


/**
 * Check that we render the menu as a sibling of the menu button, immediately
 * after the menu button.
 */
function testRenderMenuAsSiblingForDecoratedButton() {
  var menu = new goog.ui.Menu();
  menu.addChild(new goog.ui.MenuItem('Menu item 1'), true /* render */);
  menu.addChild(new goog.ui.MenuItem('Menu item 2'), true /* render */);
  menu.addChild(new goog.ui.MenuItem('Menu item 3'), true /* render */);

  var menuButton = new goog.ui.MenuButton();
  menuButton.setMenu(menu);
  menuButton.setRenderMenuAsSibling(true);
  var node = goog.dom.getElement('button1');
  menuButton.decorate(node);

  menuButton.setOpen(true);

  assertEquals('The menu should be rendered immediately after the menu button',
      goog.dom.getNextElementSibling(menuButton.getElement()),
      menu.getElement());

  assertEquals('The menu should be rendered immediately before the next button',
      goog.dom.getNextElementSibling(menu.getElement()),
      goog.dom.getElement('button2'));
}

function testAlignToStartSetter() {
  assertTrue(menuButton.isAlignMenuToStart());

  menuButton.setAlignMenuToStart(false);
  assertFalse(menuButton.isAlignMenuToStart());

  menuButton.setAlignMenuToStart(true);
  assertTrue(menuButton.isAlignMenuToStart());
}

function testScrollOnOverflowSetter() {
  assertFalse(menuButton.isScrollOnOverflow());

  menuButton.setScrollOnOverflow(true);
  assertTrue(menuButton.isScrollOnOverflow());

  menuButton.setScrollOnOverflow(false);
  assertFalse(menuButton.isScrollOnOverflow());
}


/**
 * Tests that the attached menu has been set to aria-hidden=false explicitly
 * when the menu is opened.
 */
function testSetOpenUnsetsAriaHidden() {
  var node = goog.dom.getElement('demoMenuButton');
  menuButton.decorate(node);
  var menuElem = menuButton.getMenu().getElementStrict();
  goog.a11y.aria.setState(menuElem, goog.a11y.aria.State.HIDDEN, true);
  menuButton.setOpen(true);
  assertEquals(
      '', goog.a11y.aria.getState(menuElem, goog.a11y.aria.State.HIDDEN));
}
