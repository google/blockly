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

goog.provide('goog.events.EventTargetW3CTest');
goog.setTestOnly('goog.events.EventTargetW3CTest');

goog.require('goog.events.EventTarget');
goog.require('goog.events.eventTargetTester');
goog.require('goog.events.eventTargetTester.KeyType');
goog.require('goog.events.eventTargetTester.UnlistenReturnType');
goog.require('goog.testing.jsunit');

function setUp() {
  var newListenableFn = function() {
    return new goog.events.EventTarget();
  };
  var listenFn = function(src, type, listener, opt_capt, opt_handler) {
    src.addEventListener(type, listener, opt_capt, opt_handler);
  };
  var unlistenFn = function(src, type, listener, opt_capt, opt_handler) {
    src.removeEventListener(type, listener, opt_capt, opt_handler);
  };
  var dispatchEventFn = function(src, e) {
    return src.dispatchEvent(e);
  };

  goog.events.eventTargetTester.setUp(
      newListenableFn, listenFn, unlistenFn, null /* unlistenByKeyFn */,
      null /* listenOnceFn */, dispatchEventFn, null /* removeAllFn */,
      null /* getListenersFn */, null /* getListenerFn */,
      null /* hasListenerFn */,
      goog.events.eventTargetTester.KeyType.UNDEFINED,
      goog.events.eventTargetTester.UnlistenReturnType.UNDEFINED, true);
}

function tearDown() {
  goog.events.eventTargetTester.tearDown();
}
