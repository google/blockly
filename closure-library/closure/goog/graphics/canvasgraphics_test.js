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

goog.provide('goog.graphics.CanvasGraphicsTest');
goog.setTestOnly('goog.graphics.CanvasGraphicsTest');

goog.require('goog.dom');
goog.require('goog.graphics.CanvasGraphics');
goog.require('goog.graphics.SolidFill');
goog.require('goog.graphics.Stroke');
goog.require('goog.testing.jsunit');


var graphics;

function shouldRunTests() {
  graphics = new goog.graphics.CanvasGraphics(100, 100);
  graphics.createDom();
  return graphics.canvas_.getContext;
}

function setUp() {
  graphics = new goog.graphics.CanvasGraphics(100, 100);
  graphics.createDom();
  goog.dom.getElement('root').appendChild(graphics.getElement());
  graphics.enterDocument();
}

function tearDown() {
  graphics.dispose();
  goog.dom.removeNode(graphics.getElement());
}

function testDrawRemoveRect() {
  var fill = new goog.graphics.SolidFill('red');
  var stroke = new goog.graphics.Stroke('blue');
  var element = graphics.drawRect(10, 10, 80, 80, stroke, fill);
  assertEquals(1, graphics.canvasElement.children_.length);
  graphics.removeElement(element);
  assertEquals(0, graphics.canvasElement.children_.length);
}

function testDrawRemoveNestedRect() {
  var fill = new goog.graphics.SolidFill('red');
  var stroke = new goog.graphics.Stroke('blue');
  var group = graphics.createGroup();
  assertEquals(1, graphics.canvasElement.children_.length);
  assertEquals(0, graphics.canvasElement.children_[0].children_.length);
  var element = graphics.drawRect(10, 10, 80, 80, stroke, fill, group);
  assertEquals(1, graphics.canvasElement.children_.length);
  assertEquals(1, graphics.canvasElement.children_[0].children_.length);
  graphics.removeElement(element);
  assertEquals(1, graphics.canvasElement.children_.length);
  assertEquals(0, graphics.canvasElement.children_[0].children_.length);
}
