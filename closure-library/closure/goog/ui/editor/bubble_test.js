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

goog.provide('goog.ui.editor.BubbleTest');
goog.setTestOnly('goog.ui.editor.BubbleTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('goog.positioning.Corner');
goog.require('goog.positioning.OverflowStatus');
goog.require('goog.string');
goog.require('goog.style');
goog.require('goog.testing.editor.TestHelper');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');
goog.require('goog.ui.editor.Bubble');
goog.require('goog.userAgent.product');

var testHelper;
var fieldDiv;
var bubble;
var link;
var link2;
var panelId;

function setUpPage() {
  fieldDiv = goog.dom.getElement('field');
  var viewportSize = goog.dom.getViewportSize();
  // Some tests depends on enough size of viewport.
  if (viewportSize.width < 600 || viewportSize.height < 440) {
    window.moveTo(0, 0);
    window.resizeTo(640, 480);
  }
}

function setUp() {
  testHelper = new goog.testing.editor.TestHelper(fieldDiv);
  testHelper.setUpEditableElement();

  bubble = new goog.ui.editor.Bubble(document.body, 999);

  fieldDiv.innerHTML = '<a href="http://www.google.com">Google</a>' +
      '<a href="http://www.google.com">Google2</a>';
  link = fieldDiv.firstChild;
  link2 = fieldDiv.lastChild;

  window.scrollTo(0, 0);
  goog.style.setStyle(document.body, 'direction', 'ltr');
  goog.style.setStyle(document.getElementById('field'), 'position', 'static');
}

function tearDown() {
  if (panelId) {
    bubble.removePanel(panelId);
    panelId = null;
  }
  testHelper.tearDownEditableElement();
}


/**
 * This is a helper function for setting up the target element with a
 * given direction.
 *
 * @param {string} dir The direction of the target element, 'ltr' or 'rtl'.
 * @param {boolean=} opt_preferTopPosition Whether to prefer placing the bubble
 *     above the element instead of below it.  Defaults to preferring below.
 */
function prepareTargetWithGivenDirection(dir, opt_preferTopPosition) {
  goog.style.setStyle(document.body, 'direction', dir);

  fieldDiv.style.direction = dir;
  fieldDiv.innerHTML = '<a href="http://www.google.com">Google</a>';
  link = fieldDiv.firstChild;

  panelId = bubble.addPanel('A', 'Link', link, function(el) {
    el.innerHTML = '<div style="border:1px solid blue;">B</div>';
  }, opt_preferTopPosition);
}


/**
 * This is a helper function for getting the expected position of the bubble.
 * (align to the right or the left of the target element).  Align left by
 * default and align right if opt_alignRight is true. The expected Y is
 * unaffected by alignment.
 *
 * @param {boolean=} opt_alignRight Sets the expected alignment to be right.
 */
function getExpectedBubblePositionWithGivenAlignment(opt_alignRight) {
  var targetPosition = goog.style.getFramedPageOffset(link, window);
  var targetWidth = link.offsetWidth;
  var bubbleSize = goog.style.getSize(bubble.bubbleContainer_);
  var expectedBubbleX = opt_alignRight ?
      targetPosition.x + targetWidth - bubbleSize.width : targetPosition.x;
  var expectedBubbleY = link.offsetHeight + targetPosition.y +
      goog.ui.editor.Bubble.VERTICAL_CLEARANCE_;

  return {
    x: expectedBubbleX,
    y: expectedBubbleY
  };
}

function testCreateBubbleWithLinkPanel() {
  var id = goog.string.createUniqueString();
  panelId = bubble.addPanel('A', 'Link', link, function(container) {
    container.innerHTML = '<span id="' + id + '">Test</span>';
  });
  assertNotNull('Bubble should be created', bubble.bubbleContents_);
  assertNotNull('Added element should be present', goog.dom.getElement(id));
  assertTrue('Bubble should be visible', bubble.isVisible());
}

function testCloseBubble() {
  testCreateBubbleWithLinkPanel();

  var count = 0;
  goog.events.listen(bubble, goog.ui.Component.EventType.HIDE, function() {
    count++;
  });

  bubble.removePanel(panelId);
  panelId = null;

  assertFalse('Bubble should not be visible', bubble.isVisible());
  assertEquals('Hide event should be dispatched', 1, count);
}

function testCloseBox() {
  testCreateBubbleWithLinkPanel();

  var count = 0;
  goog.events.listen(bubble, goog.ui.Component.EventType.HIDE, function() {
    count++;
  });

  var closeBox = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, 'tr_bubble_closebox', bubble.bubbleContainer_)[0];
  goog.testing.events.fireClickSequence(closeBox);
  panelId = null;

  assertFalse('Bubble should not be visible', bubble.isVisible());
  assertEquals('Hide event should be dispatched', 1, count);
}

function testViewPortSizeMonitorEvent() {
  testCreateBubbleWithLinkPanel();

  var numCalled = 0;
  bubble.reposition = function() {
    numCalled++;
  };

  assertNotUndefined('viewPortSizeMonitor_ should not be undefined',
      bubble.viewPortSizeMonitor_);
  bubble.viewPortSizeMonitor_.dispatchEvent(goog.events.EventType.RESIZE);

  assertEquals('reposition not called', 1, numCalled);
}

function testBubblePositionPreferTop() {
  called = false;
  bubble.positionAtAnchor_ = function(targetCorner, bubbleCorner, overflow) {
    called = true;

    // Assert that the bubble is positioned below the target.
    assertEquals(goog.positioning.Corner.TOP_START, targetCorner);
    assertEquals(goog.positioning.Corner.BOTTOM_START, bubbleCorner);

    return goog.positioning.OverflowStatus.NONE;
  };
  prepareTargetWithGivenDirection('ltr', true);
  assertTrue(called);
}

function testBubblePosition() {
  panelId = bubble.addPanel('A', 'Link', link, goog.nullFunction);
  var CLEARANCE = goog.ui.editor.Bubble.VERTICAL_CLEARANCE_;
  var bubbleContainer = bubble.bubbleContainer_;

  // The field is at a normal place, alomost the top of the viewport, and
  // there is enough space at the bottom of the field.
  var targetPos = goog.style.getFramedPageOffset(link, window);
  var targetSize = goog.style.getSize(link);
  var pos = goog.style.getFramedPageOffset(bubbleContainer);
  assertEquals(targetPos.y + targetSize.height + CLEARANCE, pos.y);
  assertEquals(targetPos.x, pos.x);

  // Move the target to the bottom of the viewport.
  var field = document.getElementById('field');
  var fieldPos = goog.style.getFramedPageOffset(field, window);
  fieldPos.y += bubble.dom_.getViewportSize().height -
      (targetPos.y + targetSize.height);
  goog.style.setStyle(field, 'position', 'absolute');
  goog.style.setPosition(field, fieldPos);
  bubble.reposition();
  var bubbleSize = goog.style.getSize(bubbleContainer);
  targetPosition = goog.style.getFramedPageOffset(link, window);
  pos = goog.style.getFramedPageOffset(bubbleContainer);
  assertEquals(targetPosition.y - CLEARANCE - bubbleSize.height, pos.y);
}

function testBubblePositionRightAligned() {
  if (goog.userAgent.product.SAFARI) {
    // TODO(b/20733468): Disabled so we can get the rest of the Closure test
    // suite running in a continuous build. Will investigate later.
    return;
  }

  prepareTargetWithGivenDirection('rtl');

  var expectedPos = getExpectedBubblePositionWithGivenAlignment(true);
  var pos = goog.style.getFramedPageOffset(bubble.bubbleContainer_);
  assertRoughlyEquals(expectedPos.x, pos.x, 0.1);
  assertRoughlyEquals(expectedPos.y, pos.y, 0.1);
}


/**
 * Test for bug 1955511, the bubble should align to the right side
 * of the target element when the bubble is RTL, regardless of the
 * target element's directionality.
 */
function testBubblePositionLeftToRight() {
  if (goog.userAgent.product.SAFARI) {
    // TODO(b/20733468): Disabled so we can get the rest of the Closure test
    // suite running in a continuous build. Will investigate later.
    return;
  }

  goog.style.setStyle(bubble.bubbleContainer_, 'direction', 'ltr');
  prepareTargetWithGivenDirection('rtl');

  var expectedPos = getExpectedBubblePositionWithGivenAlignment();
  var pos = goog.style.getFramedPageOffset(bubble.bubbleContainer_);
  assertRoughlyEquals(expectedPos.x, pos.x, 0.1);
  assertRoughlyEquals(expectedPos.y, pos.y, 0.1);
}


/**
 * Test for bug 1955511, the bubble should align to the left side
 * of the target element when the bubble is LTR, regardless of the
 * target element's directionality.
 */
function testBubblePositionRightToLeft() {
  goog.style.setStyle(bubble.bubbleContainer_, 'direction', 'rtl');
  prepareTargetWithGivenDirection('ltr');

  var expectedPos = getExpectedBubblePositionWithGivenAlignment(true);
  var pos = goog.style.getFramedPageOffset(bubble.bubbleContainer_);
  assertEquals(expectedPos.x, pos.x);
  assertEquals(expectedPos.y, pos.y);
}
