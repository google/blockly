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

goog.provide('goog.fx.AnimationQueueTest');
goog.setTestOnly('goog.fx.AnimationQueueTest');

goog.require('goog.events');
goog.require('goog.fx.Animation');
goog.require('goog.fx.AnimationParallelQueue');
goog.require('goog.fx.AnimationSerialQueue');
goog.require('goog.fx.Transition');
goog.require('goog.fx.anim');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');

var clock;

function setUpPage() {
  clock = new goog.testing.MockClock(true);
  goog.fx.anim.setAnimationWindow(null);
}

function tearDownPage() {
  clock.dispose();
}

function testParallelEvents() {
  var anim = new goog.fx.AnimationParallelQueue();
  anim.add(new goog.fx.Animation([0], [100], 200));
  anim.add(new goog.fx.Animation([0], [100], 400));
  anim.add(new goog.fx.Animation([0], [100], 600));

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isStopped());
  assertTrue(anim.queue[2].isStopped());
  assertTrue(anim.isStopped());

  var playEvents = 0, beginEvents = 0, resumeEvents = 0, pauseEvents = 0;
  var endEvents = 0, stopEvents = 0, finishEvents = 0;

  goog.events.listen(anim, goog.fx.Transition.EventType.PLAY, function() {
    ++playEvents; });
  goog.events.listen(anim, goog.fx.Transition.EventType.BEGIN, function() {
    ++beginEvents; });
  goog.events.listen(anim, goog.fx.Transition.EventType.RESUME, function() {
    ++resumeEvents; });
  goog.events.listen(anim, goog.fx.Transition.EventType.PAUSE, function() {
    ++pauseEvents; });
  goog.events.listen(anim, goog.fx.Transition.EventType.END, function() {
    ++endEvents; });
  goog.events.listen(anim, goog.fx.Transition.EventType.STOP, function() {
    ++stopEvents; });
  goog.events.listen(anim, goog.fx.Transition.EventType.FINISH, function() {
    ++finishEvents; });

  // PLAY, BEGIN
  anim.play();
  // No queue events.
  clock.tick(100);
  // PAUSE
  anim.pause();
  // No queue events
  clock.tick(200);
  // PLAY, RESUME
  anim.play();
  // No queue events.
  clock.tick(400);
  // END, STOP
  anim.stop();
  // PLAY, BEGIN
  anim.play();
  // No queue events.
  clock.tick(400);
  // END, FINISH
  clock.tick(200);

  // Make sure the event counts are right.
  assertEquals(3, playEvents);
  assertEquals(2, beginEvents);
  assertEquals(1, resumeEvents);
  assertEquals(1, pauseEvents);
  assertEquals(2, endEvents);
  assertEquals(1, stopEvents);
  assertEquals(1, finishEvents);
}

function testSerialEvents() {
  var anim = new goog.fx.AnimationSerialQueue();
  anim.add(new goog.fx.Animation([0], [100], 100));
  anim.add(new goog.fx.Animation([0], [100], 200));
  anim.add(new goog.fx.Animation([0], [100], 300));

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isStopped());
  assertTrue(anim.queue[2].isStopped());
  assertTrue(anim.isStopped());

  var playEvents = 0, beginEvents = 0, resumeEvents = 0, pauseEvents = 0;
  var endEvents = 0, stopEvents = 0, finishEvents = 0;

  goog.events.listen(anim, goog.fx.Transition.EventType.PLAY, function() {
    ++playEvents; });
  goog.events.listen(anim, goog.fx.Transition.EventType.BEGIN, function() {
    ++beginEvents; });
  goog.events.listen(anim, goog.fx.Transition.EventType.RESUME, function() {
    ++resumeEvents; });
  goog.events.listen(anim, goog.fx.Transition.EventType.PAUSE, function() {
    ++pauseEvents; });
  goog.events.listen(anim, goog.fx.Transition.EventType.END, function() {
    ++endEvents; });
  goog.events.listen(anim, goog.fx.Transition.EventType.STOP, function() {
    ++stopEvents; });
  goog.events.listen(anim, goog.fx.Transition.EventType.FINISH, function() {
    ++finishEvents; });

  // PLAY, BEGIN
  anim.play();
  // No queue events.
  clock.tick(100);
  // PAUSE
  anim.pause();
  // No queue events
  clock.tick(200);
  // PLAY, RESUME
  anim.play();
  // No queue events.
  clock.tick(400);
  // END, STOP
  anim.stop();
  // PLAY, BEGIN
  anim.play(true);
  // No queue events.
  clock.tick(400);
  // END, FINISH
  clock.tick(200);

  // Make sure the event counts are right.
  assertEquals(3, playEvents);
  assertEquals(2, beginEvents);
  assertEquals(1, resumeEvents);
  assertEquals(1, pauseEvents);
  assertEquals(2, endEvents);
  assertEquals(1, stopEvents);
  assertEquals(1, finishEvents);
}

function testParallelPause() {
  var anim = new goog.fx.AnimationParallelQueue();
  anim.add(new goog.fx.Animation([0], [100], 100));
  anim.add(new goog.fx.Animation([0], [100], 200));
  anim.add(new goog.fx.Animation([0], [100], 300));

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isStopped());
  assertTrue(anim.queue[2].isStopped());
  assertTrue(anim.isStopped());

  anim.play();

  assertTrue(anim.queue[0].isPlaying());
  assertTrue(anim.queue[1].isPlaying());
  assertTrue(anim.queue[2].isPlaying());
  assertTrue(anim.isPlaying());

  clock.tick(100);

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isPlaying());
  assertTrue(anim.queue[2].isPlaying());
  assertTrue(anim.isPlaying());

  anim.pause();

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isPaused());
  assertTrue(anim.queue[2].isPaused());
  assertTrue(anim.isPaused());

  clock.tick(200);

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isPaused());
  assertTrue(anim.queue[2].isPaused());
  assertTrue(anim.isPaused());

  anim.play();

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isPlaying());
  assertTrue(anim.queue[2].isPlaying());
  assertTrue(anim.isPlaying());

  clock.tick(100);

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isStopped());
  assertTrue(anim.queue[2].isPlaying());
  assertTrue(anim.isPlaying());

  anim.pause();

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isStopped());
  assertTrue(anim.queue[2].isPaused());
  assertTrue(anim.isPaused());

  clock.tick(200);

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isStopped());
  assertTrue(anim.queue[2].isPaused());
  assertTrue(anim.isPaused());

  anim.play();

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isStopped());
  assertTrue(anim.queue[2].isPlaying());
  assertTrue(anim.isPlaying());

  clock.tick(100);

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isStopped());
  assertTrue(anim.queue[2].isStopped());
  assertTrue(anim.isStopped());
}

function testSerialPause() {
  var anim = new goog.fx.AnimationSerialQueue();
  anim.add(new goog.fx.Animation([0], [100], 100));
  anim.add(new goog.fx.Animation([0], [100], 200));
  anim.add(new goog.fx.Animation([0], [100], 300));

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isStopped());
  assertTrue(anim.queue[2].isStopped());
  assertTrue(anim.isStopped());

  anim.play();

  assertTrue(anim.queue[0].isPlaying());
  assertTrue(anim.queue[1].isStopped());
  assertTrue(anim.queue[2].isStopped());
  assertTrue(anim.isPlaying());

  clock.tick(100);

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isPlaying());
  assertTrue(anim.queue[2].isStopped());
  assertTrue(anim.isPlaying());

  anim.pause();

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isPaused());
  assertTrue(anim.queue[2].isStopped());
  assertTrue(anim.isPaused());

  clock.tick(400);

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isPaused());
  assertTrue(anim.queue[2].isStopped());
  assertTrue(anim.isPaused());

  anim.play();

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isPlaying());
  assertTrue(anim.queue[2].isStopped());
  assertTrue(anim.isPlaying());

  clock.tick(200);

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isStopped());
  assertTrue(anim.queue[2].isPlaying());
  assertTrue(anim.isPlaying());

  anim.pause();

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isStopped());
  assertTrue(anim.queue[2].isPaused());
  assertTrue(anim.isPaused());

  clock.tick(300);

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isStopped());
  assertTrue(anim.queue[2].isPaused());
  assertTrue(anim.isPaused());

  anim.play();

  clock.tick(300);

  assertTrue(anim.queue[0].isStopped());
  assertTrue(anim.queue[1].isStopped());
  assertTrue(anim.queue[2].isStopped());
  assertTrue(anim.isStopped());
}
