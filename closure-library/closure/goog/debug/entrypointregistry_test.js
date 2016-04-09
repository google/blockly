// Copyright 2010 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.debug.entryPointRegistryTest');
goog.setTestOnly('goog.debug.entryPointRegistryTest');

goog.require('goog.debug.ErrorHandler');
goog.require('goog.debug.entryPointRegistry');
goog.require('goog.testing.jsunit');

var lastError;
var errorHandler;
var errorFn;

function setUp() {
  lastError = null;
  errorFn = function(message) { throw {message: message}; };
  errorHandler = new goog.debug.ErrorHandler(function(ex) { lastError = ex; });
  goog.debug.entryPointRegistry.refList_ = [];
}

function testMonitorAndUnmonitor() {
  goog.debug.entryPointRegistry.register(function(transformer) {
    errorFn = transformer(errorFn);
  });
  goog.debug.entryPointRegistry.monitorAll(errorHandler);

  var e = assertThrows('expected error', goog.partial(errorFn, 'Hello!'));
  assertEquals('Error in protected function: Hello!', e.message);
  assertEquals('Hello!', lastError.message);

  goog.debug.entryPointRegistry.unmonitorAllIfPossible(errorHandler);

  e = assertThrows('expected error', goog.partial(errorFn, 'Goodbye!'));
  assertEquals('Goodbye!', e.message);
  assertEquals('Hello!', lastError.message);
}

function testRegisterAfterMonitor() {
  goog.debug.entryPointRegistry.monitorAll(errorHandler);
  goog.debug.entryPointRegistry.register(function(transformer) {
    errorFn = transformer(errorFn);
  });

  var e = assertThrows('expected error', goog.partial(errorFn, 'Hello!'));
  assertEquals('Error in protected function: Hello!', e.message);
  assertEquals('Hello!', lastError.message);

  goog.debug.entryPointRegistry.unmonitorAllIfPossible(errorHandler);

  e = assertThrows('expected error', goog.partial(errorFn, 'Goodbye!'));
  assertEquals('Goodbye!', e.message);
  assertEquals('Hello!', lastError.message);
}

function testInvalidUnmonitor() {
  goog.debug.entryPointRegistry.monitorAll(errorHandler);
  var e = assertThrows(
      'expected error',
      goog.partial(
          goog.debug.entryPointRegistry.unmonitorAllIfPossible,
          new goog.debug.ErrorHandler()));
  assertEquals(
      'Assertion failed: Only the most recent monitor can be unwrapped.',
      e.message);
  goog.debug.entryPointRegistry.unmonitorAllIfPossible(errorHandler);
}
