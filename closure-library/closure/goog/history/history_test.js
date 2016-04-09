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

/**
 * @fileoverview Unit tests for goog.history.History.
 */

/** @suppress {extraProvide} */
goog.provide('goog.HistoryTest');

goog.require('goog.History');
goog.require('goog.dispose');
goog.require('goog.dom');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.string.Const');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');

goog.setTestOnly('goog.HistoryTest');


// Mimimal function to exercise construction.
function testCreation() {
  var input = goog.dom.getElement('hidden-input');
  var iframe = goog.dom.getElement('hidden-iframe');

  try {
    var history = new goog.History(undefined, undefined, input, iframe);
  } finally {
    goog.dispose(history);
  }

  // Test that SafeHtml.create() calls in constructor succeed.
  try {
    // Undefined opt_input and opt_iframe will result in use document.write(),
    // which in some browsers overrides the current page and causes the
    // test to fail.
    var history = new goog.History(
        true, goog.html.TrustedResourceUrl.fromConstant(
                  goog.string.Const.from('blank_test_helper.html')),
        input, iframe);
  } finally {
    goog.dispose(history);
  }

  // Test that SafeHtml.create() works with legacy conversion from string.
  try {
    var history =
        new goog.History(true, 'blank_test_helper.html', input, iframe);
  } finally {
    goog.dispose(history);
  }
}

function testIsHashChangeSupported() {
  // This is the policy currently implemented.
  var supportsOnHashChange =
      (goog.userAgent.IE ? document.documentMode >= 8 :
                           'onhashchange' in window);

  assertEquals(supportsOnHashChange, goog.History.isOnHashChangeSupported());
}

// TODO(nnaze): Test additional behavior.
