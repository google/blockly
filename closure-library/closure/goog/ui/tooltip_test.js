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

goog.provide('goog.ui.TooltipTest');
goog.setTestOnly('goog.ui.TooltipTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events.Event');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventType');
goog.require('goog.events.FocusHandler');
goog.require('goog.html.testing');
goog.require('goog.math.Coordinate');
goog.require('goog.positioning.AbsolutePosition');
goog.require('goog.style');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.TestQueue');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.PopupBase');
goog.require('goog.ui.Tooltip');
goog.require('goog.userAgent');

var stubs = new goog.testing.PropertyReplacer();



/**
 * A subclass of Tooltip that overrides {@code getPositioningStrategy}
 * for testing purposes.
 * @constructor
 */
function TestTooltip(el, text, dom) {
  goog.ui.Tooltip.call(this, el, text, dom);
}
goog.inherits(TestTooltip, goog.ui.Tooltip);


/** @override */
TestTooltip.prototype.getPositioningStrategy = function() {
  return new goog.positioning.AbsolutePosition(13, 17);
};


var tt, clock, handler, eventQueue, dom;

// Allow positions to be off by one in gecko as it reports scrolling
// offsets in steps of 2.
var ALLOWED_OFFSET = goog.userAgent.GECKO ? 1 : 0;

function setUp() {
  // We get access denied error when accessing the iframe in IE on the farm
  // as IE doesn't have the same window size issues as firefox on the farm
  // we bypass the iframe and use the current document instead.
  if (goog.userAgent.IE) {
    dom = goog.dom.getDomHelper(document);
  } else {
    var frame = document.getElementById('testframe');
    var doc = goog.dom.getFrameContentDocument(frame);
    dom = goog.dom.getDomHelper(doc);
  }

  // Host elements in fixed size iframe to avoid window size problems when
  // running under Selenium.
  dom.getDocument().body.innerHTML =
      '<p id="notpopup">Content</p>' +
      '<p id="hovertarget">Hover Here For Popup</p>' +
      '<p id="second">Secondary target</p>';

  tt = new goog.ui.Tooltip(undefined, undefined, dom);
  tt.setElement(dom.createDom(goog.dom.TagName.DIV, {id: 'popup',
    style: 'visibility:hidden'},
  'Hello'));
  clock = new goog.testing.MockClock(true);
  eventQueue = new goog.testing.TestQueue();
  handler = new goog.events.EventHandler(eventQueue);
  handler.listen(tt, goog.ui.PopupBase.EventType.SHOW, eventQueue.enqueue);
  handler.listen(tt, goog.ui.PopupBase.EventType.HIDE, eventQueue.enqueue);

  // Reset global flags to their defaults.
  /** @suppress {missingRequire} */
  stubs.set(goog.html.legacyconversions, 'ALLOW_LEGACY_CONVERSIONS', true);
}

function tearDown() {
  // tooltip needs to be hidden as well as disposed of so that it doesn't
  // leave global state hanging around to trip up other tests.
  tt.onHide_();
  tt.dispose();
  clock.uninstall();
  handler.removeAll();
}

function testConstructor() {
  var element = tt.getElement();
  assertNotNull('Tooltip should have non-null element', element);
  assertEquals('Tooltip element should be the DIV we created',
      dom.getElement('popup'), element);
  assertEquals('Tooltip element should be a child of the document body',
      dom.getDocument().body, element.parentNode);
}

function testTooltipShowsAndHides() {
  var hoverTarget = dom.getElement('hovertarget');
  var elsewhere = dom.getElement('notpopup');
  var element = tt.getElement();
  var position = new goog.math.Coordinate(5, 5);
  assertNotNull('Tooltip should have non-null element', element);
  assertEquals('Initial state should be inactive',
               goog.ui.Tooltip.State.INACTIVE, tt.getState());
  tt.attach(hoverTarget);
  tt.setShowDelayMs(100);
  tt.setHideDelayMs(50);
  goog.testing.events.fireMouseOverEvent(hoverTarget, elsewhere, position);
  assertEquals(goog.ui.Tooltip.State.WAITING_TO_SHOW, tt.getState());
  clock.tick(101);
  assertEquals('visible', tt.getElement().style.visibility);
  assertEquals('tooltip y position (10px margin below the cursor)', '15px',
      tt.getElement().style.top);
  assertEquals(goog.ui.Tooltip.State.SHOWING, tt.getState());
  assertEquals(goog.ui.PopupBase.EventType.SHOW, eventQueue.dequeue().type);
  assertTrue(eventQueue.isEmpty());

  goog.testing.events.fireMouseOutEvent(hoverTarget, elsewhere);
  assertEquals(goog.ui.Tooltip.State.WAITING_TO_HIDE, tt.getState());
  clock.tick(51);
  assertEquals('hidden', tt.getElement().style.visibility);
  assertEquals(goog.ui.Tooltip.State.INACTIVE, tt.getState());
  assertEquals(goog.ui.PopupBase.EventType.HIDE, eventQueue.dequeue().type);
  assertTrue(eventQueue.isEmpty());
}

function testMultipleTargets() {
  var firstTarget = dom.getElement('hovertarget');
  var secondTarget = dom.getElement('second');
  var elsewhere = dom.getElement('notpopup');
  var element = tt.getElement();

  tt.attach(firstTarget);
  tt.attach(secondTarget);
  tt.setShowDelayMs(100);
  tt.setHideDelayMs(50);

  // Move over first target
  goog.testing.events.fireMouseOverEvent(firstTarget, elsewhere);
  clock.tick(101);
  assertEquals(goog.ui.PopupBase.EventType.SHOW, eventQueue.dequeue().type);
  assertTrue(eventQueue.isEmpty());

  // Move from first to second
  goog.testing.events.fireMouseOutEvent(firstTarget, secondTarget);
  goog.testing.events.fireMouseOverEvent(secondTarget, firstTarget);
  assertEquals(goog.ui.Tooltip.State.UPDATING, tt.getState());
  assertTrue(eventQueue.isEmpty());

  // Move from second to element (before second shows)
  goog.testing.events.fireMouseOutEvent(secondTarget, element);
  goog.testing.events.fireMouseOverEvent(element, secondTarget);
  assertEquals(goog.ui.Tooltip.State.SHOWING, tt.getState());
  assertTrue(eventQueue.isEmpty());

  // Move from element to second, and let it show
  goog.testing.events.fireMouseOutEvent(element, secondTarget);
  goog.testing.events.fireMouseOverEvent(secondTarget, element);
  assertEquals(goog.ui.Tooltip.State.UPDATING, tt.getState());
  clock.tick(101);
  assertEquals(goog.ui.Tooltip.State.SHOWING, tt.getState());
  assertEquals('Anchor should be second target', secondTarget, tt.anchor);
  assertEquals(goog.ui.PopupBase.EventType.HIDE, eventQueue.dequeue().type);
  assertEquals(goog.ui.PopupBase.EventType.SHOW, eventQueue.dequeue().type);
  assertTrue(eventQueue.isEmpty());

  // Move from second to first and then off without first showing
  goog.testing.events.fireMouseOutEvent(secondTarget, firstTarget);
  goog.testing.events.fireMouseOverEvent(firstTarget, secondTarget);
  assertEquals(goog.ui.Tooltip.State.UPDATING, tt.getState());
  goog.testing.events.fireMouseOutEvent(firstTarget, elsewhere);
  assertEquals(goog.ui.Tooltip.State.WAITING_TO_HIDE, tt.getState());
  clock.tick(51);
  assertEquals('hidden', tt.getElement().style.visibility);
  assertEquals(goog.ui.Tooltip.State.INACTIVE, tt.getState());
  assertEquals(goog.ui.PopupBase.EventType.HIDE, eventQueue.dequeue().type);
  assertTrue(eventQueue.isEmpty());
  clock.tick(200);

  // Move from element to second, but detach second before it shows.
  goog.testing.events.fireMouseOutEvent(element, secondTarget);
  goog.testing.events.fireMouseOverEvent(secondTarget, element);
  assertEquals(goog.ui.Tooltip.State.WAITING_TO_SHOW, tt.getState());
  tt.detach(secondTarget);
  clock.tick(200);
  assertEquals(goog.ui.Tooltip.State.INACTIVE, tt.getState());
  assertEquals('Anchor should be second target', secondTarget, tt.anchor);
  assertTrue(eventQueue.isEmpty());
}

function testRequireInteraction() {
  var hoverTarget = dom.getElement('hovertarget');
  var elsewhere = dom.getElement('notpopup');

  tt.attach(hoverTarget);
  tt.setShowDelayMs(100);
  tt.setHideDelayMs(50);
  tt.setRequireInteraction(true);

  goog.testing.events.fireMouseOverEvent(hoverTarget, elsewhere);
  clock.tick(101);
  assertEquals(
      'Tooltip should not show without mouse move event',
      'hidden', tt.getElement().style.visibility);
  goog.testing.events.fireMouseMoveEvent(hoverTarget);
  goog.testing.events.fireMouseOverEvent(hoverTarget, elsewhere);
  clock.tick(101);
  assertEquals(
      'Tooltip should show because we had mouse move event',
      'visible', tt.getElement().style.visibility);

  goog.testing.events.fireMouseOutEvent(hoverTarget, elsewhere);
  clock.tick(51);
  assertEquals('hidden', tt.getElement().style.visibility);
  goog.testing.events.fireBrowserEvent(new goog.events.Event(
      goog.events.EventType.FOCUS, hoverTarget));
  clock.tick(101);
  assertEquals(
      'Tooltip should show because we had focus event',
      'visible', tt.getElement().style.visibility);
  goog.testing.events.fireBrowserEvent(new goog.events.Event(
      goog.events.EventType.BLUR, hoverTarget));
  clock.tick(51);
  assertEquals('hidden', tt.getElement().style.visibility);

  goog.testing.events.fireMouseMoveEvent(hoverTarget);
  goog.testing.events.fireMouseOverEvent(hoverTarget, elsewhere);
  goog.testing.events.fireMouseOutEvent(hoverTarget, elsewhere);
  goog.testing.events.fireMouseOverEvent(hoverTarget, elsewhere);
  clock.tick(101);
  assertEquals(
      'A cancelled trigger should also cancel the seen interaction',
      'hidden', tt.getElement().style.visibility);
}

function testDispose() {
  var element = tt.getElement();
  tt.dispose();
  assertTrue('Tooltip should have been disposed of', tt.isDisposed());
  assertNull('Tooltip element reference should have been nulled out',
      tt.getElement());
  assertNotEquals('Tooltip element should not be a child of the body',
      document.body, element.parentNode);
}

function testNested() {
  var ttNested;
  tt.getElement().appendChild(dom.createDom(
      goog.dom.TagName.SPAN, {id: 'nested'}, 'Goodbye'));
  ttNested = new goog.ui.Tooltip(undefined, undefined, dom);
  ttNested.setElement(dom.createDom(goog.dom.TagName.DIV,
                                    {id: 'nestedPopup'}, 'hi'));
  tt.setShowDelayMs(100);
  tt.setHideDelayMs(50);
  ttNested.setShowDelayMs(75);
  ttNested.setHideDelayMs(25);
  var nestedAnchor = dom.getElement('nested');
  var hoverTarget = dom.getElement('hovertarget');
  var outerTooltip = dom.getElement('popup');
  var innerTooltip = dom.getElement('nestedPopup');
  var elsewhere = dom.getElement('notpopup');

  ttNested.attach(nestedAnchor);
  tt.attach(hoverTarget);

  // Test mouse into, out of nested tooltip
  goog.testing.events.fireMouseOverEvent(hoverTarget, elsewhere);
  clock.tick(101);
  goog.testing.events.fireMouseOutEvent(hoverTarget, outerTooltip);
  goog.testing.events.fireMouseOverEvent(outerTooltip, hoverTarget);
  clock.tick(51);
  assertEquals('visible', tt.getElement().style.visibility);
  goog.testing.events.fireMouseOutEvent(outerTooltip, nestedAnchor);
  goog.testing.events.fireMouseOverEvent(nestedAnchor, outerTooltip);
  clock.tick(76);
  assertEquals('visible', tt.getElement().style.visibility);
  assertEquals('visible', ttNested.getElement().style.visibility);
  goog.testing.events.fireMouseOutEvent(nestedAnchor, outerTooltip);
  goog.testing.events.fireMouseOverEvent(outerTooltip, nestedAnchor);
  clock.tick(100);
  assertEquals('visible', tt.getElement().style.visibility);
  assertEquals('hidden', ttNested.getElement().style.visibility);

  // Go back in nested tooltip and then out through tooltip element.
  goog.testing.events.fireMouseOutEvent(outerTooltip, nestedAnchor);
  goog.testing.events.fireMouseOverEvent(nestedAnchor, outerTooltip);
  clock.tick(76);
  goog.testing.events.fireMouseOutEvent(nestedAnchor, innerTooltip);
  goog.testing.events.fireMouseOverEvent(innerTooltip, nestedAnchor);
  clock.tick(15);
  assertEquals('visible', tt.getElement().style.visibility);
  assertEquals('visible', ttNested.getElement().style.visibility);
  goog.testing.events.fireMouseOutEvent(innerTooltip, elsewhere);
  clock.tick(26);
  assertEquals('hidden', ttNested.getElement().style.visibility);
  clock.tick(51);
  assertEquals('hidden', tt.getElement().style.visibility);

  // Test with focus
  goog.testing.events.fireBrowserEvent(new goog.events.Event(
      goog.events.EventType.FOCUS, hoverTarget));
  clock.tick(101);
  goog.testing.events.fireBrowserEvent(new goog.events.Event(
      goog.events.EventType.BLUR, hoverTarget));
  goog.testing.events.fireBrowserEvent(new goog.events.Event(
      goog.events.EventType.FOCUS, nestedAnchor));
  clock.tick(76);
  assertEquals('visible', tt.getElement().style.visibility);
  assertEquals('visible', ttNested.getElement().style.visibility);
  goog.testing.events.fireBrowserEvent(new goog.events.Event(
      goog.events.EventType.BLUR, nestedAnchor));
  goog.testing.events.fireBrowserEvent(new goog.events.Event(
      goog.events.EventType.FOCUS, hoverTarget));
  clock.tick(26);
  assertEquals('visible', tt.getElement().style.visibility);
  assertEquals('hidden', ttNested.getElement().style.visibility);

  ttNested.onHide_();
  ttNested.dispose();
}

function testPosition() {
  dom.getDocument().body.style.paddingBottom = '150%'; // force scrollbar
  var scrollEl = dom.getDocumentScrollElement();

  var anchor = dom.getElement('hovertarget');
  var tooltip = new goog.ui.Tooltip(anchor, 'foo');
  tooltip.getElement().style.position = 'absolute';

  tooltip.cursorPosition.x = 100;
  tooltip.cursorPosition.y = 100;
  tooltip.showForElement(anchor);

  assertEquals('Tooltip should be at cursor position',
      '(110, 110)', // (100, 100) + padding (10, 10)
      goog.style.getPageOffset(tooltip.getElement()).toString());

  scrollEl.scrollTop = 50;

  var offset = goog.style.getPageOffset(tooltip.getElement());
  assertTrue('Tooltip should be at cursor position when scrolled',
      Math.abs(offset.x - 110) <= ALLOWED_OFFSET); // 100 + padding 10
  assertTrue('Tooltip should be at cursor position when scrolled',
      Math.abs(offset.y - 110) <= ALLOWED_OFFSET); // 100 + padding 10

  tooltip.dispose();
  dom.getDocument().body.style.paddingTop = '';
  scrollEl.scrollTop = 0;
}

function testPositionOverride() {
  var anchor = dom.getElement('hovertarget');
  var tooltip = new TestTooltip(anchor, 'foo', dom);

  tooltip.showForElement(anchor);

  assertEquals('Tooltip should be at absolute position', '(13, 17)',
      goog.style.getPageOffset(tooltip.getElement()).toString());
  tooltip.dispose();
}

function testHtmlContent() {
  tt.setSafeHtml(goog.html.testing.newSafeHtmlForTest(
      '<span class="theSpan">Hello</span>'));
  var spanEl =
      goog.dom.getElementByClass('theSpan', tt.getElement());
  assertEquals('Hello', goog.dom.getTextContent(spanEl));
}

function testSetContent_guardedByGlobalFlag() {
  /** @suppress {missingRequire} */
  stubs.set(goog.html.legacyconversions, 'ALLOW_LEGACY_CONVERSIONS', false);
  assertEquals(
      'Error: Legacy conversion from string to goog.html types is disabled',
      assertThrows(function() {
        tt.setHtml('<img src="blag" onerror="evil();">');
      }).message);
}

function testSetElementNull() {
  tt.setElement(null);
}

function testFocusBlurElementsInTooltip() {
  var anchorEl = dom.getElement('hovertarget');
  goog.dom.setFocusableTabIndex(anchorEl, true);
  tt.attach(anchorEl);
  goog.testing.events.fireFocusEvent(anchorEl);
  clock.tick(1000);
  assertEquals('visible', tt.getElement().style.visibility);

  goog.testing.events.fireBlurEvent(anchorEl);
  tt.tooltipFocusHandler_.dispatchEvent(
      goog.events.FocusHandler.EventType.FOCUSIN);
  clock.tick(1000);
  assertEquals('visible', tt.getElement().style.visibility);

  // Run blur on the previous element followed by focus on the element being
  // focused, as would normally happen when focus() is called on an element.
  tt.tooltipFocusHandler_.dispatchEvent(
      goog.events.FocusHandler.EventType.FOCUSOUT);
  tt.tooltipFocusHandler_.dispatchEvent(
      goog.events.FocusHandler.EventType.FOCUSIN);
  clock.tick(1000);
  assertEquals('visible', tt.getElement().style.visibility);

  tt.tooltipFocusHandler_.dispatchEvent(
      goog.events.FocusHandler.EventType.FOCUSOUT);
  clock.tick(1000);
  assertEquals('hidden', tt.getElement().style.visibility);
}

function testFocusElementInTooltipThenBackToAnchor() {
  var anchorEl = dom.getElement('hovertarget');
  goog.dom.setFocusableTabIndex(anchorEl, true);
  tt.attach(anchorEl);
  goog.testing.events.fireFocusEvent(anchorEl);
  clock.tick(1000);
  assertEquals('visible', tt.getElement().style.visibility);

  // Run blur on the previous element followed by focus on the element being
  // focused, as would normally happen when focus() is called on an element.
  goog.testing.events.fireBlurEvent(anchorEl);
  tt.tooltipFocusHandler_.dispatchEvent(
      goog.events.FocusHandler.EventType.FOCUSIN);
  clock.tick(1000);
  assertEquals('visible', tt.getElement().style.visibility);

  // Run blur on the previous element followed by focus on the element being
  // focused, as would normally happen when focus() is called on an element.
  tt.tooltipFocusHandler_.dispatchEvent(
      goog.events.FocusHandler.EventType.FOCUSOUT);
  goog.testing.events.fireFocusEvent(anchorEl);
  clock.tick(1000);
  assertEquals('visible', tt.getElement().style.visibility);

  goog.testing.events.fireBlurEvent(anchorEl);
  clock.tick(1000);
  assertEquals('hidden', tt.getElement().style.visibility);
}
