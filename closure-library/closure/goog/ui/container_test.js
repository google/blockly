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

goog.provide('goog.ui.ContainerTest');
goog.setTestOnly('goog.ui.ContainerTest');

goog.require('goog.a11y.aria');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.events.Event');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyEvent');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');
goog.require('goog.ui.Container');
goog.require('goog.ui.Control');

var sandbox;
var containerElement;
var container;
var keyContainer;
var listContainer;

function setUpPage() {
  sandbox = goog.dom.getElement('sandbox');
}

function setUp() {
  container = new goog.ui.Container();
  keyContainer = null;
  listContainer = null;

  sandbox.innerHTML =
      '<div id="containerElement" class="goog-container">\n' +
      '  <div class="goog-control" id="hello">Hello</div>\n' +
      '  <div class="goog-control" id="world">World</div>\n' +
      '</div>';
  containerElement = goog.dom.getElement('containerElement');
}

function tearDown() {
  goog.dom.removeChildren(sandbox);
  container.dispose();
  goog.dispose(keyContainer);
  goog.dispose(listContainer);
}

function testDecorateHidden() {
  containerElement.style.display = 'none';

  assertTrue('Container must be visible', container.isVisible());
  container.decorate(containerElement);
  assertFalse('Container must be hidden', container.isVisible());
  container.forEachChild(function(control) {
    assertTrue('Child control ' + control.getId() + ' must report being ' +
        'visible, even if in a hidden container', control.isVisible());
  });
}

function testDecorateDisabled() {
  goog.dom.classlist.add(containerElement, 'goog-container-disabled');

  assertTrue('Container must be enabled', container.isEnabled());
  container.decorate(containerElement);
  assertFalse('Container must be disabled', container.isEnabled());
  container.forEachChild(function(control) {
    assertFalse('Child control ' + control.getId() + ' must be disabled, ' +
        'because the host container is disabled', control.isEnabled());
  });
}

function testDecorateFocusableContainer() {
  container.decorate(containerElement);
  assertTrue('Container must be focusable', container.isFocusable());
  container.forEachChild(function(control) {
    assertFalse('Child control ' + control.getId() + ' must not be ' +
        'focusable',
        control.isSupportedState(goog.ui.Component.State.FOCUSED));
  });
}

function testDecorateFocusableChildrenContainer() {
  container.setFocusable(false);
  container.setFocusableChildrenAllowed(true);
  container.decorate(containerElement);
  assertFalse('Container must not be focusable', container.isFocusable());
  container.forEachChild(function(control) {
    assertTrue('Child control ' + control.getId() + ' must be ' +
        'focusable',
        control.isSupportedState(goog.ui.Component.State.FOCUSED));
  });
}

function testHighlightOnEnter() {
  // This interaction test ensures that containers enforce that children
  // get highlighted on mouseover, and that one and only one child may
  // be highlighted at a time.  Although integration tests aren't the
  // best, it's difficult to test these event-based interactions due to
  // their disposition toward the "misunderstood contract" problem.

  container.decorate(containerElement);
  assertFalse('Child 0 should initially not be highlighted',
      container.getChildAt(0).isHighlighted());

  goog.testing.events.fireMouseOverEvent(
      container.getChildAt(0).getElement(), sandbox);
  assertTrue('Child 0 should become highlighted after a mouse over',
      container.getChildAt(0).isHighlighted());
  assertEquals('Child 0 should be the active descendant',
      container.getChildAt(0).getElement(),
      goog.a11y.aria.getActiveDescendant(container.getElement()));

  goog.testing.events.fireMouseOverEvent(
      container.getChildAt(1).getElement(),
      container.getChildAt(0).getElement());
  assertFalse('Child 0 should lose highlight when child 1 is moused ' +
      'over, even if no mouseout occurs.',
      container.getChildAt(0).isHighlighted());
  assertTrue('Child 1 should now be highlighted.',
      container.getChildAt(1).isHighlighted());
  assertEquals('Child 1 should be the active descendant',
      container.getChildAt(1).getElement(),
      goog.a11y.aria.getActiveDescendant(container.getElement()));
}

function testHighlightOnEnterPreventable() {
  container.decorate(containerElement);
  goog.events.listen(container, goog.ui.Component.EventType.ENTER,
      function(event) {
        event.preventDefault();
      });
  goog.testing.events.fireMouseOverEvent(
      container.getChildAt(0).getElement(), sandbox);
  assertFalse('Child 0 should not be highlighted if preventDefault called',
      container.getChildAt(0).isHighlighted());
}

function testHighlightDisabled() {
  // Another interaction test.  Already tested in control_test.
  container.decorate(containerElement);
  container.getChildAt(0).setEnabled(false);
  goog.testing.events.fireMouseOverEvent(
      container.getChildAt(0).getElement(), sandbox);
  assertFalse('Disabled children should not be highlighted',
      container.getChildAt(0).isHighlighted());
}

function testGetOwnerControl() {
  container.decorate(containerElement);

  assertEquals('Must return appropriate control given an element in the ' +
      'control.',
      container.getChildAt(1),
      container.getOwnerControl(container.getChildAt(1).getElement()));

  assertNull('Must return null for element not associated with control.',
      container.getOwnerControl(document.body));
  assertNull('Must return null if given null node',
      container.getOwnerControl(null));
}

function testShowEvent() {
  container.decorate(containerElement);
  container.setVisible(false);
  var eventFired = false;
  goog.events.listen(container, goog.ui.Component.EventType.SHOW,
      function() {
        assertFalse('Container must not be visible when SHOW event is ' +
                    'fired',
                    container.isVisible());
        eventFired = true;
      });
  container.setVisible(true);
  assertTrue('SHOW event expected', eventFired);
}

function testAfterShowEvent() {
  container.decorate(containerElement);
  container.setVisible(false);
  var eventFired = false;
  goog.events.listen(container, goog.ui.Container.EventType.AFTER_SHOW,
      function() {
        assertTrue('Container must be visible when AFTER_SHOW event is ' +
                   'fired',
                   container.isVisible());
        eventFired = true;
      });
  container.setVisible(true);
  assertTrue('AFTER_SHOW event expected', eventFired);
}

function testHideEvents() {
  var events = [];
  container.decorate(containerElement);
  container.setVisible(true);
  var eventFired = false;
  goog.events.listen(container, goog.ui.Component.EventType.HIDE,
      function(e) {
        assertTrue(
            'Container must be visible when HIDE event is fired',
            container.isVisible());
        events.push(e.type);
      });
  goog.events.listen(container, goog.ui.Container.EventType.AFTER_HIDE,
      function(e) {
        assertFalse(
            'Container must not be visible when AFTER_HIDE event is fired',
            container.isVisible());
        events.push(e.type);
      });
  container.setVisible(false);
  assertArrayEquals('HIDE event followed by AFTER_HIDE expected', [
    goog.ui.Component.EventType.HIDE,
    goog.ui.Container.EventType.AFTER_HIDE
  ], events);
}



/**
 * Test container to which the elements have to be added with
 * {@code container.addChild(element, false)}
 * @constructor
 * @extends {goog.ui.Container}
 */
function ListContainer() {
  goog.ui.Container.call(this);
}
goog.inherits(ListContainer, goog.ui.Container);


/** @override */
ListContainer.prototype.createDom = function() {
  ListContainer.superClass_.createDom.call(this);
  var ul = this.getDomHelper().createDom(goog.dom.TagName.UL);
  this.forEachChild(function(child) {
    child.createDom();
    var childEl = child.getElement();
    ul.appendChild(
        this.getDomHelper().createDom(goog.dom.TagName.LI, {}, childEl));
  }, this);
  this.getContentElement().appendChild(ul);
};

function testGetOwnerControlWithNoRenderingInAddChild() {
  listContainer = new ListContainer();
  var control = new goog.ui.Control('item');
  listContainer.addChild(control);
  listContainer.render();
  var ownerControl = listContainer.getOwnerControl(control.getElement());

  assertEquals('Control was added with addChild(control, false)',
      control, ownerControl);
}



/**
 * Test container for tracking key events being handled.
 * @constructor
 * @extends {goog.ui.Container}
 */
function KeyHandlingContainer() {
  goog.ui.Container.call(this);
  this.keyEventsHandled = 0;
}
goog.inherits(KeyHandlingContainer, goog.ui.Container);


/** @override */
KeyHandlingContainer.prototype.handleKeyEventInternal = function() {
  this.keyEventsHandled++;
  return false;
};

function testHandleKeyEvent_onlyHandlesWhenVisible() {
  keyContainer = new KeyHandlingContainer();
  keyContainer.decorate(containerElement);

  keyContainer.setVisible(false);
  keyContainer.handleKeyEvent(new goog.events.Event());
  assertEquals('No key events should be handled',
      0, keyContainer.keyEventsHandled);

  keyContainer.setVisible(true);
  keyContainer.handleKeyEvent(new goog.events.Event());
  assertEquals('One key event should be handled',
      1, keyContainer.keyEventsHandled);
}

function testHandleKeyEvent_onlyHandlesWhenEnabled() {
  keyContainer = new KeyHandlingContainer();
  keyContainer.decorate(containerElement);
  keyContainer.setVisible(true);

  keyContainer.setEnabled(false);
  keyContainer.handleKeyEvent(new goog.events.Event());
  assertEquals('No key events should be handled',
      0, keyContainer.keyEventsHandled);

  keyContainer.setEnabled(true);
  keyContainer.handleKeyEvent(new goog.events.Event());
  assertEquals('One key event should be handled',
      1, keyContainer.keyEventsHandled);
}

function testHandleKeyEvent_childlessContainersIgnoreKeyEvents() {
  keyContainer = new KeyHandlingContainer();
  keyContainer.render();
  keyContainer.setVisible(true);

  keyContainer.handleKeyEvent(new goog.events.Event());
  assertEquals('No key events should be handled',
      0, keyContainer.keyEventsHandled);

  keyContainer.addChild(new goog.ui.Control());
  keyContainer.handleKeyEvent(new goog.events.Event());
  assertEquals('One key event should be handled',
      1, keyContainer.keyEventsHandled);
}

function testHandleKeyEvent_alwaysHandlesWithKeyEventTarget() {
  keyContainer = new KeyHandlingContainer();
  keyContainer.render();
  keyContainer.setKeyEventTarget(goog.dom.createDom(goog.dom.TagName.DIV));
  keyContainer.setVisible(true);

  keyContainer.handleKeyEvent(new goog.events.Event());
  assertEquals('One key events should be handled',
      1, keyContainer.keyEventsHandled);
}

function testHandleKeyEventInternal_onlyHandlesUnmodified() {
  container.setKeyEventTarget(sandbox);
  var event = new goog.events.KeyEvent(
      goog.events.KeyCodes.ESC, 0, false, null);

  var propertyNames = [
    'shiftKey',
    'altKey',
    'ctrlKey',
    'metaKey'
  ];

  // Verify that the event is not handled whenever a modifier key is true.
  for (var i = 0, propertyName; propertyName = propertyNames[i]; i++) {
    assertTrue('Event should be handled when modifer key is not pressed.',
        container.handleKeyEventInternal(event));
    event[propertyName] = true;
    assertFalse('Event should not be handled when modifer key is pressed.',
        container.handleKeyEventInternal(event));
    event[propertyName] = false;
  }
}

function testOpenFollowsHighlight() {
  container.decorate(containerElement);
  container.setOpenFollowsHighlight(true);
  assertTrue('isOpenFollowsHighlight should return true',
      container.isOpenFollowsHighlight());

  // Make the children openable.
  container.forEachChild(function(child) {
    child.setSupportedState(goog.ui.Component.State.OPENED, true);
  });
  // Open child 1 initially.
  container.getChildAt(1).setOpen(true);

  assertFalse('Child 0 should initially not be highlighted',
      container.getChildAt(0).isHighlighted());
  goog.testing.events.fireMouseOverEvent(
      container.getChildAt(0).getElement(), sandbox);
  assertTrue('Child 0 should become highlighted after a mouse over',
      container.getChildAt(0).isHighlighted());
  assertTrue('Child 0 should become open after higlighted',
      container.getChildAt(0).isOpen());
  assertFalse('Child 1 should become closed once 0 is open',
      container.getChildAt(1).isOpen());
  assertEquals('OpenItem should be child 0',
      container.getChildAt(0), container.getOpenItem());
}

function testOpenNotFollowsHighlight() {
  container.decorate(containerElement);
  container.setOpenFollowsHighlight(false);
  assertFalse('isOpenFollowsHighlight should return false',
      container.isOpenFollowsHighlight());

  // Make the children openable.
  container.forEachChild(function(child) {
    child.setSupportedState(goog.ui.Component.State.OPENED, true);
  });
  // Open child 1 initially.
  container.getChildAt(1).setOpen(true);

  assertFalse('Child 0 should initially not be highlighted',
      container.getChildAt(0).isHighlighted());
  goog.testing.events.fireMouseOverEvent(
      container.getChildAt(0).getElement(), sandbox);
  assertTrue('Child 0 should become highlighted after a mouse over',
      container.getChildAt(0).isHighlighted());
  assertFalse('Child 0 should remain closed after higlighted',
      container.getChildAt(0).isOpen());
  assertTrue('Child 1 should remain open',
      container.getChildAt(1).isOpen());
  assertEquals('OpenItem should be child 1',
      container.getChildAt(1), container.getOpenItem());
}

function testRemoveChild() {
  goog.dom.removeChildren(containerElement);
  container.decorate(containerElement);

  var a = new goog.ui.Control('A');
  var b = new goog.ui.Control('B');
  var c = new goog.ui.Control('C');

  a.setId('a');
  b.setId('b');
  c.setId('c');

  container.addChild(a, true);
  container.addChild(b, true);
  container.addChild(c, true);

  container.setHighlightedIndex(2);

  assertEquals('Parent must remove and return child by ID', b,
      container.removeChild('b'));
  assertNull('Parent must no longer contain this child',
      container.getChild('b'));
  assertEquals('Highlighted index must be decreased', 1,
      container.getHighlightedIndex());
  assertTrue('The removed control must handle its own mouse events',
      b.isHandleMouseEvents());

  assertEquals('Parent must remove and return child', c,
      container.removeChild(c));
  assertNull('Parent must no longer contain this child',
      container.getChild('c'));
  assertFalse('This child must no longer be highlighted',
      c.isHighlighted());
  assertTrue('The removed control must handle its own mouse events',
      c.isHandleMouseEvents());

  assertEquals('Parent must remove and return child by index', a,
      container.removeChildAt(0));
  assertNull('Parent must no longer contain this child',
      container.getChild('a'));
  assertTrue('The removed control must handle its own mouse events',
      a.isHandleMouseEvents());
}

function testRemoveHighlightedDisposedChild() {
  goog.dom.removeChildren(containerElement);
  container.decorate(containerElement);

  var a = new goog.ui.Control('A');
  container.addChild(a, true);

  container.setHighlightedIndex(0);
  a.dispose();
  container.removeChild(a);
  container.dispose();
}


/**
 * Checks that getHighlighted() returns the expected value and checks
 * that the child at this index is highlighted and other children are not.
 * @param {string} explanation Message indicating what is expected.
 * @param {number} index Expected return value of getHighlightedIndex().
 */
function assertHighlightedIndex(explanation, index) {
  assertEquals(explanation, index, container.getHighlightedIndex());
  for (var i = 0; i < container.getChildCount(); i++) {
    if (i == index) {
      assertTrue('Child at highlighted index should be highlighted',
          container.getChildAt(i).isHighlighted());
    } else {
      assertFalse('Only child at highlighted index should be highlighted',
          container.getChildAt(i).isHighlighted());
    }
  }
}

function testUpdateHighlightedIndex_updatesWhenChildrenAreAdded() {
  goog.dom.removeChildren(containerElement);
  container.decorate(containerElement);

  var a = new goog.ui.Control('A');
  var b = new goog.ui.Control('B');
  var c = new goog.ui.Control('C');

  container.addChild(a);
  container.setHighlightedIndex(0);
  assertHighlightedIndex('Highlighted index should match set value', 0);

  // Add child before the highlighted one.
  container.addChildAt(b, 0);
  assertHighlightedIndex('Highlighted index should be increased', 1);

  // Add child after the highlighted one.
  container.addChildAt(c, 2);
  assertHighlightedIndex('Highlighted index should not change', 1);

  container.dispose();
}

function testUpdateHighlightedIndex_updatesWhenChildrenAreMoved() {
  goog.dom.removeChildren(containerElement);
  container.decorate(containerElement);

  var a = new goog.ui.Control('A');
  var b = new goog.ui.Control('B');
  var c = new goog.ui.Control('C');

  container.addChild(a);
  container.addChild(b);
  container.addChild(c);

  // Highlight 'c' and swap 'a' and 'b'
  // [a, b, c] -> [a, b, *c] -> [b, a, *c] (* indicates the highlighted child)
  container.setHighlightedIndex(2);
  container.addChildAt(a, 1, false);
  assertHighlightedIndex('Highlighted index should not change', 2);

  // Move the highlighted child 'c' from index 2 to index 1.
  // [b, a, *c] -> [b, *c, a]
  container.addChildAt(c, 1, false);
  assertHighlightedIndex('Highlighted index must follow the moved child', 1);

  // Take the element in front of the highlighted index and move it behind it.
  // [b, *c, a] -> [*c, a, b]
  container.addChildAt(b, 2, false);
  assertHighlightedIndex('Highlighted index must be decreased', 0);

  // And move the element back to the front.
  // [*c, a, b] -> [b, *c, a]
  container.addChildAt(b, 0, false);
  assertHighlightedIndex('Highlighted index must be increased', 1);

  container.dispose();
}

function testUpdateHighlightedIndex_notChangedOnNoOp() {
  goog.dom.removeChildren(containerElement);
  container.decorate(containerElement);

  container.addChild(new goog.ui.Control('A'));
  container.addChild(new goog.ui.Control('B'));
  container.setHighlightedIndex(1);

  // Re-add a child to its current position.
  container.addChildAt(container.getChildAt(0), 0, false);
  assertHighlightedIndex('Highlighted index must not change', 1);

  container.dispose();
}

function testUpdateHighlightedIndex_notChangedWhenNoChildSelected() {
  goog.dom.removeChildren(containerElement);
  container.decorate(containerElement);

  var a = new goog.ui.Control('A');
  var b = new goog.ui.Control('B');
  var c = new goog.ui.Control('C');
  container.addChild(a);
  container.addChild(b);
  container.addChild(c);

  // Move children around.
  container.addChildAt(a, 2, false);
  container.addChildAt(b, 1, false);
  container.addChildAt(c, 2, false);

  assertHighlightedIndex('Highlighted index must not change', -1);

  container.dispose();
}

function testUpdateHighlightedIndex_indexStaysInBoundsWhenMovedToMaxIndex() {
  goog.dom.removeChildren(containerElement);
  container.decorate(containerElement);

  var a = new goog.ui.Control('A');
  var b = new goog.ui.Control('B');
  container.addChild(a);
  container.addChild(b);

  // Move higlighted child to an index one behind last child.
  container.setHighlightedIndex(0);
  container.addChildAt(a, 2);

  assertEquals('Child should be moved to index 1', a, container.getChildAt(1));
  assertEquals('Child count should not change', 2, container.getChildCount());
  assertHighlightedIndex('Highlighted index must point to new index', 1);

  container.dispose();
}
