// Copyright 2012 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.style.bidiTest');
goog.setTestOnly('goog.style.bidiTest');

goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.style.bidi');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

// Updates the calculated metrics.
function updateInfo() {
  var element = document.getElementById('scrolledElementRtl');
  document.getElementById('elementScrollLeftRtl').innerHTML =
      element.offsetParent.scrollLeft;
  document.getElementById('bidiOffsetStartRtl').innerHTML =
      goog.style.bidi.getOffsetStart(element);
  document.getElementById('bidiScrollLeftRtl').innerHTML =
      goog.style.bidi.getScrollLeft(element.offsetParent);

  element = document.getElementById('scrolledElementLtr');
  document.getElementById('elementScrollLeftLtr').innerHTML =
      element.offsetParent.scrollLeft;
  document.getElementById('bidiOffsetStartLtr').innerHTML =
      goog.style.bidi.getOffsetStart(element);
  document.getElementById('bidiScrollLeftLtr').innerHTML =
      goog.style.bidi.getScrollLeft(element.offsetParent);
}

function setUpPage() {
  updateInfo();
}

function tearDown() {
  document.documentElement.dir = 'ltr';
  document.body.dir = 'ltr';
}

function testGetOffsetStart() {
  var elm = document.getElementById('scrolledElementRtl');
  assertEquals(elm.style['right'], goog.style.bidi.getOffsetStart(elm) + 'px');
  elm = document.getElementById('scrolledElementLtr');
  assertEquals(elm.style['left'], goog.style.bidi.getOffsetStart(elm) + 'px');
}

function testSetScrollOffsetRtl() {
  var scrollElm = document.getElementById('scrollDivRtl');
  var scrolledElm = document.getElementById('scrolledElementRtl');
  var originalDistance =
      goog.style.getRelativePosition(scrolledElm, document.body).x;
  var scrollAndAssert = function(pixels) {
    goog.style.bidi.setScrollOffset(scrollElm, pixels);
    assertEquals(originalDistance + pixels,
        goog.style.getRelativePosition(scrolledElm, document.body).x);
  };
  scrollAndAssert(0);
  scrollAndAssert(50);
  scrollAndAssert(100);
  scrollAndAssert(150);
  scrollAndAssert(155);
  scrollAndAssert(0);
}

function testSetScrollOffsetLtr() {
  var scrollElm = document.getElementById('scrollDivLtr');
  var scrolledElm = document.getElementById('scrolledElementLtr');
  var originalDistance =
      goog.style.getRelativePosition(scrolledElm, document.body).x;
  var scrollAndAssert = function(pixels) {
    goog.style.bidi.setScrollOffset(scrollElm, pixels);
    assertEquals(originalDistance - pixels,
        goog.style.getRelativePosition(scrolledElm, document.body).x);
  };
  scrollAndAssert(0);
  scrollAndAssert(50);
  scrollAndAssert(100);
  scrollAndAssert(150);
  scrollAndAssert(155);
  scrollAndAssert(0);
}

function testFixedBodyChildLtr() {
  var bodyChild = document.getElementById('bodyChild');
  assertEquals(goog.userAgent.GECKO ? document.body : null,
      bodyChild.offsetParent);
  assertEquals(60, goog.style.bidi.getOffsetStart(bodyChild));
}

function testFixedBodyChildRtl() {
  document.documentElement.dir = 'rtl';
  document.body.dir = 'rtl';

  var bodyChild = document.getElementById('bodyChild');
  assertEquals(goog.userAgent.GECKO ? document.body : null,
      bodyChild.offsetParent);

  var expectedOffsetStart =
      goog.dom.getViewportSize().width - 60 - bodyChild.offsetWidth;

  // Gecko seems to also add in the marginbox for the body.
  // It's not really clear to me if this is true in the general case,
  // or just under certain conditions.
  if (goog.userAgent.GECKO) {
    var marginBox = goog.style.getMarginBox(document.body);
    expectedOffsetStart -= (marginBox.left + marginBox.right);
  }

  assertEquals(expectedOffsetStart,
      goog.style.bidi.getOffsetStart(bodyChild));
}

function testGetScrollLeftRTL() {
  var scrollLeftDiv = document.getElementById('scrollLeftRtl');
  scrollLeftDiv.style.overflow = 'visible';
  assertEquals(0, goog.style.bidi.getScrollLeft(scrollLeftDiv));
  scrollLeftDiv.style.overflow = 'hidden';
  assertEquals(0, goog.style.bidi.getScrollLeft(scrollLeftDiv));
  scrollLeftDiv.style.overflow = 'scroll';
  assertEquals(0, goog.style.bidi.getScrollLeft(scrollLeftDiv));
  scrollLeftDiv.style.overflow = 'auto';
  assertEquals(0, goog.style.bidi.getScrollLeft(scrollLeftDiv));
}
