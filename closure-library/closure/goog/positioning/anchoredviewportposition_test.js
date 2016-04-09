// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.positioning.AnchoredViewportPositionTest');
goog.setTestOnly('goog.positioning.AnchoredViewportPositionTest');

goog.require('goog.dom');
goog.require('goog.math.Box');
goog.require('goog.positioning.AnchoredViewportPosition');
goog.require('goog.positioning.Corner');
goog.require('goog.positioning.OverflowStatus');
goog.require('goog.style');
goog.require('goog.testing.jsunit');

var frame, doc, dom, viewportSize, anchor, popup;
var corner = goog.positioning.Corner;

function setUp() {
  frame = document.getElementById('frame1');
  doc = goog.dom.getFrameContentDocument(frame);
  dom = goog.dom.getDomHelper(doc);
  viewportSize = dom.getViewportSize();
  anchor = dom.getElement('anchor');
  popup = dom.getElement('popup');
  goog.style.setSize(popup, 20, 20);
}

// The frame has enough space at the bottom of the anchor.
function testRepositionBottom() {
  var avp = new goog.positioning.AnchoredViewportPosition(
      anchor, corner.BOTTOM_LEFT, false);
  goog.style.setSize(anchor, 100, 100);
  goog.style.setPosition(anchor, 0, 0);
  assertTrue(viewportSize.height >= 100 + 20);

  avp.reposition(popup, corner.TOP_LEFT);
  var anchorRect = goog.style.getBounds(anchor);
  assertEquals(
      anchorRect.top + anchorRect.height, goog.style.getPageOffset(popup).y);
}

// No enough space at the bottom, but at the top.
function testRepositionTop() {
  var avp = new goog.positioning.AnchoredViewportPosition(
      anchor, corner.BOTTOM_LEFT, false);
  var newTop = viewportSize.height - 100;
  goog.style.setSize(anchor, 100, 100);
  goog.style.setPosition(anchor, 50, newTop);
  assertTrue(newTop >= 20);

  avp.reposition(popup, corner.TOP_LEFT);
  anchorRect = goog.style.getBounds(anchor);
  var popupRect = goog.style.getBounds(popup);
  assertEquals(anchorRect.top, popupRect.top + popupRect.height);
}

// Not enough space either at the bottom or right but there is enough space at
// top left.
function testRepositionBottomRight() {
  var avp = new goog.positioning.AnchoredViewportPosition(
      anchor, corner.BOTTOM_RIGHT, false);
  goog.style.setSize(anchor, 100, 100);
  goog.style.setPosition(
      anchor, viewportSize.width - 110, viewportSize.height - 110);

  avp.reposition(popup, corner.TOP_LEFT);
  anchorRect = goog.style.getBounds(anchor);
  var popupRect = goog.style.getBounds(popup);
  assertEquals(anchorRect.top, popupRect.top + popupRect.height);
  assertEquals(anchorRect.left, popupRect.left + popupRect.width);
}

// Enough space at neither the bottom nor the top.  Adjustment flag is false.
function testRepositionNoSpaceWithoutAdjustment() {
  var avp = new goog.positioning.AnchoredViewportPosition(
      anchor, corner.BOTTOM_LEFT, false);
  goog.style.setPosition(anchor, 50, 10);
  goog.style.setSize(anchor, 100, viewportSize.height - 20);

  avp.reposition(popup, corner.TOP_LEFT);
  anchorRect = goog.style.getBounds(anchor);
  popupRect = goog.style.getBounds(popup);
  assertEquals(anchorRect.top + anchorRect.height, popupRect.top);
  assertTrue(popupRect.top + popupRect.height > viewportSize.height);
}

// Enough space at neither the bottom nor the top.  Adjustment flag is true.
function testRepositionNoSpaceWithAdjustment() {
  var avp = new goog.positioning.AnchoredViewportPosition(
      anchor, corner.BOTTOM_LEFT, true);
  goog.style.setPosition(anchor, 50, 10);
  goog.style.setSize(anchor, 100, viewportSize.height - 20);

  avp.reposition(popup, corner.TOP_LEFT);
  anchorRect = goog.style.getBounds(anchor);
  popupRect = goog.style.getBounds(popup);
  assertTrue(anchorRect.top + anchorRect.height > popupRect.top);
  assertEquals(viewportSize.height, popupRect.top + popupRect.height);
}

function testAdjustCorner() {
  var avp =
      new goog.positioning.AnchoredViewportPosition(anchor, corner.BOTTOM_LEFT);
  assertEquals(corner.BOTTOM_LEFT, avp.adjustCorner(0, corner.BOTTOM_LEFT));
  assertEquals(
      corner.BOTTOM_RIGHT,
      avp.adjustCorner(
          goog.positioning.OverflowStatus.FAILED_HORIZONTAL,
          corner.BOTTOM_LEFT));
  assertEquals(
      corner.TOP_LEFT,
      avp.adjustCorner(
          goog.positioning.OverflowStatus.FAILED_VERTICAL, corner.BOTTOM_LEFT));
  assertEquals(
      corner.TOP_RIGHT,
      avp.adjustCorner(
          goog.positioning.OverflowStatus.FAILED_VERTICAL |
              goog.positioning.OverflowStatus.FAILED_HORIZONTAL,
          corner.BOTTOM_LEFT));
}

// No space to fit, so uses fallback.
function testOverflowConstraint() {
  var tinyBox = new goog.math.Box(0, 0, 0, 0);
  var avp = new goog.positioning.AnchoredViewportPosition(
      anchor, corner.BOTTOM_LEFT, false, tinyBox);
  assertEquals(tinyBox, avp.getOverflowConstraint());

  goog.style.setSize(anchor, 50, 50);
  goog.style.setPosition(anchor, 80, 80);
  avp.reposition(popup, corner.TOP_LEFT);

  anchorRect = goog.style.getBounds(anchor);
  popupRect = goog.style.getBounds(popup);
  assertEquals(anchorRect.left, popupRect.left);
  assertEquals(anchorRect.top + anchorRect.height, popupRect.top);
}

// Initially no space to fit above, then changes to have room.
function testChangeOverflowConstraint() {
  var tinyBox = new goog.math.Box(0, 0, 0, 0);
  var avp = new goog.positioning.AnchoredViewportPosition(
      anchor, corner.BOTTOM_LEFT, false, tinyBox);
  assertEquals(tinyBox, avp.getOverflowConstraint());

  goog.style.setSize(anchor, 50, 50);
  goog.style.setPosition(anchor, 80, 80);

  avp.reposition(popup, corner.TOP_LEFT);
  popupRect = goog.style.getBounds(popup);
  assertNotEquals(60, popupRect.top);

  var movedBox = new goog.math.Box(60, 100, 100, 60);
  avp.setOverflowConstraint(movedBox);
  assertEquals(movedBox, avp.getOverflowConstraint());

  avp.reposition(popup, corner.TOP_LEFT);
  popupRect = goog.style.getBounds(popup);
  assertEquals(80, popupRect.left);
  assertEquals(60, popupRect.top);
}
