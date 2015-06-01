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

goog.provide('goog.editor.focusTest');
goog.setTestOnly('goog.editor.focusTest');

goog.require('goog.dom.selection');
goog.require('goog.editor.BrowserFeature');
goog.require('goog.editor.focus');
goog.require('goog.testing.jsunit');

function setUp() {
  // Make sure focus is not in the input to begin with.
  var dummy = document.getElementById('dummyLink');
  dummy.focus();
}


/**
 * Tests that focusInputField() puts focus in the input field and sets the
 * cursor to the end of the text cointained inside.
 */
function testFocusInputField() {
  var input = document.getElementById('myInput');
  assertNotEquals('Input should not be focused initially',
                  input,
                  document.activeElement);

  goog.editor.focus.focusInputField(input);
  if (goog.editor.BrowserFeature.HAS_ACTIVE_ELEMENT) {
    assertEquals('Input should be focused after call to focusInputField',
                 input,
                 document.activeElement);
  }
  assertEquals('Selection should start at the end of the input text',
               input.value.length,
               goog.dom.selection.getStart(input));
  assertEquals('Selection should end at the end of the input text',
               input.value.length,
               goog.dom.selection.getEnd(input));
}
