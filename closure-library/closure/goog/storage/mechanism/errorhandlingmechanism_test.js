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

goog.provide('goog.storage.mechanism.ErrorHandlingMechanismTest');
goog.setTestOnly('goog.storage.mechanism.ErrorHandlingMechanismTest');

goog.require('goog.storage.mechanism.ErrorHandlingMechanism');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');

var error = new Error();

var submechanism = {
  get: function() { throw error; },
  set: function() { throw error; },
  remove: function() { throw error; }
};

var handler = goog.testing.recordFunction(goog.nullFunction);
var mechanism;

function setUp() {
  mechanism = new goog.storage.mechanism.ErrorHandlingMechanism(
      submechanism, handler);
}

function tearDown() {
  handler.reset();
}

function testSet() {
  mechanism.set('foo', 'bar');
  assertEquals(1, handler.getCallCount());
  assertArrayEquals(
      [
        error,
        goog.storage.mechanism.ErrorHandlingMechanism.Operation.SET,
        'foo',
        'bar'
      ],
      handler.getLastCall().getArguments());
}

function testGet() {
  mechanism.get('foo');
  assertEquals(1, handler.getCallCount());
  assertArrayEquals(
      [
        error,
        goog.storage.mechanism.ErrorHandlingMechanism.Operation.GET,
        'foo'
      ],
      handler.getLastCall().getArguments());
}

function testRemove() {
  mechanism.remove('foo');
  assertEquals(1, handler.getCallCount());
  assertArrayEquals(
      [
        error,
        goog.storage.mechanism.ErrorHandlingMechanism.Operation.REMOVE,
        'foo'
      ],
      handler.getLastCall().getArguments());
}
