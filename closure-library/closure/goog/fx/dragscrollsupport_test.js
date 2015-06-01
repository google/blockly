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

goog.provide('goog.fx.DragScrollSupportTest');
goog.setTestOnly('goog.fx.DragScrollSupportTest');

goog.require('goog.fx.DragScrollSupport');
goog.require('goog.math.Coordinate');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');

var vContainerDiv;
var vContentDiv;
var hContainerDiv;
var hContentDiv;
var clock;

function setUpPage() {
  vContainerDiv = document.getElementById('vContainerDiv');
  vContentDiv = document.getElementById('vContentDiv');
  hContainerDiv = document.getElementById('hContainerDiv');
  hContentDiv = document.getElementById('hContentDiv');
}

function setUp() {
  clock = new goog.testing.MockClock(true);
}


function tearDown() {
  clock.dispose();
}


function testDragZeroMarginDivVContainer() {
  var dsc = new goog.fx.DragScrollSupport(vContainerDiv);

  // Set initial scroll state.
  var scrollTop = 50;
  vContainerDiv.scrollTop = scrollTop;

  goog.testing.events.fireMouseMoveEvent(vContainerDiv,
      new goog.math.Coordinate(50, 20 + 50));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertEquals('Mousing inside the vContainer should not trigger scrolling.',
      scrollTop, vContainerDiv.scrollTop);
  assertEquals('Scroll timer should not tick yet', 0, clock.getTimeoutsMade());

  scrollTop = vContainerDiv.scrollTop;
  goog.testing.events.fireMouseMoveEvent(vContainerDiv,
      new goog.math.Coordinate(50, 10));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertTrue('Mousing above the vContainer should trigger scrolling up.',
      scrollTop > vContainerDiv.scrollTop);
  scrollTop = vContainerDiv.scrollTop;
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertTrue('Mousing above the vContainer should trigger scrolling up.',
      scrollTop > vContainerDiv.scrollTop);

  scrollTop = vContainerDiv.scrollTop;
  goog.testing.events.fireMouseMoveEvent(vContainerDiv,
      new goog.math.Coordinate(50, 20 + 110));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertTrue('Mousing below the vContainer should trigger scrolling down.',
      scrollTop < vContainerDiv.scrollTop);
  scrollTop = vContainerDiv.scrollTop;
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertTrue('Mousing below the vContainer should trigger scrolling down.',
      scrollTop < vContainerDiv.scrollTop);

  scrollTop = vContainerDiv.scrollTop;
  goog.testing.events.fireMouseMoveEvent(vContainerDiv,
      new goog.math.Coordinate(50, 20 + 50));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertEquals('Mousing inside the vContainer should stop scrolling.',
      scrollTop, vContainerDiv.scrollTop);

  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);

  dsc.dispose();
}

function testDragZeroMarginDivHContainer() {
  var dsc = new goog.fx.DragScrollSupport(hContainerDiv);

  // Set initial scroll state.
  var scrollLeft = 50;
  hContainerDiv.scrollLeft = scrollLeft;

  goog.testing.events.fireMouseMoveEvent(hContainerDiv,
      new goog.math.Coordinate(200 + 50, 20 + 50));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertEquals('Mousing inside the hContainer should not trigger scrolling.',
      scrollLeft, hContainerDiv.scrollLeft);
  assertEquals('Scroll timer should not tick yet', 0, clock.getTimeoutsMade());

  scrollLeft = hContainerDiv.scrollLeft;
  goog.testing.events.fireMouseMoveEvent(hContainerDiv,
      new goog.math.Coordinate(200 - 10, 20 + 50));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertTrue('Mousing left of the hContainer should trigger scrolling left.',
      scrollLeft > hContainerDiv.scrollLeft);
  scrollLeft = hContainerDiv.scrollLeft;
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertTrue('Mousing left of the hContainer should trigger scrolling left.',
      scrollLeft > hContainerDiv.scrollLeft);

  scrollLeft = hContainerDiv.scrollLeft;
  goog.testing.events.fireMouseMoveEvent(hContainerDiv,
      new goog.math.Coordinate(200 + 110, 20 + 50));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertTrue('Mousing right of the hContainer should trigger scrolling right.',
      scrollLeft < hContainerDiv.scrollLeft);
  scrollLeft = hContainerDiv.scrollLeft;
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertTrue('Mousing right of the hContainer should trigger scrolling right.',
      scrollLeft < hContainerDiv.scrollLeft);

  scrollLeft = hContainerDiv.scrollLeft;
  goog.testing.events.fireMouseMoveEvent(hContainerDiv,
      new goog.math.Coordinate(200 + 50, 20 + 50));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertEquals('Mousing inside the hContainer should stop scrolling.',
      scrollLeft, hContainerDiv.scrollLeft);

  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);

  dsc.dispose();
}


function testDragMarginDivVContainer() {
  var dsc = new goog.fx.DragScrollSupport(vContainerDiv, 20);

  // Set initial scroll state.
  var scrollTop = 50;
  vContainerDiv.scrollTop = scrollTop;

  goog.testing.events.fireMouseMoveEvent(vContainerDiv,
      new goog.math.Coordinate(50, 20 + 50));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertEquals('Mousing inside the vContainer should not trigger scrolling.',
      scrollTop, vContainerDiv.scrollTop);
  assertEquals('Scroll timer should not tick yet', 0, clock.getTimeoutsMade());

  scrollTop = vContainerDiv.scrollTop;
  goog.testing.events.fireMouseMoveEvent(vContainerDiv,
      new goog.math.Coordinate(50, 30));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertTrue('Mousing above the margin should trigger scrolling up.',
      scrollTop > vContainerDiv.scrollTop);
  scrollTop = vContainerDiv.scrollTop;
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertTrue('Mousing above the margin should trigger scrolling up.',
      scrollTop > vContainerDiv.scrollTop);

  scrollTop = vContainerDiv.scrollTop;
  goog.testing.events.fireMouseMoveEvent(vContainerDiv,
      new goog.math.Coordinate(50, 20 + 90));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertTrue('Mousing below the margin should trigger scrolling down.',
      scrollTop < vContainerDiv.scrollTop);
  scrollTop = vContainerDiv.scrollTop;
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertTrue('Mousing above the margin should trigger scrolling down.',
      scrollTop < vContainerDiv.scrollTop);

  scrollTop = vContainerDiv.scrollTop;
  goog.testing.events.fireMouseMoveEvent(vContainerDiv,
      new goog.math.Coordinate(50, 20 + 50));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertEquals('Mousing inside the margin should stop scrolling.',
      scrollTop, vContainerDiv.scrollTop);

  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);

  assertEquals('Scroll timer should have ticked 5 times',
      5, clock.getTimeoutsMade());

  dsc.dispose();
}


function testDragMarginScrollConstrainedDivVContainer() {
  var dsc = new goog.fx.DragScrollSupport(vContainerDiv, 20);
  dsc.setConstrainScroll(true);

  // Set initial scroll state.
  var scrollTop = 50;
  vContainerDiv.scrollTop = scrollTop;

  goog.testing.events.fireMouseMoveEvent(vContainerDiv,
      new goog.math.Coordinate(50, 20 + 50));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertEquals('Mousing inside the vContainer should not trigger scrolling.',
      scrollTop, vContainerDiv.scrollTop);
  assertEquals('Scroll timer should not tick yet', 0, clock.getTimeoutsMade());

  scrollTop = vContainerDiv.scrollTop;
  goog.testing.events.fireMouseMoveEvent(vContainerDiv,
      new goog.math.Coordinate(50, 30));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertTrue('Mousing above the margin should trigger scrolling up.',
      scrollTop > vContainerDiv.scrollTop);
  scrollTop = vContainerDiv.scrollTop;
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertTrue('Mousing above the margin should trigger scrolling up.',
      scrollTop > vContainerDiv.scrollTop);

  scrollTop = vContainerDiv.scrollTop;
  goog.testing.events.fireMouseMoveEvent(vContainerDiv,
      new goog.math.Coordinate(50, 20 + 90));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertTrue('Mousing below the margin should trigger scrolling down.',
      scrollTop < vContainerDiv.scrollTop);
  scrollTop = vContainerDiv.scrollTop;
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertTrue('Mousing above the margin should trigger scrolling down.',
      scrollTop < vContainerDiv.scrollTop);

  scrollTop = vContainerDiv.scrollTop;
  goog.testing.events.fireMouseMoveEvent(vContainerDiv,
      new goog.math.Coordinate(50, 20 + 50));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertEquals('Mousing inside the margin should stop scrolling.',
      scrollTop, vContainerDiv.scrollTop);

  scrollTop = vContainerDiv.scrollTop;
  goog.testing.events.fireMouseMoveEvent(vContainerDiv,
      new goog.math.Coordinate(50, 10));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertEquals('Mousing above the vContainer should not trigger scrolling up.',
      scrollTop, vContainerDiv.scrollTop);
  scrollTop = vContainerDiv.scrollTop;
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertEquals('Mousing above the vContainer should not trigger scrolling up.',
      scrollTop, vContainerDiv.scrollTop);

  scrollTop = vContainerDiv.scrollTop;
  goog.testing.events.fireMouseMoveEvent(vContainerDiv,
      new goog.math.Coordinate(50, 20 + 110));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertEquals(
      'Mousing below the vContainer should not trigger scrolling down.',
      scrollTop, vContainerDiv.scrollTop);
  scrollTop = vContainerDiv.scrollTop;
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertEquals(
      'Mousing below the vContainer should not trigger scrolling down.',
      scrollTop, vContainerDiv.scrollTop);

  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);

  scrollTop = vContainerDiv.scrollTop;
  goog.testing.events.fireMouseMoveEvent(vContainerDiv,
      new goog.math.Coordinate(150, 20 + 90));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertEquals('Mousing to the right of the vContainer should not trigger ' +
      'scrolling up.', scrollTop, vContainerDiv.scrollTop);
  scrollTop = vContainerDiv.scrollTop;
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertEquals('Mousing to the right of the vContainer should not trigger ' +
      'scrolling up.', scrollTop, vContainerDiv.scrollTop);

  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);

  assertEquals('Scroll timer should have ticked 5 times',
      5, clock.getTimeoutsMade());

  dsc.dispose();
}


function testSetHorizontalScrolling() {
  var dsc = new goog.fx.DragScrollSupport(hContainerDiv);
  dsc.setHorizontalScrolling(false);

  // Set initial scroll state.
  var scrollLeft = 50;
  hContainerDiv.scrollLeft = scrollLeft;

  goog.testing.events.fireMouseMoveEvent(hContainerDiv,
      new goog.math.Coordinate(200 - 10, 20 + 50));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertEquals('Horizontal scrolling should be turned off',
      0, clock.getTimeoutsMade());

  goog.testing.events.fireMouseMoveEvent(hContainerDiv,
      new goog.math.Coordinate(200 + 110, 20 + 50));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertEquals('Horizontal scrolling should be turned off',
      0, clock.getTimeoutsMade());

  dsc.setHorizontalScrolling(true);
  scrollLeft = hContainerDiv.scrollLeft;
  goog.testing.events.fireMouseMoveEvent(hContainerDiv,
      new goog.math.Coordinate(200 - 10, 20 + 50));
  clock.tick(goog.fx.DragScrollSupport.TIMER_STEP_ + 1);
  assertTrue('Mousing left of the hContainer should trigger scrolling left.',
      scrollLeft > hContainerDiv.scrollLeft);

  dsc.dispose();
}
