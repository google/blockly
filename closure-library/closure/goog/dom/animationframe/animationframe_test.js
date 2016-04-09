// Copyright 2014 The Closure Library Authors. All Rights Reserved.
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

/**
 * @fileoverview Tests for goog.dom.animationFrame.
 */

goog.setTestOnly();

goog.require('goog.dom.animationFrame');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');


var NEXT_FRAME = goog.testing.MockClock.REQUEST_ANIMATION_FRAME_TIMEOUT;
var mockClock;
var t0, t1;
var result;

function setUp() {
  mockClock = new goog.testing.MockClock(true);
  result = '';
  t0 = goog.dom.animationFrame.createTask({
    measure: function() { result += 'me0'; },
    mutate: function() { result += 'mu0'; }
  });
  t1 = goog.dom.animationFrame.createTask({
    measure: function() { result += 'me1'; },
    mutate: function() { result += 'mu1'; }
  });
  assertEquals('', result);
}

function tearDown() {
  mockClock.dispose();
}

function testCreateTask_one() {
  t0();
  assertEquals('', result);
  mockClock.tick(NEXT_FRAME);
  assertEquals('me0mu0', result);
  mockClock.tick(NEXT_FRAME);
  assertEquals('me0mu0', result);
  t0();
  t0();  // Should do nothing.
  mockClock.tick(NEXT_FRAME);
  assertEquals('me0mu0me0mu0', result);
}

function testCreateTask_onlyMutate() {
  t0 = goog.dom.animationFrame.createTask(
      {mutate: function() { result += 'mu0'; }});
  t0();
  assertEquals('', result);
  mockClock.tick(NEXT_FRAME);
  assertEquals('mu0', result);
}

function testCreateTask_onlyMeasure() {
  t0 = goog.dom.animationFrame.createTask(
      {mutate: function() { result += 'me0'; }});
  t0();
  assertEquals('', result);
  mockClock.tick(NEXT_FRAME);
  assertEquals('me0', result);
}

function testCreateTask_two() {
  t0();
  t1();
  assertEquals('', result);
  mockClock.tick(NEXT_FRAME);
  assertEquals('me0me1mu0mu1', result);
  mockClock.tick(NEXT_FRAME);
  assertEquals('me0me1mu0mu1', result);
  t0();
  t1();
  t0();
  t1();
  mockClock.tick(NEXT_FRAME);
  assertEquals('me0me1mu0mu1me0me1mu0mu1', result);
}

function testCreateTask_recurse() {
  var stop = false;
  var recurse = goog.dom.animationFrame.createTask({
    measure: function() {
      if (!stop) {
        recurse();
      }
      result += 're0';
    },
    mutate: function() { result += 'ru0'; }
  });
  recurse();
  mockClock.tick(NEXT_FRAME);
  assertEquals('re0ru0', result);
  mockClock.tick(NEXT_FRAME);
  assertEquals('re0ru0re0ru0', result);
  mockClock.tick(NEXT_FRAME);
  assertEquals('re0ru0re0ru0re0ru0', result);
  t0();
  stop = true;
  mockClock.tick(NEXT_FRAME);
  assertEquals('re0ru0re0ru0re0ru0re0me0ru0mu0', result);

  // Recursion should have stopped now.
  mockClock.tick(NEXT_FRAME);
  assertEquals('re0ru0re0ru0re0ru0re0me0ru0mu0', result);
  assertFalse(goog.dom.animationFrame.requestedFrame_);
  mockClock.tick(NEXT_FRAME);
  assertEquals('re0ru0re0ru0re0ru0re0me0ru0mu0', result);
  assertFalse(goog.dom.animationFrame.requestedFrame_);
}

function testCreateTask_recurseTwoMethodsWithState() {
  var stop = false;
  var recurse1 = goog.dom.animationFrame.createTask({
    measure: function(state) {
      if (!stop) {
        recurse2();
      }
      result += 'r1e0';
      state.text = 'T0';
    },
    mutate: function(state) { result += 'r1u0' + state.text; }
  });
  var recurse2 = goog.dom.animationFrame.createTask({
    measure: function(state) {
      if (!stop) {
        recurse1();
      }
      result += 'r2e0';
      state.text = 'T1';
    },
    mutate: function(state) { result += 'r2u0' + state.text; }
  });

  var taskLength = goog.dom.animationFrame.tasks_[0].length;

  recurse1();
  mockClock.tick(NEXT_FRAME);
  // Only recurse1 executed.
  assertEquals('r1e0r1u0T0', result);

  mockClock.tick(NEXT_FRAME);
  // Recurse2 executed and queueup recurse1.
  assertEquals('r1e0r1u0T0r2e0r2u0T1', result);

  mockClock.tick(NEXT_FRAME);
  // Recurse1 executed and queueup recurse2.
  assertEquals('r1e0r1u0T0r2e0r2u0T1r1e0r1u0T0', result);

  stop = true;
  mockClock.tick(NEXT_FRAME);
  // Recurse2 executed and should have stopped.
  assertEquals('r1e0r1u0T0r2e0r2u0T1r1e0r1u0T0r2e0r2u0T1', result);
  assertFalse(goog.dom.animationFrame.requestedFrame_);

  mockClock.tick(NEXT_FRAME);
  assertEquals('r1e0r1u0T0r2e0r2u0T1r1e0r1u0T0r2e0r2u0T1', result);
  assertFalse(goog.dom.animationFrame.requestedFrame_);

  mockClock.tick(NEXT_FRAME);
  assertEquals('r1e0r1u0T0r2e0r2u0T1r1e0r1u0T0r2e0r2u0T1', result);
  assertFalse(goog.dom.animationFrame.requestedFrame_);
}

function testCreateTask_args() {
  var context = {context: true};
  var s = goog.dom.animationFrame.createTask(
      {
        measure: function(state) {
          assertEquals(context, this);
          assertUndefined(state.foo);
          state.foo = 'foo';
        },
        mutate: function(state) {
          assertEquals(context, this);
          result += state.foo;
        }
      },
      context);
  s();
  mockClock.tick(NEXT_FRAME);
  assertEquals('foo', result);

  var dynamicContext = goog.dom.animationFrame.createTask({
    measure: function(state) { assertEquals(context, this); },
    mutate: function(state) {
      assertEquals(context, this);
      result += 'bar';
    }
  });
  dynamicContext.call(context);
  mockClock.tick(NEXT_FRAME);
  assertEquals('foobar', result);

  var moreArgs = goog.dom.animationFrame.createTask({
    measure: function(event, state) {
      assertEquals(context, this);
      assertEquals('event', event);
      state.baz = 'baz';
    },
    mutate: function(event, state) {
      assertEquals('event', event);
      assertEquals(context, this);
      result += state.baz;
    }
  });
  moreArgs.call(context, 'event');
  mockClock.tick(NEXT_FRAME);
  assertEquals('foobarbaz', result);
}

function testIsRunning() {
  var result = '';
  var task = goog.dom.animationFrame.createTask({
    measure: function() {
      result += 'me';
      assertTrue(goog.dom.animationFrame.isRunning());
    },
    mutate: function() {
      result += 'mu';
      assertTrue(goog.dom.animationFrame.isRunning());
    }
  });
  task();
  assertFalse(goog.dom.animationFrame.isRunning());
  mockClock.tick(NEXT_FRAME);
  assertFalse(goog.dom.animationFrame.isRunning());
  assertEquals('memu', result);
}
