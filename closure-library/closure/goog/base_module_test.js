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


/**
 * @fileoverview Unit tests for Closure's base.js's goog.module support.
 */

goog.module('goog.baseModuleTest');
goog.module.declareTestMethods();
goog.setTestOnly('goog.baseModuleTest');


// Used to test dynamic loading works, see testRequire*
var Timer = goog.require('goog.Timer');
var Replacer = goog.require('goog.testing.PropertyReplacer');
var jsunit = goog.require('goog.testing.jsunit');

var testModule = goog.require('goog.test_module');

var stubs = new Replacer();

function assertProvideFails(namespace) {
  assertThrows('goog.provide(' + namespace + ') should have failed',
      goog.partial(goog.provide, namespace));
}

function assertModuleFails(namespace) {
  assertThrows('goog.module(' + namespace + ') should have failed',
      goog.partial(goog.module, namespace));
}

exports = {
  teardown: function() {
    stubs.reset();
  },

  testModuleDecl: function() {
    // assert that goog.module doesn't modify the global namespace
    assertUndefined('module failed to protect global namespace: ' +
        'goog.baseModuleTest', goog.baseModuleTest);
  },

  testModuleScoping: function() {
    // assert test functions are exported to the global namespace
    assertNotUndefined('module failed: testModule', testModule);
    assertTrue('module failed: testModule',
        goog.isFunction(goog.global.testModuleScoping));
  },

  testProvideStrictness1: function() {
    assertModuleFails('goog.xy'); // not in goog.loadModule

    assertProvideFails('goog.baseModuleTest');  // this file.
  },

  testProvideStrictness2: function() {
    // goog.module "provides" a namespace
    assertTrue(goog.isProvided_('goog.baseModuleTest'));
  },

  testExportSymbol: function() {
    // Assert that export symbol works from within a goog.module.
    var date = new Date();

    assertTrue(typeof nodots == 'undefined');
    goog.exportSymbol('nodots', date);
    assertEquals(date, nodots);  // globals are accessible from within a module.
    nodots = undefined;
  },

  //=== tests for Require logic ===

  testLegacyRequire: function() {
    // goog.Timer is a legacy module loaded above
    assertNotUndefined('goog.Timer should be available', goog.Timer);

    // Verify that a legacy module can be aliases with goog.require
    assertTrue('Timer should be the goog.Timer namespace object',
        goog.Timer === Timer);

    // and its dependencies
    assertNotUndefined(
        'goog.events.EventTarget should be available',
        /** @suppress {missingRequire} */ goog.events.EventTarget);
  },

  testRequireModule: function() {
    assertEquals('module failed to export legacy namespace: ' +
        'goog.test_module', testModule, goog.test_module);
    assertUndefined('module failed to protect global namespace: ' +
        'goog.test_module_dep', goog.test_module_dep);

    // The test module is available under its alias
    assertNotUndefined('testModule is loaded', testModule);
    assertTrue('module failed: testModule', goog.isFunction(testModule));
  }
};

exports.testThisInModule = (function() {
  assertEquals(this, goog.global);
}).bind(this);
