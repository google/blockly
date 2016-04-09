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

goog.provide('goog.labs.testing.assertThatTest');
goog.setTestOnly('goog.labs.testing.assertThatTest');

goog.require('goog.labs.testing.MatcherError');
goog.require('goog.labs.testing.assertThat');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');

var successMatchesFn, failureMatchesFn, describeFn, successTestMatcher;
var failureTestMatcher;

function setUp() {
  successMatchesFn =
      new goog.testing.recordFunction(function() { return true; });
  failureMatchesFn =
      new goog.testing.recordFunction(function() { return false; });
  describeFn = new goog.testing.recordFunction();

  successTestMatcher = function() {
    return {matches: successMatchesFn, describe: describeFn};
  };
  failureTestMatcher = function() {
    return {matches: failureMatchesFn, describe: describeFn};
  };
}

function testAssertthatAlwaysCallsMatches() {
  var value = 7;
  goog.labs.testing.assertThat(
      value, successTestMatcher(), 'matches is called on success');

  assertEquals(1, successMatchesFn.getCallCount());
  var matchesCall = successMatchesFn.popLastCall();
  assertEquals(value, matchesCall.getArgument(0));

  var e = assertThrows(
      goog.bind(
          goog.labs.testing.assertThat, null, value, failureTestMatcher(),
          'matches is called on failure'));

  assertTrue(e instanceof goog.labs.testing.MatcherError);

  assertEquals(1, failureMatchesFn.getCallCount());
}

function testAssertthatCallsDescribeOnFailure() {
  var value = 7;
  var e = assertThrows(
      goog.bind(
          goog.labs.testing.assertThat, null, value, failureTestMatcher(),
          'describe is called on failure'));

  assertTrue(e instanceof goog.labs.testing.MatcherError);

  assertEquals(1, failureMatchesFn.getCallCount());
  assertEquals(1, describeFn.getCallCount());

  var matchesCall = describeFn.popLastCall();
  assertEquals(value, matchesCall.getArgument(0));
}
