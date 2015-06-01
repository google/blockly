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

goog.provide('goog.fx.AnimationTest');
goog.setTestOnly('goog.fx.AnimationTest');

goog.require('goog.events');
goog.require('goog.fx.Animation');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');

var clock;

function setUpPage() {
  clock = new goog.testing.MockClock(true);
}

function tearDownPage() {
  clock.dispose();
}

function testPauseLogic() {
  var anim = new goog.fx.Animation([], [], 3000);
  var nFrames = 0;
  goog.events.listen(anim, goog.fx.Animation.EventType.ANIMATE, function(e) {
    assertRoughlyEquals(e.progress, progress, 1e-6);
    nFrames++;
  });
  goog.events.listen(anim, goog.fx.Animation.EventType.END, function(e) {
    nFrames++;
  });
  var nSteps = 10;
  for (var i = 0; i < nSteps; i++) {
    progress = i / (nSteps - 1);
    anim.setProgress(progress);
    anim.play();
    anim.pause();
  }
  assertEquals(nSteps, nFrames);
}

function testPauseOffset() {
  var anim = new goog.fx.Animation([0], [1000], 1000);
  anim.play();

  assertEquals(0, anim.coords[0]);
  assertRoughlyEquals(0, anim.progress, 1e-4);

  clock.tick(300);

  assertEquals(300, anim.coords[0]);
  assertRoughlyEquals(0.3, anim.progress, 1e-4);

  anim.pause();

  clock.tick(400);

  assertEquals(300, anim.coords[0]);
  assertRoughlyEquals(0.3, anim.progress, 1e-4);

  anim.play();

  assertEquals(300, anim.coords[0]);
  assertRoughlyEquals(0.3, anim.progress, 1e-4);

  clock.tick(400);

  assertEquals(700, anim.coords[0]);
  assertRoughlyEquals(0.7, anim.progress, 1e-4);

  anim.pause();

  clock.tick(300);

  assertEquals(700, anim.coords[0]);
  assertRoughlyEquals(0.7, anim.progress, 1e-4);

  anim.play();

  var lastPlay = goog.now();

  assertEquals(700, anim.coords[0]);
  assertRoughlyEquals(0.7, anim.progress, 1e-4);

  clock.tick(300);

  assertEquals(1000, anim.coords[0]);
  assertRoughlyEquals(1, anim.progress, 1e-4);
  assertEquals(goog.fx.Animation.State.STOPPED, anim.getStateInternal());
}

function testSetProgress() {
  var anim = new goog.fx.Animation([0], [1000], 3000);
  var nFrames = 0;
  anim.play();
  anim.setProgress(0.5);
  goog.events.listen(anim, goog.fx.Animation.EventType.ANIMATE, function(e) {
    assertEquals(500, e.coords[0]);
    assertRoughlyEquals(0.5, e.progress, 1e-4);
    nFrames++;
  });
  anim.cycle(goog.now());
  anim.stop();
  assertEquals(1, nFrames);
}
