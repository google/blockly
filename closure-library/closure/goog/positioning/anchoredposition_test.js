// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.positioning.AnchoredPositionTest');
goog.setTestOnly('goog.positioning.AnchoredPositionTest');

goog.require('goog.dom');
goog.require('goog.positioning.AnchoredPosition');
goog.require('goog.positioning.Corner');
goog.require('goog.positioning.Overflow');
goog.require('goog.style');
goog.require('goog.testing.jsunit');

var frame, doc, dom, viewportSize, anchor, popup;
var corner = goog.positioning.Corner;
var popupLength = 20;
var anchorLength = 100;

function setUp() {
  frame = document.getElementById('frame1');
  doc = goog.dom.getFrameContentDocument(frame);
  dom = goog.dom.getDomHelper(doc);
  viewportSize = dom.getViewportSize();
  anchor = dom.getElement('anchor');
  popup = dom.getElement('popup');
  goog.style.setSize(popup, popupLength, popupLength);
  goog.style.setPosition(popup, popupLength, popupLength);
  goog.style.setSize(anchor, anchorLength, anchorLength);
}

// No enough space at the bottom and no overflow adjustment.
function testRepositionWithDefaultOverflow() {
  var avp = new goog.positioning.AnchoredPosition(anchor, corner.BOTTOM_LEFT);
  var newTop = viewportSize.height - anchorLength;
  goog.style.setPosition(anchor, 50, newTop);
  var anchorRect = goog.style.getBounds(anchor);

  avp.reposition(popup, corner.TOP_LEFT);
  var popupRect = goog.style.getBounds(popup);
  assertEquals(anchorRect.top + anchorRect.height, popupRect.top);
}

// No enough space at the bottom and ADJUST_Y overflow adjustment.
function testRepositionWithOverflow() {
  var avp = new goog.positioning.AnchoredPosition(
      anchor, corner.BOTTOM_LEFT, goog.positioning.Overflow.ADJUST_Y);
  var newTop = viewportSize.height - anchorLength;
  goog.style.setPosition(anchor, 50, newTop);
  var anchorRect = goog.style.getBounds(anchor);

  avp.reposition(popup, corner.TOP_LEFT);
  var popupRect = goog.style.getBounds(popup);
  assertEquals(
      anchorRect.top + anchorRect.height, popupRect.top + popupRect.height);
}
