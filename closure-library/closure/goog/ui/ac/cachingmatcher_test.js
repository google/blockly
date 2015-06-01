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

goog.provide('goog.ui.ac.CachingMatcherTest');
goog.setTestOnly('goog.ui.ac.CachingMatcherTest');

goog.require('goog.testing.MockControl');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.mockmatchers');
goog.require('goog.ui.ac.CachingMatcher');
ignoreArgument = goog.testing.mockmatchers.ignoreArgument;



/**
 * Fake version of Throttle which only fires when we call permitOne().
 * @constructor
 * @suppress {missingProvide}
 */
goog.async.Throttle = function(fn, time, self) {
  this.fn = fn;
  this.time = time;
  this.self = self;
  this.numFires = 0;
};


/** @suppress {missingProvide} */
goog.async.Throttle.prototype.fire = function() {
  this.numFires++;
};


/** @suppress {missingProvide} */
goog.async.Throttle.prototype.permitOne = function() {
  if (this.numFires == 0) {
    return;
  }
  this.fn.call(this.self);
  this.numFires = 0;
};

// Actual tests.
var mockControl;
var mockMatcher;
var mockHandler;
var matcher;

function setUp() {
  mockControl = new goog.testing.MockControl();
  mockMatcher = {
    requestMatchingRows: mockControl.createFunctionMock('requestMatchingRows')
  };
  mockHandler = mockControl.createFunctionMock('matchHandler');
  matcher = new goog.ui.ac.CachingMatcher(mockMatcher);
}

function tearDown() {
  mockControl.$tearDown();
}

function testLocalThenRemoteMatch() {
  // We immediately get the local match.
  mockHandler('foo', []);
  mockControl.$replayAll();
  matcher.requestMatchingRows('foo', 12, mockHandler);
  mockControl.$verifyAll();
  mockControl.$resetAll();

  // Now we run the remote match.
  mockHandler('foo', ['foo1', 'foo2'], ignoreArgument);
  mockMatcher.requestMatchingRows('foo', 100, ignoreArgument)
      .$does(function(token, maxResults, matchHandler) {
        matchHandler('foo', ['foo1', 'foo2', 'bar3']);
      });
  mockControl.$replayAll();
  matcher.throttledTriggerBaseMatch_.permitOne();
  mockControl.$verifyAll();
  mockControl.$resetAll();
}

function testCacheSize() {
  matcher.setMaxCacheSize(4);

  // First we populate, but not overflow the cache.
  mockHandler('foo', []);
  mockHandler('foo', ['foo111', 'foo222'], ignoreArgument);
  mockMatcher.requestMatchingRows('foo', 100, ignoreArgument)
      .$does(function(token, maxResults, matchHandler) {
        matchHandler('foo', ['foo111', 'foo222', 'bar333']);
      });
  mockControl.$replayAll();
  matcher.requestMatchingRows('foo', 12, mockHandler);
  matcher.throttledTriggerBaseMatch_.permitOne();
  mockControl.$verifyAll();
  mockControl.$resetAll();

  // Now we verify the cache is populated.
  mockHandler('foo1', ['foo111']);
  mockControl.$replayAll();
  matcher.requestMatchingRows('foo1', 12, mockHandler);
  mockControl.$verifyAll();
  mockControl.$resetAll();

  // Now we overflow the cache. Check that the remote results show the first
  // time we get them back, even though they overflow the cache.
  mockHandler('foo11', ['foo111']);
  mockHandler('foo11', ['foo111', 'foo112', 'foo113', 'foo114'],
              ignoreArgument);
  mockMatcher.requestMatchingRows('foo11', 100, ignoreArgument)
      .$does(function(token, maxResults, matchHandler) {
        matchHandler('foo11', ['foo111', 'foo112', 'foo113', 'foo114']);
      });
  mockControl.$replayAll();
  matcher.requestMatchingRows('foo11', 12, mockHandler);
  matcher.throttledTriggerBaseMatch_.permitOne();
  mockControl.$verifyAll();
  mockControl.$resetAll();

  // Now check that the cache is empty.
  mockHandler('foo11', []);
  mockControl.$replayAll();
  matcher.requestMatchingRows('foo11', 12, mockHandler);
  mockControl.$verifyAll();
  mockControl.$resetAll();
}

function testSimilarMatchingDoesntReorderResults() {
  // Populate the cache. We get two prefix matches.
  mockHandler('ba', []);
  mockHandler('ba', ['bar', 'baz', 'bam'], ignoreArgument);
  mockMatcher.requestMatchingRows('ba', 100, ignoreArgument)
      .$does(function(token, maxResults, matchHandler) {
        matchHandler('ba', ['bar', 'baz', 'bam']);
      });
  mockControl.$replayAll();
  matcher.requestMatchingRows('ba', 12, mockHandler);
  matcher.throttledTriggerBaseMatch_.permitOne();
  mockControl.$verifyAll();
  mockControl.$resetAll();

  // The user types another character. The local match gives us two similar
  // matches, but no prefix matches. The remote match returns a prefix match,
  // which would normally be ranked above the similar matches, but gets ranked
  // below the similar matches because the user hasn't typed any more
  // characters.
  mockHandler('bad', ['bar', 'baz', 'bam']);
  mockHandler('bad', ['bar', 'baz', 'bam', 'bad', 'badder', 'baddest'],
              ignoreArgument);
  mockMatcher.requestMatchingRows('bad', 100, ignoreArgument)
      .$does(function(token, maxResults, matchHandler) {
        matchHandler('bad', ['bad', 'badder', 'baddest']);
      });
  mockControl.$replayAll();
  matcher.requestMatchingRows('bad', 12, mockHandler);
  matcher.throttledTriggerBaseMatch_.permitOne();
  mockControl.$verifyAll();
  mockControl.$resetAll();

  // The user types yet another character, which allows the prefix matches to
  // jump to the top of the list of suggestions.
  mockHandler('badd', ['badder', 'baddest']);
  mockControl.$replayAll();
  matcher.requestMatchingRows('badd', 12, mockHandler);
  mockControl.$verifyAll();
  mockControl.$resetAll();
}

function testSetThrottleTime() {
  assertEquals(150, matcher.throttledTriggerBaseMatch_.time);
  matcher.setThrottleTime(234);
  assertEquals(234, matcher.throttledTriggerBaseMatch_.time);
}

function testSetBaseMatcherMaxMatches() {
  mockHandler('foo', []); // Local match
  mockMatcher.requestMatchingRows('foo', 789, ignoreArgument);
  mockControl.$replayAll();
  matcher.setBaseMatcherMaxMatches();
  matcher.requestMatchingRows('foo', 12, mockHandler);
}

function testSetLocalMatcher() {
  // Use a local matcher which just sorts all the rows alphabetically.
  function sillyMatcher(token, maxMatches, rows) {
    rows = rows.concat([]);
    rows.sort();
    return rows;
  }

  mockHandler('foo', []);
  mockHandler('foo', ['a', 'b', 'c'], ignoreArgument);
  mockMatcher.requestMatchingRows('foo', 100, ignoreArgument)
      .$does(function(token, maxResults, matchHandler) {
        matchHandler('foo', ['b', 'a', 'c']);
      });
  mockControl.$replayAll();
  matcher.setLocalMatcher(sillyMatcher);
  matcher.requestMatchingRows('foo', 12, mockHandler);
  matcher.throttledTriggerBaseMatch_.permitOne();
  mockControl.$verifyAll();
  mockControl.$resetAll();
}
