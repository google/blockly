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

goog.provide('goog.labs.events.NonDisposableEventTargetTest');
goog.setTestOnly('goog.labs.events.NonDisposableEventTargetTest');

goog.require('goog.events.Listenable');
goog.require('goog.events.eventTargetTester');
goog.require('goog.events.eventTargetTester.KeyType');
goog.require('goog.events.eventTargetTester.UnlistenReturnType');
goog.require('goog.labs.events.NonDisposableEventTarget');
goog.require('goog.testing.jsunit');

function setUp() {
  var newListenableFn = function() {
    return new goog.labs.events.NonDisposableEventTarget();
  };
  var listenFn = function(src, type, listener, opt_capt, opt_handler) {
    return src.listen(type, listener, opt_capt, opt_handler);
  };
  var unlistenFn = function(src, type, listener, opt_capt, opt_handler) {
    return src.unlisten(type, listener, opt_capt, opt_handler);
  };
  var unlistenByKeyFn = function(src, key) {
    return src.unlistenByKey(key);
  };
  var listenOnceFn = function(src, type, listener, opt_capt, opt_handler) {
    return src.listenOnce(type, listener, opt_capt, opt_handler);
  };
  var dispatchEventFn = function(src, e) {
    return src.dispatchEvent(e);
  };
  var removeAllFn = function(src, opt_type, opt_capture) {
    return src.removeAllListeners(opt_type, opt_capture);
  };
  var getListenersFn = function(src, type, capture) {
    return src.getListeners(type, capture);
  };
  var getListenerFn = function(src, type, listener, capture, opt_handler) {
    return src.getListener(type, listener, capture, opt_handler);
  };
  var hasListenerFn = function(src, opt_type, opt_capture) {
    return src.hasListener(opt_type, opt_capture);
  };

  goog.events.eventTargetTester.setUp(
      newListenableFn, listenFn, unlistenFn, unlistenByKeyFn,
      listenOnceFn, dispatchEventFn,
      removeAllFn, getListenersFn, getListenerFn, hasListenerFn,
      goog.events.eventTargetTester.KeyType.NUMBER,
      goog.events.eventTargetTester.UnlistenReturnType.BOOLEAN, false);
}

function tearDown() {
  goog.events.eventTargetTester.tearDown();
}

function testRuntimeTypeIsCorrect() {
  var target = new goog.labs.events.NonDisposableEventTarget();
  assertTrue(goog.events.Listenable.isImplementedBy(target));
}
