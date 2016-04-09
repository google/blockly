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

goog.provide('goog.ui.ToolbarColorMenuButtonRendererTest');
goog.setTestOnly('goog.ui.ToolbarColorMenuButtonRendererTest');

goog.require('goog.dom');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.ui.RendererHarness');
goog.require('goog.testing.ui.rendererasserts');
goog.require('goog.ui.ToolbarColorMenuButton');
goog.require('goog.ui.ToolbarColorMenuButtonRenderer');

var harness;

function setUp() {
  harness = new goog.testing.ui.RendererHarness(
      goog.ui.ToolbarColorMenuButtonRenderer.getInstance(),
      goog.dom.getElement('parent'), goog.dom.getElement('decoratedButton'));
}

function tearDown() {
  harness.dispose();
}

function testEquality() {
  harness.attachControlAndRender(new goog.ui.ToolbarColorMenuButton('Foo'));
  harness.attachControlAndDecorate(new goog.ui.ToolbarColorMenuButton());
  harness.assertDomMatches();
}

function testDoesntCallGetCssClassInConstructor() {
  goog.testing.ui.rendererasserts.assertNoGetCssClassCallsInConstructor(
      goog.ui.ToolbarColorMenuButtonRenderer);
}
