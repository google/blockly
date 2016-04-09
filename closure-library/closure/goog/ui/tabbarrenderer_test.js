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

goog.provide('goog.ui.TabBarRendererTest');
goog.setTestOnly('goog.ui.TabBarRendererTest');

goog.require('goog.a11y.aria.Role');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.ui.rendererasserts');
goog.require('goog.ui.Container');
goog.require('goog.ui.TabBar');
goog.require('goog.ui.TabBarRenderer');

var sandbox;
var renderer;
var tabBar;

function setUp() {
  sandbox = goog.dom.getElement('sandbox');
  renderer = goog.ui.TabBarRenderer.getInstance();
  tabBar = new goog.ui.TabBar();
}

function tearDown() {
  tabBar.dispose();
  goog.dom.removeChildren(sandbox);
}

function testConstructor() {
  assertNotNull('Renderer must not be null', renderer);
}

function testGetCssClass() {
  assertEquals(
      'getCssClass() must return expected value',
      goog.ui.TabBarRenderer.CSS_CLASS, renderer.getCssClass());
}

function testGetAriaRole() {
  assertEquals(
      'getAriaRole() must return expected value', goog.a11y.aria.Role.TAB_LIST,
      renderer.getAriaRole());
}

function testCreateDom() {
  var element = renderer.createDom(tabBar);
  assertNotNull('Created element must not be null', element);
  assertEquals(
      'Created element must be a DIV', goog.dom.TagName.DIV, element.tagName);
  assertSameElements(
      'Created element must have expected class names',
      ['goog-tab-bar', 'goog-tab-bar-horizontal', 'goog-tab-bar-top'],
      goog.dom.classlist.get(element));
}

function testDecorate() {
  sandbox.innerHTML = '<div id="start" class="goog-tab-bar-start"></div>';
  var element = renderer.decorate(tabBar, goog.dom.getElement('start'));
  assertNotNull('Decorated element must not be null', element);
  assertEquals(
      'Decorated element must be as expected', goog.dom.getElement('start'),
      element);
  // Due to a bug in ContainerRenderer, the "-vertical" class isn't applied.
  // TODO(attila): Fix this!
  assertSameElements(
      'Decorated element must have expected class names',
      ['goog-tab-bar', 'goog-tab-bar-start'], goog.dom.classlist.get(element));
}

function testSetStateFromClassName() {
  renderer.setStateFromClassName(
      tabBar, 'goog-tab-bar-bottom', renderer.getCssClass());
  assertEquals(
      'Location must be BOTTOM', goog.ui.TabBar.Location.BOTTOM,
      tabBar.getLocation());
  assertEquals(
      'Orientation must be HORIZONTAL',
      goog.ui.Container.Orientation.HORIZONTAL, tabBar.getOrientation());

  renderer.setStateFromClassName(
      tabBar, 'goog-tab-bar-end', renderer.getCssClass());
  assertEquals(
      'Location must be END', goog.ui.TabBar.Location.END,
      tabBar.getLocation());
  assertEquals(
      'Orientation must be VERTICAL', goog.ui.Container.Orientation.VERTICAL,
      tabBar.getOrientation());

  renderer.setStateFromClassName(
      tabBar, 'goog-tab-bar-top', renderer.getCssClass());
  assertEquals(
      'Location must be TOP', goog.ui.TabBar.Location.TOP,
      tabBar.getLocation());
  assertEquals(
      'Orientation must be HORIZONTAL',
      goog.ui.Container.Orientation.HORIZONTAL, tabBar.getOrientation());

  renderer.setStateFromClassName(
      tabBar, 'goog-tab-bar-start', renderer.getCssClass());
  assertEquals(
      'Location must be START', goog.ui.TabBar.Location.START,
      tabBar.getLocation());
  assertEquals(
      'Orientation must be VERTICAL', goog.ui.Container.Orientation.VERTICAL,
      tabBar.getOrientation());
}

function testGetClassNames() {
  assertSameElements(
      'Class names for TOP location must be as expected',
      ['goog-tab-bar', 'goog-tab-bar-horizontal', 'goog-tab-bar-top'],
      renderer.getClassNames(tabBar));

  tabBar.setLocation(goog.ui.TabBar.Location.START);
  assertSameElements(
      'Class names for START location must be as expected',
      ['goog-tab-bar', 'goog-tab-bar-vertical', 'goog-tab-bar-start'],
      renderer.getClassNames(tabBar));

  tabBar.setLocation(goog.ui.TabBar.Location.BOTTOM);
  assertSameElements(
      'Class names for BOTTOM location must be as expected',
      ['goog-tab-bar', 'goog-tab-bar-horizontal', 'goog-tab-bar-bottom'],
      renderer.getClassNames(tabBar));

  tabBar.setLocation(goog.ui.TabBar.Location.END);
  assertSameElements(
      'Class names for END location must be as expected',
      ['goog-tab-bar', 'goog-tab-bar-vertical', 'goog-tab-bar-end'],
      renderer.getClassNames(tabBar));
}

function testDoesntCallGetCssClassInConstructor() {
  goog.testing.ui.rendererasserts.assertNoGetCssClassCallsInConstructor(
      goog.ui.TabBarRenderer);
}
