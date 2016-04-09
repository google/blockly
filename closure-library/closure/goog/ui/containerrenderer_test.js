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

goog.provide('goog.ui.ContainerRendererTest');
goog.setTestOnly('goog.ui.ContainerRendererTest');

goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.style');
goog.require('goog.testing.ExpectedFailures');
goog.require('goog.testing.PropertyReplacer');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.ui.rendererasserts');
goog.require('goog.ui.Container');
goog.require('goog.ui.ContainerRenderer');
goog.require('goog.userAgent');

var renderer;
var expectedFailures;
var stubs = new goog.testing.PropertyReplacer();

function setUpPage() {
  expectedFailures = new goog.testing.ExpectedFailures();
}

function setUp() {
  var sandbox = goog.dom.getElement('sandbox');

  sandbox.appendChild(
      goog.dom.createDom(goog.dom.TagName.SPAN, {id: 'noTabIndex'}, 'Test'));
  sandbox.appendChild(
      goog.dom.createDom(
          goog.dom.TagName.DIV,
          {id: 'container', 'class': 'goog-container-horizontal'},
          goog.dom.createDom(
              goog.dom.TagName.DIV, {id: 'control', 'class': 'goog-control'},
              'Hello, world!')));

  renderer = goog.ui.ContainerRenderer.getInstance();
}

function tearDown() {
  goog.dom.removeChildren(goog.dom.getElement('sandbox'));
  stubs.reset();
  expectedFailures.handleTearDown();
}

function testGetInstance() {
  assertTrue(
      'getInstance() must return a ContainerRenderer',
      renderer instanceof goog.ui.ContainerRenderer);
  assertEquals(
      'getInstance() must return the same object each time', renderer,
      goog.ui.ContainerRenderer.getInstance());
}

function testGetCustomRenderer() {
  var cssClass = 'special-css-class';
  var containerRenderer = goog.ui.ContainerRenderer.getCustomRenderer(
      goog.ui.ContainerRenderer, cssClass);
  assertEquals(
      'Renderer should have returned the custom CSS class.', cssClass,
      containerRenderer.getCssClass());
}

function testGetAriaRole() {
  assertUndefined('ARIA role must be undefined', renderer.getAriaRole());
}

function testEnableTabIndex() {
  var container = goog.dom.getElement('container');
  assertFalse(
      'Container must not have any tab index',
      goog.dom.isFocusableTabIndex(container));

  // WebKit on Mac doesn't support tabIndex for arbitrary DOM elements
  // until version 527 or later.
  expectedFailures.expectFailureFor(
      goog.userAgent.WEBKIT && goog.userAgent.MAC &&
      !goog.userAgent.isVersionOrHigher('527'));
  try {
    renderer.enableTabIndex(container, true);
    assertTrue(
        'Container must have a tab index',
        goog.dom.isFocusableTabIndex(container));
    assertEquals('Container\'s tab index must be 0', 0, container.tabIndex);

    renderer.enableTabIndex(container, false);
    assertFalse(
        'Container must not have a tab index',
        goog.dom.isFocusableTabIndex(container));
    assertEquals('Container\'s tab index must be -1', -1, container.tabIndex);
  } catch (e) {
    expectedFailures.handleException(e);
  }
}

function testCreateDom() {
  var horizontal =
      new goog.ui.Container(goog.ui.Container.Orientation.HORIZONTAL);
  var element1 = renderer.createDom(horizontal);
  assertEquals('Element must be a DIV', 'DIV', element1.tagName);
  assertEquals(
      'Element must have the expected class name',
      'goog-container goog-container-horizontal', element1.className);

  var vertical = new goog.ui.Container(goog.ui.Container.Orientation.VERTICAL);
  var element2 = renderer.createDom(vertical);
  assertEquals('Element must be a DIV', 'DIV', element2.tagName);
  assertEquals(
      'Element must have the expected class name',
      'goog-container goog-container-vertical', element2.className);
}

function testGetContentElement() {
  assertNull(
      'getContentElement() must return null if element is null',
      renderer.getContentElement(null));
  var element = goog.dom.getElement('container');
  assertEquals(
      'getContentElement() must return its argument', element,
      renderer.getContentElement(element));
}

function testCanDecorate() {
  assertFalse(
      'canDecorate() must return false for a SPAN',
      renderer.canDecorate(goog.dom.getElement('noTabIndex')));
  assertTrue(
      'canDecorate() must return true for a DIV',
      renderer.canDecorate(goog.dom.getElement('container')));
}

function testDecorate() {
  var container = new goog.ui.Container();
  var element = goog.dom.getElement('container');

  assertFalse(
      'Container must not be in the document', container.isInDocument());
  container.decorate(element);
  assertTrue('Container must be in the document', container.isInDocument());

  assertEquals(
      'Container\'s ID must match the decorated element\'s ID', element.id,
      container.getId());
  assertEquals(
      'Element must have the expected class name',
      'goog-container-horizontal goog-container', element.className);
  assertEquals('Container must have one child', 1, container.getChildCount());
  assertEquals(
      'Child component\'s ID must be as expected', 'control',
      container.getChildAt(0).getId());

  assertThrows('Redecorating must throw error', function() {
    container.decorate(element);
  });
}

function testDecorateWithCustomContainerElement() {
  var element = goog.dom.getElement('container');
  var alternateContainerElement = goog.dom.createElement(goog.dom.TagName.DIV);
  element.appendChild(alternateContainerElement);

  var container = new goog.ui.Container();
  stubs.set(renderer, 'getContentElement', function() {
    return alternateContainerElement;
  });

  assertFalse(
      'Container must not be in the document', container.isInDocument());
  container.decorate(element);
  assertTrue('Container must be in the document', container.isInDocument());

  assertEquals(
      'Container\'s ID must match the decorated element\'s ID', element.id,
      container.getId());
  assertEquals(
      'Element must have the expected class name',
      'goog-container-horizontal goog-container', element.className);
  assertEquals('Container must have 0 children', 0, container.getChildCount());

  assertThrows('Redecorating must throw error', function() {
    container.decorate(element);
  });
}

function testSetStateFromClassName() {
  var container = new goog.ui.Container();

  assertEquals(
      'Container must be vertical', goog.ui.Container.Orientation.VERTICAL,
      container.getOrientation());
  renderer.setStateFromClassName(
      container, 'goog-container-horizontal', 'goog-container');
  assertEquals(
      'Container must be horizontal', goog.ui.Container.Orientation.HORIZONTAL,
      container.getOrientation());
  renderer.setStateFromClassName(
      container, 'goog-container-vertical', 'goog-container');
  assertEquals(
      'Container must be vertical', goog.ui.Container.Orientation.VERTICAL,
      container.getOrientation());

  assertTrue('Container must be enabled', container.isEnabled());
  renderer.setStateFromClassName(
      container, 'goog-container-disabled', 'goog-container');
  assertFalse('Container must be disabled', container.isEnabled());
}

function testInitializeDom() {
  var container = new goog.ui.Container();
  var element = goog.dom.getElement('container');
  container.decorate(element);

  assertTrue(
      'Container\'s root element must be unselectable',
      goog.style.isUnselectable(container.getElement()));

  assertEquals(
      'On IE, container\'s root element must have hideFocus=true',
      goog.userAgent.IE, !!container.getElement().hideFocus);
}

function testDoesntCallGetCssClassInConstructor() {
  goog.testing.ui.rendererasserts.assertNoGetCssClassCallsInConstructor(
      goog.ui.ContainerRenderer);
}
