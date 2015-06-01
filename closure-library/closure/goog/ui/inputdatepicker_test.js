// Copyright 2008 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.InputDatePickerTest');
goog.setTestOnly('goog.ui.InputDatePickerTest');

goog.require('goog.dom');
goog.require('goog.i18n.DateTimeFormat');
goog.require('goog.i18n.DateTimeParse');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.InputDatePicker');

var dateTimeFormatter = new goog.i18n.DateTimeFormat('MM/dd/yyyy');
var dateTimeParser = new goog.i18n.DateTimeParse('MM/dd/yyyy');

var inputDatePicker;
var popupDatePicker;

function setUp() {
}

function tearDown() {
  if (inputDatePicker) {
    inputDatePicker.dispose();
  }
  if (popupDatePicker) {
    popupDatePicker.dispose();
  }
  goog.dom.getElement('renderElement').innerHTML = '';
  goog.dom.getElement('popupParent').innerHTML = '';
}


/**
 * Ensure that if setPopupParentElement is not called, that the
 * PopupDatePicker is parented to the body element.
 */
function test_setPopupParentElementDefault() {
  setPopupParentElement_(null);
  assertEquals('PopupDatePicker should be parented to the body element',
      document.body,
      popupDatePicker.getElement().parentNode);
}


/**
 * Ensure that if setPopupParentElement is called, that the
 * PopupDatePicker is parented to the specified element.
 */
function test_setPopupParentElement() {
  var popupParentElement = goog.dom.getElement('popupParent');
  setPopupParentElement_(popupParentElement);
  assertEquals('PopupDatePicker should be parented to the popupParent DIV',
      popupParentElement,
      popupDatePicker.getElement().parentNode);
}


/**
 * Creates a new InputDatePicker and calls setPopupParentElement with the
 * specified element, if provided. If el is null, then setPopupParentElement
 * is not called.
 * @param {Element} el If non-null, the argument to pass to
 *     inputDatePicker.setPopupParentElement().
 * @private
 */
function setPopupParentElement_(el) {
  inputDatePicker = new goog.ui.InputDatePicker(
      dateTimeFormatter,
      dateTimeParser);

  if (el) {
    inputDatePicker.setPopupParentElement(el);
  }

  inputDatePicker.render(goog.dom.getElement('renderElement'));
  popupDatePicker = inputDatePicker.popupDatePicker_;
}


function test_ItParsesDataCorrectly() {
  inputDatePicker = new goog.ui.InputDatePicker(
      dateTimeFormatter,
      dateTimeParser);
  inputDatePicker.render(goog.dom.getElement('renderElement'));

  inputDatePicker.createDom();
  inputDatePicker.setInputValue('8/9/2009');

  var parsedDate = inputDatePicker.getInputValueAsDate_();
  assertEquals(2009, parsedDate.getYear());
  assertEquals(7, parsedDate.getMonth()); // Months start from 0
  assertEquals(9, parsedDate.getDate());
}

function test_ItUpdatesItsValueOnPopupShown() {
  inputDatePicker = new goog.ui.InputDatePicker(
      dateTimeFormatter,
      dateTimeParser);

  setPopupParentElement_(null);
  inputDatePicker.setInputValue('1/1/1');
  inputDatePicker.showForElement(document.body);
  var inputValue = inputDatePicker.getInputValue();
  assertEquals('01/01/0001', inputValue);
}

function test_ItDoesNotClearInputOnPopupShown() {
  // if popup does not have a date set, don't update input value
  inputDatePicker = new goog.ui.InputDatePicker(
      dateTimeFormatter,
      dateTimeParser);

  setPopupParentElement_(null);
  inputDatePicker.setInputValue('i_am_not_a_date');
  inputDatePicker.showForElement(document.body);
  var inputValue = inputDatePicker.getInputValue();
  assertEquals('i_am_not_a_date', inputValue);
}
