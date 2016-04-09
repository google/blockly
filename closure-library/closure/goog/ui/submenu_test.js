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

goog.provide('goog.ui.SubMenuTest');
goog.setTestOnly('goog.ui.SubMenuTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.State');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.functions');
goog.require('goog.positioning');
goog.require('goog.positioning.Overflow');
goog.require('goog.style');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.SubMenu');
goog.require('goog.ui.SubMenuRenderer');

var menu;
var clonedMenuDom;

var mockClock;

// mock out goog.positioning.positionAtCoordinate so that
// the menu always fits. (we don't care about testing the
// dynamic menu positioning if the menu doesn't fit in the window.)
var oldPositionFn = goog.positioning.positionAtCoordinate;
goog.positioning.positionAtCoordinate = function(
    absolutePos, movableElement, movableElementCorner, opt_margin,
    opt_overflow) {
  return oldPositionFn.call(
      null, absolutePos, movableElement, movableElementCorner, opt_margin,
      goog.positioning.Overflow.IGNORE);
};

function setUp() {
  clonedMenuDom = goog.dom.getElement('demoMenu').cloneNode(true);

  menu = new goog.ui.Menu();
}

function tearDown() {
  document.body.style.direction = 'ltr';
  menu.dispose();

  var element = goog.dom.getElement('demoMenu');
  element.parentNode.replaceChild(clonedMenuDom, element);

  goog.dom.removeChildren(goog.dom.getElement('sandbox'));

  if (mockClock) {
    mockClock.uninstall();
    mockClock = null;
  }
}

function assertKeyHandlingIsCorrect(keyToOpenSubMenu, keyToCloseSubMenu) {
  menu.setFocusable(true);
  menu.decorate(goog.dom.getElement('demoMenu'));

  var KeyCodes = goog.events.KeyCodes;
  var plainItem = menu.getChildAt(0);
  plainItem.setMnemonic(KeyCodes.F);

  var subMenuItem1 = menu.getChildAt(1);
  subMenuItem1.setMnemonic(KeyCodes.S);
  var subMenuItem1Menu = subMenuItem1.getMenu();
  menu.setHighlighted(plainItem);

  var fireKeySequence = goog.testing.events.fireKeySequence;

  assertTrue(
      'Expected OpenSubMenu key to not be handled',
      fireKeySequence(plainItem.getElement(), keyToOpenSubMenu));
  assertFalse(subMenuItem1Menu.isVisible());

  assertFalse(
      'Expected F key to be handled',
      fireKeySequence(plainItem.getElement(), KeyCodes.F));

  assertFalse(
      'Expected DOWN key to be handled',
      fireKeySequence(plainItem.getElement(), KeyCodes.DOWN));
  assertEquals(subMenuItem1, menu.getChildAt(1));

  assertFalse(
      'Expected OpenSubMenu key to be handled',
      fireKeySequence(subMenuItem1.getElement(), keyToOpenSubMenu));
  assertTrue(subMenuItem1Menu.isVisible());

  assertFalse(
      'Expected CloseSubMenu key to be handled',
      fireKeySequence(subMenuItem1.getElement(), keyToCloseSubMenu));
  assertFalse(subMenuItem1Menu.isVisible());

  assertFalse(
      'Expected UP key to be handled',
      fireKeySequence(subMenuItem1.getElement(), KeyCodes.UP));

  assertFalse(
      'Expected S key to be handled',
      fireKeySequence(plainItem.getElement(), KeyCodes.S));
  assertTrue(subMenuItem1Menu.isVisible());
}

function testKeyHandling_ltr() {
  assertKeyHandlingIsCorrect(
      goog.events.KeyCodes.RIGHT, goog.events.KeyCodes.LEFT);
}

function testKeyHandling_rtl() {
  document.body.style.direction = 'rtl';
  assertKeyHandlingIsCorrect(
      goog.events.KeyCodes.LEFT, goog.events.KeyCodes.RIGHT);
}

function testNormalLtrSubMenu() {
  menu.decorate(goog.dom.getElement('demoMenu'));
  var subMenu = menu.getChildAt(1);
  assertArrowDirection(subMenu, false);
  assertRenderDirection(subMenu, false);
  assertArrowPosition(subMenu, false);
}

function testNormalRtlSubMenu() {
  document.body.style.direction = 'rtl';
  menu.decorate(goog.dom.getElement('demoMenu'));
  var subMenu = menu.getChildAt(1);
  assertArrowDirection(subMenu, true);
  assertRenderDirection(subMenu, true);
  assertArrowPosition(subMenu, true);
}

function testLtrSubMenuAlignedToStart() {
  menu.decorate(goog.dom.getElement('demoMenu'));
  var subMenu = menu.getChildAt(1);
  subMenu.setAlignToEnd(false);
  assertArrowDirection(subMenu, true);
  assertRenderDirection(subMenu, true);
  assertArrowPosition(subMenu, false);
}

function testNullContentElement() {
  var subMenu = new goog.ui.SubMenu();
  subMenu.setContent('demo');
}

function testRtlSubMenuAlignedToStart() {
  document.body.style.direction = 'rtl';
  menu.decorate(goog.dom.getElement('demoMenu'));
  var subMenu = menu.getChildAt(1);
  subMenu.setAlignToEnd(false);
  assertArrowDirection(subMenu, false);
  assertRenderDirection(subMenu, false);
  assertArrowPosition(subMenu, true);
}

function testSetContentKeepsArrow_ltr() {
  document.body.style.direction = 'ltr';
  menu.decorate(goog.dom.getElement('demoMenu'));
  var subMenu = menu.getChildAt(1);
  subMenu.setAlignToEnd(false);
  subMenu.setContent('test');
  assertArrowDirection(subMenu, true);
  assertRenderDirection(subMenu, true);
  assertArrowPosition(subMenu, false);
}

function testSetContentKeepsArrow_rtl() {
  document.body.style.direction = 'rtl';
  menu.decorate(goog.dom.getElement('demoMenu'));
  var subMenu = menu.getChildAt(1);
  subMenu.setAlignToEnd(false);
  subMenu.setContent('test');
  assertArrowDirection(subMenu, false);
  assertRenderDirection(subMenu, false);
  assertArrowPosition(subMenu, true);
}

function testExitDocument() {
  menu.decorate(goog.dom.getElement('demoMenu'));
  var subMenu = menu.getChildAt(1);
  var innerMenu = subMenu.getMenu();

  assertTrue('Top-level menu was not in document', menu.isInDocument());
  assertTrue('Submenu was not in document', subMenu.isInDocument());
  assertTrue('Inner menu was not in document', innerMenu.isInDocument());

  menu.exitDocument();

  assertFalse('Top-level menu was in document', menu.isInDocument());
  assertFalse('Submenu was in document', subMenu.isInDocument());
  assertFalse('Inner menu was in document', innerMenu.isInDocument());
}

function testDisposal() {
  menu.decorate(goog.dom.getElement('demoMenu'));
  var subMenu = menu.getChildAt(1);
  var innerMenu = subMenu.getMenu();
  menu.dispose();

  assert('Top-level menu was not disposed', menu.getDisposed());
  assert('Submenu was not disposed', subMenu.getDisposed());
  assert('Inner menu was not disposed', innerMenu.getDisposed());
}

function testShowAndDismissSubMenu() {
  var openEventDispatched = false;
  var closeEventDispatched = false;

  function handleEvent(e) {
    switch (e.type) {
      case goog.ui.Component.EventType.OPEN:
        openEventDispatched = true;
        break;
      case goog.ui.Component.EventType.CLOSE:
        closeEventDispatched = true;
        break;
      default:
        fail('Invalid event type: ' + e.type);
    }
  }

  menu.decorate(goog.dom.getElement('demoMenu'));
  var subMenu = menu.getChildAt(1);
  subMenu.setHighlighted(true);

  goog.events.listen(
      subMenu,
      [goog.ui.Component.EventType.OPEN, goog.ui.Component.EventType.CLOSE],
      handleEvent);

  assertFalse(
      'Submenu must not have "-open" CSS class',
      goog.dom.classlist.contains(subMenu.getElement(), 'goog-submenu-open'));
  assertFalse('Popup menu must not be visible', subMenu.getMenu().isVisible());
  assertFalse('No OPEN event must have been dispatched', openEventDispatched);
  assertFalse('No CLOSE event must have been dispatched', closeEventDispatched);

  subMenu.showSubMenu();
  assertTrue(
      'Submenu must have "-open" CSS class',
      goog.dom.classlist.contains(subMenu.getElement(), 'goog-submenu-open'));
  assertTrue('Popup menu must be visible', subMenu.getMenu().isVisible());
  assertTrue('OPEN event must have been dispatched', openEventDispatched);
  assertFalse('No CLOSE event must have been dispatched', closeEventDispatched);

  subMenu.dismissSubMenu();
  assertFalse(
      'Submenu must not have "-open" CSS class',
      goog.dom.classlist.contains(subMenu.getElement(), 'goog-submenu-open'));
  assertFalse('Popup menu must not be visible', subMenu.getMenu().isVisible());
  assertTrue('CLOSE event must have been dispatched', closeEventDispatched);

  goog.events.unlisten(
      subMenu,
      [goog.ui.Component.EventType.OPEN, goog.ui.Component.EventType.CLOSE],
      handleEvent);
}

function testDismissWhenSubMenuNotVisible() {
  var openEventDispatched = false;
  var closeEventDispatched = false;

  function handleEvent(e) {
    switch (e.type) {
      case goog.ui.Component.EventType.OPEN:
        openEventDispatched = true;
        break;
      case goog.ui.Component.EventType.CLOSE:
        closeEventDispatched = true;
        break;
      default:
        fail('Invalid event type: ' + e.type);
    }
  }

  menu.decorate(goog.dom.getElement('demoMenu'));
  var subMenu = menu.getChildAt(1);
  subMenu.setHighlighted(true);

  goog.events.listen(
      subMenu,
      [goog.ui.Component.EventType.OPEN, goog.ui.Component.EventType.CLOSE],
      handleEvent);

  assertFalse(
      'Submenu must not have "-open" CSS class',
      goog.dom.classlist.contains(subMenu.getElement(), 'goog-submenu-open'));
  assertFalse('Popup menu must not be visible', subMenu.getMenu().isVisible());
  assertFalse('No OPEN event must have been dispatched', openEventDispatched);
  assertFalse('No CLOSE event must have been dispatched', closeEventDispatched);

  subMenu.showSubMenu();
  subMenu.getMenu().setVisible(false);

  subMenu.dismissSubMenu();
  assertFalse(
      'Submenu must not have "-open" CSS class',
      goog.dom.classlist.contains(subMenu.getElement(), 'goog-submenu-open'));
  assertFalse(subMenu.menuIsVisible_);
  assertFalse('Popup menu must not be visible', subMenu.getMenu().isVisible());
  assertTrue('CLOSE event must have been dispatched', closeEventDispatched);

  goog.events.unlisten(
      subMenu,
      [goog.ui.Component.EventType.OPEN, goog.ui.Component.EventType.CLOSE],
      handleEvent);
}

function testCloseSubMenuBehavior() {
  menu.decorate(goog.dom.getElement('demoMenu'));
  var subMenu = menu.getChildAt(1);
  subMenu.getElement().id = 'subMenu';

  var innerMenu = subMenu.getMenu();
  innerMenu.getChildAt(0).getElement().id = 'child1';

  subMenu.setHighlighted(true);
  subMenu.showSubMenu();

  function MyFakeEvent(keyCode, opt_eventType) {
    this.type = opt_eventType || goog.events.KeyHandler.EventType.KEY;
    this.keyCode = keyCode;
    this.propagationStopped = false;
    this.preventDefault = goog.nullFunction;
    this.stopPropagation = function() { this.propagationStopped = true; };
  }

  // Focus on the first item in the submenu and verify the activedescendant is
  // set correctly.
  subMenu.handleKeyEvent(new MyFakeEvent(goog.events.KeyCodes.DOWN));
  assertEquals(
      'First item in submenu must be the aria-activedescendant', 'child1',
      goog.a11y.aria.getState(
          menu.getElement(), goog.a11y.aria.State.ACTIVEDESCENDANT));

  // Dismiss the submenu and verify the activedescendant is updated correctly.
  subMenu.handleKeyEvent(new MyFakeEvent(goog.events.KeyCodes.LEFT));
  assertEquals(
      'Submenu must be the aria-activedescendant', 'subMenu',
      goog.a11y.aria.getState(
          menu.getElement(), goog.a11y.aria.State.ACTIVEDESCENDANT));
}

function testLazyInstantiateSubMenu() {
  menu.decorate(goog.dom.getElement('demoMenu'));
  var subMenu = menu.getChildAt(1);
  subMenu.setHighlighted(true);

  var lazyMenu;

  var key = goog.events.listen(
      subMenu, goog.ui.Component.EventType.OPEN, function(e) {
        lazyMenu = new goog.ui.Menu();
        lazyMenu.addItem(new goog.ui.MenuItem('foo'));
        lazyMenu.addItem(new goog.ui.MenuItem('bar'));
        subMenu.setMenu(lazyMenu, /* opt_internal */ false);
      });

  subMenu.showSubMenu();
  assertNotNull('Popup menu must have been created', lazyMenu);
  assertEquals(
      'Popup menu must be a child of the submenu', subMenu,
      lazyMenu.getParent());
  assertTrue('Popup menu must have been rendered', lazyMenu.isInDocument());
  assertTrue('Popup menu must be visible', lazyMenu.isVisible());

  menu.dispose();
  assertTrue('Submenu must have been disposed of', subMenu.isDisposed());
  assertFalse(
      'Popup menu must not have been disposed of', lazyMenu.isDisposed());

  lazyMenu.dispose();

  goog.events.unlistenByKey(key);
}

function testReusableMenu() {
  var subMenuOne = new goog.ui.SubMenu('SubMenu One');
  var subMenuTwo = new goog.ui.SubMenu('SubMenu Two');
  menu.addItem(subMenuOne);
  menu.addItem(subMenuTwo);
  menu.render(goog.dom.getElement('sandbox'));

  // It is possible for the same popup menu to be shared between different
  // submenus.
  var sharedMenu = new goog.ui.Menu();
  sharedMenu.addItem(new goog.ui.MenuItem('Hello'));
  sharedMenu.addItem(new goog.ui.MenuItem('World'));

  assertNull('Shared menu must not have a parent', sharedMenu.getParent());

  subMenuOne.setMenu(sharedMenu);
  assertEquals(
      'SubMenuOne must point to the shared menu', sharedMenu,
      subMenuOne.getMenu());
  assertEquals(
      'SubMenuOne must be the shared menu\'s parent', subMenuOne,
      sharedMenu.getParent());

  subMenuTwo.setMenu(sharedMenu);
  assertEquals(
      'SubMenuTwo must point to the shared menu', sharedMenu,
      subMenuTwo.getMenu());
  assertEquals(
      'SubMenuTwo must be the shared menu\'s parent', subMenuTwo,
      sharedMenu.getParent());
  assertEquals(
      'SubMenuOne must still point to the shared menu', sharedMenu,
      subMenuOne.getMenu());

  menu.setHighlighted(subMenuOne);
  subMenuOne.showSubMenu();
  assertEquals(
      'SubMenuOne must point to the shared menu', sharedMenu,
      subMenuOne.getMenu());
  assertEquals(
      'SubMenuOne must be the shared menu\'s parent', subMenuOne,
      sharedMenu.getParent());
  assertEquals(
      'SubMenuTwo must still point to the shared menu', sharedMenu,
      subMenuTwo.getMenu());
  assertTrue('Shared menu must be visible', sharedMenu.isVisible());

  menu.setHighlighted(subMenuTwo);
  subMenuTwo.showSubMenu();
  assertEquals(
      'SubMenuTwo must point to the shared menu', sharedMenu,
      subMenuTwo.getMenu());
  assertEquals(
      'SubMenuTwo must be the shared menu\'s parent', subMenuTwo,
      sharedMenu.getParent());
  assertEquals(
      'SubMenuOne must still point to the shared menu', sharedMenu,
      subMenuOne.getMenu());
  assertTrue('Shared menu must be visible', sharedMenu.isVisible());
}


/**
 * If you remove a submenu in the interval between when a mouseover event
 * is fired on it, and showSubMenu() is called, showSubMenu causes a null
 * value to be dereferenced. This test validates that the fix for this works.
 * (See bug 1823144).
 */
function testDeleteItemDuringSubmenuDisplayInterval() {
  mockClock = new goog.testing.MockClock(true);

  var submenu = new goog.ui.SubMenu('submenu');
  submenu.addItem(new goog.ui.MenuItem('submenu item 1'));
  menu.addItem(submenu);

  // Trigger mouseover, and remove item before showSubMenu can be called.
  var e = new goog.events.Event();
  submenu.handleMouseOver(e);
  menu.removeItem(submenu);
  mockClock.tick(goog.ui.SubMenu.MENU_DELAY_MS);
  // (No JS error should occur.)
}

function testShowSubMenuAfterRemoval() {
  var submenu = new goog.ui.SubMenu('submenu');
  menu.addItem(submenu);
  menu.removeItem(submenu);
  submenu.showSubMenu();
  // (No JS error should occur.)
}


/**
 * Tests that if a sub menu is selectable, then it can handle actions.
 */
function testSubmenuSelectable() {
  var submenu = new goog.ui.SubMenu('submenu');
  submenu.addItem(new goog.ui.MenuItem('submenu item 1'));
  menu.addItem(submenu);
  submenu.setSelectable(true);

  var numClicks = 0;
  var menuClickedFn = function(e) { numClicks++; };

  goog.events.listen(
      submenu, goog.ui.Component.EventType.ACTION, menuClickedFn);
  submenu.performActionInternal(null);
  submenu.performActionInternal(null);

  assertEquals('The submenu should have fired an event', 2, numClicks);

  submenu.setSelectable(false);
  submenu.performActionInternal(null);

  assertEquals(
      'The submenu should not have fired any further events', 2, numClicks);
}


/**
 * Tests that if a sub menu is checkable, then it can handle actions.
 */
function testSubmenuCheckable() {
  var submenu = new goog.ui.SubMenu('submenu');
  submenu.addItem(new goog.ui.MenuItem('submenu item 1'));
  menu.addItem(submenu);
  submenu.setCheckable(true);

  var numClicks = 0;
  var menuClickedFn = function(e) { numClicks++; };

  goog.events.listen(
      submenu, goog.ui.Component.EventType.ACTION, menuClickedFn);
  submenu.performActionInternal(null);
  submenu.performActionInternal(null);

  assertEquals('The submenu should have fired an event', 2, numClicks);

  submenu.setCheckable(false);
  submenu.performActionInternal(null);

  assertEquals(
      'The submenu should not have fired any further events', 2, numClicks);
}


/**
 * Tests that entering a child menu cancels the dismiss timer for the submenu.
 */
function testEnteringChildCancelsDismiss() {
  var submenu = new goog.ui.SubMenu('submenu');
  submenu.isInDocument = goog.functions.TRUE;
  submenu.addItem(new goog.ui.MenuItem('submenu item 1'));
  menu.addItem(submenu);

  mockClock = new goog.testing.MockClock(true);
  submenu.getMenu().setVisible(true);

  // This starts the dismiss timer.
  submenu.setHighlighted(false);

  // This should cancel the dismiss timer.
  submenu.getMenu().dispatchEvent(goog.ui.Component.EventType.ENTER);

  // Tick the length of the dismiss timer.
  mockClock.tick(goog.ui.SubMenu.MENU_DELAY_MS);

  // Check that the menu is now highlighted and still visible.
  assertTrue(submenu.getMenu().isVisible());
  assertTrue(submenu.isHighlighted());
}


/**
 * Asserts that this sub menu renders in the right direction relative to
 * the parent menu.
 * @param {goog.ui.SubMenu} subMenu The sub menu.
 * @param {boolean} left True for left-pointing, false for right-pointing.
 */
function assertRenderDirection(subMenu, left) {
  subMenu.getParent().setHighlighted(subMenu);
  subMenu.showSubMenu();
  var menuItemPosition = goog.style.getPageOffset(subMenu.getElement());
  var menuPosition = goog.style.getPageOffset(subMenu.getMenu().getElement());
  assert(Math.abs(menuItemPosition.y - menuPosition.y) < 5);
  assertEquals(
      'Menu at: ' + menuPosition.x + ', submenu item at: ' + menuItemPosition.x,
      left, menuPosition.x < menuItemPosition.x);
}


/**
 * Asserts that this sub menu has a properly-oriented arrow.
 * @param {goog.ui.SubMenu} subMenu The sub menu.
 * @param {boolean} left True for left-pointing, false for right-pointing.
 */
function assertArrowDirection(subMenu, left) {
  assertEquals(
      left ? goog.ui.SubMenuRenderer.LEFT_ARROW_ :
             goog.ui.SubMenuRenderer.RIGHT_ARROW_,
      getArrowElement(subMenu).innerHTML);
}


/**
 * Asserts that the arrow position is correct.
 * @param {goog.ui.SubMenu} subMenu The sub menu.
 * @param {boolean} leftAlign True for left-aligned, false for right-aligned.
 */
function assertArrowPosition(subMenu, left) {
  var arrow = getArrowElement(subMenu);
  var expectedLeft =
      left ? 0 : arrow.offsetParent.offsetWidth - arrow.offsetWidth;
  var actualLeft = arrow.offsetLeft;
  assertTrue(
      'Expected left offset: ' + expectedLeft + '\n' +
          'Actual left offset: ' + actualLeft + '\n',
      Math.abs(expectedLeft - actualLeft) < 5);
}


/**
 * Gets the arrow element of a sub menu.
 * @param {goog.ui.SubMenu} subMenu The sub menu.
 * @return {Element} The arrow.
 */
function getArrowElement(subMenu) {
  return subMenu.getContentElement().lastChild;
}
