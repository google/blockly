// Copyright 2015 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.async.DebouncerTest');
goog.setTestOnly('goog.async.DebouncerTest');

goog.require('goog.array');
goog.require('goog.async.Debouncer');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');


function testDebouncerCommandSequences() {
  // Encoded sequences of commands to perform mapped to expected # of calls.
  //   f: fire
  //   w: wait (for the debouncing timer to elapse)
  //   p: pause
  //   r: resume
  //   s: stop
  var expectedCommandSequenceCalls = {
    'f': 0,
    'ff': 0,
    'fw': 1,
    'ffw': 1,
    'fpr': 0,
    'fsf': 0,
    'fsw': 0,
    'fprw': 1,
    'fpwr': 1,
    'fsfw': 1,
    'fswf': 0,
    'fprfw': 1,
    'fprsw': 0,
    'fpswr': 0,
    'fpwfr': 0,
    'fpwsr': 0,
    'fswfw': 1,
    'fpswrw': 0,
    'fpwfrw': 1,
    'fpwsfr': 0,
    'fpwsrw': 0,
    'fspwrw': 0,
    'fpwsfrw': 1,
    'ffwfwfffw': 3
  };
  var interval = 500;

  var mockClock = new goog.testing.MockClock(true);
  for (var commandSequence in expectedCommandSequenceCalls) {
    var recordFn = goog.testing.recordFunction();
    var debouncer = new goog.async.Debouncer(recordFn, interval);

    for (var i = 0; i < commandSequence.length; ++i) {
      switch (commandSequence[i]) {
        case 'f':
          debouncer.fire();
          break;
        case 'w':
          mockClock.tick(interval);
          break;
        case 'p':
          debouncer.pause();
          break;
        case 'r':
          debouncer.resume();
          break;
        case 's':
          debouncer.stop();
          break;
      }
    }

    var expectedCalls = expectedCommandSequenceCalls[commandSequence];
    assertEquals(
        'Expected ' + expectedCalls + ' calls for command sequence "' +
            commandSequence + '" (' +
            goog.array
                .map(
                    commandSequence,
                    function(command) {
                      switch (command) {
                        case 'f':
                          return 'fire';
                        case 'w':
                          return 'wait';
                        case 'p':
                          return 'pause';
                        case 'r':
                          return 'resume';
                        case 's':
                          return 'stop';
                      }
                    })
                .join(' -> ') +
            ')',
        expectedCalls, recordFn.getCallCount());
    debouncer.dispose();
  }
  mockClock.uninstall();
}


function testDebouncerScopeBinding() {
  var interval = 500;
  var mockClock = new goog.testing.MockClock(true);

  var x = {'y': 0};
  var debouncer =
      new goog.async.Debouncer(function() { ++this['y']; }, interval, x);
  debouncer.fire();
  assertEquals(0, x['y']);

  mockClock.tick(interval);
  assertEquals(1, x['y']);

  mockClock.uninstall();
}


function testDebouncerArgumentBinding() {
  var interval = 500;
  var mockClock = new goog.testing.MockClock(true);

  var calls = 0;
  var debouncer = new goog.async.Debouncer(function(a, b, c) {
    ++calls;
    assertEquals(3, a);
    assertEquals('string', b);
    assertEquals(false, c);
  }, interval);

  debouncer.fire(3, 'string', false);
  mockClock.tick(interval);
  assertEquals(1, calls);

  // fire should always pass the last arguments passed to it into the decorated
  // function, even if called multiple times.
  debouncer.fire();
  mockClock.tick(interval / 2);
  debouncer.fire(8, null, true);
  debouncer.fire(3, 'string', false);
  mockClock.tick(interval);
  assertEquals(2, calls);

  mockClock.uninstall();
}


function testDebouncerArgumentAndScopeBinding() {
  var interval = 500;
  var mockClock = new goog.testing.MockClock(true);

  var x = {'calls': 0};
  var debouncer = new goog.async.Debouncer(function(a, b, c) {
    ++this['calls'];
    assertEquals(3, a);
    assertEquals('string', b);
    assertEquals(false, c);
  }, interval, x);

  debouncer.fire(3, 'string', false);
  mockClock.tick(interval);
  assertEquals(1, x['calls']);

  // fire should always pass the last arguments passed to it into the decorated
  // function, even if called multiple times.
  debouncer.fire();
  mockClock.tick(interval / 2);
  debouncer.fire(8, null, true);
  debouncer.fire(3, 'string', false);
  mockClock.tick(interval);
  assertEquals(2, x['calls']);

  mockClock.uninstall();
}
