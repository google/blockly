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

goog.provide('goog.ui.TabRendererTest');
goog.setTestOnly('goog.ui.TabRendererTest');

goog.require('goog.a11y.aria.Role');
goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.testing.dom');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.ui.rendererasserts');
goog.require('goog.ui.Tab');
goog.require('goog.ui.TabRenderer');

var sandbox;
var renderer;
var tab;

function setUp() {
  sandbox = goog.dom.getElement('sandbox');
  renderer = goog.ui.TabRenderer.getInstance();
  tab = new goog.ui.Tab('Hello');
}

function tearDown() {
  tab.dispose();
  goog.dom.removeChildren(sandbox);
}

function testConstructor() {
  assertNotNull('Renderer must not be null', renderer);
}

function testGetCssClass() {
  assertEquals(
      'CSS class must have expected value', goog.ui.TabRenderer.CSS_CLASS,
      renderer.getCssClass());
}

function testGetAriaRole() {
  assertEquals(
      'ARIA role must have expected value', goog.a11y.aria.Role.TAB,
      renderer.getAriaRole());
}

function testCreateDom() {
  var element = renderer.createDom(tab);
  assertNotNull('Element must not be null', element);
  goog.testing.dom.assertHtmlMatches(
      '<div class="goog-tab">Hello</div>', goog.dom.getOuterHtml(element));
}

function testCreateDomWithTooltip() {
  tab.setTooltip('Hello, world!');
  var element = renderer.createDom(tab);
  assertNotNull('Element must not be null', element);
  assertEquals(
      'Element must have expected tooltip', 'Hello, world!',
      renderer.getTooltip(element));
}

function testRender() {
  tab.setRenderer(renderer);
  tab.render();
  var element = tab.getElementStrict();
  assertNotNull('Element must not be null', element);
  assertEquals(
      'aria-selected should be false', 'false',
      element.getAttribute('aria-selected'));
}

function testDecorate() {
  sandbox.innerHTML = '<div id="foo">Foo</div>\n' +
      '<div id="bar" title="Yes">Bar</div>';

  var foo = renderer.decorate(tab, goog.dom.getElement('foo'));
  assertNotNull('Decorated element must not be null', foo);
  assertSameElements(
      'Decorated element must have expected class', ['goog-tab'],
      goog.dom.classlist.get(foo));
  assertEquals(
      'Decorated tab must have expected content', 'Foo',
      tab.getContent().nodeValue);
  assertUndefined('Decorated tab must not have tooltip', tab.getTooltip());
  assertEquals(
      'Decorated element must not have title', '', renderer.getTooltip(foo));

  var bar = renderer.decorate(tab, goog.dom.getElement('bar'));
  assertNotNull('Decorated element must not be null', bar);
  assertSameElements(
      'Decorated element must have expected class', ['goog-tab'],
      goog.dom.classlist.get(bar));
  assertEquals(
      'Decorated tab must have expected content', 'Bar',
      tab.getContent().nodeValue);
  assertEquals(
      'Decorated tab must have expected tooltip', 'Yes', tab.getTooltip());
  assertEquals(
      'Decorated element must have expected title', 'Yes',
      renderer.getTooltip(bar));
}

function testGetTooltip() {
  sandbox.innerHTML = '<div id="foo">Foo</div>\n' +
      '<div id="bar" title="">Bar</div>\n' +
      '<div id="baz" title="BazTitle">Baz</div>';
  assertEquals(
      'getTooltip() must return empty string for no title', '',
      renderer.getTooltip(goog.dom.getElement('foo')));
  assertEquals(
      'getTooltip() must return empty string for empty title', '',
      renderer.getTooltip(goog.dom.getElement('bar')));
  assertEquals(
      'Tooltip must have expected value', 'BazTitle',
      renderer.getTooltip(goog.dom.getElement('baz')));
}

function testSetTooltip() {
  sandbox.innerHTML = '<div id="foo">Foo</div>';
  var element = goog.dom.getElement('foo');

  renderer.setTooltip(null, null);  // Must not error.

  renderer.setTooltip(element, null);
  assertEquals('Tooltip must be the empty string', '', element.title);

  renderer.setTooltip(element, '');
  assertEquals('Tooltip must be the empty string', '', element.title);

  renderer.setTooltip(element, 'Foo');
  assertEquals('Tooltip must have expected value', 'Foo', element.title);
}

function testDoesntCallGetCssClassInConstructor() {
  goog.testing.ui.rendererasserts.assertNoGetCssClassCallsInConstructor(
      goog.ui.TabRenderer);
}
