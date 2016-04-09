// Copyright 2015 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.ModalAriaVisibilityHelperTest');
goog.setTestOnly('goog.ui.ModalAriaVisibilityHelperTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.State');
goog.require('goog.dom');
goog.require('goog.string');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.ModalAriaVisibilityHelper');


function tearDown() {
  clearAriaState('div-1');
  clearAriaState('div-2');
  clearAriaState('div-4');
}


function testHide() {
  var helper = createHelper('div-1');
  helper.setBackgroundVisibility(true /* hide */);

  assertUnalteredElements();
  assertEmptyAriaHiddenState('div-1');
  assertAriaHiddenState('div-2', 'true');
  assertAriaHiddenState('div-4', 'true');
}


function testUnhide() {
  var helper = createHelper('div-1');
  helper.setBackgroundVisibility(false /* hide */);

  assertUnalteredElements();
  assertEmptyAriaHiddenState('div-1');
  assertEmptyAriaHiddenState('div-2');
  assertEmptyAriaHiddenState('div-4');
}


function testMultipleCalls() {
  var helper = createHelper('div-2');
  helper.setBackgroundVisibility(true /* hide */);

  assertUnalteredElements();
  assertAriaHiddenState('div-1', 'true');
  assertEmptyAriaHiddenState('div-2');
  assertAriaHiddenState('div-4', 'true');

  helper.setBackgroundVisibility(false /* hide */);

  assertUnalteredElements();
  assertEmptyAriaHiddenState('div-1');
  assertEmptyAriaHiddenState('div-2');
  assertEmptyAriaHiddenState('div-4');

  helper.setBackgroundVisibility(true /* hide */);

  assertUnalteredElements();
  assertAriaHiddenState('div-1', 'true');
  assertEmptyAriaHiddenState('div-2');
  assertAriaHiddenState('div-4', 'true');
}


function assertUnalteredElements() {
  assertEmptyAriaHiddenState('div-2-1');
  assertAriaHiddenState('div-3', 'false');
  assertAriaHiddenState('div-5', 'true');
}


/**
 * @param {string} id Id of the element.
 * @return {!goog.ui.ModalAriaVisibilityHelper}
 */
function createHelper(id) {
  return new goog.ui.ModalAriaVisibilityHelper(
      goog.dom.getElement(id), goog.dom.getDomHelper());
}


function clearAriaState(id) {
  goog.a11y.aria.removeState(
      goog.dom.getElement(id), goog.a11y.aria.State.HIDDEN);
}


/**
 * @param {string} id Id of the element.
 */
function assertEmptyAriaHiddenState(id) {
  var element = goog.dom.getElement(id);
  assertTrue(
      goog.string.isEmptyOrWhitespace(
          goog.string.makeSafe(
              goog.a11y.aria.getState(element, goog.a11y.aria.State.HIDDEN))));
}


/**
 * @param {string} id Id of the element.
 * @param {string} expectedState
 */
function assertAriaHiddenState(id, expectedState) {
  var element = goog.dom.getElement(id);
  assertEquals(
      expectedState,
      goog.a11y.aria.getState(element, goog.a11y.aria.State.HIDDEN));
}
