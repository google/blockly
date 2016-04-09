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

goog.provide('goog.ui.CharPickerTest');
goog.setTestOnly('goog.ui.CharPickerTest');

goog.require('goog.a11y.aria');
goog.require('goog.a11y.aria.State');
goog.require('goog.dispose');
goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.events.EventType');
goog.require('goog.i18n.CharPickerData');
goog.require('goog.i18n.uChar.NameFetcher');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.mockmatchers');
goog.require('goog.ui.CharPicker');
goog.require('goog.ui.FlatButtonRenderer');

var charPicker, charPickerData, charPickerElement;
var mockControl, charNameFetcherMock;

function setUp() {
  mockControl = new goog.testing.MockControl();
  charNameFetcherMock = mockControl.createLooseMock(
      goog.i18n.uChar.NameFetcher, true /* opt_ignoreUnexpectedCalls */);

  charPickerData = new goog.i18n.CharPickerData();
  charPickerElement = goog.dom.getElement('charpicker');

  charPicker = new goog.ui.CharPicker(charPickerData, charNameFetcherMock);
}

function tearDown() {
  goog.dispose(charPicker);
  goog.dom.removeChildren(charPickerElement);
  mockControl.$tearDown();
}

function testAriaLabelIsUpdatedOnFocus() {
  var character = '←';
  var characterName = 'right arrow';

  charNameFetcherMock.getName(character, goog.testing.mockmatchers.isFunction)
      .$does(function(c, callback) { callback(characterName); });

  mockControl.$replayAll();

  charPicker.decorate(charPickerElement);

  // Get the first button elements within the grid div and override its
  // char attribute so the test doesn't depend on the actual grid content.
  var gridElement = goog.dom.getElementByClass(
      goog.getCssName('goog-char-picker-grid'), charPickerElement);
  var buttonElement = goog.dom.getElementsByClass(
      goog.ui.FlatButtonRenderer.CSS_CLASS, gridElement)[0];
  buttonElement.setAttribute('char', character);

  // Trigger a focus event on the button element.
  goog.testing.events.fireBrowserEvent(
      new goog.events.Event(goog.events.EventType.FOCUS, buttonElement));

  mockControl.$verifyAll();

  var ariaLabel =
      goog.a11y.aria.getState(buttonElement, goog.a11y.aria.State.LABEL);
  assertEquals(
      'The aria label should be updated when the button' +
          'gains focus.',
      characterName, ariaLabel);
}
