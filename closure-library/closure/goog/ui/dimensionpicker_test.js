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

goog.provide('goog.ui.DimensionPickerTest');
goog.setTestOnly('goog.ui.DimensionPickerTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.events.KeyCodes');
goog.require('goog.math.Size');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.ui.rendererasserts');
goog.require('goog.ui.DimensionPicker');
goog.require('goog.ui.DimensionPickerRenderer');

var picker;
var render;
var decorate;

function setUpPage() {
  render = goog.dom.getElement('render');
  decorate = goog.dom.getElement('decorate');
}

function setUp() {
  picker = new goog.ui.DimensionPicker();
  goog.dom.removeChildren(render);
  goog.dom.removeChildren(decorate);
}

function tearDown() {
  picker.dispose();
}

function testConstructor() {
  assertNotNull('Should have successful construction', picker);
  assertNull('Should not be in document', picker.getElement());
}

function testRender() {
  picker.render(render);

  assertEquals('Should create 1 child', 1, render.childNodes.length);
  assertEquals(
      'Should be a div', goog.dom.TagName.DIV, render.firstChild.tagName);
}

function testDecorate() {
  picker.decorate(decorate);

  assertNotEquals(
      'Should add several children', decorate.firstChild, decorate.lastChild);
}

function testHighlightedSize() {
  picker.render(render);

  var size = picker.getValue();
  assertEquals('Should have 1 column highlighted initially.', 1, size.width);
  assertEquals('Should have 1 row highlighted initially.', 1, size.height);

  picker.setValue(1, 2);
  size = picker.getValue();
  assertEquals('Should have 1 column highlighted.', 1, size.width);
  assertEquals('Should have 2 rows highlighted.', 2, size.height);

  picker.setValue(new goog.math.Size(3, 4));
  size = picker.getValue();
  assertEquals('Should have 3 columns highlighted.', 3, size.width);
  assertEquals('Should have 4 rows highlighted.', 4, size.height);

  picker.setValue(new goog.math.Size(-3, 0));
  size = picker.getValue();
  assertEquals(
      'Should have 1 column highlighted when passed a negative ' +
          'column value.',
      1, size.width);
  assertEquals(
      'Should have 1 row highlighted when passed 0 as the row ' +
          'value.',
      1, size.height);

  picker.setValue(picker.maxColumns + 10, picker.maxRows + 2);
  size = picker.getValue();
  assertEquals(
      'Column value should be decreased to match max columns ' +
          'if it is too high.',
      picker.maxColumns, size.width);
  assertEquals(
      'Row value should be decreased to match max rows ' +
          'if it is too high.',
      picker.maxRows, size.height);
}

function testSizeShown() {
  picker.render(render);

  var size = picker.getSize();
  assertEquals('Should have 5 columns visible', 5, size.width);
  assertEquals('Should have 5 rows visible', 5, size.height);

  picker.setValue(4, 4);
  size = picker.getSize();
  assertEquals('Should have 5 columns visible', 5, size.width);
  assertEquals('Should have 5 rows visible', 5, size.height);

  picker.setValue(12, 13);
  size = picker.getSize();
  assertEquals('Should have 13 columns visible', 13, size.width);
  assertEquals('Should have 14 rows visible', 14, size.height);

  picker.setValue(20, 20);
  size = picker.getSize();
  assertEquals('Should have 20 columns visible', 20, size.width);
  assertEquals('Should have 20 rows visible', 20, size.height);

  picker.setValue(2, 3);
  size = picker.getSize();
  assertEquals('Should have 5 columns visible', 5, size.width);
  assertEquals('Should have 5 rows visible', 5, size.height);
}

function testHandleMove() {
  picker.render(render);
  var renderer = picker.getRenderer();
  var mouseMoveElem = renderer.getMouseMoveElement(picker);

  picker.rightToLeft_ = false;
  var e = {
    target: mouseMoveElem,
    offsetX: 18,  // Each grid square currently a magic 18px.
    offsetY: 36
  };

  picker.handleMouseMove(e);
  var size = picker.getValue();
  assertEquals('Should have 1 column highlighted', 1, size.width);
  assertEquals('Should have 2 rows highlighted', 2, size.height);

  picker.rightToLeft_ = true;

  picker.handleMouseMove(e);
  var size = picker.getValue();
  // In RTL we pick from the right side of the picker, so an offsetX of 0
  // would actually mean select all columns.
  assertEquals(
      'Should have columns to the right of the mouse highlighted',
      Math.ceil((mouseMoveElem.offsetWidth - e.offsetX) / 18), size.width);
  assertEquals('Should have 2 rows highlighted', 2, size.height);
}

function testHandleKeyboardEvents() {
  picker.render(render);

  picker.rightToLeft_ = false;

  var result = picker.handleKeyEvent({keyCode: goog.events.KeyCodes.DOWN});
  var size = picker.getValue();
  assertEquals('Should have 1 column highlighted', 1, size.width);
  assertEquals('Should have 2 rows highlighted', 2, size.height);
  assertTrue('Should handle DOWN key event', result);

  result = picker.handleKeyEvent({keyCode: goog.events.KeyCodes.RIGHT});
  size = picker.getValue();
  assertEquals('Should have 2 column highlighted', 2, size.width);
  assertEquals('Should have 2 rows highlighted', 2, size.height);
  assertTrue('Should handle RIGHT key event', result);

  result = picker.handleKeyEvent({keyCode: goog.events.KeyCodes.UP});
  size = picker.getValue();
  assertEquals('Should have 2 column highlighted', 2, size.width);
  assertEquals('Should have 1 rows highlighted', 1, size.height);
  assertTrue('Should handle UP key event', result);

  // Pressing UP when there is only 1 row should be handled but has no
  // effect.
  result = picker.handleKeyEvent({keyCode: goog.events.KeyCodes.UP});
  size = picker.getValue();
  assertEquals('Should have 2 column highlighted', 2, size.width);
  assertEquals('Should have 1 rows highlighted', 1, size.height);
  assertTrue('Should handle UP key event', result);

  result = picker.handleKeyEvent({keyCode: goog.events.KeyCodes.LEFT});
  size = picker.getValue();
  assertEquals('Should have 2 column highlighted', 1, size.width);
  assertEquals('Should have 1 rows highlighted', 1, size.height);
  assertTrue('Should handle LEFT key event', result);

  // Pressing LEFT when there is only 1 row should not be handled
  // allowing SubMenu to close.
  result = picker.handleKeyEvent({keyCode: goog.events.KeyCodes.LEFT});
  assertFalse(
      'Should not handle LEFT key event when there is only one column', result);

  picker.rightToLeft_ = true;

  // In RTL the roles of the LEFT and RIGHT keys are swapped.
  result = picker.handleKeyEvent({keyCode: goog.events.KeyCodes.LEFT});
  size = picker.getValue();
  assertEquals('Should have 2 column highlighted', 2, size.width);
  assertEquals('Should have 2 rows highlighted', 1, size.height);
  assertTrue('Should handle LEFT key event', result);

  result = picker.handleKeyEvent({keyCode: goog.events.KeyCodes.RIGHT});
  size = picker.getValue();
  assertEquals('Should have 2 column highlighted', 1, size.width);
  assertEquals('Should have 1 rows highlighted', 1, size.height);
  assertTrue('Should handle RIGHT key event', result);

  result = picker.handleKeyEvent({keyCode: goog.events.KeyCodes.RIGHT});
  assertFalse(
      'Should not handle RIGHT key event when there is only one column',
      result);
}

function testDispose() {
  var element = picker.getElement();
  picker.render(render);
  picker.dispose();
  assertTrue('Picker should have been disposed of', picker.isDisposed());
  assertNull(
      'Picker element reference should have been nulled out',
      picker.getElement());
}

function testRendererDoesntCallGetCssClassInConstructor() {
  goog.testing.ui.rendererasserts.assertNoGetCssClassCallsInConstructor(
      goog.ui.DimensionPickerRenderer);
}

function testSetAriaLabel() {
  assertNull(
      'Picker must not have aria label by default', picker.getAriaLabel());
  picker.setAriaLabel('My picker');
  picker.render(render);
  var element = picker.getElementStrict();
  assertNotNull('Element must not be null', element);
  assertEquals(
      'Picker element must have expected aria-label', 'My picker',
      element.getAttribute('aria-label'));
  assertTrue(goog.dom.isFocusableTabIndex(element));
  picker.setAriaLabel('My new picker');
  assertEquals(
      'Picker element must have updated aria-label', 'My new picker',
      element.getAttribute('aria-label'));
}
