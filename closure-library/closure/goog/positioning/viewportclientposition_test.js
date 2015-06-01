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

goog.provide('goog.positioning.ViewportClientPositionTest');
goog.setTestOnly('goog.positioning.ViewportClientPositionTest');

goog.require('goog.dom');
goog.require('goog.positioning.Corner');
goog.require('goog.positioning.Overflow');
goog.require('goog.positioning.ViewportClientPosition');
goog.require('goog.style');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

var viewportSize, anchor, popup, dom, frameRect;
var corner = goog.positioning.Corner;

// Allow positions to be off by one in gecko as it reports scrolling
// offsets in steps of 2.
var ALLOWED_OFFSET = goog.userAgent.GECKO ? 1 : 0;


function setUp() {
  var frame = document.getElementById('frame1');
  var doc = goog.dom.getFrameContentDocument(frame);

  dom = goog.dom.getDomHelper(doc);
  viewportSize = dom.getViewportSize();
  anchor = dom.getElement('anchor');
  popup = dom.getElement('popup');
  popup.style.overflowY = 'visible';
  goog.style.setSize(popup, 20, 20);
  frameRect = goog.style.getVisibleRectForElement(doc.body);
}


function testPositionAtCoordinateTopLeft() {
  var pos = new goog.positioning.ViewportClientPosition(100, 100);
  pos.reposition(popup, corner.TOP_LEFT);

  var offset = goog.style.getPageOffset(popup);
  assertEquals('Left edge of popup should be at specified x coordinate.',
               100,
               offset.x);
  assertEquals('Top edge of popup should be at specified y coordinate.',
               100,
               offset.y);
}


function testPositionAtCoordinateBottomRight() {
  var pos = new goog.positioning.ViewportClientPosition(100, 100);
  pos.reposition(popup, corner.BOTTOM_RIGHT);

  var bounds = goog.style.getBounds(popup);
  assertEquals('Right edge of popup should be at specified x coordinate.',
               100,
               bounds.left + bounds.width);
  assertEquals('Bottom edge of popup should be at specified x coordinate.',
               100,
               bounds.top + bounds.height);
}


function testPositionAtCoordinateTopLeftWithScroll() {
  dom.getDocument().body.style.paddingTop = '300px';
  dom.getDocument().body.style.height = '3000px';
  dom.getDocumentScrollElement().scrollTop = 50;
  dom.getDocument().body.scrollTop = 50;

  var pos = new goog.positioning.ViewportClientPosition(0, 0);
  pos.reposition(popup, corner.TOP_LEFT);

  var offset = goog.style.getPageOffset(popup);
  assertEquals('Left edge of popup should be at specified x coordinate.',
               0,
               offset.x);
  assertTrue('Top edge of popup should be at specified y coordinate ' +
             'adjusted for scroll.',
             Math.abs(offset.y - 50) <= ALLOWED_OFFSET);

  dom.getDocument().body.style.paddingLeft = '1000px';
  dom.getDocumentScrollElement().scrollLeft = 500;

  pos.reposition(popup, corner.TOP_LEFT);
  offset = goog.style.getPageOffset(popup);
  assertTrue('Left edge of popup should be at specified x coordinate ' +
             'adjusted for scroll.',
             Math.abs(offset.x - 500) <= ALLOWED_OFFSET);

  dom.getDocumentScrollElement().scrollLeft = 0;
  dom.getDocumentScrollElement().scrollTop = 0;
  dom.getDocument().body.style.paddingLeft = '';
  dom.getDocument().body.style.paddingTop = '';

  pos.reposition(popup, corner.TOP_LEFT);
  offset = goog.style.getPageOffset(popup);
  assertEquals('Left edge of popup should be at specified x coordinate.',
               0,
               offset.x);
  assertEquals('Top edge of popup should be at specified y coordinate.',
               0,
               offset.y);
}


function testOverflowRightFlipHor() {
  var pos = new goog.positioning.ViewportClientPosition(frameRect.right,
                                                        100);
  pos.reposition(popup, corner.TOP_LEFT);

  var offset = goog.style.getPageOffset(popup);
  assertEquals('Left edge of popup should have been adjusted so that it ' +
      'fits inside the viewport.',
               frameRect.right - popup.offsetWidth,
               offset.x);
  assertEquals('Top edge of popup should be at specified y coordinate.',
               100,
               offset.y);
}


function testOverflowTopFlipVer() {
  var pos = new goog.positioning.ViewportClientPosition(100, 0);
  pos.reposition(popup, corner.TOP_RIGHT);

  var offset = goog.style.getPageOffset(popup);
  assertEquals('Left edge of popup should be at specified x coordinate.',
               80,
               offset.x);
  assertEquals('Top edge of popup should have been adjusted so that it ' +
      'fits inside the viewport.',
               0,
               offset.y);
}


function testOverflowBottomRightFlipBoth() {
  var pos = new goog.positioning.ViewportClientPosition(frameRect.right,
                                                        frameRect.bottom);
  pos.reposition(popup, corner.TOP_LEFT);

  var offset = goog.style.getPageOffset(popup);
  assertEquals('Left edge of popup should have been adjusted so that it ' +
      'fits inside the viewport.',
               frameRect.right - popup.offsetWidth,
               offset.x);
  assertEquals('Top edge of popup should have been adjusted so that it ' +
      'fits inside the viewport.',
               frameRect.bottom - popup.offsetHeight,
               offset.y);
}


function testLastRespotOverflow() {
  var large = 2000;
  goog.style.setSize(popup, 20, large);
  popup.style.overflowY = 'auto';

  var pos = new goog.positioning.ViewportClientPosition(0, 0);
  pos.reposition(popup, corner.TOP_LEFT);

  assertEquals(large, popup.offsetHeight);
  pos.setLastResortOverflow(goog.positioning.Overflow.RESIZE_HEIGHT);
  pos.reposition(popup, corner.TOP_LEFT);
  assertNotEquals(large, popup.offsetHeight);
}
