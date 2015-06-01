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

goog.provide('goog.fx.css3.TransitionTest');
goog.setTestOnly('goog.fx.css3.TransitionTest');

goog.require('goog.dispose');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.fx.Transition');
goog.require('goog.fx.css3.Transition');
goog.require('goog.style.transition');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');

var transition;
var element;
var mockClock;


function createTransition(element, duration) {
  return new goog.fx.css3.Transition(
      element, duration, {'opacity': 0}, {'opacity': 1},
      {property: 'opacity', duration: duration, timing: 'ease-in', delay: 0});
}


function setUp() {
  mockClock = new goog.testing.MockClock(true);
  element = goog.dom.createElement(goog.dom.TagName.DIV);
  document.body.appendChild(element);
}


function tearDown() {
  goog.dispose(transition);
  goog.dispose(mockClock);
  goog.dom.removeNode(element);
}


function testPlayEventFiredOnPlay() {
  if (!goog.style.transition.isSupported()) return;

  transition = createTransition(element, 10);
  var handlerCalled = false;
  goog.events.listen(transition, goog.fx.Transition.EventType.PLAY,
      function() {
        handlerCalled = true;
      });

  transition.play();
  assertTrue(handlerCalled);
}


function testBeginEventFiredOnPlay() {
  if (!goog.style.transition.isSupported()) return;

  transition = createTransition(element, 10);
  var handlerCalled = false;
  goog.events.listen(transition, goog.fx.Transition.EventType.BEGIN,
      function() {
        handlerCalled = true;
      });

  transition.play();
  assertTrue(handlerCalled);
}


function testFinishEventsFiredAfterFinish() {
  if (!goog.style.transition.isSupported()) return;

  transition = createTransition(element, 10);
  var finishHandlerCalled = false;
  var endHandlerCalled = false;
  goog.events.listen(transition, goog.fx.Transition.EventType.FINISH,
      function() {
        finishHandlerCalled = true;
      });
  goog.events.listen(transition, goog.fx.Transition.EventType.END,
      function() {
        endHandlerCalled = true;
      });

  transition.play();

  mockClock.tick(10000);

  assertTrue(finishHandlerCalled);
  assertTrue(endHandlerCalled);
}


function testEventsWhenTransitionIsUnsupported() {
  if (goog.style.transition.isSupported()) return;

  transition = createTransition(element, 10);

  var stopHandlerCalled = false;
  var finishHandlerCalled = false, endHandlerCalled = false;
  var beginHandlerCalled = false, playHandlerCalled = false;
  goog.events.listen(transition, goog.fx.Transition.EventType.BEGIN,
      function() {
        beginHandlerCalled = true;
      });
  goog.events.listen(transition, goog.fx.Transition.EventType.PLAY,
      function() {
        playHandlerCalled = true;
      });
  goog.events.listen(transition, goog.fx.Transition.EventType.FINISH,
      function() {
        finishHandlerCalled = true;
      });
  goog.events.listen(transition, goog.fx.Transition.EventType.END,
      function() {
        endHandlerCalled = true;
      });
  goog.events.listen(transition, goog.fx.Transition.EventType.STOP,
      function() {
        stopHandlerCalled = true;
      });

  assertFalse(transition.play());

  assertTrue(beginHandlerCalled);
  assertTrue(playHandlerCalled);
  assertTrue(endHandlerCalled);
  assertTrue(finishHandlerCalled);

  transition.stop();

  assertFalse(stopHandlerCalled);
}


function testCallingStopDuringAnimationWorks() {
  if (!goog.style.transition.isSupported()) return;

  transition = createTransition(element, 10);

  var stopHandler = goog.testing.recordFunction();
  var endHandler = goog.testing.recordFunction();
  var finishHandler = goog.testing.recordFunction();
  goog.events.listen(transition, goog.fx.Transition.EventType.STOP,
      stopHandler);
  goog.events.listen(transition, goog.fx.Transition.EventType.END,
      endHandler);
  goog.events.listen(transition, goog.fx.Transition.EventType.FINISH,
      finishHandler);

  transition.play();
  mockClock.tick(1);
  transition.stop();
  assertEquals(1, stopHandler.getCallCount());
  assertEquals(1, endHandler.getCallCount());
  mockClock.tick(10000);
  assertEquals(0, finishHandler.getCallCount());
}


function testCallingStopImmediatelyWorks() {
  if (!goog.style.transition.isSupported()) return;

  transition = createTransition(element, 10);

  var stopHandler = goog.testing.recordFunction();
  var endHandler = goog.testing.recordFunction();
  var finishHandler = goog.testing.recordFunction();
  goog.events.listen(transition, goog.fx.Transition.EventType.STOP,
      stopHandler);
  goog.events.listen(transition, goog.fx.Transition.EventType.END,
      endHandler);
  goog.events.listen(transition, goog.fx.Transition.EventType.FINISH,
      finishHandler);

  transition.play();
  transition.stop();
  assertEquals(1, stopHandler.getCallCount());
  assertEquals(1, endHandler.getCallCount());
  mockClock.tick(10000);
  assertEquals(0, finishHandler.getCallCount());
}

function testCallingStopAfterAnimationDoesNothing() {
  if (!goog.style.transition.isSupported()) return;

  transition = createTransition(element, 10);

  var stopHandler = goog.testing.recordFunction();
  var endHandler = goog.testing.recordFunction();
  var finishHandler = goog.testing.recordFunction();
  goog.events.listen(transition, goog.fx.Transition.EventType.STOP,
      stopHandler);
  goog.events.listen(transition, goog.fx.Transition.EventType.END,
      endHandler);
  goog.events.listen(transition, goog.fx.Transition.EventType.FINISH,
      finishHandler);

  transition.play();
  mockClock.tick(10000);
  transition.stop();
  assertEquals(0, stopHandler.getCallCount());
  assertEquals(1, endHandler.getCallCount());
  assertEquals(1, finishHandler.getCallCount());
}
