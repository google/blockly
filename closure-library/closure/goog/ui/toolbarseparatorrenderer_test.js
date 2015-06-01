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

goog.provide('goog.ui.ToolbarSeparatorRendererTest');
goog.setTestOnly('goog.ui.ToolbarSeparatorRendererTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');
goog.require('goog.ui.INLINE_BLOCK_CLASSNAME');
goog.require('goog.ui.ToolbarSeparator');
goog.require('goog.ui.ToolbarSeparatorRenderer');

var parent;
var renderer;
var separator;

function setUp() {
  parent = goog.dom.getElement('parent');
  renderer = goog.ui.ToolbarSeparatorRenderer.getInstance();
  separator = new goog.ui.ToolbarSeparator(renderer);
}

function tearDown() {
  separator.dispose();
  goog.dom.removeChildren(parent);
}

function testConstructor() {
  assertNotNull('Renderer must not be null', renderer);
}

function testGetCssClass() {
  assertEquals('getCssClass() must return expected value',
      goog.ui.ToolbarSeparatorRenderer.CSS_CLASS, renderer.getCssClass());
}

function testCreateDom() {
  var element = renderer.createDom(separator);
  assertNotNull('Created element must not be null', element);
  assertEquals('Created element must be a DIV',
      goog.dom.TagName.DIV, element.tagName);
  assertSameElements('Created element must have expected class names',
      [goog.ui.ToolbarSeparatorRenderer.CSS_CLASS,
       // Separators are always in a disabled state.
       renderer.getClassForState(goog.ui.Component.State.DISABLED),
       goog.ui.INLINE_BLOCK_CLASSNAME],
      goog.dom.classlist.get(element));
}

function testCreateDomWithExtraCssClass() {
  separator.addClassName('another-class');
  var element = renderer.createDom(separator);
  assertContains('Created element must contain extra CSS classes',
                 'another-class', goog.dom.classlist.get(element));
}
