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

goog.provide('goog.ui.editor.ToolbarFactoryTest');
goog.setTestOnly('goog.ui.editor.ToolbarFactoryTest');

goog.require('goog.dom');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.editor.TestHelper');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.editor.ToolbarFactory');
goog.require('goog.userAgent');

var helper;
var expectedFailures;

function setUpPage() {
  helper = new goog.testing.editor.TestHelper(goog.dom.getElement('myField'));
  expectedFailures = new goog.testing.ExpectedFailures();
}

function setUp() {
  helper.setUpEditableElement();
}

function tearDown() {
  helper.tearDownEditableElement();
  expectedFailures.handleTearDown();
}


/**
 * Makes sure we have the correct conversion table in
 * goog.ui.editor.ToolbarFactory.LEGACY_SIZE_TO_PX_MAP_. Can only be tested in
 * a browser that takes legacy size values as input to execCommand but returns
 * pixel size values from queryCommandValue. That's OK because that's the only
 * situation where this conversion table's precision is critical. (When it's
 * used to size the labels of the font size menu options it's ok if it's a few
 * pixels off.)
 */
function testGetLegacySizeFromPx() {
  // We will be warned if other browsers start behaving like webkit pre-534.7.
  expectedFailures.expectFailureFor(
      !goog.userAgent.WEBKIT ||
      (goog.userAgent.WEBKIT && goog.userAgent.isVersionOrHigher('534.7')));
  try {
    var fieldElem = goog.dom.getElement('myField');
    // Start from 1 because size 0 is bogus (becomes 16px, legacy size 3).
    for (var i = 1; i <
        goog.ui.editor.ToolbarFactory.LEGACY_SIZE_TO_PX_MAP_.length; i++) {
      helper.select(fieldElem, 0, fieldElem, 1);
      document.execCommand('fontSize', false, i);
      helper.select('foo', 1);
      var value = document.queryCommandValue('fontSize');
      assertEquals('Px size ' + value + ' should convert to legacy size ' + i,
          i, goog.ui.editor.ToolbarFactory.getLegacySizeFromPx(
              parseInt(value, 10)));
    }
  } catch (e) {
    expectedFailures.handleException(e);
  }
}
