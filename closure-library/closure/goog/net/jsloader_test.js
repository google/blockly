// Copyright 2011 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.net.jsloaderTest');
goog.setTestOnly('goog.net.jsloaderTest');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.net.jsloader');
goog.require('goog.net.jsloader.ErrorCode');
goog.require('goog.testing.AsyncTestCase');
goog.require('goog.testing.jsunit');

// Initialize the AsyncTestCase.
var testCase = goog.testing.AsyncTestCase.createAndInstall(document.title);
testCase.stepTimeout = 5 * 1000; // 5 seconds


testCase.setUp = function() {
  goog.provide = goog.nullFunction;
};


testCase.tearDown = function() {
  // Remove all the fake scripts.
  var scripts = goog.array.clone(
      document.getElementsByTagName(goog.dom.TagName.SCRIPT));
  for (var i = 0; i < scripts.length; i++) {
    if (scripts[i].src.indexOf('testdata') != -1) {
      goog.dom.removeNode(scripts[i]);
    }
  }
};


// Sunny day scenario for load function.
function testLoad() {
  testCase.waitForAsync('testLoad');

  window.test1 = null;
  var testUrl = 'testdata/jsloader_test1.js';
  var result = goog.net.jsloader.load(testUrl);
  result.addCallback(function() {
    testCase.continueTesting();

    var script = result.defaultScope_.script_;

    assertNotNull('script created', script);
    assertEquals('encoding is utf-8', 'UTF-8', script.charset);

    // Check that the URI matches ours.
    assertTrue('server URI', script.src.indexOf(testUrl) >= 0);

    // Check that the script was really loaded.
    assertEquals('verification object', 'Test #1 loaded', window.test1);
  });
}


// Sunny day scenario for loadAndVerify function.
function testLoadAndVerify() {
  testCase.waitForAsync('testLoadAndVerify');

  var testUrl = 'testdata/jsloader_test2.js';
  var result = goog.net.jsloader.loadAndVerify(testUrl, 'test2');
  result.addCallback(function(verifyObj) {
    testCase.continueTesting();

    // Check that the verification object has passed ok.
    assertEquals('verification object', 'Test #2 loaded', verifyObj);
  });
}


// What happens when the verification object is not set by the loaded script?
function testLoadAndVerifyError() {
  testCase.waitForAsync('testLoadAndVerifyError');

  var testUrl = 'testdata/jsloader_test2.js';
  var result = goog.net.jsloader.loadAndVerify(testUrl, 'fake');
  result.addErrback(function(error) {
    testCase.continueTesting();

    // Check that the error code is right.
    assertEquals('verification error', goog.net.jsloader.ErrorCode.VERIFY_ERROR,
        error.code);
  });
}


// Tests that callers can cancel the deferred without error.
function testLoadAndVerifyCancelled() {
  var testUrl = 'testdata/jsloader_test2.js';
  var result = goog.net.jsloader.loadAndVerify(testUrl, 'test2');
  result.cancel();
}


// Test the loadMany function.
function testLoadMany() {
  testCase.waitForAsync('testLoadMany');

  // Load test #3 and then #1.
  window.test1 = null;
  var testUrls1 = ['testdata/jsloader_test3.js', 'testdata/jsloader_test1.js'];
  goog.net.jsloader.loadMany(testUrls1);

  window.test3Callback = function(msg) {
    testCase.continueTesting();

    // Check that the 1st test was not loaded yet.
    assertEquals('verification object', null, window.test1);

    // Load test #4, which is supposed to wait for #1 to load.
    testCase.waitForAsync('testLoadMany');
    var testUrls2 = ['testdata/jsloader_test4.js'];
    goog.net.jsloader.loadMany(testUrls2);
  };

  window.test4Callback = function(msg) {
    testCase.continueTesting();

    // Check that the 1st test was already loaded.
    assertEquals('verification object', 'Test #1 loaded', window.test1);
  };
}
