// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.module.ModuleInfoTest');
goog.setTestOnly('goog.module.ModuleInfoTest');

goog.require('goog.module.BaseModule');
goog.require('goog.module.ModuleInfo');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');



var mockClock;


function setUp() {
  mockClock = new goog.testing.MockClock(true);
}


function tearDown() {
  mockClock.uninstall();
}


/**
 * Test initial state of module info.
 */
function testNotLoadedAtStart() {
  var m = new goog.module.ModuleInfo();
  assertFalse('Shouldn\'t be loaded', m.isLoaded());
}

var TestModule = function() {
  goog.module.BaseModule.call(this);
};
goog.inherits(TestModule, goog.module.BaseModule);


/**
 * Test loaded module info.
 */
function testOnLoad() {
  var m = new goog.module.ModuleInfo();

  m.setModuleConstructor(TestModule);
  m.onLoad(goog.nullFunction);
  assertTrue(m.isLoaded());

  var module = m.getModule();
  assertNotNull(module);
  assertTrue(module instanceof TestModule);

  m.dispose();
  assertTrue(m.isDisposed());
  assertTrue(
      'Disposing of ModuleInfo should dispose of its module',
      module.isDisposed());
}


/**
 * Test callbacks on module load.
 */
function testCallbacks() {
  var m = new goog.module.ModuleInfo();
  m.setModuleConstructor(TestModule);
  var index = 0;
  var a = -1, b = -1, c = -1, d = -1;
  var ca = m.registerCallback(function() { a = index++; });
  var cb = m.registerCallback(function() { b = index++; });
  var cc = m.registerCallback(function() { c = index++; });
  var cd = m.registerEarlyCallback(function() { d = index++; });
  cb.abort();
  m.onLoad(goog.nullFunction);

  assertTrue('callback A should have fired', a >= 0);
  assertFalse('callback B should have been aborted', b >= 0);
  assertTrue('callback C should have fired', c >= 0);
  assertTrue('early callback d should have fired', d >= 0);

  assertEquals('ordering of callbacks was wrong', 0, d);
  assertEquals('ordering of callbacks was wrong', 1, a);
  assertEquals('ordering of callbacks was wrong', 2, c);
}


function testErrorsInCallbacks() {
  var m = new goog.module.ModuleInfo();
  m.setModuleConstructor(TestModule);
  m.registerCallback(function() { throw new Error('boom1'); });
  m.registerCallback(function() { throw new Error('boom2'); });
  var hadError = m.onLoad(goog.nullFunction);
  assertTrue(hadError);

  var e = assertThrows(function() { mockClock.tick(); });

  assertEquals('boom1', e.message);
}


/**
 * Tests the error callbacks.
 */
function testErrbacks() {
  var m = new goog.module.ModuleInfo();
  m.setModuleConstructor(TestModule);
  var index = 0;
  var a = -1, b = -1, c = -1, d = -1;
  var ca = m.registerErrback(function() { a = index++; });
  var cb = m.registerErrback(function() { b = index++; });
  var cc = m.registerErrback(function() { c = index++; });
  m.onError('foo');

  assertTrue('callback A should have fired', a >= 0);
  assertTrue('callback B should have fired', b >= 0);
  assertTrue('callback C should have fired', c >= 0);

  assertEquals('ordering of callbacks was wrong', 0, a);
  assertEquals('ordering of callbacks was wrong', 1, b);
  assertEquals('ordering of callbacks was wrong', 2, c);
}
