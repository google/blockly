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

goog.provide('goog.ui.PopupMenuTest');
goog.setTestOnly('goog.ui.PopupMenuTest');

goog.require('goog.dom');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.math.Box');
goog.require('goog.math.Coordinate');
goog.require('goog.positioning.Corner');
goog.require('goog.style');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Menu');
goog.require('goog.ui.MenuItem');
goog.require('goog.ui.PopupMenu');

var anchor;
var menu;
var menuitem;

// Event handler
var handler;
var showPopup;
var beforeShowPopupCalled;
var popup;

function setUp() {
  anchor = goog.dom.getElement('popup-anchor');
  menu = goog.dom.getElement('menu');
  menuitem1 = goog.dom.getElement('menuitem_1');
  menuitem3 = goog.dom.getElement('menuitem_3');
  handler = new goog.events.EventHandler();
  popup = new goog.ui.PopupMenu();
}

function tearDown() {
  handler.dispose();
  popup.dispose();
}


/**
 * Asserts properties of {@code target} matches the expected value.
 *
 * @param {Object} target The target specifying how the popup menu should be
 *     attached to an anchor.
 * @param {Element} expectedElement The expected anchoring element.
 * @param {goog.positioning.Corner} expectedTargetCorner The expected value of
 *     the {@code target.targetCorner_} property.
 * @param {goog.positioning.Corner} expectedMenuCorner The expected value of
 *     the {@code target.menuCorner_} property.
 * @param {goog.events.EventType} expectedEventType The expected value of the
 *     {@code target.eventType_} property.
 * @param {goog.math.Box} expectedMargin The expected value of the
 *     {@code target.margin_} property.
 */
function assertTarget(
    target, expectedElement, expectedTargetCorner, expectedMenuCorner,
    expectedEventType, expectedMargin) {
  var expectedTarget = {
    element_: expectedElement,
    targetCorner_: expectedTargetCorner,
    menuCorner_: expectedMenuCorner,
    eventType_: expectedEventType,
    margin_: expectedMargin
  };

  assertObjectEquals('Target does not match.', expectedTarget, target);
}


/**
 * Test menu receives BEFORE_SHOW event before it's displayed.
 */
function testBeforeShowEvent() {
  popup.render();
  var target = popup.createAttachTarget(anchor);
  popup.attach(anchor);

  function beforeShowPopup(e) {
    // Ensure that the element is not yet visible.
    assertFalse(
        'The element should not be shown when BEFORE_SHOW event is ' +
            'being handled',
        goog.style.isElementShown(popup.getElement()));
    // Verify that current anchor is set before dispatching BEFORE_SHOW.
    assertNotNullNorUndefined(popup.getAttachedElement());
    assertEquals(
        'The attached anchor element is incorrect', target.element_,
        popup.getAttachedElement());
    beforeShowPopupCalled = true;
    return showPopup;
  };
  function onShowPopup(e) {
    assertEquals(
        'The attached anchor element is incorrect', target.element_,
        popup.getAttachedElement());
  };

  handler.listen(popup, goog.ui.Menu.EventType.BEFORE_SHOW, beforeShowPopup);
  handler.listen(popup, goog.ui.Menu.EventType.SHOW, onShowPopup);

  beforeShowPopupCalled = false;
  showPopup = false;
  popup.showMenu(target, 0, 0);
  assertTrue(
      'BEFORE_SHOW event handler should be called on #showMenu',
      beforeShowPopupCalled);
  assertFalse(
      'The element should not be shown when BEFORE_SHOW handler ' +
          'returned false',
      goog.style.isElementShown(popup.getElement()));

  beforeShowPopupCalled = false;
  showPopup = true;
  popup.showMenu(target, 0, 0);
  assertTrue(
      'The element should be shown when BEFORE_SHOW handler ' +
          'returned true',
      goog.style.isElementShown(popup.getElement()));
}


/**
 * Test the behavior of {@link PopupMenu.isAttachTarget}.
 */
function testIsAttachTarget() {
  popup.render();
  // Before 'attach' is called.
  assertFalse(
      'Menu should not be attached to the element',
      popup.isAttachTarget(anchor));

  popup.attach(anchor);
  assertTrue(
      'Menu should be attached to the anchor', popup.isAttachTarget(anchor));

  popup.detach(anchor);
  assertFalse(
      'Menu is expected to be detached from the element',
      popup.isAttachTarget(anchor));
}


/**
 * Tests the behavior of {@link PopupMenu.createAttachTarget}.
 */
function testCreateAttachTarget() {
  // Randomly picking parameters.
  var targetCorner = goog.positioning.Corner.TOP_END;
  var menuCorner = goog.positioning.Corner.BOTTOM_LEFT;
  var contextMenu = false;  // Show menu on mouse down event.
  var margin = new goog.math.Box(0, 10, 5, 25);

  // Simply setting the required parameters.
  var target = popup.createAttachTarget(anchor);
  assertTrue(popup.isAttachTarget(anchor));
  assertTarget(
      target, anchor, undefined, undefined, goog.events.EventType.MOUSEDOWN,
      undefined);

  // Creating another target with all the parameters.
  target = popup.createAttachTarget(
      anchor, targetCorner, menuCorner, contextMenu, margin);
  assertTrue(popup.isAttachTarget(anchor));
  assertTarget(
      target, anchor, targetCorner, menuCorner, goog.events.EventType.MOUSEDOWN,
      margin);

  // Finally, switch up the 'contextMenu'
  target = popup.createAttachTarget(
      anchor, undefined, undefined, true /*opt_contextMenu*/, undefined);
  assertTarget(
      target, anchor, undefined, undefined, goog.events.EventType.CONTEXTMENU,
      undefined);
}


/**
 * Tests the behavior of {@link PopupMenu.getAttachTarget}.
 */
function testGetAttachTarget() {
  popup.render();
  // Before the menu is attached to the anchor.
  var target = popup.getAttachTarget(anchor);
  assertTrue(
      'Not expecting a target before the element is attach to the menu',
      target == null);

  // Randomly picking parameters.
  var targetCorner = goog.positioning.Corner.TOP_END;
  var menuCorner = goog.positioning.Corner.BOTTOM_LEFT;
  var contextMenu = false;  // Show menu on mouse down event.
  var margin = new goog.math.Box(0, 10, 5, 25);

  popup.attach(anchor, targetCorner, menuCorner, contextMenu, margin);
  target = popup.getAttachTarget(anchor);
  assertTrue(
      'Failed to get target after attaching element to menu', target != null);

  // Make sure we got the right target back.
  assertTarget(
      target, anchor, targetCorner, menuCorner, goog.events.EventType.MOUSEDOWN,
      margin);
}

function testSmallViewportSliding() {
  popup.render();
  popup.getElement().style.position = 'absolute';
  popup.getElement().style.outline = '1px solid blue';
  var item = new goog.ui.MenuItem('Test Item');
  popup.addChild(item, true);
  item.getElement().style.overflow = 'hidden';

  var viewport = goog.style.getClientViewportElement();
  var viewportRect = goog.style.getVisibleRectForElement(viewport);

  var middlePos = Math.floor((viewportRect.right - viewportRect.left) / 2);
  var leftwardPos = Math.floor((viewportRect.right - viewportRect.left) / 3);
  var rightwardPos =
      Math.floor((viewportRect.right - viewportRect.left) / 3 * 2);

  // Can interpret these positions as widths relative to the viewport as well.
  var smallWidth = leftwardPos;
  var mediumWidth = middlePos;
  var largeWidth = rightwardPos;

  // Test small menu first.  This should be small enough that it will display
  // its upper left corner where we tell it to in all three positions.
  popup.getElement().style.width = smallWidth + 'px';

  var target = popup.createAttachTarget(anchor);
  popup.attach(anchor);

  popup.showMenu(target, leftwardPos, 0);
  assertObjectEquals(
      'Popup in wrong position: small size, leftward pos',
      new goog.math.Coordinate(leftwardPos, 0),
      goog.style.getPosition(popup.getElement()));

  popup.showMenu(target, middlePos, 0);
  assertObjectEquals(
      'Popup in wrong position: small size, middle pos',
      new goog.math.Coordinate(middlePos, 0),
      goog.style.getPosition(popup.getElement()));

  popup.showMenu(target, rightwardPos, 0);
  assertObjectEquals(
      'Popup in wrong position: small size, rightward pos',
      new goog.math.Coordinate(rightwardPos, 0),
      goog.style.getPosition(popup.getElement()));

  // Test medium menu next.  This should display with its upper left corner
  // at the target when leftward and middle, but on the right it should
  // position its upper right corner at the target instead.
  popup.getElement().style.width = mediumWidth + 'px';

  popup.showMenu(target, leftwardPos, 0);
  assertObjectEquals(
      'Popup in wrong position: medium size, leftward pos',
      new goog.math.Coordinate(leftwardPos, 0),
      goog.style.getPosition(popup.getElement()));

  popup.showMenu(target, middlePos, 0);
  assertObjectEquals(
      'Popup in wrong position: medium size, middle pos',
      new goog.math.Coordinate(middlePos, 0),
      goog.style.getPosition(popup.getElement()));

  popup.showMenu(target, rightwardPos, 0);
  assertObjectEquals(
      'Popup in wrong position: medium size, rightward pos',
      new goog.math.Coordinate(rightwardPos - mediumWidth, 0),
      goog.style.getPosition(popup.getElement()));

  // Test large menu next.  This should display with its upper left corner at
  // the target when leftward, and its upper right corner at the target when
  // rightward, but right in the middle neither corner can be at the target and
  // keep the entire menu onscreen, so it should place its upper right corner
  // at the very right edge of the viewport.
  popup.getElement().style.width = largeWidth + 'px';
  popup.showMenu(target, leftwardPos, 0);
  assertObjectEquals(
      'Popup in wrong position: large size, leftward pos',
      new goog.math.Coordinate(leftwardPos, 0),
      goog.style.getPosition(popup.getElement()));

  popup.showMenu(target, middlePos, 0);
  assertObjectEquals(
      'Popup in wrong position: large size, middle pos',
      new goog.math.Coordinate(
          viewportRect.right - viewportRect.left - largeWidth, 0),
      goog.style.getPosition(popup.getElement()));

  popup.showMenu(target, rightwardPos, 0);
  assertObjectEquals(
      'Popup in wrong position: large size, rightward pos',
      new goog.math.Coordinate(rightwardPos - largeWidth, 0),
      goog.style.getPosition(popup.getElement()));

  // Make sure that the menu still displays correctly if we give the target
  // a target corner.  We can't set the overflow policy in that case, but it
  // should still display.
  popup.detach(anchor);
  anchor.style.position = 'absolute';
  anchor.style.left = '24px';
  anchor.style.top = '24px';
  var targetCorner = goog.positioning.Corner.TOP_END;
  target = popup.createAttachTarget(anchor, targetCorner);
  popup.attach(anchor, targetCorner);
  popup.getElement().style.width = smallWidth + 'px';
  popup.showMenu(target, leftwardPos, 0);
  assertObjectEquals(
      'Popup in wrong position: small size, leftward pos, with target corner',
      new goog.math.Coordinate(24, 24),
      goog.style.getPosition(popup.getElement()));
}


/**
 * Tests that the menu is shown if the SPACE or ENTER keys are pressed, and that
 * none of the menu items are highlighted (PopupMenu.highlightedIndex == -1).
 */
function testKeyboardEventsShowMenu() {
  popup.decorate(menu);
  popup.attach(anchor);
  popup.hide();
  assertFalse(popup.isVisible());
  goog.testing.events.fireKeySequence(anchor, goog.events.KeyCodes.SPACE);
  assertTrue(popup.isVisible());
  assertEquals(-1, popup.getHighlightedIndex());
  popup.hide();
  assertFalse(popup.isVisible());
  goog.testing.events.fireKeySequence(anchor, goog.events.KeyCodes.ENTER);
  assertTrue(popup.isVisible());
  assertEquals(-1, popup.getHighlightedIndex());
}


/**
 * Tests that the menu is shown and the first item is highlighted if the DOWN
 * key is pressed.
 */
function testDownKey() {
  popup.decorate(menu);
  popup.attach(anchor);
  popup.hide();
  assertFalse(popup.isVisible());
  goog.testing.events.fireKeySequence(anchor, goog.events.KeyCodes.DOWN);
  assertTrue(popup.isVisible());
  assertEquals(0, popup.getHighlightedIndex());
}


/**
 * Tests activation of menu items by keyboard.
 */
function testMenuItemKeyboardActivation() {
  popup.decorate(menu);
  popup.attach(anchor);
  // Check that if the ESC key is pressed the focus is on
  // the anchor element.
  goog.testing.events.fireKeySequence(menu, goog.events.KeyCodes.ESC);
  assertEquals(anchor, document.activeElement);

  var menuitemListenerFired = false;
  function onMenuitemAction(event) {
    if (event.keyCode == goog.events.KeyCodes.SPACE ||
        event.keyCode == goog.events.KeyCodes.ENTER) {
      menuitemListenerFired = true;
    }
  };
  handler.listen(menuitem1, goog.events.EventType.KEYDOWN, onMenuitemAction);
  // Simulate opening a menu using the DOWN key, and pressing the SPACE/ENTER
  // key in order to activate the first menuitem.
  goog.testing.events.fireKeySequence(anchor, goog.events.KeyCodes.DOWN);
  goog.testing.events.fireKeySequence(menu, goog.events.KeyCodes.SPACE);
  assertTrue(menuitemListenerFired);
  menuitemListenerFired = false;
  goog.testing.events.fireKeySequence(anchor, goog.events.KeyCodes.DOWN);
  goog.testing.events.fireKeySequence(menu, goog.events.KeyCodes.ENTER);
  assertTrue(menuitemListenerFired);
  // Make sure the menu item's listener doesn't fire for any key.
  menuitemListenerFired = false;
  goog.testing.events.fireKeySequence(anchor, goog.events.KeyCodes.DOWN);
  goog.testing.events.fireKeySequence(menu, goog.events.KeyCodes.SHIFT);
  assertFalse(menuitemListenerFired);

  // Simulate opening menu and moving down to the third menu item using the
  // DOWN key, and then activating it using the SPACE key.
  menuitemListenerFired = false;
  handler.listen(menuitem3, goog.events.EventType.KEYDOWN, onMenuitemAction);
  goog.testing.events.fireKeySequence(anchor, goog.events.KeyCodes.DOWN);
  goog.testing.events.fireKeySequence(anchor, goog.events.KeyCodes.DOWN);
  goog.testing.events.fireKeySequence(anchor, goog.events.KeyCodes.DOWN);
  goog.testing.events.fireKeySequence(menu, goog.events.KeyCodes.SPACE);
  assertTrue(menuitemListenerFired);
}


/**
 * Tests that a context menu isn't shown if the SPACE or ENTER keys are pressed.
 */
function testContextMenuKeyboard() {
  popup.attach(anchor, null, null, true);
  popup.hide();
  assertFalse(popup.isVisible());
  goog.testing.events.fireKeySequence(anchor, goog.events.KeyCodes.SPACE);
  assertFalse(popup.isVisible());
  goog.testing.events.fireKeySequence(anchor, goog.events.KeyCodes.ENTER);
  assertFalse(popup.isVisible());
}


/**
 * Tests that there is no crash when hitting a key when no menu item is
 * highlighted.
 */
function testKeyPressWithNoHighlightedItem() {
  popup.decorate(menu);
  popup.attach(anchor);
  goog.testing.events.fireKeySequence(anchor, goog.events.KeyCodes.SPACE);
  assertTrue(popup.isVisible());
  try {
    goog.testing.events.fireKeySequence(menu, goog.events.KeyCodes.SPACE);
  } catch (e) {
    fail(
        'Crash attempting to reference null selected menu item after ' +
        'keyboard event.');
  }
}
