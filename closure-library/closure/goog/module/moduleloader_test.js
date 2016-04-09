// Copyright 2009 The Closure Library Authors. All Rights Reserved.
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
 * @fileoverview Tests for goog.module.ModuleLoader.
 * @author nicksantos@google.com (Nick Santos)
 */

goog.provide('goog.module.ModuleLoaderTest');

goog.require('goog.Promise');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events');
goog.require('goog.functions');
goog.require('goog.module.ModuleLoader');
goog.require('goog.module.ModuleManager');
goog.require('goog.net.BulkLoader');
goog.require('goog.net.XmlHttp');
goog.require('goog.object');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.TestCase');
goog.require('goog.testing.events.EventObserver');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

goog.setTestOnly('goog.module.ModuleLoaderTest');


var modA1Loaded = false;
var modA2Loaded = false;
var modB1Loaded = false;

var moduleLoader = null;
var moduleManager = null;
var stubs = new goog.testing.PropertyReplacer();

var EventType = goog.module.ModuleLoader.EventType;
var observer;

function setUpPage() {
  goog.testing.TestCase.getActiveTestCase().promiseTimeout = 10000;  // 10s
}

function setUp() {
  modA1Loaded = false;
  modA2Loaded = false;
  modB1Loaded = false;

  goog.provide = goog.nullFunction;
  moduleManager = goog.module.ModuleManager.getInstance();
  stubs.replace(moduleManager, 'getBackOff_', goog.functions.constant(0));

  moduleLoader = new goog.module.ModuleLoader();
  observer = new goog.testing.events.EventObserver();

  goog.events.listen(moduleLoader, goog.object.getValues(EventType), observer);

  moduleManager.setLoader(moduleLoader);
  moduleManager.setAllModuleInfo({'modA': [], 'modB': ['modA']});
  moduleManager.setModuleUris({
    'modA': ['testdata/modA_1.js', 'testdata/modA_2.js'],
    'modB': ['testdata/modB_1.js']
  });

  assertNotLoaded('modA');
  assertNotLoaded('modB');
  assertFalse(modA1Loaded);
}

function tearDown() {
  stubs.reset();
  goog.dispose(moduleLoader);

  // Ensure that the module manager was created.
  assertNotNull(goog.module.ModuleManager.getInstance());
  moduleManager = goog.module.ModuleManager.instance_ = null;

  // tear down the module loaded flag.
  modA1Loaded = false;

  // Remove all the fake scripts.
  var scripts =
      goog.array.clone(document.getElementsByTagName(goog.dom.TagName.SCRIPT));
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src.indexOf('testdata') != -1) {
      goog.dom.removeNode(scripts[i]);
    }
  }
}

function testLoadModuleA() {
  return new goog
      .Promise(function(resolve, reject) {
        moduleManager.execOnLoad('modA', function() {
          assertLoaded('modA');
          assertNotLoaded('modB');
          assertTrue(modA1Loaded);

          // The code is not evaluated immediately, but only after a browser
          // yield.
          assertEquals(
              'EVALUATE_CODE', 0,
              observer.getEvents(EventType.EVALUATE_CODE).length);
          assertEquals(
              'REQUEST_SUCCESS', 1,
              observer.getEvents(EventType.REQUEST_SUCCESS).length);
          assertArrayEquals(
              ['modA'],
              observer.getEvents(EventType.REQUEST_SUCCESS)[0].moduleIds);
          assertEquals(
              'REQUEST_ERROR', 0,
              observer.getEvents(EventType.REQUEST_ERROR).length);
          resolve();
        });
      })
      .then(function() {
        assertEquals(
            'EVALUATE_CODE after tick', 1,
            observer.getEvents(EventType.EVALUATE_CODE).length);
        assertEquals(
            'REQUEST_SUCCESS after tick', 1,
            observer.getEvents(EventType.REQUEST_SUCCESS).length);
        assertEquals(
            'REQUEST_ERROR after tick', 0,
            observer.getEvents(EventType.REQUEST_ERROR).length);
      });
}

function testLoadModuleB() {
  return new goog
      .Promise(function(resolve, reject) {
        moduleManager.execOnLoad('modB', resolve);
      })
      .then(function() {
        assertLoaded('modA');
        assertLoaded('modB');
        assertTrue(modA1Loaded);
      });
}

function testLoadDebugModuleA() {
  moduleLoader.setDebugMode(true);
  return new goog
      .Promise(function(resolve, reject) {
        moduleManager.execOnLoad('modA', resolve);
      })
      .then(function() {
        assertLoaded('modA');
        assertNotLoaded('modB');
        assertTrue(modA1Loaded);
      });
}

function testLoadDebugModuleB() {
  moduleLoader.setDebugMode(true);
  return new goog
      .Promise(function(resolve, reject) {
        moduleManager.execOnLoad('modB', resolve);
      })
      .then(function() {
        assertLoaded('modA');
        assertLoaded('modB');
        assertTrue(modA1Loaded);
      });
}

function testLoadDebugModuleAThenB() {
  // Swap the script tags of module A, to introduce a race condition.
  // See the comments on this in ModuleLoader's debug loader.
  moduleManager.setModuleUris({
    'modA': ['testdata/modA_2.js', 'testdata/modA_1.js'],
    'modB': ['testdata/modB_1.js']
  });
  moduleLoader.setDebugMode(true);
  return new goog
      .Promise(function(resolve, reject) {
        moduleManager.execOnLoad('modB', resolve);
      })
      .then(function() {
        assertLoaded('modA');
        assertLoaded('modB');

        var scripts = goog.array.clone(
            document.getElementsByTagName(goog.dom.TagName.SCRIPT));
        var seenLastScriptOfModuleA = false;
        for (var i = 0; i < scripts.length; i++) {
          var uri = scripts[i].src;
          if (uri.indexOf('modA_1.js') >= 0) {
            seenLastScriptOfModuleA = true;
          } else if (uri.indexOf('modB') >= 0) {
            assertTrue(seenLastScriptOfModuleA);
          }
        }
      });
}

function testSourceInjection() {
  moduleLoader.setSourceUrlInjection(true);
  return assertSourceInjection();
}

function testSourceInjectionViaDebugMode() {
  moduleLoader.setDebugMode(true);
  return assertSourceInjection();
}

function assertSourceInjection() {
  return new goog
      .Promise(function(resolve, reject) {
        moduleManager.execOnLoad('modB', resolve);
      })
      .then(function() {
        assertTrue(!!throwErrorInModuleB);

        var ex = assertThrows(function() { throwErrorInModuleB(); });

        if (!ex.stack) {
          return;
        }

        var stackTrace = ex.stack.toString();
        var expectedString = 'testdata/modB_1.js';

        if (goog.module.ModuleLoader.supportsSourceUrlStackTraces()) {
          // Source URL should be added in eval or in jsloader.
          assertContains(expectedString, stackTrace);
        } else if (moduleLoader.getDebugMode()) {
          // Browsers used jsloader, thus URLs are present.
          assertContains(expectedString, stackTrace);
        } else {
          // Browser used eval, does not support source URL.
          assertNotContains(expectedString, stackTrace);
        }
      });
}

function testModuleLoaderRecursesTooDeep(opt_numModules) {
  // There was a bug in the module loader where it would retry recursively
  // whenever there was a synchronous failure in the module load. When you
  // asked for modB, it would try to load its dependency modA. When modA
  // failed, it would move onto modB, and then start over, repeating until it
  // ran out of stack.
  var numModules = opt_numModules || 1;
  var uris = {};
  var deps = {};
  var mods = [];
  for (var num = 0; num < numModules; num++) {
    var modName = 'mod' + num;
    mods.unshift(modName);
    uris[modName] = [];
    deps[modName] = num ? ['mod' + (num - 1)] : [];
    for (var i = 0; i < 5; i++) {
      uris[modName].push(
          'http://www.google.com/crossdomain' + num + 'x' + i + '.js');
    }
  }

  moduleManager.setAllModuleInfo(deps);
  moduleManager.setModuleUris(uris);

  // Make all XHRs throw an error, so that we test the error-handling
  // functionality.
  var oldXmlHttp = goog.net.XmlHttp;
  stubs.set(goog.net, 'XmlHttp', function() {
    return {open: goog.functions.error('mock error'), abort: goog.nullFunction};
  });
  goog.object.extend(goog.net.XmlHttp, oldXmlHttp);

  var errorCount = 0;
  var errorIds = [];
  var errorHandler = function(ignored, modId) {
    errorCount++;
    errorIds.push(modId);
  };
  moduleManager.registerCallback(
      goog.module.ModuleManager.CallbackType.ERROR, errorHandler);

  moduleManager.execOnLoad(
      mods[0], function() { fail('modB should not load successfully'); });

  assertEquals(mods.length, errorCount);

  goog.array.sort(mods);
  goog.array.sort(errorIds);
  assertArrayEquals(mods, errorIds);

  assertArrayEquals([], moduleManager.requestedModuleIdsQueue_);
  assertArrayEquals([], moduleManager.userInitiatedLoadingModuleIds_);
}

function testModuleLoaderRecursesTooDeep2modules() {
  testModuleLoaderRecursesTooDeep(2);
}

function testModuleLoaderRecursesTooDeep3modules() {
  testModuleLoaderRecursesTooDeep(3);
}

function testModuleLoaderRecursesTooDeep4modules() {
  testModuleLoaderRecursesTooDeep(3);
}

function testErrback() {
  // Don't run this test on IE, because the way the test runner catches
  // errors on IE plays badly with the simulated errors in the test.
  if (goog.userAgent.IE) return;

  // Modules will throw an exception if this boolean is set to true.
  modA1Loaded = true;

  return new goog.Promise(function(resolve, reject) {
    var errorHandler = function() {
      assertNotLoaded('modA');
      resolve();
    };
    moduleManager.registerCallback(
        goog.module.ModuleManager.CallbackType.ERROR, errorHandler);

    moduleManager.execOnLoad(
        'modA', function() { fail('modA should not load successfully'); });
  });
}

function testEventError() {
  // Don't run this test on older IE, because the way the test runner catches
  // errors on IE plays badly with the simulated errors in the test.
  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher(11)) {
    return;
  }

  // Modules will throw an exception if this boolean is set to true.
  modA1Loaded = true;

  return new goog
      .Promise(function(resolve, reject) {
        var errorHandler = function() {
          assertNotLoaded('modA');
          resolve();
        };
        moduleManager.registerCallback(
            goog.module.ModuleManager.CallbackType.ERROR, errorHandler);

        moduleManager.execOnLoad(
            'modA', function() { fail('modA should not load successfully'); });
      })
      .then(function() {
        assertEquals(
            'EVALUATE_CODE', 3,
            observer.getEvents(EventType.EVALUATE_CODE).length);
        assertUndefined(observer.getEvents(EventType.EVALUATE_CODE)[0].error);

        assertEquals(
            'REQUEST_SUCCESS', 3,
            observer.getEvents(EventType.REQUEST_SUCCESS).length);
        assertUndefined(observer.getEvents(EventType.REQUEST_SUCCESS)[0].error);

        var requestErrors = observer.getEvents(EventType.REQUEST_ERROR);
        assertEquals('REQUEST_ERROR', 3, requestErrors.length);
        assertNotNull(requestErrors[0].error);
        var expectedString = 'loaded twice';
        var messageAndStack =
            requestErrors[0].error.message + requestErrors[0].error.stack;
        assertContains(expectedString, messageAndStack);
      });
}

function testPrefetchThenLoadModuleA() {
  moduleManager.prefetchModule('modA');
  stubs.set(goog.net.BulkLoader.prototype, 'load', function() {
    fail('modA should not be reloaded');
  });

  return new goog
      .Promise(function(resolve, reject) {
        moduleManager.execOnLoad('modA', resolve);
      })
      .then(function() {
        assertLoaded('modA');
        assertEquals(
            'REQUEST_SUCCESS', 1,
            observer.getEvents(EventType.REQUEST_SUCCESS).length);
        assertArrayEquals(
            ['modA'],
            observer.getEvents(EventType.REQUEST_SUCCESS)[0].moduleIds);
        assertEquals(
            'REQUEST_ERROR', 0,
            observer.getEvents(EventType.REQUEST_ERROR).length);
      });
}

function testPrefetchThenLoadModuleB() {
  moduleManager.prefetchModule('modB');
  stubs.set(goog.net.BulkLoader.prototype, 'load', function() {
    fail('modA and modB should not be reloaded');
  });

  return new goog
      .Promise(function(resolve, reject) {
        moduleManager.execOnLoad('modB', resolve);
      })
      .then(function() {
        assertLoaded('modA');
        assertLoaded('modB');
        assertEquals(
            'REQUEST_SUCCESS', 2,
            observer.getEvents(EventType.REQUEST_SUCCESS).length);
        assertArrayEquals(
            ['modA'],
            observer.getEvents(EventType.REQUEST_SUCCESS)[0].moduleIds);
        assertArrayEquals(
            ['modB'],
            observer.getEvents(EventType.REQUEST_SUCCESS)[1].moduleIds);
        assertEquals(
            'REQUEST_ERROR', 0,
            observer.getEvents(EventType.REQUEST_ERROR).length);
      });
}

function testPrefetchModuleAThenLoadModuleB() {
  moduleManager.prefetchModule('modA');

  return new goog
      .Promise(function(resolve, reject) {
        moduleManager.execOnLoad('modB', resolve);
      })
      .then(function() {
        assertLoaded('modA');
        assertLoaded('modB');
        assertEquals(
            'REQUEST_SUCCESS', 2,
            observer.getEvents(EventType.REQUEST_SUCCESS).length);
        assertArrayEquals(
            ['modA'],
            observer.getEvents(EventType.REQUEST_SUCCESS)[0].moduleIds);
        assertArrayEquals(
            ['modB'],
            observer.getEvents(EventType.REQUEST_SUCCESS)[1].moduleIds);
        assertEquals(
            'REQUEST_ERROR', 0,
            observer.getEvents(EventType.REQUEST_ERROR).length);
      });
}

function testLoadModuleBThenPrefetchModuleA() {
  return new goog
      .Promise(function(resolve, reject) {
        moduleManager.execOnLoad('modB', resolve);
      })
      .then(function() {
        assertLoaded('modA');
        assertLoaded('modB');
        assertEquals(
            'REQUEST_SUCCESS', 2,
            observer.getEvents(EventType.REQUEST_SUCCESS).length);
        assertArrayEquals(
            ['modA'],
            observer.getEvents(EventType.REQUEST_SUCCESS)[0].moduleIds);
        assertArrayEquals(
            ['modB'],
            observer.getEvents(EventType.REQUEST_SUCCESS)[1].moduleIds);
        assertEquals(
            'REQUEST_ERROR', 0,
            observer.getEvents(EventType.REQUEST_ERROR).length);
        assertThrows('Module load already requested: modB', function() {
          moduleManager.prefetchModule('modA');
        });
      });
}

function testPrefetchModuleWithBatchModeEnabled() {
  moduleManager.setBatchModeEnabled(true);
  assertThrows(
      'Modules prefetching is not supported in batch mode',
      function() { moduleManager.prefetchModule('modA'); });
}

function testLoadErrorCallbackExecutedWhenPrefetchFails() {
  // Make all XHRs throw an error, so that we test the error-handling
  // functionality.
  var oldXmlHttp = goog.net.XmlHttp;
  stubs.set(goog.net, 'XmlHttp', function() {
    return {open: goog.functions.error('mock error'), abort: goog.nullFunction};
  });
  goog.object.extend(goog.net.XmlHttp, oldXmlHttp);

  var errorCount = 0;
  var errorHandler = function() { errorCount++; };
  moduleManager.registerCallback(
      goog.module.ModuleManager.CallbackType.ERROR, errorHandler);

  moduleLoader.prefetchModule('modA', moduleManager.moduleInfoMap_['modA']);
  moduleLoader.loadModules(['modA'], moduleManager.moduleInfoMap_, function() {
    fail('modA should not load successfully');
  }, errorHandler);

  assertEquals(1, errorCount);
}

function assertLoaded(id) {
  assertTrue(moduleManager.getModuleInfo(id).isLoaded());
}

function assertNotLoaded(id) {
  assertFalse(moduleManager.getModuleInfo(id).isLoaded());
}
