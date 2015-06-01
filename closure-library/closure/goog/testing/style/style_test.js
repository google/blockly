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

goog.provide('goog.testing.styleTest');
goog.setTestOnly('goog.testing.styleTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.style');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.style');

var div1;
var div2;

function setUp() {
  var createDiv = function(color) {
    var div = goog.dom.createDom(
        goog.dom.TagName.DIV,
        {
          style: 'position:absolute;top:0;left:0;' +
              'width:200px;height:100px;' +
              'background-color:' + color,
          innerHTML: 'abc'
        });
    document.body.appendChild(div);
    return div;
  };

  div1 = createDiv('#EEE');
  div2 = createDiv('#F00');
}


function tearDown() {
  if (div1.parentNode)
    div1.parentNode.removeChild(div1);
  if (div2.parentNode)
    div2.parentNode.removeChild(div2);

  div1 = null;
  div2 = null;
}


function testIsVisible() {
  assertTrue('The div should be detected as visible.',
             goog.testing.style.isVisible(div1));

  // Tests with hidden element
  goog.style.setElementShown(div1, false /* display */);
  assertFalse('The div should be detected as not visible.',
              goog.testing.style.isVisible(div1));
}

function testIsOnScreen() {
  var el = document.createElement(goog.dom.TagName.DIV);
  document.body.appendChild(el);

  var dom = goog.dom.getDomHelper(el);
  var winScroll = dom.getDocumentScroll();
  var winSize = dom.getViewportSize();

  el.style.position = 'absolute';
  goog.style.setSize(el, 100, 100);

  goog.style.setPosition(el, winScroll.x, winScroll.y);
  assertTrue('An element fully on the screen is on screen.',
      goog.testing.style.isOnScreen(el));

  goog.style.setPosition(el, winScroll.x - 10, winScroll.y - 10);
  assertTrue(
      'An element partially off the top-left of the screen is on screen.',
      goog.testing.style.isOnScreen(el));

  goog.style.setPosition(el, winScroll.x - 150, winScroll.y - 10);
  assertFalse(
      'An element completely off the top of the screen is off screen.',
      goog.testing.style.isOnScreen(el));

  goog.style.setPosition(el, winScroll.x - 10, winScroll.y - 150);
  assertFalse(
      'An element completely off the left of the screen is off screen.',
      goog.testing.style.isOnScreen(el));

  goog.style.setPosition(el, winScroll.x + winSize.width + 1, winScroll.y);
  assertFalse(
      'An element completely off the right of the screen is off screen.',
      goog.testing.style.isOnScreen(el));

  goog.style.setPosition(el, winScroll.x, winScroll.y + winSize.height + 1);
  assertFalse(
      'An element completely off the bottom of the screen is off screen.',
      goog.testing.style.isOnScreen(el));

  goog.style.setPosition(el, winScroll.x + winSize.width - 10, winScroll.y);
  assertTrue(
      'An element partially off the right of the screen is on screen.',
      goog.testing.style.isOnScreen(el));

  goog.style.setPosition(el, winScroll.x, winScroll.y + winSize.height - 10);
  assertTrue(
      'An element partially off the bottom of the screen is on screen.',
      goog.testing.style.isOnScreen(el));

  var el2 = document.createElement(goog.dom.TagName.DIV);
  el2.style.position = 'absolute';
  goog.style.setSize(el2, 100, 100);
  goog.style.setPosition(el2, winScroll.x, winScroll.y);
  assertFalse('An element not in the DOM is not on screen.',
              goog.testing.style.isOnScreen(el2));
}

function testHasVisibleDimensions() {
  goog.style.setSize(div1, 0, 0);
  assertFalse('0x0 should not be considered visible dimensions.',
              goog.testing.style.hasVisibleDimensions(div1));
  goog.style.setSize(div1, 10, 0);
  assertFalse('10x0 should not be considered visible dimensions.',
              goog.testing.style.hasVisibleDimensions(div1));
  goog.style.setSize(div1, 10, 10);
  assertTrue('10x10 should be considered visible dimensions.',
             goog.testing.style.hasVisibleDimensions(div1));
  goog.style.setSize(div1, 0, 10);
  assertFalse('0x10 should not be considered visible dimensions.',
              goog.testing.style.hasVisibleDimensions(div1));
}

function testIntersects() {
  // No intersection
  goog.style.setPosition(div1, 0, 0);
  goog.style.setPosition(div2, 500, 500);
  assertFalse('The divs should not be determined to itersect.',
              goog.testing.style.intersects(div1, div2));

  // Some intersection
  goog.style.setPosition(div1, 0, 0);
  goog.style.setPosition(div2, 50, 50);
  assertTrue('The divs should be determined to itersect.',
             goog.testing.style.intersects(div1, div2));

  // Completely superimposed.
  goog.style.setPosition(div1, 0, 0);
  goog.style.setPosition(div2, 0, 0);
  assertTrue('The divs should be determined to itersect.',
             goog.testing.style.intersects(div1, div2));
}
