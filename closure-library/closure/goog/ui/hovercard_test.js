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

goog.provide('goog.ui.HoverCardTest');
goog.setTestOnly('goog.ui.HoverCardTest');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.math.Coordinate');
goog.require('goog.style');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.events');
goog.require('goog.testing.events.Event');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.HoverCard');

var timer = new goog.testing.MockClock();
var card;

// Variables for mocks
var triggeredElement;
var cancelledElement;
var showDelay;
var shownCard;
var hideDelay;

// spans
var john;
var jane;
var james;
var bill;
var child;

// Inactive
var elsewhere;
var offAnchor;

function setUpPage() {
  john = goog.dom.getElement('john');
  jane = goog.dom.getElement('jane');
  james = goog.dom.getElement('james');
  bill = goog.dom.getElement('bill');
  child = goog.dom.getElement('child');
}

function setUp() {
  timer.install();
  triggeredElement = null;
  cancelledElement = null;
  showDelay = null;
  shownCard = null;
  hideDelay = null;
  elsewhere = goog.dom.getElement('notpopup');
  offAnchor = new goog.math.Coordinate(1, 1);
}

function initCard(opt_isAnchor, opt_checkChildren, opt_maxSearchSteps) {
  var isAnchor = opt_isAnchor || {SPAN: 'email'};
  card = new goog.ui.HoverCard(isAnchor, opt_checkChildren);
  card.setText('Test hovercard');

  if (opt_maxSearchSteps != null) {
    card.setMaxSearchSteps(opt_maxSearchSteps);
  }

  goog.events.listen(card, goog.ui.HoverCard.EventType.TRIGGER, onTrigger);
  goog.events.listen(
      card, goog.ui.HoverCard.EventType.CANCEL_TRIGGER, onCancel);
  goog.events.listen(
      card, goog.ui.HoverCard.EventType.BEFORE_SHOW, onBeforeShow);

  // This gets around the problem where AdvancedToolTip thinks it's
  // receiving a ghost event because cursor position hasn't moved off of
  // (0, 0).
  card.cursorPosition = new goog.math.Coordinate(1, 1);
}

// Event handlers
function onTrigger(event) {
  triggeredElement = event.anchor;
  if (showDelay) {
    card.setShowDelayMs(showDelay);
  }
  return true;
}

function onCancel(event) {
  cancelledElement = event.anchor;
}

function onBeforeShow() {
  shownCard = card.getAnchorElement();
  if (hideDelay) {
    card.setHideDelayMs(hideDelay);
  }
  return true;
}

function tearDown() {
  card.dispose();
  timer.uninstall();
}


/**
 * Verify that hovercard displays and goes away under normal circumstances.
 */
function testTrigger() {
  initCard();

  // Mouse over correct element fires trigger
  showDelay = 500;
  goog.testing.events.fireMouseOverEvent(john, elsewhere);
  assertEquals('Hovercard should have triggered', john, triggeredElement);

  // Show card after delay
  timer.tick(showDelay - 1);
  assertNull('Card should not have shown', shownCard);
  assertFalse(card.isVisible());
  hideDelay = 5000;
  timer.tick(1);
  assertEquals('Card should have shown', john, shownCard);
  assertTrue(card.isVisible());

  // Mouse out leads to hide delay
  goog.testing.events.fireMouseOutEvent(john, elsewhere);
  goog.testing.events.fireMouseMoveEvent(document, offAnchor);
  timer.tick(hideDelay - 1);
  assertTrue('Card should still be visible', card.isVisible());
  timer.tick(10);
  assertFalse('Card should be hidden', card.isVisible());
}


/**
 * Verify that CANCEL_TRIGGER event occurs when mouse goes out of
 * triggering element before hovercard is shown.
 */
function testOnCancel() {
  initCard();

  showDelay = 500;
  goog.testing.events.fireMouseOverEvent(john, elsewhere);
  timer.tick(showDelay - 1);
  goog.testing.events.fireMouseOutEvent(john, elsewhere);
  goog.testing.events.fireMouseMoveEvent(document, offAnchor);
  timer.tick(10);
  assertFalse('Card should be hidden', card.isVisible());
  assertEquals('Should have cancelled trigger', john, cancelledElement);
}


/**
 * Verify that mousing over non-triggering elements don't interfere.
 */
function testMouseOverNonTrigger() {
  initCard();

  // Mouse over correct element fires trigger
  showDelay = 500;
  goog.testing.events.fireMouseOverEvent(john, elsewhere);
  timer.tick(showDelay);

  // Mouse over and out other element does nothing
  triggeredElement = null;
  goog.testing.events.fireMouseOverEvent(jane, elsewhere);
  timer.tick(showDelay + 1);
  assertNull(triggeredElement);
}


/**
 * Verify that a mouse over event with no target will not break
 * hover card.
 */
function testMouseOverNoTarget() {
  initCard();
  card.handleTriggerMouseOver_(new goog.testing.events.Event());
}


/**
 * Verify that mousing over a second trigger before the first one shows
 * will correctly cancel the first and show the second.
 */
function testMultipleTriggers() {
  initCard();

  // Test second trigger when first one still pending
  showDelay = 500;
  hideDelay = 1000;
  goog.testing.events.fireMouseOverEvent(john, elsewhere);
  timer.tick(250);
  goog.testing.events.fireMouseOutEvent(john, james);
  goog.testing.events.fireMouseOverEvent(james, john);
  // First trigger should cancel because it isn't showing yet
  assertEquals('Should cancel first trigger', john, cancelledElement);
  timer.tick(300);
  assertFalse(card.isVisible());
  timer.tick(250);
  assertEquals('Should show second card', james, shownCard);
  assertTrue(card.isVisible());

  goog.testing.events.fireMouseOutEvent(james, john);
  goog.testing.events.fireMouseOverEvent(john, james);
  assertEquals('Should still show second card', james, card.getAnchorElement());
  assertTrue(card.isVisible());

  shownCard = null;
  timer.tick(501);
  assertEquals('Should show first card again', john, shownCard);
  assertTrue(card.isVisible());

  // Test that cancelling while another is showing gives correct cancel
  // information
  cancelledElement = null;
  goog.testing.events.fireMouseOutEvent(john, james);
  goog.testing.events.fireMouseOverEvent(james, john);
  goog.testing.events.fireMouseOutEvent(james, elsewhere);
  assertEquals('Should cancel second card', james, cancelledElement);
}


/**
 * Verify manual triggering.
 */
function testManualTrigger() {
  initCard();

  // Doesn't normally trigger for div tag
  showDelay = 500;
  goog.testing.events.fireMouseOverEvent(bill, elsewhere);
  timer.tick(showDelay);
  assertFalse(card.isVisible());

  // Manually trigger element
  card.triggerForElement(bill);
  hideDelay = 600;
  timer.tick(showDelay);
  assertTrue(card.isVisible());
  goog.testing.events.fireMouseOutEvent(bill, elsewhere);
  goog.testing.events.fireMouseMoveEvent(document, offAnchor);
  timer.tick(hideDelay);
  assertFalse(card.isVisible());
}


/**
 * Verify creating with isAnchor function.
 */
function testIsAnchor() {
  // Initialize card so only bill triggers it.
  initCard(function(element) { return element == bill; });

  showDelay = 500;
  goog.testing.events.fireMouseOverEvent(bill, elsewhere);
  timer.tick(showDelay);
  assertTrue('Should trigger card', card.isVisible());

  hideDelay = 300;
  goog.testing.events.fireMouseOutEvent(bill, elsewhere);
  goog.testing.events.fireMouseMoveEvent(document, offAnchor);
  timer.tick(hideDelay);
  assertFalse(card.isVisible());

  goog.testing.events.fireMouseOverEvent(john, elsewhere);
  timer.tick(showDelay);
  assertFalse('Should not trigger card', card.isVisible());
}


/**
 * Verify mouse over child of anchor triggers hovercard.
 */
function testAnchorWithChildren() {
  initCard();

  showDelay = 500;
  goog.testing.events.fireMouseOverEvent(james, elsewhere);
  timer.tick(250);

  // Moving from an anchor to a child of that anchor shouldn't cancel
  // or retrigger.
  var childBounds = goog.style.getBounds(child);
  var inChild =
      new goog.math.Coordinate(childBounds.left + 1, childBounds.top + 1);
  goog.testing.events.fireMouseOutEvent(james, child);
  goog.testing.events.fireMouseMoveEvent(child, inChild);
  assertNull("Shouldn't cancel trigger", cancelledElement);
  triggeredElement = null;
  goog.testing.events.fireMouseOverEvent(child, james);
  assertNull("Shouldn't retrigger card", triggeredElement);
  timer.tick(250);
  assertTrue('Card should show with original delay', card.isVisible());

  hideDelay = 300;
  goog.testing.events.fireMouseOutEvent(child, elsewhere);
  goog.testing.events.fireMouseMoveEvent(child, offAnchor);
  timer.tick(hideDelay);
  assertFalse(card.isVisible());

  goog.testing.events.fireMouseOverEvent(child, elsewhere);
  timer.tick(showDelay);
  assertTrue('Mouse over child should trigger card', card.isVisible());
}

function testNoTriggerWithMaxSearchSteps() {
  initCard(undefined, true, 0);

  showDelay = 500;
  goog.testing.events.fireMouseOverEvent(child, elsewhere);
  timer.tick(showDelay);
  assertFalse('Should not trigger card', card.isVisible());
}

function testTriggerWithMaxSearchSteps() {
  initCard(undefined, true, 2);

  showDelay = 500;
  goog.testing.events.fireMouseOverEvent(child, elsewhere);
  timer.tick(showDelay);
  assertTrue('Should trigger card', card.isVisible());
}

function testPositionAfterSecondTriggerWithMaxSearchSteps() {
  initCard(undefined, true, 2);

  showDelay = 500;
  goog.testing.events.fireMouseOverEvent(john, elsewhere);
  timer.tick(showDelay);
  assertTrue('Should trigger card', card.isVisible());
  assertEquals(
      'Card cursor x coordinate should be 1', card.position_.coordinate.x, 1);
  card.cursorPosition = new goog.math.Coordinate(2, 2);
  goog.testing.events.fireMouseOverEvent(child, elsewhere);
  timer.tick(showDelay);
  assertTrue('Should trigger card', card.isVisible());
  assertEquals(
      'Card cursor x coordinate should be 2', card.position_.coordinate.x, 2);
}
