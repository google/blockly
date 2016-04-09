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

goog.provide('goog.ui.ColorButtonTest');
goog.setTestOnly('goog.ui.ColorButtonTest');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.ColorButton');
goog.require('goog.ui.decorate');

var button, button2;
var buttonDiv;

function setUp() {
  buttonDiv = goog.dom.getElement('buttonDiv');
}

function tearDown() {
  goog.dom.removeChildren(buttonDiv);
  goog.dispose(button);
  goog.dispose(button2);
  button = null;
  button2 = null;
}

function testRender() {
  button = new goog.ui.ColorButton('test');
  assertNotNull('button should be valid', button);
  button.render(buttonDiv);
  assertColorButton(button.getElement());
}

function testDecorate() {
  var colorDiv = goog.dom.createDom(goog.dom.TagName.DIV, 'goog-color-button');
  goog.dom.appendChild(buttonDiv, colorDiv);
  button2 = goog.ui.decorate(colorDiv);
  assertNotNull('button should be valid', button2);
  assertColorButton(button2.getElement());
}

function assertColorButton(div) {
  assertTrue(
      'button className contains goog-color-button',
      goog.array.contains(goog.dom.classlist.get(div), 'goog-color-button'));
  var caption =
      goog.asserts.assertElement(div.firstChild.firstChild.firstChild);
  assertTrue(
      'caption className contains goog-color-button',
      goog.array.contains(
          goog.dom.classlist.get(caption), 'goog-color-button'));
}
