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

goog.provide('goog.positioning.MenuAnchoredPositionTest');
goog.setTestOnly('goog.positioning.MenuAnchoredPositionTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.positioning.Corner');
goog.require('goog.positioning.MenuAnchoredPosition');
goog.require('goog.testing.jsunit');

var offscreenAnchor;
var onscreenAnchor;
var customAnchor;
var menu;
var corner = goog.positioning.Corner;
var savedMenuHtml;

function setUp() {
  offscreenAnchor = goog.dom.getElement('offscreen-anchor');
  onscreenAnchor = goog.dom.getElement('onscreen-anchor');
  customAnchor = goog.dom.getElement('custom-anchor');
  customAnchor.style.left = '0';
  customAnchor.style.top = '0';

  menu = goog.dom.getElement('menu');
  savedMenuHtml = menu.innerHTML;
  menu.style.left = '20px';
  menu.style.top = '20px';
}

function tearDown() {
  menu.innerHTML = savedMenuHtml;
}

function testRepositionWithAdjustAndOnscreenAnchor() {
  // Add so many children that it can't possibly fit onscreen.
  for (var i = 0; i < 200; i++) {
    menu.appendChild(goog.dom.createDom(goog.dom.TagName.DIV,
                                        null, 'New Item ' + i));
  }

  var pos = new goog.positioning.MenuAnchoredPosition(
      onscreenAnchor, corner.TOP_LEFT, true);
  pos.reposition(menu, corner.TOP_LEFT);

  var offset = 0;
  assertEquals(offset, menu.offsetTop);
  assertEquals(5, menu.offsetLeft);
}

function testRepositionWithAdjustAndOffscreenAnchor() {
  // This does not get adjusted because it's too far offscreen.
  var pos = new goog.positioning.MenuAnchoredPosition(
      offscreenAnchor, corner.TOP_LEFT, true);
  pos.reposition(menu, corner.TOP_LEFT);

  assertEquals(-1000, menu.offsetTop);
  assertEquals(-1000, menu.offsetLeft);
}

function testRespositionFailoverEvenWhenResizeHeightIsOn() {
  var pos = new goog.positioning.MenuAnchoredPosition(
      onscreenAnchor, corner.TOP_LEFT, true, true);
  pos.reposition(menu, corner.TOP_RIGHT);

  // The menu should not get positioned offscreen.
  assertEquals(5, menu.offsetTop);
  assertEquals(5, menu.offsetLeft);
}

function testRepositionToBottomLeftWhenBottomFailsAndRightFailsAndResizeOn() {
  var pageSize = goog.dom.getViewportSize();
  customAnchor.style.left = (pageSize.width - 10) + 'px';

  // Add so many children that it can't possibly fit onscreen.
  for (var i = 0; i < 200; i++) {
    menu.appendChild(goog.dom.createDom(goog.dom.TagName.DIV,
                                        null, 'New Item ' + i));
  }

  var pos = new goog.positioning.MenuAnchoredPosition(
      customAnchor, corner.TOP_LEFT, true, true);
  pos.reposition(menu, corner.TOP_LEFT);
  assertEquals(menu.offsetLeft + menu.offsetWidth, customAnchor.offsetLeft);
}
