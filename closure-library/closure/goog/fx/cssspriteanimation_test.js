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

goog.provide('goog.fx.CssSpriteAnimationTest');
goog.setTestOnly('goog.fx.CssSpriteAnimationTest');

goog.require('goog.fx.CssSpriteAnimation');
goog.require('goog.math.Box');
goog.require('goog.math.Size');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');

var el;
var size;
var box;
var time = 1000;
var anim, clock;

function setUpPage() {
  clock = new goog.testing.MockClock(true);
  el = document.getElementById('test');
  size = new goog.math.Size(10, 10);
  box = new goog.math.Box(0, 10, 100, 0);
}

function tearDownPage() {
  clock.dispose();
}

function tearDown() {
  anim.clearSpritePosition();
  anim.dispose();
}

function assertBackgroundPosition(x, y) {
  if (typeof el.style.backgroundPositionX != 'undefined') {
    assertEquals(x + 'px', el.style.backgroundPositionX);
    assertEquals(y + 'px', el.style.backgroundPositionY);
  } else {
    var bgPos = el.style.backgroundPosition;
    var message = 'Expected <' + x + 'px ' + y + 'px>, found <' + bgPos + '>';
    if (x == y) {
      // when x and y are the same the browser sometimes collapse the prop
      assertTrue(message,
                 bgPos == x || // in case of 0 without a unit
                 bgPos == x + 'px' ||
                 bgPos == x + ' ' + y ||
                 bgPos == x + 'px ' + y + 'px');
    } else {
      assertTrue(message,
                 bgPos == x + ' ' + y ||
                 bgPos == x + 'px ' + y ||
                 bgPos == x + ' ' + y + 'px' ||
                 bgPos == x + 'px ' + y + 'px');
    }
  }
}

function testAnimation() {
  anim = new goog.fx.CssSpriteAnimation(el, size, box, time);
  anim.play();

  assertBackgroundPosition(0, 0);

  clock.tick(5);
  assertBackgroundPosition(0, 0);

  clock.tick(95);
  assertBackgroundPosition(0, -10);

  clock.tick(100);
  assertBackgroundPosition(0, -20);

  clock.tick(300);
  assertBackgroundPosition(0, -50);

  clock.tick(400);
  assertBackgroundPosition(0, -90);

  // loop around to starting position
  clock.tick(100);
  assertBackgroundPosition(0, 0);

  assertTrue(anim.isPlaying());
  assertFalse(anim.isStopped());

  clock.tick(100);
  assertBackgroundPosition(0, -10);
}


function testAnimation_disableLoop() {
  anim = new goog.fx.CssSpriteAnimation(el, size, box, time, undefined,
      true /* opt_disableLoop */);
  anim.play();

  assertBackgroundPosition(0, 0);

  clock.tick(5);
  assertBackgroundPosition(0, 0);

  clock.tick(95);
  assertBackgroundPosition(0, -10);

  clock.tick(100);
  assertBackgroundPosition(0, -20);

  clock.tick(300);
  assertBackgroundPosition(0, -50);

  clock.tick(400);
  assertBackgroundPosition(0, -90);

  // loop around to starting position
  clock.tick(100);
  assertBackgroundPosition(0, -90);

  assertTrue(anim.isStopped());
  assertFalse(anim.isPlaying());

  clock.tick(100);
  assertBackgroundPosition(0, -90);
}


function testClearSpritePosition() {
  anim = new goog.fx.CssSpriteAnimation(el, size, box, time);
  anim.play();

  assertBackgroundPosition(0, 0);

  clock.tick(100);
  assertBackgroundPosition(0, -10);
  anim.clearSpritePosition();

  if (typeof el.style.backgroundPositionX != 'undefined') {
    assertEquals('', el.style.backgroundPositionX);
    assertEquals('', el.style.backgroundPositionY);
  }

  assertEquals('', el.style.backgroundPosition);
}
