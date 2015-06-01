// Copyright 2006 The Closure Library Authors. All Rights Reserved.
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
goog.provide('goog.async.ThrottleTest');
goog.setTestOnly('goog.async.ThrottleTest');

goog.require('goog.async.Throttle');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');

function testThrottle() {
  var clock = new goog.testing.MockClock(true);

  var callBackCount = 0;
  var callBackFunction = function() {
    callBackCount++;
  };

  var throttle = new goog.async.Throttle(callBackFunction, 100);
  assertEquals(0, callBackCount);
  throttle.fire();
  assertEquals(1, callBackCount);
  throttle.fire();
  assertEquals(1, callBackCount);
  throttle.fire();
  throttle.fire();
  assertEquals(1, callBackCount);
  clock.tick(101);
  assertEquals(2, callBackCount);
  clock.tick(101);
  assertEquals(2, callBackCount);

  throttle.fire();
  assertEquals(3, callBackCount);
  throttle.fire();
  assertEquals(3, callBackCount);
  throttle.stop();
  clock.tick(101);
  assertEquals(3, callBackCount);
  throttle.fire();
  assertEquals(4, callBackCount);
  clock.tick(101);
  assertEquals(4, callBackCount);

  throttle.fire();
  throttle.fire();
  assertEquals(5, callBackCount);
  throttle.pause();
  throttle.resume();
  assertEquals(5, callBackCount);
  throttle.pause();
  clock.tick(101);
  assertEquals(5, callBackCount);
  throttle.resume();
  assertEquals(6, callBackCount);
  clock.tick(101);
  assertEquals(6, callBackCount);
  throttle.pause();
  throttle.fire();
  assertEquals(6, callBackCount);
  clock.tick(101);
  assertEquals(6, callBackCount);
  throttle.resume();
  assertEquals(7, callBackCount);

  throttle.pause();
  throttle.pause();
  clock.tick(101);
  throttle.fire();
  throttle.resume();
  assertEquals(7, callBackCount);
  throttle.resume();
  assertEquals(8, callBackCount);

  throttle.pause();
  throttle.pause();
  throttle.fire();
  throttle.resume();
  clock.tick(101);
  assertEquals(8, callBackCount);
  throttle.resume();
  assertEquals(9, callBackCount);

  clock.uninstall();
}
