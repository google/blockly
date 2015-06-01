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

/**
 * @fileoverview Unit tests for goog.position.
 *
 * @author eae@google.com (Emil A Eklund)
 */

/** @suppress {extraProvide} */
goog.provide('goog.positioningTest');

goog.require('goog.dom');
goog.require('goog.dom.DomHelper');
goog.require('goog.dom.TagName');
goog.require('goog.math.Box');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.positioning');
goog.require('goog.positioning.Corner');
goog.require('goog.positioning.Overflow');
goog.require('goog.positioning.OverflowStatus');
goog.require('goog.style');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');

goog.setTestOnly('goog.positioningTest');

// Allow positions to be off by one in gecko as it reports scrolling
// offsets in steps of 2.  Otherwise, allow for subpixel difference
// as seen in IE10+
var ALLOWED_OFFSET = goog.userAgent.GECKO ? 1 : 0.1;
// Error bar for positions since some browsers are not super accurate
// in reporting them.
var EPSILON = 2;

var expectedFailures = new goog.testing.ExpectedFailures();

var corner = goog.positioning.Corner;
var overflow = goog.positioning.Overflow;
var testArea;

function setUp() {
  window.scrollTo(0, 0);

  var viewportSize = goog.dom.getViewportSize();
  // Some tests need enough size viewport.
  if (viewportSize.width < 600 || viewportSize.height < 600) {
    window.moveTo(0, 0);
    window.resizeTo(640, 640);
  }

  testArea = goog.dom.getElement('test-area');
}

function tearDown() {
  expectedFailures.handleTearDown();
  testArea.setAttribute('style', '');
  testArea.innerHTML = '';
}


/**
 * This is used to round pixel values on FF3 Mac.
 */
function assertRoundedEquals(a, b, c) {
  function round(x) {
    return goog.userAgent.GECKO && (goog.userAgent.MAC || goog.userAgent.X11) &&
        goog.userAgent.isVersionOrHigher('1.9') ? Math.round(x) : x;
  }
  if (arguments.length == 3) {
    assertRoughlyEquals(a, round(b), round(c), ALLOWED_OFFSET);
  } else {
    assertRoughlyEquals(round(a), round(b), ALLOWED_OFFSET);
  }
}

function testPositionAtAnchorLeftToRight() {
  var anchor = document.getElementById('anchor1');
  var popup = document.getElementById('popup1');

  // Anchor top left to top left.
  goog.positioning.positionAtAnchor(anchor, corner.TOP_LEFT,
                                    popup, corner.TOP_LEFT);
  var anchorRect = goog.style.getBounds(anchor);
  var popupRect = goog.style.getBounds(popup);
  assertRoundedEquals('Left edge of popup should line up with left edge ' +
                      'of anchor.',
                      anchorRect.left,
                      popupRect.left);
  assertRoundedEquals('Popup should have the same y position as the anchor.',
                      anchorRect.top,
                      popupRect.top);

  // Anchor top left to bottom left.
  goog.positioning.positionAtAnchor(anchor, corner.BOTTOM_LEFT,
                                    popup, corner.TOP_LEFT);
  anchorRect = goog.style.getBounds(anchor);
  popupRect = goog.style.getBounds(popup);
  assertRoundedEquals('Left edge of popup should line up with left edge ' +
                      'of anchor.',
                      anchorRect.left,
                      popupRect.left);
  assertRoundedEquals('Popup should be positioned just below the anchor.',
                      anchorRect.top + anchorRect.height,
                      popupRect.top);

  // Anchor top left to top right.
  goog.positioning.positionAtAnchor(anchor, corner.TOP_RIGHT,
                                    popup, corner.TOP_LEFT);
  anchorRect = goog.style.getBounds(anchor);
  popupRect = goog.style.getBounds(popup);
  assertRoundedEquals('Popup should be positioned just right of the anchor.',
                      anchorRect.left + anchorRect.width,
                      popupRect.left);
  assertRoundedEquals('Popup should have the same y position as the anchor.',
                      anchorRect.top,
                      popupRect.top);

  // Anchor top right to bottom right.
  goog.positioning.positionAtAnchor(anchor, corner.BOTTOM_RIGHT,
                                    popup, corner.TOP_RIGHT);
  anchorRect = goog.style.getBounds(anchor);
  popupRect = goog.style.getBounds(popup);
  assertRoundedEquals('Right edge of popup should line up with right edge ' +
                      'of anchor.',
                      anchorRect.left + anchorRect.width,
                      popupRect.left + popupRect.width);
  assertRoundedEquals('Popup should be positioned just below the anchor.',
                      anchorRect.top + anchorRect.height,
                      popupRect.top);

  // Anchor top start to bottom start.
  goog.positioning.positionAtAnchor(anchor, corner.BOTTOM_START,
                                    popup, corner.TOP_START);
  anchorRect = goog.style.getBounds(anchor);
  popupRect = goog.style.getBounds(popup);
  assertRoundedEquals('Left edge of popup should line up with left edge ' +
                      'of anchor.',
                      anchorRect.left,
                      popupRect.left);
  assertRoundedEquals('Popup should be positioned just below the anchor.',
                      anchorRect.top + anchorRect.height,
                      popupRect.top);
}


function testPositionAtAnchorWithOffset() {
  var anchor = document.getElementById('anchor1');
  var popup = document.getElementById('popup1');

  // Anchor top left to top left with an offset moving the popup away from the
  // anchor.
  goog.positioning.positionAtAnchor(anchor, corner.TOP_LEFT,
                                    popup, corner.TOP_LEFT,
                                    newCoord(-15, -20));
  var anchorRect = goog.style.getBounds(anchor);
  var popupRect = goog.style.getBounds(popup);
  assertRoundedEquals('Left edge of popup should be fifteen pixels from ' +
                      'anchor.',
                      anchorRect.left,
                      popupRect.left + 15);
  assertRoundedEquals('Top edge of popup should be twenty pixels from anchor.',
                      anchorRect.top,
                      popupRect.top + 20);

  // Anchor top left to top left with an offset moving the popup towards the
  // anchor.
  goog.positioning.positionAtAnchor(anchor, corner.TOP_LEFT,
                                    popup, corner.TOP_LEFT,
                                    newCoord(3, 1));
  anchorRect = goog.style.getBounds(anchor);
  popupRect = goog.style.getBounds(popup);
  assertRoundedEquals('Left edge of popup should be three pixels right of ' +
                      'the anchor\'s left edge',
                      anchorRect.left,
                      popupRect.left - 3);
  assertRoundedEquals('Top edge of popup should be one pixel below of the ' +
                      'anchor\'s top edge',
                      anchorRect.top,
                      popupRect.top - 1);
}


function testPositionAtAnchorOverflowLeftEdgeRightToLeft() {
  var anchor = document.getElementById('anchor5');
  var popup = document.getElementById('popup5');

  var status = goog.positioning.positionAtAnchor(anchor, corner.TOP_LEFT,
                                                 popup, corner.TOP_RIGHT,
                                                 undefined, undefined,
                                                 overflow.FAIL_X);
  assertFalse('Positioning operation should have failed.',
              (status & goog.positioning.OverflowStatus.FAILED) == 0);

  // Change overflow strategy to ADJUST.
  status = goog.positioning.positionAtAnchor(anchor, corner.TOP_LEFT,
                                             popup, corner.TOP_RIGHT,
                                             undefined, undefined,
                                             overflow.ADJUST_X);

  // Fails in Chrome because of infrastructure issues, temporarily disabled.
  // See b/4274723.
  expectedFailures.expectFailureFor(goog.userAgent.product.CHROME);
  try {
    assertTrue('Positioning operation should have been successful.',
               (status & goog.positioning.OverflowStatus.FAILED) == 0);
    assertTrue('Positioning operation should have been adjusted.',
               (status & goog.positioning.OverflowStatus.ADJUSTED_X) != 0);
  } catch (e) {
    expectedFailures.handleException(e);
  }

  var anchorRect = goog.style.getBounds(anchor);
  var popupRect = goog.style.getBounds(popup);
  var parentRect = goog.style.getBounds(anchor.parentNode);
  assertTrue('Position should have been adjusted so that the left edge of ' +
             'the popup is left of the anchor but still within the bounding ' +
             'box of the parent container.',
      anchorRect.left <= popupRect.left <= parentRect.left);

}


function testPositionAtAnchorWithMargin() {
  var anchor = document.getElementById('anchor1');
  var popup = document.getElementById('popup1');

  // Anchor top left to top left.
  goog.positioning.positionAtAnchor(anchor, corner.TOP_LEFT,
                                    popup, corner.TOP_LEFT, undefined,
                                    new goog.math.Box(1, 2, 3, 4));
  var anchorRect = goog.style.getBounds(anchor);
  var popupRect = goog.style.getBounds(popup);
  assertRoundedEquals('Left edge of popup should be four pixels from anchor.',
                      anchorRect.left,
                      popupRect.left - 4);
  assertRoundedEquals('Top edge of popup should be one pixels from anchor.',
                      anchorRect.top,
                      popupRect.top - 1);

  // Anchor top right to bottom right.
  goog.positioning.positionAtAnchor(anchor, corner.BOTTOM_RIGHT,
                                    popup, corner.TOP_RIGHT, undefined,
                                    new goog.math.Box(1, 2, 3, 4));
  anchorRect = goog.style.getBounds(anchor);
  popupRect = goog.style.getBounds(popup);

  var visibleAnchorRect = goog.positioning.getVisiblePart_(anchor);

  assertRoundedEquals('Right edge of popup should line up with right edge ' +
                      'of anchor.',
                      visibleAnchorRect.left + visibleAnchorRect.width,
                      popupRect.left + popupRect.width + 2);

  assertRoundedEquals('Popup should be positioned just below the anchor.',
                      visibleAnchorRect.top + visibleAnchorRect.height,
                      popupRect.top - 1);

}


function testPositionAtAnchorRightToLeft() {
  if (goog.userAgent.IE && goog.userAgent.isVersionOrHigher('6')) {
    // These tests fails with IE6.
    // TODO(user): Investigate the reason.
    return;
  }
  if (goog.userAgent.product.SAFARI) {
    // TODO(b/20733468): Disabled so we can get the rest of the Closure test
    // suite running in a continuous build. Will investigate later.
    return;
  }

  var anchor = document.getElementById('anchor2');
  var popup = document.getElementById('popup2');

  // Anchor top left to top left.
  goog.positioning.positionAtAnchor(anchor, corner.TOP_LEFT,
                                    popup, corner.TOP_LEFT);
  var anchorRect = goog.style.getBounds(anchor);
  var popupRect = goog.style.getBounds(popup);

  assertRoundedEquals('Left edge of popup should line up with left edge ' +
                      'of anchor.',
                      anchorRect.left,
                      popupRect.left);
  assertRoundedEquals('Popup should have the same y position as the anchor.',
                      anchorRect.top,
                      popupRect.top);

  // Anchor top start to bottom start.
  goog.positioning.positionAtAnchor(anchor, corner.BOTTOM_START,
                                    popup, corner.TOP_START);
  anchorRect = goog.style.getBounds(anchor);
  popupRect = goog.style.getBounds(popup);
  assertRoundedEquals('Right edge of popup should line up with right edge ' +
                      'of anchor.',
                      anchorRect.left + anchorRect.width,
                      popupRect.left + popupRect.width);
  assertRoundedEquals('Popup should be positioned just below the anchor.',
                      anchorRect.top + anchorRect.height,
                      popupRect.top);
}

function testPositionAtAnchorRightToLeftWithScroll() {
  if (goog.userAgent.IE && goog.userAgent.isVersionOrHigher('6')) {
    // These tests fails with IE6.
    // TODO(user): Investigate the reason.
    return;
  }
  if (goog.userAgent.product.SAFARI) {
    // TODO(b/20733468): Disabled so we can get the rest of the Closure test
    // suite running in a continuous build. Will investigate later.
    return;
  }

  var anchor = document.getElementById('anchor8');
  var popup = document.getElementById('popup8');

  // Anchor top left to top left.
  goog.positioning.positionAtAnchor(anchor, corner.TOP_LEFT,
                                    popup, corner.TOP_LEFT);
  var anchorRect = goog.style.getBounds(anchor);
  var popupRect = goog.style.getBounds(popup);

  assertRoundedEquals('Left edge of popup should line up with left edge ' +
                      'of anchor.',
                      anchorRect.left,
                      popupRect.left);
  assertRoundedEquals('Popup should have the same y position as the anchor.',
                      anchorRect.top,
                      popupRect.top);

  // Anchor top start to bottom start.
  goog.positioning.positionAtAnchor(anchor, corner.BOTTOM_START,
                                    popup, corner.TOP_START);
  anchorRect = goog.style.getBounds(anchor);
  popupRect = goog.style.getBounds(popup);

  var visibleAnchorRect = goog.positioning.getVisiblePart_(anchor);
  var visibleAnchorBox = visibleAnchorRect.toBox();

  assertRoundedEquals('Right edge of popup should line up with right edge ' +
                      'of anchor.',
                      anchorRect.left + anchorRect.width,
                      popupRect.left + popupRect.width);
  assertRoundedEquals('Popup should be positioned just below the anchor.',
                      visibleAnchorBox.bottom,
                      popupRect.top);
}

function testPositionAtAnchorBodyViewport() {
  var anchor = document.getElementById('anchor1');
  var popup = document.getElementById('popup3');

  // Anchor top left to top left.
  goog.positioning.positionAtAnchor(anchor, corner.TOP_LEFT,
                                    popup, corner.TOP_LEFT);
  var anchorRect = goog.style.getBounds(anchor);
  var popupRect = goog.style.getBounds(popup);
  assertEquals('Left edge of popup should line up with left edge of anchor.',
               anchorRect.left,
               popupRect.left);
  assertRoughlyEquals('Popup should have the same y position as the anchor.',
                      anchorRect.top,
                      popupRect.top,
                      1);

  // Anchor top start to bottom right.
  goog.positioning.positionAtAnchor(anchor, corner.BOTTOM_RIGHT,
                                    popup, corner.TOP_RIGHT);
  anchorRect = goog.style.getBounds(anchor);
  popupRect = goog.style.getBounds(popup);
  assertEquals('Right edge of popup should line up with right edge of anchor.',
               anchorRect.left + anchorRect.width,
               popupRect.left + popupRect.width);
  assertRoughlyEquals('Popup should be positioned just below the anchor.',
                      anchorRect.top + anchorRect.height,
                      popupRect.top,
                      1);

  // Anchor top right to top left.
  goog.positioning.positionAtAnchor(anchor, corner.TOP_LEFT,
                                    popup, corner.TOP_RIGHT);
  anchorRect = goog.style.getBounds(anchor);
  popupRect = goog.style.getBounds(popup);
  assertEquals('Right edge of popup should line up with left edge of anchor.',
               anchorRect.left,
               popupRect.left + popupRect.width);
  assertRoughlyEquals('Popup should have the same y position as the anchor.',
                      anchorRect.top,
                      popupRect.top,
                      1);
}

function testPositionAtAnchorSpecificViewport() {
  var anchor = document.getElementById('anchor1');
  var popup = document.getElementById('popup3');

  // Anchor top right to top left within outerbox.
  var status = goog.positioning.positionAtAnchor(anchor, corner.TOP_LEFT,
                                                 popup, corner.TOP_RIGHT,
                                                 undefined, undefined,
                                                 overflow.FAIL_X);
  anchorRect = goog.style.getBounds(anchor);
  popupRect = goog.style.getBounds(popup);
  assertTrue('Positioning operation should have been successful.',
             (status & goog.positioning.OverflowStatus.FAILED) == 0);
  assertTrue('X position should not have been adjusted.',
             (status & goog.positioning.OverflowStatus.ADJUSTED_X) == 0);
  assertTrue('Y position should not have been adjusted.',
             (status & goog.positioning.OverflowStatus.ADJUSTED_Y) == 0);
  assertEquals('Right edge of popup should line up with left edge of anchor.',
               anchorRect.left,
               popupRect.left + popupRect.width);
  assertRoughlyEquals('Popup should have the same y position as the anchor.',
                      anchorRect.top,
                      popupRect.top,
                      1);

  // position again within box1.
  var box = document.getElementById('box1');
  var viewport = goog.style.getBounds(box);
  status = goog.positioning.positionAtAnchor(anchor, corner.TOP_LEFT,
                                             popup, corner.TOP_RIGHT,
                                             undefined, undefined,
                                             overflow.FAIL_X, undefined,
                                             viewport);
  assertFalse('Positioning operation should have failed.',
              (status & goog.positioning.OverflowStatus.FAILED) == 0);

  // Change overflow strategy to adjust.
  status = goog.positioning.positionAtAnchor(anchor, corner.TOP_LEFT,
                                             popup, corner.TOP_RIGHT,
                                             undefined, undefined,
                                             overflow.ADJUST_X, undefined,
                                             viewport);
  anchorRect = goog.style.getBounds(anchor);
  popupRect = goog.style.getBounds(popup);
  assertTrue('Positioning operation should have been successful.',
             (status & goog.positioning.OverflowStatus.FAILED) == 0);
  assertFalse('X position should have been adjusted.',
              (status & goog.positioning.OverflowStatus.ADJUSTED_X) == 0);
  assertTrue('Y position should not have been adjusted.',
             (status & goog.positioning.OverflowStatus.ADJUSTED_Y) == 0);
  assertRoughlyEquals(
      'Left edge of popup should line up with left edge of viewport.',
      viewport.left, popupRect.left, EPSILON);
  assertRoughlyEquals('Popup should have the same y position as the anchor.',
                      anchorRect.top,
                      popupRect.top,
                      1);
}

function testPositionAtAnchorOutsideViewport() {
  var anchor = document.getElementById('anchor4');
  var popup = document.getElementById('popup1');

  var status = goog.positioning.positionAtAnchor(anchor, corner.TOP_LEFT,
                                                 popup, corner.TOP_RIGHT);
  var anchorRect = goog.style.getBounds(anchor);
  var popupRect = goog.style.getBounds(popup);
  assertTrue('Positioning operation should have been successful.',
             (status & goog.positioning.OverflowStatus.FAILED) == 0);
  assertTrue('X position should not have been adjusted.',
             (status & goog.positioning.OverflowStatus.ADJUSTED_X) == 0);
  assertTrue('Y position should not have been adjusted.',
             (status & goog.positioning.OverflowStatus.ADJUSTED_Y) == 0);

  assertEquals('Right edge of popup should line up with left edge of anchor.',
               anchorRect.left,
               popupRect.left + popupRect.width);

  // Change overflow strategy to fail.
  status = goog.positioning.positionAtAnchor(anchor, corner.BOTTOM_RIGHT,
                                             popup, corner.TOP_RIGHT,
                                             undefined, undefined,
                                             overflow.FAIL_X);
  assertFalse('Positioning operation should have failed.',
              (status & goog.positioning.OverflowStatus.FAILED) == 0);

  // Change overflow strategy to adjust.
  status = goog.positioning.positionAtAnchor(anchor, corner.BOTTOM_RIGHT,
                                             popup, corner.TOP_RIGHT,
                                             undefined, undefined,
                                             overflow.ADJUST_X);
  anchorRect = goog.style.getBounds(anchor);
  popupRect = goog.style.getBounds(popup);
  assertTrue('Positioning operation should have been successful.',
             (status & goog.positioning.OverflowStatus.FAILED) == 0);
  assertFalse('X position should have been adjusted.',
              (status & goog.positioning.OverflowStatus.ADJUSTED_X) == 0);
  assertTrue('Y position should not have been adjusted.',
             (status & goog.positioning.OverflowStatus.ADJUSTED_Y) == 0);
  assertRoughlyEquals(
      'Left edge of popup should line up with left edge of viewport.',
      0, popupRect.left, EPSILON);
  assertEquals('Popup should be positioned just below the anchor.',
               anchorRect.top + anchorRect.height,
               popupRect.top);
}


function testAdjustForViewportFailIgnore() {
  var f = goog.positioning.adjustForViewport_;
  var viewport = new goog.math.Box(100, 200, 200, 100);
  var overflow = goog.positioning.Overflow.IGNORE;

  var pos = newCoord(150, 150);
  var size = newSize(50, 50);
  assertEquals('Viewport overflow should be ignored.',
               goog.positioning.OverflowStatus.NONE,
               f(pos, size, viewport, overflow));

  pos = newCoord(150, 150);
  size = newSize(100, 50);
  assertEquals('Viewport overflow should be ignored.',
               goog.positioning.OverflowStatus.NONE,
               f(pos, size, viewport, overflow));

  pos = newCoord(50, 50);
  size = newSize(50, 50);
  assertEquals('Viewport overflow should be ignored.',
               goog.positioning.OverflowStatus.NONE,
               f(pos, size, viewport, overflow));
}


function testAdjustForViewportFailXY() {
  var f = goog.positioning.adjustForViewport_;
  var viewport = new goog.math.Box(100, 200, 200, 100);
  var overflow = goog.positioning.Overflow.FAIL_X |
                 goog.positioning.Overflow.FAIL_Y;

  var pos = newCoord(150, 150);
  var size = newSize(50, 50);
  assertEquals('Element should not overflow viewport.',
               goog.positioning.OverflowStatus.NONE,
               f(pos, size, viewport, overflow));

  pos = newCoord(150, 150);
  size = newSize(100, 50);
  assertEquals('Element should overflow the right edge of viewport.',
               goog.positioning.OverflowStatus.FAILED_RIGHT,
               f(pos, size, viewport, overflow));

  pos = newCoord(150, 150);
  size = newSize(50, 100);
  assertEquals('Element should overflow the bottom edge of viewport.',
               goog.positioning.OverflowStatus.FAILED_BOTTOM,
               f(pos, size, viewport, overflow));

  pos = newCoord(50, 150);
  size = newSize(50, 50);
  assertEquals('Element should overflow the left edge of viewport.',
               goog.positioning.OverflowStatus.FAILED_LEFT,
               f(pos, size, viewport, overflow));

  pos = newCoord(150, 50);
  size = newSize(50, 50);
  assertEquals('Element should overflow the top edge of viewport.',
               goog.positioning.OverflowStatus.FAILED_TOP,
               f(pos, size, viewport, overflow));

  pos = newCoord(50, 50);
  size = newSize(50, 50);
  assertEquals('Element should overflow the left & top edges of viewport.',
               goog.positioning.OverflowStatus.FAILED_LEFT |
               goog.positioning.OverflowStatus.FAILED_TOP,
               f(pos, size, viewport, overflow));
}


function testAdjustForViewportAdjustXFailY() {
  var f = goog.positioning.adjustForViewport_;
  var viewport = new goog.math.Box(100, 200, 200, 100);
  var overflow = goog.positioning.Overflow.ADJUST_X |
                 goog.positioning.Overflow.FAIL_Y;

  var pos = newCoord(150, 150);
  var size = newSize(50, 50);
  assertEquals('Element should not overflow viewport.',
               goog.positioning.OverflowStatus.NONE,
               f(pos, size, viewport, overflow));
  assertEquals('X Position should not have been changed.', 150, pos.x);
  assertEquals('Y Position should not have been changed.', 150, pos.y);

  pos = newCoord(150, 150);
  size = newSize(100, 50);
  assertEquals('Element position should be adjusted not to overflow right ' +
               'edge of viewport.',
               goog.positioning.OverflowStatus.ADJUSTED_X,
               f(pos, size, viewport, overflow));
  assertEquals('X Position should be adjusted to 100.', 100, pos.x);
  assertEquals('Y Position should not have been changed.', 150, pos.y);

  pos = newCoord(50, 150);
  size = newSize(100, 50);
  assertEquals('Element position should be adjusted not to overflow left ' +
               'edge of viewport.',
               goog.positioning.OverflowStatus.ADJUSTED_X,
               f(pos, size, viewport, overflow));
  assertEquals('X Position should be adjusted to 100.', 100, pos.x);
  assertEquals('Y Position should not have been changed.', 150, pos.y);


  pos = newCoord(50, 50);
  size = newSize(100, 50);
  assertEquals('Element position should be adjusted not to overflow left ' +
               'edge of viewport, should overflow bottom edge.',
               goog.positioning.OverflowStatus.ADJUSTED_X |
               goog.positioning.OverflowStatus.FAILED_TOP,
               f(pos, size, viewport, overflow));
  assertEquals('X Position should be adjusted to 100.', 100, pos.x);
  assertEquals('Y Position should not have been changed.', 50, pos.y);
}


function testAdjustForViewportResizeHeight() {
  var f = goog.positioning.adjustForViewport_;
  var viewport = new goog.math.Box(0, 200, 200, 0);
  var overflow = goog.positioning.Overflow.RESIZE_HEIGHT;

  var pos = newCoord(150, 150);
  var size = newSize(25, 100);
  assertEquals('Viewport height should be resized.',
               goog.positioning.OverflowStatus.HEIGHT_ADJUSTED,
               f(pos, size, viewport, overflow));
  assertEquals('Height should be resized to 50.',
               50, size.height);
  assertTrue('Output box is within viewport',
             viewport.contains(new goog.math.Box(pos.y, pos.x + size.width,
                                                 pos.y + size.height, pos.x)));

  var pos = newCoord(0, 0);
  var size = newSize(50, 250);
  assertEquals('Viewport height should be resized.',
               goog.positioning.OverflowStatus.HEIGHT_ADJUSTED,
               f(pos, size, viewport, overflow));
  assertEquals('Height should be resized to 200.',
               200, size.height);
  assertTrue('Output box is within viewport',
             viewport.contains(new goog.math.Box(pos.y, pos.x + size.width,
                                                 pos.y + size.height, pos.x)));

  var pos = newCoord(0, -50);
  var size = newSize(50, 240);
  assertEquals('Viewport height should be resized.',
               goog.positioning.OverflowStatus.HEIGHT_ADJUSTED,
               f(pos, size, viewport, overflow));
  assertEquals('Height should be resized to 190.',
               190, size.height);
  assertTrue('Output box is within viewport',
             viewport.contains(new goog.math.Box(pos.y, pos.x + size.width,
                                                 pos.y + size.height, pos.x)));

  var pos = newCoord(0, -50);
  var size = newSize(50, 300);
  assertEquals('Viewport height should be resized.',
               goog.positioning.OverflowStatus.HEIGHT_ADJUSTED,
               f(pos, size, viewport, overflow));
  assertEquals('Height should be resized to 200.',
               200, size.height);
  assertTrue('Output box is within viewport',
             viewport.contains(new goog.math.Box(pos.y, pos.x + size.width,
                                                 pos.y + size.height, pos.x)));

  pos = newCoord(150, 150);
  size = newSize(50, 50);
  assertEquals('No Viewport overflow.',
               goog.positioning.OverflowStatus.NONE,
               f(pos, size, viewport, overflow));
  assertTrue('Output box is within viewport',
             viewport.contains(new goog.math.Box(pos.y, pos.x + size.width,
                                                 pos.y + size.height, pos.x)));

  var offsetViewport = new goog.math.Box(100, 200, 300, 0);
  var pos = newCoord(0, 50);
  var size = newSize(50, 240);
  assertEquals('Viewport height should be resized.',
               goog.positioning.OverflowStatus.HEIGHT_ADJUSTED,
               f(pos, size, offsetViewport, overflow));
  assertEquals('Height should be resized to 190.',
               190, size.height);
  assertTrue('Output box is within viewport',
             offsetViewport.contains(new goog.math.Box(pos.y,
                                                       pos.x + size.width,
                                                       pos.y + size.height,
                                                       pos.x)));
}



function testAdjustForViewportResizeWidth() {
  var f = goog.positioning.adjustForViewport_;
  var viewport = new goog.math.Box(0, 200, 200, 0);
  var overflow = goog.positioning.Overflow.RESIZE_WIDTH;

  var pos = newCoord(150, 150);
  var size = newSize(100, 25);
  assertEquals('Viewport width should be resized.',
               goog.positioning.OverflowStatus.WIDTH_ADJUSTED,
               f(pos, size, viewport, overflow));
  assertEquals('Width should be resized to 50.',
               50, size.width);
  assertTrue('Output box is within viewport',
             viewport.contains(new goog.math.Box(pos.y, pos.x + size.width,
                                                 pos.y + size.height, pos.x)));

  var pos = newCoord(0, 0);
  var size = newSize(250, 50);
  assertEquals('Viewport width should be resized.',
               goog.positioning.OverflowStatus.WIDTH_ADJUSTED,
               f(pos, size, viewport, overflow));
  assertEquals('Width should be resized to 200.',
               200, size.width);
  assertTrue('Output box is within viewport',
             viewport.contains(new goog.math.Box(pos.y, pos.x + size.width,
                                                 pos.y + size.height, pos.x)));

  var pos = newCoord(-50, 0);
  var size = newSize(240, 50);
  assertEquals('Viewport width should be resized.',
               goog.positioning.OverflowStatus.WIDTH_ADJUSTED,
               f(pos, size, viewport, overflow));
  assertEquals('Width should be resized to 190.',
               190, size.width);
  assertTrue('Output box is within viewport',
             viewport.contains(new goog.math.Box(pos.y, pos.x + size.width,
                                                 pos.y + size.height, pos.x)));

  var pos = newCoord(-50, 0);
  var size = newSize(300, 50);
  assertEquals('Viewport width should be resized.',
               goog.positioning.OverflowStatus.WIDTH_ADJUSTED,
               f(pos, size, viewport, overflow));
  assertEquals('Width should be resized to 200.',
               200, size.width);
  assertTrue('Output box is within viewport',
             viewport.contains(new goog.math.Box(pos.y, pos.x + size.width,
                                                 pos.y + size.height, pos.x)));

  pos = newCoord(150, 150);
  size = newSize(50, 50);
  assertEquals('No Viewport overflow.',
               goog.positioning.OverflowStatus.NONE,
               f(pos, size, viewport, overflow));
  assertTrue('Output box is within viewport',
             viewport.contains(new goog.math.Box(pos.y, pos.x + size.width,
                                                 pos.y + size.height, pos.x)));

  var offsetViewport = new goog.math.Box(0, 300, 200, 100);
  var pos = newCoord(50, 0);
  var size = newSize(240, 50);
  assertEquals('Viewport width should be resized.',
               goog.positioning.OverflowStatus.WIDTH_ADJUSTED,
               f(pos, size, offsetViewport, overflow));
  assertEquals('Width should be resized to 190.',
               190, size.width);
  assertTrue('Output box is within viewport',
             offsetViewport.contains(new goog.math.Box(pos.y,
                                                       pos.x + size.width,
                                                       pos.y + size.height,
                                                       pos.x)));
}


function testPositionAtAnchorWithResizeHeight() {
  var anchor = document.getElementById('anchor9');
  var popup = document.getElementById('popup9');
  var box = document.getElementById('box9');
  var viewport = goog.style.getBounds(box);

  var status = goog.positioning.positionAtAnchor(
      anchor, corner.TOP_START, popup, corner.TOP_START,
      new goog.math.Coordinate(0, -20), null,
      goog.positioning.Overflow.RESIZE_HEIGHT, null,
      viewport.toBox());
  assertEquals('Status should be HEIGHT_ADJUSTED.',
               goog.positioning.OverflowStatus.HEIGHT_ADJUSTED, status);

  var TOLERANCE = 0.1;
  // Adjust the viewport to allow some tolerance for subpixel positioning,
  // this is required for this test to pass on IE10,11
  viewport.top -= TOLERANCE;
  viewport.left -= TOLERANCE;

  assertTrue('Popup ' + goog.style.getBounds(popup) +
             ' not is within viewport' + viewport,
             viewport.contains(goog.style.getBounds(popup)));
}


function testPositionAtCoordinateResizeHeight() {
  var f = goog.positioning.positionAtCoordinate;
  var viewport = new goog.math.Box(0, 50, 50, 0);
  var overflow = goog.positioning.Overflow.RESIZE_HEIGHT |
      goog.positioning.Overflow.ADJUST_Y;
  var popup = document.getElementById('popup1');
  var corner = goog.positioning.Corner.BOTTOM_LEFT;

  var pos = newCoord(100, 100);

  assertEquals('Viewport height should be resized.',
               goog.positioning.OverflowStatus.HEIGHT_ADJUSTED |
               goog.positioning.OverflowStatus.ADJUSTED_Y,
               f(pos, popup, corner, undefined, viewport, overflow));
  var bounds = goog.style.getSize(popup);
  assertEquals('Height should be resized to the size of the viewport.',
               50, bounds.height);
}


function testGetPositionAtCoordinateResizeHeight() {
  var f = goog.positioning.getPositionAtCoordinate;
  var viewport = new goog.math.Box(0, 50, 50, 0);
  var overflow = goog.positioning.Overflow.RESIZE_HEIGHT |
      goog.positioning.Overflow.ADJUST_Y;
  var popup = document.getElementById('popup1');
  var corner = goog.positioning.Corner.BOTTOM_LEFT;

  var pos = newCoord(100, 100);
  var size = goog.style.getSize(popup);

  var result = f(pos, size, corner, undefined, viewport, overflow);
  assertEquals('Viewport height should be resized.',
               goog.positioning.OverflowStatus.HEIGHT_ADJUSTED |
               goog.positioning.OverflowStatus.ADJUSTED_Y,
               result.status);
  assertEquals('Height should be resized to the size of the viewport.',
               50, result.rect.height);
}


function testGetEffectiveCornerLeftToRight() {
  var f = goog.positioning.getEffectiveCorner;
  var el = document.getElementById('ltr');

  assertEquals('TOP_LEFT should be unchanged for ltr.',
               corner.TOP_LEFT,
               f(el, corner.TOP_LEFT));
  assertEquals('TOP_RIGHT should be unchanged for ltr.',
               corner.TOP_RIGHT,
               f(el, corner.TOP_RIGHT));
  assertEquals('BOTTOM_LEFT should be unchanged for ltr.',
               corner.BOTTOM_LEFT,
               f(el, corner.BOTTOM_LEFT));
  assertEquals('BOTTOM_RIGHT should be unchanged for ltr.',
               corner.BOTTOM_RIGHT,
               f(el, corner.BOTTOM_RIGHT));

  assertEquals('TOP_START should be TOP_LEFT for ltr.',
               corner.TOP_LEFT,
               f(el, corner.TOP_START));
  assertEquals('TOP_END should be TOP_RIGHT for ltr.',
               corner.TOP_RIGHT,
               f(el, corner.TOP_END));
  assertEquals('BOTTOM_START should be BOTTOM_LEFT for ltr.',
               corner.BOTTOM_LEFT,
               f(el, corner.BOTTOM_START));
  assertEquals('BOTTOM_END should be BOTTOM_RIGHT for ltr.',
               corner.BOTTOM_RIGHT,
               f(el, corner.BOTTOM_END));
}


function testGetEffectiveCornerRightToLeft() {
  var f = goog.positioning.getEffectiveCorner;
  var el = document.getElementById('rtl');

  assertEquals('TOP_LEFT should be unchanged for rtl.',
               corner.TOP_LEFT,
               f(el, corner.TOP_LEFT));
  assertEquals('TOP_RIGHT should be unchanged for rtl.',
               corner.TOP_RIGHT,
               f(el, corner.TOP_RIGHT));
  assertEquals('BOTTOM_LEFT should be unchanged for rtl.',
               corner.BOTTOM_LEFT,
               f(el, corner.BOTTOM_LEFT));
  assertEquals('BOTTOM_RIGHT should be unchanged for rtl.',
               corner.BOTTOM_RIGHT,
               f(el, corner.BOTTOM_RIGHT));

  assertEquals('TOP_START should be TOP_RIGHT for rtl.',
               corner.TOP_RIGHT,
               f(el, corner.TOP_START));
  assertEquals('TOP_END should be TOP_LEFT for rtl.',
               corner.TOP_LEFT,
               f(el, corner.TOP_END));
  assertEquals('BOTTOM_START should be BOTTOM_RIGHT for rtl.',
               corner.BOTTOM_RIGHT,
               f(el, corner.BOTTOM_START));
  assertEquals('BOTTOM_END should be BOTTOM_LEFT for rtl.',
               corner.BOTTOM_LEFT,
               f(el, corner.BOTTOM_END));
}


function testFlipCornerHorizontal() {
  var f = goog.positioning.flipCornerHorizontal;

  assertEquals('TOP_LEFT should be flipped to TOP_RIGHT.',
               corner.TOP_RIGHT,
               f(corner.TOP_LEFT));
  assertEquals('TOP_RIGHT should be flipped to TOP_LEFT.',
               corner.TOP_LEFT,
               f(corner.TOP_RIGHT));
  assertEquals('BOTTOM_LEFT should be flipped to BOTTOM_RIGHT.',
               corner.BOTTOM_RIGHT,
               f(corner.BOTTOM_LEFT));
  assertEquals('BOTTOM_RIGHT should be flipped to BOTTOM_LEFT.',
               corner.BOTTOM_LEFT,
               f(corner.BOTTOM_RIGHT));

  assertEquals('TOP_START should be flipped to TOP_END.',
               corner.TOP_END,
               f(corner.TOP_START));
  assertEquals('TOP_END should be flipped to TOP_START.',
               corner.TOP_START,
               f(corner.TOP_END));
  assertEquals('BOTTOM_START should be flipped to BOTTOM_END.',
               corner.BOTTOM_END,
               f(corner.BOTTOM_START));
  assertEquals('BOTTOM_END should be flipped to BOTTOM_START.',
               corner.BOTTOM_START,
               f(corner.BOTTOM_END));
}


function testFlipCornerVertical() {
  var f = goog.positioning.flipCornerVertical;

  assertEquals('TOP_LEFT should be flipped to BOTTOM_LEFT.',
               corner.BOTTOM_LEFT,
               f(corner.TOP_LEFT));
  assertEquals('TOP_RIGHT should be flipped to BOTTOM_RIGHT.',
               corner.BOTTOM_RIGHT,
               f(corner.TOP_RIGHT));
  assertEquals('BOTTOM_LEFT should be flipped to TOP_LEFT.',
               corner.TOP_LEFT,
               f(corner.BOTTOM_LEFT));
  assertEquals('BOTTOM_RIGHT should be flipped to TOP_RIGHT.',
               corner.TOP_RIGHT,
               f(corner.BOTTOM_RIGHT));

  assertEquals('TOP_START should be flipped to BOTTOM_START.',
               corner.BOTTOM_START,
               f(corner.TOP_START));
  assertEquals('TOP_END should be flipped to BOTTOM_END.',
               corner.BOTTOM_END,
               f(corner.TOP_END));
  assertEquals('BOTTOM_START should be flipped to TOP_START.',
               corner.TOP_START,
               f(corner.BOTTOM_START));
  assertEquals('BOTTOM_END should be flipped to TOP_END.',
               corner.TOP_END,
               f(corner.BOTTOM_END));
}


function testFlipCorner() {
  var f = goog.positioning.flipCorner;

  assertEquals('TOP_LEFT should be flipped to BOTTOM_RIGHT.',
               corner.BOTTOM_RIGHT,
               f(corner.TOP_LEFT));
  assertEquals('TOP_RIGHT should be flipped to BOTTOM_LEFT.',
               corner.BOTTOM_LEFT,
               f(corner.TOP_RIGHT));
  assertEquals('BOTTOM_LEFT should be flipped to TOP_RIGHT.',
               corner.TOP_RIGHT,
               f(corner.BOTTOM_LEFT));
  assertEquals('BOTTOM_RIGHT should be flipped to TOP_LEFT.',
               corner.TOP_LEFT,
               f(corner.BOTTOM_RIGHT));

  assertEquals('TOP_START should be flipped to BOTTOM_END.',
               corner.BOTTOM_END,
               f(corner.TOP_START));
  assertEquals('TOP_END should be flipped to BOTTOM_START.',
               corner.BOTTOM_START,
               f(corner.TOP_END));
  assertEquals('BOTTOM_START should be flipped to TOP_END.',
               corner.TOP_END,
               f(corner.BOTTOM_START));
  assertEquals('BOTTOM_END should be flipped to TOP_START.',
               corner.TOP_START,
               f(corner.BOTTOM_END));
}

function testPositionAtAnchorFrameViewportStandard() {
  var iframe = document.getElementById('iframe-standard');
  var iframeDoc = goog.dom.getFrameContentDocument(iframe);
  assertTrue(new goog.dom.DomHelper(iframeDoc).isCss1CompatMode());

  new goog.dom.DomHelper(iframeDoc).getDocumentScrollElement().scrollTop = 100;
  var anchor = iframeDoc.getElementById('anchor1');
  var popup = document.getElementById('popup6');

  var status = goog.positioning.positionAtAnchor(
      anchor, corner.TOP_RIGHT, popup, corner.BOTTOM_RIGHT);
  var iframeRect = goog.style.getBounds(iframe);
  var popupRect = goog.style.getBounds(popup);
  assertEquals('Status should not have any ADJUSTED and FAILED.',
               goog.positioning.OverflowStatus.NONE, status);
  assertRoundedEquals('Popup should be positioned just above the iframe, ' +
                      'not above the anchor element inside the iframe',
                      iframeRect.top,
                      popupRect.top + popupRect.height);
}

function testPositionAtAnchorFrameViewportQuirk() {
  var iframe = document.getElementById('iframe-quirk');
  var iframeDoc = goog.dom.getFrameContentDocument(iframe);
  assertFalse(new goog.dom.DomHelper(iframeDoc).isCss1CompatMode());

  window.scrollTo(0, 100);
  new goog.dom.DomHelper(iframeDoc).getDocumentScrollElement().scrollTop = 100;
  var anchor = iframeDoc.getElementById('anchor1');
  var popup = document.getElementById('popup6');

  var status = goog.positioning.positionAtAnchor(
      anchor, corner.TOP_RIGHT, popup, corner.BOTTOM_RIGHT);
  var iframeRect = goog.style.getBounds(iframe);
  var popupRect = goog.style.getBounds(popup);
  assertEquals('Status should not have any ADJUSTED and FAILED.',
               goog.positioning.OverflowStatus.NONE, status);
  assertRoundedEquals('Popup should be positioned just above the iframe, ' +
                      'not above the anchor element inside the iframe',
                      iframeRect.top,
                      popupRect.top + popupRect.height);
}

function testPositionAtAnchorFrameViewportWithPopupInScroller() {
  var iframe = document.getElementById('iframe-standard');
  var iframeDoc = goog.dom.getFrameContentDocument(iframe);

  new goog.dom.DomHelper(iframeDoc).getDocumentScrollElement().scrollTop = 100;
  var anchor = iframeDoc.getElementById('anchor1');
  var popup = document.getElementById('popup7');
  popup.offsetParent.scrollTop = 50;

  var status = goog.positioning.positionAtAnchor(
      anchor, corner.TOP_RIGHT, popup, corner.BOTTOM_RIGHT);
  var iframeRect = goog.style.getBounds(iframe);
  var popupRect = goog.style.getBounds(popup);
  assertEquals('Status should not have any ADJUSTED and FAILED.',
               goog.positioning.OverflowStatus.NONE, status);
  assertRoughlyEquals('Popup should be positioned just above the iframe, ' +
      'not above the anchor element inside the iframe',
      iframeRect.top,
      popupRect.top + popupRect.height,
      ALLOWED_OFFSET);
}

function testPositionAtAnchorNestedFrames() {
  var outerIframe = document.getElementById('nested-outer');
  var outerDoc = goog.dom.getFrameContentDocument(outerIframe);
  var popup = outerDoc.getElementById('popup1');
  var innerIframe = outerDoc.getElementById('inner-frame');
  var innerDoc = goog.dom.getFrameContentDocument(innerIframe);
  var anchor = innerDoc.getElementById('anchor1');

  var status = goog.positioning.positionAtAnchor(
      anchor, corner.TOP_LEFT, popup, corner.BOTTOM_LEFT);
  assertEquals('Status should not have any ADJUSTED and FAILED.',
               goog.positioning.OverflowStatus.NONE, status);
  var innerIframeRect = goog.style.getBounds(innerIframe);
  var popupRect = goog.style.getBounds(popup);
  assertRoundedEquals('Top of frame should align with bottom of the popup',
                      innerIframeRect.top, popupRect.top + popupRect.height);

  // The anchor is scrolled up by 10px.
  // Popup position should be the same as above.
  goog.dom.getWindow(innerDoc).scrollTo(0, 10);
  status = goog.positioning.positionAtAnchor(
      anchor, corner.TOP_LEFT, popup, corner.BOTTOM_LEFT);
  assertEquals('Status should not have any ADJUSTED and FAILED.',
               goog.positioning.OverflowStatus.NONE, status);
  innerIframeRect = goog.style.getBounds(innerIframe);
  popupRect = goog.style.getBounds(popup);
  assertRoundedEquals('Top of frame should align with bottom of the popup',
                      innerIframeRect.top, popupRect.top + popupRect.height);
}

function testPositionAtAnchorOffscreen() {
  var offset = 0;
  var anchor = goog.dom.getElement('offscreen-anchor');
  var popup = goog.dom.getElement('popup3');

  goog.positioning.positionAtAnchor(
      anchor, corner.TOP_LEFT, popup, corner.TOP_LEFT, null, null,
      overflow.ADJUST_X | overflow.ADJUST_Y);
  assertObjectEquals(
      newCoord(offset, offset), goog.style.getPageOffset(popup));

  goog.positioning.positionAtAnchor(
      anchor, corner.TOP_LEFT, popup, corner.TOP_LEFT, null, null,
      overflow.ADJUST_X_EXCEPT_OFFSCREEN | overflow.ADJUST_Y);
  assertObjectEquals(
      newCoord(-1000, offset), goog.style.getPageOffset(popup));

  goog.positioning.positionAtAnchor(
      anchor, corner.TOP_LEFT, popup, corner.TOP_LEFT, null, null,
      overflow.ADJUST_X | overflow.ADJUST_Y_EXCEPT_OFFSCREEN);
  assertObjectEquals(
      newCoord(offset, -1000), goog.style.getPageOffset(popup));

  goog.positioning.positionAtAnchor(
      anchor, corner.TOP_LEFT, popup, corner.TOP_LEFT, null, null,
      overflow.ADJUST_X_EXCEPT_OFFSCREEN | overflow.ADJUST_Y_EXCEPT_OFFSCREEN);
  assertObjectEquals(
      newCoord(-1000, -1000),
      goog.style.getPageOffset(popup));
}

function testPositionAtAnchorWithOverflowScrollOffsetParent() {
  var testAreaOffset = goog.style.getPageOffset(testArea);
  var scrollbarWidth = goog.style.getScrollbarWidth();
  window.scrollTo(testAreaOffset.x, testAreaOffset.y);

  var overflowDiv = goog.dom.createElement(goog.dom.TagName.DIV);
  overflowDiv.style.overflow = 'scroll';
  overflowDiv.style.position = 'relative';
  goog.style.setSize(overflowDiv, 200 /* width */, 100 /* height */);

  var anchor = goog.dom.createElement(goog.dom.TagName.DIV);
  anchor.style.position = 'absolute';
  goog.style.setSize(anchor, 50 /* width */, 50 /* height */);
  goog.style.setPosition(anchor, 300 /* left */, 300 /* top */);

  var popup = createPopupDiv(75 /* width */, 50 /* height */);

  goog.dom.append(testArea, overflowDiv, anchor);
  goog.dom.append(overflowDiv, popup);

  // Popup should always be positioned within the overflowDiv
  goog.style.setPosition(overflowDiv, 0 /* left */, 0 /* top */);
  goog.positioning.positionAtAnchor(
      anchor, corner.TOP_LEFT, popup, corner.TOP_RIGHT, null, null,
      overflow.ADJUST_X | overflow.ADJUST_Y);
  assertObjectRoughlyEquals(
      new goog.math.Coordinate(
          testAreaOffset.x + 200 - 75 - scrollbarWidth,
          testAreaOffset.y + 100 - 50 - scrollbarWidth),
      goog.style.getPageOffset(popup),
      1);

  goog.style.setPosition(overflowDiv, 400 /* left */, 0 /* top */);
  goog.positioning.positionAtAnchor(
      anchor, corner.TOP_RIGHT, popup, corner.TOP_LEFT, null, null,
      overflow.ADJUST_X | overflow.ADJUST_Y);
  assertObjectRoughlyEquals(
      new goog.math.Coordinate(
          testAreaOffset.x + 400, testAreaOffset.y + 100 - 50 - scrollbarWidth),
      goog.style.getPageOffset(popup),
      1);

  goog.style.setPosition(overflowDiv, 0 /* left */, 400 /* top */);
  goog.positioning.positionAtAnchor(
      anchor, corner.BOTTOM_LEFT, popup, corner.BOTTOM_RIGHT, null, null,
      overflow.ADJUST_X | overflow.ADJUST_Y);
  assertObjectRoughlyEquals(
      new goog.math.Coordinate(
          testAreaOffset.x + 200 - 75 - scrollbarWidth, testAreaOffset.y + 400),
      goog.style.getPageOffset(popup),
      1);

  goog.style.setPosition(overflowDiv, 400 /* left */, 400 /* top */);
  goog.positioning.positionAtAnchor(
      anchor, corner.BOTTOM_RIGHT, popup, corner.BOTTOM_LEFT, null, null,
      overflow.ADJUST_X | overflow.ADJUST_Y);
  assertObjectRoughlyEquals(
      new goog.math.Coordinate(
          testAreaOffset.x + 400, testAreaOffset.y + 400),
      goog.style.getPageOffset(popup),
      1);

  // No overflow.
  goog.style.setPosition(overflowDiv, 300 - 50 /* left */, 300 /* top */);
  goog.positioning.positionAtAnchor(
      anchor, corner.TOP_LEFT, popup, corner.TOP_RIGHT, null, null,
      overflow.ADJUST_X | overflow.ADJUST_Y);
  assertObjectRoughlyEquals(
      new goog.math.Coordinate(
          testAreaOffset.x + 300 - 50, testAreaOffset.y + 300),
      goog.style.getPageOffset(popup),
      1);
}

function testPositionAtAnchorWithOverflowHiddenParent() {
  var testAreaOffset = goog.style.getPageOffset(testArea);
  window.scrollTo(testAreaOffset.x, testAreaOffset.y);

  var overflowDiv = goog.dom.createElement(goog.dom.TagName.DIV);
  overflowDiv.style.overflow = 'hidden';
  overflowDiv.style.position = 'relative';
  goog.style.setSize(overflowDiv, 200 /* width */, 100 /* height */);

  var anchor = goog.dom.createElement(goog.dom.TagName.DIV);
  anchor.style.position = 'absolute';
  goog.style.setSize(anchor, 50 /* width */, 50 /* height */);
  goog.style.setPosition(anchor, 300 /* left */, 300 /* top */);

  var popup = createPopupDiv(75 /* width */, 50 /* height */);

  goog.dom.append(testArea, overflowDiv, anchor);
  goog.dom.append(overflowDiv, popup);

  // Popup should always be positioned within the overflowDiv
  goog.style.setPosition(overflowDiv, 0 /* left */, 0 /* top */);
  goog.positioning.positionAtAnchor(
      anchor, corner.TOP_LEFT, popup, corner.TOP_RIGHT, null, null,
      overflow.ADJUST_X | overflow.ADJUST_Y);
  assertObjectRoughlyEquals(
      new goog.math.Coordinate(
          testAreaOffset.x + 200 - 75, testAreaOffset.y + 100 - 50),
      goog.style.getPageOffset(popup),
      1);

  goog.style.setPosition(overflowDiv, 400 /* left */, 0 /* top */);
  goog.positioning.positionAtAnchor(
      anchor, corner.TOP_RIGHT, popup, corner.TOP_LEFT, null, null,
      overflow.ADJUST_X | overflow.ADJUST_Y);
  assertObjectRoughlyEquals(
      new goog.math.Coordinate(
          testAreaOffset.x + 400, testAreaOffset.y + 100 - 50),
      goog.style.getPageOffset(popup),
      1);

  goog.style.setPosition(overflowDiv, 0 /* left */, 400 /* top */);
  goog.positioning.positionAtAnchor(
      anchor, corner.BOTTOM_LEFT, popup, corner.BOTTOM_RIGHT, null, null,
      overflow.ADJUST_X | overflow.ADJUST_Y);
  assertObjectRoughlyEquals(
      new goog.math.Coordinate(
          testAreaOffset.x + 200 - 75, testAreaOffset.y + 400),
      goog.style.getPageOffset(popup),
      1);

  goog.style.setPosition(overflowDiv, 400 /* left */, 400 /* top */);
  goog.positioning.positionAtAnchor(
      anchor, corner.BOTTOM_RIGHT, popup, corner.BOTTOM_LEFT, null, null,
      overflow.ADJUST_X | overflow.ADJUST_Y);
  assertObjectRoughlyEquals(
      new goog.math.Coordinate(
          testAreaOffset.x + 400, testAreaOffset.y + 400),
      goog.style.getPageOffset(popup),
      1);

  // No overflow.
  goog.style.setPosition(overflowDiv, 300 - 50 /* left */, 300 /* top */);
  goog.positioning.positionAtAnchor(
      anchor, corner.TOP_LEFT, popup, corner.TOP_RIGHT, null, null,
      overflow.ADJUST_X | overflow.ADJUST_Y);
  assertObjectRoughlyEquals(
      new goog.math.Coordinate(
          testAreaOffset.x + 300 - 50, testAreaOffset.y + 300),
      goog.style.getPageOffset(popup),
      1);
}

function createPopupDiv(width, height) {
  var popupDiv = goog.dom.createElement(goog.dom.TagName.DIV);
  popupDiv.style.position = 'absolute';
  goog.style.setSize(popupDiv, width, height);
  goog.style.setPosition(popupDiv, 0 /* left */, 250 /* top */);
  return popupDiv;
}

function newCoord(x, y) {
  return new goog.math.Coordinate(x, y);
}

function newSize(w, h) {
  return new goog.math.Size(w, h);
}

function newBox(coord, size) {
}
