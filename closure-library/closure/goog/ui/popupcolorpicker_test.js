// Copyright 2007 The Closure Library Authors. All Rights Reserved.
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

goog.provide('goog.ui.PopupColorPickerTest');
goog.setTestOnly('goog.ui.PopupColorPickerTest');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.ColorPicker');
goog.require('goog.ui.PopupColorPicker');

// Unittest to ensure that the popup gets created in createDom().
function testPopupCreation() {
  var picker = new goog.ui.PopupColorPicker();
  picker.createDom();
  assertNotNull(picker.getPopup());
}

function testAutoHideIsSetProperly() {
  var picker = new goog.ui.PopupColorPicker();
  picker.createDom();
  picker.setAutoHide(true);
  var containingDiv = goog.dom.getElement('containingDiv');
  picker.setAutoHideRegion(containingDiv);
  assertTrue(picker.getAutoHide());
  assertEquals(containingDiv, picker.getAutoHideRegion());
}

// Unittest to ensure the popup opens with a custom color picker.
function testCustomColorPicker() {
  var button1 = document.getElementById('button1');
  var domHelper = goog.dom.getDomHelper();
  var colorPicker = new goog.ui.ColorPicker();
  colorPicker.setColors(['#ffffff', '#000000']);
  var picker = new goog.ui.PopupColorPicker(domHelper, colorPicker);
  picker.render();
  picker.attach(button1);
  assertNotNull(picker.getColorPicker());
  assertNotNull(picker.getPopup().getElement());
  assertNull(picker.getSelectedColor());

  var changeEvents = 0;
  goog.events.listen(picker, goog.ui.ColorPicker.EventType.CHANGE, function(e) {
    changeEvents++;
  });

  // Select the first color.
  goog.testing.events.fireClickSequence(button1);
  goog.testing.events.fireClickSequence(
      document.getElementById('goog-palette-cell-0').firstChild);
  assertEquals('#ffffff', picker.getSelectedColor());
  assertEquals(1, changeEvents);
}
