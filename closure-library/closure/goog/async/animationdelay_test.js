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

goog.module('goog.async.AnimationDelayTest');
goog.setTestOnly('goog.async.AnimationDelayTest');

goog.require('goog.Timer');
goog.require('goog.async.AnimationDelay');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');

var testSuite = goog.require('goog.testing.testSuite');

var TEST_DELAY = 20;
var stubs = new goog.testing.PropertyReplacer();

testSuite({
  tearDown: function() {
    stubs.reset();
  },

  testStart: function() {
    var callCount = 0;
    var start = goog.now();
    var delay = new goog.async.AnimationDelay(function(end) {
      callCount++;
    });

    delay.start();

    return goog.Timer.promise(TEST_DELAY).then(function() {
      assertEquals(1, callCount);
    });
  },

  testStop: function() {
    var callCount = 0;
    var start = goog.now();
    var delay = new goog.async.AnimationDelay(function(end) {
      callCount++;
    });

    delay.start();
    delay.stop();

    return goog.Timer.promise(TEST_DELAY).then(function() {
      assertEquals(0, callCount);
    });
  },

  testAlwaysUseGoogNowForHandlerTimestamp: function() {
    var expectedValue = 12345.1;
    stubs.set(goog, 'now', function() {
      return expectedValue;
    });

    var handler = goog.testing.recordFunction(function(timestamp) {
      assertEquals(expectedValue, timestamp);
    });
    var delay = new goog.async.AnimationDelay(handler);

    delay.start();

    return goog.Timer.promise(TEST_DELAY).then(function() {
      assertEquals(1, handler.getCallCount());
    });
  }
});
