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

goog.provide('goog.fxTest');
goog.setTestOnly('goog.fxTest');

goog.require('goog.fx.Animation');
goog.require('goog.object');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
// TODO(arv): Add tests for the event dispatches.
// TODO(arv): Add tests for the calculation of the coordinates.

var clock, replacer, anim, anim2;
var Animation = goog.fx.Animation;

function setUpPage() {
  clock = new goog.testing.MockClock(true);
}

function tearDownPage() {
  clock.dispose();
}

function setUp() {
  replacer = new goog.testing.PropertyReplacer();
}

function tearDown() {
  replacer.reset();

  if (anim && anim.dispose) {
    anim.dispose();
  }

  if (anim2 && anim2.dispose) {
    anim2.dispose();
  }
}

function testAnimationConstructor() {
  assertThrows('Should throw since first arg is not an array', function() {
    new Animation(1, [2], 3);
  });
  assertThrows('Should throw since second arg is not an array', function() {
    new Animation([1], 2, 3);
  });
  assertThrows('Should throw since the length are different', function() {
    new Animation([0, 1], [2], 3);
  });
}

function testPlayAndStopDoesNotLeaveAnyActiveAnimations() {
  anim = new Animation([0], [1], 1000);

  assertTrue(
      'There should be no active animations',
      goog.object.isEmpty(goog.fx.anim.activeAnimations_));

  anim.play();
  assertEquals(
      'There should be one active animations', 1,
      goog.object.getCount(goog.fx.anim.activeAnimations_));

  anim.stop();
  assertTrue(
      'There should be no active animations',
      goog.object.isEmpty(goog.fx.anim.activeAnimations_));

  anim.play();
  assertEquals(
      'There should be one active animations', 1,
      goog.object.getCount(goog.fx.anim.activeAnimations_));

  anim.pause();
  assertTrue(
      'There should be no active animations',
      goog.object.isEmpty(goog.fx.anim.activeAnimations_));
}
