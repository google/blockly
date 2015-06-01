// Copyright 2013 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Unit tests for goog.labs.events.touch.
 */


goog.provide('goog.labs.events.touchTest');

goog.require('goog.labs.events.touch');
goog.require('goog.testing.jsunit');

goog.setTestOnly('goog.labs.events.touchTest');

function testMouseEvent() {
  var fakeTarget = {};

  var fakeMouseMove = {
    'clientX': 1,
    'clientY': 2,
    'screenX': 3,
    'screenY': 4,
    'target': fakeTarget,
    'type': 'mousemove'
  };

  var data = goog.labs.events.touch.getTouchData(fakeMouseMove);
  assertEquals(1, data.clientX);
  assertEquals(2, data.clientY);
  assertEquals(3, data.screenX);
  assertEquals(4, data.screenY);
  assertEquals(fakeTarget, data.target);
}

function testTouchEvent() {
  var fakeTarget = {};

  var fakeTouch = {
    'clientX': 1,
    'clientY': 2,
    'screenX': 3,
    'screenY': 4,
    'target': fakeTarget
  };

  var fakeTouchStart = {
    'targetTouches': [fakeTouch],
    'target': fakeTarget,
    'type': 'touchstart'
  };

  var data = goog.labs.events.touch.getTouchData(fakeTouchStart);
  assertEquals(1, data.clientX);
  assertEquals(2, data.clientY);
  assertEquals(3, data.screenX);
  assertEquals(4, data.screenY);
  assertEquals(fakeTarget, data.target);
}

function testTouchChangeEvent() {
  var fakeTarget = {};

  var fakeTouch = {
    'clientX': 1,
    'clientY': 2,
    'screenX': 3,
    'screenY': 4,
    'target': fakeTarget
  };

  var fakeTouchStart = {
    'changedTouches': [fakeTouch],
    'target': fakeTarget,
    'type': 'touchend'
  };

  var data = goog.labs.events.touch.getTouchData(fakeTouchStart);
  assertEquals(1, data.clientX);
  assertEquals(2, data.clientY);
  assertEquals(3, data.screenX);
  assertEquals(4, data.screenY);
  assertEquals(fakeTarget, data.target);
}

