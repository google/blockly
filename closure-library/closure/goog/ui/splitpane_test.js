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

goog.provide('goog.ui.SplitPaneTest');
goog.setTestOnly('goog.ui.SplitPaneTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.math.Size');
goog.require('goog.style');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');
goog.require('goog.ui.Component');
goog.require('goog.ui.SplitPane');

var splitpane;
var leftComponent;
var rightComponent;

function setUp() {
  leftComponent = new goog.ui.Component();
  rightComponent = new goog.ui.Component();
  splitpane = new goog.ui.SplitPane(
      leftComponent, rightComponent, goog.ui.SplitPane.Orientation.HORIZONTAL);
}

function tearDown() {
  splitpane.dispose();
  leftComponent.dispose();
  rightComponent.dispose();
  goog.dom.removeChildren(goog.dom.getElement('sandbox'));
}

function testRender() {
  splitpane.render(goog.dom.getElement('sandbox'));
  assertEquals(
      1,
      goog.dom
          .getElementsByTagNameAndClass(goog.dom.TagName.DIV, 'goog-splitpane')
          .length);
  assertEquals(
      1, goog.dom
             .getElementsByTagNameAndClass(
                 goog.dom.TagName.DIV, 'goog-splitpane-first-container')
             .length);
  assertEquals(
      1, goog.dom
             .getElementsByTagNameAndClass(
                 goog.dom.TagName.DIV, 'goog-splitpane-second-container')
             .length);
  assertEquals(
      1, goog.dom
             .getElementsByTagNameAndClass(
                 goog.dom.TagName.DIV, 'goog-splitpane-handle')
             .length);
}

function testDecorate() {
  var mainDiv = goog.dom.createDom(
      goog.dom.TagName.DIV, 'goog-splitpane',
      goog.dom.createDom(
          goog.dom.TagName.DIV, 'goog-splitpane-first-container'),
      goog.dom.createDom(
          goog.dom.TagName.DIV, 'goog-splitpane-second-container'),
      goog.dom.createDom(goog.dom.TagName.DIV, 'goog-splitpane-handle'));
  var sandbox = goog.dom.getElement('sandbox');
  goog.dom.appendChild(sandbox, mainDiv);

  splitpane.decorate(mainDiv);
}

function testDecorateWithNestedSplitPane() {
  // Create a standard split pane to be nested within another split pane.
  var innerSplitPaneDiv = goog.dom.createDom(
      goog.dom.TagName.DIV, 'goog-splitpane',
      goog.dom.createDom(
          goog.dom.TagName.DIV, 'goog-splitpane-first-container e1'),
      goog.dom.createDom(
          goog.dom.TagName.DIV, 'goog-splitpane-second-container e2'),
      goog.dom.createDom(goog.dom.TagName.DIV, 'goog-splitpane-handle e3'));

  // Create a split pane containing a split pane instance.
  var outerSplitPaneDiv = goog.dom.createDom(
      goog.dom.TagName.DIV, 'goog-splitpane',
      goog.dom.createDom(
          goog.dom.TagName.DIV, 'goog-splitpane-first-container e4',
          innerSplitPaneDiv),
      goog.dom.createDom(
          goog.dom.TagName.DIV, 'goog-splitpane-second-container e5'),
      goog.dom.createDom(goog.dom.TagName.DIV, 'goog-splitpane-handle e6'));

  var sandbox = goog.dom.getElement('sandbox');
  goog.dom.appendChild(sandbox, outerSplitPaneDiv);

  // Decorate and check that the correct containers and handle are used.
  splitpane.decorate(outerSplitPaneDiv);
  assertTrue(
      goog.dom.classlist.contains(splitpane.firstComponentContainer_, 'e4'));
  assertTrue(
      goog.dom.classlist.contains(splitpane.secondComponentContainer_, 'e5'));
  assertTrue(goog.dom.classlist.contains(splitpane.splitpaneHandle_, 'e6'));
}

function testSetSize() {
  splitpane.setInitialSize(200);
  splitpane.setHandleSize(10);
  splitpane.render(goog.dom.getElement('sandbox'));

  splitpane.setSize(new goog.math.Size(500, 300));
  assertEquals(200, splitpane.getFirstComponentSize());

  var splitpaneSize = goog.style.getBorderBoxSize(splitpane.getElement());
  assertEquals(500, splitpaneSize.width);
  assertEquals(300, splitpaneSize.height);
}

function testOrientationChange() {
  splitpane.setInitialSize(200);
  splitpane.setHandleSize(10);
  splitpane.render(goog.dom.getElement('sandbox'));
  splitpane.setSize(new goog.math.Size(500, 300));

  var first = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, 'goog-splitpane-first-container')[0];
  var second = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, 'goog-splitpane-second-container')[0];
  var handle = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, 'goog-splitpane-handle')[0];

  var handleSize = goog.style.getBorderBoxSize(handle);
  assertEquals(10, handleSize.width);
  assertEquals(300, handleSize.height);

  var firstSize = goog.style.getBorderBoxSize(first);
  assertEquals(200, firstSize.width);
  assertEquals(300, firstSize.height);

  var secondSize = goog.style.getBorderBoxSize(second);
  assertEquals(290, secondSize.width);  // 500 - 200 - 10 = 290
  assertEquals(300, secondSize.height);

  splitpane.setOrientation(goog.ui.SplitPane.Orientation.VERTICAL);

  handleSize = goog.style.getBorderBoxSize(handle);
  assertEquals(10, handleSize.height);
  assertEquals(500, handleSize.width);

  firstSize = goog.style.getBorderBoxSize(first);
  assertEquals(120, firstSize.height);  // 200 * 300/500 = 120
  assertEquals(500, firstSize.width);

  secondSize = goog.style.getBorderBoxSize(second);
  assertEquals(170, secondSize.height);  // 300 - 120 - 10 = 170
  assertEquals(500, secondSize.width);

  splitpane.setOrientation(goog.ui.SplitPane.Orientation.HORIZONTAL);

  handleSize = goog.style.getBorderBoxSize(handle);
  assertEquals(10, handleSize.width);
  assertEquals(300, handleSize.height);

  firstSize = goog.style.getBorderBoxSize(first);
  assertEquals(200, firstSize.width);
  assertEquals(300, firstSize.height);

  secondSize = goog.style.getBorderBoxSize(second);
  assertEquals(290, secondSize.width);
  assertEquals(300, secondSize.height);
}

function testDragEvent() {
  splitpane.setInitialSize(200);
  splitpane.setHandleSize(10);
  splitpane.render(goog.dom.getElement('sandbox'));

  var handler = goog.testing.recordFunction();
  goog.events.listen(
      splitpane, goog.ui.SplitPane.EventType.HANDLE_DRAG, handler);
  var handle = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, 'goog-splitpane-handle')[0];

  goog.testing.events.fireMouseDownEvent(handle);
  goog.testing.events.fireMouseMoveEvent(handle);
  goog.testing.events.fireMouseUpEvent(handle);
  assertEquals('HANDLE_DRAG event expected', 1, handler.getCallCount());

  splitpane.setContinuousResize(false);
  handler.reset();
  goog.testing.events.fireMouseDownEvent(handle);
  goog.testing.events.fireMouseMoveEvent(handle);
  goog.testing.events.fireMouseUpEvent(handle);
  assertEquals('HANDLE_DRAG event not expected', 0, handler.getCallCount());
}

function testDragEndEvent() {
  splitpane.setInitialSize(200);
  splitpane.setHandleSize(10);
  splitpane.render(goog.dom.getElement('sandbox'));
  var handler = goog.testing.recordFunction();
  goog.events.listen(
      splitpane, goog.ui.SplitPane.EventType.HANDLE_DRAG_END, handler);

  var handle = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, 'goog-splitpane-handle')[0];

  goog.testing.events.fireMouseDownEvent(handle);
  goog.testing.events.fireMouseMoveEvent(handle);
  goog.testing.events.fireMouseUpEvent(handle);
  assertEquals('HANDLE_DRAG_END event expected', 1, handler.getCallCount());

  splitpane.setContinuousResize(false);
  handler.reset();
  goog.testing.events.fireMouseDownEvent(handle);
  goog.testing.events.fireMouseMoveEvent(handle);
  goog.testing.events.fireMouseUpEvent(handle);
  assertEquals('HANDLE_DRAG_END event expected', 1, handler.getCallCount());
}

function testSnapEvent() {
  splitpane.setInitialSize(200);
  splitpane.setHandleSize(10);
  splitpane.render(goog.dom.getElement('sandbox'));
  var handler = goog.testing.recordFunction();
  goog.events.listen(
      splitpane, goog.ui.SplitPane.EventType.HANDLE_SNAP, handler);
  var handle = goog.dom.getElementsByTagNameAndClass(
      goog.dom.TagName.DIV, 'goog-splitpane-handle')[0];
  goog.testing.events.fireDoubleClickSequence(handle);
  assertEquals('HANDLE_SNAP event expected', 1, handler.getCallCount());
}
