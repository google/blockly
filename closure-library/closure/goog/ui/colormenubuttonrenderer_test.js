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

goog.provide('goog.ui.ColorMenuButtonTest');
goog.setTestOnly('goog.ui.ColorMenuButtonTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.ui.RendererHarness');
goog.require('goog.testing.ui.rendererasserts');
goog.require('goog.ui.ColorMenuButton');
goog.require('goog.ui.ColorMenuButtonRenderer');
goog.require('goog.userAgent');

var harness;

function setUp() {
  harness = new goog.testing.ui.RendererHarness(
      goog.ui.ColorMenuButtonRenderer.getInstance(),
      goog.dom.getElement('parent'), goog.dom.getElement('decoratedButton'));
}

function tearDown() {
  harness.dispose();
}

function testEquality() {
  harness.attachControlAndRender(new goog.ui.ColorMenuButton('Foo'));
  harness.attachControlAndDecorate(new goog.ui.ColorMenuButton());
  harness.assertDomMatches();
}

function testWrapCaption() {
  var caption = goog.dom.createDom(goog.dom.TagName.DIV, null, 'Foo');
  var wrappedCaption = goog.ui.ColorMenuButtonRenderer.wrapCaption(
      caption, goog.dom.getDomHelper());
  assertNotEquals('Caption should have been wrapped', caption, wrappedCaption);
  assertEquals(
      'Wrapped caption should have indicator css class',
      'goog-color-menu-button-indicator', wrappedCaption.className);
}

function testSetCaptionValue() {
  var caption = goog.dom.createDom(goog.dom.TagName.DIV, null, 'Foo');
  var wrappedCaption = goog.ui.ColorMenuButtonRenderer.wrapCaption(
      caption, goog.dom.getDomHelper());
  goog.ui.ColorMenuButtonRenderer.setCaptionValue(wrappedCaption, 'red');

  var expectedColor =
      goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(9) ?
      '#ff0000' :
      'rgb(255, 0, 0)';
  assertEquals(expectedColor, caption.style.borderBottomColor);
}

function testDoesntCallGetCssClassInConstructor() {
  goog.testing.ui.rendererasserts.assertNoGetCssClassCallsInConstructor(
      goog.ui.ColorMenuButtonRenderer);
}
